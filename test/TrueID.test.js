const ganache = require('ganache-cli');
const Web3 = require('web3');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiAlmost = require('chai-almost');
const assert = require('chai').assert;
const should = require('chai').should();

chai.use(chaiAsPromised);
chai.use(chaiAlmost());

const { interface, bytecode } = require('../build/TrueID.json');

describe('Goverment is initiated', () => {
    const provider = ganache.provider();
    const web3 = new Web3(provider);
    let accounts;
    let trueId;

    before(async () => {
        accounts = await web3.eth.getAccounts();
        trueId = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({ data: bytecode })
            .send({ from: accounts[0], gas: "2000000" });
    });

    it('contract deployed', () => {
        assert.ok(trueId.options.address);
    });

    it('has government as creator of the government', async () => {
        const government = await trueId.methods.government().call();
        console.log(government);
        assert.equal(government, accounts[0]);
    });
});
