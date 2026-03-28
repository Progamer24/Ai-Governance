import DOMPurify from 'dompurify'

const INJECTION_PATTERNS: RegExp[] = [
/ignore\s+(all\s+)?previous\s+instructions/i,
/act\s+as\s+(a\s+|an\s+)?(different|new|evil|unfiltered)/i,
/\bDAN\b/,
/pretend\s+(you\s+are|to\s+be)/i,
/your\s+true\s+self/i,
/jailbreak/i,
/bypass\s+(your\s+)?(safety|filter|restriction)/i,
/you\s+are\s+now\s+/i,
/forget\s+(your\s+)?(previous\s+)?(instructions|training|rules)/i,
/do\s+anything\s+now/i,
/override\s+(safety|guidelines|instructions)/i,
/system\s*:\s*you\s+are/i,
]

export function sanitizeInput(input: string): string {
const domClean = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })

return INJECTION_PATTERNS.reduce((text, pattern) => text.replace(pattern, '[FILTERED]'), domClean)
}

export function containsInjection(input: string): boolean {
const domStripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
return INJECTION_PATTERNS.some((pattern) => pattern.test(domStripped))
}
