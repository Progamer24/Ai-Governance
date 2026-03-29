import { useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

export default function SecuritySettings() {
  const [sessionMinutes, setSessionMinutes] = useState(30)
  const [maxQueriesPerHour, setMaxQueriesPerHour] = useState(100)
  const [blockThreshold, setBlockThreshold] = useState(75)

  return (
    <Card title="Security Settings">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs text-white/50">Session Timeout (minutes)</label>
          <input type="number" min={5} max={240} value={sessionMinutes} onChange={(e) => setSessionMinutes(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Max Queries / Hour</label>
          <input type="number" min={1} max={1000} value={maxQueriesPerHour} onChange={(e) => setMaxQueriesPerHour(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Risk Block Threshold</label>
          <input type="number" min={1} max={100} value={blockThreshold} onChange={(e) => setBlockThreshold(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        </div>
      </div>

      <div className="mt-4">
        <Button variant="primary">Apply Security Controls</Button>
      </div>
    </Card>
  )
}
