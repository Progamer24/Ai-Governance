import { useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'

export default function EncryptionSettings() {
  const [algorithm, setAlgorithm] = useState('AES-256-GCM')
  const [lastRotation, setLastRotation] = useState(new Date().toISOString())

  const rotateKey = () => {
    setLastRotation(new Date().toISOString())
  }

  return (
    <Card title="Encryption Settings">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="info">Active: {algorithm}</Badge>
          <span className="text-xs text-white/50">Last key rotation: {new Date(lastRotation).toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/50">Cipher</label>
            <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
              <option value="AES-256-GCM">AES-256-GCM</option>
              <option value="XChaCha20-Poly1305">XChaCha20-Poly1305</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="primary" onClick={rotateKey}>Rotate Key Metadata</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
