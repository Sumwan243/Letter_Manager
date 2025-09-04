import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center">
          Welcome to Letter Manager 📝
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          A modern application for managing letters and documents with professional templates
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
          >
            Get Started - Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
