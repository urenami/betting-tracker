import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Betting Tracker 
          </h1>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-indigo-500">Dashboard</a>
            <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-indigo-500">My Picks</a>
            <a href="#" className="text-gray-700 dark:text-gray-200 hover:text-indigo-500">Parlay Builder</a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Links */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            <a href="#" className="block text-gray-700 dark:text-gray-200 hover:text-indigo-500">Dashboard</a>
            <a href="#" className="block text-gray-700 dark:text-gray-200 hover:text-indigo-500">My Picks</a>
            <a href="#" className="block text-gray-700 dark:text-gray-200 hover:text-indigo-500">Parlay Builder</a>
          </div>
        )}
      </nav>

      {/* Dashboard Section */}
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Upcoming Games</h2>
            <p className="text-gray-600 dark:text-gray-300"></p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">My Picks</h2>
            <p className="text-gray-600 dark:text-gray-300"></p>
          </div>
        </div>
      </main>
    </div>
  );
}
