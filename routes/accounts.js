const express = require('express');
const router = express.Router();
const Web3 = require('web3');
const web3_rinkeby = new Web3(process.env.WEB3_WEBSOCKET_RINKEBY);
const web3_mainnet = new Web3(process.env.WEB3_WEBSOCKET_MAINNET);
const {validateEncryptedAccount} = require('../validations/validateEncryptedAccount');
const {validateAccountCreation} = require('../validations/validateAccountCreation');
const {validateTokenRequest} = require('../validations/validateTokenRequest');
const {validategetBalanceRequest} = require('../validations/validategetBalanceRequest');
const {validateAccountImport} = require('../validations/validateAccountImport');
const {erc20ABI} = require('../models/ERC20contractABI');

router.post('/create',(req, res) => {

    const { error } = validateAccountCreation(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let web3 = web3_mainnet;

    try{
        let account = web3.eth.accounts.create();
        account = web3.eth.accounts.encrypt(account.privateKey, req.body.password);
        res.status(200).send(account);
    }catch(ex){
        res.status(500).send('Something failed: ',ex);
    }
});

router.post('/getPrivateKey', (req, res) => {
    
    const { error } = validateEncryptedAccount(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let web3 = web3_mainnet;

    try{
       let account = web3.eth.accounts.decrypt(req.body.account, req.body.password);
       res.status(200).send(account);
    }catch(ex){
       res.status(500).send('Something failed.');
    }
});

router.post('/getBalance',async  (req, res) => {

  const { error } = validategetBalanceRequest(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

    let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;

    web3.eth.getBalance(req.body.address, function(err, result) {
      if (err) {
        //console.log(err);
        res.status(500).send('Something failed.');
      } else {
        //console.log(web3.utils.fromWei(result, "ether") + " ETH");
        res.status(200).send({
           "balance" : web3.utils.fromWei(result, "ether"),
           "format" : "ETH"
        });
      }
    });

});

router.post('/getTokenBalance',async  (req, res) => {

  const { error } = validateTokenRequest(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let web3 = req.body.network == "mainnet" ? web3_mainnet : web3_rinkeby;
  
  try{
    const contract = new web3.eth.Contract(erc20ABI, req.body.tokenAddress);

    const result = await contract.methods.balanceOf(req.body.walletAddress).call(); // 29803630997051883414242659
    const tokenDecimal = await contract.methods.decimals().call();
    const tokenName = await contract.methods.name().call();
    const tokenSymbol = await contract.methods.symbol().call();
    
    const format = web3.utils.fromWei(result); // 29803630.997051883414242659
  
    res.status(200).send({
       "Balance" : format,
       "tokenName" : tokenName,
       "tokenDecimal" : tokenDecimal,
       "tokenSymbol" : tokenSymbol
    });  
  }catch(ex){
    res.status(500).send({
      "error" : ex.message
    });
  }
});

router.post('/importEncryptedAccount',async  (req, res) => {

  const { error } = validateAccountImport(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let web3 = web3_mainnet;

  try{
    account = web3.eth.accounts.encrypt(req.body.privateKey, req.body.password);
    res.status(200).send(account); 
  }catch(ex){
    console.log(ex);
    res.status(500).send({
      "error" : ex.message
    });
  }

});

module.exports = router;