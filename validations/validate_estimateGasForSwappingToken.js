const Joi = require('joi');

function validate_estimateGasForSwappingToken(transaction) {
 
    const schema = Joi.object({
        network : Joi.string().valid("rinkeby", "mainnet").required(),
        fromContractAddress :Joi.string().max(42).min(42).required(),
        toContractAddress : Joi.string().max(42).min(42).required(),
        from : Joi.string().max(42).min(42).required(), 
        amountIn : Joi.number().required(),
        minOutPercentage : Joi.number().required()
    }); 
    
    const validation =  schema.validate(transaction);
  
    return validation;
  }

  exports.validate_estimateGasForSwappingToken = validate_estimateGasForSwappingToken;  
  