// app/feedback/page.tsx   ← or app/contact/feedback/page.tsx depending on your routing preference
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Send, User, Mail, MessageSquare, Smile, ThumbsUp, AlertCircle, HelpCircle } from 'lucide-react'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '' as 'praise' | 'suggestion' | 'complaint' | 'question' | '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type) {
      setError('Please select the type of feedback')
      return
    }
    
    if (!formData.message.trim()) {
      setError('Please enter your message')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from('feedback').insert({
        name: formData.name.trim() || null,
        email: formData.email.trim() || null,
        type: formData.type,
        message: formData.message.trim(),
      })

      if (error) throw error

      setSuccess(true)
      setFormData({ name: '', email: '', type: '', message: '' })
      
      // Optional: auto-redirect after 4 seconds
      setTimeout(() => {
        router.push('/')
      }, 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const feedbackTypes = [
    { value: 'praise', label: 'Praise / Positive Feedback', icon: ThumbsUp, color: 'text-green-600' },
    { value: 'suggestion', label: 'Suggestion / Idea', icon: Smile, color: 'text-blue-600' },
    { value: 'question', label: 'Question', icon: HelpCircle, color: 'text-yellow-600' },
    { value: 'complaint', label: 'Complaint / Issue', icon: AlertCircle, color: 'text-red-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-[#3a4095] rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            We’d Love to Hear From You
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Your feedback helps us make IsBreadWithUs even better — whether it’s praise, ideas, questions, or things we can improve.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-green-800 mb-3">
              Thank You!
            </h2>
            <p className="text-black mb-6">
              We really appreciate you taking the time to share your thoughts. 
              Our team will review your message soon.
            </p>
            <p className="text-sm text-black">
              Redirecting to home in a few seconds... or{' '}
              <button
                onClick={() => router.push('/')}
                className="text-[#3a4095] hover:underline font-medium"
              >
                go back now
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 md:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-black mb-3">
                What type of feedback is this?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, type: type.value as 'praise' | 'suggestion' | 'complaint' | 'question' }))
                      setError(null)
                    }}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${
                      formData.type === type.value
                        ? 'border-[#3a4095] bg-indigo-50 ring-2 ring-[#3a4095]/30'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <type.icon className={`h-7 w-7 mb-2 ${type.color}`} />
                    <span className={`text-sm font-medium text-center ${type.color}`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                Your Name (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                  placeholder="How should we address you?"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email Address (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                  placeholder="We'll only use this to reply if needed"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-8">
              <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                Your Message <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                  placeholder="Tell us what you think... we're listening!"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#3a4095] text-white font-semibold rounded-xl hover:bg-[#2d3275] focus:outline-none focus:ring-2 focus:ring-[#3a4095] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>

            <p className="mt-6 text-center text-sm text-black">
              Your message goes straight to our admin team. We read every submission.
            </p>
          </form>
        )}

        {/* Back link */}
        <div className="text-center mt-10">
          <button
            onClick={() => router.back()}
            className="text-[#3a4095] hover:underline font-medium"
          >
            ← Back to previous page
          </button>
        </div>
      </div>
    </div>
  )
}