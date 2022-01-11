import React, { useRef } from 'react';
import { mint } from '../helper_functions';


export default function NewProduct({ contract, account, onNewProduct }) {
  const productRef = useRef('')

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productRef.current.value) return
    mint(productRef.current.value, contract, account).on("receipt", (receipt) => {
      const { productId } = receipt.events.NewProduct.returnValues
      onNewProduct(productId)
    })
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
