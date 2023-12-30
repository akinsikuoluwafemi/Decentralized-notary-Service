// SPDX-License-Identifier: MIT

pragma solidity >=0.4.24;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";



contract StarNotaryV2 is ERC721  {
    
    uint private count = 0;
    string private tokenName;
    string private tokenSymbol;
    struct Star {
        string name;
    }
    mapping(uint256 => Star) public tokenIdToStarInfo; // mapping of tokenId => Star struct
    mapping(uint256 => uint256) public starsForSale; //mapping of the tokenId => price

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_){
        tokenName = name_;
        tokenSymbol = symbol_;
    }


    //create Star using Struct
    function createStar(string memory _name, uint256 _tokenId)  public {
        Star memory newStar = Star(_name);  //creating a new star
        tokenIdToStarInfo[_tokenId] = newStar; //adding the star into the tokenIdToStarInfo mapping using the tokenId
        _safeMint(msg.sender, _tokenId);
        count++; //take note of the number of stars created
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId)  == msg.sender, "You can't sell the Star you don't owned"); //put star up for sale if its the msg.sender that owns the star
        starsForSale[_tokenId] = _price;
    }


    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale"); //the price should be more than 0
        uint256 starCost = starsForSale[_tokenId]; //get the price
        address payable ownerAddress = payable(ownerOf(_tokenId)); //get the address of owner of the star
        require(msg.value > starCost, "You need to have enough Ether"); //check if the value the user is putting in is higher than the price of the star
        
        // Transfer ownership of the star
        transferFrom(ownerAddress, msg.sender, _tokenId);
        ownerAddress.transfer(starCost); //transfer the star cost from the buyer to the owner's address

        // Set the price back to 0 after a successful sale
        starsForSale[_tokenId] = 0;

        if(msg.value > starCost) { //i am checking that, if the money to be sent is more than the starcost, I should send the balance back to the msg.sender
            address payable buyer = payable(msg.sender); // Convert msg.sender to payable
            buyer.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (Star memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
         return tokenIdToStarInfo[_tokenId];
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public  {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);
        require(msg.sender == owner1 || msg.sender == owner2, "You do not own this star");
        //2. You don't have to check for the price of the token (star)
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)
        //4. Use _transferFrom function to exchange the tokens.
        transferFrom(owner1, owner2, _tokenId1); //approve them for each first
        transferFrom(owner2, owner1, _tokenId2); //approve them for each first
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(ownerOf(_tokenId)  == msg.sender, "You can't transfer the Star you don't own");
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        transferFrom(msg.sender, _to1, _tokenId);
    }
}