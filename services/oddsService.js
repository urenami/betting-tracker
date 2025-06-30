const axios = require("axios");
const cache = require("../cache/nodeCache");

const SPORTS = [
  { key: "baseball_mlb", name: "MLB" },
  { key: "basketball_nba", name: "NBA" },
  { key: "americanfootball_nfl", name: "NFL" },
  { key: "americanfootball_ncaaf", name: "College Football" },
  { key: "icehockey_nhl", name: "NHL" },
];

async function getCheatSheet() {
  const cached = cache.get("cheatsheet");
  if (cached) {
    console.log("Returning cached cheat sheet");
    return cached;
  }

  console.log("♻️ No cache — fetching fresh data");

  const allCheatSheets = [];

  for (const sport of SPORTS) {
    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sport.key}/odds`,
      {
        params: {
          apiKey: process.env.ODDS_API_KEY,
          regions: "us",
          markets: "h2h",
          oddsFormat: "decimal",
        },
      }
    );

    const filteredGames = response.data
      .map((game) => {
        const bookmaker = game.bookmakers[0];
        const h2hMarket = bookmaker?.markets?.find((m) => m.key === "h2h");
        const outcomes = h2hMarket?.outcomes || [];

        const hasUnderdog = outcomes.some((outcome) => outcome.price > 2.5);
        if (!hasUnderdog) return null;

        return {
          sport: sport.name,
          matchup: `${game.away_team} @ ${game.home_team}`,
          start_time: game.commence_time,
          odds: outcomes
            .map((outcome) => ({
              team: outcome.name,
              odds: outcome.price,
            }))
            .sort((a, b) => b.odds - a.odds),
        };
      })
      .filter((game) => game !== null);

    allCheatSheets.push(...filteredGames);
  }

  allCheatSheets.sort((a, b) => {
    const maxA = Math.max(...a.odds.map((o) => o.odds));
    const maxB = Math.max(...b.odds.map((o) => o.odds));
    return maxB - maxA;
  });

  cache.set("cheatsheet", allCheatSheets);

  console.log("Fetched and cached new data");
  return allCheatSheets;
}

module.exports = { getCheatSheet };