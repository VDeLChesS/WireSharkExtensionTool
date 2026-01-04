/**
 * Network utility functions for IP address manipulation and network analysis
 */

/**
 * Check if an IP address is a private IP
 * @param {string} ip - IP address to check
 * @returns {boolean} True if private IP
 */
export const isPrivateIP = (ip) => {
    if (!ip) return false;
    
  // IPv4 private ranges
    const ipv4Patterns = [
        /^127\./,           // Loopback
        /^10\./,            // Class A private
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Class B private
        /^192\.168\./,      // Class C private
        /^169\.254\./       // Link-local
    ];
    
  // IPv6 private patterns
    const ipv6Patterns = [
        /^::1$/,            // Loopback
        /^fe80:/,           // Link-local
        /^fc00:/,           // Unique local
        /^fd00:/            // Unique local
    ];
    
    return ipv4Patterns.some(pattern => pattern.test(ip)) ||ipv6Patterns.some(pattern => pattern.test(ip));
};

/**
 * Check if an IP address is IPv6
 * @param {string} ip - IP address to check
 * @returns {boolean} True if IPv6
 */
export const isIPv6 = (ip) => {
    return ip && ip.includes(':');
};

/**
 * Check if an IP address is IPv4
 * @param {string} ip - IP address to check
 * @returns {boolean} True if IPv4
 */
export const isIPv4 = (ip) => {
    return ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
};

/**
 * Format IP address for display
 * @param {string} ip - IP address
 * @returns {string} Formatted IP address
 */
export const formatIP = (ip) => {
    if (!ip) return 'Unknown';
    
  // Truncate long IPv6 addresses
    if (isIPv6(ip) && ip.length > 30) {
        return ip.substring(0, 27) + '...';
    }
    
    return ip;
};

/**
 * Get IP address type description
 * @param {string} ip - IP address
 * @returns {string} Description of IP type
 */
export const getIPType = (ip) => {
  if (!ip) return 'Unknown';
  
  if (ip === '127.0.0.1' || ip === '::1') {
    return 'Loopback';
  }
  
  if (isPrivateIP(ip)) {
    return isIPv6(ip) ? 'Private IPv6' : 'Private IPv4';
  }
  
  if (ip.startsWith('224.') || ip.startsWith('ff')) {
    return 'Multicast';
  }
  
  if (ip.startsWith('255.')) {
    return 'Broadcast';
  }
  
  return isIPv6(ip) ? 'Public IPv6' : 'Public IPv4';
};

/**
 * Extract port from connection string
 * @param {string} connection - Connection string (e.g., "192.168.1.1:8080")
 * @returns {number|null} Port number or null
 */
export const extractPort = (connection) => {
  if (!connection) return null;
  
  const parts = connection.split(':');
  const port = parseInt(parts[parts.length - 1]);
  
  return isNaN(port) ? null : port;
};

/**
 * Get port service name
 * @param {number} port - Port number
 * @returns {string} Service name or port number
 */
export const getPortService = (port) => {
  const services = {
    20: 'FTP-DATA',
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    67: 'DHCP',
    68: 'DHCP',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    465: 'SMTPS',
    587: 'SMTP',
    993: 'IMAPS',
    995: 'POP3S',
    1433: 'MSSQL',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC',
    6379: 'Redis',
    7680: 'Teredo',
    8080: 'HTTP-Alt',
    8443: 'HTTPS-Alt',
    27017: 'MongoDB'
  };
  
  return services[port] || `Port ${port}`;
};

/**
 * Calculate network mask CIDR from subnet mask
 * @param {string} mask - Subnet mask (e.g., "255.255.255.0")
 * @returns {number} CIDR notation
 */
export const maskToCIDR = (mask) => {
  if (!mask) return 0;
  
  const parts = mask.split('.');
  let cidr = 0;
  
  parts.forEach(part => {
    const num = parseInt(part);
    cidr += (num >>> 0).toString(2).split('1').length - 1;
  });
  
  return cidr;
};

/**
 * Parse TCP flags from info string
 * @param {string} info - Packet info string
 * @returns {Object} Parsed flags
 */
export const parseTCPFlags = (info) => {
  if (!info) return {};
  
  return {
    syn: info.includes('[SYN]'),
    ack: info.includes('[ACK]'),
    fin: info.includes('[FIN]'),
    rst: info.includes('[RST]'),
    psh: info.includes('[PSH]'),
    urg: info.includes('[URG]')
  };
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format time duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)}ms`;
  }
  
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Calculate packets per second
 * @param {number} packets - Number of packets
 * @param {number} duration - Duration in seconds
 * @returns {number} Packets per second
 */
export const calculatePPS = (packets, duration) => {
  if (duration === 0) return 0;
  return packets / duration;
};

/**
 * Calculate bandwidth (bits per second)
 * @param {number} bytes - Number of bytes
 * @param {number} duration - Duration in seconds
 * @returns {number} Bits per second
 */
export const calculateBandwidth = (bytes, duration) => {
  if (duration === 0) return 0;
  return (bytes * 8) / duration;
};

/**
 * Format bandwidth to human readable format
 * @param {number} bps - Bits per second
 * @returns {string} Formatted string
 */
export const formatBandwidth = (bps) => {
  if (bps === 0) return '0 bps';
  
  const k = 1000;
  const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
  
  const i = Math.floor(Math.log(bps) / Math.log(k));
  
  return parseFloat((bps / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if port is in well-known range
 * @param {number} port - Port number
 * @returns {boolean} True if well-known port
 */
export const isWellKnownPort = (port) => {
  return port >= 0 && port <= 1023;
};

/**
 * Check if port is registered
 * @param {number} port - Port number
 * @returns {boolean} True if registered port
 */
export const isRegisteredPort = (port) => {
  return port >= 1024 && port <= 49151;
};

/**
 * Check if port is dynamic/private
 * @param {number} port - Port number
 * @returns {boolean} True if dynamic port
 */
export const isDynamicPort = (port) => {
  return port >= 49152 && port <= 65535;
};

/**
 * Get port range description
 * @param {number} port - Port number
 * @returns {string} Port range description
 */
export const getPortRange = (port) => {
  if (isWellKnownPort(port)) return 'Well-Known';
  if (isRegisteredPort(port)) return 'Registered';
  if (isDynamicPort(port)) return 'Dynamic/Private';
  return 'Invalid';
};

/**
 * Validate IP address format
 * @param {string} ip - IP address
 * @returns {boolean} True if valid
 */
export const isValidIP = (ip) => {
  if (!ip) return false;
  
  // IPv4 validation
  if (isIPv4(ip)) {
    const parts = ip.split('.');
    return parts.length === 4 && parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  }
  
  // IPv6 validation (simplified)
    if (isIPv6(ip)) {
        return /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip);
    }
    
    return false;
};

export default {
    isPrivateIP,
    isIPv6,
    isIPv4,
    formatIP,
    getIPType,
    extractPort,
    getPortService,
    maskToCIDR,
    parseTCPFlags,
    formatBytes,
    formatDuration,
    calculatePPS,
    calculateBandwidth,
    formatBandwidth,
    isWellKnownPort,
    isRegisteredPort,
    isDynamicPort,
    getPortRange,
    isValidIP
};