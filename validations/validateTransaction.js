const Joi = require('joi');

function validateTransaction(account) {
 
    const schema = Joi.object({
        network: Joi.string().valid("rinkeby", "mainnet").required(),  
        fromAddress: Joi.string().max(42).min(42).required(),
        toAddress : Joi.string().max(42).min(42).required(),
        value : Joi.number().unsafe().required(),
        gas : Joi.number().required(),
        fromAddressPrivateKey : Joi.string().required(),
        gasPrice : Joi.number().required()  
    }); 
    
    const validation =  schema.validate(account);
  
    return validation;
  }

  exports.validateTransaction = validateTransaction;  
  