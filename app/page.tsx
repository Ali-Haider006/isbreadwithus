export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Islamabad Read With Us
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-6">
          A community of readers in Islamabad who come together to read,
          reflect, and discuss great books.
        </p>
        <a
          href="https://instagram.com/isbreadwithus"
          target="_blank"
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Join the Community
        </a>
      </section>
    </main>
  );
}
