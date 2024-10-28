const Web3 = require('web3');
const POPCONSURVEY_ABI = require("./popconsurveyabi")




async function getTokenSymbol(tokenaddress , web3ProviderUrl) {
  const web3 = new Web3(web3ProviderUrl);
  const contract = new web3.eth.Contract(POPCONSURVEY_ABI, tokenaddress);
  try {
    const symbol = await contract.methods.symbol().call();
    console.log('Token Symbol:', symbol);
    return symbol;
  } catch (error) {
    console.error('Error fetching token symbol:', error);
    throw new Error('Invalid token address'); 
  }
}





async function safeTransfer(senderAddress, to, value, privateKey , tokenaddress , web3ProviderUrl) {
  console.log("==============",senderAddress, to, value, privateKey , tokenaddress , web3ProviderUrl)
  const web3 = new Web3(web3ProviderUrl);
  const contract = new web3.eth.Contract(POPCONSURVEY_ABI, tokenaddress);
    try {
        const amountInWei = web3.utils.toWei(value.toString(), 'ether');
        console.log('Converting amount to Wei:', amountInWei);
        
        if (!web3.utils.isHex(amountInWei)) {
            throw new Error('Invalid amountInWei');
        }
        
        const data = contract.methods.safeTransfer(to, amountInWei).encodeABI();
        let estimateGas1 = await contract.methods.approve(tokenaddress, amountInWei).estimateGas({ from: senderAddress });
            estimateGas1 = ((+estimateGas1) + 10000).toString()
        
        const tx = {
            from: senderAddress,
            to: tokenaddress,
            data: data,
            gas: estimateGas1, 
        };
        
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction successful with hash:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
}

async function getBalanceOf(address ,tokenadress , web3ProviderUrl) {
  const web3 = new Web3(web3ProviderUrl);
  const contract = new web3.eth.Contract(POPCONSURVEY_ABI, tokenadress);
    try {
      const balance = await contract.methods.balanceOf(address).call();
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }



module.exports = {
    safeTransfer,
    getBalanceOf,
    getTokenSymbol,
  };


