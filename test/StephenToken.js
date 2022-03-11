const StephenToken = artifacts.require('./StephenToken.sol');

contract('StephenToken', function(accounts) {
    it ('should put 1000 StephenToken in the first account', () => {
        return StephenToken.deployed().then((instance) => {
            return instance.call('getBalance', [accounts[0]])
        }).then((balance) => {
            assert.equal(balance.toNumber(), 10000, "10000 wasn't in the first account");
        })
    })
});