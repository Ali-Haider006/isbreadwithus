'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ── Icons ────────────────────────────────────────────────────────────────────

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" strokeWidth="2" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" strokeWidth="2" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeWidth="2" strokeLinecap="round" d="M12 6v6l4 2" />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
  </svg>
);

// ── Types ────────────────────────────────────────────────────────────────────

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
  max_slots?: number;
  payment_required?: boolean;
  payment_amount?: number;
  status: string;
  registrationCount: number;
  // joined book — null if no book linked, or book has no cover
  book?: {
    id: string;
    title: string | null;
    author: string | null;
    cover_image_url: string | null;
  } | null;
};

type Book = {
  id: string;
  title: string | null;
  author: string | null;
  description?: string | null;
  genre?: string | null;
  cover_image_url?: string | null; // null if not uploaded
  status?: 'upcoming' | 'current' | 'completed';
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(time?: string) {
  if (!time) return '';
  const [hourStr, minStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:${minStr} ${ampm}`;
}

function parseDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getSlotsInfo(meetup: Meetup) {
  if (!meetup.max_slots) return { text: 'Open registration', color: 'text-green-600', full: false };
  const left = meetup.max_slots - meetup.registrationCount;
  if (left <= 0) return { text: 'Fully booked', color: 'text-red-600', full: true };
  if (left <= 3) return { text: `Only ${left} slot${left === 1 ? '' : 's'} left`, color: 'text-orange-500', full: false };
  return { text: `${left} of ${meetup.max_slots} slots available`, color: 'text-green-600', full: false };
}

// ── Book Cover ── shared fallback component ───────────────────────────────────

function BookCover({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Book cover'}
        className={className}
        onError={e => {
          // If image fails to load, swap to fallback
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          (e.currentTarget.nextSibling as HTMLElement)?.removeAttribute('hidden');
        }}
      />
    );
  }
  return null;
}

// ── Book Carousel ────────────────────────────────────────────────────────────

function BookCarousel({ books }: { books: Book[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const total = books.length;

  const sortedBooks = [...books].sort((a, b) => {
    if (!a.start_date && !b.start_date) return 0;
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  function goTo(newIndex: number, dir: 'left' | 'right') {
    if (animating || newIndex === activeIndex) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex(newIndex);
      setAnimating(false);
    }, 300);
  }

  const prev = () => goTo((activeIndex - 1 + total) % total, 'left');
  const next = () => goTo((activeIndex + 1) % total, 'right');

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setDirection('right');
      setAnimating(true);
      setTimeout(() => {
        setActiveIndex(i => (i + 1) % total);
        setAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) {
    return (
      <section id="books" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Reading List</h2>
          <p className="text-gray-500 mt-6">No books added yet.</p>
        </div>
      </section>
    );
  }

  const book = sortedBooks[activeIndex];

  return (
    <section id="books" className="pt-16 pb-10 sm:pt-24 sm:pb-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Reading List</h2>
          <p className="text-lg text-gray-600">Books our community is reading and recommending.</p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Prev */}
          <button
            onClick={prev}
            className="flex-shrink-0 h-11 w-11 rounded-full bg-[#3a4095]/10 hover:bg-[#3a4095] text-[#3a4095] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
            aria-label="Previous book"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          {/* Card */}
          <div className="flex-1">
            <div
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{
                opacity: animating ? 0 : 1,
                transform: animating
                  ? `translateX(${direction === 'right' ? '-16px' : '16px'})`
                  : 'translateX(0)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            >
              {/* ── Cover area ── */}
              <div className="relative h-52 sm:h-64 bg-gradient-to-br from-[#3a4095] to-[#5a60b5] flex items-center justify-center overflow-hidden">
                {book.cover_image_url ? (
                  // Has a cover image
                  <img
                    src={book.cover_image_url}
                    alt={book.title || 'Book cover'}
                    className="h-full w-full object-cover"
                    onError={e => {
                      // Image failed — show fallback behind it
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.cover-fallback') as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback — shown when no image OR image fails to load */}
                <div
                  className="cover-fallback absolute inset-0 flex items-center justify-center"
                  style={{ display: book.cover_image_url ? 'none' : 'flex' }}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
                      backgroundSize: '10px 10px',
                    }}
                  />
                  <BookOpenIcon className="h-16 w-16 text-white/70 relative z-10" />
                </div>
              </div>

              {/* Info */}
              <div className="bg-white p-5">
                <h4 className="font-bold text-lg text-gray-900 leading-tight mb-1">
                  {book.title || 'Untitled'}
                </h4>
                <p className="text-sm text-gray-500 mb-3">{book.author || 'Unknown author'}</p>
                {book.genre && (
                  <span className="inline-block text-xs bg-[#3a4095]/10 text-[#3a4095] px-2.5 py-0.5 rounded-full font-medium">
                    {book.genre}
                  </span>
                )}
                {book.description && (
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed line-clamp-3">{book.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={next}
            className="flex-shrink-0 h-11 w-11 rounded-full bg-[#3a4095]/10 hover:bg-[#3a4095] text-[#3a4095] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
            aria-label="Next book"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex flex-col items-center gap-2 mt-4 mb-2">
          <div className="flex gap-1.5">
            {sortedBooks.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > activeIndex ? 'right' : 'left')}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-6 h-2.5 bg-[#3a4095]'
                    : 'w-2.5 h-2.5 bg-[#3a4095]/25 hover:bg-[#3a4095]/50'
                }`}
                aria-label={`Go to book ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function BookClubLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [heroStats, setHeroStats] = useState<HeroStat[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [meetupsLoading, setMeetupsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);

        const [
          { data: configData },
          { data: statsData },
          { data: navData },
          { data: meetupsData },
          { data: booksData },
          { data: guidelinesData },
          { data: faqsData },
        ] = await Promise.all([
          supabase.from('site_config').select('*').limit(1).single(),
          supabase.from('hero_stats').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          supabase.from('navigation_items').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          // ↓ join books so we get cover_image_url per meetup
          supabase
            .from('meetups')
            .select('*, book:books!book_id(id, title, author, cover_image_url)')
            .eq('status', 'upcoming')
            .gte('meetup_date', new Date().toISOString().split('T')[0])
            .order('meetup_date', { ascending: true })
            .limit(6),
          supabase.from('books').select('*').order('title'),
          supabase.from('guidelines').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          supabase.from('faqs').select('*').eq('is_active', true).order('display_order', { ascending: true }),
        ]);

        setConfig(configData);
        setHeroStats(statsData || []);
        setNavItems(navData || []);
        setBooks(booksData || []);
        setGuidelines(guidelinesData || []);
        setFaqs(faqsData || []);

        if (meetupsData && meetupsData.length > 0) {
          const withCounts = await Promise.all(
            meetupsData.map(async (meetup) => {
              const { count } = await supabase
                .from('meetup_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('meetup_id', meetup.id)
                .neq('payment_status', 'rejected');
              return { ...meetup, registrationCount: count ?? 0 };
            })
          );
          setMeetups(withCounts as Meetup[]);
        }
        setMeetupsLoading(false);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
        console.error(err);
      } finally {
        setLoading(false);
        setMeetupsLoading(false);
      }
    }

    fetchAllData();
  }, []);

  const displayNavItems = navItems.length > 0 ? navItems : [
    { label: 'About',    href: '#about',    is_button: false, display_order: 1 },
    { label: 'Meetups',  href: '#meetups',  is_button: false, display_order: 2 },
    { label: 'Books',    href: '#books',    is_button: false, display_order: 3 },
    { label: 'Feedback', href: '/feedback', is_button: false, display_order: 4 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a4095]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
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
                      ? 'bg-[#3a4095] text-white px-6 py-2 rounded-full hover:bg-[#2d3275] transition'
                      : 'text-gray-700 hover:text-[#3a4095] transition'
                  }
                >
                  {item.label}
                </a>
              ))}
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      item.is_button
                        ? 'bg-[#3a4095] text-white px-6 py-2 rounded-full text-center'
                        : 'text-gray-700 hover:text-[#3a4095] px-2 py-2'
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

        {/* ── Hero ────────────────────────────────────────────────────────── */}
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
                  <a href="#meetups" className="bg-white text-[#3a4095] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition text-center">
                    View Meetups
                  </a>
                  <a href="#about" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition text-center">
                    Learn More
                  </a>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl transform rotate-3" />
                  <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-3xl">
                    <div className="grid grid-cols-2 gap-4">
                      {heroStats.slice(0, 3).map((stat, i) => (
                        <div key={i} className={`bg-white/20 p-6 rounded-2xl text-center ${i === 2 ? 'col-span-2' : ''}`}>
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
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
            </svg>
          </div>
        </div>

        {/* ── About ───────────────────────────────────────────────────────── */}
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
              {[
                { icon: BookOpenIcon, title: 'Diverse Selections', desc: 'From classic literature to contemporary fiction, we explore books across all genres.' },
                { icon: UsersIcon,    title: 'Inclusive Community', desc: 'All readers welcome. We celebrate different perspectives and interpretations.' },
                { icon: CalendarIcon, title: 'Regular Meetups',    desc: 'Monthly gatherings in cozy cafes and libraries around Islamabad.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center p-6">
                  <div className="bg-[#3a4095]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-[#3a4095]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Meetups ─────────────────────────────────────────────────────── */}
        <section id="meetups" className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Upcoming Meetups</h2>
              <p className="text-lg text-gray-600">Join us for our next literary adventure.</p>
            </div>

            {meetupsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3a4095]" />
              </div>
            ) : meetups.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#3a4095]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-[#3a4095]" />
                </div>
                <p className="text-gray-500 text-lg">No upcoming meetups at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Follow us on{' '}
                  <a
                    href={config?.instagram_url || 'https://www.instagram.com/islamabadreadswithus/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3a4095] underline"
                  >
                    Instagram
                  </a>
                  {' '}to get notified of new events.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {meetups.map((meetup) => {
                  const date     = parseDate(meetup.meetup_date);
                  const slots    = getSlotsInfo(meetup);
                  const almostFull = !slots.full && meetup.max_slots != null &&
                    (meetup.max_slots - meetup.registrationCount) <= 3;
                  const bookCover = meetup.book?.cover_image_url ?? null;

                  return (
                    <div key={meetup.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">

                      {/* ── Date / cover banner ── */}
                      <div className="relative bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white overflow-hidden">

                        {/* Book cover — sits behind the date text when present */}
                        {bookCover && (
                          <img
                            src={bookCover}
                            alt={meetup.book?.title || 'Book cover'}
                            className="absolute inset-0 w-full h-full object-cover opacity-20"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
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

                          {/* Book title pill — only when book exists */}
                          {meetup.book?.title && (
                            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                              <BookOpenIcon className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[160px]">{meetup.book.title}</span>
                            </div>
                          )}
                        </div>

                        {slots.full && (
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

                      {/* ── Card body ── */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">{meetup.title}</h3>
                        {meetup.description && (
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{meetup.description}</p>
                        )}

                        <div className="space-y-2 text-sm text-gray-600 mb-5">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-[#3a4095] flex-shrink-0" />
                            <span>
                              {formatTime(meetup.meetup_time)}
                              {meetup.end_time && ` – ${formatTime(meetup.end_time)}`}
                            </span>
                          </div>

                          {meetup.location && (
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4 text-[#3a4095] flex-shrink-0" />
                              <span className="truncate">{meetup.location}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-[#3a4095] flex-shrink-0" />
                            <span className={`font-medium ${slots.color}`}>{slots.text}</span>
                          </div>

                          <div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {meetup.payment_required ? `PKR ${meetup.payment_amount || 0}` : 'Free'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto">
                          {slots.full ? (
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
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Books ───────────────────────────────────────────────────────── */}
        <BookCarousel books={books} />

        {/* ── Guidelines ──────────────────────────────────────────────────── */}
        <section id="guidelines" className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
              <p className="text-lg text-gray-600">Our guidelines ensure everyone feels welcome and respected.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {guidelines.length === 0 ? (
                <p className="text-gray-500 text-center">No guidelines available yet.</p>
              ) : (
                guidelines.map((g, i) => (
                  <div key={i} className="border-l-4 border-[#3a4095] pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{g.title}</h3>
                    <p className="text-gray-600">{g.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-16 sm:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Everything you need to know about joining IsbReadWithUs.</p>
            </div>
            <div className="space-y-6">
              {faqs.length === 0 ? (
                <p className="text-center text-gray-500">No FAQs available yet.</p>
              ) : (
                faqs.map((faq, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Your Reading Journey?</h2>
            <p className="text-xl mb-8 text-white/90">Join our community today and discover your next favorite book.</p>
            <a href="#meetups" className="inline-block bg-white text-[#3a4095] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition">
              View Upcoming Meetups
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#3a4095] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpenIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-bold">{config?.site_name || 'IsbReadWithUs'}</span>
              </div>
              <p className="text-white/80 text-sm">Building a community of passionate readers in Islamabad.</p>
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
                <li><a href="/feedback"   className="hover:text-white transition">Give Feedback</a></li>
                <li><a href="#guidelines" className="hover:text-white transition">Guidelines</a></li>
                <li><a href="#faq"        className="hover:text-white transition">FAQ</a></li>
                <li><a href="/sign-in"    className="hover:text-white transition">Admin Portal</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <p className="text-white/80 text-sm">
                <a
                  href={config?.instagram_url || 'https://www.instagram.com/islamabadreadswithus/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Follow us on Instagram for updates and book recommendations!
                </a>
              </p>
              {config?.contact_email && (
                <a
                  href={`mailto:${config.contact_email}`}
                  className="text-white/80 hover:text-white text-sm mt-2 block transition"
                >
                  {config.contact_email}
                </a>
              )}
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