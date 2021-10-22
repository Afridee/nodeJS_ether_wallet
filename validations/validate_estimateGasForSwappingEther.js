const Joi = require('joi');

function validate_estimateGasForSwappingEther(reqBod) {
    const schema = Joi.object({
        network : Joi.string().valid("rinkeby", "mainnet").required(),
        amountOutMin : Joi.number().required(),
        tokenAddress : Joi.string().max(42).min(42).required(),
        admin : Joi.string().max(42).min(42).required(),
        value : Joi.number().required()
    }); 
    
    const validation =  schema.validate(reqBod);

    return validation;
  }

exports.validate_estimateGasForSwappingEther = validate_estimateGasForSwappingEther;   

