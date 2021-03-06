import { mint, delegate, accept } from '../helper_functions'

const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const abi = [{ "constant": false, "inputs": [{ "name": "_name", "type": "string" }], "name": "createProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "productToOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_productId", "type": "uint256" }, { "name": "_newOwner", "type": "address" }], "name": "delegateProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_productId", "type": "uint256" }], "name": "acceptProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "products", "outputs": [{ "name": "name", "type": "string" }, { "name": "status", "type": "uint8" }, { "name": "owner", "type": "address" }, { "name": "newOwner", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "size", "outputs": [{ "name": "count", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "name", "type": "string" }], "name": "NewProduct", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "newOwner", "type": "address" }, { "indexed": false, "name": "status", "type": "uint8" }], "name": "DelegateProduct", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "name", "type": "string" }, { "indexed": false, "name": "status", "type": "uint8" }], "name": "AcceptProduct", "type": "event" }]
const bytecode = "608060405234801561001057600080fd5b506108b6806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806302ec06be14610067578063420fadc81461010f5780634c5bb4dd1461014857806365078a0c146101745780637acc0b2014610191578063949d225d14610265575b600080fd5b61010d6004803603602081101561007d57600080fd5b81019060208101813564010000000081111561009857600080fd5b8201836020820111156100aa57600080fd5b803590602001918460018302840111640100000000831117156100cc57600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955061027f945050505050565b005b61012c6004803603602081101561012557600080fd5b5035610440565b604080516001600160a01b039092168252519081900360200190f35b61010d6004803603604081101561015e57600080fd5b50803590602001356001600160a01b031661045b565b61010d6004803603602081101561018a57600080fd5b5035610588565b6101ae600480360360208110156101a757600080fd5b503561070f565b60405180806020018560ff1660ff168152602001846001600160a01b03166001600160a01b03168152602001836001600160a01b03166001600160a01b03168152602001828103825286818151815260200191508051906020019080838360005b8381101561022757818101518382015260200161020f565b50505050905090810190601f1680156102545780820380516001836020036101000a031916815260200191505b509550505050505060405180910390f35b61026d6107e2565b60408051918252519081900360200190f35b33600090815260026020526040902054600a101561029c57600080fd5b604080516080810182528281526000602080830182905233938301939093526060820181905280546001810180835591805282518051929460039092027f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563019261030992849201906107e9565b506020828101516001838101805460408088015160ff1990921660ff90951694909417610100600160a81b0319166101006001600160a01b039283160217909155606095860151600295860180546001600160a01b03199081169290931691909117905560008054600019018082528386528482208054339416841790559181529484528285208054909201909155815181815280840183815288519382019390935287519196507ff21dbf9e399a0713acf6eda2b3cd910118a9989bd6e58e7c143405fc4ff21218958795899592949391850192860191908190849084905b838110156104015781810151838201526020016103e9565b50505050905090810190601f16801561042e5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a15050565b6001602052600090815260409020546001600160a01b031681565b6000828152600160205260409020546001600160a01b0316331461047e57600080fd5b6000828154811061048b57fe5b600091825260209091206001600390920201015460ff16156104eb576040805162461bcd60e51b81526020600482015260146024820152731a5cc8185b1c9958591e4819195b1959d85d195960621b604482015290519081900360640190fd5b60008083815481106104f957fe5b6000918252602091829020600391909102016001818101805460ff1916909117908190556002820180546001600160a01b0319166001600160a01b038716908117909155604080518881529485019190915260ff90911683820152519092507fd6f28d7dae1dcd8daebfd9cc968f71165e5063ea796de46f92a95a4da155e5e1916060908290030190a1505050565b6000818154811061059557fe5b60009182526020909120600160039092020181015460ff16146105b757600080fd5b336001600160a01b0316600082815481106105ce57fe5b60009182526020909120600260039092020101546001600160a01b0316146105f557600080fd5b600080828154811061060357fe5b600091825260209182902060016003909202018181018054600280840180546001600160a01b0319169055336101009081026001600160a81b031990931692909217928390556040805189815260ff94909416908401819052606096840187815285549687161590930260001901909516049482018590529194507f1ad74a28593362b47a0a3377ee29ac1d4c8473a8a120047b05fe6ef99ef5867593869386939092916080830190859080156106fb5780601f106106d0576101008083540402835291602001916106fb565b820191906000526020600020905b8154815290600101906020018083116106de57829003601f168201915b505094505050505060405180910390a15050565b6000818154811061071c57fe5b60009182526020918290206003919091020180546040805160026001841615610100026000190190931692909204601f8101859004850283018501909152808252919350918391908301828280156107b55780601f1061078a576101008083540402835291602001916107b5565b820191906000526020600020905b81548152906001019060200180831161079857829003601f168201915b5050506001840154600290940154929360ff8116936001600160a01b036101009092048216935016905084565b6000545b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061082a57805160ff1916838001178555610857565b82800160010185558215610857579182015b8281111561085757825182559160200191906001019061083c565b50610863929150610867565b5090565b6107e691905b80821115610863576000815560010161086d56fea265627a7a72305820f0a70fc269f19394ab4e3838b3241de7b6be9f788ab7f58fc76989c4ae1dfb5564736f6c63430005090032"

