import type { Config } from 'tailwindcss'

export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				navy: '#040810',
				cyan: '#00D4FF',
				amber: '#FFB800',
				crimson: '#FF3355',
				neon: '#00FF9D',
			},
		},
	},
	plugins: [],
} satisfies Config
