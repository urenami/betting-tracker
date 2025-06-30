const express = require('express');
const router = express.Router();
const { getCheatSheet } = require('../services/oddsService'); 

router.get('/', async (req, res) => {
  try {
    const cheatsheet = await getCheatSheet();
    res.json(cheatsheet);
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
    res.status(500).send('Error fetching odds');
  }
});

module.exports = router;
