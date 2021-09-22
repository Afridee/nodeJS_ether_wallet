const Joi = require('joi');

function validateInputdata(inputData) {
 
    const schema = Joi.object({
        inputdata : Joi.required(),
        abi: Joi.required(),
    }); 
    
    const validation =  schema.validate(inputData);

    return validation;
}  

exports.validateInputdata = validateInputdata;  