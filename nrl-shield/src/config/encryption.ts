const ivLength = Number(import.meta.env.ENCRYPTION_IV_LENGTH ?? 12)

export const encryptionConfig = {
	algorithm: 'AES-GCM',
	ivLength,
} as const
