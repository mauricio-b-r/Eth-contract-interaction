import React, { useRef } from 'react';
import { transfer } from '../helper_functions'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'


export default function Product({ product, index, contract }) {
  const addressRef = useRef('')
  const delegateProduct = (e) => {
    e.preventDefault()
    if (!addressRef.current.value) return
    const tx = contract.methods.delegateProduct(index, addressRef.current.value)
    const to = contract.options.address
    transfer(tx, to)
  }
  const acceptProduct = (e) => {
    e.preventDefault()
    const tx = contract.methods.acceptProduct(index)
    const to = contract.options.address
    transfer(tx, to)
  }
  const DelegateButton = () => {
    return <form onSubmit={delegateProduct}>
      <input
        type='text'
        className='form-control mb-1'
        placeholder='Address'
        ref={addressRef}
      />
      <input
        type='submit'
        className='btn btn-block btn-primary'
        value='DELEGATE'
      />
    </form>
  }
  const AcceptButton = () => {
    return <form onSubmit={acceptProduct}>
      <input
        type='submit'
        className='btn btn-block btn-primary'
        value='ACCEPT'
      />
    </form>
  }

  return (
    <Card style={{ width: '18rem' }} body className="col col-md-4 mb-3">
      <Card.Title>Product - {product.name}</Card.Title>
      <ListGroup variant="flush">
        <ListGroup.Item>Status - {product.status}</ListGroup.Item>
        <ListGroup.Item>Owner - {product.owner}</ListGroup.Item>
        <ListGroup.Item>New Owner - {product.newOwner}</ListGroup.Item>
        <hr />
      </ListGroup>
      {product.owner.toLowerCase() === window.ethereum.selectedAddress && product.status !== '1' ?
        <DelegateButton /> : undefined
      }
      {product.newOwner.toLowerCase() === window.ethereum.selectedAddress && product.status === '1' ?
        <AcceptButton /> : undefined
      }
    </Card>
  );
}