const web3 = new Web3(ganache.provider());
let contract
let account
let account2
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
let deploy_contract
describe("ContractName", () => {
    beforeEach(async () => {
        const accounts = await web3.eth.getAccounts()
        account = accounts[0]
        account2 = accounts[1]

        const payload = {
            data: bytecode
        }

        const parameter = {
            from: account,
            gas: 0x2dc6c0,
            gasPrice: 0xdf8475800
        }
        contract = new web3.eth.Contract(abi);
        contract = await contract.deploy(payload).send(parameter)
    })

    it("should be able to create a new products", async () => {
        const result = await mint('test 1', contract, account)

        assert.equal(result.status, true);
        assert.equal(result.events.NewProduct.returnValues.name, 'test 1');
        assert.equal(result.events.NewProduct.returnValues.productId, 0);

        const result2 = await mint('test 2', contract, account)

        assert.equal(result2.status, true);
        assert.equal(result2.events.NewProduct.returnValues.name, 'test 2');
        assert.equal(result2.events.NewProduct.returnValues.productId, 1);

    })
    it("should be able to delegate product", async () => {
        await mint("test 3", contract, account);
        const result = await delegate(0, account2, contract, account);

        assert.equal(result.status, true);
        assert.equal(result.events.DelegateProduct.returnValues.productId, 0);
        assert.equal(result.events.DelegateProduct.returnValues.status, 1);
        assert.equal(result.events.DelegateProduct.returnValues.newOwner, account2);
    })

    it("no should be able to delegate product", async () => {
        await mint("test 4", contract, account);
        let result = await delegate(0, account2, contract, account);

        assert.equal(result.status, true);
        assert.equal(result.events.DelegateProduct.returnValues.productId, 0);
        assert.equal(result.events.DelegateProduct.returnValues.status, 1);
        assert.equal(result.events.DelegateProduct.returnValues.newOwner, account2);

        try {
            await delegate(0, account2, contract, account);
        } catch (error) {
            console.log(error)
            // assert.equal(error.reason, "is already delegated");
            // assert.equal(error.error, "revert");
        }
    })

    it("should be able to accept product", async () => {
        await mint("test 5", contract, account);
        let result = await delegate(0, account2, contract, account);

        assert.equal(result.status, true);
        assert.equal(result.events.DelegateProduct.returnValues.productId, 0);
        assert.equal(result.events.DelegateProduct.returnValues.status, 1);
        assert.equal(result.events.DelegateProduct.returnValues.newOwner, account2);

        result = await accept(0, contract, account2);
        assert.equal(result.status, true);
        console.log(result.events.AcceptProduct.returnValues)
        assert.equal(result.events.AcceptProduct.returnValues.productId, 0);
        assert.equal(result.events.AcceptProduct.returnValues.status, 0);
    })
});
