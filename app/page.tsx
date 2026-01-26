'use client';
import React, { useState } from 'react';

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

export default function BookClubLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#3a4095] rounded-full flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#3a4095]">IsbReadWithUs</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-700 hover:text-[#3a4095] transition">About</a>
              <a href="#meetups" className="text-gray-700 hover:text-[#3a4095] transition">Meetups</a>
              <a href="#books" className="text-gray-700 hover:text-[#3a4095] transition">Books</a>
              <a href="/feedback" className="text-gray-700 hover:text-[#3a4095] transition">Feedback</a>
              <a href="/register" className="bg-[#3a4095] text-white px-6 py-2 rounded-full hover:bg-[#2d3275] transition">Join Us</a>
              <a href="/sign-in" className="text-sm text-gray-600 hover:text-[#3a4095] transition">Admin</a>
            </div>
            <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <a href="#about" className="text-gray-700 hover:text-[#3a4095] px-2 py-2">About</a>
                <a href="#meetups" className="text-gray-700 hover:text-[#3a4095] px-2 py-2">Meetups</a>
                <a href="#books" className="text-gray-700 hover:text-[#3a4095] px-2 py-2">Books</a>
                <a href="/feedback" className="text-gray-700 hover:text-[#3a4095] px-2 py-2">Feedback</a>
                <a href="/register" className="bg-[#3a4095] text-white px-6 py-2 rounded-full text-center">Join Us</a>
                <a href="/sign-in" className="text-sm text-gray-600 hover:text-[#3a4095] px-2 py-2">Admin Login</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        <div className="relative bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  📚 Join Our Reading Community
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">Where Stories Come Alive</h1>
                <p className="text-lg sm:text-xl text-white/90">
                  Join IsbReadWithUs for engaging discussions, meaningful connections, and a shared love of literature.
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
                      <div className="bg-white/20 p-6 rounded-2xl text-center">
                        <BookOpenIcon className="h-10 w-10 mx-auto mb-3" />
                        <div className="text-3xl font-bold">50+</div>
                        <div className="text-sm">Books Read</div>
                      </div>
                      <div className="bg-white/20 p-6 rounded-2xl text-center">
                        <UsersIcon className="h-10 w-10 mx-auto mb-3" />
                        <div className="text-3xl font-bold">100+</div>
                        <div className="text-sm">Members</div>
                      </div>
                      <div className="bg-white/20 p-6 rounded-2xl text-center col-span-2">
                        <CalendarIcon className="h-10 w-10 mx-auto mb-3" />
                        <div className="text-3xl font-bold">Monthly</div>
                        <div className="text-sm">Meetups</div>
                      </div>
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

        <section id="about" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About IsbReadWithUs</h2>
              <p className="text-lg text-gray-600">
                We&apos;re a vibrant community of book lovers who believe that reading is better together.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
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

        <section id="meetups" className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Upcoming Meetups</h2>
              <p className="text-lg text-gray-600">Join us for our next literary adventure.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { month: "January 2025", day: "15", title: "The Midnight Library Discussion", desc: "An inspiring discussion about choices and possibilities.", members: "23" },
                { month: "February 2025", day: "12", title: "Atomic Habits Book Club", desc: "Explore the science of habit formation.", members: "18" },
                { month: "March 2025", day: "19", title: "Fiction vs Reality Debate", desc: "Exploring boundaries between fiction and reality.", members: "15" }
              ].map((meetup, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="bg-gradient-to-br from-[#3a4095] to-[#5a60b5] p-6 text-white">
                    <div className="text-sm font-semibold mb-2">{meetup.month}</div>
                    <div className="text-3xl font-bold">{meetup.day}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{meetup.title}</h3>
                    <p className="text-gray-600 mb-4">{meetup.desc}</p>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>Wednesday, 7:00 PM - 9:00 PM</span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        <span>{meetup.members} members registered</span>
                      </div>
                    </div>
                    <a href="/register" className="block w-full bg-[#3a4095] text-white text-center px-4 py-2 rounded-full hover:bg-[#2d3275] transition">
                      Register Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="books" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Reading List</h2>
              <p className="text-lg text-gray-600">Explore books we&apos;ve read together and what&apos;s coming next.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-[#3a4095] to-[#5a60b5] rounded-2xl p-8 text-white">
                <div className="text-sm font-semibold mb-2 opacity-90">Currently Reading</div>
                <h3 className="text-2xl font-bold mb-4">The Midnight Library by Matt Haig</h3>
                <p className="mb-6 opacity-90">A dazzling novel about choices and the different lives we could have lived.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Fiction</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Philosophy</span>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8">
                <div className="text-sm font-semibold mb-2 text-[#3a4095]">Up Next</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Atomic Habits by James Clear</h3>
                <p className="mb-6 text-gray-600">A proven framework for improving every day and achieving your goals.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">Self-Help</span>
                  <span className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">Psychology</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Previously Read</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { title: "1984", author: "George Orwell" },
                  { title: "The Alchemist", author: "Paulo Coelho" },
                  { title: "Educated", author: "Tara Westover" },
                  { title: "Sapiens", author: "Yuval Noah Harari" },
                  { title: "The Silent Patient", author: "Alex Michaelides" },
                  { title: "Becoming", author: "Michelle Obama" }
                ].map((book, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                    <div className="bg-[#3a4095] h-32 rounded-md mb-3 flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">{book.title}</h4>
                    <p className="text-xs text-gray-600">{book.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="guidelines" className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
              <p className="text-lg text-gray-600">Our guidelines ensure everyone feels welcome and respected.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {[
                { title: "Respect All Perspectives", desc: "Everyone's interpretation is valid. We celebrate diverse viewpoints." },
                { title: "No Spoilers", desc: "Avoid revealing plot twists for those who haven't finished the book." },
                { title: "Active Listening", desc: "Give others space to share their thoughts. Listen and respond constructively." },
                { title: "Stay On Topic", desc: "Keep discussions focused on the book and related literary themes." },
                { title: "Be Kind & Inclusive", desc: "Zero tolerance for discrimination, harassment, or disrespectful behavior." },
                { title: "Participate Actively", desc: "We encourage regular attendance and meaningful engagement." }
              ].map((guideline, i) => (
                <div key={i} className="border-l-4 border-[#3a4095] pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{guideline.title}</h3>
                  <p className="text-gray-600">{guideline.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 sm:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Everything you need to know about joining IsbReadWithUs.</p>
            </div>
            <div className="space-y-6">
              {[
                { q: "How do I join the book club?", a: "Click the 'Join Us' button and fill out the registration form. You'll receive a confirmation email with details." },
                { q: "Do I need to read the entire book before attending?", a: "We encourage finishing the book, but you're welcome to attend even if you're still reading." },
                { q: "Is there a membership fee?", a: "No, our book club is completely free! We believe everyone should have access to great books." },
                { q: "Where do the meetups take place?", a: "We rotate between cozy cafes and libraries. Location is shared with registered members via email." },
                { q: "How are books selected?", a: "Books are chosen democratically by our members through monthly voting." },
                { q: "Can I bring a friend?", a: "Absolutely! Just ask your friend to register beforehand." },
                { q: "What if I can't attend every meetup?", a: "That's fine! Attend when you can. We understand everyone has busy schedules." },
                { q: "How long do meetups typically last?", a: "Our meetups usually run for about 2 hours, from 7:00 PM to 9:00 PM." }
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                <span className="text-lg font-bold">IsbReadWithUs</span>
              </div>
              <p className="text-white/80 text-sm">Building a community of passionate readers.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#meetups" className="hover:text-white transition">Upcoming Meetups</a></li>
                <li><a href="#books" className="hover:text-white transition">Book List</a></li>
                <li><a href="/register" className="hover:text-white transition">Register</a></li>
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
              <p className="text-white/80 text-sm">Follow us on Instagram for updates and book recommendations!</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
            <p>&copy; {new Date().getFullYear()} IsbReadWithUs Book Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}