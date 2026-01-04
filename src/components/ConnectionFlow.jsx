import React, { useState, useMemo } from 'react';
import { Activity, CheckCircle, XCircle, Clock, ArrowRight, Filter } from 'lucide-react';

const ConnectionFlow = ({ connections }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('packets');

  const stats = useMemo(() => {
    return {
      total: connections.length,
      established: connections.filter(c => c.established).length,
      closed: connections.filter(c => c.closed).length,
      failed: connections.filter(c => !c.established).length
    };
  }, [connections]);

  const filteredConnections = useMemo(() => {
    let filtered = [...connections];

    if (filterStatus === 'established') {
      filtered = filtered.filter(c => c.established);
    } else if (filterStatus === 'closed') {
      filtered = filtered.filter(c => c.closed);
    } else if (filterStatus === 'failed') {
      filtered = filtered.filter(c => !c.established);
    }

    // Sort connections
    filtered.sort((a, b) => {
      if (sortBy === 'packets') {
        return b.packets.length - a.packets.length;
      }
      return 0;
    });

    return filtered;
  }, [connections, filterStatus, sortBy]);

  const getStatusIcon = (connection) => {
    if (connection.closed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (connection.established) {
      return <Activity className="w-5 h-5 text-blue-600" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (connection) => {
    if (connection.closed) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Closed</span>;
    } else if (connection.established) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Active</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Failed</span>;
    }
  };

  const getHandshakeStatus = (connection) => {
    const steps = [];
    if (connection.syn) steps.push('SYN');
    if (connection.synAck) steps.push('SYN-ACK');
    if (connection.ack) steps.push('ACK');
    return steps.join(' → ') || 'None';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-700">Total</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Established</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.established}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-700">Closed</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.closed}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-700">Failed</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex gap-2">
            {['all', 'established', 'closed', 'failed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="packets">Packet Count</option>
            <option value="time">Time</option>
          </select>
        </div>
      </div>

      {/* Connection List */}
      <div className="space-y-3">
        {filteredConnections.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No connections found matching your filter</p>
          </div>
        ) : (
          filteredConnections.map((connection, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(connection)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {connection.source}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {connection.destination}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(connection)}
                      <span className="text-xs text-gray-500">
                        {connection.packets.length} packets
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-gray-600 text-xs font-medium mb-1">TCP Handshake</div>
                  <div className="font-mono text-xs">
                    {getHandshakeStatus(connection)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${connection.syn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      SYN
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${connection.synAck ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      SYN-ACK
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${connection.ack ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      ACK
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <div className="text-gray-600 text-xs font-medium mb-1">Connection State</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Established:</span>
                      <span className={`font-medium ${connection.established ? 'text-green-600' : 'text-gray-400'}`}>
                        {connection.established ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">FIN Sent:</span>
                      <span className={`font-medium ${connection.fin ? 'text-blue-600' : 'text-gray-400'}`}>
                        {connection.fin ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Closed:</span>
                      <span className={`font-medium ${connection.closed ? 'text-green-600' : 'text-gray-400'}`}>
                        {connection.closed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <div className="text-gray-600 text-xs font-medium mb-1">Statistics</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Packets:</span>
                      <span className="font-mono font-medium">{connection.packets.length}</span>
                    </div>
                    {connection.packets.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">First:</span>
                          <span className="font-mono text-xs">
                            {parseFloat(connection.packets[0].Time).toFixed(3)}s
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Last:</span>
                          <span className="font-mono text-xs">
                            {parseFloat(connection.packets[connection.packets.length - 1].Time).toFixed(3)}s
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connection Flow Diagram Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">Understanding TCP Connections</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">3-Way Handshake:</span> SYN → SYN-ACK → ACK establishes a connection
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Activity className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Active Connection:</span> Successfully established but not yet closed
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Connection Termination:</span> FIN → ACK closes the connection gracefully
            </div>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Failed Connection:</span> Handshake incomplete, connection never established
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionFlow;