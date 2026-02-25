// app/dashboard/feedback/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'

type Feedback = {
  id: string
  name: string | null
  email: string | null
  type: 'suggestion' | 'complaint' | 'praise' | 'question' | null
  message: string | null
  created_at: string
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/admin/sign-in')
        return
      }

      // Optional: stricter admin check
      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!admin) {
        await supabase.auth.signOut()
        router.replace('/admin/sign-in')
        return
      }

      // Load feedback
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading feedback:', error)
      } else {
        setFeedbackList(data || [])
      }
      setLoading(false)
    }

    checkAuthAndLoad()
  }, [router, supabase])

  const getTypeBadge = (type: string | null) => {
    if (!type) return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' }

    switch (type) {
      case 'praise':
        return { label: 'Praise', color: 'bg-green-100 text-green-800' }
      case 'suggestion':
        return { label: 'Suggestion', color: 'bg-blue-100 text-blue-800' }
      case 'complaint':
        return { label: 'Complaint', color: 'bg-red-100 text-red-800' }
      case 'question':
        return { label: 'Question', color: 'bg-yellow-100 text-yellow-800' }
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/sign-in')
  }

  const filteredList = useMemo(() => {
    let result = [...feedbackList]

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (item) =>
          (item.name?.toLowerCase().includes(term) ||
           item.email?.toLowerCase().includes(term) ||
           item.message?.toLowerCase().includes(term))
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter)
    }

    return result
  }, [feedbackList, searchTerm, typeFilter])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a4095]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar – same as dashboard */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3a4095] transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-6 border-b border-indigo-600">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">IsBreadWithUs</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: Calendar, label: 'Meetups', href: '/dashboard/meetups' },
            { icon: Users, label: 'Registrations', href: '/dashboard/registrations' },
            { icon: BookOpen, label: 'Books & Tags', href: '/dashboard/books' },
            { icon: MessageSquare, label: 'Feedback', href: '/dashboard/feedback', active: true },
            { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg text-white/90 hover:bg-indigo-700 transition-colors ${
                item.active ? 'bg-indigo-700 text-white' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-white/80 hover:bg-indigo-800 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center lg:hidden">
              <button onClick={() => setSidebarOpen(true)}>
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
              <span className="ml-4 text-lg font-semibold text-[#3a4095]">Feedback</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Manage feedback</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Feedback & Messages</h1>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search name, email, message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a4095] w-full sm:w-64"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a4095] bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="praise">Praise</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                  <option value="question">Question</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredList.map((item) => {
                    const badge = getTypeBadge(item.type)
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name || '—'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.email || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2 max-w-xl">
                            {item.message || 'No message'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                      </tr>
                    )
                  })}

                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        {feedbackList.length === 0
                          ? 'No feedback received yet'
                          : 'No feedback matches your filters'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick stats footer */}
          <div className="mt-6 text-sm text-gray-500">
            Showing {filteredList.length} of {feedbackList.length} messages
          </div>
        </main>
      </div>
    </div>
  )
}