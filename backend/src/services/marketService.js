let market = {
    symbol: "NIFTY",
    price: 25000,
    previousPrice: 25000,
    change: 0,
    changePercent: 0
};

function getMarketData() {
    const movement = (Math.random() - 0.5) * 100;

    market.previousPrice = market.price;
    market.price = Number((market.price + movement).toFixed(2));

    market.change = Number(
        (market.price - market.previousPrice).toFixed(2)
    );

    market.changePercent = Number(
        ((market.change / market.previousPrice) * 100).toFixed(2)
    );

    return market;
}

module.exports = {
    getMarketData
};
