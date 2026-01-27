'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();


const MenuIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5zm0 2.2l8 4v8.3c0 4.5-3.2 8.8-8 10-4.8-1.2-8-5.5-8-10V8.2l8-4z"/>
    <path d="M8 10h8v2H8zm0 3h8v2H8z"/>
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="9" cy="7" r="4"/>
    <path d="M2 20c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6"/>
    <circle cx="18" cy="9" r="3"/>
    <path d="M16 20c0-2.2 1.3-4 3-5 .7-.4 1.3-.6 2-.6h1"/>
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2"/>
  </svg>
);

type SiteConfig = {
  site_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_description: string;
  contact_email?: string;
  instagram_url?: string;
};

type HeroStat = {
  label: string;
  value: string;
  display_order: number;
};

type Meetup = {
  id: string;
  title: string;
  description: string;
  meetup_date: string;
  meetup_time: string;
  end_time?: string;
  location?: string;
  book_name: string;
  max_slots?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  // We'll compute slots_occupied later or via RPC/view
};

type Book = {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre?: string;
  status: 'upcoming' | 'current' | 'completed';
  start_date?: string;
  end_date?: string;
};

type Guideline = {
  title: string;
  description: string;
  display_order: number;
};

type FAQ = {
  question: string;
  answer: string;
  category?: string;
  display_order: number;
};

type NavItem = {
  label: string;
  href: string;
  display_order: number;
  is_button?: boolean;
};

