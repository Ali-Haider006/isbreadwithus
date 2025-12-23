import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-white">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 grid md:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div>
          <span className="inline-block mb-4 text-sm font-medium text-primary">
            Islamabad’s Reading Community
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Read Together. <br />
            Think Deeper. <br />
            <span className="text-primary">Connect Locally.</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mb-8">
            Islamabad Read With Us is a community-driven book club bringing
            readers together through monthly reads, thoughtful discussions,
            and in-person meetups.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <a
              href="https://instagram.com/isbreadwithus"
              target="_blank"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Join the Community
            </a>

            <Link
              href="#about"
              className="px-6 py-3 rounded-lg border border-gray-300 hover:border-primary hover:text-primary transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative hidden md:block">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <p className="text-sm text-gray-500 mb-3">
              Currently Reading
            </p>
            <h3 className="text-xl font-semibold mb-2">
              A Community Pick
            </h3>
            <p className="text-gray-600">
              Discover books you wouldn’t normally pick — and discuss them
              with readers who care.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
