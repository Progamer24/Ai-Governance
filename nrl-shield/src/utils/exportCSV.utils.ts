export function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
	if (rows.length === 0) return ''
	const headers = Object.keys(rows[0])
	const escaped = (value: unknown): string => `"${String(value ?? '').replaceAll('"', '""')}"`
	const lines = [headers.join(',')]
	for (const row of rows) {
		lines.push(headers.map((header) => escaped(row[header])).join(','))
	}
	return lines.join('\n')
}
