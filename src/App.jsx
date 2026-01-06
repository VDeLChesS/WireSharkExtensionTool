import React, { useState, useCallback, useRef } from 'react';
import WiresharkAnalyzer from './components/WiresharkAnalyzer';
import { parseWiresharkCSV, extractStatistics } from './utils/csvParser';
import { generateSummaryReport } from './utils/packetAnalyzer';
import { Upload, FileText, Plus, X, Play, Trash2 } from 'lucide-react';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzedLogs, setAnalyzedLogs] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRefs = useRef([]);

  const MAX_FILES = 10;

  const handleFileSelect = useCallback((event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });
  }, []);

  const addFileInput = useCallback(() => {
    if (uploadedFiles.length < MAX_FILES) {
      setUploadedFiles(prev => [...prev, null]);
    }
  }, [uploadedFiles.length]);

  const removeFileInput = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
    fileInputRefs.current = [];
  }, []);

  const compareLogFiles = useCallback((logs) => {
    const comparison = {
      totalLogs: logs.length,
      summary: {
        totalPackets: logs.reduce((sum, log) => sum + log.statistics.totalPackets, 0),
        uniqueProtocols: new Set(logs.flatMap(log => Object.keys(log.statistics.protocols))),
        uniqueSources: new Set(logs.flatMap(log => Object.keys(log.statistics.sources))),
        uniqueDestinations: new Set(logs.flatMap(log => Object.keys(log.statistics.destinations)))
      },
      differences: [],
      similarities: [],
      inconsistencies: [],
      securityIssues: []
    };

    // Protocol comparison
    const allProtocols = Array.from(comparison.summary.uniqueProtocols);
    allProtocols.forEach(protocol => {
      const counts = logs.map(log => log.statistics.protocols[protocol] || 0);
      const hasProtocol = logs.map((log, idx) => ({
        logIndex: idx,
        fileName: log.fileName,
        count: counts[idx]
      })).filter(item => item.count > 0);

      if (hasProtocol.length === logs.length) {
        comparison.similarities.push({
          type: 'protocol',
          protocol,
          description: `All logs contain ${protocol} traffic`,
          details: hasProtocol
        });
      } else if (hasProtocol.length > 0 && hasProtocol.length < logs.length) {
        comparison.differences.push({
          type: 'protocol',
          protocol,
          description: `${protocol} present in ${hasProtocol.length}/${logs.length} logs`,
          details: hasProtocol
        });
      }
    });

    // IP address comparison
    const allSources = logs.map(log => new Set(Object.keys(log.statistics.sources)));
    const commonSources = allSources.reduce((a, b) => new Set([...a].filter(x => b.has(x))));
    
    if (commonSources.size > 0) {
      comparison.similarities.push({
        type: 'sources',
        description: `${commonSources.size} common source IP(s) across all logs`,
        ips: Array.from(commonSources)
      });
    }

    // Security issue aggregation
    logs.forEach((log, idx) => {
      if (log.report.security.issuesFound > 0) {
        log.report.security.issues.forEach(issue => {
          comparison.securityIssues.push({
            logIndex: idx,
            fileName: log.fileName,
            ...issue
          });
        });
      }
    });

    // Inconsistency detection
    const avgPacketSizes = logs.map(log => log.statistics.avgPacketSize);
    const maxSize = Math.max(...avgPacketSizes);
    const minSize = Math.min(...avgPacketSizes);
    
    if (maxSize / minSize > 2) {
      comparison.inconsistencies.push({
        type: 'packet_size',
        severity: 'MEDIUM',
        description: 'Significant variation in average packet sizes across logs',
        details: logs.map((log, idx) => ({
          logIndex: idx,
          fileName: log.fileName,
          avgSize: log.statistics.avgPacketSize
        }))
      });
    }

    // Time range comparison
    logs.forEach((log, idx) => {
      const duration = log.report.overview.timeSpan.end - log.report.overview.timeSpan.start;
      if (duration < 1) {
        comparison.inconsistencies.push({
          type: 'duration',
          severity: 'LOW',
          description: `Very short capture duration in ${log.fileName}`,
          details: { logIndex: idx, fileName: log.fileName, duration: duration.toFixed(3) }
        });
      }
    });

    return comparison;
  }, []);

  const startAnalysis = useCallback(async () => {
    const filesToAnalyze = uploadedFiles.filter(f => f !== null);
    
    if (filesToAnalyze.length === 0) {
      alert('Please upload at least one CSV file before analyzing.');
      return;
    }

    setIsProcessing(true);
    const results = [];

    try {
      for (let i = 0; i < filesToAnalyze.length; i++) {
        const file = filesToAnalyze[i];
        
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsText(file);
        });

        const parsed = parseWiresharkCSV(text);
        const stats = extractStatistics(parsed.packets);
        const report = generateSummaryReport(parsed.packets);

        results.push({
          fileName: file.name,
          packets: parsed.packets,
          statistics: stats,
          report: report,
          uploadedAt: new Date().toISOString(),
          fileIndex: i
        });
      }

      setAnalyzedLogs(results);
      setSelectedLog(0);

      // Generate comparison if multiple files
      if (results.length > 1) {
        const comparison = compareLogFiles(results);
        setComparisonData(comparison);
      } else {
        setComparisonData(null);
      }

    } catch (error) {
      console.error('Error analyzing files:', error);
      alert(`Error analyzing files: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, compareLogFiles]);

  const resetAnalysis = useCallback(() => {
    setUploadedFiles([]);
    setAnalyzedLogs([]);
    setComparisonData(null);
    setSelectedLog(null);
    fileInputRefs.current = [];
  }, []);

  const currentLogData = selectedLog !== null ? analyzedLogs[selectedLog] : null;

  // Initialize with 2 file inputs
  React.useEffect(() => {
    if (uploadedFiles.length === 0) {
      setUploadedFiles([null, null]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {analyzedLogs.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-6xl w-full">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <FileText className="w-16 h-16 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Wireshark Log Analyzer
              </h1>
              <p className="text-gray-600 mb-2">
                Upload your Wireshark CSV export files to begin analysis
              </p>
              <p className="text-sm text-gray-500">
                Upload multiple files to compare and identify differences
              </p>
            </div>

            {/* File Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        File {index + 1}
                      </h3>
                    </div>
                    {uploadedFiles.length > 1 && (
                      <button
                        onClick={() => removeFileInput(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove this input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    file 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}>
                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                      {file ? (
                        <>
                          <FileText className="w-8 h-8 text-green-600 mb-2" />
                          <p className="text-xs font-medium text-green-800 text-center px-2 truncate max-w-full">
                            {file.name}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500 text-center px-2">
                            <span className="font-semibold">Click</span> or drag CSV
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={el => fileInputRefs.current[index] = el}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, index)}
                      disabled={isProcessing}
                    />
                  </label>
                </div>
              ))}

              {/* Add More Button */}
              {uploadedFiles.length < MAX_FILES && (
                <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-dashed border-gray-300">
                  <button
                    onClick={addFileInput}
                    className="w-full h-full min-h-[180px] flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-500 transition-colors"
                  >
                    <Plus className="w-10 h-10 mb-2" />
                    <span className="text-sm font-medium">Add Another File</span>
                    <span className="text-xs text-gray-400 mt-1">
                      ({uploadedFiles.length}/{MAX_FILES})
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button
                onClick={startAnalysis}
                disabled={isProcessing || uploadedFiles.filter(f => f !== null).length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-lg"
              >
                <Play className="w-5 h-5" />
                {isProcessing ? 'Analyzing...' : 'Start Analysis'}
              </button>

              {uploadedFiles.some(f => f !== null) && (
                <button
                  onClick={clearAllFiles}
                  disabled={isProcessing}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </button>
              )}
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-lg font-medium text-gray-700">
                  Processing {uploadedFiles.filter(f => f !== null).length} file(s)...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a moment for large files
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How to export from Wireshark:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Open your capture file in Wireshark</li>
                  <li>Go to File → Export Packet Dissections → As CSV...</li>
                  <li>Save the file and upload it here</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Comparison Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                  <li>Upload 1 file for detailed analysis</li>
                  <li>Upload 2+ files to compare traffic patterns</li>
                  <li>Identify differences and similarities</li>
                  <li>Detect inconsistencies and security issues</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <WiresharkAnalyzer
          logs={analyzedLogs}
          comparisonData={comparisonData}
          selectedLog={selectedLog}
          onSelectLog={setSelectedLog}
          onReset={resetAnalysis}
        />
      )}
    </div>
  );
}

export default App;