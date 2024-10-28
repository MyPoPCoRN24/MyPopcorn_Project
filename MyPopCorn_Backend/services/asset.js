const Web3 = require('web3');
const ASSET_ABI = require("./assetabi")

const web3 = new Web3('https://polygon-amoy.g.alchemy.com/v2/KGz3a0WnAbxdQRNP6m5cdquEjge-nkvR');



const contractAddress = '0xf28e861184146402B1d4CB81E172037Aa9fB531C';
const contract = new web3.eth.Contract(ASSET_ABI, contractAddress);

async function createAsset(senderAddress, assetID, assetName, URI, privateKey) {
    try {
        const data = contract.methods.CreateAsset(assetID, assetName, URI).encodeABI();
        
        let estimateGas1 = await contract.methods.CreateAsset(assetID, assetName, URI).estimateGas({ from: senderAddress });
        estimateGas1 = ((+estimateGas1) + 10000).toString(); 
        
        const tx = {
            from: senderAddress,
            to: contractAddress,
            data: data,
            gas: estimateGas1,
        };
        
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction successful with hash:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error creating asset:', error);
        throw error;
    }
}


async function viewAsset(assetID) {
    try {
        const assetDetails = await contract.methods.AssetView(assetID).call();
        console.log('Asset Details:', assetDetails);
        return assetDetails;
    } catch (error) {
        console.error('Error fetching asset details:', error);
        throw error;
    }
}



module.exports = {
    createAsset,
    viewAsset,
  };

