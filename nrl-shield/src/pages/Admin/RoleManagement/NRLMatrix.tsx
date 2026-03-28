import { ROLE_BASELINE } from '../../../config/rbac.config'

const ALL_NEEDS = ['GENERAL', 'OPERATIONAL', 'FINANCIAL', 'HR', 'LEGAL', 'SYSTEM', 'SECURITY', 'AUDIT', 'ALL']

const levelColor: Record<number, string> = {
  1: 'text-neon',
  2: 'text-cyan',
  3: 'text-amber',
  4: 'text-orange-400',
  5: 'text-crimson',
}

export default function NRLMatrix() {
  const roles = Object.entries(ROLE_BASELINE)
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-xs text-white/70">
        <thead className="bg-white/5 text-white/40 uppercase tracking-wider">
          <tr>
            <th className="px-3 py-2 text-left">Role</th>
            <th className="px-3 py-2 text-left">Lvl</th>
            {ALL_NEEDS.map((n) => <th key={n} className="px-2 py-2 text-center font-mono">{n}</th>)}
          </tr>
        </thead>
        <tbody>
          {roles.map(([name, def]) => (
            <tr key={name} className="border-t border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-3 py-2 font-mono font-semibold text-white/80">{name}</td>
              <td className={`px-3 py-2 font-bold ${levelColor[def.level] ?? ''}`}>{def.level}</td>
              {ALL_NEEDS.map((n) => {
                const has = (def.needs as readonly string[]).includes('ALL') || (def.needs as readonly string[]).includes(n)
                return (
                  <td key={n} className="px-2 py-2 text-center">
                    {has ? <span className="text-neon">✓</span> : <span className="text-white/20">·</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
