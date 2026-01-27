// app/meetups/[id]/register/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Calendar, MapPin, DollarSign, Users, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react'

interface Meetup {
  id: string
  title: string | null
  meetup_date: string | null
  meetup_time: string | null
  location: string | null
  max_slots: number | null
  payment_required: boolean | null
  payment_amount: number | null
  status: string | null
}

export default function MeetupRegistration() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [meetup, setMeetup] = useState<Meetup | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    why_join: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load meetup data
  useEffect(() => {
    async function fetchMeetup() {
      const { data, error } = await supabase
        .from('meetups')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Meetup not found or has been removed')
      } else if (data.status !== 'upcoming') {
        setError('Registrations are closed for this meetup')
      } else {
        setMeetup(data)
      }
      setLoading(false)
    }

    fetchMeetup()
  }, [id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.full_name.trim()) return setError('Full name is required')
    if (!form.email.trim()) return setError('Email is required')
    if (!form.email.includes('@')) return setError('Please enter a valid email')

    setSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('meetup_registrations')
        .insert({
          meetup_id: id,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          why_join: form.why_join.trim() || null,
          payment_status: meetup?.payment_required ? 'pending' : 'verified',
        })

      if (error) throw error

      setSuccess(true)
      setForm({ full_name: '', email: '', phone: '', why_join: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a4095]"></div>
      </div>
    )
  }

  if (error || !meetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Oops...</h1>
        <p className="text-gray-600 mb-8 max-w-md">{error || 'Meetup not found'}</p>
        <button
          onClick={() => router.push('/meetups')}
          className="px-6 py-3 bg-[#3a4095] text-white rounded-lg hover:bg-indigo-800"
        >
          Back to Meetups
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-[#3a4095] hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to meetup details
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header / Meetup info */}
          <div className="bg-[#3a4095] text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="h-10 w-10" />
              <h1 className="text-3xl font-bold">Registration</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-2">{meetup.title}</h2>

            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {meetup.meetup_date ? new Date(meetup.meetup_date as string).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Date not set'}
                  {meetup.meetup_time && ` • ${meetup.meetup_time}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{meetup.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Max {meetup.max_slots || 'unlimited'} slots</span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span>
                  {meetup.payment_required
                    ? `PKR ${meetup.payment_amount || 0} (payment required)`
                    : 'Free entry'}
                </span>
              </div>
            </div>
          </div>

          {/* Success message */}
          {success ? (
            <div className="p-10 text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Registration Submitted!</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                {meetup.payment_required
                  ? 'Thank you! Your registration is pending. Please complete payment as per the instructions below.'
                  : 'Thank you! We’ll see you at the meetup.'}
              </p>
              <button
                onClick={() => router.push('/meetups')}
                className="px-8 py-3 bg-[#3a4095] text-white rounded-lg hover:bg-indigo-800"
              >
                Browse Other Meetups
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="full_name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you want to join? (optional)
                </label>
                <textarea
                  name="why_join"
                  value={form.why_join}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                  placeholder="Tell us a bit about your interest in this book / meetup..."
                />
              </div>

              {meetup.payment_required && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-sm">
                  <p className="font-medium text-yellow-800 mb-2">
                    Payment Required (PKR {meetup.payment_amount || 0})
                  </p>
                  <p className="text-yellow-700">
                    After submitting this form, please follow the payment instructions provided by the organizer.
                    Your spot will be confirmed once payment is verified.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-[#3a4095] text-white font-semibold rounded-xl hover:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}