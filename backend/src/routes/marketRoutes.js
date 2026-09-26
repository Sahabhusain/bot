const express = require("express");
const router = express.Router();

const { getMarketData } = require("../services/marketService");

router.get("/", (req, res) => {
    const marketData = getMarketData();

    res.json({
        success: true,
        data: marketData
    });
});

module.exports = router;
