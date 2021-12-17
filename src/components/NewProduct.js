import React, { useRef } from 'react';
import { transfer } from '../helper_functions';


export default function NewProduct({ contract }) {
  const productRef = useRef('')
  const mint = (product, contract) => {
    console.log(product)
    const tx = contract.methods.createProduct(product)
    const to = contract.options.address
    transfer(tx, to)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    mint(productRef.current.value, contract)

  }
  return (
    <div className="row">
      <main role="main" className="col-lg-12 d-flex text-center">
        <div className="content mr-auto ml-auto">
          <form onSubmit={handleSubmit}>
            <input
              type='text'
              className='form-control mb-1'
              placeholder='Some new product ...'
              ref={productRef}
            />
            <input
              type='submit'
              className='btn btn-block btn-primary'
              value='MINT'
            />
          </form>
        </div>
      </main>
    </div>
  );
}
