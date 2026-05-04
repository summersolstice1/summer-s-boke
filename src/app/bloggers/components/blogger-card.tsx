'use client'

import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from 'lucide-react'
import StarRating from '@/components/star-rating'
import { useSize } from '@/hooks/use-size'
import { cn } from '@/lib/utils'
import EditableStarRating from '@/components/editable-star-rating'
import { Blogger, type BloggerStatus } from '../grid-view'
import { useEffect, useState } from 'react'
import AvatarUploadDialog, { type AvatarItem } from './avatar-upload-dialog'

const statusLabels: Record<BloggerStatus, string> = {
	assistant: '对话助手',
	creative: '创作工具',
	apikey: 'API Key'
}

interface BloggerCardProps {
	blogger: Blogger
	isEditMode?: boolean
	canMoveUp?: boolean
	canMoveDown?: boolean
	onUpdate?: (blogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => void
	onDelete?: () => void
	onMoveUp?: () => void
	onMoveDown?: () => void
}

export function BloggerCard({
	blogger,
	isEditMode = false,
	canMoveUp = false,
	canMoveDown = false,
	onUpdate,
	onDelete,
	onMoveUp,
	onMoveDown
}: BloggerCardProps) {
	const [expanded, setExpanded] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const { maxSM } = useSize()
	const [localBlogger, setLocalBlogger] = useState(blogger)
	const [showAvatarDialog, setShowAvatarDialog] = useState(false)
	const [avatarItem, setAvatarItem] = useState<AvatarItem | null>(null)

	useEffect(() => {
		setLocalBlogger(blogger)
	}, [blogger])

	const handleFieldChange = (field: keyof Blogger, value: any) => {
		const updated = { ...localBlogger, [field]: value }
		setLocalBlogger(updated)
		onUpdate?.(updated, blogger, avatarItem || undefined)
	}

	const handleAvatarSubmit = (avatar: AvatarItem) => {
		setAvatarItem(avatar)
		const avatarUrl = avatar.type === 'url' ? avatar.url : avatar.previewUrl
		const updated = { ...localBlogger, avatar: avatarUrl }
		setLocalBlogger(updated)
		onUpdate?.(updated, blogger, avatar)
	}

	const handleCancel = () => {
		setLocalBlogger(blogger)
		setIsEditing(false)
		setAvatarItem(null)
	}

	const canEdit = isEditMode && isEditing

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.6 }}
			{...(maxSM ? { animate: { opacity: 1, scale: 1 } } : { whileInView: { opacity: 1, scale: 1 } })}
			className={cn('card relative block overflow-hidden', isEditMode && 'pt-14')}>
			{isEditMode && (
				<div className='absolute top-3 right-3 z-10 flex flex-wrap justify-end gap-1.5'>
					{isEditing ? (
						<>
							<button
								type='button'
								title='取消编辑'
								aria-label='取消编辑'
								onClick={handleCancel}
								className='rounded-lg border bg-white/60 p-1.5 text-gray-500 transition-colors hover:text-gray-700'>
								<X className='h-4 w-4' />
							</button>
							<button
								type='button'
								title='完成编辑'
								aria-label='完成编辑'
								onClick={() => setIsEditing(false)}
								className='rounded-lg border bg-white/60 p-1.5 text-blue-500 transition-colors hover:text-blue-700'>
								<Check className='h-4 w-4' />
							</button>
						</>
					) : (
						<>
							<button
								type='button'
								title='上移'
								aria-label='上移'
								onClick={onMoveUp}
								disabled={!canMoveUp}
								className='rounded-lg border bg-white/60 p-1.5 text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-35'>
								<ArrowUp className='h-4 w-4' />
							</button>
							<button
								type='button'
								title='下移'
								aria-label='下移'
								onClick={onMoveDown}
								disabled={!canMoveDown}
								className='rounded-lg border bg-white/60 p-1.5 text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-35'>
								<ArrowDown className='h-4 w-4' />
							</button>
							<button
								type='button'
								title='编辑'
								aria-label='编辑'
								onClick={() => setIsEditing(true)}
								className='rounded-lg border bg-white/60 p-1.5 text-blue-500 transition-colors hover:text-blue-700'>
								<Pencil className='h-4 w-4' />
							</button>
							<button
								type='button'
								title='删除'
								aria-label='删除'
								onClick={onDelete}
								className='rounded-lg border bg-white/60 p-1.5 text-red-500 transition-colors hover:text-red-700'>
								<Trash2 className='h-4 w-4' />
							</button>
						</>
					)}
				</div>
			)}

			<div>
				<div className='mb-4 flex items-center gap-4'>
					<div className='group relative'>
						<img
							src={localBlogger.avatar}
							alt={localBlogger.name}
							className={cn('h-16 w-16 rounded-full object-cover', canEdit && 'cursor-pointer')}
							onClick={() => canEdit && setShowAvatarDialog(true)}
						/>
						{canEdit && (
							<div className='ev pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
								<span className='text-xs text-white'>更换</span>
							</div>
						)}
					</div>
					<div className='flex-1'>
						<h3
							contentEditable={canEdit}
							suppressContentEditableWarning
							onBlur={e => handleFieldChange('name', e.currentTarget.textContent || '')}
							className={cn('group-hover:text-brand text-lg font-bold transition-colors focus:outline-none', canEdit && 'cursor-text')}>
							{localBlogger.name}
						</h3>
						{canEdit ? (
							<div
								contentEditable
								suppressContentEditableWarning
								onBlur={e => handleFieldChange('url', e.currentTarget.textContent || '')}
								className='text-secondary mt-1 block max-w-[200px] cursor-text truncate text-xs focus:outline-none'>
								{localBlogger.url}
							</div>
						) : (
							<a
								href={localBlogger.url}
								target='_blank'
								rel='noopener noreferrer'
								className='text-secondary hover:text-brand mt-1 block max-w-[200px] truncate text-xs hover:underline'>
								{localBlogger.url}
							</a>
						)}
					</div>
				</div>

				{canEdit ? (
					<EditableStarRating stars={localBlogger.stars} editable={true} onChange={stars => handleFieldChange('stars', stars)} />
				) : (
					<StarRating stars={localBlogger.stars} />
				)}

				{canEdit && (
					<div className='mt-2 flex gap-2'>
						{(['assistant', 'creative', 'apikey'] as BloggerStatus[]).map(status => (
							<button
								key={status}
								type='button'
								onClick={() => handleFieldChange('status', status)}
								className={`rounded-full px-3 py-1 text-xs transition-colors ${
									(localBlogger.status ?? 'assistant') === status ? 'bg-brand text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
								}`}>
								{statusLabels[status]}
							</button>
						))}
					</div>
				)}

				<p
					contentEditable={canEdit}
					suppressContentEditableWarning
					onBlur={e => handleFieldChange('description', e.currentTarget.textContent || '')}
					onClick={e => {
						if (!canEdit) {
							e.preventDefault()
							setExpanded(!expanded)
						}
					}}
					className={cn(
						'mt-3 text-sm leading-relaxed text-gray-600 transition-all duration-300 focus:outline-none',
						canEdit ? 'cursor-text' : 'cursor-pointer',
						!canEdit && (expanded ? 'line-clamp-none' : 'line-clamp-3')
					)}>
					{localBlogger.description}
				</p>
			</div>

			{canEdit && showAvatarDialog && (
				<AvatarUploadDialog currentAvatar={localBlogger.avatar} onClose={() => setShowAvatarDialog(false)} onSubmit={handleAvatarSubmit} />
			)}
		</motion.div>
	)
}
