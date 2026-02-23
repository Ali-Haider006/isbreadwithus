// app/dashboard/registrations/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  BookOpen, Users, CheckCircle, XCircle, Search,
  LayoutDashboard, Calendar, MessageSquare, Settings, LogOut,
  ChevronLeft, ChevronRight, X, ExternalLink, Image as ImageIcon,
  Phone, Mail, User, Clock, CreditCard
} from 'lucide-react'

type Registration = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  why_join: string | null
  payment_status: 'pending' | 'submitted' | 'verified' | 'rejected' | null
  payment_screenshot_url: string | null
  created_at: string
  meetup: {
    id: string
    title: string | null
    meetup_date: string | null
    payment_required: boolean | null
  } | null
}

function DetailPanel({
  registration,
  onClose,
  onStatusChange,
  statusChanging,
}: {
  registration: Registration
  onClose: () => void
  onStatusChange: (id: string, status: 'verified' | 'rejected') => Promise<void>
  statusChanging: boolean
}) {
  const badge = getStatusBadge(registration.payment_status)
  const [imgError, setImgError] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-[#3a4095] text-white">
          <h2 className="text-lg font-semibold">Registration Details</h2>
          <button onClick={onClose} className="hover:bg-indigo-700 rounded-full p-1 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(registration.created_at).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          {/* Personal info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Registrant</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-[#3a4095]" />
              </div>
              <span className="font-semibold text-gray-800">{registration.full_name || '—'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-[#3a4095]" />
              </div>
              <a href={`mailto:${registration.email}`} className="text-indigo-600 hover:underline text-sm">
                {registration.email || '—'}
              </a>
            </div>
            {registration.phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-[#3a4095]" />
                </div>
                <a href={`tel:${registration.phone}`} className="text-sm text-gray-700">
                  {registration.phone}
                </a>
              </div>
            )}
          </div>

          {/* Meetup info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Meetup</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-[#3a4095]" />
              </div>
              <div>
                <Link
                  href={`/dashboard/meetups/${registration.meetup?.id}/edit`}
                  className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
                >
                  {registration.meetup?.title || '—'}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <p className="text-xs text-gray-500">
                  {registration.meetup?.meetup_date
                    ? (() => {
                        const [y, m, d] = registration.meetup.meetup_date.split('-').map(Number)
                        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                        })
                      })()
                    : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-4 w-4 text-[#3a4095]" />
              </div>
              <span className="text-sm text-gray-700">
                {registration.meetup?.payment_required ? 'Payment required' : 'Free entry'}
              </span>
            </div>
          </div>

          {/* Why join */}
          {registration.why_join && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Why they want to join</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{registration.why_join}</p>
            </div>
          )}

          {/* Payment screenshot */}
          {registration.meetup?.payment_required && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payment Screenshot</h3>
              {registration.payment_screenshot_url && !imgError ? (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={registration.payment_screenshot_url}
                    alt="Payment proof"
                    className="w-full object-contain max-h-80 bg-gray-50"
                    onError={() => setImgError(true)}
                  />
                  <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-500">Payment proof</span>
                    <a
                      href={registration.payment_screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      Open full size <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    {imgError ? 'Failed to load screenshot' : 'No screenshot uploaded'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {(registration.payment_status === 'pending' || registration.payment_status === 'submitted') && (
          <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
            <button
              onClick={() => onStatusChange(registration.id, 'verified')}
              disabled={statusChanging}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {statusChanging ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Verify Payment
            </button>
            <button
              onClick={() => onStatusChange(registration.id, 'rejected')}
              disabled={statusChanging}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {statusChanging ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case 'verified':  return { label: 'Verified',  color: 'bg-green-100 text-green-800' }
    case 'pending':   return { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800' }
    case 'submitted': return { label: 'Submitted', color: 'bg-blue-100 text-blue-800' }
    case 'rejected':  return { label: 'Rejected',  color: 'bg-red-100 text-red-800' }
    default:          return { label: 'Unknown',   color: 'bg-gray-100 text-gray-800' }
  }
}

export default function RegistrationsDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [meetupFilter, setMeetupFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [statusChanging, setStatusChanging] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const filtered = useMemo(() => {
    let result = [...registrations]
    if (meetupFilter !== 'all') result = result.filter(r => r.meetup?.id === meetupFilter)
    if (statusFilter !== 'all') result = result.filter(r => r.payment_status === statusFilter)
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
      if (!user) { router.replace('/admin/sign-in'); return }

      const { data, error } = await supabase
        .from('meetup_registrations')
        .select(`
          id, full_name, email, phone, why_join,
          payment_status, payment_screenshot_url, created_at,
          meetup:meetups!meetup_id (
            id, title, meetup_date, payment_required
          )
        `)
        .order('created_at', { ascending: false })

      if (error) console.error('Error loading registrations:', error)
      else setRegistrations((data as unknown) as Registration[] || [])
      setLoading(false)
    }
    checkAuthAndLoad()
  }, [router, supabase])

  const handleStatusChange = async (id: string, newStatus: 'verified' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this registration as ${newStatus}?`)) return

    setStatusChanging(true)

    // 1. Update status in DB
    const { error } = await supabase
      .from('meetup_registrations')
      .update({ payment_status: newStatus })
      .eq('id', id)

    if (error) {
      showToast('Failed to update status. Please try again.', 'error')
      setStatusChanging(false)
      return
    }

    // 2. Update local state
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, payment_status: newStatus } : r))
    setSelectedReg(prev => prev?.id === id ? { ...prev, payment_status: newStatus } : prev)

    // 3. Send status email
    const reg = registrations.find(r => r.id === id)
    if (reg?.email) {
      try {
        await fetch('/api/payment-status-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: reg.email,
            full_name: reg.full_name,
            meetup_title: reg.meetup?.title,
            meetup_date: reg.meetup?.meetup_date,
            status: newStatus,
          }),
        })
        showToast(
          newStatus === 'verified'
            ? `Payment verified and confirmation email sent to ${reg.email}`
            : `Registration rejected and email sent to ${reg.email}`,
          'success'
        )
      } catch {
        // Email failure doesn't undo the status change
        showToast(`Status updated but email notification failed.`, 'error')
        console.error('Status email failed')
      }
    } else {
      showToast(`Status updated to ${newStatus}.`, 'success')
    }

    setStatusChanging(false)
  }

  const uniqueMeetups = Array.from(
    new Map(registrations.map(r => [r.meetup?.id, r.meetup])).values()
  ).filter((m): m is NonNullable<typeof m> => m !== null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a4095]" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
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
            { icon: LayoutDashboard, label: 'Dashboard',     href: '/dashboard' },
            { icon: Calendar,        label: 'Meetups',       href: '/dashboard/meetups' },
            { icon: Users,           label: 'Registrations', href: '/dashboard/registrations', active: true },
            { icon: MessageSquare,   label: 'Feedback',      href: '/dashboard/feedback' },
            { icon: Settings,        label: 'Settings',      href: '/dashboard/settings' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-indigo-700 ${item.active ? 'bg-indigo-700' : ''}`}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map(r => {
                    const badge = getStatusBadge(r.payment_status)
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                        onClick={() => setSelectedReg(r)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium">{r.full_name || '—'}</div>
                          <div className="text-sm text-gray-500">{r.email}</div>
                          {r.phone && <div className="text-sm text-gray-500">{r.phone}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-800">{r.meetup?.title || '—'}</div>
                          <div className="text-sm text-gray-500">
                            {r.meetup?.meetup_date ? new Date(r.meetup.meetup_date).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <p className="truncate max-w-[200px]">{r.why_join || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {r.meetup?.payment_required ? (
                            r.payment_screenshot_url ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                <ImageIcon className="h-3 w-3" /> Screenshot
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">No screenshot</span>
                            )
                          ) : (
                            <span className="text-xs text-gray-400">Free</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(r.created_at).toLocaleString('en-US', {
                            dateStyle: 'medium', timeStyle: 'short',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={e => e.stopPropagation()}>
                          {r.payment_status === 'pending' || r.payment_status === 'submitted' ? (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleStatusChange(r.id, 'verified')}
                                disabled={statusChanging}
                                className="text-green-600 hover:text-green-900 disabled:opacity-40"
                                title="Verify"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(r.id, 'rejected')}
                                disabled={statusChanging}
                                className="text-red-600 hover:text-red-900 disabled:opacity-40"
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
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
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

      {/* Detail panel */}
      {selectedReg && (
        <DetailPanel
          registration={selectedReg}
          onClose={() => setSelectedReg(null)}
          onStatusChange={handleStatusChange}
          statusChanging={statusChanging}
        />
      )}
    </div>
  )
}