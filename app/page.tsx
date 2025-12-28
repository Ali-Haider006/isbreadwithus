'use client';
import React, { useState } from 'react';
import Image from 'next/image';

// Lightweight inline SVG icons to avoid adding an external dependency
const MenuIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M21 4H7a2 2 0 00-2 2v12a1 1 0 001.5.86L12 16l5.5 2.86A1 1 0 0019 18V6a2 2 0 002-2zM7 6h12v12" />
  </svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M16 11a4 4 0 10-8 0M2 20a6 6 0 0112 0" />
  </svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zM12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM17.5 6.5h.01" />
  </svg>
);
const MailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden>
    <path d="M3 8l9 6 9-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="2"/>
  </svg>
);

export default function BookClubLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navLogoError, setNavLogoError] = useState(false);
  const [footerLogoError, setFooterLogoError] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {!navLogoError ? (
                <Image
                  src="/bookclubLogo.png"
                  alt="Book Club Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                  onError={() => setNavLogoError(true)}
                />
              ) : (
                <div className="h-10 w-10 bg-[#3a4095] rounded-full items-center justify-center flex">
                  <BookOpenIcon className="h-6 w-6 text-white" />
                </div>
              )}

              <span className="text-xl font-bold text-[#3a4095]">IsBreadWithUs</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-700 hover:text-[#3a4095] transition">About</a>
              <a href="#meetups" className="text-gray-700 hover:text-[#3a4095] transition">Meetups</a>
              <a href="#books" className="text-gray-700 hover:text-[#3a4095] transition">Books</a>
              <a href="/feedback" className="text-gray-700 hover:text-[#3a4095] transition">Feedback</a>
              <a href="/register" className="bg-[#3a4095] text-white px-6 py-2 rounded-full hover:bg-[#2d3275] transition">
                Join Us
              </a>
              <a href="/sign-in" className="text-sm text-gray-600 hover:text-[#3a4095] transition">
                Admin
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <a href="#about" className="text-gray-700 hover:text-[#3a4095] px-2 py-2">About</a>
                <a href="#meetups" className="text-gray-700 hover:text-[#3a4095] px-2 py-2">Meetups</a>
                <a href="#books" className="text-gray-700 hover:text-[#3a4095] px-2 py-2">Books</a>
                <a href="/feedback" className="text-gray-700 hover:text-[#3a4095] px-2 py-2">Feedback</a>
                <a href="/register" className="bg-[#3a4095] text-white px-6 py-2 rounded-full text-center">
                  Join Us
                </a>
                <a href="/sign-in" className="text-sm text-gray-600 hover:text-[#3a4095] px-2 py-2">
                  Admin Login
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="space-y-6">
                <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  📚 Join Our Reading Community
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Where Stories Come Alive
                </h1>
                <p className="text-lg sm:text-xl text-white/90">
                  Join IsBreadWithUs for engaging discussions, meaningful connections, and a shared love of literature. Every book is better when shared.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a 
                    href="/register" 
                    className="bg-white text-[#3a4095] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition text-center"
                  >
                    Register for Meetup
                  </a>
                  <a 
                    href="#about" 
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition text-center"
                  >
                    Learn More
                  </a>
                </div>
              </div>

              {/* Hero Visual */}
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

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-gray-50">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#3a4095] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {!footerLogoError ? (
                  <Image
                    src="/bookclubLogo.png"
                    alt="Book Club Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                    onError={() => setFooterLogoError(true)}
                  />
                ) : (
                  <div className="h-10 w-10 bg-white/20 rounded-full items-center justify-center flex">
                    <BookOpenIcon className="h-6 w-6 text-white" />
                  </div>
                )}
                <span className="text-lg font-bold">IsBreadWithUs</span>
              </div>
              <p className="text-white/80 text-sm">
                Building a community of passionate readers, one book at a time.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#meetups" className="hover:text-white transition">Upcoming Meetups</a></li>
                <li><a href="#books" className="hover:text-white transition">Book List</a></li>
                <li><a href="/register" className="hover:text-white transition">Register</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="/feedback" className="hover:text-white transition">Give Feedback</a></li>
                <li><a href="#guidelines" className="hover:text-white transition">Guidelines</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="/sign-in" className="hover:text-white transition">Admin Portal</a></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                <a 
                  href="https://www.instagram.com/isbreadwithus/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a 
                  href="mailto: isbreadwithus@gmail .com" 
                  className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition"
                >
                  <MailIcon className="h-5 w-5" />
                </a>
              </div>
              <p className="text-white/80 text-sm">
                Follow us on Instagram for updates and book recommendations!
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
            <p>&copy; {new Date().getFullYear()} IsBreadWithUs Book Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}