
export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#3a4095' }}>
      <div className="bg-white p-6 rounded-xl shadow text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-600">Registration Successful 🎉</h1>
        <p className="text-sm text-gray-600">
          Your registration has been received.  
          You&apos;ll get a confirmation email soon.
        </p>
      </div>
    </main>
  );
}