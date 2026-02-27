'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Upload, X, CheckCircle } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  genre: string | null
  cover_image_url: string | null
}

interface PaymentRecipient {
  id: string
  recipient_name: string
  bank_name: string | null
  bank_account_number: string | null
}

export default function NewMeetup() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    meetup_date: '',
    meetup_time: '',
    location: '',
    payment_required: false,
    payment_amount: 0,
    payment_recipient_id: '',
    max_slots: 30,
    status: 'upcoming' as const,
    book_id: '',
  })

  const [newBookData, setNewBookData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
  })

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)

  const [books, setBooks] = useState<Book[]>([])
  const [booksError, setBooksError] = useState<string | null>(null)
  const [paymentRecipients, setPaymentRecipients] = useState<PaymentRecipient[]>([])
  const [recipientsError, setRecipientsError] = useState<string | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<PaymentRecipient | null>(null)
  const [showNewBookForm, setShowNewBookForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooks()
    fetchPaymentRecipients()
  }, [])

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true })

    if (error) setBooksError(error.message)
    else if (data) { setBooks(data); setBooksError(null) }
  }

  const fetchPaymentRecipients = async () => {
    const { data, error } = await supabase
      .from('payment_recipients')
      .select('*')
      .order('recipient_name', { ascending: true })

    if (error) setRecipientsError(error.message)
    else if (data) { setPaymentRecipients(data); setRecipientsError(null) }
  }

  const handleRecipientChange = (recipientId: string) => {
    setForm({ ...form, payment_recipient_id: recipientId })
    setSelectedRecipient(paymentRecipients.find(r => r.id === recipientId) || null)
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB')
      return
    }

    setCoverImageFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setCoverImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeCoverImage = () => {
    setCoverImageFile(null)
    setCoverImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin/sign-in'); return }

    try {
      let finalBookId = form.book_id

      // If creating a new book
      if (showNewBookForm && !form.book_id) {
        // 1. Upload cover image first if provided
        let cover_image_url: string | null = null

        if (coverImageFile) {
          const ext = coverImageFile.name.split('.').pop()
          const fileName = `${Date.now()}_${newBookData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('books-images')
            .upload(fileName, coverImageFile, { upsert: false })

          if (uploadError) {
            setError(`Failed to upload cover image: ${uploadError.message}`)
            setLoading(false)
            return
          }

          const { data: urlData } = supabase.storage.from('books-images').getPublicUrl(fileName)
          cover_image_url = urlData.publicUrl
        }

        // 2. Insert book with cover_image_url
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .insert({
            title: newBookData.title,
            author: newBookData.author,
            description: newBookData.description || null,
            genre: newBookData.genre || null,
            cover_image_url,
          })
          .select()
          .single()

        if (bookError) {
          setError(`Failed to create book: ${bookError.message}`)
          setLoading(false)
          return
        }

        finalBookId = bookData.id
      }

      // 3. Create meetup
      const { error: meetupError } = await supabase
        .from('meetups')
        .insert({
          title: form.title,
          description: form.description || null,
          meetup_date: form.meetup_date,
          meetup_time: form.meetup_time || null,
          location: form.location,
          payment_required: form.payment_required,
          payment_amount: form.payment_required ? form.payment_amount : null,
          payment_recipient_id: form.payment_required ? form.payment_recipient_id : null,
          max_slots: form.max_slots,
          status: form.status,
          book_id: finalBookId || null,
          created_by: user.id,
        })

      if (meetupError) {
        setError(`Failed to create meetup: ${meetupError.message}`)
      } else {
        router.push('/dashboard/meetups')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleNewBookChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewBookData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-[#3a4095] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Meetup</h1>
          <p className="text-indigo-100">Fill in the details below to schedule a new book club meetup</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meetup Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095] bg-opacity-10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3a4095]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Meetup Details</h2>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Title *</label>
              <input
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                placeholder="Enter meetup title"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none resize-none"
                placeholder="What will you discuss at this meetup?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Date *</label>
                <input
                  type="date"
                  required
                  value={form.meetup_date}
                  onChange={e => setForm({ ...form, meetup_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={form.meetup_time}
                  onChange={e => setForm({ ...form, meetup_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Location *</label>
              <input
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Readings, Lahore"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Maximum Attendees</label>
              <input
                type="number"
                value={form.max_slots}
                onChange={e => setForm({ ...form, max_slots: Number(e.target.value) || 30 })}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095] bg-opacity-10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3a4095]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
            </div>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={form.payment_required}
                onChange={e => {
                  setForm({
                    ...form,
                    payment_required: e.target.checked,
                    payment_amount: e.target.checked ? form.payment_amount : 0,
                    payment_recipient_id: e.target.checked ? form.payment_recipient_id : '',
                  })
                  if (!e.target.checked) setSelectedRecipient(null)
                }}
                className="h-5 w-5 text-[#3a4095] rounded focus:ring-2 focus:ring-[#3a4095] focus:ring-offset-2"
              />
              <span className="font-medium text-gray-900">Payment Required</span>
            </label>

            {form.payment_required && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Amount (PKR) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₨</span>
                    <input
                      type="number"
                      value={form.payment_amount}
                      onChange={e => setForm({ ...form, payment_amount: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      required={form.payment_required}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Payment Recipient *</label>
                  {recipientsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-3 text-sm flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Error loading recipients: {recipientsError}
                    </div>
                  )}
                  <select
                    value={form.payment_recipient_id}
                    onChange={e => handleRecipientChange(e.target.value)}
                    required={form.payment_required}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                  >
                    <option value="">Choose a recipient...</option>
                    {paymentRecipients.map(recipient => (
                      <option key={recipient.id} value={recipient.id}>
                        {recipient.recipient_name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRecipient && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recipient Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-blue-900 min-w-[140px]">Name:</span>
                        <span className="text-blue-800">{selectedRecipient.recipient_name}</span>
                      </div>
                      {selectedRecipient.bank_name && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-900 min-w-[140px]">Bank:</span>
                          <span className="text-blue-800">{selectedRecipient.bank_name}</span>
                        </div>
                      )}
                      {selectedRecipient.bank_account_number && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-blue-900 min-w-[140px]">Account Number:</span>
                          <span className="text-blue-800 font-mono">{selectedRecipient.bank_account_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Book Selection Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095] bg-opacity-10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3a4095]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Book Selection</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setShowNewBookForm(false); setForm({ ...form, book_id: '' }) }}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  !showNewBookForm ? 'bg-[#3a4095] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => { setShowNewBookForm(true); setForm({ ...form, book_id: '' }) }}
                className={`py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  showNewBookForm ? 'bg-[#3a4095] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus className="h-4 w-4" />
                Create New
              </button>
            </div>

            {/* ── Select Existing ── */}
            {!showNewBookForm ? (
              <div>
                <label className="block mb-2 font-medium text-gray-700">Select Book</label>
                {booksError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-3 text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Error loading books: {booksError}
                  </div>
                )}
                <select
                  name="book_id"
                  value={form.book_id}
                  onChange={e => setForm({ ...form, book_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                >
                  <option value="">Choose a book (optional)...</option>
                  {books.length > 0 ? (
                    books.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} - {book.author}
                      </option>
                    ))
                  ) : (
                    <option disabled>No books available</option>
                  )}
                </select>

                {/* Cover preview for selected existing book */}
                {form.book_id && (() => {
                  const selected = books.find(b => b.id === form.book_id)
                  return selected?.cover_image_url ? (
                    <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img
                        src={selected.cover_image_url}
                        alt={selected.title}
                        className="w-12 h-16 object-cover rounded shadow flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{selected.title}</p>
                        <p className="text-xs text-gray-500">{selected.author}</p>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>

            ) : (
              /* ── Create New Book ── */
              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Book Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newBookData.title}
                      onChange={handleNewBookChange}
                      required={showNewBookForm}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                      placeholder="Enter book title"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">Author *</label>
                    <input
                      type="text"
                      name="author"
                      value={newBookData.author}
                      onChange={handleNewBookChange}
                      required={showNewBookForm}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                      placeholder="Enter author name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={newBookData.description}
                    onChange={handleNewBookChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none resize-none"
                    placeholder="Brief description of the book"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={newBookData.genre}
                    onChange={handleNewBookChange}
                    placeholder="e.g. Fiction, Self-help"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                  />
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Book Cover Image</label>
                  <p className="text-xs text-gray-400 mb-3">JPG, PNG up to 5MB</p>

                  {coverImagePreview ? (
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-28 h-40 object-cover rounded-lg shadow border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-green-600 mt-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="break-all">{coverImageFile?.name}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#3a4095] hover:bg-indigo-50/30 transition-colors group"
                    >
                      <Upload className="h-7 w-7 text-gray-400 group-hover:text-[#3a4095] mx-auto mb-2 transition-colors" />
                      <p className="text-sm font-medium text-gray-600 group-hover:text-[#3a4095] transition-colors">
                        Click to upload cover image
                      </p>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border-2 border-gray-300 text-white rounded-lg hover:bg-gray-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#3a4095] text-white px-8 py-3 rounded-lg hover:bg-[#2d3175] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : 'Create Meetup'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>{error}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}