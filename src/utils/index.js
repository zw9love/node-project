const uuidv1 = require('uuid/v1');
const crypto = require('crypto');  //加载加密文件
const nodemailer = require('nodemailer')
const key = 'zengwei'

function getJson(code, message, data) {
  return {
    code: code || 200,
    message: message || '',
    data: data || {}
  }
}

/**
 * @description 获得随机字符串
 * @returns {string} 返回随机字符串
 */
function getRandomString() {
  return uuidv1()
}

/**
 * @description md5加密
 * @param str 需要加密数据
 * @returns {string} 返回加密字符串
 */

function aesEncrypt(str) {
  const cipher = crypto.createCipher('aes192', key);
  var crypted = cipher.update(str, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
  // var md5 = crypto.createHash('md5', key);
  // md5.update(str);
  // str = md5.digest('hex');
  // return str;
}

/**
 * @description md5解密
 * @param data 需要解密md5数据
 * @returns {string} 返回解密字符串
 */
function aesDecrypt(md5) {
  const decipher = crypto.createDecipher('aes192', key);
  var decrypted = decipher.update(md5, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted
}

/**
 * @description 时间补0
 * @param val 需要补0的字符串
 * @returns {string} 返回补0后的字符串
 */
function getDouble(val) {
  val = val + ''
  return val.length > 1 ? val : `0${val}`
}

/**
 * @description 获取当前时间
 * @returns {string} 返回获取当前时间格式化字符串
 */
function getTime() {
  let dateObj = new Date()
  let year = dateObj.getFullYear()
  let month = getDouble(dateObj.getMonth() + 1)
  let date = getDouble(dateObj.getDate())
  let hour = getDouble(dateObj.getHours())
  let minute = getDouble(dateObj.getMinutes())
  let second = getDouble(dateObj.getSeconds())
  return `${year}-${month}-${date} ${hour}:${minute}:${second}`
}

/**
 * @description 发送邮件
 * @param data
 * @returns {null}
 */
function sendMail({recipient, title, html, text, files, name}) {
  const configQQ = {
    // service: config.email.service,
    host: 'smtp.qq.com', // qq
    secureConnection: true, // ssl连接
    port: 465, //smtp的端口
    secure: true, // smtp的端口必须安全
    auth: {
      user: '823334587@qq.com', // 823334587@qq.com
      pass: 'yxvhhhnmhhnebdgf' // yxvhhhnmhhnebdgf
    }
  }

  const config163 = {
    // service: config.email.service,
    host: 'smtp.163.com', // 163
    secureConnection: true, // ssl连接
    port: 465, //smtp的端口
    secure: true, // smtp的端口必须安全
    auth: {
      user: '18514075699@163.com', // 823334587@qq.com
      pass: 'dhsqj1992' // yxvhhhnmhhnebdgf
    }
  }

  const transport = nodemailer.createTransport(configQQ)

  let mailOption = {
    from: `${name}<${configQQ.auth.user}>`, // i am weiwei作为发送者名字
    to: recipient, // 多个接受者用逗号,隔开
    subject: title, // 标题
    text: text, // 内容
    html: html,
    attachments: files
  }
  transport.sendMail(mailOption, (error, response) => {
    if (error) {
      console.log('失败')
      transport.close()
      return console.log(error);
    }
    console.log('成功')
    // console.log(response)
    transport.close()
  })

}

module.exports = {
  getJson,
  getRandomString,
  aesEncrypt,
  aesDecrypt,
  sendMail,
  getTime
}
