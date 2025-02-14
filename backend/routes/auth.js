require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const User = require("../models/User");

const router = express.Router();

// ✅ Ensure required environment variables exist
if (!process.env.AUTH0_DOMAIN || !process.env.JWT_SECRET) {
  console.error("❌ Missing required environment variables: AUTH0_DOMAIN or JWT_SECRET");
  process.exit(1);
}

const auth0Domain = process.env.AUTH0_DOMAIN;

// ✅ JWKS Client for Auth0 token verification
const client = jwksClient({
  jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
  cache: true, // Caches JWKS responses to avoid redundant requests
  rateLimit: true // Limits the rate of JWKS requests
});

// ✅ Get Signing Key Function
const getKey = async (header, callback) => {
  try {
    if (!header.kid) {
      console.error("❌ JWT missing 'kid' (Key ID), cannot verify token.");
      return callback(new Error("Missing Key ID (kid) in token"));
    }

    const key = await client.getSigningKey(header.kid);
    const signingKey = key.publicKey || key.rsaPublicKey;
    
    if (!signingKey) {
      console.error("❌ No valid signing key found!");
      return callback(new Error("Invalid signing key"));
    }

    callback(null, signingKey);
  } catch (error) {
    console.error("❌ Error retrieving signing key from Auth0:", error);
    callback(error);
  }
};

// ✅ OAuth Login
router.post("/login", async (req, res) => {
  try {
    console.log("🔹 Incoming Login Request:", req.body);

    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "No token provided" });

    jwt.verify(token, getKey, { algorithms: ["RS256"] }, async (err, decoded) => {
      if (err) {
        console.error("❌ Token verification failed:", err);
        return res.status(401).json({ success: false, message: "Invalid token" });
      }

      console.log("✅ Token verified successfully:", decoded);
      const { sub, name, email, picture } = decoded;

      if (!name || !email) {
        return res.status(400).json({ success: false, message: "Invalid token: missing name or email" });
      }

      let user = await User.findOne({ auth0Id: sub });

      if (!user) {
        console.log("🆕 Creating new user...");
        user = new User({
          auth0Id: sub,
          name,
          email,
          avatar: picture || "",
          favorites: Array.from({ length: 12 }, (_, index) => ({
            listName: `Favorites List ${index + 1}`,
            movies: []
          }))
        });

        await user.save();
        console.log("✅ New user saved to database:", user);
      } else {
        // ✅ Update user details in case they changed on Auth0
        user.name = name;
        user.email = email;
        user.avatar = picture || "";
        await user.save();
      }

      // ✅ Generate session token
      const appToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ success: true, appToken, user });
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
});

// ✅ Middleware: Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const actualToken = token.replace("Bearer ", "").trim();

  jwt.verify(actualToken, (header, callback) => {
    if (!header.kid) {
      console.error("❌ JWT missing 'kid' (Key ID), cannot verify token.");
      return callback(new Error("Missing Key ID (kid) in token"));
    }
  
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        console.error("❌ Error getting signing key:", err);
        return callback(err);
      }
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      console.error("❌ JWT verification failed:", err);
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    // ✅ Assign userId for use in routes
    req.user = { userId: decoded.sub };

    next();
  });
};

module.exports = { router, verifyToken };