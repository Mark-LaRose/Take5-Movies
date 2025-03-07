require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const User = require("../models/User");

const router = express.Router();

if (!process.env.AUTH0_DOMAIN || !process.env.JWT_SECRET) {
  process.exit(1);
}

const auth0Domain = process.env.AUTH0_DOMAIN;

const client = jwksClient({
  jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

const getKey = async (header, callback) => {
  try {
    if (!header.kid) {
      return callback(new Error("Missing Key ID (kid) in token"));
    }

    const key = await client.getSigningKey(header.kid);
    const signingKey = key.publicKey || key.rsaPublicKey;

    if (!signingKey) {
      return callback(new Error("Invalid signing key"));
    }

    callback(null, signingKey);
  } catch (error) {
    callback(error);
  }
};

router.post("/login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "No token provided" });

    jwt.verify(token, getKey, { algorithms: ["RS256"] }, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }

      const { sub, name, email, picture } = decoded;

      if (!name || !email) {
        return res.status(400).json({ success: false, message: "Invalid token: missing name or email" });
      }

      let user = await User.findOne({ auth0Id: sub });

      if (!user) {
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
      } else {
        user.name = name;
        user.email = email;
        user.avatar = picture || "";
        await user.save();
      }

      const appToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ success: true, appToken, user });
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const actualToken = token.replace("Bearer ", "").trim();

  jwt.verify(actualToken, (header, callback) => {
    if (!header.kid) {
      return callback(new Error("Missing Key ID (kid) in token"));
    }
  
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err);
      }
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = { userId: decoded.sub };

    next();
  });
};

module.exports = { router, verifyToken };