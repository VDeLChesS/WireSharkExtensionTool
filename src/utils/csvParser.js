import Papa from 'papaparse';

/**
 * Parse Wireshark CSV export file
 * @param {string} csvText - Raw CSV text content
 * @returns {Object} Parsed packet data
 */
export const parseWiresharkCSV = (csvText) => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header) => header.trim().replace(/"/g, '')
  });

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
  }

  return {
    packets: result.data,
    meta: result.meta,
    errors: result.errors
  };
};

/**
 * Extract basic statistics from parsed packets
 * @param {Array} packets - Array of packet objects
 * @returns {Object} Statistics object
 */
export const extractStatistics = (packets) => {
  const stats = {
    totalPackets: packets.length,
    protocols: {},
    sources: {},
    destinations: {},
    timeRange: { start: null, end: null },
    avgPacketSize: 0,
    totalBytes: 0
  };

  packets.forEach((packet) => {
    // Count protocols
    const protocol = packet.Protocol || 'Unknown';
    stats.protocols[protocol] = (stats.protocols[protocol] || 0) + 1;

    // Count sources
    const source = packet.Source || 'Unknown';
    stats.sources[source] = (stats.sources[source] || 0) + 1;

    // Count destinations
    const destination = packet.Destination || 'Unknown';
    stats.destinations[destination] = (stats.destinations[destination] || 0) + 1;

    // Calculate bytes
    const length = parseInt(packet.Length) || 0;
    stats.totalBytes += length;

    // Time range
    const time = parseFloat(packet.Time) || 0;
    if (stats.timeRange.start === null || time < stats.timeRange.start) {
      stats.timeRange.start = time;
    }
    if (stats.timeRange.end === null || time > stats.timeRange.end) {
      stats.timeRange.end = time;
    }
  });

  stats.avgPacketSize = stats.totalPackets > 0 
    ? Math.round(stats.totalBytes / stats.totalPackets) 
    : 0;

  return stats;
};

/**
 * Filter packets by protocol
 * @param {Array} packets - Array of packet objects
 * @param {string} protocol - Protocol to filter by
 * @returns {Array} Filtered packets
 */
export const filterByProtocol = (packets, protocol) => {
  return packets.filter(p => p.Protocol === protocol);
};

/**
 * Filter packets by IP address (source or destination)
 * @param {Array} packets - Array of packet objects
 * @param {string} ipAddress - IP address to filter by
 * @returns {Array} Filtered packets
 */
export const filterByIP = (packets, ipAddress) => {
  return packets.filter(
    p => p.Source === ipAddress || p.Destination === ipAddress
  );
};

/**
 * Group packets by connection (source:port -> destination:port)
 * @param {Array} packets - Array of packet objects
 * @returns {Object} Grouped connections
 */
export const groupByConnection = (packets) => {
  const connections = {};

  packets.forEach((packet) => {
    const info = packet.Info || '';
    const portMatch = info.match(/(\d+)\s*>\s*(\d+)/);
    
    if (portMatch) {
      const [, srcPort, dstPort] = portMatch;
      const key = `${packet.Source}:${srcPort} -> ${packet.Destination}:${dstPort}`;
      
      if (!connections[key]) {
        connections[key] = {
          source: packet.Source,
          srcPort,
          destination: packet.Destination,
          dstPort,
          packets: [],
          totalBytes: 0
        };
      }
      
      connections[key].packets.push(packet);
      connections[key].totalBytes += parseInt(packet.Length) || 0;
    }
  });

  return connections;
};

/**
 * Detect TCP connection issues (retransmissions, resets, etc.)
 * @param {Array} packets - Array of packet objects
 * @returns {Array} Issues found
 */
export const detectConnectionIssues = (packets) => {
  const issues = [];

  packets.forEach((packet, index) => {
    const info = packet.Info || '';
    
    if (info.includes('Retransmission')) {
      issues.push({
        packetNo: packet.No,
        type: 'TCP Retransmission',
        source: packet.Source,
        destination: packet.Destination,
        time: packet.Time,
        description: 'Packet was retransmitted, indicating possible network congestion or packet loss'
      });
    }
    
    if (info.includes('[RST')) {
      issues.push({
        packetNo: packet.No,
        type: 'TCP Reset',
        source: packet.Source,
        destination: packet.Destination,
        time: packet.Time,
        description: 'Connection was reset, possibly due to application error or firewall'
      });
    }
    
    if (info.includes('Dup ACK')) {
      issues.push({
        packetNo: packet.No,
        type: 'Duplicate ACK',
        source: packet.Source,
        destination: packet.Destination,
        time: packet.Time,
        description: 'Duplicate acknowledgment received, indicating missing packets'
      });
    }
  });

  return issues;
};

export default {
  parseWiresharkCSV,
  extractStatistics,
  filterByProtocol,
  filterByIP,
  groupByConnection,
  detectConnectionIssues
};