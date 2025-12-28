'use client';

import { useState } from 'react';

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [enjoyedMost, setEnjoyedMost] = useState('');
  const [otherEnjoyedMost, setOtherEnjoyedMost] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] as const;

  const enjoyedOptions = [
    'Book discussion',
    'Meeting new people',
    'Venue/Location',
    'Moderator/Facilitation',
    'Refreshments/Snacks',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!rating || !enjoyedMost || (enjoyedMost === 'Other' && !otherEnjoyedMost.trim())) {
      setSubmitStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          enjoyed_most: enjoyedMost === 'Other' ? otherEnjoyedMost.trim() : enjoyedMost,
          suggestions: suggestions.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitStatus({ type: 'success', message: 'Thank you for your feedback!' });
      
      // Reset form
      setRating(0);
      setEnjoyedMost('');
      setOtherEnjoyedMost('');
      setSuggestions('');
    } catch (error) {
      console.error(error);
      setSubmitStatus({ type: 'error', message: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meetup Feedback</h1>
          <p className="text-gray-600 mb-8">We&apos;d love to hear your thoughts about the meetup!</p>

          <div className="space-y-8">
            {/* Question 1: Rating */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                How would you rate this meetup overall? <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                  >
                    <svg
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {ratingLabels[rating]}
                </p>
              )}
            </div>

            {/* Question 2: What Did You Enjoy Most */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                What did you enjoy most about the meetup? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {enjoyedOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="enjoyedMost"
                      value={option}
                      checked={enjoyedMost === option}
                      onChange={(e) => {
                        setEnjoyedMost(e.target.value);
                        if (e.target.value !== 'Other') setOtherEnjoyedMost('');
                      }}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {enjoyedMost === 'Other' && (
                <div className="mt-3">
                  <label htmlFor="otherEnjoyed" className="block text-sm font-medium text-gray-900 mb-2">Please specify</label>
                  <textarea
                    id="otherEnjoyed"
                    value={otherEnjoyedMost}
                    onChange={(e) => setOtherEnjoyedMost(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Tell us what you enjoyed..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>

            {/* Question 3: Suggestions */}
            <div>
              <label htmlFor="suggestions" className="block text-lg font-semibold text-gray-900 mb-4">
                Any suggestions for improvement or comments?
              </label>
              <textarea
                id="suggestions"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Share your thoughts, suggestions, or any other feedback..."
                className="w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-800 mt-2">
                {suggestions.length}/1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>

            {/* Status Message */}
            {submitStatus && (
              <div
                className={`p-4 rounded-lg ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}