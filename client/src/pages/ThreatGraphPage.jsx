import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Network, Filter, X } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../services/api';
import { useCaseStore } from '../stores/caseStore';
import { getRiskColor } from '../utils/riskUtils';

const NODE_COLORS = {
  case:   '#6366F1',
  domain: '#3B82F6',
  ip:     '#EF4444',
  url:    '#F59E0B',
  hash:   '#A855F7',
  asn:    '#22D3EE',
  email:  '#22C55E',
};

// Build a global graph from multiple cases
const buildDemoGraph = () => {
  const nodes = [
    { id: 'c1', label: 'CASE-2026-001', type: 'case' },
    { id: 'c2', label: 'CASE-2026-002', type: 'case' },
    { id: 'c3', label: 'CASE-2026-004', type: 'case' },
    { id: 'd1', label: 'secure-login-verify.net', type: 'domain' },
    { id: 'd2', label: 'microsoft-auth-portal.com', type: 'domain' },
    { id: 'd3', label: 'oauth-google-secure.net', type: 'domain' },
    { id: 'd4', label: 'cfo-wire-transfer-portal.com', type: 'domain' },
    { id: 'd5', label: 'ransomware-c2-node.onion.to', type: 'domain' },
    { id: 'i1', label: '185.10.20.4', type: 'ip' },
    { id: 'i2', label: '45.142.212.100', type: 'ip' },
    { id: 'i3', label: '5.188.206.14', type: 'ip' },
    { id: 'i4', label: '193.106.191.25', type: 'ip' },
    { id: 'h1', label: 'a3b4c5d6e7f8...', type: 'hash' },
    { id: 'h2', label: 'b1e2f3a4c5d6...', type: 'hash' },
    { id: 'a1', label: 'AS47583', type: 'asn' },
  ];
  const edges = [
    { source: 'c1', target: 'd1', label: 'contains' },
    { source: 'c1', target: 'd2', label: 'contains' },
    { source: 'c1', target: 'i1', label: 'resolves_to' },
    { source: 'c1', target: 'i2', label: 'resolves_to' },
    { source: 'c2', target: 'd4', label: 'contains' },
    { source: 'c2', target: 'i4', label: 'resolves_to' },
    { source: 'c3', target: 'd5', label: 'contains' },
    { source: 'c3', target: 'i3', label: 'resolves_to' },
    { source: 'c3', target: 'h2', label: 'drops' },
    { source: 'd1', target: 'i1', label: 'resolves_to' },
    { source: 'd2', target: 'i2', label: 'resolves_to' },
    { source: 'd3', target: 'i1', label: 'resolves_to' },
    { source: 'i1', target: 'a1', label: 'in_asn' },
    { source: 'i2', target: 'a1', label: 'in_asn' },
    { source: 'c1', target: 'h1', label: 'contains' },
    { source: 'd5', target: 'i3', label: 'resolves_to' },
    { source: 'c1', target: 'c2', label: 'related' },
    { source: 'c1', target: 'c3', label: 'related' },
  ];
  return { nodes, edges };
};

export default function ThreatGraphPage() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const { cases, fetchCases } = useCaseStore();

  useEffect(() => {
    fetchCases({ limit: 20 });
    const { nodes, edges } = buildDemoGraph();
    setGraphData({
      nodes: nodes.map(n => ({ ...n, id: n.id, name: n.label })),
      links: edges.map(e => ({ ...e }))
    });
  }, []);

  const handleNodeClick = useCallback(node => setSelectedNode(node), []);

  const filteredData = filterType === 'all' ? graphData : {
    nodes: graphData.nodes.filter(n => n.type === filterType),
    links: graphData.links.filter(l => {
      const src = graphData.nodes.find(n => n.id === (l.source?.id || l.source));
      const tgt = graphData.nodes.find(n => n.id === (l.target?.id || l.target));
      return src?.type === filterType || tgt?.type === filterType;
    })
  };

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Network size={20} className="text-accent" />
          <div>
            <h1 className="text-white font-bold">Threat Graph</h1>
            <p className="text-muted text-xs">{graphData.nodes.length} nodes · {graphData.links.length} connections</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(NODE_COLORS).map(type => (
            <button key={type} onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === type ? 'text-white' : 'bg-border text-muted hover:text-white'}`}
              style={filterType === type ? { backgroundColor: NODE_COLORS[type] } : {}}>
              {type}
            </button>
          ))}
          <button onClick={() => setFilterType('all')} className="px-3 py-1.5 bg-border text-muted hover:text-white rounded-lg text-xs transition-colors">All</button>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ForceGraph2D
          ref={fgRef}
          graphData={filteredData}
          nodeLabel="name"
          nodeColor={n => NODE_COLORS[n.type] || '#6366F1'}
          nodeRelSize={6}
          linkColor={() => '#1E2433'}
          linkWidth={1.5}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          backgroundColor="#0A0E1A"
          onNodeClick={handleNodeClick}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name || '';
            const fontSize = Math.max(10 / globalScale, 3);
            ctx.font = `${fontSize}px Inter`;
            ctx.fillStyle = '#8A93AB';
            ctx.textAlign = 'center';
            ctx.fillText(
              label.length > 20 ? label.slice(0, 20) + '…' : label,
              node.x, node.y + 10
            );
          }}
        />

        {/* Selected node panel */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 w-72 bg-card border border-border rounded-xl p-5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[selectedNode.type] }} />
                <span className="text-xs text-muted uppercase tracking-wider">{selectedNode.type}</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-muted hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-white font-mono text-sm break-all">{selectedNode.name || selectedNode.id}</p>
            <div className="mt-4 space-y-2 text-xs text-muted">
              <div>Type: <span className="text-white">{selectedNode.type}</span></div>
              <div>Connections: <span className="text-white">
                {graphData.links.filter(l => (l.source?.id || l.source) === selectedNode.id || (l.target?.id || l.target) === selectedNode.id).length}
              </span></div>
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card border border-border rounded-xl p-3 flex flex-wrap gap-3">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-muted">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              {type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
