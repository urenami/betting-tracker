import { useState, useEffect } from "react";
import Header from "./components/Header";
import GameList from "./components/GameList";
import MyPicks from "./components/MyPicks";
import ParlayCalculator from "./components/ParlayCalculator";

export default function App() {
  const [picks, setPicks] = useState(() =>
    JSON.parse(localStorage.getItem("myPicks") || "[]")
  );
  const [wager, setWager] = useState(10);

  useEffect(() => {
    localStorage.setItem("myPicks", JSON.stringify(picks));
  }, [picks]);

  const addPick = (pick) => {
    if (picks.some((p) => p.id === pick.id)) return;
    setPicks([...picks, pick]);
  };

  const removePick = (id) => setPicks(picks.filter((p) => p.id !== id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pb-12 pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="col-span-2">
          <GameList picks={picks} addPick={addPick} />
        </section>
        <aside>
          <MyPicks picks={picks} removePick={removePick} />
          <ParlayCalculator picks={picks} wager={wager} setWager={setWager} />
        </aside>
      </main>
    </div>
  );
}
