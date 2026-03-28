export const securityConfig = {
	sessionTimeoutMinutes: Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES ?? 30),
	maxQueriesPerHour: Number(import.meta.env.VITE_MAX_QUERIES_PER_HOUR ?? 100),
	csp: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'"],
		styleSrc: ["'self'", 'https://fonts.googleapis.com'],
		fontSrc: ["'self'", 'https://fonts.gstatic.com'],
		connectSrc: ["'self'"],
		imgSrc: ["'self'", 'data:'],
	},
} as const
