const Joi = require('joi');

function validateAccountCreation(accountCreation) {
    const schema = Joi.object({
      password: Joi.string().required()
    }); 
    
    const validation =  schema.validate(accountCreation);

    return validation;
  }

exports.validateAccountCreation = validateAccountCreation;   