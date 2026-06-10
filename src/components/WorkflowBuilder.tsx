import React, { useState } from 'react';
import { AetherElement, WorkflowBlock } from '../types';
import { Play, Plus, Trash2, ArrowRight, Save, Puzzle, Code, Zap } from 'lucide-react';

interface WorkflowBuilderProps {
  workflows: WorkflowBlock[];
  setWorkflows: (blocks: WorkflowBlock[]) => void;
  rootNode: AetherElement;
}

export default function WorkflowBuilder({
  workflows,
  setWorkflows,
  rootNode
}: WorkflowBuilderProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  // Flatten elements tree to feed "target select" dropdown selections
  const getAllElements = (node: AetherElement): { id: string; name: string; type: any }[] => {
    let list = [{ id: node.id, name: node.name, type: node.type }];
    if (node.children) {
      node.children.forEach(child => {
        list = [...list, ...getAllElements(child)];
      });
    }
    return list;
  };

  const elementsList = getAllElements(rootNode);

  // Add a new starting visual Trigger block
  const addTriggerBlock = () => {
    const newBlock: WorkflowBlock = {
      id: `trigger-${Date.now()}`,
      type: 'trigger',
      name: 'On Click Element',
      targetElementId: elementsList[0]?.id || 'root-node',
    };
    setWorkflows([...workflows, newBlock]);
    setSelectedWorkflowId(newBlock.id);
  };

  // Chain another consecutive child visual Action block
  const appendActionBlock = (parentId: string) => {
    const parentBlock = workflows.find(b => b.id === parentId);
    if (!parentBlock) return;

    const actionId = `action-${Date.now()}`;
    const newActionBlock: WorkflowBlock = {
      id: actionId,
      type: 'action',
      name: 'Set Element CSS style',
      actionType: 'setProperty',
      parentId: parentId,
      targetElementId: elementsList[0]?.id || '',
      propertyKey: 'backgroundColor',
      propertyValue: '#2563eb'
    };

    // Update parent's next chain block
    const updatedWorkflows = workflows.map(w => {
      if (w.id === parentId) {
        return { ...w, nextBlockId: actionId };
      }
      return w;
    });

    setWorkflows([...updatedWorkflows, newActionBlock]);
  };

  const deleteBlock = (id: string) => {
    // Break the link and delete
    const blockToDelete = workflows.find(b => b.id === id);
    const parentBlock = workflows.find(b => b.nextBlockId === id);

    let updated = workflows.filter(b => b.id !== id);
    if (parentBlock) {
      updated = updated.map(b => {
        if (b.id === parentBlock.id) {
          return { ...b, nextBlockId: blockToDelete?.nextBlockId };
        }
        return b;
      });
    }
    // link successor to parent
    if (blockToDelete?.nextBlockId) {
      updated = updated.map(b => {
        if (b.id === blockToDelete.nextBlockId) {
          return { ...b, parentId: parentBlock?.id };
        }
        return b;
      });
    }

    setWorkflows(updated);
    if (selectedWorkflowId === id) setSelectedWorkflowId(null);
  };

  // Modify block fields
  const updateBlock = (id: string, updates: Partial<WorkflowBlock>) => {
    setWorkflows(workflows.map(w => (w.id === id ? { ...w, ...updates } : w)));
  };

  // Compile active block workflow chain into clear readable JavaScript
  const generateCodeForChain = (startBlockId: string): string => {
    let code = '';
    let current = workflows.find(b => b.id === startBlockId);
    let indent = '  ';

    if (current?.type === 'trigger') {
      const selector = current.targetElementId;
      code += `// Trigger: On click element #${selector}\n`;
      code += `const emitter = document.getElementById("${selector}");\n`;
      code += `if (emitter) {\n`;
      code += `  emitter.addEventListener("click", () => {\n`;
      
      let nextId = current.nextBlockId;
      while (nextId) {
        const action = workflows.find(b => b.id === nextId);
        if (!action) break;

        if (action.actionType === 'setProperty') {
          code += `${indent}  const targetNode = document.getElementById("${action.targetElementId}");\n`;
          code += `${indent}  if (targetNode) {\n`;
          code += `${indent}    targetNode.style.${action.propertyKey} = "${action.propertyValue}";\n`;
          code += `${indent}  }\n`;
        } else if (action.actionType === 'fetchApi') {
          code += `${indent}  fetch("${action.fetchUrl || 'https://api.example.com'}", { method: "${action.fetchMethod || 'GET'}" })\n`;
          code += `${indent}    .then(r => r.json())\n`;
          code += `${indent}    .then(data => { console.log("Aether REST Output:", data); })\n`;
          code += `${indent}    .catch(e => { console.error("Aether API Call Error: ", e); });\n`;
        } else if (action.actionType === 'customCode') {
          code += `${indent}  try {\n`;
          code += `${indent}    ${action.jsCode ? action.jsCode.split('\n').join('\n' + indent + '    ') : '// type script code'}\n`;
          code += `${indent}  } catch(e) { console.error("Run Script error: ", e); }\n`;
        }
        nextId = action.nextBlockId;
      }
      code += `  });\n`;
      code += `}\n`;
    }
    return code;
  };

  const getFullCompiledCode = (): string => {
    const triggerBlocks = workflows.filter(b => b.type === 'trigger');
    if (triggerBlocks.length === 0) return '// No triggers defined yet. Add a click workflow above!';
    return triggerBlocks.map(tb => generateCodeForChain(tb.id)).join('\n\n');
  };

  return (
    <div className="flex-1 bg-[#0b0c16] flex text-slate-200 h-full overflow-hidden select-none">
      
      {/* LHS Visual Workflow canvas stage */}
      <div className="flex-1 p-6 flex flex-col h-full overflow-y-auto border-r border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Logic Scratch workflow Designer</h2>
          </div>
          <button 
            onClick={addTriggerBlock}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" /> Assemble Trigger
          </button>
        </div>

        {/* Scratch block layout area */}
        <div className="flex-1 min-h-[400px] border border-white/5 rounded-lg bg-[#141624]/30 relative p-8 flex flex-col space-y-4">
          
          {workflows.filter(b => b.type === 'trigger').length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Puzzle className="w-12 h-12 mb-3 text-indigo-400/20" />
              <p className="text-center max-w-sm mb-4">No logic workflows exist in this app yet. Initialize an UI Trigger to listen for element click events.</p>
              <button 
                onClick={addTriggerBlock} 
                className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 rounded hover:bg-indigo-600/50 transition font-medium text-[11px]"
              >
                Create Starting Trigger
              </button>
            </div>
          ) : (
            workflows.filter(b => b.type === 'trigger').map(triggerBlock => {
              // Traverse chain and list them matching vertical Scratch brackets design
              const chain: WorkflowBlock[] = [triggerBlock];
              let nextId = triggerBlock.nextBlockId;
              while (nextId) {
                const act = workflows.find(b => b.id === nextId);
                if (act) {
                  chain.push(act);
                  nextId = act.nextBlockId;
                } else {
                  break;
                }
              }

              return (
                <div key={triggerBlock.id} className="bg-slate-900/40 p-4 rounded-lg border border-indigo-500/10 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Scratch trigger representation tag */}
                    {chain.map((block, index) => (
                      <React.Fragment key={block.id}>
                        <div 
                          onClick={() => setSelectedWorkflowId(block.id)}
                          className={`cursor-pointer px-4 py-2.5 rounded-lg border shadow-lg transition-all text-xs font-mono flex items-center gap-2.5 relative ${
                            selectedWorkflowId === block.id 
                              ? 'bg-indigo-600 text-white border-indigo-400' 
                              : block.type === 'trigger' 
                              ? 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30' 
                              : 'bg-[#818cf8]/20 text-[#818cf8] border-[#818cf8]/30'
                          }`}
                        >
                          {block.type === 'trigger' ? '⚡' : '⚙️'}
                          <div>
                            <span className="block font-bold text-[10px] uppercase opacity-75">{block.type}</span>
                            <span className="text-[11px] font-sans font-medium">{block.name}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                            className="bg-black/20 hover:bg-red-500/20 hover:text-red-400 p-1 rounded-md transition text-slate-400 ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {index < chain.length - 1 && <ArrowRight className="w-4 h-4 text-slate-600" />}
                      </React.Fragment>
                    ))}

                    {/* Button appending consecutive actions */}
                    <button 
                      onClick={() => appendActionBlock(chain[chain.length - 1].id)}
                      className="dashed-btn border border-dashed border-white/20 hover:border-indigo-400 px-3.5 py-2.5 rounded-lg flex items-center text-xs text-slate-400 hover:text-white transition"
                    >
                      <Plus className="w-4 h-4 mr-1.5 text-indigo-400" /> Action
                    </button>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RHS block property editor config & compiled JavaScript panel */}
      <div className="w-80 bg-[#161824] border-l border-white/5 flex flex-col h-full font-sans">
        
        {/* Selected block customized editing panel inputs */}
        <div className="p-4 border-b border-white/5 flex-1 overflow-y-auto space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Block properties</h3>
          
          {selectedWorkflowId ? (
            (() => {
              const b = workflows.find(w => w.id === selectedWorkflowId);
              if (!b) return <p className="text-xs text-slate-500 italic">No block selected</p>;

              return (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Block Type</label>
                    <input 
                      type="text" 
                      value={b.name} 
                      onChange={(e) => updateBlock(b.id, { name: e.target.value })}
                      className="w-full bg-[#10111a] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  {b.type === 'trigger' && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Source Element Target</label>
                      <select 
                        value={b.targetElementId || ''} 
                        onChange={(e) => updateBlock(b.id, { targetElementId: e.target.value })}
                        className="w-full bg-[#10111a] border border-white/10 rounded px-2.5 py-1.5 text-white"
                      >
                        {elementsList.map(item => (
                          <option key={item.id} value={item.id}>{item.name} ({item.type})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {b.type === 'action' && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Action Flow Mode</label>
                        <select 
                          value={b.actionType} 
                          onChange={(e) => updateBlock(b.id, { actionType: e.target.value as any, name: e.target.value === 'setProperty' ? 'Set Element CSS style' : e.target.value === 'fetchApi' ? 'Call REST API' : 'Run Custom Script' })}
                          className="w-full bg-[#10111a] border border-white/10 rounded px-2.5 py-1.5 text-white"
                        >
                          <option value="setProperty">Modify Visual Style property</option>
                          <option value="fetchApi">Call REST Endpoint</option>
                          <option value="customCode">Run Custom Javascript Script</option>
                        </select>
                      </div>

                      {b.actionType === 'setProperty' && (
                        <div className="space-y-3 bg-black/20 p-2.5 rounded border border-white/5 font-mono">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Target Element</span>
                            <select 
                              value={b.targetElementId || ''} 
                              onChange={(e) => updateBlock(b.id, { targetElementId: e.target.value })}
                              className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs text-sans"
                            >
                              {elementsList.map(item => (
                                <option key={item.id} value={item.id}>{item.name} ({item.type})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">CSS attribute</span>
                            <input 
                              type="text" 
                              value={b.propertyKey || ''} 
                              onChange={(e) => updateBlock(b.id, { propertyKey: e.target.value })}
                              className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Replacement Value</span>
                            <input 
                              type="text" 
                              value={b.propertyValue || ''} 
                              onChange={(e) => updateBlock(b.id, { propertyValue: e.target.value })}
                              className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {b.actionType === 'fetchApi' && (
                        <div className="space-y-3 bg-black/20 p-2.5 rounded border border-white/5 font-mono">
                          <div>
                            <span className="text-[10px] text-slate-500 block">URL Input</span>
                            <input 
                              type="text" 
                              value={b.fetchUrl || ''} 
                              onChange={(e) => updateBlock(b.id, { fetchUrl: e.target.value })}
                              placeholder="https://api.coindesk.com/v1/bpi/currentprice.json"
                              className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Method</span>
                            <select 
                              value={b.fetchMethod || 'GET'} 
                              onChange={(e) => updateBlock(b.id, { fetchMethod: e.target.value as any })}
                              className="w-full bg-[#10111a] border border-[#ffffff1a] rounded px-2 py-1 text-white text-xs"
                            >
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {b.actionType === 'customCode' && (
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-indigo-400 mb-1">Custom JS Editor</label>
                          <textarea 
                            value={b.jsCode || ''} 
                            onChange={(e) => updateBlock(b.id, { jsCode: e.target.value })}
                            placeholder="// Enter ES5 raw javascript\nalert('Visual Flow Executed!');"
                            rows={8}
                            className="w-full bg-[#10111a] border border-white/10 rounded px-2.5 py-2 text-white font-mono text-xs"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <p className="text-slate-500 text-xs italic">Select any block chain node above to unlock styles editing.</p>
          )}

        </div>

        {/* Dynamic code compiler output window */}
        <div className="p-4 border-t border-white/5 h-64 flex flex-col bg-slate-950">
          <div className="flex items-center gap-2 mb-2 text-[10px] uppercase font-bold text-slate-400">
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Javascript Compiler output</span>
          </div>
          <pre className="flex-1 bg-black/40 border border-white/5 p-2 rounded text-[10px] font-mono text-emerald-400 overflow-y-auto whitespace-pre scrollbar-thin">
            {getFullCompiledCode()}
          </pre>
        </div>

      </div>

    </div>
  );
}
