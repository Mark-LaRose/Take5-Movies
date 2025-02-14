const mongoose = require("mongoose");

const FavoriteListSchema = new mongoose.Schema(
  {
    listName: { type: String, required: true },
    movies: [{ type: String }] // Ensuring movie IDs are always stored as strings
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    favorites: {
      type: [FavoriteListSchema],
      default: Array.from({ length: 12 }, (_, i) => ({
        listName: `Favorites List ${i + 1}`,
        movies: []
      }))
    }
  },
  { timestamps: true }
);

/** ✅ Method: Add or Remove a Movie from a Favorite List */
UserSchema.methods.updateFavoriteList = async function (listIndex, movieId) {
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

/** ✅ Method: Get All Favorite Movies from All Lists */
UserSchema.methods.getFavoriteMovies = function () {
  return this.favorites.reduce((allMovies, list) => allMovies.concat(list.movies), []);
};

/** ✅ Method: Clear All Favorite Lists */
UserSchema.methods.clearAllFavorites = async function () {
  this.favorites.forEach(list => (list.movies = []));
  this.markModified("favorites"); // ✅ Ensure Mongoose detects changes
  await this.save();
  console.log("⚠️ All favorite lists have been cleared!");
};

module.exports = mongoose.model("User", UserSchema);