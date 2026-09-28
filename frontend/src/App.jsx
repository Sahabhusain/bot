import { useEffect, useState } from "react";
import axios from "axios";
import PriceChart from "./components/PriceChart";
import "./App.css";

const API = "https://bot-p4wu.onrender.com/api";

function App() {
    const [market, setMarket] = useState(null);
    const [bot, setBot] = useState(null);
    const [signalData, setSignalData] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [trades, setTrades] = useState([]);
    const [chartData, setChartData] = useState([]);

    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // FORMATTERS
    // ==========================================

    const money = (value) =>
        `₹${Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    const number = (value) =>
        Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    // ==========================================
    // FETCH MARKET + BOT + SIGNAL + PORTFOLIO
    // ==========================================

    const fetchData = async () => {
        try {
            setError("");

            const [
                marketResponse,
                botResponse,
                signalResponse
            ] = await Promise.all([
                axios.get(`${API}/market`),
                axios.get(`${API}/bot/status`),
                axios.get(`${API}/trading/signal`)
            ]);

            const marketData = marketResponse.data.data;
            const botData = botResponse.data.data;
            const signal = signalResponse.data.data;

            setMarket(marketData);
            setBot(botData);
            setSignalData(signal);

            // Portfolio
            const portfolioResponse = await axios.get(
                `${API}/portfolio?price=${marketData.price}`
            );

            setPortfolio(portfolioResponse.data.data);

            // Trades
            const tradesResponse = await axios.get(
                `${API}/portfolio/trades`
            );

            setTrades(tradesResponse.data.data || []);

            // Chart
            setChartData((previous) => {
                const newPoint = {
                    time: new Date().toLocaleTimeString(),
                    price: marketData.price
                };

                return [...previous, newPoint].slice(-30);
            });

            setLoading(false);

        } catch (err) {
            console.error("Trading Bot API Error:", err);

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Unable to connect to Trading Bot";

            setError(`API Error: ${message}`);
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD + AUTO REFRESH
    // ==========================================

    useEffect(() => {
        fetchData();

        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, []);

    // ==========================================
    // START BOT
    // ==========================================

    const startBot = async () => {
        try {
            setActionLoading(true);
            setError("");

            await axios.post(`${API}/bot/start`);

            await fetchData();

        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Unable to start bot"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // STOP BOT
    // ==========================================

    const stopBot = async () => {
        try {
            setActionLoading(true);
            setError("");

            await axios.post(`${API}/bot/stop`);

            await fetchData();

        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Unable to stop bot"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // MANUAL BUY
    // ==========================================

    const buyNifty = async () => {
        if (!market?.price) {
            setError("Market price is not available");
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            await axios.post(`${API}/portfolio/buy`, {
                symbol: "NIFTY",
                price: market.price,
                quantity: Number(quantity)
            });

            await fetchData();

        } catch (err) {
            console.error("BUY error:", err);

            setError(
                err?.response?.data?.message ||
                "BUY order failed"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // MANUAL SELL
    // ==========================================

    const sellNifty = async () => {
        if (!market?.price) {
            setError("Market price is not available");
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            await axios.post(`${API}/portfolio/sell`, {
                symbol: "NIFTY",
                price: market.price,
                quantity: Number(quantity)
            });

            await fetchData();

        } catch (err) {
            console.error("SELL error:", err);

            setError(
                err?.response?.data?.message ||
                "SELL order failed"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // RETRY
    // ==========================================

    const retryConnection = () => {
        setLoading(true);
        setError("");
        fetchData();
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading && !market) {
        return (
            <div className="loading">
                <div>
                    <h2>Connecting to Trading Bot...</h2>
                    <p>Connecting to production API...</p>
                </div>
            </div>
        );
    }

    // ==========================================
    // CONNECTION ERROR
    // ==========================================

    if (error && !market) {
        return (
            <div className="loading">
                <div>
                    <h2>Unable to connect to Trading Bot</h2>

                    <p
                        style={{
                            color: "#f87171",
                            marginTop: "10px"
                        }}
                    >
                        {error}
                    </p>

                    <button
                        onClick={retryConnection}
                        className="start-btn"
                        style={{ marginTop: "20px" }}
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // SAFE VALUES
    // ==========================================

    const price = market?.price || 0;
    const change = market?.change || 0;
    const changePercent = market?.changePercent || 0;

    const totalValue = portfolio?.totalValue || 0;
    const cash = portfolio?.cash || 0;
    const totalPnL = portfolio?.totalPnL || 0;
    const realizedPnL = portfolio?.realizedPnL || 0;

    const quantityHeld =
        portfolio?.position?.quantity || 0;

    const averagePrice =
        portfolio?.position?.averagePrice || 0;

    const unrealizedPnL =
        portfolio?.unrealizedPnL || 0;

    // Signal comes directly from /api/trading/signal
    const signal =
        signalData?.signal ||
        bot?.lastSignal ||
        "HOLD";

    const ema20 = signalData?.ema20;
    const ema50 = signalData?.ema50;
    const rsi = signalData?.rsi;

    const confidence = signalData?.confidence;

    const reason =
        signalData?.reason ||
        "Waiting for strategy analysis...";

    // ==========================================
    // SIGNAL CLASS
    // ==========================================

    const signalClass =
        signal.toLowerCase();

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="app">

            {/* HEADER */}

            <header className="header">

                <div className="brand">
                    <h1>Trading Bot</h1>

                    <p>
                        Algorithmic Paper Trading Dashboard
                    </p>
                </div>

                <div
                    className={`bot-status ${
                        bot?.running
                            ? "running"
                            : "stopped"
                    }`}
                >
                    ●{" "}
                    {bot?.running
                        ? "BOT RUNNING"
                        : "BOT STOPPED"}
                </div>

            </header>

            {/* ERROR */}

            {error && (
                <div
                    style={{
                        background:
                            "rgba(239,68,68,.10)",
                        border:
                            "1px solid rgba(239,68,68,.25)",
                        color: "#f87171",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        marginBottom: "20px"
                    }}
                >
                    {error}
                </div>
            )}

            {/* KPI CARDS */}

            <section className="cards">

                <div className="card">

                    <div className="card-label">
                        Market
                    </div>

                    <h2>NIFTY</h2>

                    <div className="big-number">
                        {money(price)}
                    </div>

                    <div
                        className={
                            change >= 0
                                ? "profit"
                                : "loss"
                        }
                    >
                        {change >= 0 ? "+" : ""}
                        {number(change)} (
                        {changePercent >= 0 ? "+" : ""}
                        {changePercent}%)
                    </div>

                </div>

                <div className="card">

                    <div className="card-label">
                        Portfolio Value
                    </div>

                    <div className="big-number">
                        {money(totalValue)}
                    </div>

                    <div className="muted">
                        Cash: {money(cash)}
                    </div>

                </div>

                <div className="card">

                    <div className="card-label">
                        Total P&L
                    </div>

                    <div
                        className={`big-number ${
                            totalPnL >= 0
                                ? "profit"
                                : "loss"
                        }`}
                    >
                        {totalPnL >= 0 ? "+" : ""}
                        {money(totalPnL)}
                    </div>

                    <div className="muted">
                        Realized:{" "}
                        <span
                            className={
                                realizedPnL >= 0
                                    ? "profit"
                                    : "loss"
                            }
                        >
                            {money(realizedPnL)}
                        </span>
                    </div>

                </div>

                {/* LIVE SIGNAL */}

                <div className="card">

                    <div className="card-label">
                        AI Trading Signal
                    </div>

                    <div
                        className={`signal ${signalClass}`}
                    >
                        {signal}
                    </div>

                    <div className="muted">
                        Price: {money(price)}
                    </div>

                    {confidence !== undefined && (
                        <div className="muted">
                            Confidence: {confidence}%
                        </div>
                    )}

                </div>

            </section>

            {/* SIGNAL ANALYSIS */}

            <section className="position-section">

                <div className="section-title">

                    <h2>
                        Strategy Analysis
                    </h2>

                    <span>
                        EMA + RSI
                    </span>

                </div>

                <div className="position-grid">

                    <div>
                        <span>EMA 20</span>

                        <strong>
                            {ema20
                                ? money(ema20)
                                : "--"}
                        </strong>
                    </div>

                    <div>
                        <span>EMA 50</span>

                        <strong>
                            {ema50
                                ? money(ema50)
                                : "--"}
                        </strong>
                    </div>

                    <div>
                        <span>RSI 14</span>

                        <strong>
                            {rsi !== undefined
                                ? number(rsi)
                                : "--"}
                        </strong>
                    </div>

                    <div>
                        <span>Analysis</span>

                        <strong>
                            {reason}
                        </strong>
                    </div>

                </div>

            </section>

            {/* MANUAL TRADING */}

            <section className="control-panel">

                <div className="control-info">

                    <h2>
                        Manual Trading
                    </h2>

                    <p>
                        Current NIFTY Price:
                        <strong>
                            {" "}
                            {money(price)}
                        </strong>
                    </p>

                    <p>
                        Quantity:
                        {" "}
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(
                                    Math.max(
                                        1,
                                        Number(e.target.value)
                                    )
                                )
                            }
                            style={{
                                width: "80px",
                                marginLeft: "8px",
                                padding: "7px",
                                borderRadius: "6px",
                                border: "1px solid #334155",
                                background: "#0f172a",
                                color: "white"
                            }}
                        />
                    </p>

                </div>

                <div className="buttons">

                    <button
                        className="start-btn"
                        onClick={buyNifty}
                        disabled={actionLoading}
                    >
                        {actionLoading
                            ? "PROCESSING..."
                            : "BUY NIFTY"}
                    </button>

                    <button
                        className="stop-btn"
                        onClick={sellNifty}
                        disabled={
                            actionLoading ||
                            quantityHeld === 0
                        }
                    >
                        SELL NIFTY
                    </button>

                </div>

            </section>

            {/* CHART */}

            <section className="chart-card">

                <div className="section-title">

                    <h2>
                        NIFTY Price Chart
                    </h2>

                    <span>
                        ● LIVE MARKET
                    </span>

                </div>

                <div className="chart">

                    <PriceChart
                        data={chartData}
                    />

                </div>

            </section>

            {/* BOT CONTROL */}

            <section className="control-panel">

                <div className="control-info">

                    <h2>
                        Bot Control
                    </h2>

                    <p>
                        Strategy:
                        <strong>
                            {" "}
                            EMA 20 + EMA 50 + RSI 14
                        </strong>
                    </p>

                    <p>
                        Stop Loss:
                        <strong> 2%</strong>
                        {" • "}
                        Take Profit:
                        <strong> 4%</strong>
                    </p>

                    <p>
                        Last Action:
                        <strong>
                            {" "}
                            {bot?.lastAction ||
                                "NONE"}
                        </strong>
                    </p>

                </div>

                <div className="buttons">

                    <button
                        className="start-btn"
                        onClick={startBot}
                        disabled={
                            bot?.running ||
                            actionLoading
                        }
                    >
                        START BOT
                    </button>

                    <button
                        className="stop-btn"
                        onClick={stopBot}
                        disabled={
                            !bot?.running ||
                            actionLoading
                        }
                    >
                        STOP BOT
                    </button>

                </div>

            </section>

            {/* CURRENT POSITION */}

            <section className="position-section">

                <div className="section-title">

                    <h2>
                        Current Position
                    </h2>

                    <span>
                        {quantityHeld > 0
                            ? "OPEN"
                            : "NO POSITION"}
                    </span>

                </div>

                <div className="position-grid">

                    <div>
                        <span>Symbol</span>

                        <strong>
                            NIFTY
                        </strong>
                    </div>

                    <div>
                        <span>Quantity</span>

                        <strong>
                            {quantityHeld}
                        </strong>
                    </div>

                    <div>
                        <span>Average Price</span>

                        <strong>
                            {money(averagePrice)}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Unrealized P&L
                        </span>

                        <strong
                            className={
                                unrealizedPnL >= 0
                                    ? "profit"
                                    : "loss"
                            }
                        >
                            {unrealizedPnL >= 0
                                ? "+"
                                : ""}
                            {money(unrealizedPnL)}
                        </strong>
                    </div>

                </div>

            </section>

            {/* RECENT TRADES */}

            <section className="position-section">

                <div className="section-title">

                    <h2>
                        Recent Trades
                    </h2>

                    <span>
                        {trades.length} TRADES
                    </span>

                </div>

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>
                                <th>Action</th>
                                <th>Symbol</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>P&L</th>
                            </tr>

                        </thead>

                        <tbody>

                            {trades.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="empty"
                                    >
                                        No trades yet
                                    </td>
                                </tr>

                            ) : (

                                trades
                                    .slice()
                                    .reverse()
                                    .map(
                                        (
                                            trade,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    trade.id ||
                                                    index
                                                }
                                            >

                                                <td
                                                    className={
                                                        trade.side ===
                                                        "BUY"
                                                            ? "trade-buy"
                                                            : "trade-sell"
                                                    }
                                                >
                                                    {trade.side ||
                                                        trade.action ||
                                                        "--"}
                                                </td>

                                                <td>
                                                    {trade.symbol ||
                                                        "NIFTY"}
                                                </td>

                                                <td>
                                                    {money(
                                                        trade.price
                                                    )}
                                                </td>

                                                <td>
                                                    {trade.quantity ||
                                                        0}
                                                </td>

                                                <td>
                                                    {money(
                                                        trade.value ??
                                                        trade.total ??
                                                        0
                                                    )}
                                                </td>

                                                <td
                                                    className={
                                                        Number(
                                                            trade.pnl ||
                                                                0
                                                        ) >= 0
                                                            ? "profit"
                                                            : "loss"
                                                    }
                                                >
                                                    {trade.pnl !==
                                                    undefined
                                                        ? money(
                                                              trade.pnl
                                                          )
                                                        : "--"}
                                                </td>

                                            </tr>

                                        )
                                    )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

            {/* FOOTER */}

            <footer>
                Trading Bot • Paper Trading Environment
            </footer>

        </div>
    );
}

export default App;