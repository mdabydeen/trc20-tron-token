// var MyContract = artifacts.require("./MyContract.sol");
const StephenToken = artifacts.require('./StephenToken.sol');

module.exports = function(deployer) {
  // deployer.deploy(MyContract);
  deployer.deploy(StephenToken);
};
