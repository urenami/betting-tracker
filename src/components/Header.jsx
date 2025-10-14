import { FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-300/70 dark:border-gray-700/70 bg-white/90 dark:bg-gray-800/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Betting Tracker
          </span>
        </h1>

        <nav className="hidden md:flex gap-6 text-gray-700 dark:text-gray-200">
          {["Dashboard", "My Picks", "Parlay Builder"].map((i) => (
            <a key={i} href="#" className="hover:text-indigo-500">
              {i}
            </a>
          ))}
        </nav>

        <button
          className="md:hidden text-gray-700 dark:text-gray-200"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </header>
  );
}
