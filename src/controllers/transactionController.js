const Transaction = require('../models/transaction');
const { validateTransaction } = require('../utils/validators');
const { success, error, StatusCodes } = require('../utils/responseUtil');

// 创建交易记录
const create = async (req, res) => {
    try {
        const { error: validationError } = validateTransaction(req.body);
        if (validationError) {
            return error(res, StatusCodes.INVALID_PARAMS, validationError.details[0].message);
        }

        const userId = req.user.id;
        const transactionId = await Transaction.create(userId, req.body);
        const transaction = await Transaction.findById(transactionId, userId);

        return success(res, '交易记录创建成功', transaction);
    } catch (err) {
        console.error('创建交易记录出错:', err);
        return error(res, StatusCodes.SERVER_ERROR, '创建交易记录时发生错误', { error: err.message });
    }
};

// 获取所有交易记录
const getAll = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, category, date_from, date_to, sort_by, sort_order } = req.query;
        
        const filters = {};
        if (type) filters.type = type;
        if (category) filters.category = category;
        if (date_from || date_to) {
            filters.date = {};
            if (date_from) filters.date.from = date_from;
            if (date_to) filters.date.to = date_to;
        }
        
        const transactions = await Transaction.findAll(userId, filters, sort_by, sort_order);
        
        return success(res, '获取交易记录成功', transactions);
    } catch (err) {
        console.error('获取交易记录出错:', err);
        return error(res, StatusCodes.SERVER_ERROR, '获取交易记录时发生错误', { error: err.message });
    }
};

// 获取单个交易记录
const getOne = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;
        
        const transaction = await Transaction.findById(transactionId, userId);
        
        if (!transaction) {
            return error(res, StatusCodes.NOT_FOUND, '交易记录不存在');
        }
        
        return success(res, '获取交易记录成功', transaction);
    } catch (err) {
        console.error('获取交易记录出错:', err);
        return error(res, StatusCodes.SERVER_ERROR, '获取交易记录时发生错误', { error: err.message });
    }
};

// 更新交易记录
const update = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;
        
        // 验证交易记录是否存在
        const existingTransaction = await Transaction.findById(transactionId, userId);
        if (!existingTransaction) {
            return error(res, StatusCodes.NOT_FOUND, '交易记录不存在');
        }
        
        // 验证请求体
        const { error: validationError } = validateTransaction(req.body, true);
        if (validationError) {
            return error(res, StatusCodes.INVALID_PARAMS, validationError.details[0].message);
        }
        
        // 更新交易记录
        await Transaction.update(transactionId, userId, req.body);
        const updatedTransaction = await Transaction.findById(transactionId, userId);
        
        return success(res, '交易记录更新成功', updatedTransaction);
    } catch (err) {
        console.error('更新交易记录出错:', err);
        return error(res, StatusCodes.SERVER_ERROR, '更新交易记录时发生错误', { error: err.message });
    }
};

// 删除交易记录
const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;
        
        // 验证交易记录是否存在
        const existingTransaction = await Transaction.findById(transactionId, userId);
        if (!existingTransaction) {
            return error(res, StatusCodes.NOT_FOUND, '交易记录不存在');
        }
        
        // 删除交易记录
        await Transaction.delete(transactionId, userId);
        
        return success(res, '交易记录删除成功');
    } catch (err) {
        console.error('删除交易记录出错:', err);
        return error(res, StatusCodes.SERVER_ERROR, '删除交易记录时发生错误', { error: err.message });
    }
};

module.exports = {
    create,
    getAll,
    getOne,
    update,
    delete: deleteTransaction
};
