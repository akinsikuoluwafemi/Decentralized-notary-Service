const StarNotaryV2 = artifacts.require("StarNotaryV2");

module.exports = function (deployer) {
  deployer.deploy(StarNotaryV2, "Station XO", "SXO");
};
