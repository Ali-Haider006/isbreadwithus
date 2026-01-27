// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
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
  ChevronRight 
} from 'lucide-react'

type Stats = {
  upcomingMeetups: number
  pendingRegistrations: number
  totalBooks: number
  unreadFeedback: number
}

type Registration = {
  id: string
  full_name: string
  email: string
  meetup: { title: string }[] | null
  payment_status: string
  created_at: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    upcomingMeetups: 0,
    pendingRegistrations: 0,
    totalBooks: 0,
    unreadFeedback: 0,
  })
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/admin/sign-in')
        return
      }

      // Optional: Check if user is in admins table
      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!admin) {
        // Not an admin → sign out or redirect
        await supabase.auth.signOut()
        router.replace('/admin/sign-in')
        return
      }

      // Load stats
      const [
        { count: upcomingMeetups },
        { count: pendingRegistrations },
        { count: totalBooks },
        { count: unreadFeedback },
      ] = await Promise.all([
        supabase.from('meetups').select('*', { count: 'exact', head: true })
          .eq('status', 'upcoming'),
        supabase.from('meetup_registrations').select('*', { count: 'exact', head: true })
          .eq('payment_status', 'pending'),
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('feedback').select('*', { count: 'exact', head: true })
          // .eq('read', false) — add read column later if needed
      ])

      setStats({
        upcomingMeetups: upcomingMeetups || 0,
        pendingRegistrations: pendingRegistrations || 0,
        totalBooks: totalBooks || 0,
        unreadFeedback: unreadFeedback || 0,
      })

      // Recent registrations
      const { data: regs } = await supabase
        .from('meetup_registrations')
        .select(`
          id,
          full_name,
          email,
          payment_status,
          created_at,
          meetup:meetup_id (title)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentRegistrations(regs || [])
      setLoading(false)
    }

    checkAuthAndLoadData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/sign-in')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a4095]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3a4095] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-300 ease-in-out`}>
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
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
            { icon: Calendar, label: 'Meetups', href: '/dashboard/meetups' },
            { icon: Users, label: 'Registrations', href: '/dashboard/registrations' },
            { icon: BookOpen, label: 'Books & Tags', href: '/dashboard/books' },
            { icon: MessageSquare, label: 'Feedback', href: '/dashboard/feedback' },
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
              <span className="ml-4 text-lg font-semibold text-[#3a4095]">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Manage your book club</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Upcoming Meetups</p>
                  <p className="text-3xl font-bold text-[#3a4095] mt-1">{stats.upcomingMeetups}</p>
                </div>
                <Calendar className="h-10 w-10 text-[#3a4095]/20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Registrations</p>
                  <p className="text-3xl font-bold text-[#3a4095] mt-1">{stats.pendingRegistrations}</p>
                </div>
                <Users className="h-10 w-10 text-[#3a4095]/20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Books</p>
                  <p className="text-3xl font-bold text-[#3a4095] mt-1">{stats.totalBooks}</p>
                </div>
                <BookOpen className="h-10 w-10 text-[#3a4095]/20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Feedback Messages</p>
                  <p className="text-3xl font-bold text-[#3a4095] mt-1">{stats.unreadFeedback}</p>
                </div>
                <MessageSquare className="h-10 w-10 text-[#3a4095]/20" />
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Meetup Registrations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meetup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                        <div className="text-sm text-gray-500">{reg.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reg.meetup?.[0]?.title || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reg.payment_status === 'verified' ? 'bg-green-100 text-green-800' :
                          reg.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          reg.payment_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reg.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {recentRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No recent registrations
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