// app/dashboard/books/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  BookOpen, Plus, Pencil, Trash2, Search,
  LayoutDashboard, Calendar, Users, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, X, AlertTriangle
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Book = {
  id: string
  title: string | null
  author: string | null
  description: string | null
  genre: string | null
  cover_image_url: string | null
  // computed after fetch — how many meetups reference this book
  meetup_count?: number
}

// ── Cover thumbnail ───────────────────────────────────────────────────────────

function CoverThumb({ src, title }: { src: string | null; title: string | null }) {
  const [err, setErr] = useState(false)
  if (src && !err) {
    return (
      <img
        src={src}
        alt={title || 'Book cover'}
        className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0"
        onError={() => setErr(true)}
      />
    )
  }
  return (
    <div className="w-10 h-14 bg-[#3a4095]/10 rounded flex items-center justify-center flex-shrink-0">
      <BookOpen className="h-5 w-5 text-[#3a4095]/40" />
    </div>
  )
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({
  book,
  onConfirm,
  onCancel,
  deleting,
}: {
  book: Book
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  const hasMeetups = (book.meetup_count ?? 0) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Delete Book</h3>
              <p className="text-sm text-gray-500 mt-0.5">&quot;{book.title || 'Untitled'}&quot;</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {hasMeetups && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 leading-relaxed">
              This book is linked to <strong>{book.meetup_count} meetup{book.meetup_count === 1 ? '' : 's'}</strong>.
              Deleting it will unlink it from those meetups (the meetups themselves won&apos;t be deleted).
            </p>
          </div>
        )}

        <p className="text-sm text-gray-600">
          This will permanently delete the book and its cover image. This cannot be undone.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting
              ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
              : <><Trash2 className="h-4 w-4" /> Yes, Delete</>
            }
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function BooksDashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [genreFilter, setGenreFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/admin/sign-in'); return }

      // Fetch books + count of meetups referencing each
      const { data: booksData, error } = await supabase
        .from('books')
        .select('*, meetups(id)')
        .order('title', { ascending: true })

      if (error) { console.error(error); setLoading(false); return }

      const enriched: Book[] = (booksData || []).map((b) => ({
        ...b,
        meetup_count: Array.isArray(b.meetups) ? b.meetups.length : 0,
        meetups: undefined,
      }))

      setBooks(enriched)
      setLoading(false)
    }
    load()
  }, [router])

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)

    // If there's a cover image in storage, remove it too
    if (deleteTarget.cover_image_url) {
      try {
        const url = new URL(deleteTarget.cover_image_url)
        const pathParts = url.pathname.split('/books-images/')
        if (pathParts.length > 1) {
          await supabase.storage.from('books-images').remove([pathParts[1]])
        }
      } catch { /* non-fatal — storage cleanup is best-effort */ }
    }

    const { error } = await supabase.from('books').delete().eq('id', deleteTarget.id)

    if (error) {
      showToast('Failed to delete book. Please try again.', 'error')
    } else {
      setBooks(prev => prev.filter(b => b.id !== deleteTarget.id))
      showToast(`"${deleteTarget.title || 'Book'}" deleted.`, 'success')
    }

    setDeleting(false)
    setDeleteTarget(null)
  }

  // ── Filtering ───────────────────────────────────────────────────────────────
  const genres = useMemo(() => {
    const set = new Set(books.map(b => b.genre).filter(Boolean) as string[])
    return [...set].sort()
  }, [books])

  const filtered = useMemo(() => {
    let r = [...books]
    if (genreFilter !== 'all') r = r.filter(b => b.genre === genreFilter)
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase()
      r = r.filter(b =>
        b.title?.toLowerCase().includes(t) ||
        b.author?.toLowerCase().includes(t) ||
        b.genre?.toLowerCase().includes(t) ||
        b.description?.toLowerCase().includes(t)
      )
    }
    return r
  }, [books, searchTerm, genreFilter])

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
          {toast.type === 'success'
            ? <BookOpen className="h-4 w-4 flex-shrink-0" />
            : <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          }
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3a4095] transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 transition duration-300 flex-shrink-0`}>
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
            { icon: Users,           label: 'Registrations', href: '/dashboard/registrations' },
            { icon: BookOpen,        label: 'Books',         href: '/dashboard/books', active: true },
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
          <button
            onClick={() => supabase.auth.signOut().then(() => router.replace('/admin/sign-in'))}
            className="flex items-center w-full px-4 py-3 text-white/90 hover:bg-indigo-800 rounded-lg"
          >
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
              <h1 className="text-xl font-bold text-gray-900">Books</h1>
            </div>
            <Link
              href="/dashboard/books/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3a4095] text-white rounded-lg hover:bg-indigo-800 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Book
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Books</p>
              <p className="text-3xl font-bold text-[#3a4095] mt-1">{books.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">With Cover</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {books.filter(b => b.cover_image_url).length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Genres</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{genres.length}</p>
            </div>
          </div>

          {/* Search + genre filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search title, author, genre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4095] focus:border-transparent outline-none text-sm"
              />
            </div>
            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#3a4095] outline-none text-sm"
            >
              <option value="all">All Genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Cover', 'Title & Author', 'Genre', 'Description', 'Meetups', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(book => (
                    <tr key={book.id} className="hover:bg-indigo-50/20 transition-colors">

                      {/* Cover */}
                      <td className="px-5 py-4">
                        <CoverThumb src={book.cover_image_url} title={book.title} />
                      </td>

                      {/* Title + author */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{book.title || 'Untitled'}</div>
                        <div className="text-sm text-gray-500">{book.author || '—'}</div>
                      </td>

                      {/* Genre */}
                      <td className="px-5 py-4">
                        {book.genre
                          ? <span className="inline-block text-xs bg-[#3a4095]/10 text-[#3a4095] px-2.5 py-0.5 rounded-full font-medium">{book.genre}</span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-sm text-gray-500 line-clamp-2">{book.description || '—'}</p>
                      </td>

                      {/* Meetup count */}
                      <td className="px-5 py-4">
                        {(book.meetup_count ?? 0) > 0
                          ? <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                              <Calendar className="h-3 w-3" />
                              {book.meetup_count} meetup{book.meetup_count === 1 ? '' : 's'}
                            </span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/books/${book.id}/edit`}
                            className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(book)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        {searchTerm || genreFilter !== 'all' ? 'No books match your filters.' : 'No books added yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
              Showing {filtered.length} of {books.length} books
            </div>
          </div>
        </main>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          book={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  )
}