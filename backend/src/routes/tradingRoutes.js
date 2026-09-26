const express = require("express");
const router = express.Router();

const { generateSignal } = require("../strategies/strategy");

let bot = {
    running: false,
    lastSignal: "HOLD",
    lastPrice: 25000,
    lastAction: "BOT STOPPED",
    stopLoss: 2,
    takeProfit: 4
};

function generatePrices() {
    let price = 25000;
    const prices = [];

    for (let i = 0; i < 100; i++) {
        price += (Math.random() - 0.48) * 100;
        prices.push(Number(price.toFixed(2)));
    }

    return prices;
}

/* Existing signal API */
router.get("/signal", (req, res) => {
    const prices = generatePrices();

    const result = generateSignal(prices);

    bot.lastSignal = result.signal || "HOLD";
    bot.lastPrice = prices[prices.length - 1];

    res.json({
        success: true,
        symbol: "NIFTY",
        currentPrice: bot.lastPrice,
        ...result
    });
});

/* Bot status */
router.get("/status", (req, res) => {
    res.json({
        success: true,
        data: bot
    });
});

/* Start bot */
router.post("/start", (req, res) => {
    bot.running = true;
    bot.lastAction = "BOT STARTED";

    res.json({
        success: true,
        message: "Trading bot started",
        data: bot
    });
});

/* Stop bot */
router.post("/stop", (req, res) => {
    bot.running = false;
    bot.lastAction = "BOT STOPPED";

    res.json({
        success: true,
        message: "Trading bot stopped",
        data: bot
    });
});

module.exports = router;
