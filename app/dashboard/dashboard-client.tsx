'use client'

import { useState } from 'react'
import { BookOpen, Users, UserX, Star, Calendar, Mail, Phone, LogOut, X, Download, CheckCircle, XCircle, Clock } from 'lucide-react'

// Types
interface Registration {
  id: string
  name: string
  phone: string
  email: string
  is_no_show: boolean
  previous_payment_ref: string | null
  payment_screenshot_url: string | null
  status: string
  created_at: string
}

interface Feedback {
  id: string
  rating: number
  enjoyed_most: string
  suggestions: string | null
  created_at: string
}

interface User {
  email?: string
}

// Modal Component
function RegistrationModal({ registration, onClose }: { registration: Registration, onClose: () => void }) {
  if (!registration) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#3a4095] rounded-full flex items-center justify-center text-white text-lg font-semibold">
              {registration.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{registration.name}</h3>
              <p className="text-xs text-gray-500">Registration Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Payment Screenshot */}
        {registration.payment_screenshot_url && (
          <div className="px-6 py-4 bg-gray-50">
            <img
              src={registration.payment_screenshot_url}
              alt="Payment Screenshot"
              className="w-full rounded-lg shadow-md"
            />
            <a
              href={registration.payment_screenshot_url}
              download
              className="mt-3 flex items-center justify-center gap-2 text-sm text-[#3a4095] hover:text-[#2d3275] font-medium"
            >
              <Download className="h-4 w-4" />
              Download Screenshot
            </a>
          </div>
        )}

        {/* Details */}
        <div className="px-6 py-4 space-y-4">
          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
            <div className="mt-1">
              <span className={`px-3 py-1 inline-flex items-center gap-2 text-sm font-semibold rounded-full ${
                registration.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                registration.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {registration.status === 'pending' && <Clock className="h-4 w-4" />}
                {registration.status === 'confirmed' && <CheckCircle className="h-4 w-4" />}
                {registration.status === 'rejected' && <XCircle className="h-4 w-4" />}
                {registration.status}
              </span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
            <p className="mt-1 text-gray-900">{registration.name}</p>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
            <div className="mt-1 flex items-center gap-2 text-gray-900">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${registration.email}`} className="hover:text-[#3a4095]">
                {registration.email}
              </a>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
            <div className="mt-1 flex items-center gap-2 text-gray-900">
              <Phone className="h-4 w-4 text-gray-400" />
              <a href={`tel:${registration.phone}`} className="hover:text-[#3a4095]">
                {registration.phone}
              </a>
            </div>
          </div>

          {/* No Show Status */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Previous No-Show</label>
            <div className="mt-1">
              {registration.is_no_show ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  <UserX className="h-4 w-4" />
                  Yes - Using previous payment
                </span>
              ) : (
                <span className="text-gray-600">No</span>
              )}
            </div>
          </div>

          {/* Previous Payment Reference */}
          {registration.previous_payment_ref && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Previous Payment Reference</label>
              <p className="mt-1 text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded">
                {registration.previous_payment_ref}
              </p>
            </div>
          )}

          {/* Registration Date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Registration Date</label>
            <p className="mt-1 text-gray-900">
              {new Date(registration.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* ID */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Registration ID</label>
            <p className="mt-1 text-gray-600 font-mono text-xs">{registration.id}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-[#3a4095] text-white py-2 px-4 rounded-lg hover:bg-[#2d3275] transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function DashboardClient({ 
  user, 
  registrations, 
  feedback 
}: { 
  user: User, 
  registrations: Registration[], 
  feedback: Feedback[] 
}) {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // Calculate stats
  const totalRegistrations = registrations?.length || 0
  const pendingRegistrations = registrations?.filter(r => r.status === 'pending').length || 0
  const noShowCount = registrations?.filter(r => r.is_no_show).length || 0
  const averageRating = feedback?.length 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#3a4095] rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#3a4095]">IsBreadWithUs</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user?.email && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
                  <div className="h-8 w-8 bg-[#3a4095] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.email}</span>
                </div>
              )}
              <form action="/api/auth/signout" method="post">
                <button 
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#3a4095] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
          <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your book club today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500">Total Registrations</dt>
                  <dd className="mt-2 text-3xl font-bold text-[#3a4095]">{totalRegistrations}</dd>
                </div>
                <div className="h-12 w-12 bg-[#3a4095]/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#3a4095]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500">Pending Review</dt>
                  <dd className="mt-2 text-3xl font-bold text-orange-600">{pendingRegistrations}</dd>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500">No Shows</dt>
                  <dd className="mt-2 text-3xl font-bold text-red-600">{noShowCount}</dd>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500">Average Rating</dt>
                  <dd className="mt-2 text-3xl font-bold text-green-600">{averageRating}</dd>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white shadow-md rounded-lg mb-8 border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#3a4095]/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#3a4095]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
                  <p className="text-sm text-gray-500">{totalRegistrations} total members • Click row for details</p>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No Show</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registered</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No registrations yet</p>
                      <p className="text-xs text-gray-400 mt-1">New registrations will appear here</p>
                    </td>
                  </tr>
                ) : (
                  registrations?.map((reg) => (
                    <tr 
                      key={reg.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRegistration(reg)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-[#3a4095] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {reg.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{reg.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-xs">{reg.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{reg.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reg.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          reg.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.is_no_show ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
                  <p className="text-sm text-gray-500">{feedback?.length || 0} responses received</p>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Enjoyed Most</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Suggestions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No feedback yet</p>
                      <p className="text-xs text-gray-400 mt-1">Member feedback will appear here</p>
                    </td>
                  </tr>
                ) : (
                  feedback?.map((fb) => (
                    <tr key={fb.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={i < fb.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">({fb.rating})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{fb.enjoyed_most}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">
                          {fb.suggestions || <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(fb.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Registration Detail Modal */}
      {selectedRegistration && (
        <RegistrationModal 
          registration={selectedRegistration} 
          onClose={() => setSelectedRegistration(null)} 
        />
      )}
    </div>
  )
}