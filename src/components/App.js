import React, { useState, useEffect } from 'react';
import Web3 from 'web3'
import './App.css';
import Product from './Product'
import NewProduct from './NewProduct';
import useConnection from '../hooks/useConnection';
import { ButtonGroup, Tab, Tabs, ToggleButton, Row, Col } from 'react-bootstrap';
import { all as all_tab, created, delegated as delegated_tab } from '../constants/tabs';
import { not_delegated as not_delegated_filter, delegated as delegated_filter, all as all_filter } from '../constants/filters';

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

  const filters = [
    { name: 'All', value: all_filter },
    { name: 'Delegated', value: delegated_filter },
    { name: 'Not delegated', value: not_delegated_filter }
  ]

  const [contract, setContract] = useState(null)
  const [contractWss, setContractWss] = useState(null)
  const [fetchedProducts, setFetchedProducts] = useState(false)
  const [filterValue, setFilterValue] = useState(all_filter);
  const [key, setKey] = useState(all_tab);
  const [products, setProducts] = useState([])
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
      prod.id = i
      prods.push(prod)
    }
    return prods
  }

  const updateEventProduct = async (productId) => {
    const prod = await contract.methods.products(productId).call()
    const updated_prods = [...products]
    updated_prods[productId] = { ...prod }
    setProducts(updated_prods)
  }

  const filteredProducts = () => {
    let filtered_prods = products.filter((prod) => {
      switch (key) {
        case delegated_tab: return (prod.newOwner === address && prod.status === '1');
        case created: return prod.owner === address;
        default: return true;
      }
    })
    if (key === all_tab)
      filtered_prods = filtered_prods.filter((prod) => {
        switch (filterValue) {
          case delegated_filter: return prod.status === '1';
          case not_delegated_filter: return prod.status === '0';
          default: return true;
        }

      })
    return filtered_prods.map((product) => <Product key={product.id} product={product} contract={contract} account={address} />)
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
          <NewProduct contract={contract} account={address} onNewProduct={updateEventProduct} />
        }
        <Row>
          <Col md={{ span: key === all_tab ? 10 : 12 }}><Tabs
            id="controlled-tab"
            activeKey={key}
            onSelect={(k) => setKey(k)}
          >
            <Tab eventKey={all_tab} title="All">
            </Tab>
            <Tab eventKey={delegated_tab} title="Delegated">
            </Tab>
            <Tab eventKey={created} title="Created">
            </Tab>
          </Tabs>
          </Col>
          {key === all_tab &&
            <Col md={{ span: 2 }}>
              <Row>
                <Col md={{ span: 4 }}>
                  Filter by&nbsp;
                </Col>
                <Col md={{ span: 8 }}>
                  <ButtonGroup>
                    {filters.map((filter, idx) => (
                      <ToggleButton
                        key={idx}
                        id={`filter-${idx}`}
                        type="radio"
                        variant="secondary"
                        name="filter"
                        value={filter.value}
                        checked={filterValue === filter.value}
                        onChange={(e) => setFilterValue(e.currentTarget.value)}
                      >
                        {filter.name}
                      </ToggleButton>
                    ))}
                  </ButtonGroup>
                </Col>
              </Row>
            </Col>
          }
        </Row>
        <Row>
          {filteredProducts()}
        </Row>
      </div>
    </div >
  );
}

export default App;
