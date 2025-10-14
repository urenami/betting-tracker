import { useEffect, useState } from "react";
import { PREFERRED, bookColor } from "../utils/config";
import { americanToDecimal, normalizeOdds } from "../utils/odds";

export default function GameList({ picks, addPick }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sport, setSport] = useState("baseball_mlb");

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

  const getBestBook = (game, team) => {
    let bestBook = null;
    let bestOdds = null;
    for (const b of game.bookmakers || []) {
      if (!PREFERRED.includes(b.key)) continue;
      const o = b.markets?.[0]?.outcomes?.find((x) => x.name === team);
      if (!o?.price && o?.price !== 0) continue;
      const odds = normalizeOdds(o.price)?.am;
      if (bestOdds === null || odds > bestOdds) {
        bestOdds = odds;
        bestBook = b.title;
      }
    }
    return { bestBook, bestOdds };
  };

  const isPicked = (id, team) => picks.some((p) => p.id === `${id}-${team}`);

  const handleAddPick = (game, team) => {
    if (isPicked(game.id, team)) return;
    const { bestBook, bestOdds } = getBestBook(game, team);
    if (bestOdds == null) return;
    addPick({
      id: `${game.id}-${team}`,
      team,
      opponent: team === game.home_team ? game.away_team : game.home_team,
      sport: game.sport_title,
      americanOdds: bestOdds,
      decimalOdds: americanToDecimal(bestOdds),
      book: bestBook,
      dateAdded: new Date().toLocaleString(),
    });
  };

  const now = new Date();
  const twoDaysAhead = new Date(now);
  twoDaysAhead.setDate(now.getDate() + 2);
  const sevenDaysAhead = new Date(now);
  sevenDaysAhead.setDate(now.getDate() + 7);

  const filteredGames = games
    .filter((g) => {
      const start = new Date(g.commence_time);
      const sixHoursAgo = new Date(now);
      sixHoursAgo.setHours(now.getHours() - 6);
      if (["baseball_mlb", "basketball_nba", "icehockey_nhl"].includes(sport))
        return start >= sixHoursAgo && start <= twoDaysAhead;
      if (sport === "americanfootball_nfl")
        return start >= now && start <= sevenDaysAhead;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.commence_time).getTime() -
        new Date(b.commence_time).getTime()
    );

  return (
    <section className="rounded-2xl border border-white/30 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50 backdrop-blur p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-900 dark:text-gray-100">
        Upcoming Games
      </h2>

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

                <div className="flex gap-2">
                  {[game.home_team, game.away_team].map((team) => {
                    const picked = isPicked(game.id, team);
                    const { bestBook, bestOdds } = getBestBook(game, team);
                    return (
                      <button
                        key={team}
                        disabled={!bestOdds}
                        onClick={() => handleAddPick(game, team)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          picked
                            ? "bg-green-600 text-white cursor-default"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        } ${!bestOdds ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={bestBook ? `Best at ${bestBook}` : ""}
                      >
                        {picked ? "✓ Added" : team}
                        {bestOdds && (
                          <span className="ml-1 text-xs opacity-90">
                            ({bestOdds > 0 ? `+${bestOdds}` : bestOdds})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(game.bookmakers || [])
                .filter((b) => PREFERRED.includes(b.key))
                .slice(0, 3)
                .map((b) => {
                  const outcomes =
                    b.markets?.find((m) => m.key === "h2h")?.outcomes || [];
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
                            const { bestBook } = getBestBook(game, o.name);
                            const isBest = bestBook === b.title;
                            return (
                              <span
                                key={o.name}
                                className={`flex flex-wrap items-center gap-1 ${
                                  isBest
                                    ? "text-green-700 dark:text-green-400 font-semibold"
                                    : "text-gray-800 dark:text-gray-300"
                                }`}
                              >
                                <span>{o.name}</span>
                                <span>{n.am > 0 ? `+${n.am}` : n.am}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({Math.round(n.prob)}%)
                                </span>
                                {isBest && (
                                  <span className="text-xs font-bold text-green-600 dark:text-green-400 ml-1">
                                    Best
                                  </span>
                                )}
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
  );
}
