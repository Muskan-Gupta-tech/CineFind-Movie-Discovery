const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Single Sequelize instance shared by the whole app.
//
// SQLite stores the whole database in a single file on disk. DB_STORAGE_PATH
// lets you point that file somewhere else in production (e.g. a Render
// persistent disk mount); it defaults to ./data/cinefind.sqlite locally.
const storagePath = process.env.DB_STORAGE_PATH || path.join(__dirname, '../../data/cinefind.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false, // set to console.log if you want to see generated SQL while learning
  define: {
    // We manage createdAt/updatedAt ourselves via Sequelize's default timestamps,
    // but keep column names in snake_case to match typical SQL conventions.
    underscored: true,
  },
});

module.exports = sequelize;
