import PageWrapper from '../../../components/layout/PageWrapper'
import AISettings from './AISettings'
import EncryptionSettings from './EncryptionSettings'
import SecuritySettings from './SecuritySettings'

export default function SettingsPage() {
  return (
    <PageWrapper title="System Settings">
      <div className="space-y-4">
        <AISettings />
        <EncryptionSettings />
        <SecuritySettings />
      </div>
    </PageWrapper>
  )
}
