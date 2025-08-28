export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Welcome to Letter Manager
        </h1>
        <p className="text-gray-600 text-center mb-6">
          A modern application for managing letters and documents
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
            Get Started
          </button>
          <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
