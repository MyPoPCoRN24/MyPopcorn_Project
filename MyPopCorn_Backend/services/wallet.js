const Web3 = require('web3');

function generateEthWallet() {
  const web3 = new Web3('https://polygon-amoy.infura.io/v3/9eb6ef4f94c64ad78d6d5a257debfbc1');
  const wallet = web3.eth.accounts.create();
  return wallet;
}

async function checkBalance(address , web3ProviderUrl) {
  const web3 = new Web3(web3ProviderUrl);
  try {
    const balanceWei = await web3.eth.getBalance(address);
    const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
    return balanceEther;
  } catch (error) {
    console.error('Error checking balance:', error);
    return 'Error';
  }
}

async function transferFunds(senderAddress, receiverAddress, amountInEther, PrivateKey , web3ProviderUrl) {
  const web3 = new Web3(web3ProviderUrl);
  try {
      const amountInWei = web3.utils.toWei(amountInEther.toString(), 'ether');
      console.log('Converting amount to Wei:', amountInWei);

     
      const gasPrice = await web3.eth.getGasPrice();
      console.log('Estimated gas price:', gasPrice);

      const signedTransaction = await web3.eth.accounts.signTransaction({
          from: senderAddress,
          to: receiverAddress,
          value: amountInWei,
          gas: 21000, 
          gasPrice: gasPrice,
      }, PrivateKey);
      console.log('Signed transaction created:', signedTransaction);

      const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
      console.log('Transaction receipt:', receipt);
      
      return receipt;
  } catch (error) {
      console.error('Error sending Ether:', error);
      throw error;
  }
}


module.exports = {
  generateEthWallet,
  checkBalance,
  transferFunds,
};
