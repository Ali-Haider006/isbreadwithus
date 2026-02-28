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
  Phone, Mail, User, Clock, CreditCard, AlertTriangle,
  RotateCcw, Clock3, Ban, StickyNote
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected' | 'waitlisted' | 'cancelled'

type Registration = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  why_join: string | null
  payment_status: PaymentStatus | null
  payment_screenshot_url: string | null
  admin_notes: string | null
  status_updated_at: string | null
  created_at: string
  meetup: {
    id: string
    title: string | null
    meetup_date: string | null
    location: string | null
    payment_required: boolean | null
    max_slots: number | null
  } | null
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PaymentStatus, {
  label: string
  color: string
  icon: React.ReactNode
}> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock3 className="h-3 w-3" /> },
  submitted:  { label: 'Submitted',  color: 'bg-blue-100 text-blue-800 border-blue-200',       icon: <ImageIcon className="h-3 w-3" /> },
  verified:   { label: 'Verified',   color: 'bg-green-100 text-green-800 border-green-200',    icon: <CheckCircle className="h-3 w-3" /> },
  rejected:   { label: 'Rejected',   color: 'bg-red-100 text-red-800 border-red-200',          icon: <XCircle className="h-3 w-3" /> },
  waitlisted: { label: 'Waitlisted', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Clock className="h-3 w-3" /> },
  cancelled:  { label: 'Cancelled',  color: 'bg-gray-100 text-gray-600 border-gray-200',       icon: <Ban className="h-3 w-3" /> },
}

