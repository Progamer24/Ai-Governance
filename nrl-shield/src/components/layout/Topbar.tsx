import { Link } from 'react-router-dom'
import { Bell, Menu, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import NRLBadge from '../../pages/AIAssistant/NRLBadge'

interface TopbarProps {
	onMenuClick?: () => void
	title?: string
}

export default function Topbar({ onMenuClick, title }: TopbarProps): JSX.Element {
	const { user, logout } = useAuth()

	async function handleLogout(): Promise<void> {
		await logout()
	}

	return (
		<header className="sticky top-0 z-30 border-b border-cyan/15 bg-[#040810]/80 px-3 py-3 backdrop-blur lg:px-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					{onMenuClick ? (
						<button
							type="button"
							onClick={onMenuClick}
							className="inline-flex items-center rounded-md border border-slate-700/60 bg-slate-900/40 p-1.5 text-slate-300 hover:text-cyan"
							aria-label="Toggle menu"
						>
							<Menu className="h-4 w-4" />
						</button>
					) : null}
					<ShieldCheck className="h-4 w-4 text-[#00ff9d]" />
					<p className="text-sm text-slate-300">
						{title ? `${title} - ` : ''}Welcome, {user?.fullName ?? user?.email ?? 'Operator'}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<NRLBadge />
					<Link
						to="/audit"
						className="inline-flex items-center gap-2 rounded-md border border-amber/50 bg-amber/10 px-3 py-1.5 text-xs text-amber"
					>
						<Bell className="h-3.5 w-3.5" />
						Alerts
					</Link>
					<button
						type="button"
						onClick={() => void handleLogout()}
						className="inline-flex items-center rounded-md border border-slate-600 bg-slate-900/45 px-3 py-1.5 text-xs text-slate-200 hover:border-rose-400/60 hover:text-rose-300"
					>
						Sign Out
					</button>
				</div>
			</div>
		</header>
	)
}
