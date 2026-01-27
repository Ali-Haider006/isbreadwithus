'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/admin/sign-in')

    const { error } = await supabase
      .from('meetups')
      .insert({
        ...form,
        created_by: user.id,
        payment_amount: form.payment_required ? form.payment_amount : null,
      })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard/meetups')
    }
    setLoading(false)
  }

  // ──────────────────────────────────────────────────────────────
  // Form UI (Tailwind + similar style to your dashboard)
  // Fields: input, textarea, date, time, checkbox, number, select
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Meetup</h1>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {/* title */}
        <div>
          <label className="block mb-1 font-medium">Title *</label>
          <input
            required
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* date + times */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">Date *</label>
            <input
              type="date"
              required
              value={form.meetup_date}
              onChange={e => setForm({ ...form, meetup_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Start Time</label>
            <input
              type="time"
              value={form.meetup_time}
              onChange={e => setForm({ ...form, meetup_time: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">End Time</label>
            <input
              type="time"
              value={form.end_time}
              onChange={e => setForm({ ...form, end_time: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* location */}
        <div>
          <label className="block mb-1 font-medium">Location *</label>
          <input
            required
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Readings, Lahore"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* book_name */}
        <div>
          <label className="block mb-1 font-medium">Book Name</label>
          <input
            value={form.book_name}
            onChange={e => setForm({ ...form, book_name: e.target.value })}
            placeholder="e.g. Atomic Habits"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* payment */}
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.payment_required}
              onChange={e => setForm({ ...form, payment_required: e.target.checked })}
            />
            <span>Payment Required</span>
          </label>

          {form.payment_required && (
            <>
              <div>
                <label className="block mb-1 font-medium">Amount (PKR)</label>
                <input
                  type="number"
                  value={form.payment_amount}
                  onChange={e => setForm({ ...form, payment_amount: Number(e.target.value) })}
                  min="0"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Payment Instructions</label>
                <textarea
                  value={form.payment_instructions}
                  onChange={e => setForm({ ...form, payment_instructions: e.target.value })}
                  rows={3}
                  placeholder="Easypaisa / Bank transfer details..."
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </>
          )}
        </div>

        {/* max slots */}
        <div>
          <label className="block mb-1 font-medium">Max Slots</label>
          <input
            type="number"
            value={form.max_slots}
            onChange={e => setForm({ ...form, max_slots: Number(e.target.value) || 30 })}
            min="1"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#3a4095] text-white px-6 py-3 rounded hover:bg-indigo-800 disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create Meetup'}
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}