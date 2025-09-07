// Load modules
const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

// POST /save-pick: save a betting pick
router.post("/save-pick", (req, res) => {
  const newPick = { ...req.body, id: Date.now() };

  const filePath = path.join(__dirname, "../data/picks.json");

  let picks = [];
  if (fs.existsSync(filePath)) {
    picks = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  picks.push(newPick);

  fs.writeFileSync(filePath, JSON.stringify(picks, null, 2));

  res.json({ message: "Pick saved!" });
});

router.get("/get-picks", (req, res) => {
  const filePath = path.join(__dirname, "../data/picks.json");

  let picks = [];
  if (fs.existsSync(filePath)) {
    picks = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  res.json(picks);
});

// DELETE /delete-pick/:id: delete a betting pick by id
router.delete("/delete-pick/:id", (req, res) => {
    const idToDelete = parseInt(req.params.id); // get id from URL param
  
    const filePath = path.join(__dirname, "../data/picks.json");
  
    let picks = [];
    if (fs.existsSync(filePath)) {
      picks = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  
    // Keep all picks EXCEPT the one with this id
    const updatedPicks = picks.filter(pick => pick.id !== idToDelete);
  
    fs.writeFileSync(filePath, JSON.stringify(updatedPicks, null, 2));
  
    res.json({ message: "Pick deleted!" });
  });  

  // PATCH /picks/:id/result -> update a pick's result
router.patch("/:id/result", (req, res) => {
  const idToUpdate = String(req.params.id);
  const { result } = req.body || {};

  const valid = ["win", "loss", "pending"];
  if (!valid.includes(result)) {
    return res.status(400).json({ message: "Invalid result" });
  }

  const filePath = path.join(__dirname, "../data/picks.json");

  let picks = [];
  if (fs.existsSync(filePath)) {
    picks = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  const idx = picks.findIndex((p) => String(p.id) === idToUpdate);
  if (idx === -1) {
    return res.status(404).json({ message: "Pick not found" });
  }

  picks[idx].result = result;

  fs.writeFileSync(filePath, JSON.stringify(picks, null, 2));
  res.json({ message: "Result updated", pick: picks[idx] });
});

// PATCH /picks/:id/result -> update a pick's result
router.patch("/:id/result", (req, res) => {
  const idToUpdate = String(req.params.id);
  const { result } = req.body || {};

  const valid = ["win", "loss", "pending"];
  if (!valid.includes(result)) {
    return res.status(400).json({ message: "Invalid result" });
  }

  const filePath = path.join(__dirname, "../data/picks.json");

  let picks = [];
  if (fs.existsSync(filePath)) {
    picks = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  const idx = picks.findIndex((p) => String(p.id) === idToUpdate);
  if (idx === -1) {
    return res.status(404).json({ message: "Pick not found" });
  }

  picks[idx].result = result;

  fs.writeFileSync(filePath, JSON.stringify(picks, null, 2));
  res.json({ message: "Result updated", pick: picks[idx] });
});

// ---- GET /picks/stats ----
router.get("/stats", (req, res) => {
  const filePath = path.join(__dirname, "../data/picks.json");

  let picks = [];
  if (fs.existsSync(filePath)) {
    try {
      picks = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (_) {
      picks = [];
    }
  }

  const totals = {
    total: picks.length,
    wins: 0,
    losses: 0,
    pending: 0,
    totalStaked: 0,
    settledStaked: 0,
    profit: 0,
    roiPct: 0
  };

  function profitFromDecimal(odds, stake, result) {
    if (result === "loss") return -stake;
    if (result === "win") return (odds - 1) * stake;
    return 0;
  }
  function profitFromAmerican(odds, stake, result) {
    if (result === "loss") return -stake;
    if (result === "win") {
      return odds > 0 ? (odds / 100) * stake : (100 / Math.abs(odds)) * stake;
    }
    return 0;
  }

  for (const p of picks) {
    const stake = Number(p.stake) || 0;
    const result = (p.result || "pending").toLowerCase();
    totals.totalStaked += stake;

    if (result === "win") totals.wins++;
    else if (result === "loss") totals.losses++;
    else totals.pending++;

    if (result !== "pending") {
      totals.settledStaked += stake;

      const o = Number(p.odds);
      if (o >= 1.01 && o < 100) {
        totals.profit += profitFromDecimal(o, stake, result);
      } else {
        totals.profit += profitFromAmerican(o, stake, result);
      }
    }
  }

  if (totals.settledStaked > 0) {
    totals.roiPct = (totals.profit / totals.settledStaked) * 100;
  }

  res.json(totals);
});

// Export router
module.exports = router;
