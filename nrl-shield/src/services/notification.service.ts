import toast from 'react-hot-toast'

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export function showAlert(message: string, severity: AlertSeverity): void {
  switch (severity) {
    case 'CRITICAL':
      toast.error(message, { duration: 6000 })
      break
    case 'HIGH':
      toast.error(message)
      break
    case 'MEDIUM':
      toast(message, {
        style: { background: '#1a1200', color: '#FFB800', border: '1px solid #FFB800' },
      })
      break
    case 'LOW':
      toast.success(message)
      break
  }
}

export function notifyAdmin(message: string): void {
  showAlert(message, 'HIGH')
}
