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

    // ✅ Log the full favorites structure
    console.log("✅ User's favorites structure:", JSON.stringify(user.favorites, null, 2));

    res.json({ success: true, favorites: user.favorites });
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
    const userId = req.user.userId; // Extract user ID from verified JWT

    console.log(`🔹 User ID: ${userId}`);
    console.log(`🔹 Movie ID: ${movieId}`);
    console.log(`🔹 Favorite List Indexes: ${favoriteListIndexes}`);

    if (!userId || !movieId || !Array.isArray(favoriteListIndexes)) {
      console.error("❌ Invalid request data");
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      console.error("❌ User not found in the database");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update all selected favorite lists
    for (let listIndex of favoriteListIndexes) {
      await user.updateFavoriteList(listIndex, movieId);
    }

    console.log("✅ Successfully updated favorites");
    res.json({ success: true, favorites: user.favorites });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;