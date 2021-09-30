const Joi = require('joi');

function validate_estimateAmountsOut(transaction) {
 
    const schema = Joi.object({
        network: Joi.string().valid("rinkeby", "mainnet").required(),  
        fromContractAddress : Joi.string().max(42).min(42).required(),
        toContractAddress : Joi.string().max(42).min(42).required(),
        amountIn : Joi.number().required()
    }); 
    
    const validation =  schema.validate(transaction);
  
    return validation;
  }

  exports.validate_estimateAmountsOut = validate_estimateAmountsOut;  
  