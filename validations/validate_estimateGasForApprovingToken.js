const Joi = require('joi');

function validate_estimateGasForApprovingToken(transaction) {
 
    const schema = Joi.object({
        network: Joi.string().valid("rinkeby", "mainnet").required(),  
        from : Joi.string().max(42).min(42).required(),
        tokenAddress : Joi.string().max(42).min(42).required(),
        amountIn : Joi.number().required()  
    }); 
    
    const validation =  schema.validate(transaction);
  
    return validation;
  }

  exports.validate_estimateGasForApprovingToken = validate_estimateGasForApprovingToken;  
  