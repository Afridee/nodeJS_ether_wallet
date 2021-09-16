const Joi = require('joi');

function validateAccountImport(importedAccount) {
    const schema = Joi.object({
      password: Joi.string().required(),
      privateKey: Joi.string().max(64).min(64).required()
    }); 
    
    const validation =  schema.validate(importedAccount);

    return validation;
  }

exports.validateAccountImport = validateAccountImport;   