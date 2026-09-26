const { getMarketData } = require("./marketService");
const { generateSignal } = require("../strategies/strategy");
const {
    buy,
    sell,
    getPortfolio
} = require("./tradingEngine");

let botRunning = false;
let botInterval = null;

let botStatus = {
    running: false,
    lastSignal: "HOLD",
    lastPrice: 25000,
    lastAction: "NONE",
    lastUpdate: null
};

const STOP_LOSS_PERCENT = 0.02;
const TAKE_PROFIT_PERCENT = 0.04;

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

function executeBotCycle() {

    const market = getMarketData();

    const currentPrice = market.price;

    const prices =
        generateHistoricalPrices(currentPrice);

    const strategy =
        generateSignal(prices);

    const portfolio =
        getPortfolio(currentPrice);

    botStatus.lastPrice = currentPrice;
    botStatus.lastSignal = strategy.signal;
    botStatus.lastUpdate = new Date().toISOString();

    // Stop Loss / Take Profit
    if (
        portfolio.position.quantity > 0
    ) {

        const averagePrice =
            portfolio.position.averagePrice;

        const stopLossPrice =
            averagePrice * (1 - STOP_LOSS_PERCENT);

        const takeProfitPrice =
            averagePrice * (1 + TAKE_PROFIT_PERCENT);

        if (currentPrice <= stopLossPrice) {

            sell(
                "NIFTY",
                currentPrice,
                portfolio.position.quantity
            );

            botStatus.lastAction =
                "SELL - STOP LOSS";

            console.log(
                `STOP LOSS executed at ${currentPrice}`
            );

            return;
        }

        if (currentPrice >= takeProfitPrice) {

            sell(
                "NIFTY",
                currentPrice,
                portfolio.position.quantity
            );

            botStatus.lastAction =
                "SELL - TAKE PROFIT";

            console.log(
                `TAKE PROFIT executed at ${currentPrice}`
            );

            return;
        }
    }

    // BUY
    if (
        strategy.signal === "BUY" &&
        portfolio.position.quantity === 0
    ) {

        const quantity = 1;

        const result =
            buy(
                "NIFTY",
                currentPrice,
                quantity
            );

        if (result.success) {

            botStatus.lastAction =
                `BUY ${quantity} NIFTY`;

            console.log(
                `BUY executed at ${currentPrice}`
            );
        }

        return;
    }

    // SELL
    if (
        strategy.signal === "SELL" &&
        portfolio.position.quantity > 0
    ) {

        sell(
            "NIFTY",
            currentPrice,
            portfolio.position.quantity
        );

        botStatus.lastAction =
            "SELL - STRATEGY";

        console.log(
            `SELL executed at ${currentPrice}`
        );
    }
}

function startBot() {

    if (botRunning) {
        return {
            success: false,
            message: "Bot is already running"
        };
    }

    botRunning = true;

    botStatus.running = true;
    botStatus.lastAction = "BOT STARTED";

    executeBotCycle();

    botInterval = setInterval(
        executeBotCycle,
        5000
    );

    return {
        success: true,
        message: "Trading bot started",
        status: botStatus
    };
}

function stopBot() {

    if (!botRunning) {
        return {
            success: false,
            message: "Bot is not running"
        };
    }

    clearInterval(botInterval);

    botInterval = null;
    botRunning = false;

    botStatus.running = false;
    botStatus.lastAction = "BOT STOPPED";

    return {
        success: true,
        message: "Trading bot stopped",
        status: botStatus
    };
}

function getBotStatus() {

    return {
        ...botStatus,
        stopLoss: `${STOP_LOSS_PERCENT * 100}%`,
        takeProfit: `${TAKE_PROFIT_PERCENT * 100}%`
    };
}

module.exports = {
    startBot,
    stopBot,
    getBotStatus
};
