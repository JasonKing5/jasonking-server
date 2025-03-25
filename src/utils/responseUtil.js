/**
 * 统一响应格式工具
 * 用于标准化所有API响应的格式
 */

/**
 * 生成统一格式的API响应
 * @param {Object} res - Express响应对象
 * @param {Number} code - 状态码
 * @param {String} message - 响应消息
 * @param {*} data - 响应数据，默认为null
 * @returns {Object} 格式化的响应对象
 */
const response = (res, code, message, data = null) => {
  return res.status(Math.floor(code / 100) * 100).json({
    code,
    message,
    data
  });
};

module.exports = {
  response
};
