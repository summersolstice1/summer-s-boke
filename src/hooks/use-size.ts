'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

type SizeState = {
	init: boolean
	maxXL: boolean
	maxLG: boolean
	maxMD: boolean
	maxSM: boolean
	maxXS: boolean
	recalc: () => void
}

const initState = {
	init: false,
	maxXL: false,
	maxLG: false,
	maxMD: false,
	maxSM: false,
	maxXS: false
}

const computeSize = (): Omit<SizeState, 'recalc'> => {
	if (typeof window !== 'undefined') {
		const width = window.innerWidth

		return {
			init: true,
			maxXL: width < 1280,
			maxLG: width < 1024,
			maxMD: width < 768,
			maxSM: width < 640,
			maxXS: width < 360
		}
	}

	return initState
}

export const useSizeStore = create<SizeState>(set => ({
	...initState,
	recalc: () => {
		const next = computeSize()
		set(state => {
			if (
				state.init === next.init &&
				state.maxXL === next.maxXL &&
				state.maxLG === next.maxLG &&
				state.maxMD === next.maxMD &&
				state.maxSM === next.maxSM &&
				state.maxXS === next.maxXS
			) {
				return state
			}

			return next
		})
	}
}))

export function useSizeInit() {
	useEffect(() => {
		let frame = 0
		const update = () => {
			if (frame) return
			frame = window.requestAnimationFrame(() => {
				frame = 0
				useSizeStore.getState().recalc()
			})
		}

		update()
		window.addEventListener('resize', update)
		return () => {
			if (frame) window.cancelAnimationFrame(frame)
			window.removeEventListener('resize', update)
		}
	}, [])
}

export const useSize = useSizeStore
