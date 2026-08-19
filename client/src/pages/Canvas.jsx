import { useState, useRef, useEffect } from 'react';
import { Plus, Save, Play, Code, Layout as LayoutIcon, Settings as SettingsIcon, Sparkles, MessageSquare, Clock, GitBranch, ArrowRight, Trash2 } from 'lucide-react';

export default function Canvas() {
  const [nodes, setNodes] = useState([
    { id: 'node-1', type: 'trigger', title: 'Start: Incoming SMS/WA', content: 'Namaskara! Reply with 1 for Support, 2 for General Info.', x: 80, y: 160 },
    { id: 'node-2', type: 'message', title: 'Bot Reply: Support', content: 'Connecting you to our agent helpdesk. Please hold.', x: 380, y: 80 },
    { id: 'node-3', type: 'message', title: 'Bot Reply: Info', content: 'We are active Mon-Fri 9AM-5PM. Visit karnataka.gov.in', x: 380, y: 260 }
  ]);
  const [connections, setConnections] = useState([
    { from: 'node-1', to: 'node-2', label: 'If reply matches "1"' },
    { from: 'node-1', to: 'node-3', label: 'If reply matches "2"' }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState('node-1');
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFromId, setConnectingFromId] = useState(null);

  const canvasRef = useRef(null);

  // Mouse handlers for dragging nodes
  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    setNodes(prev => prev.map(node => {
      if (node.id === draggingNodeId) {
        return { ...node, x: Math.max(0, x), y: Math.max(0, y) };
      }
      return node;
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Drag and drop from sidebar templates
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const nodeType = e.dataTransfer.getData('nodeType');
    if (!nodeType) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - 50;
    const y = e.clientY - canvasRect.top - 20;

    const newId = `node-${Date.now()}`;
    let title = 'New Node';
    let content = 'Configure this message copy.';
    
    if (nodeType === 'trigger') {
      title = 'Start: Trigger Node';
      content = 'Initial user greeting menu message...';
    } else if (nodeType === 'message') {
      title = 'Send Response Node';
      content = 'Reply copy for this branch...';
    } else if (nodeType === 'delay') {
      title = 'Wait / Time Delay';
      content = 'Pause flow for 5 minutes...';
    } else if (nodeType === 'condition') {
      title = 'Condition Splitter';
      content = 'Branching key matching rules...';
    }

    const newNode = {
      id: newId,
      type: nodeType,
      title,
      content,
      x: Math.max(0, x),
      y: Math.max(0, y)
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newId);
  };

  // Connections
  const handleStartConnection = (e, nodeId) => {
    e.stopPropagation();
    setConnectingFromId(nodeId);
  };

  const handleEndConnection = (e, nodeId) => {
    e.stopPropagation();
    if (connectingFromId && connectingFromId !== nodeId && !draggingNodeId) {
      // Check if connection already exists
      const exists = connections.some(c => c.from === connectingFromId && c.to === nodeId);
      if (!exists) {
        setConnections(prev => [...prev, { from: connectingFromId, to: nodeId, label: 'Flow connection' }]);
      }
    }
    setConnectingFromId(null);
  };

  const handleDeleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleUpdateNode = (updated) => {
    setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] overflow-hidden">
      
      {/* SIDEBAR: Draggable templates */}
      <div className="w-full lg:w-60 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-dark text-sm">Flow Nodes</h3>
          <p className="text-[10px] text-gray-500">Drag and drop nodes onto the grid canvas to expand your SaaS campaign.</p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Draggable Trigger */}
          <div 
            draggable
            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'trigger')}
            className="border border-green-200 bg-green-50/50 hover:bg-green-50 p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-green-700 block">Trigger Node</span>
              <span className="text-[9px] text-green-600">Start Workflow</span>
            </div>
          </div>

          {/* Draggable Message */}
          <div 
            draggable
            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'message')}
            className="border border-blue-200 bg-blue-50/50 hover:bg-blue-50 p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-blue-700 block">Bot Message</span>
              <span className="text-[9px] text-blue-600">Send WA Response</span>
            </div>
          </div>

          {/* Draggable Condition */}
          <div 
            draggable
            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'condition')}
            className="border border-purple-200 bg-purple-50/50 hover:bg-purple-50 p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-purple-700 block">Split Condition</span>
              <span className="text-[9px] text-purple-600">Key Matching Rules</span>
            </div>
          </div>

          {/* Draggable Delay */}
          <div 
            draggable
            onDragStart={(e) => e.dataTransfer.setData('nodeType', 'delay')}
            className="border border-amber-200 bg-amber-50/50 hover:bg-amber-50 p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-amber-700 block">Time Delay</span>
              <span className="text-[9px] text-amber-600">Wait / Pause flow</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-auto border-t border-gray-150 pt-3">
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">Instructions</div>
          <ul className="text-[9px] text-slate-500 space-y-1.5 list-disc pl-3">
            <li>Drag nodes from above to drop them on the grid canvas.</li>
            <li>Click and drag a node header card to position it freely.</li>
            <li>Click the small circular handle on the right of a node, then click another node to draw a path.</li>
            <li>Double-click to select and edit node details in the bottom drawer.</li>
          </ul>
        </div>
      </div>

      {/* CENTER: Canvas Grid */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden h-full">
        
        {/* main grid canvas */}
        <div 
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden shadow-inner cursor-default bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"
          onClick={() => setSelectedNodeId(null)}
        >
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Visual SaaS Workflow Canvas</span>
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl shadow-lg transition text-xs">
              <Play className="w-3.5 h-3.5" />
              Test Flow
            </button>
            <button 
              onClick={() => alert('SaaS configuration successfully saved!')}
              className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Design
            </button>
          </div>

          {/* SVG Connection Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="canvas-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              // Compute connection coordinates (ports: right-to-left)
              const startX = fromNode.x + 200; // right boundary of card
              const startY = fromNode.y + 40;  // center vertical
              const endX = toNode.x;           // left boundary of card
              const endY = toNode.y + 40;      // center vertical

              const controlX = (startX + endX) / 2;

              return (
                <g key={`conn-${idx}`}>
                  <path
                    d={`M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke="url(#canvas-grad)"
                    strokeWidth="1.8"
                    strokeDasharray="4, 4"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  <circle cx={startX} cy={startY} r="3" fill="#3b82f6" />
                  <circle cx={endX} cy={endY} r="3" fill="#10b981" />
                </g>
              );
            })}
          </svg>

          {/* Render Dropped Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            let typeColor = 'border-green-500 bg-green-500/10 text-green-400';
            if (node.type === 'message') typeColor = 'border-blue-500 bg-blue-500/10 text-blue-400';
            else if (node.type === 'condition') typeColor = 'border-purple-500 bg-purple-500/10 text-purple-400';
            else if (node.type === 'delay') typeColor = 'border-amber-500 bg-amber-500/10 text-amber-400';

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: '200px',
                  zIndex: 10
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                }}
                onMouseUp={handleEndConnection}
                className={`bg-slate-800/90 border-2 rounded-xl shadow-xl transition-all cursor-default overflow-hidden select-none ${
                  isSelected ? 'border-primary shadow-primary/20 scale-102' : 'border-slate-700 hover:border-slate-650'
                }`}
              >
                {/* Drag handle header */}
                <div 
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  className="bg-slate-800 border-b border-slate-700 px-3 py-1.5 flex items-center justify-between cursor-move"
                >
                  <span className="text-[10px] text-white font-bold truncate">{node.title}</span>
                  <div className="flex gap-1.5">
                    {/* Connection Node source output port handle */}
                    <button
                      onClick={(e) => handleStartConnection(e, node.id)}
                      className="w-2.5 h-2.5 rounded-full bg-blue-500 hover:bg-blue-400 border border-white"
                      title="Draw flow line"
                    />
                  </div>
                </div>

                <div className="p-3">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${typeColor}`}>
                    {node.type}
                  </span>
                  <p className="text-slate-400 text-[10px] line-clamp-3 leading-relaxed mt-2">
                    {node.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM: Node Editor Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div>
              <h3 className="font-bold text-dark text-sm">
                {selectedNode ? `Configure Node: ${selectedNode.title}` : 'Select a node on the canvas to configure'}
              </h3>
            </div>
            {selectedNode && (
              <button 
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-650 font-bold bg-red-50 hover:bg-red-100 py-1 px-2.5 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Node
              </button>
            )}
          </div>

          {selectedNode ? (
            <div className="flex flex-col md:flex-row gap-4 animate-fade-in">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Node Title</label>
                <input 
                  type="text" 
                  value={selectedNode.title}
                  onChange={(e) => handleUpdateNode({ ...selectedNode, title: e.target.value })}
                  className="border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-primary text-dark font-medium transition"
                />
              </div>

              <div className="flex-[2] flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Message Content / Action Config</label>
                <textarea 
                  rows={2}
                  value={selectedNode.content}
                  onChange={(e) => handleUpdateNode({ ...selectedNode, content: e.target.value })}
                  className="border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-primary text-dark font-medium transition resize-none leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 text-center py-6">
              Drag nodes from the left and drop them on the grid, or click an existing node to begin configuration.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
