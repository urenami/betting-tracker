import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState("baseball_mlb");
  const [picks, setPicks] = useState(() => {
    const saved = localStorage.getItem("myPicks");
    return saved ? JSON.parse(saved) : [];
  });

  const sports = [
    { key: "baseball_mlb", label: "MLB" },
    { key: "basketball_nba", label: "NBA" },
    { key: "americanfootball_nfl", label: "NFL" },
    { key: "icehockey_nhl", label: "NHL" },
  ];

  useEffect(() => {
    const fetchOdds = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=us&markets=h2h&apiKey=${
            import.meta.env.VITE_ODDS_API_KEY
          }`
        );
        const data = await response.json();
        setGames(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching odds:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOdds();
  }, [sport]);

  useEffect(() => {
    localStorage.setItem("myPicks", JSON.stringify(picks));
  }, [picks]);

  const addPick = (game) => {
    if (picks.some((p) => p.id === game.id)) return;
    setPicks([...picks, game]);
  };

  const removePick = (id) => {
    setPicks(picks.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-300/70 dark:border-gray-700/70 bg-white/90 dark:bg-gray-800/90 backdrop-blur">
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 md:py-5 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Betting Tracker
            </span>
          </h1>

          <nav className="hidden md:flex items-center gap-6">
            {["Dashboard", "My Picks", "Parlay Builder"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-500 font-medium"
              >
                {item}
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

          {menuOpen && (
            <div className="absolute left-0 right-0 top-full md:hidden bg-white/95 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 shadow-md">
              <div className="px-4 py-3 space-y-2">
                {["Dashboard", "My Picks", "Parlay Builder"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-gray-700 dark:text-gray-200 hover:text-indigo-500 font-medium"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upcoming Games */}
          <section className="col-span-2 rounded-2xl border border-white/30 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50 backdrop-blur p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-3">
              Upcoming Games
            </h2>

            <div className="flex flex-wrap gap-3 mb-6 mt-4">
              {sports.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSport(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-transform ${
                    sport === key
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-indigo-500 hover:text-white"
                  } hover:scale-105 active:scale-95`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-gray-600 dark:text-gray-300">
                Loading {sports.find((s) => s.key === sport)?.label} odds...
              </p>
            ) : (
              <div className="space-y-4">
                {games.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    No games found for{" "}
                    {sports.find((s) => s.key === sport)?.label}.
                  </p>
                ) : (
                  games.map((game) => (
                    <div
                      key={game.id}
                      className="p-4 bg-white/70 dark:bg-gray-700/70 rounded-xl flex justify-between items-center shadow hover:shadow-lg transition-transform hover:scale-[1.02]"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {game.home_team} vs {game.away_team}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {game.sport_title}
                        </p>
                      </div>
                      <button
                        onClick={() => addPick(game)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-transform hover:scale-105 active:scale-95"
                      >
                        Add Pick
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {/* My Picks */}
          <aside className="rounded-2xl border border-white/30 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50 backdrop-blur p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-3">
              My Picks
            </h2>
            {picks.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No picks yet — add one from the list!
              </p>
            ) : (
              <ul className="space-y-3">
                {picks.map((pick) => (
                  <li
                    key={pick.id}
                    className="flex justify-between items-center bg-white/70 dark:bg-gray-700/70 px-3 py-2 rounded-lg shadow hover:shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                      {pick.home_team} vs {pick.away_team}
                    </span>
                    <button
                      onClick={() => removePick(pick.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                    >
                      Remove Pick
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Parlay Calculator */}
          <div className="rounded-2xl border border-white/30 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50 backdrop-blur p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-3">
              Parlay Calculator
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Enter your wager to estimate potential payout.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Wager Amount ($)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter amount"
                />
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-200">
                  Total Picks: <span className="font-semibold">{picks.length}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  Combined Odds: <span className="font-semibold">–</span>
                </p>
                <p className="text-gray-900 dark:text-white text-lg font-bold mt-3">
                  Estimated Payout: –
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
