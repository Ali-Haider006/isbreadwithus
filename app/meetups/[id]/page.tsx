// app/meetups/[id]/register/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen, Calendar, MapPin, DollarSign, Users,
  AlertCircle, ArrowLeft, CheckCircle, Upload, X,
  Building2, CreditCard, User
} from 'lucide-react'

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
  payment_recipient_id: string | null
}

interface PaymentRecipient {
  id: string
  recipient_name: string
  bank_name: string | null
  bank_account_number: string | null
}

export default function MeetupRegistration() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [meetup, setMeetup] = useState<Meetup | null>(null)
  const [paymentRecipient, setPaymentRecipient] = useState<PaymentRecipient | null>(null)
  const [slotsLeft, setSlotsLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    why_join: '',
  })
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchMeetup() {
      const { data, error } = await supabase
        .from('meetups')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Meetup not found or has been removed')
        setLoading(false)
        return
      }

      if (data.status !== 'upcoming') {
        setError('Registrations are closed for this meetup')
        setLoading(false)
        return
      }

      setMeetup(data)

      // Fetch registration count to calculate slots left
      if (data.max_slots) {
        const { count } = await supabase
          .from('meetup_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('meetup_id', id)
          .neq('payment_status', 'rejected')

        setSlotsLeft(data.max_slots - (count ?? 0))
      }

      // Fetch payment recipient if applicable
      if (data.payment_required && data.payment_recipient_id) {
        const { data: recipientData } = await supabase
          .from('payment_recipients')
          .select('*')
          .eq('id', data.payment_recipient_id)
          .single()

        if (recipientData) setPaymentRecipient(recipientData)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setScreenshotFile(file)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => setScreenshotPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeScreenshot = () => {
    setScreenshotFile(null)
    setScreenshotPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.full_name.trim()) return setError('Full name is required')
    if (!form.email.trim()) return setError('Email is required')
    if (!form.email.includes('@')) return setError('Please enter a valid email')
    if (meetup?.payment_required && !screenshotFile) {
      return setError('Please upload your payment screenshot')
    }

    setSubmitting(true)
    setError(null)

    try {
      // Re-check slot availability before inserting (race condition guard)
      if (meetup?.max_slots) {
        const { count, error: countError } = await supabase
          .from('meetup_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('meetup_id', id)
          .neq('payment_status', 'rejected')

        if (countError) throw countError

        if (count !== null && count >= meetup.max_slots) {
          setError('Sorry, this meetup is now fully booked.')
          setSlotsLeft(0)
          setSubmitting(false)
          return
        }
      }

      // Check for duplicate registration
      const { data: existing } = await supabase
        .from('meetup_registrations')
        .select('id')
        .eq('meetup_id', id)
        .eq('email', form.email.trim())
        .neq('payment_status', 'rejected')
        .maybeSingle()

      if (existing) {
        setError('This email is already registered for this meetup.')
        setSubmitting(false)
        return
      }

      let screenshot_url: string | null = null

      if (screenshotFile) {
        const ext = screenshotFile.name.split('.').pop()
        const fileName = `${id}/${Date.now()}_${form.email.replace(/[^a-z0-9]/gi, '_')}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('payment')
          .upload(fileName, screenshotFile, { upsert: false })

        if (uploadError) throw new Error('Failed to upload payment screenshot: ' + uploadError.message)

        const { data: urlData } = supabase.storage.from('payment').getPublicUrl(fileName)
        screenshot_url = urlData.publicUrl
      }

      const { error: insertError } = await supabase
        .from('meetup_registrations')
        .insert({
          meetup_id: id,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          why_join: form.why_join.trim() || null,
          payment_status: meetup?.payment_required ? 'pending' : 'verified',
          payment_screenshot_url: screenshot_url,
        })

      if (insertError) throw insertError

      // Send confirmation email — fire and don't block success UI on failure
      try {
        await fetch('/api/registration-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            meetup_title: meetup?.title,
            meetup_date: meetup?.meetup_date,
            meetup_time: meetup?.meetup_time,
            location: meetup?.location,
            payment_required: meetup?.payment_required,
            payment_amount: meetup?.payment_amount,
          }),
        })
      } catch {
        // Email failure should never block the user — registration is already saved
        console.error('Email notification failed')
      }

      setSuccess(true)
      setForm({ full_name: '', email: '', phone: '', why_join: '' })
      setScreenshotFile(null)
      setScreenshotPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a4095]" />
      </div>
    )
  }

  // ── Fatal error (no meetup) ──────────────────────────────────────────────
  if (error && !meetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Oops...</h1>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <button
          onClick={() => router.push('/meetups')}
          className="px-6 py-3 bg-[#3a4095] text-white rounded-lg hover:bg-indigo-800"
        >
          Back to Meetups
        </button>
      </div>
    )
  }

  // ── Fully booked ─────────────────────────────────────────────────────────
  if (slotsLeft !== null && slotsLeft <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <Users className="h-10 w-10 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">This Meetup is Fully Booked</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          All slots for <span className="font-semibold">{meetup!.title}</span> have been filled.
          Follow us on Instagram to hear about future meetups.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
          <a
            href="https://www.instagram.com/islamabadreadswithus/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#3a4095] text-white rounded-lg hover:bg-indigo-800"
          >
            Follow on Instagram
          </a>
        </div>
      </div>
    )
  }

  // ── Main page ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-[#3a4095] hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to meetup details
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-[#3a4095] text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="h-10 w-10" />
              <h1 className="text-3xl font-bold">Registration</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-2">{meetup!.title}</h2>

            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {meetup!.meetup_date
                    ? new Date(meetup!.meetup_date).toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                      })
                    : 'Date not set'}
                  {meetup!.meetup_time && ` • ${meetup!.meetup_time}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{meetup!.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>
                  {slotsLeft === null
                    ? 'Unlimited slots'
                    : slotsLeft <= 3
                    ? `Only ${slotsLeft} slot${slotsLeft === 1 ? '' : 's'} left!`
                    : `${slotsLeft} slots remaining`}
                </span>
                {slotsLeft !== null && slotsLeft <= 3 && (
                  <span className="bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Almost full
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span>
                  {meetup!.payment_required
                    ? `PKR ${meetup!.payment_amount || 0} (payment required)`
                    : 'Free entry'}
                </span>
              </div>
            </div>
          </div>

          {/* Success state */}
          {success ? (
            <div className="p-10 text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Registration Submitted!</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                {meetup!.payment_required
                  ? "Thank you! Your registration is pending. We'll verify your payment and confirm your spot soon."
                  : "Thank you! We'll see you at the meetup."}{' '}
                A confirmation email has been sent to your inbox. For any questions,{' '}
                <a
                  href="https://www.instagram.com/islamabadreadswithus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3a4095] underline hover:text-indigo-800"
                >
                  reach out to us on Instagram
                </a>.
              </p>
              <button
                onClick={() => router.push('/meetups')}
                className="px-8 py-3 bg-[#3a4095] text-white rounded-lg hover:bg-indigo-800"
              >
                Browse Other Meetups
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
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

              {/* Payment section */}
              {meetup!.payment_required && (
                <div className="space-y-4">
                  {paymentRecipient ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <h3 className="font-semibold text-blue-900 mb-4 text-base flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Send Payment of PKR {meetup!.payment_amount || 0} to:
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Account Name</p>
                            <p className="text-blue-900 font-semibold">{paymentRecipient.recipient_name}</p>
                          </div>
                        </div>

                        {paymentRecipient.bank_name && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4 w-4 text-blue-700" />
                            </div>
                            <div>
                              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Bank</p>
                              <p className="text-blue-900 font-semibold">{paymentRecipient.bank_name}</p>
                            </div>
                          </div>
                        )}

                        {paymentRecipient.bank_account_number && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CreditCard className="h-4 w-4 text-blue-700" />
                            </div>
                            <div>
                              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Account Number</p>
                              <p className="text-blue-900 font-semibold font-mono tracking-wider">
                                {paymentRecipient.bank_account_number}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-sm">
                      <p className="font-medium text-yellow-800 mb-1">
                        Payment Required (PKR {meetup!.payment_amount || 0})
                      </p>
                      <p className="text-yellow-700">
                        Please contact the organizer for payment details before submitting.
                      </p>
                    </div>
                  )}

                  {/* Screenshot upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      After completing the payment, upload a screenshot as proof. Your spot will be confirmed once verified.
                    </p>

                    {screenshotPreview ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-[#3a4095] border-dashed">
                        <img
                          src={screenshotPreview}
                          alt="Payment screenshot preview"
                          className="w-full max-h-64 object-contain bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={removeScreenshot}
                          className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-2 flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                          {screenshotFile?.name}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#3a4095] hover:bg-indigo-50/30 transition-colors group"
                      >
                        <Upload className="h-8 w-8 text-gray-400 group-hover:text-[#3a4095] mx-auto mb-3 transition-colors" />
                        <p className="text-sm font-medium text-gray-600 group-hover:text-[#3a4095] transition-colors">
                          Click to upload payment screenshot
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
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