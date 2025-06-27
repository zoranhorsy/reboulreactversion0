import type { Config } from 'tailwindcss'
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
    darkMode: ['class'],
    content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
    	screens: {
    		'xs': '400px',
    		'sm': '640px',
    		'md': '768px',
    		'lg': '1024px',
    		'xl': '1280px',
    		'2xl': '1536px',
    	},
    	extend: {
    		fontFamily: {
    			sans: [
    				'var(--font-geist-sans)',
                    ...fontFamily.sans
                ]
    		},
    		backgroundImage: {
    			'noise': "url('/noise.png')",
    			'grid-zinc-900': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(24 24 27 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
    			'grid-zinc-100': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(244 244 245 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
    		},
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    				animation: {
			'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
			'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			'float': 'float 3s ease-in-out infinite',
			'grain': 'grain 8s steps(10) infinite',
			'marquee': 'marquee 15s linear infinite',
		},
		translate: {
			'101': '101%',
		},
    				keyframes: {
			'ping-slow': {
				'0%, 100%': { opacity: '1' },
				'50%': { opacity: '0.5' },
			},
			'pulse-slow': {
				'0%, 100%': { transform: 'scale(1)' },
				'50%': { transform: 'scale(1.05)' },
			},
			'float': {
				'0%, 100%': { transform: 'translateY(0)' },
				'50%': { transform: 'translateY(-10px)' },
			},
			'grain': {
				'0%, 100%': { transform: 'translate(0, 0)' },
				'10%': { transform: 'translate(-2%, -2%)' },
				'20%': { transform: 'translate(2%, 2%)' },
				'30%': { transform: 'translate(-1%, 1%)' },
				'40%': { transform: 'translate(1%, -1%)' },
				'50%': { transform: 'translate(-2%, 2%)' },
				'60%': { transform: 'translate(2%, -2%)' },
				'70%': { transform: 'translate(-1%, -1%)' },
				'80%': { transform: 'translate(1%, 1%)' },
				'90%': { transform: 'translate(-2%, -2%)' },
			},
			'marquee': {
				'from': { transform: 'translateX(0%)' },
				'to': { transform: 'translateX(-50%)' }
			}
		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
}

export default config

