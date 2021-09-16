const Joi = require('joi');

function validateGetWeth(GetWethReq) {
    const schema = Joi.object({
        network: Joi.string().valid("rinkeby", "mainnet").required(),
        privateKey: Joi.string().max(64).min(64).required(),
        amountIn : Joi.number().required(),
        gas:  Joi.number().required(),
        gasPrice: Joi.number().required(),
    }); 
    
    const validation =  schema.validate(GetWethReq);

    return validation;
  }

exports.validateGetWeth = validateGetWeth;   