import RegistrationForm from "@/components/RegistrationForm";

export default function RegistrationPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-32 pb-24 px-6">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">
          Book Club Registration
        </h1>
        <p className="text-gray-600 mb-8">
          Register to join the next Islamabad Read With Us meetup.
        </p>

        <RegistrationForm />
      </div>
    </main>
  );
}
