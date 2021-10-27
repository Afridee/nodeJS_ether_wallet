const Joi = require('joi');

function validate_estimateGasForswappinTokensForEth(reqBod) {
    const schema = Joi.object({
        address: Joi.string().max(42).min(42).required(),
        network : Joi.string().valid("rinkeby", "mainnet").required(),
        fromContractAddress : Joi.string().max(42).min(42).required(),
        amountIn : Joi.number().required(),
        minOutPercentage: Joi.number().max(100).min(0).required(),
    }); 
    
    const validation =  schema.validate(reqBod);

    return validation;
  }

exports.validate_estimateGasForswappinTokensForEth = validate_estimateGasForswappinTokensForEth;   