import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const PacketTable = ({ packets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Get unique protocols for filter
  const protocols = useMemo(() => {
    const unique = new Set(packets.map(p => p.Protocol));
    return ['all', ...Array.from(unique)].sort();
  }, [packets]);

  // Filter packets
  const filteredPackets = useMemo(() => {
    return packets.filter(packet => {
      const matchesSearch = 
        searchTerm === '' ||
        Object.values(packet).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesProtocol = 
        protocolFilter === 'all' || 
        packet.Protocol === protocolFilter;
      
      return matchesSearch && matchesProtocol;
    });
  }, [packets, searchTerm, protocolFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPackets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPackets = filteredPackets.slice(startIndex, endIndex);

  // Protocol color coding
  const getProtocolColor = (protocol) => {
    const colors = {
      TCP: 'bg-blue-100 text-blue-800',
      UDP: 'bg-green-100 text-green-800',
      DNS: 'bg-purple-100 text-purple-800',
      HTTP: 'bg-orange-100 text-orange-800',
      HTTPS: 'bg-red-100 text-red-800',
      ICMP: 'bg-yellow-100 text-yellow-800',
      ICMPv6: 'bg-yellow-100 text-yellow-800',
      ARP: 'bg-pink-100 text-pink-800',
      IPv6: 'bg-indigo-100 text-indigo-800'
    };
    return colors[protocol] || 'bg-gray-100 text-gray-800';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search packets..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={protocolFilter}
            onChange={(e) => {
              setProtocolFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            {protocols.map(protocol => (
              <option key={protocol} value={protocol}>
                {protocol === 'all' ? 'All Protocols' : protocol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {startIndex + 1}-{Math.min(endIndex, filteredPackets.length)} of {filteredPackets.length} packets
        </span>
        {searchTerm || protocolFilter !== 'all' ? (
          <button
            onClick={() => {
              setSearchTerm('');
              setProtocolFilter('all');
              setCurrentPage(1);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filters
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Protocol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Length
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Info
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPackets.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No packets found matching your filters
                </td>
              </tr>
            ) : (
              currentPackets.map((packet, index) => (
                <tr key={startIndex + index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">
                    {packet.No}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                    {parseFloat(packet.Time).toFixed(6)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                    {packet.Source}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                    {packet.Destination}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProtocolColor(packet.Protocol)}`}>
                      {packet.Protocol}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">
                    {packet.Length}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">
                    {packet.Info}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PacketTable;