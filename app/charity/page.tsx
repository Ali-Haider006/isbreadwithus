'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Replaced BookOpenIcon usages with `/bookclublogo.png` image

const HeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
    <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type Donation = {
  id: string;
  donor_name: string;
  amount: number;
  books_count: number;
  created_at: string;
};

export default function CharityPage() {
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('100');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  

  // Fetch donations on mount
  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setDonations(data || []);
      
      // Calculate total books
      const total = (data || []).reduce((sum, d) => sum + d.books_count, 0);
      setTotalBooks(total);
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!donorName.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const amountNum = parseInt(amount) || 100;
      const booksCount = Math.floor(amountNum / 100);

      const { error } = await supabase
        .from('donations')
        .insert([
          {
            donor_name: donorName.trim(),
            amount: amountNum,
            books_count: booksCount,
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      setDonorName('');
      setAmount('100');
      
      // Refresh donations list
      await fetchDonations();

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting donation:', err);
      alert('Failed to record donation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const booksCount = Math.floor((parseInt(amount) || 0) / 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-10 flex items-center">
                <img src="/bookclublogo.png" alt="IsbReadWithUs logo" className="h-10 w-auto object-contain" />
              </div>
              <span className="text-xl font-bold text-[#3a4095]">IsbReadWithUs</span>
            </Link>
            <Link href="/" className="text-gray-700 hover:text-[#3a4095] transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#3a4095] to-[#5a60b5] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
            📚 Share the Gift of Knowledge
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Your 100 Rupees Provides a Book
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Help us bring the joy of reading to children in need. Every donation makes a difference.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <div className="text-5xl font-bold mb-2">{totalBooks}</div>
            <div className="text-lg">Books Donated So Far</div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-gray-50">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Donation Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>
              
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Thank you for your donation!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your contribution will help provide books to children in need.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-[#3a4095]/5 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="font-bold text-[#3a4095] mr-2">1.</span>
                    <span>Send your donation via EasyPaisa using the details below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-[#3a4095] mr-2">2.</span>
                    <span>Enter your name and amount in the form</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-[#3a4095] mr-2">3.</span>
                    <span>Your name will appear on our special thanks wall</span>
                  </li>
                </ol>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 
             bg-white text-gray-900 
             placeholder-gray-400
             focus:ring-2 focus:ring-[#3a4095] focus:border-transparent 
             outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Donation Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="100"
                    step="100"
                    placeholder="100"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 
             bg-white text-gray-900 
             placeholder-gray-400
             focus:ring-2 focus:ring-[#3a4095] focus:border-transparent 
             outline-none transition"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {booksCount > 0 ? (
                      <>This will provide <span className="font-bold text-[#3a4095]">{booksCount}</span> book{booksCount > 1 ? 's' : ''}</>
                    ) : (
                      'Minimum 100 rupees per book'
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3a4095] text-white py-4 rounded-full font-semibold hover:bg-[#2d3275] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Recording...' : 'Add My Name to Thanks Wall'}
                </button>
              </form>
            </div>

            {/* Impact Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 text-center shadow">
                <img src="/bookclublogo.png" alt="IsbReadWithUs logo" className="h-10 w-auto mx-auto mb-3 object-contain max-w-[140px]" />
                <div className="text-2xl font-bold text-gray-900">{totalBooks}</div>
                <div className="text-sm text-gray-600">Books Donated</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow">
                <HeartIcon className="h-10 w-10 text-[#3a4095] mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{donations.length}</div>
                <div className="text-sm text-gray-600">Kind Donors</div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Details */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-[#3a4095] pl-4">
                  <div className="text-sm text-gray-600 mb-1">EasyPaisa Number</div>
                  <div className="text-2xl font-bold text-gray-900">03335467885</div>
                </div>

                <div className="border-l-4 border-[#3a4095] pl-4">
                  <div className="text-sm text-gray-600 mb-1">Account Name</div>
                  <div className="text-xl font-semibold text-gray-900">Ali Haider</div>
                </div>

                <div className="pt-4">
                  <div className="mt-4 bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-full bg-white mx-auto rounded-lg flex items-center justify-center border-2 border-gray-200 overflow-hidden max-h-[420px]">
                        <img src="/QR.jpeg" alt="EasyPaisa QR Code" className="w-full h-auto object-contain" />
                      </div>
                      <p className="text-sm text-gray-600 mt-3">Scan to pay via EasyPaisa</p>
                    </div>
                </div>
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Note:</span> After sending your donation, please fill out the form on the left to have your name added to our thanks wall.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Special Thanks Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Special Thanks</h2>
            <p className="text-lg text-gray-600">
              We&apos;re grateful to these generous donors who&apos;ve helped share the gift of reading
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {donations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Be the first to donate and see your name here!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-gradient-to-br from-[#3a4095]/5 to-[#5a60b5]/5 rounded-lg p-4 text-center border border-[#3a4095]/10 hover:shadow-md transition"
                  >
                    <div className="w-12 h-12 bg-[#3a4095] rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-lg">
                        {donation.donor_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm truncate">
                      {donation.donor_name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {donation.books_count} book{donation.books_count > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mission Section */}
        <div className="mt-16 bg-gradient-to-br from-[#3a4095] to-[#5a60b5] rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Every child deserves access to books and the opportunity to learn. Your donation helps us provide educational materials to underprivileged children across Islamabad and Rawalpindi.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">100%</div>
              <div className="text-white/80">Transparent</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">Direct</div>
              <div className="text-white/80">Impact</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">Local</div>
              <div className="text-white/80">Community</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#3a4095] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-10 flex items-center">
                <img src="/bookclublogo.png" alt="IsbReadWithUs logo" className="h-8 w-auto object-contain" />
              </div>
              <span className="text-lg font-bold">IsbReadWithUs</span>
            </div>
            <p className="text-white/70 text-sm">
              © {new Date().getFullYear()} IsbReadWithUs Book Club. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}