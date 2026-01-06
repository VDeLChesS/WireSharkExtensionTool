import React, { useState, useMemo } from "react";
import {
  Activity,
  Network,
  AlertCircle,
  Info,
  Shield,
  TrendingUp,
  FileText,
  RefreshCw,
} from "lucide-react";
import PacketTable from "./PacketTable";
import ProtocolChart from "./ProtocolChart";
import ConnectionFlow from "./ConnectionFlow";

const WiresharkAnalyzer = ({
  logs,
  comparisonData,
  selectedLog,
  onSelectLog,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const currentData = logs[selectedLog];

  if (!currentData) return null;

  const { statistics, report, fileName } = currentData;
  const isMultiLog = logs.length > 1;

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "protocols", label: "Protocols", icon: Network },
    { id: "connections", label: "Connections", icon: Activity },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "security", label: "Security", icon: Shield },
    { id: "packets", label: "Packet Details", icon: FileText },
  ];

  // Add comparison tab if multiple logs
  if (isMultiLog && comparisonData) {
    tabs.splice(1, 0, { id: "comparison", label: "Comparison", icon: Network });
  }

  const securitySeverityColors = {
    HIGH: "bg-red-100 text-red-800 border-red-300",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
    LOW: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Wireshark Log Analysis
                </h1>
                <p className="text-sm text-gray-600 mt-1">{fileName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {logs.map((log, index) => (
                <button
                  key={index}
                  onClick={() => onSelectLog(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedLog === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  File {index + 1}
                </button>
              ))}
              <button
                onClick={onReset}
                className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                New Analysis
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-700">Total Packets</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {statistics.totalPackets.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-700">Protocols</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {Object.keys(statistics.protocols).length}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">Avg Packet Size</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {statistics.avgPacketSize} B
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-700">Security Issues</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {report.security.issuesFound}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Comparison Tab */}
            {activeTab === "comparison" && comparisonData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Total Files
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {comparisonData.totalLogs}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Total Packets
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      {comparisonData.summary.totalPackets.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Unique Protocols
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {comparisonData.summary.uniqueProtocols.size}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Security Issues
                    </h3>
                    <p className="text-3xl font-bold text-orange-600">
                      {comparisonData.securityIssues.length}
                    </p>
                  </div>
                </div>

                {/* Similarities */}
                {comparisonData.similarities.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Similarities Across Files
                    </h3>
                    <div className="space-y-2">
                      {comparisonData.similarities.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded p-3 border border-green-200"
                        >
                          <p className="text-sm font-medium text-green-900">
                            {item.description}
                          </p>
                          {item.ips && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.ips.map((ip, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-mono"
                                >
                                  {ip}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Differences */}
                {comparisonData.differences.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Differences Between Files
                    </h3>
                    <div className="space-y-2">
                      {comparisonData.differences.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded p-3 border border-blue-200"
                        >
                          <p className="text-sm font-medium text-blue-900">
                            {item.description}
                          </p>
                          {item.details && (
                            <div className="mt-2 space-y-1">
                              {item.details.map((detail, i) => (
                                <div
                                  key={i}
                                  className="text-xs text-blue-800 flex items-center justify-between"
                                >
                                  <span className="font-medium">
                                    {detail.fileName}:
                                  </span>
                                  <span className="font-mono">
                                    {detail.count} packets
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inconsistencies */}
                {comparisonData.inconsistencies.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Inconsistencies Detected
                    </h3>
                    <div className="space-y-2">
                      {comparisonData.inconsistencies.map((item, idx) => (
                        <div
                          key={idx}
                          className={`rounded p-3 border ${
                            item.severity === "HIGH"
                              ? "bg-red-50 border-red-200"
                              : item.severity === "MEDIUM"
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-medium">
                              {item.description}
                            </p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                item.severity === "HIGH"
                                  ? "bg-red-100 text-red-800"
                                  : item.severity === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.severity}
                            </span>
                          </div>
                          {item.details &&
                            typeof item.details === "object" &&
                            !Array.isArray(item.details) && (
                              <p className="text-xs font-mono">
                                {JSON.stringify(item.details, null, 2)}
                              </p>
                            )}
                          {Array.isArray(item.details) && (
                            <div className="mt-2 space-y-1">
                              {item.details.map((detail, i) => (
                                <div
                                  key={i}
                                  className="text-xs flex items-center justify-between"
                                >
                                  <span>{detail.fileName}:</span>
                                  <span className="font-mono">
                                    {detail.avgSize} bytes avg
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aggregated Security Issues */}
                {comparisonData.securityIssues.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Issues Across All Files
                    </h3>
                    <div className="space-y-2">
                      {comparisonData.securityIssues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded p-3 border border-red-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-red-900">
                                {issue.type}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                File: {issue.fileName}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                issue.severity === "HIGH"
                                  ? "bg-red-100 text-red-800"
                                  : issue.severity === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm text-red-800">
                            {issue.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Network Overview
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unique Sources:</span>
                        <span className="font-mono font-medium">
                          {report.overview.uniqueSources}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Unique Destinations:
                        </span>
                        <span className="font-mono font-medium">
                          {report.overview.uniqueDestinations}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Span:</span>
                        <span className="font-mono font-medium">
                          {(
                            report.overview.timeSpan.end -
                            report.overview.timeSpan.start
                          ).toFixed(2)}
                          s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Data:</span>
                        <span className="font-mono font-medium">
                          {(statistics.totalBytes / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Connection Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Total Connections:
                        </span>
                        <span className="font-mono font-medium">
                          {report.connections.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Established:</span>
                        <span className="font-mono font-medium text-green-600">
                          {report.connections.established}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Closed:</span>
                        <span className="font-mono font-medium text-blue-600">
                          {report.connections.closed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-mono font-medium">
                          {(
                            (report.connections.established /
                              report.connections.total) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Top Talkers
                  </h3>
                  <div className="space-y-2">
                    {report.topTalkers.slice(0, 5).map((talker, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">
                            #{idx + 1}
                          </span>
                          <span className="font-mono text-sm">{talker.ip}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-right">
                            <div className="text-gray-600">Sent</div>
                            <div className="font-medium">
                              {(talker.sentBytes / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-600">Received</div>
                            <div className="font-medium">
                              {(talker.receivedBytes / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Protocols Tab */}
            {activeTab === "protocols" && (
              <div className="space-y-6">
                <ProtocolChart data={statistics.protocols} />
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === "connections" && (
              <div className="space-y-6">
                <ConnectionFlow connections={report.connections.details} />
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Throughput Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <div className="text-gray-600 text-sm">
                        Average Throughput
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {(report.performance.averageThroughput / 1024).toFixed(
                          2,
                        )}{" "}
                        KB/s
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <div className="text-gray-600 text-sm">
                        Peak Throughput
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {report.performance.peakThroughput
                          ? (
                              report.performance.peakThroughput.bytesPerSecond /
                              1024
                            ).toFixed(2)
                          : "0"}{" "}
                        KB/s
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <div className="text-gray-600 text-sm">Total Data</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {(statistics.totalBytes / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {report.security.issuesFound === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      No Security Issues Detected
                    </h3>
                    <p className="text-green-700">
                      Your network traffic appears normal and secure.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {report.security.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`border-l-4 rounded-lg p-4 ${securitySeverityColors[issue.severity]}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <h4 className="font-semibold">{issue.type}</h4>
                          </div>
                          <span className="px-2 py-1 rounded text-xs font-medium">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{issue.description}</p>
                        <div className="text-xs font-mono">
                          {issue.source && <div>Source: {issue.source}</div>}
                          {issue.destination && (
                            <div>Destination: {issue.destination}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {report.dns && report.dns.totalQueries > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      DNS Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-gray-600 text-sm">
                          Total Queries
                        </div>
                        <div className="text-xl font-bold">
                          {report.dns.totalQueries}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-gray-600 text-sm">
                          Unique Domains
                        </div>
                        <div className="text-xl font-bold">
                          {report.dns.uniqueDomains.length}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Queried Domains:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.dns.uniqueDomains
                          .slice(0, 10)
                          .map((domain, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {domain}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Packet Details Tab */}
            {activeTab === "packets" && (
              <PacketTable packets={currentData.packets} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WiresharkAnalyzer;
