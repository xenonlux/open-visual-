import React, { useState } from 'react';
import { DatabaseTable, DatabaseRelation, DatabaseColumn } from '../types';
import { Database, Plus, Trash2, Key, HelpCircle, HardDrive, Code, ShieldCheck } from 'lucide-react';

interface BackendDesignerProps {
  tables: DatabaseTable[];
  setTables: (t: DatabaseTable[]) => void;
  relations: DatabaseRelation[];
  setRelations: (r: DatabaseRelation[]) => void;
}

export default function BackendDesigner({
  tables,
  setTables,
  relations,
  setRelations
}: BackendDesignerProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [authEnabled, setAuthEnabled] = useState(true);

  // Schema Table Creators
  const createNewTable = () => {
    const tableId = `table-${Date.now()}`;
    const newTable: DatabaseTable = {
      id: tableId,
      name: `New_Schema_Table_${tables.length + 1}`,
      columns: [
        { id: `col-id-${Date.now()}`, name: 'id', type: 'String', isId: true, isRequired: true, isUnique: true }
      ]
    };
    setTables([...tables, newTable]);
    setSelectedTableId(tableId);
  };

  const deleteTable = (tableId: string) => {
    setTables(tables.filter(t => t.id !== tableId));
    if (selectedTableId === tableId) setSelectedTableId(null);
  };

  // Add Column attributes to selected Schema table
  const addColumnToTable = (tableId: string) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        const newCol: DatabaseColumn = {
          id: `col-${Date.now()}`,
          name: `field_${t.columns.length}`,
          type: 'String',
          isId: false,
          isRequired: false,
          isUnique: false
        };
        return { ...t, columns: [...t.columns, newCol] };
      }
      return t;
    });
    setTables(updated);
  };

  const deleteColumn = (tableId: string, colId: string) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        return { ...t, columns: t.columns.filter(c => c.id !== colId) };
      }
      return t;
    });
    setTables(updated);
  };

  const updateColumn = (tableId: string, colId: string, updates: Partial<DatabaseColumn>) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          columns: t.columns.map(c => (c.id === colId ? { ...c, ...updates } : c))
        };
      }
      return t;
    });
    setTables(updated);
  };

  const updateTableName = (tableId: string, name: string) => {
    setTables(tables.map(t => (t.id === tableId ? { ...t, name } : t)));
  };

  // Automatically generated schema views (Prisma DSL compilation representation)
  const getPrismaSchemaText = (): string => {
    let schemaStr = `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\n`;

    tables.forEach(t => {
      schemaStr += `model ${t.name} {\n`;
      t.columns.forEach(c => {
        let line = `  ${c.name} ${c.type}`;
        if (c.isId) line += ' @id @default(uuid())';
        if (c.isUnique && !c.isId) line += ' @unique';
        if (!c.isRequired && !c.isId) line += '?';
        if (c.defaultValue) line += ` @default(${c.defaultValue})`;
        schemaStr += line + '\n';
      });
      schemaStr += '}\n\n';
    });

    if (authEnabled) {
      schemaStr += `model Session {\n  id        String   @id @default(uuid())\n  userId    String\n  token     String   @unique\n  expiresAt DateTime\n}`;
    }

    return schemaStr;
  };

  return (
    <div className="flex-1 bg-[#0b0c16] flex text-slate-200 h-full overflow-hidden select-none">
      
      {/* Visual Workspace containing Entity-Relationship model */}
      <div className="flex-1 p-6 flex flex-col h-full overflow-y-auto border-r border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Visual ERD & Database Builder</h2>
          </div>
          <button 
            onClick={createNewTable} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" /> Create Schema Table
          </button>
        </div>

        {/* Database grid view illustrating schema tables side by side */}
        <div className="flex-1 min-h-[400px] border border-white/5 rounded-lg bg-[#141624]/30 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
          {tables.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-slate-500 text-xs py-10">
              <HardDrive className="w-12 h-12 mb-3 text-indigo-400/20" />
              <p className="text-center max-w-sm mb-4">No relational database tables declared yet. Define columns & relations to construct backend routes.</p>
              <button 
                onClick={createNewTable}
                className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 rounded hover:bg-indigo-600/50 transition font-medium text-[11px]"
              >
                Construct Starting Table
              </button>
            </div>
          ) : (
            tables.map(table => (
              <div 
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={`rounded-lg bg-[#111322] border overflow-hidden cursor-pointer transition shadow-xl ${
                  selectedTableId === table.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="bg-[#171a2d] px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <input 
                      type="text" 
                      value={table.name} 
                      onChange={(e) => updateTableName(table.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none text-xs font-semibold text-white focus:ring-1 focus:ring-indigo-500 rounded px-1 max-w-[120px] outline-none"
                    />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }}
                    className="hover:text-red-400 p-1 rounded transition text-slate-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Table Schema list of attributes representatively detailed */}
                <div className="p-3 space-y-1.5 text-[11px]">
                  {table.columns.map(col => (
                    <div key={col.id} className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-white/[0.02]">
                      <div className="flex items-center gap-1.5">
                        {col.isId ? <Key className="w-3 h-3 text-yellow-500" /> : <div className="w-3" />}
                        <span className="font-mono text-slate-200">{col.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-[#0f111d] px-1.5 py-0.5 rounded font-mono uppercase">{col.type}</span>
                    </div>
                  ))}

                  <button 
                    onClick={(e) => { e.stopPropagation(); addColumnToTable(table.id); }}
                    className="w-full mt-3 py-1 text-center bg-black/20 hover:bg-indigo-600/10 text-indigo-400 rounded-md border border-dashed border-indigo-500/10 hover:border-indigo-500/20 text-[10px] uppercase font-bold transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Append Attribute
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RHS Database structure configurator column settings and Prisma compiling view */}
      <div className="w-80 bg-[#161824] border-l border-white/5 flex flex-col h-full font-sans">
        
        {/* Visual column details editor triggers */}
        <div className="p-4 border-b border-white/5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Attribute Config</h3>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-between text-xs py-1.5 px-2 bg-[#22c55e]/5 text-[#22c55e] rounded border border-[#22c55e]/15">
            <span>Authentication Engine (Auth)</span>
            <input 
              type="checkbox" 
              checked={authEnabled} 
              onChange={() => setAuthEnabled(!authEnabled)}
              className="accent-indigo-500 rounded border-white/10"
            />
          </div>

          {selectedTableId ? (
            (() => {
              const table = tables.find(t => t.id === selectedTableId);
              if (!table) return <p className="text-xs text-slate-500 italic">No table selected</p>;

              return (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 block pb-1 border-b border-white/5">Attributes on "{table.name}"</span>
                  {table.columns.map(col => (
                    <div key={col.id} className="p-2.5 rounded bg-black/30 border border-white/5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <input 
                          type="text" 
                          value={col.name} 
                          onChange={(e) => updateColumn(table.id, col.id, { name: e.target.value })}
                          className="bg-[#10111a] border border-white/10 rounded px-1.5 py-0.5 text-xs text-white font-mono flex-1 outline-none mr-2 focus:border-indigo-500"
                        />
                        {table.columns.length > 1 && (
                          <button 
                            onClick={() => deleteColumn(table.id, col.id)}
                            className="hover:text-red-400 p-1 rounded font-sans"
                            title="Delete field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <span className="text-[9px] block text-slate-500">Data Type</span>
                          <select 
                            value={col.type} 
                            onChange={(e) => updateColumn(table.id, col.id, { type: e.target.value as any })}
                            className="w-full bg-[#10111a] border border-white/10 rounded px-1 py-0.5 text-[10px] text-white"
                          >
                            <option value="String">String</option>
                            <option value="Int">Integer</option>
                            <option value="Float">Float</option>
                            <option value="Boolean">Boolean</option>
                            <option value="DateTime">DateTime</option>
                          </select>
                        </div>

                        <div className="flex flex-col justify-end space-y-1 text-[10px]">
                          <label className="flex items-center gap-1">
                            <input 
                              type="checkbox" 
                              checked={col.isId} 
                              onChange={(e) => updateColumn(table.id, col.id, { isId: e.target.checked })}
                              className="accent-indigo-500"
                            />
                            <span>ID (PK)</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input 
                              type="checkbox" 
                              checked={col.isUnique} 
                              onChange={(e) => updateColumn(table.id, col.id, { isUnique: e.target.checked })}
                              className="accent-indigo-500"
                            />
                            <span>Unique</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (
            <p className="text-slate-500 text-xs italic">Select any database schema card to update column definitions or configurations.</p>
          )}

        </div>

        {/* Compiled Prisma Schema ORM outputs */}
        <div className="p-4 border-t border-white/5 h-64 flex flex-col bg-slate-950 font-mono">
          <div className="flex items-center gap-2 mb-2 text-[10px] uppercase font-bold text-slate-400">
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Prisma schema ORM compiler</span>
          </div>
          <pre className="flex-1 bg-black/40 border border-white/5 p-2 rounded text-[10px] font-mono text-emerald-400 overflow-y-auto whitespace-pre scrollbar-thin">
            {getPrismaSchemaText()}
          </pre>
        </div>

      </div>

    </div>
  );
}
