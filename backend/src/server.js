const express = require("express");
const cors = require("cors");
require("dotenv").config();

const marketRoutes = require("./routes/marketRoutes");
const tradingRoutes = require("./routes/tradingRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// =========================
// MIDDLEWARE
// =========================

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(express.json());

// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Trading Bot API is running",
    });
});

// =========================
// API ROUTES
// =========================

app.use("/api/market", marketRoutes);
app.use("/api/trading", tradingRoutes);

// =========================
// BOT STATE
// =========================

let botRunning = false;

let botStatus = {
    running: false,
    lastSignal: "HOLD",
    lastPrice: 25000,
    lastAction: "NONE",
    lastUpdate: null,
    stopLoss: "2%",
    takeProfit: "4%",
};

// =========================
// BOT STATUS
// =========================

app.get("/api/bot/status", (req, res) => {
    res.json({
        success: true,
        data: botStatus,
    });
});

// =========================
// START BOT
// =========================

app.post("/api/bot/start", (req, res) => {
    botRunning = true;

    botStatus.running = true;
    botStatus.lastAction = "BOT STARTED";
    botStatus.lastUpdate = new Date().toISOString();

    res.json({
        success: true,
        message: "Trading bot started",
        data: botStatus,
    });
});

// =========================
// STOP BOT
// =========================

app.post("/api/bot/stop", (req, res) => {
    botRunning = false;

    botStatus.running = false;
    botStatus.lastAction = "BOT STOPPED";
    botStatus.lastUpdate = new Date().toISOString();

    res.json({
        success: true,
        message: "Trading bot stopped",
        data: botStatus,
    });
});

// =========================
// PORTFOLIO
// =========================

let portfolio = {
    initialCapital: 100000,
    cash: 100000,

    position: {
        symbol: "NIFTY",
        quantity: 0,
        averagePrice: 0,
    },

    positionValue: 0,
    realizedPnL: 0,
    unrealizedPnL: 0,
    totalValue: 100000,
    totalPnL: 0,
};

let trades = [];

// =========================
// PORTFOLIO API
// =========================

app.get("/api/portfolio", (req, res) => {
    const price = Number(
        req.query.price || 25000
    );

    const quantity =
        portfolio.position.quantity;

    const averagePrice =
        portfolio.position.averagePrice;

    portfolio.positionValue =
        quantity * price;

    portfolio.unrealizedPnL =
        quantity > 0
            ? (price - averagePrice) *
              quantity
            : 0;

    portfolio.totalValue =
        portfolio.cash +
        portfolio.positionValue;

    portfolio.totalPnL =
        portfolio.totalValue -
        portfolio.initialCapital;

    res.json({
        success: true,
        data: portfolio,
    });
});

// =========================
// TRADES API
// =========================

app.get("/api/portfolio/trades", (req, res) => {
    res.json({
        success: true,
        data: trades,
    });
});

// =========================
// 404 HANDLER
// =========================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
        path: req.originalUrl,
    });
});

// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(
        `Trading Bot server running on http://localhost:${PORT}`
    );
});