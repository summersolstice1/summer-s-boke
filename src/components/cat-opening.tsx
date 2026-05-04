'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cat-opening-seen'
const EXIT_DELAY = 4300
const UNMOUNT_DELAY = 520

export default function CatOpening() {
	const [mounted, setMounted] = useState(false)
	const [leaving, setLeaving] = useState(false)

	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
		if (sessionStorage.getItem(STORAGE_KEY) === 'true') return

		setMounted(true)
		const leaveTimer = window.setTimeout(() => {
			setLeaving(true)
			sessionStorage.setItem(STORAGE_KEY, 'true')
		}, EXIT_DELAY)

		return () => window.clearTimeout(leaveTimer)
	}, [])

	useEffect(() => {
		if (!leaving) return

		const unmountTimer = window.setTimeout(() => setMounted(false), UNMOUNT_DELAY)
		return () => window.clearTimeout(unmountTimer)
	}, [leaving])

	const close = () => {
		sessionStorage.setItem(STORAGE_KEY, 'true')
		setLeaving(true)
	}

	if (!mounted) return null

	return (
		<div className={`cat-opening ${leaving ? 'cat-opening--leaving' : ''}`} aria-label='小猫开场动画'>
			<div className='cat-opening__stars' aria-hidden>
				{Array.from({ length: 18 }).map((_, index) => (
					<span key={index} style={{ '--i': index } as React.CSSProperties} />
				))}
			</div>

			<div className='cat-opening__orbit' aria-hidden />
			<div className='cat-opening__planet' aria-hidden>
				<span />
				<span />
			</div>

			<div className='cat-opening__stage' aria-hidden>
				<div className='cat-opening__trail' />
				<div className='cat-opening__cat'>
					<div className='cat-opening__tail' />
					<div className='cat-opening__body'>
						<div className='cat-opening__paw cat-opening__paw--left' />
						<div className='cat-opening__paw cat-opening__paw--right' />
					</div>
					<div className='cat-opening__head'>
						<div className='cat-opening__ear cat-opening__ear--left' />
						<div className='cat-opening__ear cat-opening__ear--right' />
						<div className='cat-opening__face'>
							<span className='cat-opening__eye cat-opening__eye--left' />
							<span className='cat-opening__eye cat-opening__eye--right' />
							<span className='cat-opening__nose' />
							<span className='cat-opening__whisker cat-opening__whisker--left-one' />
							<span className='cat-opening__whisker cat-opening__whisker--left-two' />
							<span className='cat-opening__whisker cat-opening__whisker--right-one' />
							<span className='cat-opening__whisker cat-opening__whisker--right-two' />
						</div>
					</div>
				</div>
			</div>

			<div className='cat-opening__copy'>
				<p>喵，欢迎回来</p>
				<span>正在降落到你的星球博客</span>
			</div>

			<button type='button' className='cat-opening__skip' onClick={close}>
				跳过
			</button>
		</div>
	)
}
