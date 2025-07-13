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

// Export router
module.exports = router;
