import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import './LoginPage.css'

export default function LoginPage() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      if (mode === 'signup') {
        await signup(email, password, fullName, department)
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full bg-white/5 border border-white/10 focus:border-cyan rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition text-sm font-mono'

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div className="login-bg" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <ShieldCheck size={48} className="text-cyan mb-3" strokeWidth={1.5} />
            <h1 className="text-xl font-bold text-white font-mono tracking-wide">NRL Shield</h1>
            <p className="text-white/50 text-sm mt-1">Secure AI Governance</p>
          </div>

          <div className="mb-4 flex rounded-lg border border-white/10 bg-white/5 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md px-3 py-2 transition ${mode === 'signin' ? 'bg-cyan/20 text-cyan' : 'text-white/50'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md px-3 py-2 transition ${mode === 'signup' ? 'bg-cyan/20 text-cyan' : 'text-white/50'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-crimson/40 bg-crimson/10 text-crimson text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-mono uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-mono uppercase tracking-widest">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Operations"
                    required
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-mono uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@nrl.example"
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-mono uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={inputClass + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" loading={isLoading} disabled={isLoading} className="w-full mt-2">
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/20 font-mono">
            NRL Shield v1.0 · Classified Access Only
          </p>
        </div>
      </div>
    </div>
  )
}
