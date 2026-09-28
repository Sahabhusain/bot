const express = require("express");

const router = express.Router();

const { getMarketData } = require("../services/marketService");
const { generateSignal } = require("../strategies/strategy");

// Generate historical prices around current market price
function generateHistoricalPrices(currentPrice) {
    const prices = [];

    let price = currentPrice;

    for (let i = 0; i < 100; i++) {
        price += (Math.random() - 0.48) * 100;

        prices.push(
            Number(price.toFixed(2))
        );
    }

    return prices;
}

// ==========================================
// GET TRADING SIGNAL
// ==========================================

router.get("/signal", (req, res) => {

    try {

        const market = getMarketData();

        const currentPrice = market.price;

        const prices =
            generateHistoricalPrices(currentPrice);

        const strategy =
            generateSignal(prices);

        res.json({
            success: true,

            data: {
                symbol: "NIFTY",

                price: currentPrice,

                signal: strategy.signal,

                reason: strategy.reason,

                confidence: strategy.confidence,

                ema20: strategy.ema20,

                ema50: strategy.ema50,

                rsi: strategy.rsi,

                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {

        console.error(
            "Trading signal error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to generate trading signal"
        });
    }
});

module.exports = router;