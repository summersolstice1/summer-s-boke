'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'planet-theme'

const palettes: Record<ThemeMode, Record<string, string>> = {
	light: {
		'--color-brand': '#2f9ecb',
		'--color-brand-secondary': '#f0b85a',
		'--color-primary': '#263f56',
		'--color-secondary': '#667987',
		'--color-bg': '#dcebf4',
		'--color-border': '#ffffffb3',
		'--color-card': '#ffffffa8',
		'--color-article': '#fffffff0',
		'--planet-sky-1': '#d8edf7',
		'--planet-sky-2': '#f5dfb2',
		'--planet-sky-3': '#b7d7ef',
		'--planet-star': '#ffffff',
		'--planet-ring': '#7fb8db',
		'--planet-shadow': 'rgba(53, 88, 113, 0.16)'
	},
	dark: {
		'--color-brand': '#76e4ff',
		'--color-brand-secondary': '#ffc96d',
		'--color-primary': '#edf8ff',
		'--color-secondary': '#a9bed4',
		'--color-bg': '#10162b',
		'--color-border': '#8bcfff33',
		'--color-card': '#12223ccc',
		'--color-article': '#13223ee6',
		'--planet-sky-1': '#08111f',
		'--planet-sky-2': '#172c54',
		'--planet-sky-3': '#3f2456',
		'--planet-star': '#ecfbff',
		'--planet-ring': '#77d8ff',
		'--planet-shadow': 'rgba(0, 0, 0, 0.42)'
	}
}

export function applyPlanetTheme(mode: ThemeMode) {
	const root = document.documentElement
	root.dataset.theme = mode
	Object.entries(palettes[mode]).forEach(([key, value]) => {
		root.style.setProperty(key, value)
	})
}

function getInitialTheme(): ThemeMode {
	if (typeof window === 'undefined') return 'light'
	const saved = window.localStorage.getItem(STORAGE_KEY)
	if (saved === 'light' || saved === 'dark') return saved
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>('light')

	useEffect(() => {
		const initial = getInitialTheme()
		setMode(initial)
		applyPlanetTheme(initial)
	}, [])

	const toggle = () => {
		const next = mode === 'light' ? 'dark' : 'light'
		setMode(next)
		window.localStorage.setItem(STORAGE_KEY, next)
		applyPlanetTheme(next)
	}

	const isDark = mode === 'dark'

	return (
		<button type='button' className='planet-theme-toggle' onClick={toggle} aria-label={isDark ? '切换到白天模式' : '切换到夜晚模式'} title={isDark ? '白天模式' : '夜晚模式'}>
			<span className='planet-theme-toggle__sky' />
			<span className='planet-theme-toggle__orbit'>
				<span className='planet-theme-toggle__body'>
					<span className='planet-theme-toggle__crater planet-theme-toggle__crater--one' />
					<span className='planet-theme-toggle__crater planet-theme-toggle__crater--two' />
				</span>
			</span>
			<Sun className='planet-theme-toggle__icon planet-theme-toggle__icon--sun' />
			<Moon className='planet-theme-toggle__icon planet-theme-toggle__icon--moon' />
		</button>
	)
}
