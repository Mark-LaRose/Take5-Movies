const express = require("express");
const cors = require("cors"); // ✅ Import CORS
const connectDB = require("./config/db");

// ✅ Import Routes
const authRoutes = require("./routes/auth").router;
const movieRoutes = require("./routes/movies");

const app = express();

// ✅ Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

// ✅ CORS Middleware (Updated for Authorization Headers)
app.use(
  cors({
    origin: "http://localhost:3000", // ✅ Allow frontend requests
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Ensure Authorization header is allowed
    credentials: true // ✅ Allow cookies & tokens
  })
);

// ✅ Middleware to parse JSON
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);

// ✅ Default test route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// ✅ 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "❌ Route Not Found" });
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ success: false, message: "❌ Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));