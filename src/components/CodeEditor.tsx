import React, { useState } from 'react';
import { AetherElement } from '../types';
import { Terminal, RefreshCw, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

interface CodeEditorProps {
  selectedElement: AetherElement | null;
  updateElementCode: (id: string, textContent: string, classAttr: string, idAttr: string) => void;
}

export default function CodeEditor({
  selectedElement,
  updateElementCode
}: CodeEditorProps) {
  const [htmlCode, setHtmlCode] = useState(selectedElement?.attributes.textContent || '');
  const [cssClass, setCssClass] = useState(selectedElement?.attributes.classAttr || '');
  const [idAttr, setIdAttr] = useState(selectedElement?.attributes.idAttr || '');
  const [logs, setLogs] = useState<string[]>(["[AetherCompiler] Monaco Editor Sandbox active.", "[AetherCompiler] Changes sync instantly."]);

  // Sync state if element selection switches
  React.useEffect(() => {
    if (selectedElement) {
      setHtmlCode(selectedElement.attributes.textContent || '');
      setCssClass(selectedElement.attributes.classAttr || '');
      setIdAttr(selectedElement.attributes.idAttr || '');
    }
  }, [selectedElement]);

  const handleApply = () => {
    if (!selectedElement) return;
    updateElementCode(selectedElement.id, htmlCode, cssClass, idAttr);
    setLogs(prev => [...prev, `[Success] Synced Element ID ${selectedElement.id} to active model.`]);
  };

  if (!selectedElement) {
    return (
      <div className="flex-1 bg-[#0b0c16] flex flex-col items-center justify-center text-slate-500 text-xs p-6">
        <Terminal className="w-12 h-12 mb-3 text-indigo-400/20" />
        <p className="text-center max-w-sm">Select an element on the canvas or tree layout to access direct code editing controls.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#090b14] flex flex-col text-slate-300 h-full overflow-hidden select-none font-mono">
      {/* Top action header trigger */}
      <div className="bg-[#111322] px-6 py-3 border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4.5 h-4.5 text-indigo-400" />
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Monaco-style Custom Code Sandbox</h2>
        </div>
        <button 
          onClick={handleApply}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 transition shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Apply Code Sync
        </button>
      </div>

      {/* Editor Body layouts */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 overflow-y-auto">
        
        {/* HTML / Inner Text Content text area editor */}
        <div className="flex flex-col h-full bg-[#111322] border border-white/5 rounded-lg overflow-hidden">
          <div className="bg-black/30 px-4 py-2 border-b border-white/5 flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
            <span>HTML Element text value</span>
          </div>
          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            className="flex-1 w-full bg-[#0d0e1b]/70 border-none outline-none p-4 text-xs font-mono text-cyan-300 resize-none scrollbar-thin"
            placeholder="e.g. hello, world! or child component contents..."
          />
        </div>

        {/* CSS Clases, IDs modifier block attributes */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-1 bg-[#111322] border border-white/5 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-black/30 px-4 py-2 border-b border-white/5 flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
              <span>Tailwind Class strings</span>
            </div>
            <textarea
              value={cssClass}
              onChange={(e) => setCssClass(e.target.value)}
              className="flex-1 w-full bg-[#0d0e1b]/70 border-none outline-none p-4 text-xs font-mono text-indigo-300 resize-none scrollbar-thin"
              placeholder="e.g. flex items-center max-w-sm font-bold bg-white"
            />
          </div>

          <div className="bg-[#111322] border border-white/5 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-black/30 px-4 py-2 border-b border-white/5 flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
              <span>Visual HTML ID tag override</span>
            </div>
            <input
              type="text"
              value={idAttr}
              onChange={(e) => setIdAttr(e.target.value)}
              className="w-full bg-[#0d0e1b]/70 border-none outline-none p-3 text-xs font-mono text-yellow-300"
              placeholder="e.g. signup-form-wrapper"
            />
          </div>
        </div>

      </div>

      {/* Compiler feedback log window */}
      <div className="bg-slate-950 border-t border-white/5 p-4 h-36 flex flex-col">
        <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold block mb-1.5">Compiler sandbox feedback logs</span>
        <div className="flex-1 overflow-y-auto space-y-1 text-[10px] text-slate-400 scrollbar-thin scrollbar-track-slate-950 font-mono">
          {logs.map((logStr, i) => (
            <p key={i} className={logStr.includes("[Success]") ? "text-emerald-400" : "text-slate-400"}>
              {logStr}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
}
