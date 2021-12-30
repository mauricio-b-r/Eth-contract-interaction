const transfer = (tx, account) => {
  return tx.send({
    from: account,
    gas: 0x2dc6c0,
    gasPrice: 0xdf8475800
  })
}

export const mint = (product, contract, account) => {
  const tx = contract.methods.createProduct(product)
  return transfer(tx, account)
}

export const delegate = (index, address, contract, account) => {
  const tx = contract.methods.delegateProduct(index, address)
  return transfer(tx, account)
}

export const accept = (index, contract, account) => {
  const tx = contract.methods.acceptProduct(index)
  return transfer(tx, account)
}
