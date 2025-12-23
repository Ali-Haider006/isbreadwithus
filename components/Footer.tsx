export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <h3 className="font-semibold text-lg mb-2">
          Islamabad Read With Us
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Building a reading community in Islamabad, one book at a time.
        </p>

        <div className="flex justify-center gap-6 mb-4">
          <a
            href="https://instagram.com/isbreadwithus"
            target="_blank"
            className="hover:text-gray-600"
          >
            Instagram
          </a>
          <a
            href="#"
            className="hover:text-gray-600"
          >
            Contact
          </a>
        </div>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Islamabad Read With Us. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
