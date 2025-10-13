import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

// preferred books + colors
const PREFERRED = ["draftkings", "fanduel", "betmgm"];
const bookColor = {
  draftkings:
    "bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200",
  fanduel: "bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200",
  betmgm:
    "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-200",
};

// helper: convert american ↔ decimal
const americanToDecimal = (o) => (o > 0 ? o / 100 + 1 : 100 / Math.abs(o) + 1);
const decimalToAmerican = (d) =>
  d >= 2 ? Math.round((d - 1) * 100) : -Math.round(100 / (d - 1));

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState("baseball_mlb");
  const [picks, setPicks] = useState(() =>
    JSON.parse(localStorage.getItem("myPicks") || "[]")
  );
  const [wager, setWager] = useState(10);

  const sports = [
    { key: "baseball_mlb", label: "MLB" },
    { key: "basketball_nba", label: "NBA" },
    { key: "americanfootball_nfl", label: "NFL" },
    { key: "icehockey_nhl", label: "NHL" },
  ];

  // Fetch odds
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=us&markets=h2h&apiKey=${
            import.meta.env.VITE_ODDS_API_KEY
          }`
        );
        const data = await res.json();
        setGames(Array.isArray(data) ? data : []);
      } catch {
        setGames([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [sport]);

  useEffect(() => {
    localStorage.setItem("myPicks", JSON.stringify(picks));
  }, [picks]);

  // Helpers
  const findBestAmerican = (game, teamName) => {
    let best = null;
    for (const b of game.bookmakers || []) {
      if (!PREFERRED.includes(b.key)) continue;
      const outcomes = b.markets?.find((m) => m.key === "h2h")?.outcomes || [];
      const o = outcomes.find((x) => x.name === teamName);
      if (!o?.price && o?.price !== 0) continue;
      const odds =
        Math.abs(o.price) < 10
          ? decimalToAmerican(o.price)
          : Math.round(o.price);
      if (best === null || odds > best) best = odds;
    }
    return best;
  };

  const isPicked = (gameId, team) =>
    picks.some((p) => p.id === `${gameId}-${team}`);

  const addPick = (game, team) => {
    if (isPicked(game.id, team)) return;
    const american = findBestAmerican(game, team);
    if (american == null) return;
    setPicks([
      ...picks,
      {
        id: `${game.id}-${team}`,
        team,
        opponent: team === game.home_team ? game.away_team : game.home_team,
        sport: game.sport_title,
        americanOdds: american,
        decimalOdds: americanToDecimal(american),
      },
    ]);
  };

  const removePick = (id) => setPicks(picks.filter((p) => p.id !== id));

  // parlay math
  const combinedDecimal =
    picks.length === 0
      ? 0
      : picks.map((p) => p.decimalOdds).reduce((a, b) => a * b, 1);
  const combinedAmerican =
    picks.length === 0 ? 0 : decimalToAmerican(combinedDecimal);
  const payout = picks.length === 0 ? 0 : wager * combinedDecimal;

  // smart filtering by sport/time
  const now = new Date();
  const twoDaysAhead = new Date(now);
  twoDaysAhead.setDate(now.getDate() + 2);
  const sevenDaysAhead = new Date(now);
  sevenDaysAhead.setDate(now.getDate() + 7);

  const filteredGames = games
    .filter((game) => {
      const start = new Date(game.commence_time);
      const sixHoursAgo = new Date(now);
      sixHoursAgo.setHours(now.getHours() - 6);

      if (["baseball_mlb", "basketball_nba", "icehockey_nhl"].includes(sport)) {
        return start >= sixHoursAgo && start <= twoDaysAhead;
      }
      if (sport === "americanfootball_nfl") {
        return start >= now && start <= sevenDaysAhead;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.commence_time).getTime() -
        new Date(b.commence_time).getTime()
    );

  // render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 pb-12 pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Games */}
        <section className="col-span-2 rounded-2xl border border-white/30 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50 backdrop-blur p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-900 dark:text-gray-100">
            Upcoming Games
          </h2>

          {/* sport filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            {sports.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSport(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  sport === key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Games List */}
          {loading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading…</p>
          ) : filteredGames.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No games found.</p>
          ) : (
            filteredGames.map((game) => {
              const startTime = new Date(game.commence_time);
              const formatted = startTime.toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });

              return (
                <div
                  key={game.id}
                  className="p-4 bg-white/70 dark:bg-gray-700/70 rounded-xl shadow mb-4 space-y-3"
                >
                  {/* teams + time */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {game.home_team} vs {game.away_team}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {game.sport_title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatted}
                      </p>
                    </div>

                    {/* pick buttons */}
                    <div className="flex gap-2">
                      {[game.home_team, game.away_team].map((team) => {
                        const price = findBestAmerican(game, team);
                        const picked = isPicked(game.id, team);
                        return (
                          <button
                            key={team}
                            disabled={price == null}
                            onClick={() => addPick(game, team)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              picked
                                ? "bg-green-600 text-white cursor-default"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            } ${
                              price == null
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {picked ? "✓ Added" : team}
                            {price != null && (
                              <span className="ml-1 text-xs opacity-90">
                                ({price > 0 ? `+${price}` : price})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* sportsbook odds responsive */}
                  {(game.bookmakers || [])
                    .filter((b) => PREFERRED.includes(b.key))
                    .slice(0, 3)
                    .map((b) => {
                      const outcomes =
                        b.markets?.find((m) => m.key === "h2h")?.outcomes || [];

                      const normalizeOdds = (price) => {
                        if (price == null) return null;
                        if (Math.abs(price) < 10) {
                          const dec = price;
                          const am =
                            dec >= 2
                              ? Math.round((dec - 1) * 100)
                              : -Math.round(100 / (dec - 1));
                          const prob = (1 / dec) * 100;
                          return { am, prob };
                        } else {
                          const am = Math.round(price);
                          const prob =
                            am > 0
                              ? (100 / (am + 100)) * 100
                              : (Math.abs(am) / (Math.abs(am) + 100)) * 100;
                          return { am, prob };
                        }
                      };

                      const getColor = (a) =>
                        a > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400";

                      return (
                        <div
                          key={b.key}
                          className={`px-4 py-3 rounded-xl mb-3 ${
                            bookColor[b.key] ||
                            "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <span className="font-semibold text-sm whitespace-nowrap">
                              {b.title}
                            </span>
                            <div className="flex flex-col sm:flex-wrap sm:flex-row sm:gap-x-6 sm:gap-y-1 mt-1 text-sm font-medium leading-snug">
                              {outcomes.map((o) => {
                                const n = normalizeOdds(o.price);
                                if (!n) return null;
                                return (
                                  <span
                                    key={o.name}
                                    className={`flex flex-wrap items-center gap-1 ${getColor(
                                      n.am
                                    )}`}
                                  >
                                    <span className="font-semibold">
                                      {o.name}
                                    </span>
                                    <span className="font-bold">
                                      {n.am > 0 ? `+${n.am}` : n.am}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({Math.round(n.prob)}% win chance)
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })
          )}
        </section>

        {/* Picks + Calculator */}
        <aside className="rounded-2xl border border-white/30 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50 backdrop-blur p-6 shadow-lg space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 border-b pb-3 text-gray-900 dark:text-gray-100">
              My Picks
            </h2>
            {picks.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No picks yet — choose a team above.
              </p>
            ) : (
              <ul className="space-y-2">
                {picks.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center bg-white/70 dark:bg-gray-700/70 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm">
                      {p.team}{" "}
                      <span className="text-xs text-gray-500">
                        ({p.americanOdds > 0 ? "+" : ""}
                        {p.americanOdds})
                      </span>
                    </span>
                    <button
                      onClick={() => removePick(p.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove Pick
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-white/30 dark:border-gray-700 p-4">
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
              Parlay Calculator
            </h3>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Wager Amount ($)
            </label>
            <input
              type="number"
              min="1"
              value={wager}
              onChange={(e) => setWager(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
            />
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>
                <strong>Total Picks:</strong> {picks.length}
              </p>
              <p>
                <strong>Combined Odds:</strong>{" "}
                {picks.length
                  ? `${combinedDecimal.toFixed(2)} (Dec), ${
                      combinedAmerican > 0 ? "+" : ""
                    }${combinedAmerican} (US)`
                  : "–"}
              </p>
              <p>
                <strong>Estimated Payout:</strong>{" "}
                {picks.length ? `$${payout.toFixed(2)}` : "–"}
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
