// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract RentalNFT is ERC721, Ownable {
    // rental agrement struct which holds all needed variables  
    struct RentalAgreement {
        uint256 rentalAgrementId;
        address landlord;
        address tenant;
        uint256 rentAmount;
        uint256 lastPaidDate;
        uint256 nftId;
        bool tenantAccepted;
        bool warningSent;
        uint256 warningcount; // ihtar sayisi 2 oldugunda ev sahibi kiraciya tahliye etme yetkisi verecek 
        bool isTenantNotified;
    }

    // creating NFT in constructor which specifies the name and symbol 
    constructor() ERC721("RentalNFT", "RENTNFT") Ownable(msg.sender) {

    }

    // bunlari sure  saniye olarak ayarlayacagiz 
    uint256 public constant PAYMENT_GRACE_PERIOD = 60 days; // 2 months
    uint256 public constant WARNING_THRESHOLD = 30 days; // 1 month
    uint256 public nextTokenId = 1; // specify id of the NFT to be created (Bunu bu arada istedigimiz degerden baslatabiliriz herhangi bir sorun yok)
    uint256 public rentalAgrementId = 1; // it starts from 1 and Incremented  when new agrement is created.

    mapping(uint256 => RentalAgreement) public rentalAgreements;
    mapping(address => uint256) public tenantToAgreementId; // it shows that tenant and tenansts NFT ID
    mapping(address => bool) public  landlords; // holds the landlords 
    mapping(address => bool) public  tenants; // holds the landlords 

  
     
    // first landloard needs to be added to this dictionary to create rental agrement 
    // landlord butonuna bastiginda bu fonksiyon tetiklenir  
    function addLandLord() public  {
        landlords[msg.sender] = true;
    }

    // tenant butonuna tikladiginda tetiklenir ve tenant mape eklenir 
    function addTenant() public {
        tenants[msg.sender] = true;
    }
    
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

    
    modifier onlyLandLord() {
        require(landlords[msg.sender] == true , "Only landloard call this function." );
        _;
    }

    modifier onlyTenant(){
        require(tenants[msg.sender] == true , "Only tenant call this function." );
        _;
    }

    // BU MODIFIER => refuseRentalAgreement , acceptRentalAgreement uygulanabilir 
    modifier invalidRentalAgreementId(uint256 _rentalAgreementId) {
        RentalAgreement storage agreement = rentalAgreements[_rentalAgreementId];
        require(agreement.rentalAgrementId != 0 , "There is no rental agreement with this ID..");
        _;
    }

    // landlord creates rental agreement 
    function createRentalAgreement(address tenant, uint256 rentAmount) external onlyLandLord{
        
        require(tenant != address(0), "Invalid tenant address");
        require(rentAmount > 0, "Rent amount must be greater than zero");

        uint256 tokenId = nextTokenId; // getting NFT id 
        nextTokenId++; // incrementing NFT id after  NFT is created 

        _safeMint(msg.sender, tokenId);// creating NFT and sending to msg.sender which is landlord 


        // arranging rental agrement id 
        rentalAgreements[rentalAgrementId] = RentalAgreement({
            rentalAgrementId: rentalAgrementId,
            landlord: msg.sender,
            tenant: tenant,
            rentAmount: rentAmount,
            lastPaidDate: 0,
            nftId: tokenId,
            tenantAccepted: false,
            warningSent: false,
            warningcount:0,
            isTenantNotified:false
        });

        // rental agrement id is incremented by 1 after each rental agrement established 
        rentalAgrementId++;
        // notify oldugunda triggerlancak 
       
        emit RentalAgreementCreated(rentalAgrementId, msg.sender, tenant, rentAmount);
        
    }

    // tenantı notify etsin ev sahibi
    function notifyTenant(uint256 _rentalAgrementId) external onlyLandLord { 
       // bu tenantın oldugu agreementa git önce
       RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId]; 
       require(agreement.rentalAgrementId != 0 , "There is no rental agreement with this ID..");
       require(agreement.landlord == msg.sender, "You are not landlord in this rental agreement.");
       agreement.isTenantNotified = true;
        // authorizing tenant to transfer NFT own address 
    }
    // buraya onlyTenant eklenecek 
    function refuseRentalAgreement(uint256 _rentalAgrementId) external onlyTenant {

        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        // boyle bir rental agrement daha once olusmamis 
        // test et 
        require(agreement.rentalAgrementId != 0 , "There is no rental agreement with this ID..");

        // rental agrement var ama tenant yanlis rentalagreement id giriyor 
        require(agreement.tenant == msg.sender, "You are not tenant in this rental agreement..");
        require(!agreement.tenantAccepted, "Agreement already accepted");
        delete rentalAgreements[rentalAgrementId];
        rentalAgrementId--;
        
    }

    // onlyTenant eklenecek msg.sender = rentalagrement id 
    function acceptRentalAgreement(uint256 _rentalAgrementId) external payable onlyTenant{
        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        // boyle bir rentalagreementid ile sozlesmenin olup olmadigi kontrol ediliyor.
        require(agreement.rentalAgrementId != 0 , "There is no rental agreement with this ID..");
        
        // valid bir _rentalAgrementId fakat burada yetkili kiraci degil 
        require(agreement.tenant == msg.sender, "You are not tenant in this agrement!");
        require(!agreement.tenantAccepted, "Agreement already accepted");

        agreement.tenantAccepted = true;
        // burada kiraci ilk kirasini kira sozlesmesini ilk kontrol ettiginde odemis olarak varsayiyoruz. ? 
        agreement.lastPaidDate = block.timestamp ;

        uint256 tokenId = agreement.nftId; // getting tokenID 
        // sending nft to tenant after this function tenant has nft 

        approve(agreement.tenant,tokenId,agreement.landlord);
        safeTransferFrom(agreement.landlord, agreement.tenant, tokenId);
        tenantToAgreementId[msg.sender] = _rentalAgrementId; // adding to maps tenant and its rentalagrementId 
        emit RentalAgreementAccepted(tokenId, msg.sender);
        
    }

   
    function payRent() public payable onlyTenant {
        // tenantToRentalAgreementId 
        uint256 _rentalAgreementId = tenantToAgreementId[msg.sender]; 
        require(_rentalAgreementId != 0, "No rental agreement found for this tenant");
        RentalAgreement storage agreement = rentalAgreements[_rentalAgreementId];
        require(agreement.tenant == msg.sender, "You are not tenant in this agrement!");
        require(agreement.tenantAccepted, "Agreement not yet accepted by the tenant");
        require(msg.value == agreement.rentAmount, "Incorrect rent amount!");
        

        // tenant can not pay rent before 1 month passed. 
        //require(block.timestamp >= agreement.lastPaidDate + WARNING_THRESHOLD,"You are not in the payment range..");
        agreement.lastPaidDate = block.timestamp;

         // paying rent to landlord
        address payable _landlord = payable(agreement.landlord);
        require(_landlord != address(0), "Invalid landlord address");
        _landlord.transfer(msg.value);
        // payable(agreement.landlord).transfer(msg.value); // sending money to landlord 

        agreement.warningSent = false; // Reset warning if rent is paid

        emit RentPaid(_rentalAgreementId, msg.sender, msg.value);
    }

    // bu fonksiyonuda sadece ev sahipleri cagirabilir ona gore modifiye etmek lazim 
    function sendWarning(uint256 _rentalAgrementId) external onlyLandLord {
        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        // buraya ev sahibi yanlis id girebilir bu durumuda dusunmek lazim . 
        require(agreement.rentalAgrementId != 0 , "There is no rental agreement with this ID..");
        require(msg.sender == agreement.landlord, "You are not landlord in this rental agreement.");
        require(agreement.tenantAccepted, "Agreement not yet accepted by the tenant");
        // bu kisimda calisacak test icin sildim sadece 
        // require(block.timestamp > agreement.lastPaidDate + WARNING_THRESHOLD, "Warning threshold not reached");
        require(!agreement.warningSent, "Warning already sent");

        agreement.warningSent = true;
        uint256 tokenId = agreement.nftId; // getting tokenID 
        emit WarningSent(tokenId, msg.sender, agreement.tenant); // sending message 
    }

    function revokeUsageRights(uint256 _rentalAgrementId) external  onlyLandLord {
        RentalAgreement storage agreement = rentalAgreements[_rentalAgrementId];
        require(agreement.rentalAgrementId != 0 , "There is no rental agreement with this ID..");
        require(msg.sender == agreement.landlord, "You are not landlord in this rental agreement.");
        // bu kisimda eklenecek test icin eklemedim 
       // require(block.timestamp > agreement.lastPaidDate + PAYMENT_GRACE_PERIOD, "Grace period has not expired");

       
        address tenant = agreement.tenant;
        uint256 tokenId = agreement.nftId;
        
        // kiraci ev sahibine NFT yi geri alma yetkisi veriyor
        // approve function is overridden 
        approve(agreement.landlord, tokenId ,tenant);
        safeTransferFrom(tenant, agreement.landlord, tokenId);
        

        delete tenantToAgreementId[tenant];
        agreement.tenant = address(0);

        emit UsageRightsRevoked(tokenId, msg.sender);
    }

    // overriding approve function 
    function approve(address to, uint256 tokenId , address from) public virtual {
        
        // su an nft hakki kiracida ve ev sahibine geri alma yetkisi veriyor 
        // burada normalde tenant yerine msg.sender gonderiliyor ama ben onu override ettim 
        // cunku bizim tenant nfti aldi ve hakkini kiraciya geri verecek eger 2 ay odemezse 
        _approve(to, tokenId, from);
    }

    

  
}
