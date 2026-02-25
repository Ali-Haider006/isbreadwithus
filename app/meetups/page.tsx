// app/meetups/page.tsx
import { createClient } from '@/lib/supabase/server' // or client – use server for SSR
import { cookies } from 'next/headers'

export default async function MeetupsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: meetups } = await supabase
    .from('meetups')
    .select('*')
    .eq('status', 'upcoming')
    .order('meetup_date', { ascending: true })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upcoming Meetups</h1>
      {meetups?.length === 0 ? (
        <p>No upcoming meetups yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meetups?.map(m => (
            <div key={m.id} className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{m.title}</h2>
              <p className="text-gray-600 mt-2">{m.book_name || 'General Discussion'}</p>
              <p className="mt-4">
                <strong>Date:</strong> {m.meetup_date} {m.meetup_time ? `at ${m.meetup_time}` : ''}
              </p>
              <p><strong>Location:</strong> {m.location}</p>
              <a href={`/meetups/${m.id}`} className="mt-4 inline-block text-blue-600 hover:underline">
                View & Register →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}