"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const phoneRegex = /^(\+92|03)\d{9}$/;

const schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Letters and spaces only"),
  phone: z.string().regex(phoneRegex, "Invalid Pakistan phone number"),
  email: z.string().email("Invalid email address"),
  isNoShow: z.boolean(),
  paymentScreenshot: z.string().min(1, "Payment screenshot is required"),
});

type FormData = z.infer<typeof schema>;

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isNoShow: false,
    },
  });

  const handleFileUpload = (file: File) => {
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("paymentScreenshot", reader.result as string, {
        shouldValidate: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();
      window.location.href = "/success";
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#3a4095' }}>
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-xl space-y-5">
        <h1 className="text-2xl font-semibold text-center" style={{ color: '#171717' }}>
          Bookclub Registration
        </h1>

        {/* Name */}
        <div>
          <input
            {...register("name")}
            placeholder="Enter your full name"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            style={{ color: '#171717' }}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <input
            {...register("phone")}
            placeholder="+92 300 1234567"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            style={{ color: '#171717' }}
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            {...register("email")}
            placeholder="your.email@example.com"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            style={{ color: '#171717' }}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* No-show Checkbox */}
        <label className="flex items-start gap-2 text-sm" style={{ color: '#171717' }}>
          <input 
            type="checkbox" 
            {...register("isNoShow")} 
            className="mt-1 accent-gray-700" 
          />
          <span>
            I missed the previous meetup and want to share my previous payment
          </span>
        </label>

        {/* Payment Screenshot */}
        <div>
          <label
            htmlFor="paymentScreenshot"
            className="inline-block cursor-pointer px-4 py-2 rounded text-sm text-white transition-colors"
            style={{ backgroundColor: '#171717' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#171717'}
          >
            Choose File
          </label>

          <input
            id="paymentScreenshot"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {fileName && (
            <p className="text-xs mt-2 text-gray-600">{fileName}</p>
          )}

          {errors.paymentScreenshot && (
            <p className="text-red-600 text-sm mt-1">
              Payment screenshot is required
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="w-full py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-white"
          style={{ backgroundColor: '#171717' }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2a2a2a')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#171717')}
        >
          {loading ? "Submitting..." : "Register"}
        </button>
      </div>
    </div>
  );
}