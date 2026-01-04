

# Wireshark Log Analyzer


A powerful, interactive web-based tool for analyzing Wireshark packet capture files. Built with React, this application provides comprehensive network traffic analysis, visualization, and security insights.
Features


### 📊 Comprehensive Analysis


- Protocol distribution visualization
- TCP connection tracking and handshake analysis
- Network throughput calculations
- Top talkers identification
- DNS query analysis
- Security issue detection


### 🎨 Interactive Visualizations


- Real-time charts using Recharts
- Protocol distribution pie charts
- Throughput line graphs
- Top talkers bar charts


### 🔍 Deep Packet Inspection


- Connection flow analysis
- Retransmission detection
- Failed connection identification
- Port scanning detection


### 🛡️ Security Features


- Automatic security issue detection
- Port scan identification
- DDoS pattern recognition
- Failed connection analysis


## Installation

#### Prerequisites

- Node.js 18+ and npm/yarn
- A modern web browser

#### Setup Steps

1. Clone or create the project directory:

```
mkdir wireshark-analyzer
cd wireshark-analyzer
```

2. Install dependencies:

```
npm install
```

3. Start the development server:

```
npm run dev
```

4. Open your browser: Navigate to http://localhost:3000


## Usage

#### Exporting from Wireshark

1. Open your packet capture in Wireshark
2. Go to File → Export Packet Dissections → As CSV...
3. Save the CSV file
4. Upload it to the analyzer

## Analyzing Logs

#### 1. Upload Files:

- Click on either upload area
- Select your Wireshark CSV export
- Wait for processing


#### 2.View Analysis:

- Switch between different log files
- Explore various analysis tabs
- Review security findings


#### 3.Export Results:

- Copy analysis data
- Save charts as images
- Export reports

## Project Structure

```
wireshark-analyzer/
├── src/
│   ├── components/
│   │   └── WiresharkAnalyzer.jsx    # Main analyzer component
│   ├── utils/
│   │   ├── csvParser.js             # CSV parsing logic
│   │   ├── packetAnalyzer.js        # Advanced analysis
│   │   └── networkUtils.js          # Network utilities
│   ├── App.jsx                      # Main application
│   ├── index.jsx                    # Entry point
│   └── index.css                    # Global styles
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Key Components

**csvParser.js**

Handles CSV parsing and basic statistics:

- parseWiresharkCSV() - Parse CSV files
- extractStatistics() - Generate statistics
- filterByProtocol() - Filter packets
- groupByConnection() - Group related packets
- detectConnectionIssues() - Find problems

**packetAnalyzer.js**

Advanced packet analysis:

- analyzeTCPHandshakes() - TCP connection analysis
- calculateThroughput() - Network performance
- identifyTopTalkers() - Most active IPs
- analyzeDNS() - DNS query inspection
- detectSecurityIssues() - Security scanning
- generateSummaryReport() - Complete report

## Understanding the Analysis

#### **Log 1 (Loopback Traffic)**

- **What it is: Local application communication**
- **Common scenarios:**

    - Database server queries
    - Microservices communication
    - Local API testing


- **Health indicators:**

✅ Clean handshakes
✅ No retransmissions
✅ Proper termination



#### **Log 2 (Network Traffic)**

- **What it is: Real network communication**
- **Key findings:**

    - External connections
    - DNS queries
    - IPv6 configuration


- **Issues to watch:**

- ⚠️ Failed connections
- ⚠️ Retransmissions
- ⚠️ Port scanning


## API Reference

**parseWiresharkCSV(csvText)**
**Parses Wireshark CSV export files.**

**Parameters:**

- csvText (string): Raw CSV content

**Returns:**

- Object with packets, metadata, and errors

extractStatistics(packets)
Generates basic statistics from packets.

**Parameters:**

- packets (Array): Parsed packet array

**Returns:**

- Object with protocol counts, sources, destinations, time range

**generateSummaryReport(packets)**

Creates comprehensive analysis report.

**Parameters:**

- packets (Array): Parsed packet array

**Returns:**

- Object with overview, connections, performance, DNS, security

### Performance Tips

1. Large Files:

    - Split large captures into smaller files
    - Filter packets in Wireshark before export
    - Use display filters

2. Browser Performance:

    - Close other tabs
    - Use Chrome/Edge for best performance
    - Clear browser cache if slow

#### Contributing

**Contributions are welcome! Areas for improvement:**

- Additional protocol support
- More visualization types
- Export functionality
- Real-time packet capture
- Advanced filtering

### Troubleshooting

**CSV Parse Errors**

- Ensure file is Wireshark CSV export
- Check for special characters
- Try re-exporting from Wireshark

**Slow Performance**

- Reduce packet count
- Filter before export
- Close other applications

**Incorrect Analysis**

- Verify CSV format
- Check Wireshark version
- Report issues with sample data

### License

MIT License - feel free to use and modify

#### Credits

Built with:

- React 18
- Recharts (charts)
- Tailwind CSS (styling)
- Lucide React (icons)
- PapaParse (CSV parsing)
- Lodash (utilities)

### Support

For issues or questions:

1. Check this README
2. Review the code comments
3. Open an issue with sample data


### Happy Analyzing! 🔍📊
