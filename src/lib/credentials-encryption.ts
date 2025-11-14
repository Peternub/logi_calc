// Сервис для шифрования и дешифрования API ключей
import crypto from 'crypto'

const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!'

interface EncryptedData {
  encryptedData: string
  iv: string
  authTag: string
}

export class CredentialsEncryption {
  private key: Buffer

  constructor() {
    // Убеждаемся, что ключ имеет правильную длину
    this.key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  }

  // Шифрование данных
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, this.key)
    cipher.setAAD(Buffer.from('marketplace-api', 'utf8'))

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  // Дешифрование данных
  decrypt(encryptedObj: EncryptedData): string {
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, this.key)
    decipher.setAAD(Buffer.from('marketplace-api', 'utf8'))
    decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'))

    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // Шифрование объекта с credentials
  encryptCredentials(credentials: Record<string, string>): string {
    const jsonString = JSON.stringify(credentials)
    const encrypted = this.encrypt(jsonString)
    return JSON.stringify(encrypted)
  }

  // Дешифрование объекта с credentials
  decryptCredentials(encryptedString: string): Record<string, string> {
    try {
      const encryptedObj = JSON.parse(encryptedString) as EncryptedData
      const decrypted = this.decrypt(encryptedObj)
      return JSON.parse(decrypted)
    } catch (error) {
      console.error('Credentials decryption error:', error)
      return {}
    }
  }

  // Валидация зашифрованных данных
  isValidEncrypted(encryptedString: string): boolean {
    try {
      const parsed = JSON.parse(encryptedString)
      return parsed.encryptedData && parsed.iv && parsed.authTag
    } catch {
      return false
    }
  }
}

export const credentialsEncryption = new CredentialsEncryption()

// Хелперы для работы с различными маркетплейсами
export const CredentialsHelpers = {
  // Валидация Ozon credentials
  validateOzonCredentials: (credentials: Record<string, string>): boolean => {
    return !!(
      credentials.clientId && 
      credentials.apiKey && 
      credentials.clientId.length > 0 && 
      credentials.apiKey.length > 30 // Минимальная длина API ключа Ozon
    )
  },

  // Валидация Wildberries credentials
  validateWildberriesCredentials: (credentials: Record<string, string>): boolean => {
    return !!(
      credentials.apiKey && 
      credentials.apiKey.startsWith('eyJ') && // JWT токен
      credentials.apiKey.length > 100
    )
  },

  // Валидация Яндекс.Маркет credentials
  validateYandexMarketCredentials: (credentials: Record<string, string>): boolean => {
    return !!(
      credentials.clientId && 
      credentials.token && 
      credentials.campaignId
    )
  },

  // Маскирование credentials для отображения
  maskCredentials: (credentials: Record<string, string>): Record<string, string> => {
    const masked: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(credentials)) {
      if (value && value.length > 8) {
        masked[key] = value.slice(0, 4) + '***' + value.slice(-4)
      } else if (value) {
        masked[key] = '***'
      } else {
        masked[key] = ''
      }
    }
    
    return masked
  }
}