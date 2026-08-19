import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Phone, User as UserIcon, HelpCircle, Check, CheckCheck, Loader2, Sparkles, Plus, Trash2, Save, ArrowRight, Paperclip, Camera, Image, RefreshCw } from 'lucide-react';

export default function Demo1() {
  const [workflow, setWorkflow] = useState({
    trigger: { message: '' },
    options: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Canvas State
  const [activeMainOption, setActiveMainOption] = useState('5'); // default highlight option 5 (BBMP Roads/Infrastructure)
  const [selectedNode, setSelectedNode] = useState('trigger'); // 'trigger' or option key (e.g. '1', '2.1')
  
  const [positions, setPositions] = useState({});
  const [draggingNodeKey, setDraggingNodeKey] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasContainerRef = useRef(null);

  // Initialize and preserve coordinates dynamically based on the current workflow
  useEffect(() => {
    if (workflow && workflow.options) {
      setPositions(prev => {
        const next = { ...prev };
        
        // Trigger position
        if (!next['trigger']) next['trigger'] = { x: 25, y: 155 };
        
        // Main options layout (1 to 7)
        const mainKeys = Object.keys(workflow.options).filter(k => !k.includes('.')).sort();
        mainKeys.forEach((key, idx) => {
          if (!next[key]) {
            next[key] = { x: 260, y: 20 + idx * 52 };
          }
        });
        
        // Sub options layout grouped dynamically relative to their parent keys
        Object.keys(workflow.options).filter(k => k.includes('.')).forEach(key => {
          if (!next[key]) {
            const parent = key.split('.')[0];
            const subs = Object.keys(workflow.options).filter(k => k.startsWith(`${parent}.`)).sort();
            const idx = subs.indexOf(key);
            const parentY = next[parent]?.y || 155;
            next[key] = { x: 505, y: parentY - 50 + idx * 52 };
          }
        });
        
        return next;
      });
    }
  }, [workflow]);

  const handleStartDrag = (e, key) => {
    e.stopPropagation();
    setDraggingNodeKey(key);
    const pos = positions[key] || { x: 25, y: 155 };
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragMove = (e) => {
    if (!draggingNodeKey || !canvasContainerRef.current) return;
    const canvasRect = canvasContainerRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;
    setPositions(prev => ({
      ...prev,
      [draggingNodeKey]: { x: Math.max(0, x), y: Math.max(0, y) }
    }));
  };

  const handleEndDrag = () => {
    setDraggingNodeKey(null);
  };
  
  // Grievance Ticker Dashboard State
  const [grievances, setGrievances] = useState([]);
  const [fetchingGrievances, setFetchingGrievances] = useState(false);
  const [newGrievanceId, setNewGrievanceId] = useState(null); // to highlight newly added row

  // Simulator State
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [conversationState, setConversationState] = useState('main'); // matches contact state
  const [showAttachments, setShowAttachments] = useState(false);
  
  const chatEndRef = useRef(null);

  // Fetch workflow & grievances on load
  useEffect(() => {
    fetchWorkflow();
    fetchGrievances();

    // Set up polling for grievances to show real-time ticker updates
    const interval = setInterval(fetchGrievances, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of chat simulator when message list changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/demo1/workflow');
      setWorkflow(response.data);
      if (response.data.positions) {
        setPositions(response.data.positions);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      setLoading(false);
    }
  };

  const fetchGrievances = async () => {
    try {
      setFetchingGrievances(true);
      const response = await axios.get('/api/demo1/grievances');
      setGrievances(response.data);
      setFetchingGrievances(false);
    } catch (error) {
      console.error('Error fetching grievances:', error);
      setFetchingGrievances(false);
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      setSaving(true);
      await axios.post('/api/demo1/workflow', {
        ...workflow,
        positions
      });
      setSaving(false);
    } catch (error) {
      console.error('Error saving workflow:', error);
      setSaving(false);
      alert('Failed to save workflow config.');
    }
  };

  // Node update handlers
  const handleUpdateTriggerMessage = (val) => {
    setWorkflow(prev => ({
      ...prev,
      trigger: { ...prev.trigger, message: val }
    }));
  };

  const handleUpdateOptionTitle = (key, val) => {
    setWorkflow(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: { ...prev.options[key], title: val }
      }
    }));
  };

  const handleUpdateOptionReply = (key, val) => {
    setWorkflow(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: { ...prev.options[key], reply: val }
      }
    }));
  };

  const handleAddSubOption = () => {
    const parentKey = activeMainOption;
    const subKeys = Object.keys(workflow.options).filter(k => k.startsWith(`${parentKey}.`));
    const nextSubNumber = subKeys.length + 1;
    const nextKey = `${parentKey}.${nextSubNumber}`;

    setWorkflow(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [nextKey]: {
          title: `Sub-Option ${nextKey}`,
          reply: `This is the automated response for option ${nextKey}.`
        }
      }
    }));
    setSelectedNode(nextKey);
  };

  const handleAddMainOption = () => {
    const mainKeys = Object.keys(workflow.options).filter(k => !k.includes('.')).map(Number);
    const nextKey = String(Math.max(...mainKeys, 0) + 1);

    setWorkflow(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [nextKey]: {
          title: `New Option ${nextKey}`,
          reply: `Choose an option:\n\n${nextKey}.1️⃣ Sub Option 1\n${nextKey}.2️⃣ Back to Main Menu`
        },
        [`${nextKey}.1`]: {
          title: `Sub Option 1`,
          reply: `Automated response detail for option ${nextKey}.1`
        },
        [`${nextKey}.2`]: {
          title: `Back to Main Menu`,
          reply: workflow.trigger.message
        }
      }
    }));
    setActiveMainOption(nextKey);
    setSelectedNode(nextKey);
  };

  const handleDeleteNode = (key) => {
    const updatedOptions = { ...workflow.options };
    delete updatedOptions[key];

    if (!key.includes('.')) {
      Object.keys(updatedOptions).forEach(k => {
        if (k.startsWith(`${key}.`)) {
          delete updatedOptions[k];
        }
      });
      setSelectedNode('trigger');
    } else {
      const parent = key.split('.')[0];
      const remainingSubs = Object.entries(updatedOptions)
        .filter(([k]) => k.startsWith(`${parent}.`))
        .map(([, val]) => val);
      
      Object.keys(updatedOptions).forEach(k => {
        if (k.startsWith(`${parent}.`)) {
          delete updatedOptions[k];
        }
      });

      remainingSubs.forEach((opt, idx) => {
        updatedOptions[`${parent}.${idx + 1}`] = opt;
      });
      setSelectedNode(parent);
    }

    setWorkflow(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  // Simulator Handlers
  const handleSendBroadcast = async () => {
    try {
      setSendingBroadcast(true);
      setBroadcastProgress(15);
      
      const interval = setInterval(() => {
        setBroadcastProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 120);

      await axios.post('/api/demo1/send');

      setTimeout(() => {
        setSendingBroadcast(false);
        setBroadcastSent(true);
        setConversationState('main');
        setChatMessages([
          {
            id: 'broadcast-init',
            content: workflow.trigger.message,
            direction: 'outbound',
            senderType: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read'
          }
        ]);
        fetchGrievances();
      }, 1000);

    } catch (error) {
      console.error('Error sending broadcast:', error);
      setSendingBroadcast(false);
      alert('Failed to simulate send.');
    }
  };

  const handleSendSimulatorMessage = async (textToSend, customType = 'text') => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    if (!broadcastSent) {
      alert('Please send the Broadcast Campaign first using the button at the top of the phone simulator!');
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 1. Append user message to simulator UI
    setChatMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        content: text,
        direction: 'inbound',
        messageType: customType,
        timestamp
      }
    ]);
    setInputValue('');
    setShowAttachments(false);

    // 2. Adjust local state for chips helper
    const cleanText = text.trim();
    if (customType === 'image') {
      setConversationState('main'); // reset to main menu chips
    } else {
      if (cleanText === '1') setConversationState('bio');
      else if (cleanText === '2') setConversationState('bescom');
      else if (cleanText === '2.1') setConversationState('awaiting_bescom_id');
      else if (cleanText === '3') setConversationState('water');
      else if (cleanText === '3.1') setConversationState('awaiting_water_leak_details');
      else if (cleanText === '3.2') setConversationState('awaiting_tanker_id');
      else if (cleanText === '3.3') setConversationState('awaiting_sewage_details');
      else if (cleanText === '4') setConversationState('emergencies');
      else if (cleanText === '5') setConversationState('roads');
      else if (cleanText === '5.1') setConversationState('awaiting_pothole_details');
      else if (cleanText === '5.2') setConversationState('awaiting_streetlight_details');
      else if (cleanText === '5.3') setConversationState('awaiting_garbage_details');
      else if (cleanText === '6') setConversationState('health');
      else if (cleanText === '7') setConversationState('grievances');
      else if (cleanText === '7.1') setConversationState('awaiting_general_complaint');
      else if (cleanText === '7.2') setConversationState('awaiting_grievance_status_check');
      else if (['menu', 'back', '1.4', '2.4', '3.4', '4.4', '5.4', '6.4', '7.3'].includes(cleanText.toLowerCase())) {
        setConversationState('main');
      } else {
        // Any stateful text inputs reset state to 'idle' (which represents 'main' menu state in chips helper)
        if ([
          'awaiting_bescom_id', 
          'awaiting_streetlight_details', 
          'awaiting_pothole_details', 
          'awaiting_garbage_details',
          'awaiting_water_leak_details',
          'awaiting_tanker_id',
          'awaiting_sewage_details',
          'awaiting_general_complaint',
          'awaiting_grievance_status_check'
        ].includes(conversationState)) {
          setConversationState('main');
        }
      }
    }

    // 3. Start typing indicator
    setIsTyping(true);

    try {
      // 4. Send chat message to backend (including messageType)
      const response = await axios.post('/api/demo1/chat', {
        phoneNumber: '+919876543210',
        messageText: cleanText,
        messageType: customType
      });

      const { replies } = response.data;

      // 5. Append replies sequentially with typing delays for realism
      let currentDelay = 800;
      replies.forEach((reply, idx) => {
        setTimeout(() => {
          if (idx === replies.length - 1) {
            setIsTyping(false);
          }
          setChatMessages(prev => [
            ...prev,
            {
              id: reply.id,
              content: reply.content,
              direction: reply.direction,
              senderType: reply.senderType,
              timestamp: new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read'
            }
          ]);

          // Fetch updated grievances dashboard dynamically when a ticket is logged
          const matchGr = reply.content.match(/GR-\d{6}/);
          const matchTnk = reply.content.match(/TNK-\d{6}/);
          if (matchGr || matchTnk) {
            const ticketId = matchGr ? matchGr[0] : matchTnk[0];
            setNewGrievanceId(ticketId);
            fetchGrievances();
            
            // Remove highlight after 4 seconds
            setTimeout(() => setNewGrievanceId(null), 4000);
          }
        }, currentDelay);

        currentDelay += 1000;
      });

    } catch (error) {
      console.error('Error in chat simulator:', error);
      setIsTyping(false);
      // Fallback
      setTimeout(() => {
        let reply = "Bot online. System auto-reply matches locally.";
        if (workflow.options[cleanText]) {
          reply = workflow.options[cleanText].reply;
        }
        setChatMessages(prev => [
          ...prev,
          {
            id: `bot-fallback-${Date.now()}`,
            content: reply,
            direction: 'outbound',
            timestamp,
            status: 'read'
          }
        ]);
      }, 700);
    }
  };

  // Helper to determine chips helper menu dynamically
  const getHelperChips = () => {
    switch (conversationState) {
      case 'main':
        return [
          { text: '1 Bio Desk', code: '1' },
          { text: '2 BESCOM Power', code: '2' },
          { text: '3 BWSSB Water', code: '3' },
          { text: '4 Emergencies', code: '4' },
          { text: '5 BBMP Roads', code: '5' },
          { text: '6 Health Cell', code: '6' },
          { text: '7 Grievance Desk', code: '7' }
        ];
      case 'bio':
        return [
          { text: '1.1 Biography', code: '1.1' },
          { text: '1.2 Major Projects', code: '1.2' },
          { text: '1.3 Office Map', code: '1.3' },
          { text: '⬅️ Back to Menu', code: '1.4' }
        ];
      case 'bescom':
        return [
          { text: '2.1 Outage Report', code: '2.1' },
          { text: '2.2 Billing Issues', code: '2.2' },
          { text: '2.3 Talk to Agent', code: '2.3' },
          { text: '⬅️ Back to Menu', code: '2.4' }
        ];
      case 'awaiting_bescom_id':
        return [
          { text: 'Send: "1029384756" (Account ID)', code: '1029384756' },
          { text: '⬅️ BESCOM Menu', code: '2' }
        ];
      case 'water':
        return [
          { text: '3.1 Pipe Leakage', code: '3.1' },
          { text: '3.2 Subsidized Tanker', code: '3.2' },
          { text: '3.3 Sewage Blockage', code: '3.3' },
          { text: '⬅️ Back to Menu', code: '3.4' }
        ];
      case 'awaiting_water_leak_details':
        return [
          { text: 'Send: "8th cross pipe leak"', code: '8th cross pipe leak' },
          { text: '⬅️ Water Menu', code: '3' }
        ];
      case 'awaiting_tanker_id':
        return [
          { text: 'Send Connection: "CON-48201"', code: 'CON-48201' },
          { text: '⬅️ Water Menu', code: '3' }
        ];
      case 'awaiting_sewage_details':
        return [
          { text: 'Send Location: "Block 4 sewage overflow"', code: 'Block 4 sewage overflow' },
          { text: '⬅️ Water Menu', code: '3' }
        ];
      case 'emergencies':
        return [
          { text: '4.1 Ambulance Cell', code: '4.1' },
          { text: '4.2 Police Desk', code: '4.2' },
          { text: '4.3 Fire Control', code: '4.3' },
          { text: '⬅️ Back to Menu', code: '4.4' }
        ];
      case 'roads':
        return [
          { text: '5.1 Report Pothole', code: '5.1' },
          { text: '5.2 Streetlight Failure', code: '5.2' },
          { text: '5.3 Garbage Dump', code: '5.3' },
          { text: '⬅️ Back to Menu', code: '5.4' }
        ];
      case 'awaiting_streetlight_details':
        return [
          { text: 'Send Address: "153 apartment"', code: '153 apartment' },
          { text: 'Send Pole ID: "Pole #42-B"', code: 'Pole #42-B' },
          { text: '⬅️ BBMP Menu', code: '5' }
        ];
      case 'awaiting_pothole_details':
        return [
          { text: 'Send Location: "Main road pothole near school"', code: 'Main road pothole near school' },
          { text: '⬅️ BBMP Menu', code: '5' }
        ];
      case 'awaiting_garbage_details':
        return [
          { text: 'Send Location: "Illegal dumping on 3rd cross corner"', code: 'Illegal dumping on 3rd cross corner' },
          { text: '⬅️ BBMP Menu', code: '5' }
        ];
      case 'health':
        return [
          { text: '6.1 Locate Clinic', code: '6.1' },
          { text: '6.2 Medical Camp Info', code: '6.2' },
          { text: '6.3 School Upgrades', code: '6.3' },
          { text: '⬅️ Back to Menu', code: '6.4' }
        ];
      case 'grievances':
        return [
          { text: '7.1 Register Complaint', code: '7.1' },
          { text: '7.2 Check Status', code: '7.2' },
          { text: '⬅️ Back to Menu', code: '7.3' }
        ];
      case 'awaiting_general_complaint':
        return [
          { text: 'Send: "GRIEVANCE Drainage blockage"', code: 'GRIEVANCE Drainage blockage' },
          { text: '⬅️ Grievance Menu', code: '7' }
        ];
      case 'awaiting_grievance_status_check':
        return [
          { text: 'Query: "GR-983103"', code: 'GR-983103' },
          { text: 'Query: "GR-428109"', code: 'GR-428109' },
          { text: '⬅️ Grievance Menu', code: '7' }
        ];
      default:
        return [{ text: '⬅️ Back to Main Menu', code: 'back' }];
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-gray-500 font-medium">Loading interactive workflow canvas...</p>
      </div>
    );
  }

  const isTriggerSelected = selectedNode === 'trigger';
  const selectedOption = !isTriggerSelected ? workflow.options[selectedNode] : null;

  const activeSubOptions = Object.entries(workflow.options)
    .filter(([key]) => key.startsWith(`${activeMainOption}.`))
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] overflow-hidden">
      
      {/* LEFT SECTION: Canvas, Node Editor & Grievances Ticker */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden h-full">
        
        {/* Canvas Display */}
        <div 
          ref={canvasContainerRef}
          onMouseMove={handleDragMove}
          onMouseUp={handleEndDrag}
          onMouseLeave={handleEndDrag}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden shadow-inner flex flex-col justify-between min-h-[420px] p-4"
        >
          
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Interactive Canvas Editor</span>
          </div>

          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={handleSaveWorkflow} 
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition disabled:opacity-50 text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Config
            </button>
          </div>

          {/* SVG Connecting Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="main-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="sub-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Column 1 -> 2 connections */}
            {Object.keys(workflow.options)
              .filter(k => !k.includes('.'))
              .map((key) => {
                const triggerPos = positions['trigger'] || { x: 25, y: 155 };
                const mainPos = positions[key] || { x: 260, y: 155 };
                
                const startX = triggerPos.x + 200; 
                const startY = triggerPos.y + 53;  
                const endX = mainPos.x;            
                const endY = mainPos.y + 19;       
                
                const controlX = (startX + endX) / 2;
                const isSelected = activeMainOption === key;

                return (
                  <path
                    key={`main-${key}`}
                    d={`M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke="url(#main-grad)"
                    strokeWidth={isSelected ? "2.2" : "0.8"}
                    strokeDasharray={isSelected ? "none" : "3, 3"}
                    style={{
                      transition: 'stroke-width 0.2s ease',
                      opacity: isSelected ? 1 : 0.2
                    }}
                  />
                );
              })}

            {/* Column 2 -> 3 connections */}
            {activeSubOptions.map(([key]) => {
              const parentPos = positions[activeMainOption] || { x: 260, y: 155 };
              const subPos = positions[key] || { x: 505, y: 155 };
              
              const startX = parentPos.x + 200; 
              const startY = parentPos.y + 19;  
              const endX = subPos.x;            
              const endY = subPos.y + 21;       

              const controlX = (startX + endX) / 2;
              const isSelected = selectedNode === key;

              return (
                <path
                  key={`sub-${key}`}
                  d={`M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`}
                  fill="none"
                  stroke="url(#sub-grad)"
                  strokeWidth={isSelected ? "2.2" : "1"}
                  strokeDasharray={isSelected ? "none" : "3, 3"}
                  style={{
                    transition: 'stroke-width 0.2s ease',
                    opacity: isSelected ? 1 : 0.3
                  }}
                />
              );
            })}
          </svg>

          {/* COLUMN 1: TRIGGER */}
          <div 
            style={{
              position: 'absolute',
              left: `${positions['trigger']?.x || 25}px`,
              top: `${positions['trigger']?.y || 155}px`,
              width: '200px',
              zIndex: 10
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNode('trigger');
            }}
            className={`bg-slate-800/90 backdrop-blur border-2 rounded-xl p-3 shadow-xl cursor-default transition-all select-none ${
              isTriggerSelected ? 'border-primary shadow-primary/20 scale-102' : 'border-slate-700 hover:border-slate-650'
            }`}
          >
            <div 
              onMouseDown={(e) => handleStartDrag(e, 'trigger')}
              className="flex items-center justify-between mb-1.5 cursor-move border-b border-slate-700/60 pb-1"
            >
              <span className="bg-primary/20 text-primary text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Trigger</span>
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            </div>
            <h3 className="text-white font-bold text-xs mb-0.5">Campaign Outbox</h3>
            <p className="text-slate-400 text-[9px] line-clamp-3 leading-relaxed">
              {workflow.trigger.message || 'No trigger message.'}
            </p>
          </div>

          {/* COLUMN 2: MAIN OPTIONS (1-7) */}
          {Object.entries(workflow.options)
            .filter(([k]) => !k.includes('.'))
            .map(([key, opt]) => {
              const isActive = activeMainOption === key;
              const isSelected = selectedNode === key;
              const pos = positions[key] || { x: 260, y: 155 };

              return (
                <div 
                  key={key}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: '200px',
                    zIndex: 10
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMainOption(key);
                    setSelectedNode(key);
                  }}
                  className={`bg-slate-800/95 border rounded-lg px-2.5 py-1.5 cursor-default transition-all flex items-center gap-2 relative select-none ${
                    isSelected 
                      ? 'border-blue-500 bg-slate-800 scale-102 shadow-md shadow-blue-500/10' 
                      : isActive 
                        ? 'border-slate-600 bg-slate-800/90' 
                        : 'border-slate-750 hover:border-slate-700 bg-slate-850/80'
                  }`}
                >
                  <div 
                    onMouseDown={(e) => handleStartDrag(e, key)}
                    className="cursor-move flex-shrink-0 w-5.5 h-5.5 rounded font-bold flex items-center justify-center text-[10px] border bg-slate-700 text-slate-400 border-slate-655"
                  >
                    {key}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-[10px] truncate leading-tight">{opt.title}</h4>
                  </div>
                  <ArrowRight className={`w-3 h-3 text-slate-500 ${isActive ? 'text-blue-400' : 'opacity-0'}`} />
                </div>
              );
            })}

          {/* COLUMN 3: SUB-OPTIONS */}
          {activeSubOptions.map(([key, opt]) => {
            const isSelected = selectedNode === key;
            const pos = positions[key] || { x: 505, y: 155 };

            return (
              <div 
                key={key}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: '200px',
                  zIndex: 10
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(key);
                }}
                className={`bg-slate-800/95 border rounded-lg px-2.5 py-1.5 cursor-default transition-all flex items-center gap-2 relative select-none ${
                  isSelected 
                    ? 'border-purple-500 scale-102 shadow-md shadow-purple-500/10' 
                    : 'border-slate-750 hover:border-slate-700 bg-slate-850/80'
                }`}
              >
                <div 
                  onMouseDown={(e) => handleStartDrag(e, key)}
                  className="cursor-move flex-shrink-0 w-5.5 h-5.5 rounded font-bold flex items-center justify-center text-[9px] border bg-slate-700 text-slate-400 border-slate-655"
                >
                  {key}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-[10px] truncate leading-tight">{opt.title}</h4>
                  <p className="text-slate-500 text-[8px] truncate leading-none mt-0.5">{opt.reply}</p>
                </div>
              </div>
            );
          })}

          {/* Add Option Buttons */}
          <button 
            onClick={handleAddMainOption}
            style={{
              position: 'absolute',
              left: '260px',
              top: `${20 + Object.keys(workflow.options).filter(k => !k.includes('.')).length * 52}px`,
              width: '200px',
              zIndex: 10
            }}
            className="py-1 bg-slate-850 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-slate-650 rounded-lg text-slate-400 hover:text-slate-200 font-semibold text-[9px] transition flex items-center justify-center gap-1 shadow-sm"
          >
            <Plus className="w-3 h-3" />
            Add Main Route
          </button>

          <button 
            onClick={handleAddSubOption}
            style={{
              position: 'absolute',
              left: '505px',
              top: `${(positions[activeMainOption]?.y || 155) - 50 + activeSubOptions.length * 52}px`,
              width: '200px',
              zIndex: 10
            }}
            className="py-1 bg-slate-850 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-slate-650 rounded-lg text-slate-400 hover:text-slate-200 font-semibold text-[9px] transition flex items-center justify-center gap-1 shadow-sm"
          >
            <Plus className="w-3 h-3" />
            Add Sub Option
          </button>

        </div>

      {/* BOTTOM ROW: Split Node Editor & Live Grievance Desk Ticker */}
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Node Editor Card */}
          <div className="flex-[3] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
              <div>
                <h3 className="font-bold text-dark text-xs">
                  {isTriggerSelected 
                    ? 'Edit Trigger Outbox Message' 
                    : `Edit Node: Option ${selectedNode} (${selectedOption?.title || 'Untitled'})`}
                </h3>
              </div>
              {!isTriggerSelected && (
                <button 
                  onClick={() => handleDeleteNode(selectedNode)}
                  className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-650 font-bold bg-red-50 hover:bg-red-100 py-1 px-2.5 rounded-lg transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Node
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {!isTriggerSelected && (
                <div className="flex-1 flex flex-col gap-0.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Button Title</label>
                  <input 
                    type="text" 
                    value={selectedOption?.title || ''}
                    onChange={(e) => handleUpdateOptionTitle(selectedNode, e.target.value)}
                    placeholder="e.g. Outage Escalation"
                    className="border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary text-dark font-medium transition"
                  />
                </div>
              )}

              <div className="flex-[2] flex flex-col gap-0.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase">
                  {isTriggerSelected ? 'Initial Menu Message' : 'Automated Reply Content'}
                </label>
                <textarea 
                  rows={2}
                  value={isTriggerSelected ? workflow.trigger.message : selectedOption?.reply || ''}
                  onChange={(e) => isTriggerSelected ? handleUpdateTriggerMessage(e.target.value) : handleUpdateOptionReply(selectedNode, e.target.value)}
                  placeholder="Type automated reply copy..."
                  className="border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary text-dark font-medium transition resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Grievance Desk Live Ticker Panel */}
          <div className="flex-[2] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col overflow-hidden max-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Live Ward Grievance Desk</span>
              </div>
              <button 
                onClick={fetchGrievances} 
                disabled={fetchingGrievances}
                className="text-slate-500 hover:text-slate-300 transition"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingGrievances ? 'animate-spin text-primary' : ''}`} />
              </button>
            </div>

            {/* Scrollable grid of grievances */}
            <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
              {grievances.length === 0 ? (
                <div className="text-[10px] text-slate-500 text-center py-4">
                  No grievances logged yet. Send a report via the simulator.
                </div>
              ) : (
                grievances.map((gr) => {
                  const isNew = newGrievanceId === gr.id;
                  return (
                    <div 
                      key={gr.id}
                      className={`border rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[10px] transition duration-700 ${
                        isNew 
                          ? 'bg-green-500/10 border-primary scale-102' 
                          : 'bg-slate-850 border-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white font-bold text-[10px]">{gr.id}</span>
                          <span className="text-slate-400 font-semibold text-[9px]">{gr.type}</span>
                        </div>
                        <p className="text-slate-500 text-[9px] truncate">Loc: {gr.location}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                          gr.status === 'In Progress' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {gr.status}
                        </span>
                        <span className="text-slate-600 text-[8px]">
                          {new Date(gr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT SECTION: WhatsApp Live Simulator */}
      <div className="w-full lg:w-96 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4">
        
        {/* Broadcast Panel */}
        <div className="bg-slate-800 rounded-2xl p-3 mb-3 flex flex-col gap-2 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">MLA Broadcast Panel</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${broadcastSent ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {broadcastSent ? 'Broadcast Sent' : 'Ready'}
            </span>
          </div>

          <button 
            onClick={handleSendBroadcast}
            disabled={sendingBroadcast || broadcastSent}
            className="w-full bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20 text-xs"
          >
            {sendingBroadcast ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Broadcasting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send Campaign to Contacts
              </>
            )}
          </button>

          {/* Broadcast Progress Bar */}
          {sendingBroadcast && (
            <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${broadcastProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* WhatsApp Mobile Frame */}
        <div className="flex-1 bg-[#efeae2] rounded-2xl overflow-hidden flex flex-col border border-slate-850 relative">
          
          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-white/20">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs truncate">Dr. Ramesh Gowda (MLA)</h4>
              <p className="text-[9px] text-green-200 font-medium">Official Campaign Channel</p>
            </div>
            <Phone className="w-3.5 h-3.5 opacity-80 cursor-pointer" />
          </div>

          {/* Conversation Chat Bubbles Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col scrollbar-thin bg-opacity-40 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
            
            {chatMessages.length === 0 && (
              <div className="my-auto text-center p-4">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto opacity-40 mb-2" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Press <strong>"Send Campaign to Contacts"</strong> above to launch the simulation and start receiving automatic responses.
                </p>
              </div>
            )}

            {chatMessages.map((msg) => {
              const isInbound = msg.direction === 'inbound';
              const isSystem = msg.senderType === 'system';
              const isAgent = msg.senderType === 'agent';
              const isImage = msg.messageType === 'image';

              if (isSystem) {
                return (
                  <div key={msg.id} className="bg-yellow-100 text-yellow-800 text-[9px] font-bold py-1 px-3.5 rounded-full shadow-sm max-w-[90%] self-center text-center my-1.5 border border-yellow-200 border-dashed">
                    {msg.content}
                  </div>
                );
              }

              return (
                <div 
                  key={msg.id}
                  className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm text-xs relative flex flex-col ${
                    isInbound 
                      ? 'bg-[#d9fdd3] text-dark self-end rounded-tr-none' 
                      : isAgent 
                        ? 'bg-[#e2e8f0] text-dark self-start rounded-tl-none border-l-4 border-blue-500'
                        : 'bg-white text-dark self-start rounded-tl-none'
                  }`}
                >
                  {isAgent && (
                    <span className="text-[9px] text-blue-500 font-bold mb-0.5">Ramesh (Ward Representative)</span>
                  )}

                  {/* Render Image Box inside chat if it is an image message */}
                  {isImage ? (
                    <div className="bg-slate-800 text-white rounded-lg p-2.5 flex items-center gap-3 mb-1 border border-slate-700/60 shadow-inner">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-primary border border-slate-700">
                        <Image className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold truncate">Grievance_Report_Photo.jpg</p>
                        <p className="text-[8px] text-slate-400">420 KB • Image Attachment</p>
                      </div>
                    </div>
                  ) : null}

                  <p className="whitespace-pre-wrap leading-relaxed pb-3 pr-4">{msg.content}</p>
                  
                  {/* Timestamp / check marks */}
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[9px] text-gray-500">
                    <span>{msg.timestamp}</span>
                    {!isInbound && (
                      <CheckCheck className={`w-3.5 h-3.5 ${isAgent ? 'text-slate-400' : 'text-blue-500'}`} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Simulated typing bubbles */}
            {isTyping && (
              <div className="bg-white text-dark self-start rounded-lg rounded-tl-none px-3 py-2.5 shadow-sm text-xs flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Interactive Dynamic Quick Action Helper Chips */}
          {broadcastSent && (
            <div className="bg-[#efeae2] bg-opacity-95 px-3 py-2 border-t border-gray-200/40 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none z-10 shadow-inner">
              {getHelperChips().map((chip, idx) => (
                <button
                  key={`${chip.code}-${idx}`}
                  onClick={() => handleSendSimulatorMessage(chip.code)}
                  className="bg-white border border-gray-200 hover:border-primary text-slate-700 hover:text-primary font-bold text-[10px] py-1 px-3 rounded-full shadow-sm transition active:scale-95 flex-shrink-0 animate-fade-in"
                >
                  {chip.text}
                </button>
              ))}
            </div>
          )}

          {/* Camera/Attachment Upload Overlay Dropup Menu */}
          {showAttachments && (
            <div className="absolute bottom-14 left-4 bg-white border border-gray-200 rounded-2xl p-2.5 shadow-xl flex flex-col gap-1.5 z-30 w-52 animate-fade-in">
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider px-2 pb-1 border-b border-gray-100">AI vision simulations</span>
              
              <button 
                onClick={() => handleSendSimulatorMessage("pothole", "image")}
                className="w-full text-left text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition flex items-center gap-2 text-slate-700"
              >
                <Camera className="w-3.5 h-3.5" />
                Upload Pothole Photo
              </button>
              
              <button 
                onClick={() => handleSendSimulatorMessage("streetlight", "image")}
                className="w-full text-left text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition flex items-center gap-2 text-slate-700"
              >
                <Camera className="w-3.5 h-3.5" />
                Upload Streetlight Photo
              </button>

              <button 
                onClick={() => handleSendSimulatorMessage("garbage", "image")}
                className="w-full text-left text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition flex items-center gap-2 text-slate-700"
              >
                <Camera className="w-3.5 h-3.5" />
                Upload Garbage Photo
              </button>
            </div>
          )}

          {/* Input text bar */}
          <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-gray-200">
            {/* Attachment Button */}
            <button 
              onClick={() => setShowAttachments(!showAttachments)}
              disabled={!broadcastSent}
              className="w-8 h-8 rounded-full hover:bg-gray-200 text-slate-600 flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendSimulatorMessage()}
              placeholder={broadcastSent ? "Type selection (e.g. 153 apartment)..." : "Send campaign broadcast first"}
              disabled={!broadcastSent}
              className="flex-1 bg-white border-none focus:outline-none rounded-lg py-2 px-3 text-xs text-dark disabled:bg-gray-150 disabled:cursor-not-allowed"
            />
            <button 
              onClick={() => handleSendSimulatorMessage()}
              disabled={!inputValue.trim() || !broadcastSent}
              className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008f72] text-white flex items-center justify-center shadow-md transition disabled:opacity-40 disabled:scale-100 active:scale-90"
            >
              <Send className="w-3.5 h-3.5 transform rotate-45 mr-0.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
