'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Save, Trash2, ArrowLeft, BookOpen } from 'lucide-react'

interface Book {
  id: string
  title: string | null
  author: string | null
  cover_image_url: string | null
}

interface PaymentRecipient {
  id: string
  recipient_name: string
  bank_name: string | null
  bank_account_number: string | null
}

interface Meetup {
  id: string
  title: string | null
  description: string | null
  meetup_date: string | null
  meetup_time: string | null
  location: string | null
  payment_required: boolean | null
  payment_amount: number | null
  payment_recipient_id: string | null
  max_slots: number | null
  status: 'upcoming' | 'completed' | 'cancelled'
  book_id: string | null
}

export default function EditMeetup() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [form, setForm] = useState<Meetup | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [paymentRecipients, setPaymentRecipients] = useState<PaymentRecipient[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<PaymentRecipient | null>(null)

  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ── Fetch meetup + supporting data ───────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [
        { data: meetupData, error: meetupError },
        { data: booksData },
        { data: recipientsData },
      ] = await Promise.all([
        supabase.from('meetups').select('*').eq('id', id).single(),
        supabase.from('books').select('id, title, author, cover_image_url').order('title'),
        supabase.from('payment_recipients').select('*').order('recipient_name'),
      ])

      if (meetupError || !meetupData) {
        setError('Meetup not found.')
        setPageLoading(false)
        return
      }

      setForm(meetupData as Meetup)
      setBooks(booksData || [])
      setPaymentRecipients(recipientsData || [])

      if (meetupData.payment_recipient_id && recipientsData) {
        const match = recipientsData.find(r => r.id === meetupData.payment_recipient_id)
        setSelectedRecipient(match || null)
      }

      setPageLoading(false)
    }
    load()
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!form) return
    const { name, value, type } = e.target
    setForm({
      ...form,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value === '' ? null : value,
    })
    setError(null)
    setSuccess(false)
  }

  const handleRecipientChange = (recipientId: string) => {
    if (!form) return
    setForm({ ...form, payment_recipient_id: recipientId || null })
    setSelectedRecipient(paymentRecipients.find(r => r.id === recipientId) || null)
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('meetups')
      .update({
        title: form.title,
        description: form.description,
        meetup_date: form.meetup_date,
        meetup_time: form.meetup_time,
        location: form.location,
        payment_required: form.payment_required,
        payment_amount: form.payment_required ? form.payment_amount : null,
        payment_recipient_id: form.payment_required ? form.payment_recipient_id : null,
        max_slots: form.max_slots,
        status: form.status,
        book_id: form.book_id || null,
      })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    const { error: deleteError } = await supabase.from('meetups').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      setConfirmDelete(false)
    } else {
      router.push('/dashboard/meetups')
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
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
        <p className="text-lg font-medium">{error || 'Meetup not found.'}</p>
        <button onClick={() => router.push('/dashboard/meetups')} className="underline text-white/80 hover:text-white">
          Back to meetups
        </button>
      </div>
    )
  }

  // ── Status badge color ─────────────────────────────────────────────────────
  const statusColors = {
    upcoming:  'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  }

  return (
    <div className="min-h-screen bg-[#3a4095] p-6">
      <div className="max-w-3xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/dashboard/meetups')}
              className="inline-flex items-center gap-2 text-indigo-200 hover:text-white text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Meetups
            </button>
            <h1 className="text-3xl font-bold text-white">Edit Meetup</h1>
            <p className="text-indigo-200 mt-1 text-sm truncate max-w-sm">{form.title}</p>
          </div>

          {/* Status badge */}
          <span className={`mt-6 px-3 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${statusColors[form.status]}`}>
            {form.status}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* ── Meetup Details ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3a4095]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Meetup Details</h2>
            </div>

            {/* Title */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Title *</label>
              <input
                name="title"
                required
                value={form.title || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none resize-none"
              />
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Date *</label>
                <input
                  type="date"
                  name="meetup_date"
                  required
                  value={form.meetup_date || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  name="meetup_time"
                  value={form.meetup_time || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Location *</label>
              <input
                name="location"
                required
                value={form.location || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Max Slots */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Maximum Attendees</label>
              <input
                type="number"
                name="max_slots"
                value={form.max_slots ?? ''}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* ── Payment ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3a4095]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
            </div>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="payment_required"
                checked={form.payment_required ?? false}
                onChange={e => {
                  setForm({
                    ...form,
                    payment_required: e.target.checked,
                    payment_amount: e.target.checked ? form.payment_amount : null,
                    payment_recipient_id: e.target.checked ? form.payment_recipient_id : null,
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
                      name="payment_amount"
                      value={form.payment_amount ?? ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required={form.payment_required ?? false}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Payment Recipient</label>
                  <select
                    value={form.payment_recipient_id || ''}
                    onChange={e => handleRecipientChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
                  >
                    <option value="">Choose a recipient...</option>
                    {paymentRecipients.map(r => (
                      <option key={r.id} value={r.id}>{r.recipient_name}</option>
                    ))}
                  </select>
                </div>

                {selectedRecipient && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="font-semibold text-blue-900 mb-3">Recipient Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="font-medium text-blue-900 min-w-[140px]">Name:</span>
                        <span className="text-blue-800">{selectedRecipient.recipient_name}</span>
                      </div>
                      {selectedRecipient.bank_name && (
                        <div className="flex gap-2">
                          <span className="font-medium text-blue-900 min-w-[140px]">Bank:</span>
                          <span className="text-blue-800">{selectedRecipient.bank_name}</span>
                        </div>
                      )}
                      {selectedRecipient.bank_account_number && (
                        <div className="flex gap-2">
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

          {/* ── Book ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-[#3a4095]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3a4095]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Book</h2>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Linked Book</label>
              <select
                name="book_id"
                value={form.book_id || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#3a4095] focus:border-transparent transition-all outline-none"
              >
                <option value="">No book linked</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} {book.author ? `— ${book.author}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover preview for selected book */}
            {form.book_id && (() => {
              const selected = books.find(b => b.id === form.book_id)
              return selected ? (
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {selected.cover_image_url ? (
                    <img
                      src={selected.cover_image_url}
                      alt={selected.title || ''}
                      className="w-12 h-16 object-cover rounded shadow flex-shrink-0"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-12 h-16 bg-[#3a4095]/10 rounded flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-[#3a4095]/50" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{selected.title}</p>
                    <p className="text-xs text-gray-500">{selected.author}</p>
                  </div>
                </div>
              ) : null
            })()}
          </div>

          {/* ── Error / Success ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Meetup updated successfully.</span>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center gap-4 pt-2 pb-8">
            <button
              type="button"
              onClick={() => router.push('/dashboard/meetups')}
              className="px-6 py-3 border-2 border-white/30 text-white rounded-lg hover:border-white/60 font-medium transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[#3a4095] px-8 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>

            {/* Delete */}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-5 py-3 border-2 border-red-400/60 text-red-300 rounded-lg hover:border-red-400 hover:text-red-200 font-medium transition-all"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium transition-all"
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