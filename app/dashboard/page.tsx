import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from "next/headers";

export default async function DashboardPage() {
    const cookieStore = await cookies();
  const supabase = await createClient(cookieStore)
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/sign-in')
  }

  // Fetch registrations
  const { data: registrations, error: regError } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

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
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Registrations</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalRegistrations}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="mt-1 text-3xl font-semibold text-orange-600">{pendingRegistrations}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">No Shows</dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600">{noShowCount}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">{averageRating}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Registrations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Show</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No registrations yet
                    </td>
                  </tr>
                ) : (
                  registrations?.map((reg) => (
                    <tr key={reg.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.is_no_show ? '✓' : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Feedback</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enjoyed Most</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggestions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No feedback yet
                    </td>
                  </tr>
                ) : (
                  feedback?.map((fb) => (
                    <tr key={fb.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl">{'⭐'.repeat(fb.rating)}</span>
                          <span className="ml-2 text-sm text-gray-500">({fb.rating}/5)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{fb.enjoyed_most}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {fb.suggestions || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}