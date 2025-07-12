// Load modules
const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');

// POST /save-pick: save a betting pick
router.post('/save-pick', (req, res) => {
  const newPick = req.body;

  const filePath = path.join(__dirname, '../data/picks.json');

  let picks = [];
  if (fs.existsSync(filePath)) {
    picks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  picks.push(newPick);

  fs.writeFileSync(filePath, JSON.stringify(picks, null, 2));

  res.json({ message: 'Pick saved!' });
});

// Export router
module.exports = router;
