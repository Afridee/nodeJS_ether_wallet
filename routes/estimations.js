const express = require('express');
const router = express.Router();
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3_alchemy_rinkeby = createAlchemyWeb3(process.env.WEB3_WEBSOCKET_RINKEBY);
const web3_alchemy_mainnet = createAlchemyWeb3(process.env.WEB3_WEBSOCKET_MAINNET);
const Web3 = require('web3');
const web3_rinkeby = new Web3(process.env.WEB3_WEBSOCKET_RINKEBY);
const web3_mainnet = new Web3(process.env.WEB3_WEBSOCKET_MAINNET);
const {validateGasForWeth} = require('../validations/validateGasForWeth'); 
const {validate_estimateGasForSendingEth} = require('../validations/validate_estimateGasForSendingEth'); 
const {validate_estimateGasForApprovingToken} = require('../validations/validate_estimateGasForApprovingToken'); 
const {validate_estimateGasForSwappingToken} = require('../validations/validate_estimateGasForSwappingToken'); 
const {validate_estimateAmountsOut} = require('../validations/validate_estimateAmountsOut'); 
const {validate_estimateGasForSwappingEther} = require('../validations/validate_estimateGasForSwappingEther'); 
const {validate_estimateGasForswappinTokensForEth} = require('../validations/validate_estimateGasForswappinTokensForEth'); 
const {wethABI} = require('../models/wethABI');
const {erc20ABI} = require('../models/ERC20contractABI');
const {uniswapV2router2ABI} = require('../models/uniswapV2router2ABI');


