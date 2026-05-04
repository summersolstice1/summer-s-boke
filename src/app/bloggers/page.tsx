'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import GridView, { type Blogger, type BloggerStatus } from './grid-view'
import CreateDialog from './components/create-dialog'
import initialList from './list.json'

const STORAGE_KEY = 'ai-tools-share-items-v1'

const getBloggerKey = (blogger: Blogger) => blogger.id ?? blogger.url

const createInitialId = (blogger: Blogger, index: number) => {
	const source = `${index}-${blogger.status ?? 'assistant'}-${blogger.url || blogger.name}`
	const id = source
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
	return id || `ai-tool-${index}`
}

const createNewId = () => `ai-tool-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const normalizeBloggers = (items: Blogger[]) =>
	items.map((item, index) => ({
		...item,
		id: item.id ?? createInitialId(item, index),
		status: item.status ?? 'assistant'
	}))

const defaultBloggers = normalizeBloggers(initialList as Blogger[])

export default function Page() {
	const [bloggers, setBloggers] = useState<Blogger[]>(defaultBloggers)
	const [originalBloggers, setOriginalBloggers] = useState<Blogger[]>(defaultBloggers)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingBlogger, setEditingBlogger] = useState<Blogger | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [defaultCreateStatus, setDefaultCreateStatus] = useState<BloggerStatus>('assistant')

	const handleUpdate = (updatedBlogger: Blogger, oldBlogger: Blogger) => {
		const oldId = getBloggerKey(oldBlogger)
		setBloggers(prev => prev.map(b => (getBloggerKey(b) === oldId ? { ...updatedBlogger, id: oldId, status: updatedBlogger.status ?? 'assistant' } : b)))
	}

	const handleAdd = (status: BloggerStatus = 'assistant') => {
		setEditingBlogger(null)
		setDefaultCreateStatus(status)
		setIsCreateDialogOpen(true)
	}

	const handleSaveBlogger = (updatedBlogger: Blogger) => {
		if (editingBlogger) {
			const editingId = getBloggerKey(editingBlogger)
			const updated = bloggers.map(b => (getBloggerKey(b) === editingId ? { ...updatedBlogger, id: editingId } : b))
			setBloggers(updated)
		} else {
			setBloggers([...bloggers, { ...updatedBlogger, id: createNewId(), status: updatedBlogger.status ?? defaultCreateStatus }])
		}
	}

	const handleDelete = (blogger: Blogger) => {
		if (confirm(`确定要删除 ${blogger.name} 吗？`)) {
			const id = getBloggerKey(blogger)
			setBloggers(bloggers.filter(b => getBloggerKey(b) !== id))
		}
	}

	const handleMove = (blogger: Blogger, targetBlogger: Blogger) => {
		setBloggers(prev => {
			const currentIndex = prev.findIndex(item => getBloggerKey(item) === getBloggerKey(blogger))
			const targetIndex = prev.findIndex(item => getBloggerKey(item) === getBloggerKey(targetBlogger))
			if (currentIndex < 0 || targetIndex < 0) return prev

			const next = [...prev]
			const [current] = next.splice(currentIndex, 1)
			next.splice(targetIndex, 0, current)
			return next
		})
	}

	const handleManage = () => {
		setOriginalBloggers(bloggers)
		setIsEditMode(true)
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(bloggers))
			setOriginalBloggers(bloggers)
			setIsEditMode(false)
			toast.success('已保存到本地浏览器')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setBloggers(originalBloggers)
		setIsEditMode(false)
	}

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY)
			if (!saved) return

			const parsed = JSON.parse(saved)
			if (!Array.isArray(parsed)) return

			const storedBloggers = normalizeBloggers(parsed as Blogger[])
			setBloggers(storedBloggers)
			setOriginalBloggers(storedBloggers)
		} catch (error) {
			console.error('Failed to load AI tools from local storage:', error)
		}
	}, [])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				handleManage()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [bloggers, isEditMode])

	return (
		<>
			<GridView
				bloggers={bloggers}
				isEditMode={isEditMode}
				isSaving={isSaving}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				onAdd={handleAdd}
				onCancel={handleCancel}
				onManage={handleManage}
				onMove={handleMove}
				onSave={handleSave}
			/>

			{isCreateDialogOpen && (
				<CreateDialog blogger={editingBlogger} defaultStatus={defaultCreateStatus} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveBlogger} />
			)}
		</>
	)
}
