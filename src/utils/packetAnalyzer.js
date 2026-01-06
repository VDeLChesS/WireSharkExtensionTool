import _ from "lodash";

/**
 * Analyze TCP handshakes in packet data
 * @param {Array} packets - Array of packet objects
 * @returns {Array} Array of TCP connections with handshake status
 */
export const analyzeTCPHandshakes = (packets) => {
  const tcpPackets = packets.filter((p) => p.Protocol === "TCP");
  const connections = {};

  tcpPackets.forEach((packet) => {
    const info = packet.Info || "";
    const portMatch = info.match(/(\d+)\s*>\s*(\d+)/);

    if (!portMatch) return;

    const [, srcPort, dstPort] = portMatch;
    const connKey = `${packet.Source}:${srcPort}-${packet.Destination}:${dstPort}`;

    if (!connections[connKey]) {
      connections[connKey] = {
        source: `${packet.Source}:${srcPort}`,
        destination: `${packet.Destination}:${dstPort}`,
        syn: false,
        synAck: false,
        ack: false,
        established: false,
        fin: false,
        closed: false,
        packets: [],
      };
    }

    const conn = connections[connKey];
    conn.packets.push(packet);

    // Check flags
    if (info.includes("[SYN]") && !info.includes("ACK")) {
      conn.syn = true;
    }
    if (info.includes("[SYN, ACK]")) {
      conn.synAck = true;
    }
    if (info.includes("[ACK]") && conn.synAck && !conn.established) {
      conn.ack = true;
      conn.established = true;
    }
    if (info.includes("[FIN")) {
      conn.fin = true;
    }
    if (conn.fin && info.includes("[ACK]")) {
      conn.closed = true;
    }
  });

  return Object.values(connections);
};

/**
 * Calculate network throughput over time
 * @param {Array} packets - Array of packet objects
 * @param {number} intervalSeconds - Time interval for grouping (default: 1 second)
 * @returns {Array} Throughput data points
 */
export const calculateThroughput = (packets, intervalSeconds = 1) => {
  const grouped = _.groupBy(packets, (packet) => {
    const time = parseFloat(packet.Time) || 0;
    return Math.floor(time / intervalSeconds);
  });

  return Object.entries(grouped)
    .map(([interval, pkts]) => {
      const totalBytes = pkts.reduce(
        (sum, p) => sum + (parseInt(p.Length) || 0),
        0,
      );
      const timeStart = parseInt(interval) * intervalSeconds;

      return {
        time: timeStart,
        bytes: totalBytes,
        packets: pkts.length,
        bytesPerSecond: totalBytes / intervalSeconds,
        packetsPerSecond: pkts.length / intervalSeconds,
      };
    })
    .sort((a, b) => a.time - b.time);
};

/**
 * Identify top talkers (most active IP addresses)
 * @param {Array} packets - Array of packet objects
 * @param {number} limit - Number of top talkers to return
 * @returns {Array} Top talkers with statistics
 */
export const identifyTopTalkers = (packets, limit = 10) => {
  const ipStats = {};

  packets.forEach((packet) => {
    const source = packet.Source;
    const destination = packet.Destination;
    const length = parseInt(packet.Length) || 0;

    // Track source stats
    if (!ipStats[source]) {
      ipStats[source] = {
        ip: source,
        sentPackets: 0,
        sentBytes: 0,
        receivedPackets: 0,
        receivedBytes: 0,
      };
    }
    ipStats[source].sentPackets++;
    ipStats[source].sentBytes += length;

    // Track destination stats
    if (!ipStats[destination]) {
      ipStats[destination] = {
        ip: destination,
        sentPackets: 0,
        sentBytes: 0,
        receivedPackets: 0,
        receivedBytes: 0,
      };
    }
    ipStats[destination].receivedPackets++;
    ipStats[destination].receivedBytes += length;
  });

  const sorted = Object.values(ipStats)
    .map((stats) => ({
      ...stats,
      totalPackets: stats.sentPackets + stats.receivedPackets,
      totalBytes: stats.sentBytes + stats.receivedBytes,
    }))
    .sort((a, b) => b.totalBytes - a.totalBytes)
    .slice(0, limit);

  return sorted;
};

/**
 * Analyze DNS queries and responses
 * @param {Array} packets - Array of packet objects
 * @returns {Object} DNS analysis results
 */
