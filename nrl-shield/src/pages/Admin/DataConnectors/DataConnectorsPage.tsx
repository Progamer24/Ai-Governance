import { useMemo, useState } from 'react'
import { Cloud, Database, FileText, Link as LinkIcon, UploadCloud } from 'lucide-react'
import PageWrapper from '../../../components/layout/PageWrapper'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'

type ConnectorStatus = 'CONNECTED' | 'NOT_CONNECTED'

interface Connector {
  id: string
  name: string
  type: 'Cloud Drive' | 'Database' | 'Knowledge Base'
  status: ConnectorStatus
  lastSync: string | null
}

const INITIAL_CONNECTORS: Connector[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    type: 'Cloud Drive',
    status: 'NOT_CONNECTED',
    lastSync: null,
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    type: 'Cloud Drive',
    status: 'NOT_CONNECTED',
    lastSync: null,
  },
  {
    id: 'postgres',
    name: 'PostgreSQL (Read-Only)',
    type: 'Database',
    status: 'CONNECTED',
    lastSync: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
  },
  {
    id: 'policy-kb',
    name: 'Policy Knowledge Base',
    type: 'Knowledge Base',
    status: 'CONNECTED',
    lastSync: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
]

function formatLastSync(value: string | null): string {
  if (!value) return 'Never'
  const date = new Date(value)
  return date.toLocaleString()
}

export default function DataConnectorsPage(): JSX.Element {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const connectedCount = useMemo(
    () => connectors.filter((c) => c.status === 'CONNECTED').length,
    [connectors],
  )

  const handleToggleConnection = (id: string) => {
    setConnectors((prev) =>
      prev.map((connector) => {
        if (connector.id !== id) return connector

        const nextStatus: ConnectorStatus =
          connector.status === 'CONNECTED' ? 'NOT_CONNECTED' : 'CONNECTED'

        return {
          ...connector,
          status: nextStatus,
          lastSync: nextStatus === 'CONNECTED' ? new Date().toISOString() : connector.lastSync,
        }
      }),
    )
  }

  const handleUploadFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.target.files ?? []).map((file) => file.name)
    if (next.length === 0) return
    setUploadedFiles((prev) => [...next, ...prev].slice(0, 8))
    event.target.value = ''
  }

  return (
    <PageWrapper title="Data Connectors">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <Cloud className="w-7 h-7 text-cyan" />
              <div>
                <div className="text-white text-2xl font-bold">{connectedCount}</div>
                <div className="text-white/60 text-sm">Connected Sources</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Database className="w-7 h-7 text-neon" />
              <div>
                <div className="text-white text-2xl font-bold">{connectors.length}</div>
                <div className="text-white/60 text-sm">Configured Connectors</div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <FileText className="w-7 h-7 text-amber" />
              <div>
                <div className="text-white text-2xl font-bold">{uploadedFiles.length}</div>
                <div className="text-white/60 text-sm">Recent Uploaded Files</div>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Connector Management">
          <div className="space-y-3">
            {connectors.map((connector) => (
              <div
                key={connector.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-cyan" />
                    <span className="text-white font-medium">{connector.name}</span>
                    <Badge variant={connector.status === 'CONNECTED' ? 'success' : 'warning'}>
                      {connector.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-white/50">
                    {connector.type} • Last sync: {formatLastSync(connector.lastSync)}
                  </div>
                </div>

                <Button
                  variant={connector.status === 'CONNECTED' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleConnection(connector.id)}
                >
                  {connector.status === 'CONNECTED' ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Manual File Intake">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-white/80">
              <UploadCloud className="w-4 h-4 text-cyan" />
              <span>Upload policy PDFs, images, or CSV files</span>
              <input
                type="file"
                multiple
                onChange={handleUploadFiles}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
              />
            </label>
            <span className="text-xs text-white/50">Files remain local until backend ingestion is configured.</span>
          </div>

          {uploadedFiles.length > 0 ? (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((fileName, index) => (
                <div key={`${fileName}-${index}`} className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80">
                  {fileName}
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </PageWrapper>
  )
}
