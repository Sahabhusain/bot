// ==========================================
// EMA CALCULATION
// ==========================================
function calculateEMA(prices, period) {
    if (!Array.isArray(prices) || prices.length < period) {
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

// ==========================================
// RSI CALCULATION
// ==========================================
function calculateRSI(prices, period = 14) {
    if (!Array.isArray(prices) || prices.length <= period) {
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

// ==========================================
// TRADING SIGNAL
// ==========================================
function generateSignal(prices) {
    if (!Array.isArray(prices) || prices.length < 50) {
        return {
            signal: "HOLD",
            reason: "Not enough market data",
            ema20: null,
            ema50: null,
            rsi: null,
            confidence: 0
        };
    }

    const ema20 = calculateEMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);
    const rsi = calculateRSI(prices, 14);

    if (ema20 === null || ema50 === null || rsi === null) {
        return {
            signal: "HOLD",
            reason: "Indicators unavailable",
            ema20,
            ema50,
            rsi,
            confidence: 0
        };
    }

    let signal = "HOLD";
    let reason = "Market conditions are neutral";
    let confidence = 50;

    // ==========================================
    // BUY CONDITION
    // EMA20 > EMA50
    // RSI between 50 and 70
    // ==========================================
    if (ema20 > ema50 && rsi >= 50 && rsi <= 70) {
        signal = "BUY";
        reason = "Bullish EMA crossover with positive RSI";
        confidence = Math.min(
            95,
            Math.round(
                60 +
                ((ema20 - ema50) / ema50) * 1000 +
                (rsi - 50)
            )
        );
    }

    // ==========================================
    // STRONG BUY
    // ==========================================
    else if (ema20 > ema50 && rsi > 70) {
        signal = "BUY";
        reason = "Strong bullish momentum";
        confidence = 75;
    }

    // ==========================================
    // SELL CONDITION
    // EMA20 < EMA50
    // RSI between 30 and 50
    // ==========================================
    else if (ema20 < ema50 && rsi >= 30 && rsi < 50) {
        signal = "SELL";
        reason = "Bearish EMA trend with weak RSI";
        confidence = Math.min(
            95,
            Math.round(
                60 +
                ((ema50 - ema20) / ema50) * 1000 +
                (50 - rsi)
            )
        );
    }

    // ==========================================
    // STRONG SELL
    // ==========================================
    else if (ema20 < ema50 && rsi < 30) {
        signal = "SELL";
        reason = "Strong bearish momentum";
        confidence = 80;
    }

    // ==========================================
    // HOLD
    // ==========================================
    else {
        signal = "HOLD";
        reason = "EMA and RSI do not confirm a trade";
        confidence = 50;
    }

    return {
        signal,
        reason,
        confidence,
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