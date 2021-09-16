const Joi = require('joi');

function validateTransactionHash(hash) {
 
    const schema = Joi.object({
      network: Joi.string().valid("rinkeby", "mainnet").required(),
      trasactionHash: Joi.string().regex(/^0x([A-Fa-f0-9]{64})$/).required(),
    }); 
    
    const validation =  schema.validate(hash);
  
    return validation;
  } 

  exports.validateTransactionHash = validateTransactionHash;   