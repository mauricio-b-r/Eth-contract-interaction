import React, { useState, useEffect } from 'react';
import Web3 from 'web3'
import './App.css';
import Product from './Product'
import NewProduct from './NewProduct';

function App() {
  const [account, setAccount] = useState('')
  const [contract, setContract] = useState(null)
  const [contractWss, setContractWss] = useState(null)
  const [size, setSize] = useState(0)
  const [products, setProducts] = useState([])
  const [fetchedProducts, setFetchedProducts] = useState(false)


  useEffect(() => {
    (async () => {
      await loadWeb3()
      await loadBlockchainData()
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (contract) {
        // Get contract products size
        const size = await contract.methods.size().call()
        setSize(size)
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
        // Configure events for updating the products list
        contractWss.events.NewProduct().on('data', ({ returnValues }) => {
          updateEventProduct(returnValues)
        })
        contractWss.events.DelegateProduct().on('data', ({ returnValues }) => {
          updateEventProduct(returnValues)
        })
        contractWss.events.AcceptProduct().on('data', ({ returnValues }) => {
          updateEventProduct(returnValues)
        })
      }
    })()
  }, [contractWss, fetchedProducts])

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })

      window.web3 = new Web3(window.ethereum)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  const loadBlockchainData = async () => {
    // Load account
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])

    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    if (Web3.utils.hexToNumber(chainId) === 80001) {
      // Providers endpoints
      const NODE_URL_WSS = "wss://matic-testnet-archive-ws.bwarelabs.com";
      // Providers
      const provider_wss = new Web3.providers.WebsocketProvider(NODE_URL_WSS);
      // Contract information
      const contract_address = "0xd9E0b2C0724F3a01AaECe3C44F8023371f845196"
      const contract_abi = [{ "constant": false, "inputs": [{ "name": "_name", "type": "string" }], "name": "createProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "productToOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_productId", "type": "uint256" }, { "name": "_newOwner", "type": "address" }], "name": "delegateProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_productId", "type": "uint256" }], "name": "acceptProduct", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "products", "outputs": [{ "name": "name", "type": "string" }, { "name": "status", "type": "uint8" }, { "name": "owner", "type": "address" }, { "name": "newOwner", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "size", "outputs": [{ "name": "count", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "name", "type": "string" }], "name": "NewProduct", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "newOwner", "type": "address" }, { "indexed": false, "name": "status", "type": "uint8" }], "name": "DelegateProduct", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "productId", "type": "uint256" }, { "indexed": false, "name": "name", "type": "string" }, { "indexed": false, "name": "status", "type": "uint8" }], "name": "AcceptProduct", "type": "event" }]
      // Web3 instances
      const web3_wss = new Web3(provider_wss);
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
            <small className="text-white"><span id="account">{account}</span></small>
          </li>
        </ul>
      </nav>
      <div className="container mt-5">
        {fetchedProducts &&
          <NewProduct contract={contract} />
        }
        <br />
        <div className="row text-center">
          {products.map((product, index) => <Product key={index} product={product} index={index} contract={contract} />)}
        </div>
      </div>
    </div>
  );
}

export default App;
