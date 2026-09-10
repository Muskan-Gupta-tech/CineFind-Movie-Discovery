const sequelize = require('../config/database');
const WishlistMovie = require('./WishlistMovie');

// Keeping this simple: for a project of this size, sequelize.sync() is fine.
// A production app would use migrations instead of sync().
async function initDatabase() {
  await sequelize.authenticate();
  await sequelize.sync(); // creates wishlist_movies table if it doesn't exist
  console.log('Database connected and synced.');
}

module.exports = {
  sequelize,
  WishlistMovie,
  initDatabase,
};
