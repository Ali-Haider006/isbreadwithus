// app/dashboard/meetups/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  BookOpen, Calendar, Plus, Edit, Trash2,
  LayoutDashboard, Users, MessageSquare, Settings, LogOut,
  ChevronLeft, ChevronRight
} from 'lucide-react'

type Meetup = {
  id: string
  title: string | null
  book_name: string | null
  meetup_date: string | null
  meetup_time: string | null
  location: string | null
  max_slots: number | null
  payment_required: boolean | null
  payment_amount: number | null
  status: 'upcoming' | 'completed' | 'cancelled' | null
  created_at: string
}

export default function MeetupsDashboard() {
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/admin/sign-in')
        return
      }

      const { data, error } = await supabase
        .from('meetups')
        .select('*')
        .order('meetup_date', { ascending: true })

      if (error) {
        console.error(error)
      } else {
        setMeetups(data || [])
      }
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const filteredMeetups = statusFilter === 'all' ? meetups : meetups.filter(m => m.status === statusFilter)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meetup?')) return

    const { error } = await supabase.from('meetups').delete().eq('id', id)
    if (!error) {
      setMeetups(prev => prev.filter(m => m.id !== id))
    } else {
      alert('Error deleting meetup')
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'upcoming':
        return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-800' }
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#3a4095]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3a4095] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-300`}>
        <div className="p-6 border-b border-indigo-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">IsBreadWithUs</span>
          </div>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: Calendar, label: 'Meetups', href: '/dashboard/meetups', active: true },
            { icon: Users, label: 'Registrations', href: '/dashboard/registrations' },
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
          <button className="flex items-center w-full px-4 py-3 text-white/90 hover:bg-indigo-800 rounded-lg">
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center lg:hidden">
              <button onClick={() => setSidebarOpen(true)}>
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
              <span className="ml-4 text-lg font-semibold text-[#3a4095]">Meetups</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Admin</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Meetups Management</h1>
            <Link
              href="/dashboard/meetups/new"
              className="inline-flex items-center px-5 py-2.5 bg-[#3a4095] text-white rounded-lg hover:bg-indigo-800"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Meetup
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 focus:ring-[#3a4095]"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slots</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMeetups.map(m => {
                    const badge = getStatusBadge(m.status)
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{m.title || 'Untitled'}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{m.book_name || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {m.meetup_date ? new Date(m.meetup_date).toLocaleDateString() : '—'}
                          {m.meetup_time && ` • ${m.meetup_time}`}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{m.location || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {m.max_slots ? `${m.max_slots} slots` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {m.payment_required
                            ? `PKR ${m.payment_amount || 0}`
                            : 'Free'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-3">
                            <Link href={`/dashboard/meetups/${m.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredMeetups.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                        No meetups found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}