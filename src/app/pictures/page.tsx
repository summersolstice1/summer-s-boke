'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { DialogModal } from '@/components/dialog-modal'
import initialList from './list.json'
import { RandomLayout } from './components/random-layout'
import UploadDialog from './components/upload-dialog'
import type { ImageItem } from '../projects/components/image-upload-dialog'
import { useRouter } from 'next/navigation'

export interface Picture {
	id: string
	uploadedAt: string
	description?: string
	image?: string
	images?: string[]
}

const LOCAL_PICTURES_KEY = 'planet-blog:pictures:v1'

const clonePictures = (list: Picture[]) => JSON.parse(JSON.stringify(list)) as Picture[]

const readFileAsDataUrl = (file: File) =>
	new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result || ''))
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(file)
	})

function loadLocalPictures() {
	try {
		const saved = window.localStorage.getItem(LOCAL_PICTURES_KEY)
		if (!saved) return null
		const parsed = JSON.parse(saved)
		return Array.isArray(parsed) ? (parsed as Picture[]) : null
	} catch (error) {
		console.error('Failed to load local pictures:', error)
		return null
	}
}

export default function Page() {
	const [pictures, setPictures] = useState<Picture[]>(initialList as Picture[])
	const [originalPictures, setOriginalPictures] = useState<Picture[]>(initialList as Picture[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
	const [editingPicture, setEditingPicture] = useState<Picture | null>(null)
	const router = useRouter()

	useEffect(() => {
		const localPictures = loadLocalPictures()
		if (localPictures) {
			setPictures(localPictures)
			setOriginalPictures(clonePictures(localPictures))
		}
	}, [])

	const handleUploadSubmit = async ({ images, description }: { images: ImageItem[]; description: string }) => {
		const now = new Date().toISOString()

		if (images.length === 0) {
			toast.error('请至少选择一张图片')
			return
		}

		const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
		const desc = description.trim() || undefined

		const imageUrls = await Promise.all(images.map(imageItem => (imageItem.type === 'url' ? imageItem.url : readFileAsDataUrl(imageItem.file))))

		const newPicture: Picture = {
			id,
			uploadedAt: now,
			description: desc,
			images: imageUrls
		}

		setPictures(prev => [...prev, newPicture])
		toast.success('已添加照片，保存后会写入本地图库')
	}

	const handleDeleteSingleImage = (pictureId: string, imageIndex: number | 'single') => {
		if (!confirm('确定删除这张照片吗？删除后需要点击保存才会写入本地图库。')) return

		setPictures(prev => {
			return prev
				.map(picture => {
					if (picture.id !== pictureId) return picture

					// 如果是 single image，删除整个 Picture
					if (imageIndex === 'single') {
						return null
					}

					// 如果是 images 数组中的图片
					if (picture.images && picture.images.length > 0) {
						const newImages = picture.images.filter((_, idx) => idx !== imageIndex)
						// 如果删除后数组为空，删除整个 Picture
						if (newImages.length === 0) {
							return null
						}
						return {
							...picture,
							images: newImages
						}
					}

					return picture
				})
				.filter((p): p is Picture => p !== null)
		})
	}

	const handleDeleteGroup = (picture: Picture) => {
		if (!confirm('确定要删除这一组图片吗？删除后需要点击保存才会写入本地图库。')) return

		setPictures(prev => prev.filter(p => p.id !== picture.id))
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			window.localStorage.setItem(LOCAL_PICTURES_KEY, JSON.stringify(pictures))
			setOriginalPictures(clonePictures(pictures))
			setIsEditMode(false)
			toast.success('图片已保存到浏览器本地')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error('保存失败，图片可能过大；可以先用压缩工具处理后再上传')
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setPictures(clonePictures(originalPictures))
		setIsEditMode(false)
	}

	const handleSaveDescription = (pictureId: string, description: string) => {
		const value = description.trim()
		setPictures(prev => prev.map(picture => (picture.id === pictureId ? { ...picture, description: value || undefined } : picture)))
		setEditingPicture(null)
		toast.success('备注已更新，保存后会写入本地图库')
	}

	const handleRestoreDefault = () => {
		if (!confirm('确定清除本地图库修改并恢复默认图片吗？这个操作会删除浏览器本地保存的图片数据。')) return
		window.localStorage.removeItem(LOCAL_PICTURES_KEY)
		const defaults = clonePictures(initialList as Picture[])
		setPictures(defaults)
		setOriginalPictures(clonePictures(defaults))
		setIsEditMode(false)
		toast.success('已恢复默认图库')
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<>
			<RandomLayout
				pictures={pictures}
				isEditMode={isEditMode}
				onDeleteSingle={handleDeleteSingleImage}
				onDeleteGroup={handleDeleteGroup}
				onEditDescription={setEditingPicture}
			/>

			{pictures.length === 0 && (
				<div className='text-secondary flex min-h-screen items-center justify-center text-center text-sm'>
					还没有上传图片，点击右上角「编辑」后即可开始上传。
				</div>
			)}

			<motion.div
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				className='fixed top-4 right-32 z-40 flex gap-3 max-sm:top-20 max-sm:right-4 max-sm:left-4 max-sm:flex-wrap max-sm:justify-end'>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push('/image-toolbox')}
							className='rounded-xl border bg-blue-50 px-4 py-2 text-sm text-blue-700'>
							压缩工具
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleRestoreDefault}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-4 py-2 text-sm'>
							恢复默认
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsUploadDialogOpen(true)}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							上传
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : '保存'}
						</motion.button>
					</>
				) : (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setIsEditMode(true)}
						className='rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
						编辑图库
					</motion.button>
				)}
			</motion.div>

			{isUploadDialogOpen && <UploadDialog onClose={() => setIsUploadDialogOpen(false)} onSubmit={handleUploadSubmit} />}
			{editingPicture && <DescriptionDialog picture={editingPicture} onClose={() => setEditingPicture(null)} onSave={handleSaveDescription} />}
		</>
	)
}

function DescriptionDialog({
	picture,
	onClose,
	onSave
}: {
	picture: Picture
	onClose: () => void
	onSave: (pictureId: string, description: string) => void
}) {
	const [description, setDescription] = useState(picture.description || '')

	return (
		<DialogModal open onClose={onClose} className='card static w-[460px] max-sm:w-full'>
			<div className='space-y-4'>
				<div>
					<h2 className='text-xl font-bold'>编辑备注</h2>
					<p className='text-secondary mt-1 text-sm'>备注会应用到这一组照片。</p>
				</div>
				<textarea
					value={description}
					onChange={e => setDescription(e.target.value)}
					placeholder='写点照片背后的故事...'
					className='min-h-32 w-full resize-none rounded-xl border border-gray-300 bg-white/70 px-3 py-2 text-sm focus:outline-none'
				/>
				<div className='flex gap-3'>
					<button type='button' onClick={onClose} className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50'>
						取消
					</button>
					<button type='button' onClick={() => onSave(picture.id, description)} className='brand-btn flex-1 justify-center px-4'>
						保存备注
					</button>
				</div>
			</div>
		</DialogModal>
	)
}