function StatusBadge({ status }: { status: PaymentStatus | null }) {
  const cfg = STATUS_CONFIG[status ?? 'pending']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

// ── Actions per status ────────────────────────────────────────────────────────
type Action = 'verify' | 'reject' | 'waitlist' | 'cancel' | 'reopen'

function getActions(status: PaymentStatus | null): Action[] {
  switch (status) {
    case 'pending':
    case 'submitted':  return ['verify', 'waitlist', 'reject']
    case 'verified':   return ['cancel']
    case 'rejected':   return ['reopen']
    case 'waitlisted': return ['verify', 'reject']
    case 'cancelled':  return ['reopen']
    default:           return []
  }
}

const ACTION_CONFIG: Record<Action, {
  label: string
  shortLabel: string
  color: string
  icon: React.ReactNode
  confirmMsg: string
  needsSlotCheck: boolean
}> = {
  verify:   { label: 'Verify Payment',      shortLabel: 'Verify',    color: 'bg-green-600 hover:bg-green-700 text-white',   icon: <CheckCircle className="h-4 w-4" />, confirmMsg: 'Mark this registration as verified?',                                    needsSlotCheck: false },
  reject:   { label: 'Reject',              shortLabel: 'Reject',    color: 'bg-red-500 hover:bg-red-600 text-white',       icon: <XCircle className="h-4 w-4" />,    confirmMsg: 'Reject this registration? The slot will open up for others.',            needsSlotCheck: false },
  waitlist: { label: 'Move to Waitlist',    shortLabel: 'Waitlist',  color: 'bg-purple-600 hover:bg-purple-700 text-white', icon: <Clock className="h-4 w-4" />,      confirmMsg: 'Move this registration to the waitlist?',                               needsSlotCheck: false },
  cancel:   { label: 'Cancel Registration', shortLabel: 'Cancel',    color: 'bg-gray-500 hover:bg-gray-600 text-white',     icon: <Ban className="h-4 w-4" />,        confirmMsg: 'Cancel this verified registration? The slot will open for others.',     needsSlotCheck: false },
  reopen:   { label: 'Re-open for Review',  shortLabel: 'Re-open',   color: 'bg-indigo-600 hover:bg-indigo-700 text-white', icon: <RotateCcw className="h-4 w-4" />,  confirmMsg: 'Move back to pending for review?',                                      needsSlotCheck: true  },
}

// Email is sent only for these
const SEND_EMAIL_FOR: Partial<Record<Action, true>> = { verify: true, reject: true }

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  registration, onClose, onAction, acting, slotsLeft,
}: {
  registration: Registration
  onClose: () => void
  onAction: (id: string, action: Action, notes?: string) => Promise<void>
  acting: boolean
  slotsLeft: number | null
}) {
  const [imgError, setImgError] = useState(false)
  const [notes, setNotes] = useState(registration.admin_notes || '')
  const [notesChanged, setNotesChanged] = useState(false)
  const [pendingAction, setPendingAction] = useState<Action | null>(null)
  const [savingNotes, setSavingNotes] = useState(false)
  const supabase = createClient()
  const actions = getActions(registration.payment_status)
  const isFull = slotsLeft !== null && slotsLeft <= 0

  const saveNotes = async () => {
    setSavingNotes(true)
    await supabase.from('meetup_registrations').update({ admin_notes: notes || null }).eq('id', registration.id)
    setSavingNotes(false)
    setNotesChanged(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-[#3a4095] text-white flex-shrink-0">
          <h2 className="text-lg font-semibold">Registration Details</h2>
          <button onClick={onClose} className="hover:bg-indigo-700 rounded-full p-1 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Status row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <StatusBadge status={registration.payment_status} />
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(registration.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          {/* Status updated at */}
          {registration.status_updated_at && (
            <p className="text-xs text-gray-400">
              Status last changed:{' '}
              {new Date(registration.status_updated_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}

          {/* Slot warning for reopen */}
          {(registration.payment_status === 'rejected' || registration.payment_status === 'cancelled') && isFull && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700 leading-relaxed">
                <strong>Heads up:</strong> This meetup is currently full. Re-opening this registration
                will exceed the slot limit. You can still proceed if this person deserves priority.
              </p>
            </div>
          )}

          {/* Personal info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Registrant</h3>
            <Row icon={<User className="h-4 w-4 text-[#3a4095]" />}>
              <span className="font-semibold text-gray-800">{registration.full_name || '—'}</span>
            </Row>
            <Row icon={<Mail className="h-4 w-4 text-[#3a4095]" />}>
              <a href={`mailto:${registration.email}`} className="text-indigo-600 hover:underline text-sm">{registration.email || '—'}</a>
            </Row>
            {registration.phone && (
              <Row icon={<Phone className="h-4 w-4 text-[#3a4095]" />}>
                <a href={`tel:${registration.phone}`} className="text-sm text-gray-700">{registration.phone}</a>
              </Row>
            )}
          </div>

          {/* Meetup info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Meetup</h3>
            <Row icon={<Calendar className="h-4 w-4 text-[#3a4095]" />}>
              <div>
                <Link href={`/dashboard/meetups/${registration.meetup?.id}/edit`} className="font-medium text-indigo-600 hover:underline flex items-center gap-1">
                  {registration.meetup?.title || '—'}<ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <p className="text-xs text-gray-500">
                  {registration.meetup?.meetup_date
                    ? (() => { const [y,m,d] = registration.meetup.meetup_date.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) })()
                    : '—'}
                </p>
              </div>
            </Row>
            <Row icon={<CreditCard className="h-4 w-4 text-[#3a4095]" />}>
              <span className="text-sm text-gray-700">{registration.meetup?.payment_required ? 'Payment required' : 'Free entry'}</span>
            </Row>
            <Row icon={<Users className="h-4 w-4 text-[#3a4095]" />}>
              <span className={`text-sm font-medium ${isFull ? 'text-red-600' : slotsLeft !== null && slotsLeft <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                {slotsLeft === null ? 'Open (no slot limit)' : isFull ? 'Fully booked' : `${slotsLeft} slot${slotsLeft === 1 ? '' : 's'} remaining`}
              </span>
            </Row>
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
                    <a href={registration.payment_screenshot_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                      Open full size <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{imgError ? 'Failed to load screenshot' : 'No screenshot uploaded'}</p>
                </div>
              )}
            </div>
          )}

          {/* Admin notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StickyNote className="h-4 w-4 text-amber-600" />
              <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Admin Notes</h3>
              <span className="text-xs text-amber-400 ml-auto">Internal only — never shown to user</span>
            </div>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); setNotesChanged(true) }}
              rows={3}
              placeholder="e.g. User sent proof via WhatsApp, approved manually..."
              className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
            {notesChanged && (
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="mt-2 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            )}
          </div>
        </div>

        {/* Action area */}
        {actions.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            {pendingAction ? (
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-sm text-gray-700 font-medium">{ACTION_CONFIG[pendingAction].confirmMsg}</p>
                {ACTION_CONFIG[pendingAction].needsSlotCheck && isFull && (
                  <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 border border-orange-200">
                    ⚠️ Meetup is full — this will exceed the slot limit.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { onAction(registration.id, pendingAction, notes); setPendingAction(null) }}
                    disabled={acting}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${ACTION_CONFIG[pendingAction].color}`}
                  >
                    {acting ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : ACTION_CONFIG[pendingAction].icon}
                    {acting ? 'Processing...' : `Yes, ${ACTION_CONFIG[pendingAction].shortLabel}`}
                  </button>
                  <button onClick={() => setPendingAction(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex gap-2 ${actions.length > 2 ? 'flex-col' : ''}`}>
                {actions.map(action => (
                  <button
                    key={action}
                    onClick={() => setPendingAction(action)}
                    disabled={acting}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${ACTION_CONFIG[action].color}`}
                  >
                    {ACTION_CONFIG[action].icon}
                    {ACTION_CONFIG[action].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared row helper ─────────────────────────────────────────────────────────

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>{children}</div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function RegistrationsDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({})
  const [meetupFilter, setMeetupFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [acting, setActing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4500)
  }

  // ── Load ────────────────────────────────────────────────────────────────────
  const refreshSlots = async (regs: Registration[]) => {
    const meetupIds = [...new Set(regs.map(r => r.meetup?.id).filter(Boolean))] as string[]
    const counts: Record<string, number> = {}
    await Promise.all(meetupIds.map(async mid => {
      const meetup = regs.find(r => r.meetup?.id === mid)?.meetup
      if (!meetup?.max_slots) return
      const { count } = await supabase
        .from('meetup_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('meetup_id', mid)
        .in('payment_status', ['pending', 'submitted', 'verified', 'waitlisted'])
      counts[mid] = meetup.max_slots - (count ?? 0)
    }))
    setSlotCounts(counts)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/admin/sign-in'); return }

      const { data, error } = await supabase
        .from('meetup_registrations')
        .select(`
          id, full_name, email, phone, why_join,
          payment_status, payment_screenshot_url,
          admin_notes, status_updated_at, created_at,
          meetup:meetups!meetup_id (
            id, title, meetup_date, location, payment_required, max_slots
          )
        `)
        .order('created_at', { ascending: false })

      if (error) { console.error(error); setLoading(false); return }
      const regs = (data as unknown as Registration[]) || []
      setRegistrations(regs)
      await refreshSlots(regs)
      setLoading(false)
    }
    load()
  }, [router])

  // ── Action handler ──────────────────────────────────────────────────────────
  const handleAction = async (id: string, action: Action, notes?: string) => {
    setActing(true)

    const statusMap: Record<Action, PaymentStatus> = {
      verify: 'verified', reject: 'rejected', waitlist: 'waitlisted',
      cancel: 'cancelled', reopen: 'pending',
    }
    const newStatus = statusMap[action]

    const { error } = await supabase
      .from('meetup_registrations')
      .update({
        payment_status: newStatus,
        status_updated_at: new Date().toISOString(),
        ...(notes !== undefined ? { admin_notes: notes || null } : {}),
      })
      .eq('id', id)

    if (error) { showToast('Failed to update status.', 'error'); setActing(false); return }

    // Update local state
    const updatedRegs = registrations.map(r =>
      r.id === id ? { ...r, payment_status: newStatus, status_updated_at: new Date().toISOString(), admin_notes: notes ?? r.admin_notes } : r
    )
    setRegistrations(updatedRegs)
    setSelectedReg(prev => prev?.id === id ? { ...prev, payment_status: newStatus, status_updated_at: new Date().toISOString() } : prev)
    await refreshSlots(updatedRegs)

    // Send email
    const reg = registrations.find(r => r.id === id)
    if (action in SEND_EMAIL_FOR && reg?.email) {
      try {
        await fetch('/api/payment-status-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: reg.email, full_name: reg.full_name,
            meetup_title: reg.meetup?.title, meetup_date: reg.meetup?.meetup_date,
            meetup_location: reg.meetup?.location, status: newStatus,
          }),
        })
        showToast(
          action === 'verify' ? `Verified — confirmation sent to ${reg.email}` : `Rejected — email sent to ${reg.email}`,
          'success'
        )
      } catch {
        showToast('Status updated but email failed.', 'error')
      }
    } else {
      const msgs: Record<Action, string> = {
        verify: 'Payment verified.', reject: 'Registration rejected.',
        waitlist: 'Moved to waitlist.', cancel: 'Registration cancelled.',
        reopen: 'Re-opened for review — status set to pending.',
      }
      showToast(msgs[action], 'success')
    }

    setActing(false)
  }

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...registrations]
    if (meetupFilter !== 'all') r = r.filter(x => x.meetup?.id === meetupFilter)
    if (statusFilter !== 'all') r = r.filter(x => x.payment_status === statusFilter)
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase()
      r = r.filter(x =>
        x.full_name?.toLowerCase().includes(t) || x.email?.toLowerCase().includes(t) ||
        x.phone?.toLowerCase().includes(t) || x.meetup?.title?.toLowerCase().includes(t) ||
        x.admin_notes?.toLowerCase().includes(t)
      )
    }
    return r
  }, [meetupFilter, statusFilter, searchTerm, registrations])

  const uniqueMeetups = Array.from(
    new Map(registrations.map(r => [r.meetup?.id, r.meetup])).values()
  ).filter((m): m is NonNullable<typeof m> => m !== null)

  const summary = useMemo(() => {
    const c: Record<string, number> = {}
    for (const r of registrations) { const s = r.payment_status ?? 'unknown'; c[s] = (c[s] || 0) + 1 }
    return c
  }, [registrations])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a4095]" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 max-w-sm ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3a4095] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-300 flex-shrink-0`}>
        <div className="p-6 border-b border-indigo-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">IsbReadWithUs</span>
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
            <Link key={item.label} href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-indigo-700 transition-colors ${item.active ? 'bg-indigo-700' : ''}`}>
              <item.icon className="h-5 w-5 mr-3" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <button onClick={() => supabase.auth.signOut().then(() => router.replace('/admin/sign-in'))}
            className="flex items-center w-full px-4 py-3 text-white/90 hover:bg-indigo-800 rounded-lg">
            <LogOut className="h-5 w-5 mr-3" />Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Meetup Registrations</h1>
            </div>
            <span className="text-sm text-gray-400">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto space-y-5">

          {/* Summary pills — clickable to filter */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_CONFIG) as PaymentStatus[]).map(s =>
              summary[s] ? (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${STATUS_CONFIG[s].color} ${statusFilter === s ? 'ring-2 ring-offset-1 ring-current opacity-100' : 'opacity-80 hover:opacity-100'}`}
                >
                  {STATUS_CONFIG[s].icon}{summary[s]} {STATUS_CONFIG[s].label}
                </button>
              ) : null
            )}
            {statusFilter !== 'all' && (
              <button onClick={() => setStatusFilter('all')} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Clear filter
              </button>
            )}
          </div>

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, notes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none text-sm"
              />
            </div>
            <select value={meetupFilter} onChange={e => setMeetupFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#3a4095] outline-none text-sm">
              <option value="all">All Meetups</option>
              {uniqueMeetups.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title}{m.meetup_date ? ` (${new Date(m.meetup_date).toLocaleDateString()})` : ''}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#3a4095] outline-none text-sm">
              <option value="all">All Statuses</option>
              {(Object.keys(STATUS_CONFIG) as PaymentStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name & Contact', 'Meetup', 'Status', 'Slots', 'Notes', 'Registered'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(r => {
                    const meetupId = r.meetup?.id
                    const slots = meetupId !== undefined ? slotCounts[meetupId] ?? null : null

                    return (
                      <tr key={r.id} className="hover:bg-indigo-50/30 cursor-pointer transition-colors" onClick={() => setSelectedReg(r)}>
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">{r.full_name || '—'}</div>
                          <div className="text-sm text-gray-500">{r.email}</div>
                          {r.phone && <div className="text-xs text-gray-400">{r.phone}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-gray-800">{r.meetup?.title || '—'}</div>
                          <div className="text-xs text-gray-400">
                            {r.meetup?.meetup_date
                              ? (() => { const [y,m,d] = r.meetup.meetup_date.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) })()
                              : '—'}
                          </div>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={r.payment_status} /></td>
                        <td className="px-5 py-4">
                          {slots !== null
                            ? <span className={`text-xs font-medium ${slots <= 0 ? 'text-red-500' : slots <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                                {slots <= 0 ? 'Full' : `${slots} left`}
                              </span>
                            : <span className="text-xs text-gray-400">Open</span>
                          }
                        </td>
                        <td className="px-5 py-4 max-w-[180px]">
                          {r.admin_notes
                            ? <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full truncate block border border-amber-200">📝 {r.admin_notes}</span>
                            : <span className="text-xs text-gray-300">—</span>
                          }
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-gray-400">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        No registrations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
              Showing {filtered.length} of {registrations.length} registrations
            </div>
          </div>
        </main>
      </div>

      {/* Detail panel */}
      {selectedReg && (
        <DetailPanel
          registration={selectedReg}
          onClose={() => setSelectedReg(null)}
          onAction={handleAction}
          acting={acting}
          slotsLeft={selectedReg.meetup?.id ? slotCounts[selectedReg.meetup.id] ?? null : null}
        />
      )}
    </div>
  )
}