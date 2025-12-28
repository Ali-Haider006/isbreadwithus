export default function Home() {
  return (
    <main className="font-sans">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold">
          A reading community in Islamabad
        </h1>

        <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
          Monthly meetups • Thoughtful discussions • Like-minded readers
        </p>

        <div className="mt-10">
          <a
            href="#upcoming"
            className="inline-block bg-white text-[#3A4095] px-8 py-4 rounded-xl text-sm font-medium tracking-wide hover:bg-white/90 transition"
          >
            View Upcoming Meetup
          </a>
        </div>
      </section>

      {/* About */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl font-semibold mb-6">
          About the Bookclub
        </h2>
        <p className="text-white/85 leading-relaxed text-lg">
          Islamabad Read With Us is a community-led book club bringing readers
          together for meaningful conversations, shared stories, and a love for books.
        </p>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-semibold text-center mb-12 text-[#1F1F1F]">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Register for the meetup",
              "Read the selected book",
              "Join the discussion in person",
            ].map((step, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 text-center shadow-sm border border-gray-100"
              >
                <span className="font-serif text-2xl text-[#3A4095]">
                  {i + 1}
                </span>
                <p className="mt-4 text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Meetup */}
      <section id="upcoming" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl font-semibold mb-6">
          Upcoming Meetup
        </h2>

        <div className="bg-white rounded-2xl p-8 text-[#1F1F1F]">
          <p className="italic font-serif text-lg">
            Book title to be announced
          </p>
          <p className="mt-2 text-gray-600">
            Date • Location
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Limited seats available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-white/70">
        <p>© Islamabad Read With Us</p>
        <p className="mt-2">
          <a
            href="https://instagram.com"
            className="underline hover:text-white"
          >
            Instagram
          </a>
        </p>
      </footer>

    </main>
  );
}
