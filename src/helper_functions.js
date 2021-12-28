export const transfer = async (tx, to) => {
  const { ethereum, web3 } = window
  try {
    const from = ethereum.selectedAddress
    const data = tx.encodeABI();
    const nonce = await ethereum.request({
      method: 'eth_getTransactionCount',
      params: [from, "latest"]
    })
    const gas = web3.utils.toHex(await tx.estimateGas({ from }));
    const gasPrice = await ethereum.request({ method: 'eth_gasPrice' })
    const transaction = {
      nonce,
      gasPrice,
      gas,
      from,
      to,
      data,
    }
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    });
    console.log(`Transaction hash: ${txHash}`);
  } catch (error) {
    console.error('error', error)
  }
}
