import jsSHA from "jssha"

// TOTP 配置
export const generateTOTP = (secret, timeStep = 30, digits = 6) => {
  // 计算时间步长
  const epoch = Math.floor(new Date().getTime() / 1000)
  const time = Math.floor(epoch / timeStep)

  // 将时间步长转换为 8 字节的字符串
  const timeHex = time.toString(16).padStart(16, "0")

  // 使用 jsSHA 进行 HMAC-SHA-1 运算
  const shaObj = new jsSHA("SHA-1", "HEX")
  shaObj.setHMACKey(secret, "HEX")
  shaObj.update(timeHex)
  const hmac = shaObj.getHMAC("HEX")

  // 提取动态码
  const offset = parseInt(hmac.substring(hmac.length - 1), 16)
  const binary = (
    parseInt(hmac.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff
  ).toString()

  // 截取指定位数的动态码
  const otp = binary.substr(binary.length - digits, digits)

  return otp
}

// 验证 TOTP
export const verifyTOTP = (
  token,
  secret,
  timeStep = 30,
  digits = 6,
  window = 1
) => {
  const epoch = Math.floor(new Date().getTime() / 1000)
  const time = Math.floor(epoch / timeStep)

  for (let i = -window; i <= window; i++) {
    const currentTime = time + i
    const timeHex = currentTime.toString(16).padStart(16, "0")

    const shaObj = new jsSHA("SHA-1", "HEX")
    shaObj.setHMACKey(secret, "HEX")
    shaObj.update(timeHex)
    const hmac = shaObj.getHMAC("HEX")

    const offset = parseInt(hmac.substring(hmac.length - 1), 16)
    const binary = (
      parseInt(hmac.substring(offset * 2, offset * 2 + 8), 16) & 0x7fffffff
    ).toString()

    const otp = binary.substr(binary.length - digits, digits)

    if (otp === token) {
      return true // 验证成功
    }
  }

  return false // 验证失败
}
