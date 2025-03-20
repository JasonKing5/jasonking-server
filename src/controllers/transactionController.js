const Transaction = require('../models/transaction');
const { validateTransaction } = require('../utils/validators');

// 创建交易记录
const create = async (req, res) => {
    try {
        const { error } = validateTransaction(req.body);
        if (error) {
            return res.status(400).json({
                code: 400,
                message: error.details[0].message,
                data: null
            });
        }

        const userId = req.user.id;
        const transactionId = await Transaction.create(userId, req.body);
        const transaction = await Transaction.findById(transactionId, userId);

        res.status(201).json({
            code: 201,
            message: 'Transaction created successfully',
            data: transaction
        });
    } catch (err) {
        console.error('Error creating transaction:', err);
        res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

// 获取用户所有交易记录
const getAll = async (req, res) => {
    try {
        const transactions = await Transaction.findAll(req.user.id);
        res.json({
            code: 200,
            message: 'Transactions retrieved successfully',
            data: transactions
        });
    } catch (err) {
        console.error('Error retrieving transactions:', err);
        res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

// 获取特定交易记录
const getOne = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id, req.user.id);
        if (!transaction) {
            return res.status(404).json({
                code: 404,
                message: 'Transaction not found',
                data: null
            });
        }

        res.json({
            code: 200,
            message: 'Transaction retrieved successfully',
            data: transaction
        });
    } catch (err) {
        console.error('Error retrieving transaction:', err);
        res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

// 更新交易记录
const update = async (req, res) => {
    try {
        const { error } = validateTransaction(req.body, true);
        if (error) {
            return res.status(400).json({
                code: 400,
                message: error.details[0].message,
                data: null
            });
        }

        const updated = await Transaction.update(req.params.id, req.user.id, req.body);
        if (!updated) {
            return res.status(404).json({
                code: 404,
                message: 'Transaction not found',
                data: null
            });
        }

        const transaction = await Transaction.findById(req.params.id, req.user.id);
        res.json({
            code: 200,
            message: 'Transaction updated successfully',
            data: transaction
        });
    } catch (err) {
        console.error('Error updating transaction:', err);
        res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

// 删除交易记录
const deleteTransaction = async (req, res) => {
    try {
        const deleted = await Transaction.delete(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({
                code: 404,
                message: 'Transaction not found',
                data: null
            });
        }

        res.json({
            code: 200,
            message: 'Transaction deleted successfully',
            data: null
        });
    } catch (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

module.exports = {
    create,
    getAll,
    getOne,
    update,
    delete: deleteTransaction
};
