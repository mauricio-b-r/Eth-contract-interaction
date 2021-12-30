import React, { useState, useEffect } from 'react';
import Web3 from 'web3'
import './App.css';
import Product from './Product'
import NewProduct from './NewProduct';
import useConnection from '../hooks/useConnection';

// Providers
const NODE_URL_WSS = "wss://matic-testnet-archive-ws.bwarelabs.com";
const provider_wss = new Web3.providers.WebsocketProvider(NODE_URL_WSS);
// Contract information
const contract_address = "0xd9E0b2C0724F3a01AaECe3C44F8023371f845196"
const contract_abi = [{ "constant": false, "inputs": [{ "name": "_name", "type": "string" }], "name": "createProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "productToOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_productId", "type": "uint256" }, { "name": "_newOwner", "type": "address" }], "name": "delegateProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_productId", "type": "uint256" }], "name": "acceptProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "products", "outputs": [{ "name": "name", "type": "string" }, { "name": "status", "type": "uint8" }, { "name": "owner", "type": "address" }, { "name": "newOwner", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "size", "outputs": [{ "name": "count", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "name", "type": "string" }], "name": "NewProduct", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "newOwner", "type": "address" }, { "indexed": false, "name": "status", "type": "uint8" }], "name": "DelegateProduct", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "name", "type": "string" }, { "indexed": false, "name": "status", "type": "uint8" }], "name": "AcceptProduct", "type": "event" }]
const from_block = Web3.utils.toHex(22660777)
// Web3 instances
const web3_wss = new Web3(provider_wss);
// Minimum amount of confirmations
const min_confirmations = 21

window.web3 = new Web3(window.ethereum || (window.web3 && window.web3.currentProvider) || "http://localhost:8545")


function App() {
  const [contract, setContract] = useState(null)
  const [contractWss, setContractWss] = useState(null)
  const [products, setProducts] = useState([])
  const [fetchedProducts, setFetchedProducts] = useState(false)
  const { isConnected, address, chainId } = useConnection()

  useEffect(() => {
    (async () => {
      if (isConnected && chainId)
        await loadBlockchainData()
    })()
  }, [isConnected, chainId])

  const loadBlockchainData = async () => {
    if (chainId === 0x13881 || chainId === 80001) {
      // Contract instances
      const contract = new window.web3.eth.Contract(contract_abi, contract_address)
      const contract_wss = new web3_wss.eth.Contract(contract_abi, contract_address)
      // Store contracts
      setContract(contract)
      setContractWss(contract_wss)
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  useEffect(() => {
    (async () => {
      if (contract) {
        // Get contract products size
        const size = await contract.methods.size().call()
        // Load Products
        const prods = await getAllProducts(size)
        setProducts([...prods])
        setFetchedProducts(true)
      }
    })()
  }, [contract])

  useEffect(() => {
    (async () => {
      if (contractWss && fetchedProducts) {
        contractWss.events.NewProduct({ fromBlock: 'latest' }).on('data', async (data) => {
          console.log(data, 'new prod')
        })
        contractWss.events.DelegateProduct({ fromBlock: 'latest' }).on('data', async (data) => {
          console.log(data, 'delegated')
        })
        contractWss.events.AcceptProduct({ fromBlock: 'latest' }).on('data', async (data) => {
          console.log(data, 'accepted')
        })
      }
    })()
  }, [contractWss, fetchedProducts])

  const getProductById = async (id) => {
    return await contract.methods.products(id).call()
  }

  const getAllProducts = async (size) => {
    const prods = []
    for (var i = 0; i < size; i++) {
      const prod = await getProductById(i)
      prods.push(prod)
    }
    return prods
  }

  const updateEventProduct = async (values) => {
    const prod = await contract.methods.products(values.productId).call()
    const updated_prods = [...products]
    updated_prods[values.productId] = { ...prod }
    setProducts(updated_prods)
  }

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <div></div>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white"><span id="account">{address}</span> - {chainId}</small>
          </li>
        </ul>
      </nav>
      <div className="container mt-5">
        {fetchedProducts &&
          <NewProduct contract={contract} account={address} />
        }
        <br />
        <div className="row text-center">
          {products.map((product, index) => <Product key={index} product={product} index={index} contract={contract} account={address} />)}
        </div>
      </div>
    </div>
  );
}

export default App;