export const analyzeDNS = (packets) => {
  const dnsPackets = packets.filter((p) => p.Protocol === "DNS");
  const queries = [];
  const responses = [];

  dnsPackets.forEach((packet) => {
    const info = packet.Info || "";

    if (info.includes("Standard query")) {
      const queryMatch = info.match(/Standard query\s+\S+\s+(\w+)\s+(.+)/);
      if (queryMatch) {
        queries.push({
          packetNo: packet.No,
          time: packet.Time,
          type: queryMatch[1],
          domain: queryMatch[2],
          source: packet.Source,
        });
      }
    }

    if (info.includes("response")) {
      responses.push({
        packetNo: packet.No,
        time: packet.Time,
        info: info,
        source: packet.Source,
      });
    }
  });

  return {
    totalQueries: queries.length,
    totalResponses: responses.length,
    queries,
    responses,
    uniqueDomains: [...new Set(queries.map((q) => q.domain))],
    queryTypes: _.countBy(queries, "type"),
  };
};

/**
 * Detect potential security issues
 * @param {Array} packets - Array of packet objects
 * @returns {Array} Security concerns found
 */
export const detectSecurityIssues = (packets) => {
  const issues = [];

  // Check for port scanning behavior
  const portScans = {};
  packets.forEach((packet) => {
    if (packet.Protocol === "TCP") {
      const info = packet.Info || "";
      if (info.includes("[SYN]")) {
        const key = packet.Source;
        if (!portScans[key]) {
          portScans[key] = new Set();
        }
        const portMatch = info.match(/>\s*(\d+)/);
        if (portMatch) {
          portScans[key].add(portMatch[1]);
        }
      }
    }
  });

  Object.entries(portScans).forEach(([ip, ports]) => {
    if (ports.size > 20) {
      issues.push({
        type: "Potential Port Scan",
        severity: "HIGH",
        source: ip,
        description: `Source IP scanned ${ports.size} different ports`,
        portsScanned: ports.size,
      });
    }
  });

  // Check for unusual protocols
  const protocolCounts = _.countBy(packets, "Protocol");
  Object.entries(protocolCounts).forEach(([protocol, count]) => {
    if (["ICMP", "ICMPv6"].includes(protocol) && count > 50) {
      issues.push({
        type: "High ICMP Traffic",
        severity: "MEDIUM",
        protocol,
        description: `Detected ${count} ${protocol} packets, could indicate network scanning or DDoS`,
        packetCount: count,
      });
    }
  });

  // Check for failed connection attempts
  const failedConnections = packets.filter(
    (p) => p.Info && p.Info.includes("Retransmission"),
  );

  if (failedConnections.length > 10) {
    const destinations = _.countBy(failedConnections, "Destination");
    Object.entries(destinations).forEach(([dest, count]) => {
      if (count > 5) {
        issues.push({
          type: "Multiple Failed Connections",
          severity: "MEDIUM",
          destination: dest,
          description: `${count} retransmissions to ${dest}, service may be unreachable`,
          retransmissionCount: count,
        });
      }
    });
  }

  return issues;
};

/**
 * Generate a comprehensive summary report
 * @param {Array} packets - Array of packet objects
 * @returns {Object} Complete analysis report
 */
export const generateSummaryReport = (packets) => {
  const tcpConnections = analyzeTCPHandshakes(packets);
  const throughput = calculateThroughput(packets, 5); // 5-second intervals
  const topTalkers = identifyTopTalkers(packets, 5);
  const dnsAnalysis = analyzeDNS(packets);
  const securityIssues = detectSecurityIssues(packets);

  const protocolDist = _.countBy(packets, "Protocol");
  const uniqueSources = new Set(packets.map((p) => p.Source)).size;
  const uniqueDestinations = new Set(packets.map((p) => p.Destination)).size;
  return {
    overview: {
      totalPackets: packets.length,
      uniqueSources,
      uniqueDestinations,
      protocolDistribution: protocolDist,
      timeSpan: {
        start: Math.min(...packets.map((p) => parseFloat(p.Time) || 0)),
        end: Math.max(...packets.map((p) => parseFloat(p.Time) || 0)),
      },
    },
    connections: {
      total: tcpConnections.length,
      established: tcpConnections.filter((c) => c.established).length,
      closed: tcpConnections.filter((c) => c.closed).length,
      details: tcpConnections,
    },
    performance: {
      throughput,
      averageThroughput: _.meanBy(throughput, "bytesPerSecond"),
      peakThroughput: _.maxBy(throughput, "bytesPerSecond"),
    },
    topTalkers,
    dns: dnsAnalysis,
    security: {
      issuesFound: securityIssues.length,
      issues: securityIssues,
    },
  };
};

export default {
  analyzeTCPHandshakes,
  calculateThroughput,
  identifyTopTalkers,
  analyzeDNS,
  detectSecurityIssues,
  generateSummaryReport,
};
