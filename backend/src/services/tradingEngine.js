const portfolio = require("../models/portfolio");
const trades = require("../models/trade");

function buy(symbol, price, quantity) {

    const cost = price * quantity;

    if (cost > portfolio.cash) {
        return {
            success: false,
            message: "Insufficient funds"
        };
    }

    const currentQuantity = portfolio.position.quantity;
    const currentAverage = portfolio.position.averagePrice;

    const totalQuantity = currentQuantity + quantity;

    const newAveragePrice =
        ((currentQuantity * currentAverage) + cost) /
        totalQuantity;

    portfolio.cash -= cost;

    portfolio.position.quantity = totalQuantity;
    portfolio.position.averagePrice = Number(
        newAveragePrice.toFixed(2)
    );

    const trade = {
        id: trades.length + 1,
        symbol,
        side: "BUY",
        price,
        quantity,
        value: Number(cost.toFixed(2)),
        timestamp: new Date().toISOString()
    };

    trades.push(trade);

    return {
        success: true,
        message: "BUY order executed",
        trade,
        portfolio
    };
}

function sell(symbol, price, quantity) {

    if (portfolio.position.quantity < quantity) {
        return {
            success: false,
            message: "Insufficient position"
        };
    }

    const revenue = price * quantity;

    const averagePrice = portfolio.position.averagePrice;

    const pnl =
        (price - averagePrice) * quantity;

    portfolio.cash += revenue;

    portfolio.realizedPnL += pnl;

    portfolio.position.quantity -= quantity;

    if (portfolio.position.quantity === 0) {
        portfolio.position.averagePrice = 0;
    }

    const trade = {
        id: trades.length + 1,
        symbol,
        side: "SELL",
        price,
        quantity,
        value: Number(revenue.toFixed(2)),
        pnl: Number(pnl.toFixed(2)),
        timestamp: new Date().toISOString()
    };

    trades.push(trade);

    return {
        success: true,
        message: "SELL order executed",
        trade,
        portfolio
    };
}

function getPortfolio(currentPrice) {

    const positionValue =
        portfolio.position.quantity * currentPrice;

    const unrealizedPnL =
        portfolio.position.quantity > 0
            ? (currentPrice - portfolio.position.averagePrice) *
              portfolio.position.quantity
            : 0;

    portfolio.unrealizedPnL =
        Number(unrealizedPnL.toFixed(2));

    const totalValue =
        portfolio.cash + positionValue;

    const totalPnL =
        totalValue - portfolio.initialCapital;

    return {
        initialCapital: portfolio.initialCapital,
        cash: Number(portfolio.cash.toFixed(2)),
        position: portfolio.position,
        positionValue: Number(positionValue.toFixed(2)),
        realizedPnL: Number(portfolio.realizedPnL.toFixed(2)),
        unrealizedPnL: portfolio.unrealizedPnL,
        totalValue: Number(totalValue.toFixed(2)),
        totalPnL: Number(totalPnL.toFixed(2))
    };
}

function getTrades() {
    return trades;
}

module.exports = {
    buy,
    sell,
    getPortfolio,
    getTrades
};
