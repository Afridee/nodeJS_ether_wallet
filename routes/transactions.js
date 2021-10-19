const express = require('express');
const router = express.Router();
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3_alchemy_rinkeby = createAlchemyWeb3(process.env.WEB3_WEBSOCKET_RINKEBY);
const web3_alchemy_mainnet = createAlchemyWeb3(process.env.WEB3_WEBSOCKET_MAINNET);
const Web3 = require('web3');
const web3_rinkeby = new Web3(process.env.WEB3_WEBSOCKET_RINKEBY);
const web3_mainnet = new Web3(process.env.WEB3_WEBSOCKET_MAINNET);
const {validateTransaction} = require('../validations/validateTransaction');
const {validateTransactionHash} = require('../validations/validateTransactionHash');
const {validateGetWeth} = require('../validations/validateGetWeth');
const {validateERC20approvalForSwapping} = require('../validations/validateERC20approvalForSwapping');
const {validateERC20Tokenswap} = require('../validations/validateERC20Tokenswap');
const {validateEthToTokenSwap} = require('../validations/validateEthToTokenSwap');
const {validateInputdata} = require('../validations/validateInputdata');
const {uniswapV2router2ABI} = require('../models/uniswapV2router2ABI');
const {erc20ABI} = require('../models/ERC20contractABI');
const abiDecoder = require('abi-decoder');


router.post('/sendEth',async  (req, res) => {

   const { error } = validateTransaction(req.body); 
   if (error) return res.status(400).send(error.details[0].message);

   let web3 = req.body.network=="mainnet" ? web3_alchemy_mainnet : web3_alchemy_rinkeby;
   
   const fromAddress = req.body.fromAddress; //example: '0x303605ddAAF2690b989c2c734eA1B03F7Cc6637a'
   const toAddress = req.body.toAddress; //example: '0x1a2FB262558229F6ba98E7A819253533D2fE4fc5'
   const value =  Web3.utils.toWei(req.body.value.toString(), 'ether'); //example: 1 ETH
   const gas = req.body.gas.toString(); //example: 30000, // 1 ETH
   const gasPrice = Web3.utils.toWei(req.body.gasPrice.toString(), 'gwei'); //still is wei...gotta change that
   const fromAddressPrivateKey = req.body.fromAddressPrivateKey; //'PRIVATE_KEY'
   const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest'); // nonce starts counting from 0

   //TODO: determine gas price:
   web3.eth.getGasPrice().then((price) => {
    console.log(price);
   });

   const transaction = {
       'to': toAddress, // faucet address to return eth
       'value': value, // in wei
       'gas': gas, 
       'nonce': nonce,
       'gasPrice' : gasPrice //in wei
      };  

      const signedTx = await web3.eth.accounts.signTransaction(transaction, fromAddressPrivateKey);
   
      web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
       
        if (!error) {

       console.log("Transaction sent!", hash);

       let tries = 0;
       
       const interval = setInterval(function() {
          if(tries<5){
            console.log("Attempting to get transaction receipt...");
            web3.eth.getTransactionReceipt(hash, function(err, rec) {
              if (rec) {
               clearInterval(interval); 
               res.status(200).send({
                 "transactionHash" : hash,
                 "rec" : rec
                });
              } 
            });
            tries++; 
          }else{
            clearInterval(interval); 
            res.status(200).send({
              "transactionHash" : hash,
              "rec" : null
             });
          }
       }, 1000);

      } else {
        console.log("Something went wrong while submitting your transaction:", error.message);
        res.status(500).send({
          "error" : error.message
        });
      }
     });   
       
});

