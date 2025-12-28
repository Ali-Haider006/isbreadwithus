'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BookOpen, Lock, Mail } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.refresh()
      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#3a4095]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md space-y-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold">IsBreadWithUs</span>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight">
            Admin Portal
          </h1>
          
          <p className="text-lg text-white/90">
            Manage your book club community, track registrations, and engage with members.
          </p>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Member Management</h3>
                <p className="text-white/80 text-sm">View and manage meetup registrations</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Feedback Insights</h3>
                <p className="text-white/80 text-sm">Review member feedback and suggestions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Event Analytics</h3>
                <p className="text-white/80 text-sm">Track attendance and engagement metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-3 text-white">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">IsBreadWithUs</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#3a4095] mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to access the admin dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                    placeholder="admin@isbreadwithus.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#3a4095] focus:ring-[#3a4095] border-gray-300 rounded accent-[#3a4095]"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#3a4095] hover:text-[#2d3275]"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#3a4095] text-white font-semibold rounded-lg hover:bg-[#2d3275] focus:outline-none focus:ring-2 focus:ring-[#3a4095] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need access?{' '}
                <Link
                  href="/contact"
                  className="font-medium text-[#3a4095] hover:text-[#2d3275]"
                >
                  Contact administrator
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}