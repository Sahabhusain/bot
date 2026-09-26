import { useEffect, useState } from "react";
import axios from "axios";
import PriceChart from "./components/PriceChart";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
    const [market, setMarket] = useState(null);
    const [bot, setBot] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [trades, setTrades] = useState([]);
    const [chartData, setChartData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    // ==========================================
    // FETCH ALL DATA
    // ==========================================

    const fetchData = async () => {
        try {
            setError("");

            const marketResponse = await axios.get(
                `${API}/market`
            );

            const botResponse = await axios.get(
                `${API}/bot/status`
            );

            const marketData =
                marketResponse.data.data;

            setMarket(marketData);
            setBot(botResponse.data.data);

            // Portfolio
            const portfolioResponse =
                await axios.get(
                    `${API}/portfolio?price=${marketData.price}`
                );

            setPortfolio(
                portfolioResponse.data.data
            );

            // Trades
            const tradesResponse =
                await axios.get(
                    `${API}/portfolio/trades`
                );

            setTrades(
                tradesResponse.data.data || []
            );

            // Chart
            setChartData((previous) => {
                const newPoint = {
                    time: new Date().toLocaleTimeString(),
                    price: marketData.price,
                };

                const updated = [
                    ...previous,
                    newPoint,
                ];

                return updated.slice(-30);
            });

            setLoading(false);
        } catch (err) {
            console.error(
                "Trading Bot API Error:",
                err
            );

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Unknown connection error";

            setError(
                `API Error: ${message}`
            );

            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD + LIVE UPDATE
    // ==========================================

    useEffect(() => {
        fetchData();

        const interval = setInterval(
            fetchData,
            5000
        );

        return () => clearInterval(interval);
    }, []);

    // ==========================================
    // START BOT
    // ==========================================

    const startBot = async () => {
        try {
            setActionLoading(true);
            setError("");

            await axios.post(
                `${API}/bot/start`
            );

            await fetchData();
        } catch (err) {
            console.error(err);

            setError(
                `Start Bot Error: ${
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to start bot"
                }`
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

            await axios.post(
                `${API}/bot/stop`
            );

            await fetchData();
        } catch (err) {
            console.error(err);

            setError(
                `Stop Bot Error: ${
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to stop bot"
                }`
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
                    <h2>
                        Connecting to Trading Bot...
                    </h2>

                    <p>
                        Connecting to localhost:5000
                    </p>
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
                    <h2>
                        Unable to connect to Trading Bot
                    </h2>

                    <p
                        style={{
                            color: "#f87171",
                            marginTop: "10px",
                        }}
                    >
                        {error}
                    </p>

                    <button
                        onClick={retryConnection}
                        className="start-btn"
                        style={{
                            marginTop: "20px",
                        }}
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

    const price =
        market?.price || 0;

    const change =
        market?.change || 0;

    const changePercent =
        market?.changePercent || 0;

    const totalValue =
        portfolio?.totalValue || 0;

    const cash =
        portfolio?.cash || 0;

    const totalPnL =
        portfolio?.totalPnL || 0;

    const realizedPnL =
        portfolio?.realizedPnL || 0;

    const quantity =
        portfolio?.position?.quantity || 0;

    const averagePrice =
        portfolio?.position?.averagePrice || 0;

    const unrealizedPnL =
        portfolio?.unrealizedPnL || 0;

    const signal =
        bot?.lastSignal || "HOLD";

    // ==========================================
    // FORMATTERS
    // ==========================================

    const money = (value) =>
        `₹${Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;

    const number = (value) =>
        Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="app">

            {/* HEADER */}

            <header className="header">

                <div className="brand">
                    <h1>
                        Trading Bot
                    </h1>

                    <p>
                        Algorithmic Paper Trading
                        Dashboard
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
                        marginBottom: "20px",
                        fontSize: "13px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* KPI CARDS */}

            <section className="cards">

                {/* MARKET */}

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
                        {change >= 0
                            ? "+"
                            : ""}
                        {number(change)}
                        {" "}
                        (
                        {changePercent >= 0
                            ? "+"
                            : ""}
                        {changePercent}
                        %)
                    </div>

                </div>

                {/* PORTFOLIO */}

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

                {/* PNL */}

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
                        {totalPnL >= 0
                            ? "+"
                            : ""}
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

                {/* SIGNAL */}

                <div className="card">

                    <div className="card-label">
                        Trading Signal
                    </div>

                    <div
                        className={`signal ${
                            signal.toLowerCase()
                        }`}
                    >
                        {signal}
                    </div>

                    <div className="muted">
                        Price: {money(price)}
                    </div>

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
                        {quantity > 0
                            ? "OPEN"
                            : "NO POSITION"}
                    </span>

                </div>

                <div className="position-grid">

                    <div>
                        <span>
                            Symbol
                        </span>

                        <strong>
                            NIFTY
                        </strong>
                    </div>

                    <div>
                        <span>
                            Quantity
                        </span>

                        <strong>
                            {quantity}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Average Price
                        </span>

                        <strong>
                            {money(
                                averagePrice
                            )}
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
                            {money(
                                unrealizedPnL
                            )}
                        </strong>
                    </div>

                </div>

            </section>

            {/* TRADES */}

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
                                <th>
                                    Action
                                </th>

                                <th>
                                    Symbol
                                </th>

                                <th>
                                    Price
                                </th>

                                <th>
                                    Quantity
                                </th>

                                <th>
                                    Total
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {trades.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="empty"
                                    >
                                        No trades yet
                                    </td>
                                </tr>
                            ) : (
                                trades.map(
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
                                                    trade.action ===
                                                    "BUY"
                                                        ? "trade-buy"
                                                        : "trade-sell"
                                                }
                                            >
                                                {
                                                    trade.action
                                                }
                                            </td>

                                            <td>
                                                {
                                                    trade.symbol ||
                                                    "NIFTY"
                                                }
                                            </td>

                                            <td>
                                                {money(
                                                    trade.price ||
                                                        0
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    trade.quantity ||
                                                    0
                                                }
                                            </td>

                                            <td>
                                                {money(
                                                    trade.total ||
                                                        0
                                                )}
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
                Trading Bot • Paper Trading
                Environment
            </footer>

        </div>
    );
}

export default App;