export default function BookClubLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [heroStats, setHeroStats] = useState<HeroStat[]>([]);
  const [upcomingMeetups, setUpcomingMeetups] = useState<Meetup[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);

        // 1. Site Config (assume single row – take first)
        const { data: configData } = await supabase
          .from('site_config')
          .select('*')
          .limit(1)
          .single();
        setConfig(configData);

        // 2. Hero Stats (ordered)
        const { data: statsData } = await supabase
          .from('hero_stats')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        setHeroStats(statsData || []);

        // 3. Navigation Items (ordered)
        const { data: navData } = await supabase
          .from('navigation_items')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        setNavItems(navData || []);

        // 4. Upcoming Meetups (future + upcoming status)
        const today = '2026-01-27'; // current date per prompt
        const { data: meetupsData } = await supabase
          .from('meetups')
          .select('*')
          .eq('status', 'upcoming')
          .gte('meetup_date', today)
          .order('meetup_date', { ascending: true })
          .limit(6); // show up to 6
        setUpcomingMeetups(meetupsData || []);

        // 5. Books – split into current/upcoming + completed
        const { data: booksData } = await supabase
          .from('books')
          .select('*')
          .order('start_date', { ascending: false});
        setBooks(booksData || []);

        // 6. Guidelines (ordered)
        const { data: guidelinesData } = await supabase
          .from('guidelines')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        setGuidelines(guidelinesData || []);

        // 7. FAQs (ordered)
        const { data: faqsData } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        setFaqs(faqsData || []);

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load content');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // Fallback nav if dynamic is empty
  const displayNavItems = navItems.length > 0 ? navItems : [
    { label: 'About', href: '#about', is_button: false },
    { label: 'Meetups', href: '#meetups', is_button: false },
    { label: 'Books', href: '#books', is_button: false },
    { label: 'Feedback', href: '/feedback', is_button: false },
  ];

  const currentBooks = books.filter(b => b.status === 'current');
  const upcomingBooks = books.filter(b => b.status === 'upcoming');
  const previousBooks = books.filter(b => b.status === 'completed');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading book club content...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#3a4095] rounded-full flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#3a4095]">
                {config?.site_name || 'IsbReadWithUs'}
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {displayNavItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={
                    item.is_button
                      ? "bg-[#3a4095] text-white px-6 py-2 rounded-full hover:bg-[#2d3275] transition"
                      : "text-gray-700 hover:text-[#3a4095] transition"
                  }
                >
                  {item.label}
                </a>
              ))}
              {/* Admin link always static for now */}
              <a href="/sign-in" className="text-sm text-gray-600 hover:text-[#3a4095] transition">
                Admin
              </a>
            </div>

            <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                {displayNavItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={
                      item.is_button
                        ? "bg-[#3a4095] text-white px-6 py-2 rounded-full text-center"
                        : "text-gray-700 hover:text-[#3a4095] px-2 py-2"
                    }
                  >
                    {item.label}
                  </a>
                ))}
                <a href="/sign-in" className="text-sm text-gray-600 hover:text-[#3a4095] px-2 py-2">
                  Admin Login
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  📚 {config?.tagline || 'Join Our Reading Community'}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  {config?.hero_title || 'Where Stories Come Alive'}
                </h1>
                <p className="text-lg sm:text-xl text-white/90">
                  {config?.hero_subtitle || 'Join IsbReadWithUs for engaging discussions, meaningful connections, and a shared love of literature.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="/register" className="bg-white text-[#3a4095] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition text-center">
                    Register for Meetup
                  </a>
                  <a href="#about" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition text-center">
                    Learn More
                  </a>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl transform rotate-3"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-3xl">
                    <div className="grid grid-cols-2 gap-4">
                      {heroStats.slice(0, 3).map((stat, i) => (
                        <div
                          key={i}
                          className={`bg-white/20 p-6 rounded-2xl text-center ${i === 2 ? 'col-span-2' : ''}`}
                        >
                          {i === 0 && <BookOpenIcon className="h-10 w-10 mx-auto mb-3" />}
                          {i === 1 && <UsersIcon className="h-10 w-10 mx-auto mb-3" />}
                          {i === 2 && <CalendarIcon className="h-10 w-10 mx-auto mb-3" />}
                          <div className="text-3xl font-bold">{stat.value}</div>
                          <div className="text-sm">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-gray-50">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </div>

        {/* About */}
        <section id="about" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {config?.about_title || 'About IsbReadWithUs'}
              </h2>
              <p className="text-lg text-gray-600">
                {config?.about_description || "We're a vibrant community of book lovers who believe that reading is better together."}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* You could make these dynamic too from a features table if desired */}
              <div className="text-center p-6">
                <div className="bg-[#3a4095]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-8 w-8 text-[#3a4095]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Diverse Selections</h3>
                <p className="text-gray-600">From classic literature to contemporary fiction, we explore books across all genres.</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-[#3a4095]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 text-[#3a4095]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Inclusive Community</h3>
                <p className="text-gray-600">All readers welcome. We celebrate different perspectives and interpretations.</p>
              </div>
              <div className="text-center p-6">
                <div className="bg-[#3a4095]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-[#3a4095]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Regular Meetups</h3>
                <p className="text-gray-600">Monthly gatherings in cozy cafes and libraries.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Meetups */}
        <section id="meetups" className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Upcoming Meetups</h2>
              <p className="text-lg text-gray-600">Join us for our next literary adventure.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {upcomingMeetups.length === 0 ? (
                <p className="col-span-3 text-center text-gray-600">No upcoming meetups at the moment.</p>
              ) : (
                upcomingMeetups.map((meetup) => (
                  <div key={meetup.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className="bg-gradient-to-br from-[#3a4095] to-[#5a60b5] p-6 text-white">
                      <div className="text-sm font-semibold mb-2">
                        {new Date(meetup.meetup_date).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-3xl font-bold">
                        {new Date(meetup.meetup_date).getDate()}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{meetup.title}</h3>
                      <p className="text-gray-600 mb-4">{meetup.description}</p>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(meetup.meetup_date).toLocaleDateString('en-US', { weekday: 'long' })}, {meetup.meetup_time} - {meetup.end_time || '??:??'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-2" />
                          <span>?? members registered</span> {/* You can add count via join or RPC */}
                        </div>
                      </div>
                      <a href="/register" className="block w-full bg-[#3a4095] text-white text-center px-4 py-2 rounded-full hover:bg-[#2d3275] transition">
                        Register Now
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Books */}
        <section id="books" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Reading List</h2>
              <p className="text-lg text-gray-600">Explore books we&apos;ve read together and what&apos;s coming next.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {currentBooks[0] && (
                <div className="bg-gradient-to-br from-[#3a4095] to-[#5a60b5] rounded-2xl p-8 text-white">
                  <div className="text-sm font-semibold mb-2 opacity-90">Currently Reading</div>
                  <h3 className="text-2xl font-bold mb-4">{currentBooks[0].title}</h3>
                  <p className="mb-6 opacity-90">{currentBooks[0].description || 'No description available.'}</p>
                  <div className="flex flex-wrap gap-2">
                    {currentBooks[0].genre && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{currentBooks[0].genre}</span>
                    )}
                    {/* Add tags from book_tags if joined */}
                  </div>
                </div>
              )}

              {upcomingBooks[0] && (
                <div className="bg-gray-100 rounded-2xl p-8">
                  <div className="text-sm font-semibold mb-2 text-[#3a4095]">Up Next</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{upcomingBooks[0].title}</h3>
                  <p className="mb-6 text-gray-600">{upcomingBooks[0].description || 'No description available.'}</p>
                  <div className="flex flex-wrap gap-2">
                    {upcomingBooks[0].genre && (
                      <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">{upcomingBooks[0].genre}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Previously Read</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {previousBooks.map((book) => (
                  <div key={book.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                    <div className="bg-[#3a4095] h-32 rounded-md mb-3 flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">{book.title}</h4>
                    <p className="text-xs text-gray-600">{book.author}</p>
                  </div>
                ))}
                {previousBooks.length === 0 && (
                  <p className="col-span-full text-center text-gray-600">No previous books yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section id="guidelines" className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
              <p className="text-lg text-gray-600">Our guidelines ensure everyone feels welcome and respected.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {guidelines.map((g, i) => (
                <div key={i} className="border-l-4 border-[#3a4095] pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{g.title}</h3>
                  <p className="text-gray-600">{g.description}</p>
                </div>
              ))}
              {guidelines.length === 0 && <p className="text-gray-600">No guidelines available yet.</p>}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 sm:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Everything you need to know about joining IsbReadWithUs.</p>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
              {faqs.length === 0 && <p className="text-center text-gray-600">No FAQs available yet.</p>}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Your Reading Journey?</h2>
            <p className="text-xl mb-8 text-white/90">Join our community today and discover your next favorite book.</p>
            <a href="/register" className="inline-block bg-white text-[#3a4095] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition">
              Register for Next Meetup
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-[#3a4095] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpenIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-bold">{config?.site_name || 'IsbReadWithUs'}</span>
              </div>
              <p className="text-white/80 text-sm">Building a community of passionate readers.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/80">
                {displayNavItems.slice(0, 4).map(item => (
                  <li key={item.href}>
                    <a href={item.href} className="hover:text-white transition">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="/feedback" className="hover:text-white transition">Give Feedback</a></li>
                <li><a href="#guidelines" className="hover:text-white transition">Guidelines</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="/sign-in" className="hover:text-white transition">Admin Portal</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <p className="text-white/80 text-sm">
                {config?.instagram_url ? (
                  <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Follow us on Instagram for updates and book recommendations!
                  </a>
                ) : (
                  'Follow us on Instagram for updates and book recommendations!'
                )}
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
            <p>© {new Date().getFullYear()} {config?.site_name || 'IsbReadWithUs'} Book Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}