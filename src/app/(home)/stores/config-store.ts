import { create } from 'zustand'
import siteContent from '@/config/site-content.json'
import cardStyles from '@/config/card-styles.json'

export type SiteContent = typeof siteContent
export type CardKey = keyof typeof cardStyles
export interface CardStyle {
	width: number
	height: number
	offset?: number
	order: number
	offsetX: number | null
	offsetY: number | null
	enabled: boolean
}
export type CardStyles = Record<CardKey, CardStyle>

const SITE_CONTENT_STORAGE_KEY = 'blog-site-content-v1'
const CARD_STYLES_STORAGE_KEY = 'blog-card-styles-v1'

function readStorage<T>(key: string): Partial<T> | null {
	if (typeof window === 'undefined') return null

	try {
		const raw = window.localStorage.getItem(key)
		return raw ? (JSON.parse(raw) as Partial<T>) : null
	} catch (error) {
		console.error(`Failed to read ${key} from localStorage:`, error)
		return null
	}
}

function writeStorage(key: string, value: unknown) {
	if (typeof window === 'undefined') return

	try {
		window.localStorage.setItem(key, JSON.stringify(value))
	} catch (error) {
		console.error(`Failed to write ${key} to localStorage:`, error)
	}
}

function mergeCardStyles(stored?: Partial<CardStyles> | null): CardStyles {
	const defaults = cardStyles as CardStyles
	if (!stored) return { ...defaults }

	return Object.fromEntries(
		Object.entries(defaults).map(([key, value]) => [
			key,
			{
				...value,
				...(stored[key as CardKey] ?? {})
			}
		])
	) as CardStyles
}

function getInitialSiteContent(): SiteContent {
	return {
		...siteContent,
		...(readStorage<SiteContent>(SITE_CONTENT_STORAGE_KEY) ?? {})
	}
}

function getInitialCardStyles(): CardStyles {
	return mergeCardStyles(readStorage<CardStyles>(CARD_STYLES_STORAGE_KEY))
}

interface ConfigStore {
	siteContent: SiteContent
	cardStyles: CardStyles
	regenerateKey: number
	configDialogOpen: boolean
	setSiteContent: (content: SiteContent) => void
	setCardStyles: (styles: CardStyles) => void
	resetSiteContent: () => void
	resetCardStyles: () => void
	regenerateBubbles: () => void
	setConfigDialogOpen: (open: boolean) => void
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
	siteContent: getInitialSiteContent(),
	cardStyles: getInitialCardStyles(),
	regenerateKey: 0,
	configDialogOpen: false,
	setSiteContent: (content: SiteContent) => {
		writeStorage(SITE_CONTENT_STORAGE_KEY, content)
		set({ siteContent: content })
	},
	setCardStyles: (styles: CardStyles) => {
		const next = mergeCardStyles(styles)
		writeStorage(CARD_STYLES_STORAGE_KEY, next)
		set({ cardStyles: next })
	},
	resetSiteContent: () => {
		writeStorage(SITE_CONTENT_STORAGE_KEY, siteContent)
		set({ siteContent: { ...siteContent } })
	},
	resetCardStyles: () => {
		const next = mergeCardStyles()
		writeStorage(CARD_STYLES_STORAGE_KEY, next)
		set({ cardStyles: next })
	},
	regenerateBubbles: () => {
		set(state => ({ regenerateKey: state.regenerateKey + 1 }))
	},
	setConfigDialogOpen: (open: boolean) => {
		set({ configDialogOpen: open })
	}
}))

