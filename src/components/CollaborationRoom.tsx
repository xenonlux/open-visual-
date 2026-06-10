import React, { useState, useEffect } from 'react';
import { Users, GitBranch, GitCommit, GitMerge, Plus, Check, RefreshCw } from 'lucide-react';

interface ChangeLogEntry {
  id: string;
  user: string;
  branch: string;
  action: string;
  time: string;
}

export default function CollaborationRoom() {
  const [activeBranch, setActiveBranch] = useState('main');
  const [branches, setBranches] = useState(['main', 'staging', 'experimental-auth']);
  const [newBranchInput, setNewBranchInput] = useState('');
  const [updating, setUpdating] = useState(false);

  // Simulated live change log markers
  const [logs, setLogs] = useState<ChangeLogEntry[]>([
    { id: '1', user: 'Liam Peterson (Architect)', branch: 'main', action: 'Created starting database schema config models', time: '12 mins ago' },
    { id: '2', user: 'Sofia Lopez (Designer)', branch: 'staging', action: 'Polished main color alignments on banner', time: '2 mins ago' },
    { id: '3', user: 'You', branch: 'main', action: 'Configured workflows and logic trigger handlers', time: 'Just now' }
  ]);

  // Dynamic avatars that move across workspace simulation to mimic WebSocket cursors
  const [cursors, setCursors] = useState([
    { id: 'sofia', name: 'Sofia Lopez (Designer)', color: '#ec4899', x: 250, y: 180 },
    { id: 'liam', name: 'Liam Peterson (Architect)', color: '#3b82f6', x: 740, y: 310 }
  ]);

  useEffect(() => {
    // Mimic mouse movements
    const interval = setInterval(() => {
      setCursors(prev => prev.map(c => ({
        ...c,
        x: Math.max(50, Math.min(800, c.x + (Math.random() - 0.5) * 50)),
        y: Math.max(50, Math.min(500, c.y + (Math.random() - 0.5) * 40))
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const createBranchInput = () => {
    if (!newBranchInput.trim()) return;
    setBranches([...branches, newBranchInput.trim()]);
    setLogs(prev => [
      { id: Date.now().toString(), user: 'You', branch: activeBranch, action: `Created new branch "${newBranchInput.trim()}"`, time: 'Just now' },
      ...prev
    ]);
    setActiveBranch(newBranchInput.trim());
    setNewBranchInput('');
  };

  const mergeActiveBranch = () => {
    if (activeBranch === 'main') return;
    setUpdating(true);
    setTimeout(() => {
      setLogs(prev => [
        { id: Date.now().toString(), user: 'You', branch: 'main', action: `Merged "${activeBranch}" branch cleanly into main`, time: 'Just now' },
        ...prev
      ]);
      setActiveBranch('main');
      setUpdating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[#0b0c16] flex text-slate-200 h-full overflow-hidden select-none font-sans">
      
      {/* LHS branch viewer & Merge operations controls */}
      <div className="flex-1 p-6 flex flex-col h-full overflow-y-auto border-r border-white/5 space-y-6">
        
        {/* Collaborative canvas simulator */}
        <div className="flex items-center justify-between col-span-full">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">WebSocket presence simulator</h2>
          </div>
          <span className="text-[11px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono px-2 py-0.5 rounded uppercase tracking-wide">
            Presence: 3 Team members connected
          </span>
        </div>

        {/* Cursor tracking stage wrapper */}
        <div className="flex-1 min-h-[350px] bg-[#121421]/40 border border-dashed border-white/10 rounded-lg relative p-6">
          <p className="text-xs text-slate-500 text-center max-w-sm mx-auto mt-20">
            This workspace implements active collaboration visual loops. Below cursors represent other team members editing the same canvas simultaneously:
          </p>

          {/* Render cursors */}
          {cursors.map(cursor => (
            <div 
              key={cursor.id}
              className="absolute pointer-events-none transition-all duration-1000 ease-out flex flex-col items-start gap-1 z-50 text-[10px]"
              style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
            >
              <div 
                className="w-3 h-3 rounded-full opacity-80" 
                style={{ backgroundColor: cursor.color, boxShadow: `0 0 12px ${cursor.color}` }} 
              />
              <span 
                className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] text-white font-medium shadow-md whitespace-nowrap"
                style={{ borderLeft: `2px solid ${cursor.color}` }}
              >
                {cursor.name}
              </span>
            </div>
          ))}
        </div>

        {/* Git like Branch control drawer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#121422] p-4 rounded-lg border border-white/5 space-y-3.5">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Branching & Environments</span>
            <div className="flex gap-2 text-xs">
              <select 
                value={activeBranch} 
                onChange={(e) => setActiveBranch(e.target.value)}
                className="flex-1 bg-[#0b0c16] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
              >
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <button 
                onClick={mergeActiveBranch} 
                disabled={activeBranch === 'main' || updating}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs px-3.5 py-1.5 rounded flex items-center gap-1 transition"
              >
                {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitMerge className="w-3.5 h-3.5" />} Merge
              </button>
            </div>
          </div>

          <div className="bg-[#121422] p-4 rounded-lg border border-white/5 space-y-3">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Spawn New Git Branch</span>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newBranchInput}
                onChange={(e) => setNewBranchInput(e.target.value)}
                placeholder="branch-name"
                className="flex-1 bg-[#0b0c16] border border-white/10 rounded px-3 py-1.5 text-white text-xs"
              />
              <button 
                onClick={createBranchInput}
                className="bg-slate-700 hover:bg-slate-600 font-medium px-3 py-1 rounded text-xs transition flex items-center justify-center gap-1.5 text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Fork
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RHS commit change log trackers panel */}
      <div className="w-80 bg-[#161824] border-l border-white/5 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider pb-2 border-b border-white/5">Visual change log commits</h3>
        
        <div className="space-y-4 text-xs">
          {logs.map(log => (
            <div key={log.id} className="relative pl-5 border-l border-white/10 space-y-1">
              <div className="absolute top-1 -left-1.5 w-3 h-3 rounded-full bg-indigo-500/30 flex items-center justify-center border border-indigo-400/50">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>
              <p className="font-semibold text-slate-200 text-[11px] font-mono leading-none">{log.user}</p>
              <p className="text-[10px] bg-black/20 p-1 rounded font-mono text-indigo-300 w-fit leading-none mb-1">
                branch: {log.branch}
              </p>
              <p className="text-xs text-slate-400 max-w-[220px] leading-tight">{log.action}</p>
              <span className="text-[9px] text-slate-500 block">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
