const Joi = require('joi');

function validate_sendErc20(reqBody) {
 
    const schema = Joi.object({
        network: Joi.string().valid("rinkeby", "mainnet").required(),  
        fromAddress: Joi.string().max(42).min(42).required(),
        toAddress : Joi.string().max(42).min(42).required(),
        ContractAddress : Joi.string().max(42).min(42).required(),
        amountIn : Joi.number().unsafe().required(),
        gas : Joi.number().required(),
        fromAddressPrivateKey : Joi.string().required(),
        gasPrice : Joi.number().required()  
    }); 
    
    const validation =  schema.validate(reqBody);
  
    return validation;
  }

  exports.validate_sendErc20 = validate_sendErc20;  
  