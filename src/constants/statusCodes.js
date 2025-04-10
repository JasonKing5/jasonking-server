/**
 * 业务状态码常量定义
 * 
 * 状态码规则：
 * - 0: 成功
 * - 1xxx: 客户端错误
 * - 2xxx: 认证/授权错误
 * - 3xxx: 数据/业务逻辑错误
 * - 5xxx: 服务器错误
 */

const StatusCodes = {
  // 成功状态码
  SUCCESS: 0,                    // 操作成功

  // 客户端错误 (1xxx)
  INVALID_PARAMS: 1001,          // 参数校验失败
  NOT_LOGGED_IN: 1002,           // 未登录/凭据无效
  NO_PERMISSION: 1003,           // 无权限
  NOT_FOUND: 1004,               // 资源不存在
  INVALID_REQUEST: 1005,         // 无效的请求
  
  // 认证/授权错误 (2xxx)
  TOKEN_EXPIRED: 2001,           // token过期
  TOKEN_INVALID: 2002,           // token无效
  ACCOUNT_DISABLED: 2003,        // 账号被禁用
  
  // 数据/业务逻辑错误 (3xxx)
  DATA_CONFLICT: 3001,           // 数据冲突(如用户名已注册)
  OPERATION_FAILED: 3002,        // 操作执行失败
  BUSINESS_ERROR: 3003,          // 通用业务错误
  DATA_INTEGRITY_ERROR: 3004,    // 数据完整性错误
  
  // 服务器错误 (5xxx)
  SERVER_ERROR: 5000,            // 服务器内部错误
  DATABASE_ERROR: 5001,          // 数据库错误
  EXTERNAL_SERVICE_ERROR: 5002,  // 外部服务错误
};

// 状态码对应的默认消息
const StatusMessages = {
  [StatusCodes.SUCCESS]: '操作成功',
  [StatusCodes.INVALID_PARAMS]: '参数无效',
  [StatusCodes.NOT_LOGGED_IN]: '未登录或登录已过期',
  [StatusCodes.NO_PERMISSION]: '没有操作权限',
  [StatusCodes.NOT_FOUND]: '请求的资源不存在',
  [StatusCodes.INVALID_REQUEST]: '无效的请求',
  
  [StatusCodes.TOKEN_EXPIRED]: '令牌已过期',
  [StatusCodes.TOKEN_INVALID]: '无效的令牌',
  [StatusCodes.ACCOUNT_DISABLED]: '账号已被禁用',
  
  [StatusCodes.DATA_CONFLICT]: '数据冲突',
  [StatusCodes.OPERATION_FAILED]: '操作执行失败',
  [StatusCodes.BUSINESS_ERROR]: '业务处理错误',
  [StatusCodes.DATA_INTEGRITY_ERROR]: '数据完整性错误',
  
  [StatusCodes.SERVER_ERROR]: '服务器内部错误',
  [StatusCodes.DATABASE_ERROR]: '数据库错误',
  [StatusCodes.EXTERNAL_SERVICE_ERROR]: '外部服务错误',
};

module.exports = {
  StatusCodes,
  StatusMessages
};
