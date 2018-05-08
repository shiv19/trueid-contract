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
            .send({ from: accounts[0], gas: "5000000" });
    });

    it('contract deployed', () => {
        assert.ok(trueId.options.address);
    });

    it('has government as creator of the government', async () => {
        const government = await trueId.methods.government().call();
        console.log(government);
        assert.equal(government, accounts[0]);
    });

    it('governement can add users(ID)', async () => {
        await trueId.methods.editUser(accounts[1], "Suvarna", "Umakant", "Nelam", "Kirloskar Layout", "Female", "01/04/1996", "India").send({
            from: accounts[0], gas: "2000000"
        });
        const users = await trueId.methods.getUsers().call();
        assert.equal(users[0], accounts[1]);
    })

    it('user id is stored properly', async () => {
        // dependency on previous testcase
        const user = await trueId.methods.getUser(accounts[1]).call();
        assert.equal(user[0], "Suvarna");
        assert.equal(user[1], "Umakant");
        assert.equal(user[2], "Nelam");
        assert.equal(user[3], "Kirloskar Layout");
        assert.equal(user[4], "Female");
        assert.equal(user[5], "01/04/1996");
        assert.equal(user[6], "India");
    })

    it('government can retrive list of users', async () => {
        const users = await trueId.methods.getUsers().call();
        assert.equal(users.length, 1);
    })

    it('government can edit user', async () => {
        // The address is changed
        await trueId.methods.editUser(accounts[1], "Suvarna", "Umakant", "Nelam", "AGB Layout", "Female", "01/04/1996", "India").send({
            from: accounts[0], gas: "2000000"
        });

        const user = await trueId.methods.getUser(accounts[1]).call();
        assert.equal(user[3], "AGB Layout");
    })

    it('No other can delete user(ID)', async () => {
        trueId.methods.deleteUser(accounts[1]).send({
            from: accounts[1],
            gas: "2000000"
        }).should.be.rejectedWith(Error)
    })

    it('government can delete user', async () => {
        await trueId.methods.deleteUser(accounts[1]).send({
            from: accounts[0],
            gas: "2000000"
        })
        const user = await trueId.methods.getUser(accounts[1]).call();
        assert.equal(user[0], "");
    })

    it('government can add service providers, exp. JIO', async () => {
        await trueId.methods.editProvider(accounts[5], "Jio", "Mumbai", "contact@jio.com").send({
            from: accounts[0],
            gas: "2000000"
        });
        const provider = await trueId.methods.getProvider(accounts[5]).call();
        assert.equal(provider[0], "Jio");
    })

    it('government can edit service provider', async () => {
        await trueId.methods.editProvider(accounts[5], "JioInfoCOM", "Mumbai", "contact@jio.com").send({
            from: accounts[0],
            gas: "2000000"
        });
        const provider = await trueId.methods.getProvider(accounts[5]).call();
        assert.equal(provider[0], "JioInfoCOM");
    })

    it('government can delete service provider', async ()=> {
        await trueId.methods.deleteProvider(accounts[5]).send({
            from: accounts[0],
            gas: "2000000"
        })

        const provider = await trueId.methods.getProvider(accounts[5]).call();
        assert.equal(provider[0],"");
    })

    it('No other can access user details', async ()=> {
        trueId.methods.getUserDetails(accounts[1]).call({
            from: accounts[2] // normal user's account
        }).should.be.rejectedWith(Error);
    })

    it('service provider can access user id', async ()=> {
        await trueId.methods.editProvider(accounts[5], "JioInfoCOM", "Mumbai", "contact@jio.com").send({
            from: accounts[0],
            gas: "2000000"
        });

        await trueId.methods.editUser(accounts[1], "Suvarna", "Umakant", "Nelam", "AGB Layout", "Female", "01/04/1996", "India").send({
            from: accounts[0], gas: "2000000"
        });

        const user = await trueId.methods.getUserDetails(accounts[1]).call({
            from: accounts[5]
        })
        assert.equal(user[0], "Suvarna");
    })

    it('User can access his/her details', async ()=> {
        const details = await trueId.methods.getID().call({
            from: accounts[1]
        });

        assert.equal(details[0], "Suvarna");
    })
});
