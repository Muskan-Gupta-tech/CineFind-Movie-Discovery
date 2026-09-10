const { Sequelize } = require('sequelize');
require('dotenv').config();

// Single Sequelize instance shared by the whole app.
// DATABASE_URL looks like: mysql://user:password@host:port/dbname
//
// Managed MySQL providers (e.g. Aiven, PlanetScale) require an SSL
// connection. Set DB_SSL=true in your deployment's environment variables
// to enable it - local MySQL during development doesn't need this.
const useSsl = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: false, // set to console.log if you want to see generated SQL while learning
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // fine for this project's scope; a stricter setup would pin the provider's CA cert
        },
      }
    : {},
  define: {
    // We manage createdAt/updatedAt ourselves via Sequelize's default timestamps,
    // but keep column names in snake_case to match typical MySQL conventions.
    underscored: true,
  },
});

module.exports = sequelize;
