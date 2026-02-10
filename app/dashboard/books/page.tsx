// app/dashboard/books/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  BookOpen, Plus, Edit, Trash2, Search,
  LayoutDashboard, Calendar, Users, MessageSquare, Settings, LogOut,
  ChevronLeft, ChevronRight
} from 'lucide-react'

type Book = {
  id: string
  title: string | null
  author: string | null
  description: string | null
  genre: string | null
  status: 'upcoming'| 'completed' | null
  start_date: string | null
  end_date: string | null
}

export default function BooksDashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filteredBooks = useMemo(() => {
    let result = [...books]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(b =>
        b.title?.toLowerCase().includes(term) ||
        b.author?.toLowerCase().includes(term) ||
        b.genre?.toLowerCase().includes(term)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter)
    }

    return result
  }, [books, searchTerm, statusFilter])

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/admin/sign-in')
        return
      }

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('start_date', { ascending: false, nullsFirst: true })

      if (error) {
        console.error('Error loading books:', error)
      } else {
        setBooks(data || [])
      }
      setLoading(false)
    }

    checkAuthAndLoad()
  }, [router, supabase])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book? Associated tags will also be removed.')) return

    const { error } = await supabase.from('books').delete().eq('id', id)
    if (!error) {
      setBooks(prev => prev.filter(b => b.id !== id))
    } else {
      alert('Error deleting book')
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'upcoming':
        return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
      case 'current':
        return { label: 'Current Read', color: 'bg-green-100 text-green-800' }
      case 'completed':
        return { label: 'Completed', color: 'bg-purple-100 text-purple-800' }
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
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
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#3a4095] transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition duration-300 ease-in-out`}
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
            { icon: Users, label: 'Registrations', href: '/dashboard/registrations' },
            { icon: BookOpen, label: 'Books & Tags', href: '/dashboard/books', active: true },
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center lg:hidden">
              <button onClick={() => setSidebarOpen(true)}>
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
              <span className="ml-4 text-lg font-semibold text-[#3a4095]">Books</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Books & Reading List</h1>
            <Link
              href="/dashboard/books/new"
              className="inline-flex items-center px-5 py-2.5 bg-[#3a4095] text-white rounded-lg hover:bg-indigo-800"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Book
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by title, author or genre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3a4095]"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="current">Current</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title & Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBooks.map(book => {
                    const badge = getStatusBadge(book.status)
                    return (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{book.title || 'Untitled'}</div>
                          <div className="text-sm text-gray-600">{book.author || '—'}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{book.genre || '—'}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {book.start_date && book.end_date
                            ? `${new Date(book.start_date).toLocaleDateString()} — ${new Date(book.end_date).toLocaleDateString()}`
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/dashboard/books/${book.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(book.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredBooks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No books found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        </main>
      </div>
    </div>
  )
}