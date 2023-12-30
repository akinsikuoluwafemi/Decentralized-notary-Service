const StarNotaryV2 = artifacts.require("StarNotaryV2");

contract("StarNotaryV2", (accounts) => {
  let starInstance;

  beforeEach(async () => {
    starInstance = await StarNotaryV2.deployed();
  });

  it("should be ale to create a star", async () => {
    let user1 = accounts[1];
    let starId = 1;
    const name = "Awesome Udacity Star";
    await starInstance.createStar(name, starId, { from: user1 });
    const star = await starInstance.tokenIdToStarInfo.call(starId);
    assert.equal(star, name);
  });

  it("lets user1 put up their star for sale", async () => {
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await starInstance.createStar("awesome star", starId, { from: user1 });
    await starInstance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await starInstance.starsForSale.call(starId), starPrice);
  });

  it("lets user1 get the funds after the sale", async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    // Create a star and put it up for sale
    await starInstance.createStar("awesome star", starId, { from: user1 });
    const tx = await starInstance.putStarUpForSale(starId, starPrice, {
      from: user1,
    });

    // Get the balance of user1 before the transaction
    let balanceOfUser1BeforeTransaction = await web3?.eth.getBalance(user1);

    //get owner of star
    const owner = await starInstance.ownerOf(starId);

    //approve for user2 to buy star
    await starInstance.approve(user2, starId, { from: owner }); // the owner of the star approves the transfer of the token to user2, without this user2 cannot receive the token
    const starCost = await starInstance.starsForSale.call(starId);
    assert(Number(starCost) > 0, "The star should be up for sale");

    //check that the value sent is greater than the star cost
    assert(starCost <= starPrice, "The star cannot be purchased for less");

    // Buyer (user2) purchases the star
    await starInstance.buyStar(starId, { from: user2, value: starPrice + 1 });

    // // Get the balance of user1 after the transaction
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);

    assert(balanceOfUser1AfterTransaction > balanceOfUser1BeforeTransaction);
  });

  it("lets user2 buy a star, if it is put up for sale", async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");

    // Create a star and put it up for sale
    await starInstance.createStar("awesome star", starId, { from: user1 });
    await starInstance.putStarUpForSale(starId, starPrice, { from: user1 });

    //check the star is for sale
    const upForSale = (await starInstance.starsForSale.call(starId)) > 0;
    assert(upForSale, true, "The star should be up for sale");

    // //star owner approves user2 to buy star
    const owner = await starInstance.ownerOf(starId);
    await starInstance.approve(user2, starId, { from: owner }); // the owner of the star approves the transfer of the token to user2, without this user2 cannot receive the token
    await starInstance.buyStar(starId, { from: user2, value: starPrice + 1 });
  });

  it("lets user2 buy a star and decreases its balance in ether", async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");

    // Create a star and put it up for sale
    await starInstance.createStar("new star", starId, { from: user1 });
    await starInstance.putStarUpForSale(starId, starPrice, { from: user1 });

    // //star owner approves user2 to buy star
    const owner = await starInstance.ownerOf(starId);
    await starInstance.approve(user2, starId, { from: owner }); // the owner of the star approves the transfer of the token to user2, without this user2 cannot receive the token

    const starCost = await starInstance.starsForSale.call(starId);
    assert(Number(starCost) > 0, "The star should be up for sale");

    // //check that the value sent is greater than the star cost
    assert(
      Number(starCost) <= starPrice,
      "The star cannot be purchased for less"
    );

    const user2BalanceBeforeTransaction = await web3.eth.getBalance(user2);

    // //user2 buys star
    await starInstance.buyStar(starId, { from: user2, value: starPrice + 1 });

    const user2BalanceAfterTransaction = await web3.eth.getBalance(user2);

    assert(
      user2BalanceBeforeTransaction > user2BalanceAfterTransaction,
      "The balance of user2 should be lower after the transaction"
    );
  });

  it("can add the star name and star symbol properly", async () => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const deployedName = await starInstance.name.call();
    const deployedSymbol = await starInstance.symbol.call();
    const name = "Station XO";
    const symbol = "SXO";
    assert.equal(deployedName, name);
    assert.equal(deployedSymbol, symbol);
  });

  it("lets 2 users exchange stars", async () => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed

    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 6;
    let starId2 = 7;
    let starPrice = web3.utils.toWei(".01", "ether");
    // Create a star and put it up for sale
    await starInstance.createStar("awesome star", starId1, { from: user1 });

    await starInstance.createStar("nice star", starId2, { from: user2 });

    //get owner of star
    const owner1 = await starInstance.ownerOf(starId1);
    const owner2 = await starInstance.ownerOf(starId2);

    //approve for user2 to buy star
    await starInstance.approve(user2, starId1, { from: owner1 }); // the owner of the star approves the transfer of the token to user2, without this user2 cannot receive the token
    await starInstance.approve(user1, starId2, { from: owner2 }); // the owner of the star approves the transfer of the token to user2, without this user2 cannot receive the token

    //transfer star to user2
    await starInstance.exchangeStars(starId1, starId2, { from: owner1 });

    //check that the token was transferred to the buyer
    let newOwner1 = await starInstance.ownerOf(starId1, { from: user1 });
    let newOwner2 = await starInstance.ownerOf(starId2, { from: user2 });
    assert.equal(newOwner1, user2, "The star was not transferred to the buyer");
    assert.equal(newOwner2, user1, "The star was not transferred to the buyer");
  });

  it("lets a user transfer a star", async () => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 8;
    let starPrice = web3.utils.toWei(".01", "ether");
    // Create a star and put it up for sale
    await starInstance.createStar("awesome star", starId, { from: user1 });
    await starInstance.putStarUpForSale(starId, starPrice, {
      from: user1,
    });

    //get owner of star
    const owner = await starInstance.ownerOf(starId);

    //approve for user2 to buy star
    await starInstance.approve(user2, starId, { from: owner }); // the owner of the star approves the transfer of the token to user2, without this user2 cannot receive the token

    //transfer star to user2
    await starInstance.transferStar(user2, starId, { from: owner });

    //check that the token was transferred to the buyer
    let newOwner = await starInstance.ownerOf(starId, { from: user1 });
    assert.equal(newOwner, user2, "The star was not transferred to the buyer");
  });

  it("lookUptokenIdToStarInfo test", async () => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 9;
    await starInstance.createStar("nice star", starId, { from: user1 });
    const star = await starInstance.lookUptokenIdToStarInfo(starId, {
      from: user2,
    });
    assert.equal(star, "nice star");
  });
});
