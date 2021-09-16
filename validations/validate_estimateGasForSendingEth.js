const Joi = require('joi');

function validate_estimateGasForSendingEth(transaction) {
 
    const schema = Joi.object({
        network: Joi.string().valid("rinkeby", "mainnet").required(),  
        fromAddress : Joi.string().max(42).min(42).required(),
        toAddress : Joi.string().max(42).min(42).required(),
        value : Joi.number().required()  
    }); 
    
    const validation =  schema.validate(transaction);
  
    return validation;
  }

  exports.validate_estimateGasForSendingEth = validate_estimateGasForSendingEth;  
  