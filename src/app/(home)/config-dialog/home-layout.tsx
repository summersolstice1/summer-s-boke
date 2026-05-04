'use client'

import { ArrowDown, ArrowUp, Eye, EyeOff, Maximize2, Move, RotateCcw } from 'lucide-react'
import { useConfigStore, type CardKey, type CardStyle, type CardStyles } from '../stores/config-store'
import { useLayoutEditStore } from '../stores/layout-edit-store'
import cardStylesDefault from '@/config/card-styles-default.json'

const CARD_LABELS: Record<CardKey, string> = {
	artCard: '首图',
	hiCard: '中心介绍',
	clockCard: '时钟',
	calendarCard: '日历',
	musicCard: '音乐',
	socialButtons: '联系按钮',
	shareCard: '推荐分享',
	articleCard: '文章入口',
	writeButtons: '写作入口',
	navCard: '导航',
	likePosition: '点赞',
	hatCard: '头像帽子',
	beianCard: '备案'
}

const CARD_DESCRIPTIONS: Record<CardKey, string> = {
	artCard: '首页上方视觉图',
	hiCard: '个人介绍和常用入口',
	clockCard: '数字时钟组件',
	calendarCard: '月历和日期',
	musicCard: '音乐播放条',
	socialButtons: '社交和联系方式',
	shareCard: '推荐分享入口',
	articleCard: '文章入口卡片',
	writeButtons: '写作相关入口',
	navCard: '左侧主导航',
	likePosition: '点赞互动按钮',
	hatCard: '头像装饰',
	beianCard: '底部备案信息'
}

const defaultStyles = cardStylesDefault as unknown as CardStyles

const presets: Array<{ label: string; description: string; enabled: CardKey[] }> = [
	{
		label: '清爽模式',
		description: '只保留介绍、导航、首图、联系和文章入口。',
		enabled: ['hiCard', 'navCard', 'artCard', 'socialButtons', 'articleCard']
	},
	{
		label: '创作模式',
		description: '适合写作和日常记录，突出文章、写作、时钟和日历。',
		enabled: ['hiCard', 'navCard', 'articleCard', 'writeButtons', 'clockCard', 'calendarCard', 'socialButtons']
	},
	{
		label: '完整模式',
		description: '展示主要模块，保留丰富的首页氛围。',
		enabled: ['hiCard', 'navCard', 'artCard', 'clockCard', 'calendarCard', 'musicCard', 'socialButtons', 'shareCard', 'articleCard', 'writeButtons', 'likePosition']
	}
]

interface HomeLayoutProps {
	cardStylesData: CardStyles
	setCardStylesData: React.Dispatch<React.SetStateAction<CardStyles>>
	onClose?: () => void
}

