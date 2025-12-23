"use client";

import { useState } from "react";

export default function RegistrationForm() {
  const [isNoShow, setIsNoShow] = useState(false);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);

  // File handler
  const handleFileChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Name *
        </label>
        <input
          type="text"
          required
          minLength={2}
          pattern="[A-Za-z ]+"
          placeholder="Enter your full name"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Phone Number *
        </label>
        <input
          type="text"
          required
          placeholder="+92 300 1234567"
          pattern="^(\+92|03)[0-9]{9}$"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          placeholder="your.email@example.com"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* No-show Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="noShow"
          checked={isNoShow}
          onChange={() => {
            setIsNoShow(!isNoShow);
            setPaymentPreview(null);
          }}
        />
        <label htmlFor="noShow" className="text-sm">
          I missed the previous meetup and want to share my previous payment
        </label>
      </div>

      {/* Previous Payment Reference (Conditional) */}
      {isNoShow && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Previous Payment Reference *
          </label>
          <input
            type="text"
            minLength={3}
            required
            placeholder="Upload your previous payment screenshot"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Payment Screenshot Upload (Conditional) */}
      {!isNoShow && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Payment Screenshot *
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            required
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
            className="w-full"
          />

          {paymentPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={paymentPreview}
              alt="Payment Preview"
              className="mt-4 rounded-lg border max-h-64"
            />
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition"
      >
        Submit Registration
      </button>
    </form>
  );
}
