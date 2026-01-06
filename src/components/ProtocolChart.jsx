import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, PieChart as PieIcon } from "lucide-react";

const ProtocolChart = ({ data }) => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#FF6B9D",
    "#C49BFF",
    "#4ADE80",
  ];

  const chartData = useMemo(() => {
    return Object.entries(data)
      .map(([name, count]) => ({ name, count, percentage: 0 }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const totalPackets = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.count, 0);
  }, [chartData]);

  const chartDataWithPercentage = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      percentage: ((item.count / totalPackets) * 100).toFixed(1),
    }));
  }, [chartData, totalPackets]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Count:{" "}
            <span className="font-mono font-medium">
              {payload[0].value.toLocaleString()}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage:{" "}
            <span className="font-mono font-medium">
              {payload[0].payload.percentage}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
    name,
  }) => {
    if (parseFloat(percentage) < 5) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Most Common</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {chartDataWithPercentage[0]?.name}
          </p>
          <p className="text-sm text-gray-600">
            {chartDataWithPercentage[0]?.count.toLocaleString()} packets
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-700">Protocol Types</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {chartDataWithPercentage.length}
          </p>
          <p className="text-sm text-gray-600">Unique protocols</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-700">Total Packets</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {totalPackets.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">All protocols</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Protocol Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartDataWithPercentage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {chartDataWithPercentage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Packet Count by Protocol
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataWithPercentage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Protocol Table */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Protocol Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Protocol
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Packet Count
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Percentage
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Visual
                </th>
              </tr>
            </thead>
            <tbody>
              {chartDataWithPercentage.map((item, index) => (
                <tr
                  key={item.name}
                  className="border-b border-gray-100 hover:bg-white transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-bold text-gray-400">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-gray-900">
                    {item.count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-gray-900">
                    {item.percentage}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Protocol Descriptions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">
          Protocol Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-blue-900">TCP:</span>
            <span className="text-blue-800 ml-2">
              Transmission Control Protocol - Reliable connection-oriented
              protocol
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">UDP:</span>
            <span className="text-blue-800 ml-2">
              User Datagram Protocol - Fast connectionless protocol
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">DNS:</span>
            <span className="text-blue-800 ml-2">
              Domain Name System - Translates domain names to IP addresses
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">HTTP/HTTPS:</span>
            <span className="text-blue-800 ml-2">
              Web traffic protocol (encrypted with HTTPS)
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">ICMP:</span>
            <span className="text-blue-800 ml-2">
              Internet Control Message Protocol - Network diagnostics (ping)
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">ARP:</span>
            <span className="text-blue-800 ml-2">
              Address Resolution Protocol - Maps IP to MAC addresses
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolChart;
