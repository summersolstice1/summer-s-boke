import '@/styles/globals.css'

import type { Metadata } from 'next'
import Layout from '@/layout'
import Head from '@/layout/head'
import siteContent from '@/config/site-content.json'

const {
	meta: { title, description },
	theme
} = siteContent

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description
	},
	twitter: {
		title,
		description
	}
}

const htmlStyle = {
	cursor: 'url(/images/cursor.svg) 2 1, auto',
	'--color-brand': theme.colorBrand,
	'--color-primary': theme.colorPrimary,
	'--color-secondary': theme.colorSecondary,
	'--color-brand-secondary': theme.colorBrandSecondary,
	'--color-bg': theme.colorBg,
	'--color-border': theme.colorBorder,
	'--color-card': theme.colorCard,
	'--color-article': theme.colorArticle
}

const planetThemeScript = `
(() => {
	const palettes = {
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
	};
	const saved = localStorage.getItem('planet-theme');
	const mode = saved === 'light' || saved === 'dark' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	document.documentElement.dataset.theme = mode;
	for (const [key, value] of Object.entries(palettes[mode])) {
		document.documentElement.style.setProperty(key, value);
	}
})();
`

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' data-theme='light' suppressHydrationWarning style={htmlStyle}>
			<Head />

			<body>
				<script dangerouslySetInnerHTML={{ __html: planetThemeScript }} />
				<script
					dangerouslySetInnerHTML={{
						__html: `
					if (/windows|win32/i.test(navigator.userAgent)) {
						document.documentElement.classList.add('windows');
					}
		      `
					}}
				/>

				<Layout>{children}</Layout>
			</body>
		</html>
	)
}
