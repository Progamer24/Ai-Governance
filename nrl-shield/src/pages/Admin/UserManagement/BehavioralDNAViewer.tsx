import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { UserProfile } from '../../../hooks/useAdmin'

type TrustTier = 'ELEVATED' | 'HIGH' | 'STRICT'

interface BehavioralDNAViewerProps {
	users: UserProfile[]
}

const driftTone: Record<TrustTier, string> = {
	ELEVATED: '#2dd4bf',
	HIGH: '#f59e0b',
	STRICT: '#fb7185',
}

function deriveTrustTier(level: number): TrustTier {
	if (level >= 8) return 'STRICT'
	if (level >= 5) return 'HIGH'
	return 'ELEVATED'
}

export default function BehavioralDNAViewer({ users }: BehavioralDNAViewerProps): JSX.Element {
	const chartData = users.map((user) => ({
		name: (user.full_name ?? user.email).split(' ')[0],
		drift: Math.min(100, Math.max(0, (user.nrl_level ?? 0) * 10)),
		tcs: (user.nrl_level ?? 0) * 100,
		tier: deriveTrustTier(user.nrl_level ?? 0),
	}))

	return (
		<section className="rounded-xl border border-slate-700/70 bg-slate-900/35 p-4">
			<div className="mb-3">
				<h3 className="text-sm font-semibold text-slate-100">Behavioral DNA Drift</h3>
				<p className="text-xs text-slate-400">User behavioral baseline drift and trust posture over recent activity windows.</p>
			</div>
			<div className="h-56 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
						<XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
						<YAxis yAxisId="drift" stroke="#f43f5e" tick={{ fill: '#fda4af', fontSize: 11 }} domain={[0, 100]} />
						<YAxis yAxisId="tcs" orientation="right" stroke="#22d3ee" tick={{ fill: '#67e8f9', fontSize: 11 }} domain={[0, 1000]} />
						<Tooltip
							contentStyle={{ borderRadius: 10, borderColor: '#334155', background: '#020617', color: '#e2e8f0' }}
							formatter={(value: number, key: string, item) => {
								if (key === 'tcs') {
									return [`${value} (${String(item?.payload?.tier ?? '')})`, 'TCS']
								}
								return [value, 'Drift']
							}}
						/>
						<Line yAxisId="drift" dataKey="drift" stroke="#fb7185" strokeWidth={2} dot={{ r: 3 }} type="monotone" />
						<Line yAxisId="tcs" dataKey="tcs" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} type="monotone" />
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
				{(['ELEVATED', 'HIGH', 'STRICT'] as const).map((tier) => (
					<div key={tier} className="inline-flex items-center gap-2">
						<span className="h-2 w-2 rounded-full" style={{ backgroundColor: driftTone[tier] }} />
						{tier}
					</div>
				))}
			</div>
		</section>
	)
}
