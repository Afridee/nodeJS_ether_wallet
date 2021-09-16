const Joi = require('joi');

function validateGasForWeth(amount) {
    const schema = Joi.object({
        network: Joi.string().valid("rinkeby", "mainnet").required(),
        address: Joi.string().max(42).min(42).required(),
        amountIn : Joi.number().required()
    }); 
    
    const validation =  schema.validate(amount);

    return validation;
  }

exports.validateGasForWeth = validateGasForWeth;   