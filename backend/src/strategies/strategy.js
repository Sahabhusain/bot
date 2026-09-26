function calculateEMA(prices, period) {
    if (prices.length < period) {
        return null;
    }

    const multiplier = 2 / (period + 1);

    let ema =
        prices
            .slice(0, period)
            .reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
        ema = (prices[i] - ema) * multiplier + ema;
    }

    return Number(ema.toFixed(2));
}

function calculateRSI(prices, period = 14) {
    if (prices.length <= period) {
        return null;
    }

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];

        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    const averageGain = gains / period;
    const averageLoss = losses / period;

    if (averageLoss === 0) {
        return 100;
    }

    const rs = averageGain / averageLoss;

    return Number((100 - 100 / (1 + rs)).toFixed(2));
}

function generateSignal(prices) {
    const ema20 = calculateEMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);
    const rsi = calculateRSI(prices);

    if (ema20 === null || ema50 === null || rsi === null) {
        return {
            signal: "HOLD",
            ema20,
            ema50,
            rsi
        };
    }

    if (ema20 > ema50 && rsi > 50) {
        return {
            signal: "BUY",
            ema20,
            ema50,
            rsi
        };
    }

    if (ema20 < ema50 || rsi < 45) {
        return {
            signal: "SELL",
            ema20,
            ema50,
            rsi
        };
    }

    return {
        signal: "HOLD",
        ema20,
        ema50,
        rsi
    };
}

module.exports = {
    calculateEMA,
    calculateRSI,
    generateSignal
};
