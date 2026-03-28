import { Toaster, toast as hotToast } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#0d1a2d',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          maxWidth: '380px',
        },
      }}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  success: (message: string) =>
    hotToast.custom((t) => (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl transition-all ${
          t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        style={{
          background: '#0d1a2d',
          border: '1px solid rgba(0,255,157,0.3)',
          color: '#ffffff',
          fontSize: '0.875rem',
          maxWidth: '380px',
        }}
      >
        <CheckCircle size={18} className="text-neon shrink-0" />
        <span>{message}</span>
      </div>
    )),

  error: (message: string) =>
    hotToast.custom((t) => (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl transition-all ${
          t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        style={{
          background: '#0d1a2d',
          border: '1px solid rgba(255,51,85,0.3)',
          color: '#ffffff',
          fontSize: '0.875rem',
          maxWidth: '380px',
        }}
      >
        <XCircle size={18} className="text-crimson shrink-0" />
        <span>{message}</span>
      </div>
    )),

  warning: (message: string) =>
    hotToast.custom((t) => (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl transition-all ${
          t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        style={{
          background: '#0d1a2d',
          border: '1px solid rgba(255,184,0,0.3)',
          color: '#ffffff',
          fontSize: '0.875rem',
          maxWidth: '380px',
        }}
      >
        <AlertTriangle size={18} className="text-amber shrink-0" />
        <span>{message}</span>
      </div>
    )),
}
