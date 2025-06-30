const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3000;
const NodeCache = require("node-cache");

// Create a cache instance
// stdTTL = 300 means each key expires after 300 seconds (5 minutes)
const cache = new NodeCache({ stdTTL: 300 });

app.use(express.static("public"));

app.get("/cheatsheet", async (req, res) => {
  try {
    //Check if we already have cached data
    const cached = cache.get("cheatsheet");
    if (cached) {
      console.log("Returning cached cheat sheet");
      return res.json(cached);
    }

    console.log("♻️ No cache — fetching fresh data");

    const sports = [
      { key: "baseball_mlb", name: "MLB" },
      { key: "basketball_nba", name: "NBA" },
      { key: "americanfootball_nfl", name: "NFL" },
      { key: "americanfootball_ncaaf", name: "College Football" },
      { key: "icehockey_nhl", name: "NHL" },
    ];

    const allCheatSheets = [];

    for (const sport of sports) {
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

    //Save fresh data to cache for 5 minutes
    cache.set("cheatsheet", allCheatSheets);

    console.log("Fetched and cached new data");
    res.json(allCheatSheets);
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).send("Error fetching odds");
  }
});

//Start the Express server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});