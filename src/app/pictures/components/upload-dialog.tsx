'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'
import type { ImageItem } from '../../projects/components/image-upload-dialog'

interface UploadDialogProps {
	onClose: () => void
	onSubmit: (payload: { images: ImageItem[]; description: string }) => Promise<void> | void
}

export default function UploadDialog({ onClose, onSubmit }: UploadDialogProps) {
	const [description, setDescription] = useState('')
	const [images, setImages] = useState<ImageItem[]>([])
	const [urlInput, setUrlInput] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (files.length === 0) return

		const nextImages: ImageItem[] = []

		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				toast.error('请选择图片文件')
				return
			}

			const previewUrl = URL.createObjectURL(file)
			nextImages.push({
				type: 'file',
				file,
				previewUrl
			})
		}

		setImages(prev => [...prev, ...nextImages])
		if (e.currentTarget) e.currentTarget.value = ''
	}

	const handleAddUrl = () => {
		const value = urlInput.trim()
		if (!value) {
			toast.error('请输入图片 URL')
			return
		}

		setImages(prev => [...prev, { type: 'url', url: value }])
		setUrlInput('')
	}

	const cleanupImages = (list: ImageItem[]) => {
		list.forEach(image => {
			if (image.type === 'file') {
				URL.revokeObjectURL(image.previewUrl)
			}
		})
	}

	const handleSubmit = async () => {
		if (images.length === 0) {
			toast.error('请至少选择一张图片')
			return
		}

		try {
			setSubmitting(true)
			await onSubmit({
				images,
				description
			})

			cleanupImages(images)
			setImages([])
			setDescription('')
			setUrlInput('')
			onClose()
		} finally {
			setSubmitting(false)
		}
	}

	const handleClose = () => {
		cleanupImages(images)
		setImages([])
		setDescription('')
		setUrlInput('')
		onClose()
	}

	return (
		<DialogModal open onClose={handleClose} className='card w-md max-sm:w-full'>
			<div className='space-y-4'>
				<h2 className='text-xl font-bold'>上传图片</h2>

				<div>
					<label className='text-secondary mb-2 block text-sm font-medium'>选择图片（可多选）</label>
					<input ref={fileInputRef} type='file' accept='image/*' multiple className='hidden' onChange={handleFileSelect} />

					{images.length === 0 ? (
						<div
							onClick={() => fileInputRef.current?.click()}
							className='flex h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-secondary/10'>
							<div className='text-center'>
								<Plus className='mx-auto mb-1 h-8 w-8 text-gray-500' />
								<p className='text-secondary text-xs'>点击选择图片</p>
							</div>
						</div>
					) : (
						<>
							<div className='relative flex h-40 items-center justify-center overflow-visible rounded-xl bg-linear-to-br from-gray-50 to-gray-100'>
								{images.slice(0, 3).map((image, index) => {
									const previewUrl = image.type === 'file' ? image.previewUrl : image.url
									return (
										<div
											key={index}
											className={`absolute h-32 w-44 overflow-hidden rounded-xl border-4 border-white bg-white shadow-xl transition-transform ${
												index === 0 ? '-left-4 -translate-y-2 -rotate-6' : index === 1 ? 'z-20 rotate-1' : 'right-0 translate-y-2 rotate-6'
											}`}>
											<img src={previewUrl} alt={`preview-${index}`} className='h-full w-full object-cover' />
										</div>
									)
								})}

								{images.length > 3 && (
									<div className='absolute right-4 -bottom-2 rounded-full bg-black/70 px-3 py-1 text-xs text-white shadow-lg'>共 {images.length} 张</div>
								)}
							</div>

							<div className='mt-3 flex items-center justify-between'>
								<span className='text-secondary text-xs'>已选择 {images.length} 张图片</span>
								<button
									type='button'
									onClick={() => fileInputRef.current?.click()}
									className='rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-50'>
									继续添加
								</button>
							</div>
						</>
					)}
				</div>

				<div className='rounded-xl border border-white/50 bg-white/40 p-3'>
					<label className='text-secondary mb-2 block text-sm font-medium'>图片 URL（可选）</label>
					<div className='flex gap-2'>
						<input
							type='url'
							value={urlInput}
							onChange={e => setUrlInput(e.target.value)}
							placeholder='https://example.com/photo.jpg'
							className='min-w-0 flex-1 rounded-lg border border-gray-300 bg-white/70 px-3 py-2 text-sm focus:outline-none'
						/>
						<button type='button' onClick={handleAddUrl} className='rounded-lg border bg-white/70 px-3 py-2 text-sm transition-colors hover:bg-white'>
							添加
						</button>
					</div>
				</div>

				<div>
					<label className='text-secondary mb-2 block text-sm font-medium'>描述（可选，应用于本次所有图片）</label>
					<textarea
						value={description}
						onChange={e => setDescription(e.target.value)}
						placeholder='这组图片的说明...'
						className='w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none'
						rows={3}
					/>
				</div>

				<div className='mt-4 flex gap-3'>
					<button
						type='button'
						onClick={handleClose}
						disabled={submitting}
						className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50'>
						取消
					</button>
					<button type='button' onClick={handleSubmit} disabled={submitting} className='brand-btn flex-1 justify-center px-4'>
						{submitting ? '保存中...' : '确认上传'}
					</button>
				</div>
			</div>
		</DialogModal>
	)
}
