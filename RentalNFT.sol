// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ERC20 Token for Rent Payments
contract RentalToken is ERC20{

    address public owner;
    address public dest; 
    uint256 public amount;

    constructor() ERC20("RentalToken", "RENT") {
        owner = msg.sender;
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Initial supply minted to contract deployer
        

    }

    function transferErc20(address _dest , uint256 _amount) public {
        dest = _dest;
        amount = _amount;
        transferFrom(owner, dest, amount);
    }

    function showbalance(address _dest) public view returns(uint){
        return balanceOf(_dest);
    }

}


contract RentalNFT is ERC721, Ownable {
    struct RentalAgreement {
        uint256 rentalAgrementId;
        address landlord;
        address tenant;
        uint256 rentAmount;
        uint256 lastPaidDate;
        uint256 nftId;
        bool tenantAccepted;
        bool warningSent;
        //uint ihtarsayisi; // ihtar sayisi 2 oldugunda ev sahibi kiraciya tahliye etme yetkisi verecek 
    }

    address public tenant2;
    uint public amount2;
    
    RentalToken public rentaltoken;
    
    constructor(address _rentaltokenaddress) ERC721("RentalNFT", "RENTNFT") Ownable(msg.sender) {

       rentaltoken = RentalToken(_rentaltokenaddress);
    }



    uint256 public constant PAYMENT_GRACE_PERIOD = 60 days; // 2 months
    uint256 public constant WARNING_THRESHOLD = 30 days; // 1 month
    uint256 public nextTokenId = 1; // specify id of the NFT to be created (Bunu bu arada istedigimiz degerden baslatabiliriz herhangi bir sorun yok)
    uint256 public rentalAgrementId = 1; // it starts from 1 and Incremented  when new agrement is created.

    mapping(uint256 => RentalAgreement) public rentalAgreements;
    mapping(address => uint256) public tenantToNFT; // it shows that tenant and tenansts NFT ID
    
    mapping(address => bool) public  landlord;
     
    
    
    function showbalanceof(address dest) public view returns(uint){
        return rentaltoken.showbalance(dest);
    }

    function transferToTenant(address tenant , uint amount) public {
        tenant2 = tenant;
        amount2 = amount;
        rentaltoken.transferErc20(tenant, amount);
    }

    function approveTenant(address tenant , uint amount) public {
        rentaltoken.approve(tenant, amount);
    }


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

    

    // burada onlyLandlord gibi bir modifier ekleyebiliriz bu sayede sadece landlordlar sozlesme create edebilir 
    // bunun icinde belki landlord arrayi gibi bir sey olusturabiliriz 
    // burada ownable olmayacak buyuk ihtimalle (ev sahipleri cagirabilecek sadece)
    function createRentalAgreement(address tenant, uint256 rentAmount) external {
        require(landlord[msg.sender] == true , "Only landloard create rental agrement." );
        require(tenant != address(0), "Invalid tenant address");
        require(rentAmount > 0, "Rent amount must be greater than zero");

        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(msg.sender, tokenId);// creating nft and sending to msg.sender 

        rentalAgreements[rentalAgrementId] = RentalAgreement({
            rentalAgrementId: rentalAgrementId,
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
         // boyle bir idde kontrat var mi ona bak 
        require(agreement.rentalAgrementId == _rentalAgrementId , "There is no rental agreement with this ID..");
        require(agreement.tenant == msg.sender, "Caller is not the tenant");
        require(!agreement.tenantAccepted, "Agreement already accepted");
        delete rentalAgreements[rentalAgrementId];
        rentalAgrementId--;
        
    }

    function acceptRentalAgreement(uint256 _rentalAgrementId) external payable{
        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        // bu kontrol sayesinde kiraci diger kontratlara erisemiyor ve boyle bir sozlesmenin olup olmadigi kontrol ediliyor.
        require(agreement.rentalAgrementId == _rentalAgrementId , "There is no rental agreement with this ID..");
        // $require(agreement.tenant != address(0), "Agreement does not exist");
        require(agreement.tenant == msg.sender, "Caller is not the tenant");
        require(!agreement.tenantAccepted, "Agreement already accepted");

        agreement.tenantAccepted = true;
        // burada kiraci ilk kirasini kira sozlesmesini ilk kontrol ettiginde odemis olarak varsayiyoruz. ? 
        agreement.lastPaidDate = block.timestamp ;

        uint256 tokenId = agreement.nftId; // getting tokenID 
        // sending nft to tenant after this function tenant has nft 
        safeTransferFrom(agreement.landlord, agreement.tenant, tokenId);
        
        ERC20(rentaltoken).approve(msg.sender,  agreement.rentAmount * 12); // kiraciya yetki veriyoruz 
        rentaltoken.transferErc20(msg.sender, agreement.rentAmount * 12); // kiracinin hesabina transfer ediyoruz 

        tenantToNFT[msg.sender] = tokenId; // adding to maps tenant and its tokenId 

        emit RentalAgreementAccepted(tokenId, msg.sender);
        // 
    }

    // buraya sadece onlyTenants diye bir tane modifier ekleyebiliriz ve bu sayade sadece kiracilar bu fonksiyonu cagirabilir 
    function payRent() external payable {
        uint256 tokenId = tenantToNFT[msg.sender]; // buraya bak ()
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

    function getRentalAgreementId(uint256 _rentalAgrementId) external view returns (uint256) {
        return rentalAgreements[_rentalAgrementId].rentalAgrementId;
    }

    // bu fonksiyon varmis zaten "ownerOf diye :)"
    function getOwnerOfToken(uint256 tokenId) public view returns(address){
        return ownerOf(tokenId);
    }


    



    
    
}
