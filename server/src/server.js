require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./models');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`CineFind API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
