const Joi = require('joi');

// 交易验证
module.exports.validateTransaction = (data, isUpdate = false) => {
    const schema = Joi.object({
        amount: isUpdate ? Joi.number().positive() : Joi.number().positive().required(),
        type: isUpdate ? Joi.string().valid('income', 'expense') : Joi.string().valid('income', 'expense').required(),
        category: isUpdate ? Joi.string() : Joi.string().required(),
        description: Joi.string().allow('', null),
        date: Joi.date().iso().allow(null)
    }).min(1);

    return schema.validate(data);
};
