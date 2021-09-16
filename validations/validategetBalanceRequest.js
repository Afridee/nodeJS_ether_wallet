const Joi = require('joi');

function validategetBalanceRequest(account) {
    const schema = Joi.object({
        address: Joi.string().max(42).min(42).required(),
        network: Joi.string().valid("rinkeby", "mainnet").required()
    }); 
    
    const validation =  schema.validate(account);

    return validation;
  }

exports.validategetBalanceRequest = validategetBalanceRequest;   