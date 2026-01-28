// app/dashboard/registrations/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  BookOpen, Users, CheckCircle, XCircle, Search,
  LayoutDashboard, Calendar, MessageSquare, Settings, LogOut,
  ChevronLeft, ChevronRight
} from 'lucide-react'

type Registration = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  why_join: string | null
  payment_status: 'pending' | 'submitted' | 'verified' | 'rejected' | null
  created_at: string
  meetup: {
    id: string
    title: string | null
    meetup_date: string | null
    payment_required: boolean | null
  } | null
}

export default function RegistrationsDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [meetupFilter, setMeetupFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filtered = useMemo(() => {
    let result = [...registrations]

    if (meetupFilter !== 'all') {
      result = result.filter(r => r.meetup?.id === meetupFilter)
    }

    if (statusFilter !== 'all') {
      result = result.filter(r => r.payment_status === statusFilter)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(r =>
        r.full_name?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term) ||
        r.meetup?.title?.toLowerCase().includes(term)
      )
    }

    return result
  }, [meetupFilter, statusFilter, searchTerm, registrations])

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/admin/sign-in')
        return
      }

      // Load all registrations with meetup info
      const { data, error } = await supabase
        .from('meetup_registrations')
        .select(`
          id,
          full_name,
          email,
          phone,
          why_join,
          payment_status,
          created_at,
          meetup:meetups!meetup_id (
            id,
            title,
            meetup_date,
            payment_required
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading registrations:', error)
      } else {
        setRegistrations((data as unknown) as Registration[] || [])
      }
      setLoading(false)
    }

    checkAuthAndLoad()
  }, [router, supabase])

  const handleStatusChange = async (id: string, newStatus: 'verified' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this as ${newStatus}?`)) return

    const { error } = await supabase
      .from('meetup_registrations')
      .update({ payment_status: newStatus })
      .eq('id', id)

    if (!error) {
      setRegistrations(prev =>
        prev.map(r => r.id === id ? { ...r, payment_status: newStatus } : r)
      )
    } else {
      alert('Failed to update status')
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'verified':
        return { label: 'Verified', color: 'bg-green-100 text-green-800' }
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
      case 'submitted':
        return { label: 'Submitted', color: 'bg-blue-100 text-blue-800' }
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800' }
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  // Get unique meetups for filter dropdown
  const uniqueMeetups = Array.from(
    new Map(registrations.map(r => [r.meetup?.id, r.meetup])).values()
  ).filter((m): m is NonNullable<typeof m> => m !== null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a4095]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar – same as other dashboard pages */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3a4095] transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition duration-300`}
      >
        <div className="p-6 border-b border-indigo-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">IsBreadWithUs</span>
          </div>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: Calendar, label: 'Meetups', href: '/dashboard/meetups' },
            { icon: Users, label: 'Registrations', href: '/dashboard/registrations', active: true },
            { icon: MessageSquare, label: 'Feedback', href: '/dashboard/feedback' },
            { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-indigo-700 ${
                item.active ? 'bg-indigo-700' : ''
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={() => supabase.auth.signOut().then(() => router.replace('/admin/sign-in'))}
            className="flex items-center w-full px-4 py-3 text-white/90 hover:bg-indigo-800 rounded-lg"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center lg:hidden">
              <button onClick={() => setSidebarOpen(true)}>
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
              <span className="ml-4 text-lg font-semibold text-[#3a4095]">Registrations</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Meetup Registrations</h1>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3a4095] w-64"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Meetup</label>
              <select
                value={meetupFilter}
                onChange={e => setMeetupFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="all">All Meetups</option>
                {uniqueMeetups.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({new Date(m.meetup_date!).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name & Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meetup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Why Join</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map(r => {
                    const badge = getStatusBadge(r.payment_status)
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium">{r.full_name || '—'}</div>
                          <div className="text-sm text-gray-500">{r.email}</div>
                          {r.phone && <div className="text-sm text-gray-500">{r.phone}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/meetups/${r.meetup?.id}/edit`}
                            className="text-indigo-600 hover:underline"
                          >
                            {r.meetup?.title || '—'}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {r.meetup?.meetup_date ? new Date(r.meetup.meetup_date).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                          {r.why_join || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(r.created_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {r.payment_status === 'pending' || r.payment_status === 'submitted' ? (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleStatusChange(r.id, 'verified')}
                                className="text-green-600 hover:text-green-900"
                                title="Verify"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(r.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        No registrations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filtered.length} of {registrations.length} registrations
          </div>
        </main>
      </div>
    </div>
  )
}