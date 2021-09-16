const Joi = require('joi');

function validateERC20approvalForSwapping(accountCreation) {
    const schema = Joi.object({
        network : Joi.string().valid("rinkeby", "mainnet").required(),
        tokenAddress : Joi.string().max(42).min(42).required(),
        privateKey : Joi.string().max(64).min(64).required(), 
        amountIn : Joi.number().required(),
        gas : Joi.number().required(),
        gasPrice : Joi.number().required()
    }); 
    
    const validation =  schema.validate(accountCreation);

    return validation;
  }

exports.validateERC20approvalForSwapping = validateERC20approvalForSwapping;   