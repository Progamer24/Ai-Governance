const encoder = new TextEncoder()
const decoder = new TextDecoder()

function hexToBytes(hex: string): Uint8Array {
	const matches = hex.match(/.{1,2}/g)
	if (!matches) throw new Error('Invalid hex key')
	return new Uint8Array(matches.map((byte) => Number.parseInt(byte, 16)))
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
	const copy = new Uint8Array(bytes)
	return copy.buffer as ArrayBuffer
}

export async function encryptText(plainText: string, hexKey: string): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const key = await crypto.subtle.importKey('raw', toArrayBuffer(hexToBytes(hexKey)), { name: 'AES-GCM' }, false, ['encrypt'])
	const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plainText))
	const payload = new Uint8Array(iv.byteLength + encrypted.byteLength)
	payload.set(iv, 0)
	payload.set(new Uint8Array(encrypted), iv.byteLength)
	return btoa(String.fromCharCode(...payload))
}

export async function decryptText(cipherText: string, hexKey: string): Promise<string> {
	const bytes = Uint8Array.from(atob(cipherText), (char) => char.charCodeAt(0))
	const iv = bytes.slice(0, 12)
	const data = bytes.slice(12)
	const key = await crypto.subtle.importKey('raw', toArrayBuffer(hexToBytes(hexKey)), { name: 'AES-GCM' }, false, ['decrypt'])
	const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
	return decoder.decode(decrypted)
}