router.post('/transactionDetails',async  (req, res) => { 

  const { error } = validateTransactionHash(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;

  const trasactionHash = req.body.trasactionHash;
  try{
    const trx = await web3.eth.getTransaction(trasactionHash);
    const valid = validateTransaction(trx);
    if(valid){
      res.status(200).send({
        "transactionDetails" : trx
    });
    }else{
      res.status(500).send('Invalid transaction..',);
    }

  }catch(ex){
    console.log(ex);
    res.status(500).send('Something failed: '); 
  }
});

router.post('/getWeth', async (req, res) => {

  const { error } = validateGetWeth(req.body); 
  if (error) return res.status(400).send({"error": error.details[0].message});

   try{
    let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;
    const amountIn =  Web3.utils.toWei(req.body.amountIn.toString(), 'ether');
    const account = await web3.eth.accounts.privateKeyToAccount(req.body.privateKey);
    WETH_ADDRESS = req.body.network=="mainnet" ?  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" : "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    var admin = account.address;
    const nonce = await web3.eth.getTransactionCount(admin, 'latest'); 
    const gasPrice = Web3.utils.toWei(req.body.gasPrice.toString(), 'gwei');
    

   const transaction = {
    'from' : admin,
    'to': WETH_ADDRESS, 
    'value': amountIn, // in wei
    'gas': req.body.gas,
    'gasPrice' : gasPrice,
    'nonce': nonce
   }; 

   const signedTx = await web3.eth.accounts.signTransaction(transaction, req.body.privateKey);


   await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('transactionHash', function(hash){
      console.log("transactionHash: ", hash);
      res.status(200).send({"transactionHash" : hash});
    }).on('error', function(error){
      console.log("error: ", error.message);  
    });
   }catch(error){
    res.status(400).send({"error" :  error.message});
   }
});

router.post('/approveErc20TokenForSwapping',async  (req, res) => {
  
  const { error } = validateERC20approvalForSwapping(req.body); 
  if (error) return res.status(400).send({"error": error.details[0].message});

  try{
    let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;
    const gasPrice = Web3.utils.toWei(req.body.gasPrice.toString(), 'gwei');
    const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const tokenAddress = req.body.tokenAddress;
    const tokenContract = await new web3.eth.Contract(erc20ABI, tokenAddress);
    const account = await web3.eth.accounts.privateKeyToAccount(req.body.privateKey);
    const admin = account.address;
    const nonce = await web3.eth.getTransactionCount(admin, 'latest'); 
    const tokenDecimal = await tokenContract.methods.decimals().call();
    var BN = Web3.utils.BN;
    
    var amountIn = 0;

    if(req.body.amountIn>=1){
      amountIn  = new BN((req.body.amountIn).toString()).toString();//  
      for (let i = 0; i < tokenDecimal; i++) { 
        amountIn  = new BN(amountIn).muln(10).toString();
      }
    }else{
      amountIn = (req.body.amountIn*(10**tokenDecimal)).toString();
    }
    
    //res.status(400).send({"isBig" : amountIn });

    const approoveABI = await tokenContract.methods.approve(ROUTER_ADDRESS, amountIn).encodeABI();

    const approovetransaction = {
      'from' : admin, 
      'to': tokenAddress, 
      'gas': req.body.gas,
      'gasPrice' : gasPrice,
      'nonce': nonce,
      'data': approoveABI
     };
     
     const approovesignedTx = await web3.eth.accounts.signTransaction(approovetransaction, req.body.privateKey);

      web3.eth.sendSignedTransaction(approovesignedTx.rawTransaction)
     .on('transactionHash', function(hash){
       console.log("transactionHash: ", hash);
       res.status(200).send({"transactionHash" : hash});
     }).on('error', function(error){
      console.log("error: ", error.message);
      res.status(400).send({"error" : error.message});
     });

  }catch(ex){
    res.status(400).send({"error" : ex.message});
  }
});

router.post('/swapTokens',async  (req, res) => { 

  const { error } = validateERC20Tokenswap(req.body); 
  if (error) return res.status(400).send({"error": error.details[0].message});

  try{
    let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;
    const gasPrice = Web3.utils.toWei(req.body.gasPrice.toString(), 'gwei');
    const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const fromContractAddress =  req.body.fromContractAddress;
    const toContractAddress =   req.body.toContractAddress;
    const UniswapV2Router02Contract = await new web3.eth.Contract(uniswapV2router2ABI, ROUTER_ADDRESS);
    const fromContract = await new web3.eth.Contract(erc20ABI, fromContractAddress);
    const toContract = await new web3.eth.Contract(erc20ABI, toContractAddress);
    const account = await web3.eth.accounts.privateKeyToAccount(req.body.privateKey);
    const admin = account.address;
    const nonce = await web3.eth.getTransactionCount(admin, 'latest'); 
    const fromTokenDecimal = await fromContract.methods.decimals().call();
    const toTokenDecimal = await toContract.methods.decimals().call();
    var BN = Web3.utils.BN;
    
    var amountIn = 0;

    if(req.body.amountIn>=1){
      amountIn  = new BN((req.body.amountIn).toString()).toString();//  
      for (let i = 0; i < fromTokenDecimal; i++) { 
        amountIn  = new BN(amountIn).muln(10).toString();
      }
    }else{
      amountIn = (req.body.amountIn*(10**fromTokenDecimal)).toString();
    }

    const amountsOut = await UniswapV2Router02Contract.methods.getAmountsOut(amountIn, [fromContractAddress , toContractAddress]).call();
    const amountOutMin = new BN(amountsOut[1]).muln(req.body.minOutPercentage).divn(100).toString();
    
    var swap = await UniswapV2Router02Contract.methods.swapExactTokensForTokens(
      amountIn, 
      amountOutMin,
      [fromContractAddress, toContractAddress],
      admin,
      Math.floor((Date.now() / 1000)) + 60 * 20
    );
     
    var swapABI = swap.encodeABI()

    const swaptransaction = {
      'from' : admin, 
      'to': ROUTER_ADDRESS, 
      'gas': req.body.gas,
      'gasPrice' : gasPrice,
      'nonce': nonce,
      'data': swapABI
     }; 

     const signedswaptransactionTx = await web3.eth.accounts.signTransaction(swaptransaction, req.body.privateKey);

     web3.eth.sendSignedTransaction(signedswaptransactionTx.rawTransaction)
     .on('transactionHash', function(hash){
       console.log("transactionHash: ", hash);
       res.status(200).send({"transactionHash" : hash});
     }).on('error', function(error){
      console.log("error: ", error.message);  
     });

  }catch(ex){
    res.status(400).send({"error" : ex.message});
  }
}); 

router.post('/SwapEthForTokens',async  (req, res) => {
  try{
    const { error } = validateEthToTokenSwap(req.body); 
    if (error) return res.status(400).send({"error": error.details[0].message});

    let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;
    var BN = Web3.utils.BN;
    const account = await web3.eth.accounts.privateKeyToAccount(req.body.privateKey);
    const admin = account.address;
  
    //The Swap:
    const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const UniswapV2Router02Contract = await new web3.eth.Contract(uniswapV2router2ABI, ROUTER_ADDRESS);
    const tokenContract = await new web3.eth.Contract(erc20ABI, req.body.tokenAddress);
    const tokenDecimal = await tokenContract.methods.decimals().call();
    var amountOutMin = req.body.amountOutMin;
    
    for (let i = 0; i < tokenDecimal; i++) { 
      amountOutMin  = new BN(amountOutMin).muln(10).toString();
    }
    
    const wethAddress = "0xc778417e063141139fce010982780140aa0cd5ab";
    const path = [wethAddress, req.body.tokenAddress];
    const to = admin;
  
    var swap = await UniswapV2Router02Contract.methods.swapExactETHForTokens(
      amountOutMin, // The minimum amount of output tokens that must be received for the transaction not to revert.
      path, // An array of token addresses. path.length must be >= 2. Pools for each consecutive pair of addresses must exist and have liquidity.
      to, // Recipient of the output tokens.
      Math.floor((Date.now() / 1000)) + 60 * 20 //Unix timestamp after which the transaction will revert.
    );
    
    //The Transaction:
  
        var swapABI = swap.encodeABI();
        const gasPrice = Web3.utils.toWei(req.body.gasPrice.toString(), 'gwei');
        const nonce = await web3.eth.getTransactionCount(admin, 'latest'); 
        const value = Web3.utils.toWei(req.body.value.toString(), 'ether');
  
        const swaptransaction = {
          'from' : admin, 
          'to': ROUTER_ADDRESS, 
          'gas': req.body.gas,
          'gasPrice' : gasPrice,
          'nonce': nonce,
          'data': swapABI,
          'value' : value
        }; 
  
       const signedswaptransactionTx = await web3.eth.accounts.signTransaction(swaptransaction, req.body.privateKey);
  
       web3.eth.sendSignedTransaction(signedswaptransactionTx.rawTransaction)
       .on('transactionHash', function(hash){
         console.log("transactionHash: ", hash);
         res.status(200).send({"transactionHash" : hash});
       }).on('error', function(error){
        console.log("error: ", error.message);
        //res.status(400).send({"error1" : error.message});
       });
  }catch(error){
      res.status(400).send({"error": error.message});
  }
     
}); 

router.post('/decodeinputdata',async  (req, res) => { 

    const { error } = validateInputdata(req.body); 
    if (error) return res.status(400).send({"error": error.details[0].message});

    try{
      abi = req.body.abi;
      data = req.body.inputdata;
      abiDecoder.addABI(abi);
  
      const decodedData = abiDecoder.decodeMethod(data);
  
      res.status(200).send(decodedData);
    }catch(error){
      res.status(400).send({"error": error.message});
    }

});

module.exports = router;
