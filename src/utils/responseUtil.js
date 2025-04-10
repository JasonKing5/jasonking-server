/**
 * 统一响应格式工具
 * 用于标准化所有API响应的格式
 */
const { StatusCodes, StatusMessages } = require('../constants/statusCodes');

/**
 * 生成统一格式的API响应
 * @param {Object} res - Express响应对象
 * @param {Number} code - 业务状态码: 参考 ../constants/statusCodes.js
 * @param {String} message - 响应消息，如果不提供则使用状态码对应的默认消息
 * @param {*} data - 响应数据，默认为null
 * @returns {Object} 格式化的响应对象
 */
const response = (res, code, message, data = null) => {
  // 如果没有提供消息，则使用状态码对应的默认消息
  if (!message && StatusMessages[code]) {
    message = StatusMessages[code];
  }
  
  // 始终返回HTTP 200 OK，通过data.code区分业务状态
  return res.status(200).json({
    code,
    message,
    data
  });
};

/**
 * 生成成功响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 成功消息
 * @param {*} data - 响应数据
 * @returns {Object} 格式化的成功响应
 */
const success = (res, message, data = null) => {
  return response(res, StatusCodes.SUCCESS, message, data);
};

/**
 * 生成错误响应
 * @param {Object} res - Express响应对象
 * @param {Number} code - 错误状态码
 * @param {String} message - 错误消息
 * @param {*} data - 错误数据
 * @returns {Object} 格式化的错误响应
 */
const error = (res, code, message, data = null) => {
  // 如果未指定错误码，默认使用服务器错误
  const errorCode = code || StatusCodes.SERVER_ERROR;
  return response(res, errorCode, message, data);
};

module.exports = {
  response,
  success,
  error,
  StatusCodes // 导出状态码，便于控制器直接使用
};
