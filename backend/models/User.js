const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  avatar: String,
  favorites: [
    {
      movies: { type: [String], default: [] }
    }
  ],
  favoriteListNames: {
    type: [String],
    default: Array.from({ length: 12 }, (_, i) => `Favorites List ${i + 1}`) // ✅ Default names
  }
}, { timestamps: true });

/** ✅ Add or Remove a Movie from a Favorite List */
userSchema.methods.updateFavoriteList = async function (listIndex, movieId) {
  movieId = String(movieId); // Ensure movieId is always a string

  if (listIndex < 0 || listIndex >= this.favorites.length) {
    throw new Error("❌ Invalid list index");
  }

  const favoriteList = this.favorites[listIndex];

  if (!favoriteList) {
    throw new Error("❌ Favorite list not found");
  }

  console.log(`🔹 Updating List: ${listIndex}, Movie ID: ${movieId}`);
  console.log(`🔹 Current Movies in List:`, favoriteList.movies);

  const movieIndex = favoriteList.movies.indexOf(movieId);

  if (movieIndex === -1) {
    favoriteList.movies.push(movieId);
    console.log(`✅ Added movie [${movieId}] to list [${listIndex}]`);
  } else {
    favoriteList.movies.splice(movieIndex, 1);
    console.log(`❌ Removed movie [${movieId}] from list [${listIndex}]`);
  }

  this.markModified("favorites"); // ✅ Ensure Mongoose detects changes
  await this.save();
};

/** ✅ Retrieve All Favorite Movies */
userSchema.methods.getFavoriteMovies = function () {
  return this.favorites.reduce((allMovies, list) => allMovies.concat(list.movies), []);
};

/** ✅ Clear All Favorite Lists */
userSchema.methods.clearAllFavorites = async function () {
  this.favorites.forEach(list => (list.movies = []));
  this.markModified("favorites");
  await this.save();
  console.log("⚠️ All favorite lists have been cleared!");
};

/** ✅ Rename Favorite List */
userSchema.methods.updateButtonName = async function (index, newName) {
  if (index < 0 || index >= this.favoriteListNames.length) {
    throw new Error("❌ Invalid list index");
  }

  this.favoriteListNames[index] = newName;
  this.markModified("favoriteListNames");
  await this.save();
  console.log(`✅ Renamed favorites list ${index + 1} to "${newName}"`);
};

const User = mongoose.model("User", userSchema);
module.exports = User;