const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ===============================
// CORS
// ===============================
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ===============================
// Middleware
// ===============================
app.use(express.json());

// ===============================
// Routes
// ===============================
const marketRoutes = require("./routes/marketRoutes");
const tradingRoutes = require("./routes/tradingRoutes");
const botRoutes = require("./routes/botRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Trading Bot API is running",
    });
});

// ===============================
// API Routes
// ===============================
app.use("/api/market", marketRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/portfolio", portfolioRoutes);

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.originalUrl,
    });
});

// ===============================
// Error Handler
// ===============================
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

// ===============================
// Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trading Bot server running on port ${PORT}`);
});