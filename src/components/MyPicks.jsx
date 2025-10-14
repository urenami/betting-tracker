export default function MyPicks({ picks, removePick, clearPicks }) {
  return (
    <div className="rounded-2xl border border-white/30 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50 backdrop-blur p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Picks
        </h2>
        {picks.length > 0 && (
          <button
            onClick={clearPicks}
            className="text-xs text-red-500 hover:text-red-700 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {picks.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          No picks yet — choose a team above.
        </p>
      ) : (
        <ul className="space-y-2">
          {picks.map((p) => (
            <li
              key={p.id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/70 dark:bg-gray-700/70 px-3 py-2 rounded-lg"
            >
              <div>
                <span className="text-sm font-medium">{p.team}</span>{" "}
                <span className="text-xs text-gray-500">
                  ({p.americanOdds > 0 ? "+" : ""}
                  {p.americanOdds}) • {p.book}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Added: {p.dateAdded}
                </p>
              </div>
              <button
                onClick={() => removePick(p.id)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold mt-2 sm:mt-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