router.post('/estimateGasPrice',  async (req, res) => {

      let web3 = req.body.network=="mainnet" ? web3_alchemy_mainnet : web3_alchemy_rinkeby;
      
      //TODO: determine gas price:
      web3.eth.getGasPrice().then((price) => {
        res.status(200).send({"GasPrice" : price/1000000000});
       });
});
router.post('/estimateGasForgetWethRequest',  async (req, res) => {

    const { error } = validateGasForWeth(req.body)
    if (error) return res.status(400).send({"error": error.details[0].message});

    try{
      let web3 = req.body.network=="mainnet" ? web3_alchemy_mainnet : web3_alchemy_rinkeby;
      WETH_ADDRESS = req.body.network=="mainnet" ?  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" : "0xc778417E063141139Fce010982780140Aa0cD5Ab"
      const wethContract = await new web3.eth.Contract(wethABI, WETH_ADDRESS);
      var amountIn =  Web3.utils.toWei(req.body.amountIn.toString(), 'ether');
      var admin = req.body.address;
      
      var estGas = await wethContract.methods.deposit().estimateGas({from: admin ,value: amountIn});
    
      res.status(200).send({"estimatedGasNeeded" :  estGas});
    }catch(error){
      res.status(400).send({"error" :  error.message});
    }
});
router.post('/estimateGasForSendingEth',  async (req, res) => {

  const { error } = validate_estimateGasForSendingEth(req.body)
  if (error) return res.status(400).send({"error": error.details[0].message});

  try{
    let web3 = req.body.network=="mainnet" ? web3_alchemy_mainnet : web3_alchemy_rinkeby;
    const fromAddress = req.body.fromAddress;
    const toAddress = req.body.toAddress;
    const value = Web3.utils.toWei(req.body.value.toString(), 'ether');
    const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');

    const transaction = {
      'from': fromAddress,
      'to': toAddress, // faucet address to return eth
      'value': value, // in wei
      'nonce': nonce,
      'data' : null
     };  
    
     const estGas = await web3.eth.estimateGas(transaction)
  
     res.status(200).send({"estimatedGasNeeded" :  estGas});
  }catch(error){
    res.status(400).send({"error" :  error.message});
  }
});
router.post('/estimateGasForApprovingToken',  async (req, res) => {

  const { error } = validate_estimateGasForApprovingToken(req.body)
  if (error) return res.status(400).send({"error": error.details[0].message});

  try{
    let web3 = req.body.network=="mainnet" ? web3_alchemy_mainnet : web3_alchemy_rinkeby;
    const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const fromAddress = req.body.from;
    const tokenAddress = req.body.tokenAddress;
    const tokenContract = await new web3.eth.Contract(erc20ABI, tokenAddress);
    const tokenDecimal = await tokenContract.methods.decimals().call();
    const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
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

    const approoveABI = await tokenContract.methods.approve(ROUTER_ADDRESS, amountIn).encodeABI();

    const approovetransaction = {
      'from' : fromAddress, 
      'to': tokenAddress, 
      'nonce': nonce,
      'data': approoveABI
     };

     const estGas = await web3.eth.estimateGas(approovetransaction)
  
     res.status(200).send({"estimatedGasNeeded" :  estGas});
  }catch(error){
    res.status(400).send({"error" :  error.message});
  }
});
router.post('/estimateGasForSwappingToken',  async (req, res) => {

  const { error } = validate_estimateGasForSwappingToken(req.body)
  if (error) return res.status(400).send({"error": error.details[0].message});

  try{
    let web3 = req.body.network=="mainnet" ? web3_alchemy_mainnet : web3_alchemy_rinkeby;
    const admin = req.body.from;
    const fromContractAddress =  req.body.fromContractAddress;
    const fromContract = await new web3.eth.Contract(erc20ABI, fromContractAddress);
    const fromTokenDecimal = await fromContract.methods.decimals().call();
    const toContractAddress =   req.body.toContractAddress;
    const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const UniswapV2Router02Contract = await new web3.eth.Contract(uniswapV2router2ABI, ROUTER_ADDRESS);
    const nonce = await web3.eth.getTransactionCount(admin, 'latest');
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
      'nonce': nonce,
      'data': swapABI
     }; 


     const estGas = await web3.eth.estimateGas(swaptransaction);
  
     res.status(200).send({"estimatedGasNeeded" :  estGas});
  }catch(error){
    res.status(400).send({"error" :  error.message});
  }
});
router.post('/estimateAmountsOut',  async (req, res) => {
    try{
      const { error } = validate_estimateAmountsOut(req.body)
      if (error) return res.status(400).send({"error": error.details[0].message});
    
      let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;
      const BN = Web3.utils.BN;
      const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
      const UniswapV2Router02Contract = await new web3.eth.Contract(uniswapV2router2ABI, ROUTER_ADDRESS);
      const fromContractAddress =  req.body.fromContractAddress;
      const toContractAddress =   req.body.toContractAddress;
      const fromContract = await new web3.eth.Contract(erc20ABI, fromContractAddress);
      const toContract = await new web3.eth.Contract(erc20ABI, toContractAddress);
      const fromTokenDecimal = await fromContract.methods.decimals().call();
      const toTokenDecimal = await toContract.methods.decimals().call();
      const tokenName = await toContract.methods.name().call();
      const tokenSymbol = await toContract.methods.symbol().call();
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
      var amountOutMin = new BN(amountsOut[1]).toString();
    
      
      for (let i = 0; i < toTokenDecimal; i++) { 
        amountOutMin  = new BN(amountOutMin).divn(10).toString();
      }
    
      res.status(200).send({
        "estimatedamountsOut" : amountOutMin,
        "tokenName" : tokenName,
        "tokenSymbol" : tokenSymbol
      });
    }catch(error){
      res.status(400).send(error.message);
    }
});
router.post('/estimateGasForSwappingEther',  async (req, res) => {
  try{
    const { error } = validate_estimateGasForSwappingEther(req.body); 
    if (error) return res.status(400).send({"error": error.details[0].message});

    let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;
    var BN = Web3.utils.BN;
    const admin = req.body.admin;
  
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
        const nonce = await web3.eth.getTransactionCount(admin, 'latest'); 
        const value = Web3.utils.toWei(req.body.value.toString(), 'ether');
  
        const swaptransaction = {
          'from' : admin, 
          'to': ROUTER_ADDRESS, 
          'nonce': nonce,
          'data': swapABI,
          'value' : value
        }; 
  
        const estGas = await web3.eth.estimateGas(swaptransaction);
  
        res.status(200).send({"estimatedGasNeeded" :  estGas});
  }catch(error){
      res.status(400).send({"error": error.message});
  }
   
});
router.post('/estimateGasForswappinTokensForEth',async  (req, res) => {
  
  const { error } = validate_estimateGasForswappinTokensForEth(req.body); 
  if (error) return res.status(400).send({"error": error.details[0].message});

  try{
    let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;
    const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const fromContractAddress =  req.body.fromContractAddress;
    const toContractAddress =   "0xc778417e063141139fce010982780140aa0cd5ab";
    const UniswapV2Router02Contract = await new web3.eth.Contract(uniswapV2router2ABI, ROUTER_ADDRESS);
    const fromContract = await new web3.eth.Contract(erc20ABI, fromContractAddress);
    const admin = req.body.address;
    const nonce = await web3.eth.getTransactionCount(admin, 'latest'); 
    const fromTokenDecimal = await fromContract.methods.decimals().call();
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
    
    var swap = await UniswapV2Router02Contract.methods.swapExactTokensForETH(
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
      'nonce': nonce,
      'data': swapABI
     }; 


     const estGas = await web3.eth.estimateGas(swaptransaction);
  
     res.status(200).send({"estimatedGasNeeded" :  estGas});

  }catch(ex){
    res.status(400).send({"error" : ex.message});
  }
}); 
module.exports = router;