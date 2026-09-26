const express = require("express");

const router = express.Router();

const {
    buy,
    sell,
    getPortfolio,
    getTrades
} = require("../services/tradingEngine");

router.get("/", (req, res) => {

    const currentPrice =
        Number(req.query.price) || 25000;

    const portfolio =
        getPortfolio(currentPrice);

    res.json({
        success: true,
        data: portfolio
    });
});

router.post("/buy", (req, res) => {

    const {
        symbol = "NIFTY",
        price,
        quantity
    } = req.body;

    if (!price || !quantity) {
        return res.status(400).json({
            success: false,
            message: "Price and quantity are required"
        });
    }

    const result =
        buy(symbol, Number(price), Number(quantity));

    res.status(result.success ? 200 : 400).json(result);
});

router.post("/sell", (req, res) => {

    const {
        symbol = "NIFTY",
        price,
        quantity
    } = req.body;

    if (!price || !quantity) {
        return res.status(400).json({
            success: false,
            message: "Price and quantity are required"
        });
    }

    const result =
        sell(symbol, Number(price), Number(quantity));

    res.status(result.success ? 200 : 400).json(result);
});

router.get("/trades", (req, res) => {

    res.json({
        success: true,
        data: getTrades()
    });
});

module.exports = router;
