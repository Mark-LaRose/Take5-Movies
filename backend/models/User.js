const mongoose = require("mongoose");

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
    default: Array.from({ length: 12 }, (_, i) => `Favorites List ${i + 1}`)
  }
}, { timestamps: true });

userSchema.methods.updateFavoriteList = async function (listIndex, movieId) {
  movieId = String(movieId);

  if (listIndex < 0 || listIndex >= this.favorites.length) {
    throw new Error("Invalid list index");
  }

  const favoriteList = this.favorites[listIndex];

  if (!favoriteList) {
    throw new Error("Favorite list not found");
  }

  const movieIndex = favoriteList.movies.indexOf(movieId);

  if (movieIndex === -1) {
    favoriteList.movies.push(movieId);
  } else {
    favoriteList.movies.splice(movieIndex, 1);
  }

  this.markModified("favorites");
  await this.save();
};

userSchema.methods.getFavoriteMovies = function () {
  return this.favorites.reduce((allMovies, list) => allMovies.concat(list.movies), []);
};

userSchema.methods.clearAllFavorites = async function () {
  this.favorites.forEach(list => (list.movies = []));
  this.markModified("favorites");
  await this.save();
};

userSchema.methods.updateButtonName = async function (index, newName) {
  if (index < 0 || index >= this.favoriteListNames.length) {
    throw new Error("Invalid list index");
  }

  this.favoriteListNames[index] = newName;
  this.markModified("favoriteListNames");
  await this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;