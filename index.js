const express = require('express');
require('dotenv').config();

const app = express();
const PORT = 3000;

const cheatsheetRouter = require('./routes/cheatsheet');

app.use(express.static('public'));
app.use('/cheatsheet', cheatsheetRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
