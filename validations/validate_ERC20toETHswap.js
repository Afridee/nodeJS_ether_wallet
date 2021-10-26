const Joi = require('joi');

function validate_ERC20toETHswap(reqBod) {
    const schema = Joi.object({
        network : Joi.string().valid("rinkeby", "mainnet").required(),
        fromContractAddress : Joi.string().max(42).min(42).required(),
        privateKey : Joi.string().max(64).min(64).required(), 
        amountIn : Joi.number().required(),
        gas : Joi.number().required(),
        gasPrice : Joi.number().required(),
        minOutPercentage: Joi.number().max(100).min(0).required(),
    }); 
    
    const validation =  schema.validate(reqBod);

    return validation;
  }

exports.validate_ERC20toETHswap = validate_ERC20toETHswap;   