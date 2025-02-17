const express = require("express");
const { verifyToken } = require("./auth");
const User = require("../models/User");

const router = express.Router();

/** ✅ Fetch User's Favorite Lists */
router.get("/favorites", verifyToken, async (req, res) => {
  try {
    console.log("🔹 Fetching favorites for user:", req.user.userId);

    const user = await User.findOne({ auth0Id: req.user.userId });

    if (!user) {
      console.error("❌ No user found for auth0Id:", req.user.userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.favorites || user.favorites.length === 0) {
      console.error("❌ User has no favorites list.");
      return res.status(404).json({ success: false, message: "Favorites not found" });
    }

    // ✅ Send favorite lists with names
    const favoritesWithNames = user.favorites.map((list, index) => ({
      name: user.favoriteListNames[index] || `Favorites List ${index + 1}`,
      movies: list.movies || [],
    }));

    res.json({ success: true, favorites: favoritesWithNames });
  } catch (err) {
    console.error("🔥 Critical Server Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

/** ✅ Add or Remove Movie from Favorite Lists */
router.post("/updateFavorites", verifyToken, async (req, res) => {
  try {
    console.log("🔹 Received request to update favorites:", req.body);

    let { movieId, favoriteListIndexes } = req.body;
    const userId = req.user.userId;

    if (!userId || !movieId || !Array.isArray(favoriteListIndexes)) {
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    for (let listIndex of favoriteListIndexes) {
      await user.updateFavoriteList(listIndex, movieId);
    }

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

/** ✅ Update Favorite List Name */
router.post("/updateFavoriteListName", verifyToken, async (req, res) => {
  try {
    const { index, newName } = req.body;
    const userId = req.user.userId;

    if (!userId || typeof index !== "number" || typeof newName !== "string") {
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.favoriteListNames[index] = newName;
    await user.save();

    res.json({ success: true, favoriteListNames: user.favoriteListNames });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;