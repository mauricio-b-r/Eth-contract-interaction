export const transfer = async (tx, to) => {
  const { ethereum } = window
  try {
    const from = ethereum.selectedAddress
    const data = tx.encodeABI();
    const gas = window.web3.utils.toHex(await tx.estimateGas({ from }));
    const gasPrice = await ethereum.request({ method: 'eth_gasPrice' })
    const nonce = await ethereum.request({
      method: 'eth_getTransactionCount',
      params: [from, "latest"]
    })
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
