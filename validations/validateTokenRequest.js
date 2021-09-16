const Joi = require('joi');

function validateTokenRequest(tokenAndAddress) {
 
    const schema = Joi.object({
        tokenAddress : Joi.string().max(42).min(42).required(),
        walletAddress: Joi.string().max(42).min(42).required(),
        network: Joi.string().valid("rinkeby", "mainnet").required()
    }); 
    
    const validation =  schema.validate(tokenAndAddress);

    return validation;
}  

exports.validateTokenRequest = validateTokenRequest;  