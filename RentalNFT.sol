// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RentalNFT is ERC721, Ownable {
    struct RentalAgreement {
        address landlord;
        address tenant;
        uint256 rentAmount;
        uint256 lastPaidDate;
        uint256 nftId;
        bool tenantAccepted;
        bool warningSent;
    }

    uint256 public constant PAYMENT_GRACE_PERIOD = 60 days; // 2 months
    uint256 public constant WARNING_THRESHOLD = 30 days; // 1 month
    uint256 public nextTokenId = 1; // specify id of the NFT to be created (Bunu bu arada istedigimiz degerden baslatabiliriz herhangi bir sorun yok)
    uint256 public rentalAgrementId = 1; // it starts from 1 and Incremented  when new agrement is created.

    mapping(uint256 => RentalAgreement) public rentalAgreements;
    mapping(address => uint256) public tenantToNFT; // it shows that tenant and tenansts NFT ID
    
    mapping(address => bool) public  landlord;
     

    
    // first landloard needs to be added to this dictionary to create rental agrement 
    function addLandLord(address newLandLord) public  {
        landlord[newLandLord] = true;
    }

    // remove fonksiyonuda eklenebilir 
    

    event RentalAgreementCreated(
        uint256 indexed nftId,
        address indexed landlord,
        address indexed tenant,
        uint256 rentAmount
    );
    event RentalAgreementAccepted(
        uint256 indexed nftId,
        address indexed tenant
    );
    event RentPaid(uint256 indexed nftId, address indexed tenant, uint256 amount);
    event WarningSent(uint256 indexed nftId, address indexed landlord, address indexed tenant);

    event UsageRightsRevoked(uint256 indexed nftId, address indexed landlord);

    constructor() ERC721("RentalNFT", "RENT") Ownable(msg.sender) {}

    // burada onlyLandlord gibi bir modifier ekleyebiliriz bu sayede sadece landlordlar sozlesme create edebilir 
    // bunun icinde belki landlord arrayi gibi bir sey olusturabiliriz 
    // burada ownable olmayacak buyuk ihtimalle (ev sahipleri cagirabilecek sadece)
    function createRentalAgreement(address tenant, uint256 rentAmount) external {
        require(landlord[msg.sender] == true , "Only landloard create rental agrement." );
        require(tenant != address(0), "Invalid tenant address");
        require(rentAmount > 0, "Rent amount must be greater than zero");

        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(msg.sender, tokenId); // creating nft and sending to msg.sender 

        rentalAgreements[rentalAgrementId] = RentalAgreement({
            landlord: msg.sender,
            tenant: tenant,
            rentAmount: rentAmount,
            lastPaidDate: 0,
            nftId: tokenId,
            tenantAccepted: false,
            warningSent: false
        });
        // rental agrement id 1 artarak gidiyor ..
        rentalAgrementId++;
        approve(tenant,tokenId);  // kiraci yetki veriyoruz ... 

        emit RentalAgreementCreated(rentalAgrementId, msg.sender, tenant, rentAmount);
    }


    function refuseRentalAgreement(uint256 _rentalAgrementId) external {

        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        require(agreement.tenant == msg.sender, "Caller is not the tenant");
        require(!agreement.tenantAccepted, "Agreement already accepted");
        delete rentalAgreements[rentalAgrementId];
        rentalAgrementId--;
        
    }

    function acceptRentalAgreement(uint256 _rentalAgrementId) external {
        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        require(agreement.tenant == msg.sender, "Caller is not the tenant");
        require(!agreement.tenantAccepted, "Agreement already accepted");

        agreement.tenantAccepted = true;
        // burada kiraci ilk kirasini kira sozlesmesini ilk kontrol ettiginde odemis olarak varsayiyoruz. 
        agreement.lastPaidDate = block.timestamp ;

        uint256 tokenId = agreement.nftId; // getting tokenID 
        // sending nft to tenant after this function tenant has nft 
        safeTransferFrom(agreement.landlord, agreement.tenant, tokenId);

        tenantToNFT[msg.sender] = tokenId; // adding to maps tenant and its tokenId 

        emit RentalAgreementAccepted(tokenId, msg.sender);
    }

    // buraya sadece onlyTenants diye bir tane modifier ekleyebiliriz ve bu sayade sadece kiracilar bu fonksiyonu cagirabilir 
    function payRent() external payable {
        uint256 tokenId = tenantToNFT[msg.sender];
        require(tokenId != 0, "No rental agreement found for this tenant");
        RentalAgreement storage agreement = rentalAgreements[tokenId];
        require(agreement.tenantAccepted, "Agreement not yet accepted by the tenant");
        require(msg.value == agreement.rentAmount, "Incorrect rent amount");
        require(agreement.tenant == msg.sender, "Caller is not the tenant");
        // kiraci 1 ay dolmadan kirasini odeyemez 
        // require(block.timestamp >= agreement.lastPaidDate + WARNING_THRESHOLD,"You are not in the payment range..");
        agreement.lastPaidDate = block.timestamp;

        payable(agreement.landlord).transfer(msg.value); // sending money to landlord 

        agreement.warningSent = false; // Reset warning if rent is paid

        emit RentPaid(tokenId, msg.sender, msg.value);
    }

    // bu fonksiyonuda sadece ev sahipleri cagirabilir ona gore modifiye etmek lazim 

    function sendWarning(uint256 _rentalAgrementId) external {
        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        require(msg.sender == agreement.landlord, "Only the landlord can send warnings");
        require(agreement.tenantAccepted, "Agreement not yet accepted by the tenant");
        require(block.timestamp > agreement.lastPaidDate + WARNING_THRESHOLD, "Warning threshold not reached");
        require(!agreement.warningSent, "Warning already sent");

        agreement.warningSent = true;
        uint256 tokenId = agreement.nftId; // getting tokenID 
        emit WarningSent(tokenId, msg.sender, agreement.tenant); // sending message 
    }

    function revokeUsageRights(uint256 _rentalAgrementId) external {
        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        require(msg.sender == agreement.landlord, "Only the landlord can revoke rights");
        require(block.timestamp > agreement.lastPaidDate + PAYMENT_GRACE_PERIOD, "Grace period has not expired");

        address tenant = agreement.tenant;
        uint256 tokenId = agreement.nftId;
        safeTransferFrom(tenant, agreement.landlord, tokenId);

        delete tenantToNFT[tenant];
        agreement.tenant = address(0);

        emit UsageRightsRevoked(tokenId, msg.sender);
    }

    function getRentalAgreement(uint256 _rentalAgrementId) external view returns (RentalAgreement memory) {
        return rentalAgreements[_rentalAgrementId];
    }

    function getRentalAgreementLandLord(uint256 _rentalAgrementId) view  external  returns (address) {
        return rentalAgreements[_rentalAgrementId].landlord;
    }
    function getRentalAgreementTenant(uint256 _rentalAgrementId) external view returns (address) {
        return rentalAgreements[_rentalAgrementId].tenant;
    }

    // bu fonksiyon varmis zaten "ownerOf diye :)"
    function getOwnerOfToken(uint256 tokenId) public view returns(address){
        return ownerOf(tokenId);
    }
    
}
