import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function PriceChart({ data = [] }) {
    return (
        <div className="professional-chart">

            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 5,
                    }}
                >

                    <CartesianGrid
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        tick={{
                            fill: "#64748b",
                            fontSize: 11,
                        }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />

                    <YAxis
                        domain={["auto", "auto"]}
                        stroke="#64748b"
                        tick={{
                            fill: "#64748b",
                            fontSize: 11,
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={65}
                        tickFormatter={(value) =>
                            `₹${Number(value).toLocaleString("en-IN")}`
                        }
                    />

                    <Tooltip
                        contentStyle={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "10px",
                            color: "#f8fafc",
                        }}
                        labelStyle={{
                            color: "#94a3b8",
                            marginBottom: "5px",
                        }}
                        formatter={(value) => [
                            `₹${Number(value).toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}`,
                            "NIFTY",
                        ]}
                    />

                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#ffffff",
                        }}
                        isAnimationActive={true}
                        animationDuration={500}
                    />

                </LineChart>
            </ResponsiveContainer>

        </div>
    );
}

export default PriceChart;