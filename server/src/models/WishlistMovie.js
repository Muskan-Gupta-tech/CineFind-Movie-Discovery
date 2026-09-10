const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// We store just enough movie info to render the wishlist page without
// depending on the external API being available. This is intentional -
// see README "External API Handling" for the reasoning.
const WishlistMovie = sequelize.define(
  'WishlistMovie',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // prevents duplicate wishlist entries at the DB level
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    posterUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    releaseDate: {
      type: DataTypes.STRING(20), // stored as-is (e.g. "2024-05-10"), display-only
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: 'wishlist_movies',
    timestamps: true, // adds created_at / updated_at automatically
  }
);

module.exports = WishlistMovie;
