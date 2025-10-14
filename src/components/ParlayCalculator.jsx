import { decimalToAmerican } from "../utils/odds";

export default function ParlayCalculator({ picks, wager, setWager }) {
  // 🧩 Handle no picks
  if (!Array.isArray(picks) || picks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/30 dark:border-gray-700 p-4 mt-6">
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          Parlay Calculator
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Add picks to calculate your potential payout.
        </p>
      </div>
    );
  }

  // 🧮 Safely calculate combined decimal odds
  const combinedDecimal = picks.reduce((acc, p) => {
    const valid = Number(p.decimalOdds);
    return isFinite(valid) && valid > 1 ? acc * valid : acc;
  }, 1);

  const combinedAmerican = isFinite(combinedDecimal)
    ? decimalToAmerican(combinedDecimal)
    : null;

  const payout = isFinite(combinedDecimal) ? wager * combinedDecimal : null;
  const profit = isFinite(payout) ? payout - wager : null;

  const formatMoney = (val) =>
    typeof val === "number" && isFinite(val)
      ? `$${val.toFixed(2)}`
      : "–";

  const formatOdds = (dec, am) => {
    if (!isFinite(dec) || !isFinite(am)) return "–";
    return `${dec.toFixed(2)} (Dec), ${am > 0 ? "+" : ""}${am} (US)`;
  };

  return (
    <div className="rounded-2xl border border-white/30 dark:border-gray-700 p-4 mt-6">
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
        Parlay Calculator
      </h3>

      {/* Wager Input */}
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

      {/* Results */}
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p>
          <strong>Total Picks:</strong> {picks.length}
        </p>
        <p>
          <strong>Combined Odds:</strong>{" "}
          {formatOdds(combinedDecimal, combinedAmerican)}
        </p>
        <p>
          <strong>Estimated Payout:</strong> {formatMoney(payout)}
        </p>
        <p>
          <strong>Profit:</strong> {formatMoney(profit)}
        </p>
      </div>
    </div>
  );
}
