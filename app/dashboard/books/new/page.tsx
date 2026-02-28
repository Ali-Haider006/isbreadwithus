// app/dashboard/books/new/page.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, X, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'

export default function NewBook() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
  })

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP, etc.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.')
      return
    }
    setCoverFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    // Reuse same validation by feeding into a synthetic change
    const dt = new DataTransfer()
    dt.items.add(file)
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  const removeCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.author.trim()) { setError('Author is required.'); return }

    setLoading(true)
    setError(null)

    try {
      // 1. Upload cover if provided
      let cover_image_url: string | null = null

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const fileName = `${Date.now()}_${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('books-images')
          .upload(fileName, coverFile, { upsert: false })

        if (uploadError) {
          setError(`Cover upload failed: ${uploadError.message}`)
          setLoading(false)
          return
        }

        const { data: urlData } = supabase.storage.from('books-images').getPublicUrl(fileName)
        cover_image_url = urlData.publicUrl
      }

      // 2. Insert book
      const { error: insertError } = await supabase
        .from('books')
        .insert({
          title: form.title.trim(),
          author: form.author.trim(),
          description: form.description.trim() || null,
          genre: form.genre.trim() || null,
          cover_image_url,
        })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard/books')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  // ── UI ───────────────────────────────────────────────────────────────────────

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
          <h1 className="text-3xl font-bold text-white">Add New Book</h1>
          <p className="text-indigo-200 mt-1 text-sm">Add a book to your reading list.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Cover upload ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095]/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#3a4095]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Cover Image</h2>
              <span className="text-xs text-gray-400 ml-auto">Optional · Max 5MB</span>
            </div>

            {coverPreview ? (
              <div className="flex items-start gap-5">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-28 h-40 object-cover rounded-lg shadow-md border border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 space-y-3 pt-1">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{coverFile?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {coverFile ? (coverFile.size / 1024).toFixed(0) + ' KB' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={removeCover}
                      className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Ready to upload
                  </p>
                </div>
              </div>
            ) : (
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
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          {/* ── Book details ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#3a4095]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Book Details</h2>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. The Kite Runner"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                required
                placeholder="e.g. Khaled Hosseini"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
              <input
                name="genre"
                value={form.genre}
                onChange={handleChange}
                placeholder="e.g. Literary Fiction"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="A brief summary or why this book was chosen..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
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
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[#3a4095] px-8 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md text-sm"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-[#3a4095] border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Add Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}