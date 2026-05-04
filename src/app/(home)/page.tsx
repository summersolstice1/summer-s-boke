'use client'

import HiCard from '@/app/(home)/hi-card'
import ArtCard from '@/app/(home)/art-card'
import ClockCard from '@/app/(home)/clock-card'
import CalendarCard from '@/app/(home)/calendar-card'
import SocialButtons from '@/app/(home)/social-buttons'
import ShareCard from '@/app/(home)/share-card'
import AritcleCard from '@/app/(home)/aritcle-card'
import WriteButtons from '@/app/(home)/write-buttons'
import LikePosition from './like-position'
import HatCard from './hat-card'
import BeianCard from './beian-card'
import { useSize } from '@/hooks/use-size'
import { motion } from 'motion/react'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { useConfigStore } from './stores/config-store'
import { toast } from 'sonner'
import ConfigDialog from './config-dialog/index'
import { useEffect } from 'react'
import SnowfallBackground from '@/layout/backgrounds/snowfall'
import { LayoutDashboard, Move, Settings2 } from 'lucide-react'

export default function Home() {
	const { maxSM } = useSize()
	const { cardStyles, configDialogOpen, setConfigDialogOpen, siteContent } = useConfigStore()
	const editing = useLayoutEditStore(state => state.editing)
	const saveEditing = useLayoutEditStore(state => state.saveEditing)
	const cancelEditing = useLayoutEditStore(state => state.cancelEditing)

	const handleSave = () => {
		saveEditing()
		toast.success('首页布局已保存到本地浏览器')
	}

	const handleCancel = () => {
		cancelEditing()
		toast.info('已取消此次拖拽布局修改')
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === ',')) {
				e.preventDefault()
				setConfigDialogOpen(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [setConfigDialogOpen])

	return (
		<>
			{siteContent.enableChristmas && <SnowfallBackground zIndex={0} count={!maxSM ? 125 : 20} />}

			{editing && (
				<div className='pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-6'>
					<div className='pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2 shadow-lg backdrop-blur'>
						<span className='flex items-center gap-1.5 text-xs text-gray-600'>
							<Move className='h-3.5 w-3.5' />
							正在编辑首页布局，拖拽卡片调整位置，右下角可调整尺寸
						</span>
						<div className='flex gap-2'>
							<motion.button
								type='button'
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleCancel}
								className='rounded-xl border bg-white px-3 py-1 text-xs font-medium text-gray-700'>
								取消
							</motion.button>
							<motion.button type='button' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} className='brand-btn px-3 py-1 text-xs'>
								保存偏移
							</motion.button>
						</div>
					</div>
				</div>
			)}

			<div className='max-sm:flex max-sm:flex-col max-sm:items-center max-sm:gap-6 max-sm:pt-28 max-sm:pb-20'>
				{cardStyles.artCard?.enabled !== false && <ArtCard />}
				{cardStyles.hiCard?.enabled !== false && <HiCard />}
				{!maxSM && cardStyles.clockCard?.enabled !== false && <ClockCard />}
				{!maxSM && cardStyles.calendarCard?.enabled !== false && <CalendarCard />}
				{cardStyles.socialButtons?.enabled !== false && <SocialButtons />}
				{!maxSM && cardStyles.shareCard?.enabled !== false && <ShareCard />}
				{cardStyles.articleCard?.enabled !== false && <AritcleCard />}
				{!maxSM && cardStyles.writeButtons?.enabled !== false && <WriteButtons />}
				{cardStyles.likePosition?.enabled !== false && <LikePosition />}
				{cardStyles.hatCard?.enabled !== false && <HatCard />}
				{cardStyles.beianCard?.enabled !== false && <BeianCard />}
			</div>

			{!editing && (
				<div className='fixed right-6 bottom-24 z-50 flex flex-col gap-2 max-sm:right-4 max-sm:bottom-24'>
					<motion.button
						type='button'
						whileHover={{ scale: 1.04 }}
						whileTap={{ scale: 0.96 }}
						onClick={() => setConfigDialogOpen(true)}
						className='brand-btn shadow-lg'>
						<LayoutDashboard className='h-4 w-4' />
						首页管理
					</motion.button>
					<motion.button
						type='button'
						whileHover={{ scale: 1.04 }}
						whileTap={{ scale: 0.96 }}
						onClick={() => setConfigDialogOpen(true)}
						className='bg-card inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/80'>
						<Settings2 className='h-4 w-4' />
						模块搭配
					</motion.button>
				</div>
			)}

			{siteContent.enableChristmas && <SnowfallBackground zIndex={2} count={!maxSM ? 125 : 20} />}
			<ConfigDialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} />
		</>
	)
}
