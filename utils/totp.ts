import * as CryptoJS from "crypto-js"

export class TOTP {
  private static readonly DIGITS: number = 6
  private static readonly PERIOD: number = 30

  /**
   * Generate a TOTP code from a secret key
   * @param secret Base32 encoded secret key
   * @returns TOTP code
   */
  public static generateTOTP(secret: string): string {
    const epoch = Math.floor(Date.now() / 1000)
    const timeCounter = Math.floor(epoch / this.PERIOD)
    return this.generateTOTPAtCounter(secret, timeCounter)
  }

  /**
   * Validate if a secret key is in valid Base32 format
   * @param secret The secret key to validate
   * @returns boolean indicating if the secret is valid
   */
  public static isValidSecret(secret: string): boolean {
    const base32Regex = /^[A-Z2-7]+=*$/
    return base32Regex.test(secret.toUpperCase())
  }

  /**
   * Generate TOTP at a specific counter value
   * @param secret Base32 encoded secret key
   * @param counter Time counter
   * @returns TOTP code
   */
  private static generateTOTPAtCounter(
    secret: string,
    counter: number
  ): string {
    const decodedSecret = this.base32ToHex(secret)
    const timeHex = this.leftPad(counter.toString(16), 16)

    // Convert hex to WordArray for crypto-js
    const key = CryptoJS.enc.Hex.parse(decodedSecret)
    const message = CryptoJS.enc.Hex.parse(timeHex)

    // Calculate HMAC-SHA1
    const hmac = CryptoJS.HmacSHA1(message, key)
    const hmacResult = hmac.toString()

    const offset = parseInt(hmacResult.slice(-1), 16)
    const code = parseInt(hmacResult.substr(offset * 2, 8), 16) & 0x7fffffff

    return this.leftPad(
      (code % Math.pow(10, this.DIGITS)).toString(),
      this.DIGITS
    )
  }

  /**
   * Convert Base32 string to hexadecimal
   * @param base32 Base32 encoded string
   * @returns Hexadecimal string
   */
  private static base32ToHex(base32: string): string {
    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    let bits = ""
    const hex = []

    base32 = base32.toUpperCase().replace(/=+$/, "")

    for (let i = 0; i < base32.length; i++) {
      const val = base32Chars.indexOf(base32.charAt(i))
      if (val === -1) throw new Error("Invalid base32 character")
      bits += this.leftPad(val.toString(2), 5)
    }

    for (let i = 0; i + 8 <= bits.length; i += 8) {
      const chunk = bits.substr(i, 8)
      hex.push(parseInt(chunk, 2).toString(16).padStart(2, "0"))
    }

    return hex.join("")
  }

  /**
   * Left pad a string with zeros
   * @param str String to pad
   * @param len Desired length
   * @returns Padded string
   */
  private static leftPad(str: string, len: number): string {
    return str.padStart(len, "0")
  }

  /**
   * Verify if the input code is valid for the given secret
   * @param secret Base32 encoded secret key
   * @param inputCode The code entered by the user
   * @returns boolean indicating if the code is valid
   */
  public static verifyTOTP(secret: string, inputCode: string): boolean {
    const currentTOTP = this.generateTOTP(secret)
    return currentTOTP === inputCode
  }
}
