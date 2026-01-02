/* eslint-disable @next/next/no-img-element */
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
  const [copied, setCopied] = useState(false);
  const easypaisaNumber = "+923181515117";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#3a4095]">
      <div className="max-w-lg sm:max-w-md w-full mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center items-start">
          <img
            src="/currRead.png"
            alt="Current Book"
            className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded shadow-md flex-shrink-0 mx-auto sm:mx-0"
          />
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#3a4095] mb-2 text-center sm:text-left">
              Bookclub Registration
            </h1>
            <p className="text-justify text-sm text-gray-600 leading-relaxed">
              Will Durant&apos;s &quot;Fallen Leaves&quot; is a compact collection of aphorisms and reflections that distills his lifelong observations on history, ethics, and human nature. With clear prose and wry insight, Durant invites readers to pause, reconsider values, and seek practical wisdom in everyday life.
            </p>
          </div>
        </div>

      {/* Payment Details */}
      <div className="bg-gray-50 py-3 px-3 rounded text-sm text-gray-800">
        <p className="mb-2"><span className="font-semibold">Recipient Name:</span> Hasnain Ajmal</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="break-words"><span className="font-semibold">Easypaisa Number:</span> {easypaisaNumber}</span>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(easypaisaNumber);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                alert("Unable to copy to clipboard");
              }
            }}
            aria-label="Copy Easypaisa number to clipboard"
            className="ml-0 sm:ml-3 inline-flex items-center px-3 py-1 bg-[#3a4095] text-white rounded text-xs hover:bg-[#2d3275] transition-colors justify-center w-full sm:w-auto"
          >
            Copy
          </button>
        </div>
        {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
      </div>

        {/* Name */}
        <div>
          <input
            {...register("name")}
            placeholder="Enter your full name"
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
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
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
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
            className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3a4095] focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* No-show Checkbox */}
        <label className="flex items-start sm:items-center gap-2 text-sm text-gray-700">
          <input 
            type="checkbox" 
            {...register("isNoShow")} 
            className="mt-1 accent-[#3a4095]" 
          />
          <span>
            I missed the previous meetup and want to share my previous payment
          </span>
        </label>

        {/* Payment Screenshot */}
        <div>
          <label
            htmlFor="paymentScreenshot"
            className="inline-block w-full sm:w-auto text-center cursor-pointer px-4 py-2 rounded text-sm text-white bg-[#3a4095] hover:bg-[#2d3275] transition-colors"
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
          className="w-full py-2 rounded font-medium text-white bg-[#3a4095] hover:bg-[#2d3275] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Submitting..." : "Register"}
        </button>
      </div>
    </div>
  );
}