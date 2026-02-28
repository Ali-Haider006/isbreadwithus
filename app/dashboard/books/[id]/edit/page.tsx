// app/dashboard/books/[id]/edit/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, X, BookOpen, AlertCircle, Save, Trash2 } from 'lucide-react'

type BookForm = {
  title: string
  author: string
  description: string
  genre: string
  cover_image_url: string | null
}

export default function EditBook() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<BookForm | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [removingCover, setRemovingCover] = useState(false) // user wants to delete existing cover

  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Book not found.')
        setPageLoading(false)
        return
      }

      setForm({
        title: data.title || '',
        author: data.author || '',
        description: data.description || '',
        genre: data.genre || '',
        cover_image_url: data.cover_image_url || null,
      })
      setPageLoading(false)
    }
    load()
  }, [id])

  // ── Cover file handling ──────────────────────────────────────────────────────
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5MB.'); return }
    setCoverFile(file)
    setRemovingCover(false)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const dt = new DataTransfer()
    dt.items.add(file)
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  const clearNewCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.author.trim()) { setError('Author is required.'); return }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      let cover_image_url = form.cover_image_url

      // User wants to remove existing cover
      if (removingCover) {
        await deleteStorageFile(form.cover_image_url)
        cover_image_url = null
      }

      // User uploaded a new cover — replace existing
      if (coverFile) {
        // Delete old one first (best-effort)
        if (form.cover_image_url && !removingCover) {
          await deleteStorageFile(form.cover_image_url)
        }

        const ext = coverFile.name.split('.').pop()
        const fileName = `${Date.now()}_${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('books-images')
          .upload(fileName, coverFile, { upsert: false })

        if (uploadError) {
          setError(`Cover upload failed: ${uploadError.message}`)
          setSaving(false)
          return
        }

        const { data: urlData } = supabase.storage.from('books-images').getPublicUrl(fileName)
        cover_image_url = urlData.publicUrl
      }

      const { error: updateError } = await supabase
        .from('books')
        .update({
          title: form.title.trim(),
          author: form.author.trim(),
          description: form.description.trim() || null,
          genre: form.genre.trim() || null,
          cover_image_url,
        })
        .eq('id', id)

      if (updateError) {
        setError(updateError.message)
      } else {
        // Reflect new cover_image_url in local state
        setForm(prev => prev ? { ...prev, cover_image_url } : prev)
        setCoverFile(null)
        setCoverPreview(null)
        setRemovingCover(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete book ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    await deleteStorageFile(form?.cover_image_url ?? null)
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) {
      setError(error.message)
      setDeleting(false)
      setConfirmDelete(false)
    } else {
      router.push('/dashboard/books')
    }
  }

  // ── Storage helper ────────────────────────────────────────────────────────────
  const deleteStorageFile = async (url: string | null) => {
    if (!url) return
    try {
      const pathParts = url.split('/books-images/')
      if (pathParts.length > 1) {
        await supabase.storage.from('books-images').remove([pathParts[1]])
      }
    } catch { /* best-effort */ }
  }

  // ── Loading / error states ────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#3a4095] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[#3a4095] flex flex-col items-center justify-center gap-4 text-white">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg font-medium">{error || 'Book not found.'}</p>
        <button onClick={() => router.push('/dashboard/books')} className="underline text-white/70 hover:text-white">
          Back to books
        </button>
      </div>
    )
  }

  // What cover to show in the preview area
  const displayCover = coverPreview ?? (removingCover ? null : form.cover_image_url)

  return (
    <div className="min-h-screen bg-[#3a4095] p-6">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/books')}
            className="inline-flex items-center gap-2 text-indigo-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Books
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Book</h1>
          <p className="text-indigo-200 mt-1 text-sm truncate max-w-sm">{form.title || 'Untitled'}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* ── Cover image ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095]/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#3a4095]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Cover Image</h2>
              <span className="text-xs text-gray-400 ml-auto">Optional · Max 5MB</span>
            </div>

            {displayCover ? (
              /* ── Has a cover (existing or newly selected) ── */
              <div className="flex items-start gap-5">
                <img
                  src={displayCover}
                  alt="Book cover"
                  className="w-28 h-40 object-cover rounded-lg shadow-md border border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 space-y-3 pt-1">
                  {coverFile ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{coverFile.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{(coverFile.size / 1024).toFixed(0)} KB · New upload</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                          Replace
                        </button>
                        <button type="button" onClick={clearNewCover}
                          className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1">
                          <X className="h-3 w-3" /> Discard
                        </button>
                      </div>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        ✓ New cover ready — will replace existing on save
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">Current cover image</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                          Replace
                        </button>
                        <button type="button"
                          onClick={() => { setRemovingCover(true); clearNewCover() }}
                          className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1">
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* ── No cover / removed ── */
              <div>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#3a4095]/40 hover:bg-gray-50 transition-all"
                >
                  <div className="w-14 h-14 bg-[#3a4095]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-7 w-7 text-[#3a4095]/60" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Drop cover image here</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse · JPG, PNG, WebP</p>
                </div>
                {removingCover && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    ⚠ Cover will be removed on save.{' '}
                    <button type="button" onClick={() => setRemovingCover(false)} className="underline">Undo</button>
                  </p>
                )}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </div>

          {/* ── Book details ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#3a4095]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Book Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={e => { setForm({ ...form, title: e.target.value }); setError(null) }}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                value={form.author}
                onChange={e => { setForm({ ...form, author: e.target.value }); setError(null) }}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
              <input
                value={form.genre}
                onChange={e => setForm({ ...form, genre: e.target.value })}
                placeholder="e.g. Literary Fiction"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="A brief summary or why this book was chosen..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Error / success */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Book updated successfully.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pb-8">
            <button
              type="button"
              onClick={() => router.push('/dashboard/books')}
              className="px-6 py-3 border-2 border-white/30 text-white rounded-lg hover:border-white/60 font-medium transition-all text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[#3a4095] px-8 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md text-sm"
            >
              {saving ? (
                <><div className="h-4 w-4 border-2 border-[#3a4095] border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Save Changes</>
              )}
            </button>

            {/* Delete */}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-5 py-3 border-2 border-red-400/60 text-red-300 rounded-lg hover:border-red-400 hover:text-red-200 font-medium transition-all text-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium transition-all text-sm"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-3 text-white/70 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}