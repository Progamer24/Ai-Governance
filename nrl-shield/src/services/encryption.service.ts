import { encryptText, decryptText } from '../utils/encryption.utils'

export { encryptText, decryptText }

function getKey(): string {
const key = import.meta.env.VITE_ENCRYPTION_KEY as string | undefined
if (!key) throw new Error('VITE_ENCRYPTION_KEY is not set')
return key
}

export async function encrypt(data: string): Promise<string> {
return encryptText(data, getKey())
}

export async function decrypt(ciphertext: string): Promise<string> {
return decryptText(ciphertext, getKey())
}
