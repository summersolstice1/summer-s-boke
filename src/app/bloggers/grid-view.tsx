'use client'

import { useState } from 'react'
import { Plus, Save, Settings2, X } from 'lucide-react'

import { type AvatarItem } from './components/avatar-upload-dialog'
import { BloggerCard } from './components/blogger-card'

export type BloggerStatus = 'assistant' | 'creative' | 'apikey'

export interface Blogger {
	id?: string
	name: string
	avatar: string
	url: string
	description: string
	stars: number
	status?: BloggerStatus
}

const categories: { value: BloggerStatus; label: string }[] = [
	{ value: 'assistant', label: '对话助手' },
	{ value: 'creative', label: '创作工具' },
	{ value: 'apikey', label: 'API Key' }
]

const getBloggerKey = (blogger: Blogger) => blogger.id ?? blogger.url

interface GridViewProps {
	bloggers: Blogger[]
	isEditMode?: boolean
	isSaving?: boolean
	onUpdate?: (blogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => void
	onDelete?: (blogger: Blogger) => void
	onAdd?: (status: BloggerStatus) => void
	onCancel?: () => void
	onManage?: () => void
	onMove?: (blogger: Blogger, targetBlogger: Blogger) => void
	onSave?: () => void
}

export default function GridView({
	bloggers,
	isEditMode = false,
	isSaving = false,
	onUpdate,
	onDelete,
	onAdd,
	onCancel,
	onManage,
	onMove,
	onSave
}: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<BloggerStatus>('assistant')

	const categoryBloggers = bloggers.filter(blogger => {
		const status = blogger.status ?? 'assistant'
		return status === selectedCategory
	})

	const filteredBloggers = categoryBloggers.filter(blogger => {
		const matchesSearch =
			blogger.name.toLowerCase().includes(searchTerm.toLowerCase()) || blogger.description.toLowerCase().includes(searchTerm.toLowerCase())
		return matchesSearch
	})

	const getMoveState = (blogger: Blogger) => {
		const index = categoryBloggers.findIndex(item => getBloggerKey(item) === getBloggerKey(blogger))
		return {
			index,
			canMoveUp: index > 0,
			canMoveDown: index >= 0 && index < categoryBloggers.length - 1
		}
	}

	const handleMove = (blogger: Blogger, direction: 'up' | 'down') => {
		const { index } = getMoveState(blogger)
		const targetBlogger = categoryBloggers[direction === 'up' ? index - 1 : index + 1]
		if (!targetBlogger) return
		onMove?.(blogger, targetBlogger)
	}

	return (
		<div className='mx-auto w-full max-w-7xl px-6 pt-24 pb-12'>
			<div className='mb-8 space-y-4'>
				<div className='flex flex-col items-center gap-3 text-center'>
					<h1 className='text-3xl font-bold'>AI工具分享</h1>
					<p className='text-secondary mt-2 text-sm'>收集常用 AI 助手、创作工具和 API Key 平台入口。</p>
					<div className='flex flex-wrap justify-center gap-2'>
						{isEditMode ? (
							<>
								<button
									type='button'
									onClick={onCancel}
									disabled={isSaving}
									className='bg-card inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60'>
									<X className='h-4 w-4' />
									取消
								</button>
								<button
									type='button'
									onClick={() => onAdd?.(selectedCategory)}
									disabled={isSaving}
									className='bg-card inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60'>
									<Plus className='h-4 w-4' />
									新增
								</button>
								<button type='button' onClick={onSave} disabled={isSaving} className='brand-btn disabled:cursor-not-allowed disabled:opacity-60'>
									<Save className='h-4 w-4' />
									{isSaving ? '保存中...' : '保存'}
								</button>
							</>
						) : (
							<button type='button' onClick={onManage} className='brand-btn'>
								<Settings2 className='h-4 w-4' />
								管理
							</button>
						)}
					</div>
				</div>

				<input
					type='text'
					placeholder='搜索 AI 工具...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className='focus:ring-brand mx-auto block w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none'
				/>

				<div className='flex flex-wrap justify-center gap-2'>
					{categories.map(category => (
						<button
							key={category.value}
							onClick={() => setSelectedCategory(category.value)}
							className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
								selectedCategory === category.value ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
							}`}>
							{category.label}
						</button>
					))}
				</div>
			</div>

			<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
				{filteredBloggers.map(blogger => {
					const moveState = getMoveState(blogger)
					return (
						<BloggerCard
							key={getBloggerKey(blogger)}
							blogger={blogger}
							isEditMode={isEditMode}
							canMoveUp={moveState.canMoveUp}
							canMoveDown={moveState.canMoveDown}
							onMoveUp={() => handleMove(blogger, 'up')}
							onMoveDown={() => handleMove(blogger, 'down')}
							onUpdate={onUpdate}
							onDelete={() => onDelete?.(blogger)}
						/>
					)
				})}
			</div>

			{filteredBloggers.length === 0 && (
				<div className='mt-12 text-center text-gray-500'>
					<p>没有找到相关 AI 工具</p>
				</div>
			)}
		</div>
	)
}
