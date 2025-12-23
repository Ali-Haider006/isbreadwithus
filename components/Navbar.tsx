import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Name */}
        <Link href="/" className="text-xl font-semibold">
          Islamabad Read With Us
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="#about" className="hover:text-gray-600">
            About
          </Link>
          <Link href="#how-it-works" className="hover:text-gray-600">
            How It Works
          </Link>
          <Link href="#books" className="hover:text-gray-600">
            Books
          </Link>
          <a
            href="https://instagram.com/isbreadwithus"
            target="_blank"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Join
          </a>
        </div>
      </div>
    </nav>
  );
}
