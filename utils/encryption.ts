import * as CryptoJS from "crypto-js"

export interface EncryptionInterface {
  getEncryptedString(data: string): string
  decryptSecretString(secret: string): string | null
  decryptEncSecret(entry: any): any | null
  getEncryptionStatus(): boolean
  updateEncryptionPassword(password: string): void
  setEncryptionKeyId(id: string): void
  getEncryptionKeyId(): string
}

export class Encryption implements EncryptionInterface {
  private password: string
  private keyId: string

  constructor(hash: string, keyId: string) {
    this.password = hash
    this.keyId = keyId
  }

  getEncryptedString(data: string): string {
    if (!this.password) {
      return data
    }
    return CryptoJS.AES.encrypt(data, this.password).toString()
  }

  decryptSecretString(secret: string): string | null {
    try {
      if (!this.password) {
        return secret
      }

      const decryptedSecret = CryptoJS.AES.decrypt(
        secret,
        this.password
      ).toString(CryptoJS.enc.Utf8)

      if (!decryptedSecret) {
        return null
      }

      if (decryptedSecret.length < 8) {
        return null
      }

      // Validate secret format
      if (
        !/^[A-Z2-7]+=*$/i.test(decryptedSecret) && // Base32 format
        !/^[0-9a-f]+$/i.test(decryptedSecret) && // Hex format
        !/^blz-/.test(decryptedSecret) && // Blizzard format
        !/^bliz-/.test(decryptedSecret) && // Alternative Blizzard format
        !/^stm-/.test(decryptedSecret) // Steam format
      ) {
        return null
      }

      return decryptedSecret
    } catch (error) {
      return null
    }
  }

  decryptEncSecret(entry: any): any | null {
    try {
      if (!entry.encData || !this.password) {
        return null
      }

      const decryptedData = CryptoJS.AES.decrypt(
        entry.encData,
        this.password
      ).toString(CryptoJS.enc.Utf8)

      if (!decryptedData) {
        return null
      }

      return JSON.parse(decryptedData)
    } catch (error) {
      return null
    }
  }

  getEncryptionStatus(): boolean {
    return Boolean(this.password)
  }

  updateEncryptionPassword(password: string): void {
    this.password = password
  }

  setEncryptionKeyId(id: string): void {
    this.keyId = id
  }

  getEncryptionKeyId(): string {
    return this.keyId
  }
}