export function HomeLayout({ cardStylesData, setCardStylesData, onClose }: HomeLayoutProps) {
	const { setCardStyles } = useConfigStore()
	const startEditing = useLayoutEditStore(state => state.startEditing)
	const editing = useLayoutEditStore(state => state.editing)

	const sortedEntries = (Object.entries(cardStylesData) as Array<[CardKey, CardStyle]>).sort((a, b) => {
		const orderDiff = a[1].order - b[1].order
		return orderDiff || CARD_LABELS[a[0]].localeCompare(CARD_LABELS[b[0]], 'zh-Hans-CN')
	})

	const updateCard = (key: CardKey, patch: Partial<CardStyle>) => {
		setCardStylesData(prev => ({
			...prev,
			[key]: {
				...prev[key],
				...patch
			}
		}))
	}

	const moveCard = (key: CardKey, direction: 'up' | 'down') => {
		const currentIndex = sortedEntries.findIndex(([entryKey]) => entryKey === key)
		const target = sortedEntries[direction === 'up' ? currentIndex - 1 : currentIndex + 1]
		if (!target) return

		const currentOrder = cardStylesData[key].order
		const targetKey = target[0]
		const targetOrder = cardStylesData[targetKey].order

		setCardStylesData(prev => ({
			...prev,
			[key]: { ...prev[key], order: targetOrder },
			[targetKey]: { ...prev[targetKey], order: currentOrder }
		}))
	}

	const handleStartManualLayout = () => {
		setCardStyles(cardStylesData)
		startEditing()
		onClose?.()
	}

	const handleResetAll = () => {
		setCardStylesData(defaultStyles)
	}

	const handleResetPosition = (key: CardKey) => {
		const defaultStyle = defaultStyles[key]
		updateCard(key, {
			width: defaultStyle.width,
			height: defaultStyle.height,
			order: defaultStyle.order,
			offsetX: defaultStyle.offsetX,
			offsetY: defaultStyle.offsetY
		})
	}

	const handleApplyPreset = (enabledKeys: CardKey[]) => {
		const enabledSet = new Set<CardKey>(enabledKeys)

		setCardStylesData(prev =>
			Object.fromEntries(
				(Object.entries(prev) as Array<[CardKey, CardStyle]>).map(([key, value]) => [
					key,
					{
						...value,
						enabled: enabledSet.has(key)
					}
				])
			) as CardStyles
		)
	}

	return (
		<div className='space-y-5'>
			<div className='rounded-2xl border bg-white/45 p-4 backdrop-blur'>
				<div className='flex flex-wrap items-start justify-between gap-3'>
					<div>
						<h3 className='text-base font-semibold'>首页模块搭配</h3>
						<p className='text-secondary mt-1 text-sm'>选择想展示的模块，调整顺序、尺寸和偏移；也可以进入首页直接拖拽。</p>
					</div>
					<div className='flex flex-wrap gap-2'>
						<button type='button' onClick={handleResetAll} className='bg-card inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium'>
							<RotateCcw className='h-3.5 w-3.5' />
							全部重置
						</button>
						<button
							type='button'
							onClick={handleStartManualLayout}
							disabled={editing}
							className='brand-btn px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50'>
							<Move className='h-3.5 w-3.5' />
							{editing ? '主页正在编辑中' : '进入拖拽布局'}
						</button>
					</div>
				</div>

				<div className='mt-4 grid gap-2 md:grid-cols-3'>
					{presets.map(preset => (
						<button
							key={preset.label}
							type='button'
							onClick={() => handleApplyPreset(preset.enabled)}
							className='rounded-xl border bg-white/55 p-3 text-left transition-colors hover:bg-white/80'>
							<div className='text-sm font-semibold'>{preset.label}</div>
							<div className='text-secondary mt-1 text-xs leading-relaxed'>{preset.description}</div>
						</button>
					))}
				</div>
			</div>

			<div className='grid gap-3'>
				{sortedEntries.map(([key, cardStyle], index) => (
					<div key={key} className='rounded-2xl border bg-white/45 p-4 backdrop-blur'>
						<div className='flex flex-wrap items-start justify-between gap-3'>
							<div className='min-w-0'>
								<div className='flex items-center gap-2'>
									<span className='text-sm font-semibold'>{CARD_LABELS[key]}</span>
									<span className='text-secondary rounded-full bg-white/55 px-2 py-0.5 text-[11px]'>顺序 {cardStyle.order}</span>
								</div>
								<p className='text-secondary mt-1 text-xs'>{CARD_DESCRIPTIONS[key]}</p>
							</div>

							<div className='flex flex-wrap gap-1.5'>
								<button
									type='button'
									title='上移'
									aria-label='上移'
									onClick={() => moveCard(key, 'up')}
									disabled={index === 0}
									className='rounded-lg border bg-white/55 p-1.5 text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-35'>
									<ArrowUp className='h-4 w-4' />
								</button>
								<button
									type='button'
									title='下移'
									aria-label='下移'
									onClick={() => moveCard(key, 'down')}
									disabled={index === sortedEntries.length - 1}
									className='rounded-lg border bg-white/55 p-1.5 text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-35'>
									<ArrowDown className='h-4 w-4' />
								</button>
								<button
									type='button'
									onClick={() => updateCard(key, { enabled: !(cardStyle.enabled ?? true) })}
									className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
										cardStyle.enabled ?? true ? 'bg-brand text-white' : 'bg-white/55 text-gray-500 hover:text-gray-800'
									}`}>
									{cardStyle.enabled ?? true ? <Eye className='h-3.5 w-3.5' /> : <EyeOff className='h-3.5 w-3.5' />}
									{cardStyle.enabled ?? true ? '显示' : '隐藏'}
								</button>
							</div>
						</div>

						<div className='mt-4 grid gap-3 md:grid-cols-5'>
							<label className='space-y-1'>
								<span className='text-secondary text-xs'>宽度</span>
								<input
									type='number'
									value={cardStyle.width}
									onChange={e => updateCard(key, { width: Math.max(50, parseInt(e.target.value) || 50) })}
									className='no-spinner bg-secondary/10 w-full rounded-lg border px-3 py-2 text-xs'
								/>
							</label>
							<label className='space-y-1'>
								<span className='text-secondary text-xs'>高度</span>
								<input
									type='number'
									value={cardStyle.height}
									onChange={e => updateCard(key, { height: Math.max(50, parseInt(e.target.value) || 50) })}
									className='no-spinner bg-secondary/10 w-full rounded-lg border px-3 py-2 text-xs'
								/>
							</label>
							<label className='space-y-1'>
								<span className='text-secondary text-xs'>横向偏移</span>
								<input
									type='number'
									value={cardStyle.offsetX ?? ''}
									placeholder='自动'
									onChange={e => updateCard(key, { offsetX: e.target.value === '' ? null : parseInt(e.target.value) || 0 })}
									className='no-spinner bg-secondary/10 w-full rounded-lg border px-3 py-2 text-xs'
								/>
							</label>
							<label className='space-y-1'>
								<span className='text-secondary text-xs'>纵向偏移</span>
								<input
									type='number'
									value={cardStyle.offsetY ?? ''}
									placeholder='自动'
									onChange={e => updateCard(key, { offsetY: e.target.value === '' ? null : parseInt(e.target.value) || 0 })}
									className='no-spinner bg-secondary/10 w-full rounded-lg border px-3 py-2 text-xs'
								/>
							</label>
							<div className='flex items-end'>
								<button
									type='button'
									onClick={() => handleResetPosition(key)}
									className='bg-card inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium'>
									<Maximize2 className='h-3.5 w-3.5' />
									重置模块
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
