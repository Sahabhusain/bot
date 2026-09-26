const express = require("express");

const router = express.Router();

const {
    startBot,
    stopBot,
    getBotStatus
} = require("../services/botService");

router.post("/start", (req, res) => {

    const result = startBot();

    res.status(result.success ? 200 : 400).json(result);
});

router.post("/stop", (req, res) => {

    const result = stopBot();

    res.status(result.success ? 200 : 400).json(result);
});

router.get("/status", (req, res) => {

    res.json({
        success: true,
        data: getBotStatus()
    });
});

module.exports = router;
