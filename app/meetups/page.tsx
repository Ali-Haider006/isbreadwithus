// app/meetups/page.tsx
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function MeetupsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: meetups } = await supabase
    .from('meetups')
    .select('*, book:books!book_id(id, title, author, cover_image_url)')
    .eq('status', 'upcoming')
    .gte('meetup_date', new Date().toISOString().split('T')[0])
    .order('meetup_date', { ascending: true })

  // Fetch registration counts for all meetups in parallel
  const meetupsWithCounts = await Promise.all(
    (meetups ?? []).map(async (meetup) => {
      if (!meetup.max_slots) return { ...meetup, slotsLeft: null }
      const { count } = await supabase
        .from('meetup_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('meetup_id', meetup.id)
        .neq('payment_status', 'rejected')
      return { ...meetup, slotsLeft: meetup.max_slots - (count ?? 0) }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Upcoming Meetups</h1>
          <p className="text-lg text-white/80">Find your next literary adventure and register your spot.</p>
        </div>
        <div className="relative">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-10 fill-gray-50">
            <path d="M321.39,36.44c58-7.79,114.16-21.13,172-28.86,82.39-10.72,168.19-11.73,250.45-.39C823.78,21,906.67,52,985.66,62.83c70.05,10.48,146.53,16.09,214.34,3V0H0V17.35A600.21,600.21,0,0,0,321.39,36.44Z" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {meetupsWithCounts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-[#3a4095]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-[#3a4095]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Upcoming Meetups</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Check back soon or follow us on{' '}
              <a
                href="https://www.instagram.com/islamabadreadswithus/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3a4095] underline"
              >
                Instagram
              </a>{' '}
              to get notified of new events.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {meetupsWithCounts.map((meetup) => {
              const [year, month, day] = meetup.meetup_date.split('-').map(Number)
              const date = new Date(year, month - 1, day)
              const slotsLeft = meetup.slotsLeft
              const full = slotsLeft !== null && slotsLeft <= 0
              const almostFull = !full && slotsLeft !== null && slotsLeft <= 3
              const bookCover = meetup.book?.cover_image_url ?? null

              // Slots display
              let slotsText = 'Open registration'
              let slotsColor = 'text-green-600'
              if (full) { slotsText = 'Fully booked'; slotsColor = 'text-red-600' }
              else if (almostFull) { slotsText = `Only ${slotsLeft} slot${slotsLeft === 1 ? '' : 's'} left`; slotsColor = 'text-orange-500' }
              else if (slotsLeft !== null) { slotsText = `${slotsLeft} of ${meetup.max_slots} slots available` }

              // Time format
              let timeStr = ''
              if (meetup.meetup_time) {
                const [h, m] = meetup.meetup_time.split(':').map(Number)
                const ampm = h >= 12 ? 'PM' : 'AM'
                timeStr = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
              }

              return (
                <div
                  key={meetup.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
                >
                  {/* Card header */}
                  <div className="relative bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white overflow-hidden">

                    {/* Faint book cover background */}
                    {bookCover && (
                      <img
                        src={bookCover}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                      />
                    )}

                    <div className="relative z-10 p-6">
                      <div className="text-sm font-medium opacity-80 mb-1">
                        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-5xl font-bold leading-none">
                        {String(date.getDate()).padStart(2, '0')}
                      </div>
                      <div className="text-sm opacity-80 mt-1">
                        {date.toLocaleString('default', { weekday: 'long' })}
                      </div>

                      {/* Book pill */}
                      {meetup.book?.title && (
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="truncate max-w-[180px]">{meetup.book.title}</span>
                        </div>
                      )}
                    </div>

                    {full && (
                      <div className="absolute top-4 right-4 z-20 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Fully Booked
                      </div>
                    )}
                    {almostFull && (
                      <div className="absolute top-4 right-4 z-20 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Almost Full
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">{meetup.title}</h2>
                    {meetup.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{meetup.description}</p>
                    )}

                    <div className="space-y-2 text-sm text-gray-600 mb-5">
                      {timeStr && (
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-[#3a4095] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path strokeWidth="2" strokeLinecap="round" d="M12 6v6l4 2" />
                          </svg>
                          <span>{timeStr}</span>
                        </div>
                      )}

                      {meetup.location && (
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-[#3a4095] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                            <circle cx="12" cy="9" r="2.5" strokeWidth="2" />
                          </svg>
                          <span className="truncate">{meetup.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-[#3a4095] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" strokeWidth="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className={`font-medium ${slotsColor}`}>{slotsText}</span>
                      </div>

                      <div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {meetup.payment_required ? `PKR ${meetup.payment_amount || 0}` : 'Free'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {full ? (
                        <button disabled className="w-full bg-gray-200 text-gray-400 px-4 py-2.5 rounded-full font-semibold cursor-not-allowed">
                          Fully Booked
                        </button>
                      ) : (
                        <a
                          href={`/meetups/${meetup.id}`}
                          className="block w-full bg-[#3a4095] text-white text-center px-4 py-2.5 rounded-full font-semibold hover:bg-[#2d3275] transition"
                        >
                          Register Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}