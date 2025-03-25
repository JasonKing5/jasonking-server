/**
 * 格式化工具
 * 提供日期、时间和JSON配置的格式化与解析功能
 */

/**
 * 格式化日期为 MySQL date 格式 (YYYY-MM-DD)
 * @param {Date|String} date - 日期对象或日期字符串
 * @returns {String|null} MySQL格式的日期字符串或null
 */
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') {
    // 将 ISO 字符串转换为 Date 对象
    date = new Date(date);
  }
  
  // 格式化为 MySQL date 格式: YYYY-MM-DD
  return date.toISOString().slice(0, 10);
};

/**
 * 格式化日期时间为 MySQL datetime 格式 (YYYY-MM-DD HH:MM:SS)
 * @param {Date|String} datetime - 日期时间对象或日期时间字符串
 * @returns {String|null} MySQL格式的日期时间字符串或null
 */
const formatDateTime = (datetime) => {
  if (!datetime) return null;
  if (typeof datetime === 'string') {
    // 将 ISO 字符串转换为 Date 对象
    datetime = new Date(datetime);
  }
  
  // 格式化为 MySQL datetime 格式: YYYY-MM-DD HH:MM:SS
  return datetime.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * 格式化时间为 MySQL time 格式 (HH:MM:SS)
 * @param {String} time - 时间字符串
 * @returns {String|null} MySQL格式的时间字符串或null
 */
const formatTime = (time) => {
  if (!time) return null;
  return time;
};

/**
 * 格式化 JSON 配置为字符串
 * @param {Object} config - JSON配置对象
 * @returns {String|null} JSON字符串或null
 */
const formatConfig = (config) => {
  if (!config) return null;
  return JSON.stringify(config);
};

/**
 * 解析 JSON 配置字符串为对象
 * @param {String} jsonConfig - JSON配置字符串
 * @returns {Object|null} 解析后的对象或null
 */
const parseConfig = (jsonConfig) => {
  if (!jsonConfig) return null;
  try {
    return JSON.parse(jsonConfig);
  } catch (error) {
    console.error('Error parsing JSON config:', error);
    return null;
  }
};

module.exports = {
  formatDate,
  formatDateTime,
  formatTime,
  formatConfig,
  parseConfig
};
