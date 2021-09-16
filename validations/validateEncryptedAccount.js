const Joi = require('joi');

function validateEncryptedAccount(account) {
 
    const schema = Joi.object({
        account : Joi.object().required(),
        password: Joi.string().required()
    }); 
    
    const validation =  schema.validate(account);

    return validation;
}  

exports.validateEncryptedAccount = validateEncryptedAccount;  