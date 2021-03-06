

const Joi = require('joi');

function validateEthToTokenSwap(reqBod) {
    const schema = Joi.object({
        network : Joi.string().valid("rinkeby", "mainnet").required(),
        amountOutMin : Joi.number().required(),
        tokenAddress : Joi.string().max(42).min(42).required(),
        privateKey : Joi.string().max(64).min(64).required(),
        gas : Joi.number().required(),
        gasPrice : Joi.number().required(),
        value : Joi.number().required()
    }); 
    
    const validation =  schema.validate(reqBod);

    return validation;
  }

exports.validateEthToTokenSwap = validateEthToTokenSwap;   

