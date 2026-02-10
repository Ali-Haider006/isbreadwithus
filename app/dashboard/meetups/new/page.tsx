'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  description: string
  genre: string
  status: string
  start_date: string
  end_date: string
}

export default function NewMeetup() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    meetup_date: '',
    meetup_time: '',
    end_time: '',
    location: '',
    location_details: '',
    book_name: '',
    payment_required: false,
    payment_amount: 0,
    payment_instructions: '',
    max_slots: 30,
    status: 'upcoming',
    book_id: '',
  })

  const [newBookData, setNewBookData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    status: 'upcoming',
    start_date: '',
    end_date: '',
  })

  const [books, setBooks] = useState<Book[]>([])
  const [booksError, setBooksError] = useState<string | null>(null)
  const [showNewBookForm, setShowNewBookForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setBooksError(error.message)
    } else if (data) {
      setBooks(data)
      setBooksError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/admin/sign-in')

    try {
      let finalBookId = form.book_id

      // If creating a new book
      if (showNewBookForm && !form.book_id) {
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .insert({
            title: newBookData.title,
            author: newBookData.author,
            description: newBookData.description,
            genre: newBookData.genre,
            start_date: newBookData.start_date || null,
            end_date: newBookData.end_date || null,
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

      // Create meetup
      const { error: meetupError } = await supabase
        .from('meetups')
        .insert({
          title: form.title,
          description: form.description,
          meetup_date: form.meetup_date,
          meetup_time: form.meetup_time || null,
          end_time: form.end_time || null,
          location: form.location,
          location_details: form.location_details || null,
          payment_required: form.payment_required,
          payment_amount: form.payment_required ? form.payment_amount : null,
          payment_instructions: form.payment_required ? form.payment_instructions : null,
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
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNewBookChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setNewBookData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Meetup</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Meetup Details Section */}
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="text-lg font-semibold">Meetup Details</h2>

          {/* title */}
          <div>
            <label className="block mb-1 font-medium text-black">Title *</label>
            <input
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded px-3 py-2 text-black"
            />
          </div>

          {/* description */}
          <div>
            <label className="block mb-1 font-medium text-black">Description</label>
            <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full border rounded px-3 py-2 text-black"
            />
          </div>

          {/* date + times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium text-black">Date *</label>
              <input
                 type="date"
                 required
                 value={form.meetup_date}
                 onChange={e => setForm({ ...form, meetup_date: e.target.value })}
                 className="w-full border rounded px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-black">Start Time</label>
              <input
                 type="time"
                 value={form.meetup_time}
                 onChange={e => setForm({ ...form, meetup_time: e.target.value })}
                 className="w-full border rounded px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-black">End Time</label>
              <input
                 type="time"
                 value={form.end_time}
                 onChange={e => setForm({ ...form, end_time: e.target.value })}
                 className="w-full border rounded px-3 py-2 text-black"
              />
            </div>
          </div>

          {/* location */}
          <div>
            <label className="block mb-1 font-medium text-black">Location *</label>
            <input
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Readings, Lahore"
                className="w-full border rounded px-3 py-2 text-black"
            />
          </div>

          {/* location details */}
          <div>
            <label className="block mb-1 font-medium text-black">Location Details</label>
            <textarea
                value={form.location_details}
                onChange={e => setForm({ ...form, location_details: e.target.value })}
                rows={2}
                placeholder="Additional directions or information"
                className="w-full border rounded px-3 py-2 text-black"
            />
          </div>

          {/* max slots */}
          <div>
            <label className="block mb-1 font-medium text-black">Max Slots</label>
            <input
                type="number"
                value={form.max_slots}
                onChange={e => setForm({ ...form, max_slots: Number(e.target.value) || 30 })}
                min="1"
                className="w-full border rounded px-3 py-2 text-black"
            />
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="text-lg font-semibold text-black">Payment Information</h2>

          <label className="flex items-center gap-2 text-black">
            <input
              type="checkbox"
              checked={form.payment_required}
              onChange={e => setForm({ ...form, payment_required: e.target.checked })}
              className="h-4 w-4"
            />
            <span>Payment Required</span>
          </label>

          {form.payment_required && (
            <>
              <div>
                <label className="block mb-1 font-medium text-black">Amount (PKR) *</label>
                <input
                  type="number"
                  value={form.payment_amount}
                  onChange={e => setForm({ ...form, payment_amount: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  required={form.payment_required}
                  className="w-full border rounded px-3 py-2 text-black"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-black">Payment Instructions</label>
                <textarea
                  value={form.payment_instructions}
                  onChange={e => setForm({ ...form, payment_instructions: e.target.value })}
                  rows={3}
                  placeholder="Easypaisa / Bank transfer details..."
                  className="w-full border rounded px-3 py-2 text-black"
                />
              </div>
            </>
          )}
        </div>

        {/* Book Selection Section */}
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="text-lg font-semibold text-black">Book Selection</h2>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowNewBookForm(false)
                setForm({ ...form, book_id: '' })
              }}
              className={`flex-1 py-2 px-4 rounded ${
                !showNewBookForm
                  ? 'bg-[#3a4095] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Select Existing Book
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewBookForm(true)
                setForm({ ...form, book_id: '' })
              }}
              className={`flex-1 py-2 px-4 rounded flex items-center justify-center gap-2 ${
                showNewBookForm
                  ? 'bg-[#3a4095] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Plus className="h-4 w-4" />
              Create New Book
            </button>
          </div>

          {!showNewBookForm ? (
            <div>
              <label className="block mb-1 font-medium text-black">Select Book</label>
              {booksError && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded mb-3 text-sm">
                  Error loading books: {booksError}
                </div>
              )}
              <select
                 name="book_id"
                 value={form.book_id}
                 onChange={(e) => setForm({ ...form, book_id: e.target.value })}
                 className="w-full border rounded px-3 py-2 text-black"
              >
                <option value="">Choose a book (optional)...</option>
                {books.length > 0 ? (
                  books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.author} ({book.status})
                    </option>
                  ))
                ) : (
                  <option disabled>No books available</option>
                )}
              </select>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-black">Book Title *</label>
                  <input
                      type="text"
                      name="title"
                      value={newBookData.title}
                      onChange={handleNewBookChange}
                      required={showNewBookForm}
                      className="w-full border rounded px-3 py-2 text-black"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-black">Author *</label>
                  <input
                      type="text"
                      name="author"
                      value={newBookData.author}
                      onChange={handleNewBookChange}
                      required={showNewBookForm}
                      className="w-full border rounded px-3 py-2 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-black">Description</label>
                <textarea
                  name="description"
                  value={newBookData.description}
                  onChange={handleNewBookChange}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-black"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-black">Genre</label>
                  <input
                      type="text"
                      name="genre"
                      value={newBookData.genre}
                      onChange={handleNewBookChange}
                      placeholder="e.g. Fiction, Self-help"
                      className="w-full border rounded px-3 py-2 text-black"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-black">Status *</label>
                  <select
                      name="status"
                      value={newBookData.status}
                      onChange={handleNewBookChange}
                      required={showNewBookForm}
                      className="w-full border rounded px-3 py-2 text-black"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="current">Current</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-black">Start Date</label>
                  <input
                      type="date"
                      name="start_date"
                      value={newBookData.start_date}
                      onChange={handleNewBookChange}
                      className="w-full border rounded px-3 py-2 text-black"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-black">End Date</label>
                  <input
                      type="date"
                      name="end_date"
                      value={newBookData.end_date}
                      onChange={handleNewBookChange}
                      className="w-full border rounded px-3 py-2 text-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#3a4095] text-white px-6 py-3 rounded hover:bg-indigo-800 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Meetup'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}