import React, { useState, useCallback } from 'react';
import WiresharkAnalyzer from './components/WiresharkAnalyzer';
import { parseWiresharkCSV, extractStatistics } from './utils/csvParser';
import { generateSummaryReport } from './utils/packetAnalyzer';
import { Upload, FileText } from 'lucide-react';

function App() {
  const [log1Data, setLog1Data] = useState(null);
  const [log2Data, setLog2Data] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback((event, logNumber) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const parsed = parseWiresharkCSV(csvText);
        const stats = extractStatistics(parsed.packets);
        const report = generateSummaryReport(parsed.packets);

        const logData = {
          fileName: file.name,
          packets: parsed.packets,
          statistics: stats,
          report: report,
          uploadedAt: new Date().toISOString()
        };

        if (logNumber === 1) {
          setLog1Data(logData);
          setSelectedLog('log1');
        } else {
          setLog2Data(logData);
          setSelectedLog('log2');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please ensure it is a valid Wireshark export.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      alert('Error reading file');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  }, []);

  const currentData = selectedLog === 'log1' ? log1Data : log2Data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {!log1Data && !log2Data ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <FileText className="w-16 h-16 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Wireshark Log Analyzer
              </h1>
              <p className="text-gray-600">
                Upload your Wireshark CSV export files to begin analysis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Upload Log File 1
                  </h3>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Wireshark CSV export</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 1)}
                    disabled={isProcessing}
                  />
                </label>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Upload Log File 2
                  </h3>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Wireshark CSV export</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 2)}
                    disabled={isProcessing}
                  />
                </label>
              </div>
            </div>

            {isProcessing && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Processing CSV file...</p>
              </div>
            )}

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How to export from Wireshark:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Open your capture file in Wireshark</li>
                <li>Go to File → Export Packet Dissections → As CSV...</li>
                <li>Save the file and upload it here</li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <WiresharkAnalyzer
          log1Data={log1Data}
          log2Data={log2Data}
          selectedLog={selectedLog}
          onSelectLog={setSelectedLog}
          onReset={() => {
            setLog1Data(null);
            setLog2Data(null);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
}

export default App;