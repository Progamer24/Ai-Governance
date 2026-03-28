export function notify(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log']('[NRL-Shield]', message)
}
