import React, { useState } from 'react';
import { AetherElement, Breakpoint, VisualStyle } from '../types';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, ChevronDown, ChevronRight, Settings, Type, LayoutGrid, Paintbrush, Link } from 'lucide-react';

const getContrastRatio = (color1: string, color2: string) => {
  const parseHex = (hex: string): [number, number, number] => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    return [r, g, b];
  };

  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  try {
    const rgb1 = parseHex(color1 || '#ffffff');
    const rgb2 = parseHex(color2 || '#0d0e15');
    const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch (e) {
    return 1;
  }
};

interface PropertyPanelProps {
  selectedElement: AetherElement | null;
  activeBreakpoint: Breakpoint;
  updateElementStyles: (id: string, styles: Partial<VisualStyle>) => void;
  updateElementAttributes: (id: string, attrs: any) => void;
}

export default function PropertyPanel({
  selectedElement,
  activeBreakpoint,
  updateElementStyles,
  updateElementAttributes
}: PropertyPanelProps) {
  // Collapsible drawer category states
  const [sections, setSections] = useState({
    layout: true,
    spacing: true,
    size: true,
    typography: true,
    style: true,
    attributes: true
  });

  const toggleSection = (sec: keyof typeof sections) => {
    setSections({ ...sections, [sec]: !sections[sec] });
  };

  if (!selectedElement) {
    return (
      <div className="w-80 bg-[#161824] border-l border-white/5 p-6 flex flex-col justify-center items-center text-slate-400 text-xs text-center transition-all duration-200">
        <Settings className="w-8 h-8 mb-3 opacity-30 text-indigo-550 animate-[spin_5s_linear_infinite] dark:text-indigo-400" />
        <p className="max-w-[200px]">Select an element on the canvas to configure margins, padding, custom classes, font styles or attributes.</p>
      </div>
    );
  }

  const activeStyles = selectedElement.styles[activeBreakpoint] || {};

  // Instant update proxies
  const handleStyleChange = (key: keyof VisualStyle, value: any) => {
    updateElementStyles(selectedElement.id, { [key]: value });
  };

  const handleAttrChange = (key: string, value: string) => {
    const updatedAttrs = { ...selectedElement.attributes, [key]: value };
    updateElementAttributes(selectedElement.id, updatedAttrs);
  };

  const applyTypeScale = (scaleFactor: number, level: number) => {
    const base = 14;
    const computed = Math.round(base * Math.pow(scaleFactor, level));
    handleStyleChange('fontSize', `${computed}px`);
  };

  const SectionHeader = ({ title, sec, icon: Icon }: { title: string, sec: keyof typeof sections, icon: any }) => (
    <button 
      onClick={() => toggleSection(sec)}
      className="w-full px-4 py-3 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] text-xs font-semibold text-slate-200 transition"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-indigo-400" />
        <span>{title}</span>
      </div>
      {sections[sec] ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
    </button>
  );

  return (
    <div className="w-80 bg-[#141622] border-l border-white/5 flex flex-col h-full text-slate-300 overflow-y-auto select-none font-sans">
      
      {/* Title & Active Target Node Badge */}
      <div className="p-4 border-b border-white/5 bg-[#171a2a] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Property Inspector</h3>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{activeBreakpoint}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-[10px] font-mono w-fit">
          <span>{selectedElement.name} ({selectedElement.type})</span>
        </div>

        {/* Dynamic Snap Align Shortcuts */}
        <div className="space-y-1 pt-1.5">
          <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Figma Artboard Align</span>
          <div className="grid grid-cols-6 gap-1 bg-[#10111a] p-1 rounded border border-white/5 text-center">
            <button 
              onClick={() => {
                handleStyleChange('marginLeft', '0px');
                handleStyleChange('marginRight', 'auto');
              }}
              title="Align Axis Left (⇤)"
              className="py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition"
            >
              ⇤
            </button>
            <button 
              onClick={() => {
                handleStyleChange('marginLeft', 'auto');
                handleStyleChange('marginRight', 'auto');
              }}
              title="Align Axis Center (↔)"
              className="py-1 rounded bg-[#312e81]/35 border border-indigo-500/15 text-indigo-400 hover:bg-[#312e81]/50 text-[10px] transition font-bold"
            >
              ↔
            </button>
            <button 
              onClick={() => {
                handleStyleChange('marginLeft', 'auto');
                handleStyleChange('marginRight', '0px');
              }}
              title="Align Axis Right (⇥)"
              className="py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition"
            >
              ⇥
            </button>
            <button 
              onClick={() => {
                handleStyleChange('marginTop', '0px');
                handleStyleChange('marginBottom', 'auto');
              }}
              title="Align Axis Top"
              className="py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition"
            >
              ⊺
            </button>
            <button 
              onClick={() => {
                handleStyleChange('marginTop', 'auto');
                handleStyleChange('marginBottom', 'auto');
              }}
              title="Align Vertical Middle"
              className="py-1 rounded bg-[#312e81]/35 border border-indigo-500/15 text-indigo-400 hover:bg-[#312e81]/50 text-[10px] transition font-bold"
            >
              ↕
            </button>
            <button 
              onClick={() => {
                handleStyleChange('marginTop', 'auto');
                handleStyleChange('marginBottom', '0px');
              }}
              title="Align Axis Bottom"
              className="py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition"
            >
              ⊼
            </button>
          </div>
        </div>
      </div>

      {/* 1. Layout Properties Drawer */}
      <div>
        <SectionHeader title="Layout Settings" sec="layout" icon={LayoutGrid} />
        {sections.layout && (
          <div className="p-4 space-y-3.5 text-xs border-b border-white/5 bg-[#181a28]/40">
            {/* Display Options */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Display Mode</label>
              <select 
                value={activeStyles.display || ''} 
                onChange={(e) => handleStyleChange('display', e.target.value as any)}
                className="w-full bg-[#10111a] border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-indigo-500 transition"
              >
                <option value="">Default (Inherit)</option>
                <option value="block">Block</option>
                <option value="flex">Flexbox Container</option>
                <option value="grid">CSS Grid Container</option>
                <option value="none">Hidden (none)</option>
                <option value="inline-block">Inline Block</option>
              </select>
            </div>

            {/* Flex Alignment Subpanel (shown only if model is flex) */}
            {activeStyles.display === 'flex' && (
              <div className="space-y-3 p-2.5 bg-black/20 rounded border border-white/5">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Flex Direction</label>
                  <select 
                    value={activeStyles.flexDirection || 'row'} 
                    onChange={(e) => handleStyleChange('flexDirection', e.target.value as any)}
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value="row">Horizontal (Row)</option>
                    <option value="column">Vertical (Column)</option>
                    <option value="row-reverse">Row Reverse</option>
                    <option value="column-reverse">Column Reverse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Justify Content</label>
                  <select 
                    value={activeStyles.justifyContent || ''} 
                    onChange={(e) => handleStyleChange('justifyContent', e.target.value)}
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value="">default</option>
                    <option value="flex-start">Flex Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">Flex End</option>
                    <option value="space-between">Space Between</option>
                    <option value="space-around">Space Around</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Align Items</label>
                  <select 
                    value={activeStyles.alignItems || ''} 
                    onChange={(e) => handleStyleChange('alignItems', e.target.value)}
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  >
                    <option value="">default</option>
                    <option value="stretch">Stretch</option>
                    <option value="center">Center</option>
                    <option value="flex-start">Start</option>
                    <option value="flex-end">End</option>
                  </select>
                </div>
              </div>
            )}

            {/* Grid Configuration */}
            {activeStyles.display === 'grid' && (
              <div className="space-y-2 p-2 bg-black/20 rounded border border-white/5">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Grid Template Columns</label>
                  <input 
                    type="text" 
                    value={activeStyles.gridTemplateColumns || 'repeat(3, 1fr)'} 
                    onChange={(e) => handleStyleChange('gridTemplateColumns', e.target.value)}
                    placeholder="e.g. repeat(3, 1fr)"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Grid Gap</label>
                  <input 
                    type="text" 
                    value={activeStyles.gridGap || '16px'} 
                    onChange={(e) => handleStyleChange('gridGap', e.target.value)}
                    placeholder="e.g. 16px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Spacing Drawer (Margins and Paddings) */}
      <div>
        <SectionHeader title="Spacing (Margin & Padding)" sec="spacing" icon={Settings} />
        {sections.spacing && (
          <div className="p-4 space-y-3.5 text-xs border-b border-white/5 bg-[#181a28]/40">
            {/* Margins Inputs Grid */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Margins (Outer)</label>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block">Top</span>
                  <input 
                    type="text" 
                    value={activeStyles.marginTop || ''} 
                    onChange={(e) => handleStyleChange('marginTop', e.target.value)}
                    placeholder="Auto / 0px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Bottom</span>
                  <input 
                    type="text" 
                    value={activeStyles.marginBottom || ''} 
                    onChange={(e) => handleStyleChange('marginBottom', e.target.value)}
                    placeholder="Auto / 0px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Left</span>
                  <input 
                    type="text" 
                    value={activeStyles.marginLeft || ''} 
                    onChange={(e) => handleStyleChange('marginLeft', e.target.value)}
                    placeholder="Auto / 0px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Right</span>
                  <input 
                    type="text" 
                    value={activeStyles.marginRight || ''} 
                    onChange={(e) => handleStyleChange('marginRight', e.target.value)}
                    placeholder="Auto / 0px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Padding Inputs Grid */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Paddings (Inner)</label>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block">Top</span>
                  <input 
                    type="text" 
                    value={activeStyles.paddingTop || ''} 
                    onChange={(e) => handleStyleChange('paddingTop', e.target.value)}
                    placeholder="0px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Bottom</span>
                  <input 
                    type="text" 
                    value={activeStyles.paddingBottom || ''} 
                    onChange={(e) => handleStyleChange('paddingBottom', e.target.value)}
                    placeholder="0px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Left</span>
                  <input 
                    type="text" 
                    value={activeStyles.paddingLeft || ''} 
                    onChange={(e) => handleStyleChange('paddingLeft', e.target.value)}
                    placeholder="0px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Right</span>
                  <input 
                    type="text" 
                    value={activeStyles.paddingRight || ''} 
                    onChange={(e) => handleStyleChange('paddingRight', e.target.value)}
                    placeholder="0px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sizing Properties Drawer */}
      <div>
        <SectionHeader title="Sizing (Width & Height)" sec="size" icon={Settings} />
        {sections.size && (
          <div className="p-4 space-y-3 text-xs border-b border-white/5 bg-[#181a28]/40 font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] uppercase font-semibold text-slate-400 mb-0.5">Width</label>
                <input 
                  type="text" 
                  value={activeStyles.width || ''} 
                  onChange={(e) => handleStyleChange('width', e.target.value)}
                  placeholder="e.g. 100%, auto"
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-semibold text-slate-400 mb-0.5">Height</label>
                <input 
                  type="text" 
                  value={activeStyles.height || ''} 
                  onChange={(e) => handleStyleChange('height', e.target.value)}
                  placeholder="e.g. 250px, auto"
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] uppercase font-semibold text-slate-400 mb-0.5">Min-Width</label>
                <input 
                  type="text" 
                  value={activeStyles.minWidth || ''} 
                  onChange={(e) => handleStyleChange('minWidth', e.target.value)}
                  placeholder="0px"
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-semibold text-slate-400 mb-0.5">Min-Height</label>
                <input 
                  type="text" 
                  value={activeStyles.minHeight || ''} 
                  onChange={(e) => handleStyleChange('minHeight', e.target.value)}
                  placeholder="0px"
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Typography Properties Drawer */}
      <div>
        <SectionHeader title="Typography Setup" sec="typography" icon={Type} />
        {sections.typography && (
          <div className="p-4 space-y-3.5 text-xs border-b border-white/5 bg-[#181a28]/40">
            {/* Font Family Selection */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Font Family</label>
              <select 
                value={activeStyles.fontFamily || ''} 
                onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1.5 text-white"
              >
                <option value="Inter">Inter (Sans Serif)</option>
                <option value="Space Grotesk">Space Grotesk (Modern Tech)</option>
                <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
                <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
              </select>
            </div>

            {/* Modular Scale Generator */}
            <div className="p-2.5 bg-black/35 rounded-lg border border-white/5 text-[10px] space-y-2">
              <span className="block text-[9px] uppercase font-bold text-indigo-400 tracking-wider">📐 Modular Scale Generator</span>
              <div className="grid grid-cols-2 gap-1.5">
                <select 
                  onChange={(e) => {
                    const factor = parseFloat(e.target.value);
                    if (factor) applyTypeScale(factor, 2);
                  }}
                  className="bg-[#10111a] border border-white/10 rounded px-2 py-1 text-[10px] text-slate-300 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Select Scale...</option>
                  <option value="1.067">Minor Second (1.067)</option>
                  <option value="1.125">Major Second (1.125)</option>
                  <option value="1.200">Minor Third (1.200)</option>
                  <option value="1.333">Perfect Fourth (1.333)</option>
                  <option value="1.618">Golden Ratio (1.618)</option>
                </select>
                <div className="flex gap-1">
                  <button onClick={() => applyTypeScale(1.333, 1)} title="Heading 4" className="bg-slate-800 hover:bg-slate-700 text-white text-[9px] px-1.5 py-0.5 rounded flex-1">sm</button>
                  <button onClick={() => applyTypeScale(1.618, 2)} title="Heading 2" className="bg-slate-800 hover:bg-slate-700 text-white text-[9px] px-1.5 py-0.5 rounded flex-1">md</button>
                  <button onClick={() => applyTypeScale(1.618, 3.5)} title="Heading 1" className="bg-indigo-650 hover:bg-indigo-650 text-white text-[9px] px-1.5 py-0.5 rounded flex-1">lg</button>
                </div>
              </div>
            </div>

            {/* Typography scale config */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Size</label>
                <input 
                  type="text" 
                  value={activeStyles.fontSize || ''} 
                  onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                  placeholder="14px / 1.5rem"
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Weight</label>
                <select 
                  value={activeStyles.fontWeight || ''} 
                  onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="">Normal</option>
                  <option value="300">Light (300)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
            </div>

            {/* Alignments */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 text-center">Text Alignment</label>
              <div className="flex rounded overflow-hidden justify-center bg-[#10111a] p-1 border border-white/5 space-x-1">
                {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleStyleChange('textAlign', align)}
                    className={`flex-1 p-1.5 rounded flex items-center justify-center transition-all ${
                      activeStyles.textAlign === align ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                    {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                    {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                    {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color Input */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={activeStyles.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10"
                />
                <input 
                  type="text" 
                  value={activeStyles.color || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  placeholder="#1e293b"
                  className="flex-1 bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Style Colors & Borders Drawer */}
      <div>
        <SectionHeader title="Fills, Borders & Opacity" sec="style" icon={Paintbrush} />
        {sections.style && (
          <div className="p-4 space-y-3.5 text-xs border-b border-white/5 bg-[#181a28]/40">
            {/* Background Color */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fill Background</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={activeStyles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10"
                />
                <input 
                  type="text" 
                  value={activeStyles.backgroundColor || ''}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  placeholder="e.g. #ffffff, transparent"
                  className="flex-1 bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* WCAG Contrast Checker Badge */}
            {(() => {
              const bg = activeStyles.backgroundColor || '#ffffff';
              const fg = activeStyles.color || '#000000';
              const ratio = getContrastRatio(fg, bg);
              let rating = 'FAIL';
              let badgeColor = 'bg-rose-500/20 text-rose-400 border border-rose-500/25';
              if (ratio >= 7.0) {
                rating = 'PASS AAA (Prisitine)';
                badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25';
              } else if (ratio >= 4.5) {
                rating = 'PASS AA (Excellent)';
                badgeColor = 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/25';
              } else if (ratio >= 3.0) {
                rating = 'PASS AA (Large Only)';
                badgeColor = 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
              }
              return (
                <div className={`p-2 rounded-lg text-[10px] flex items-center justify-between font-mono ${badgeColor}`}>
                  <span className="font-bold">Contrast (WCAG 2.1)</span>
                  <span>{ratio.toFixed(1)}:1 ({rating})</span>
                </div>
              );
            })()}

            {/* Visual Border styling */}
            <div className="space-y-2 p-2.5 bg-black/20 rounded-lg border border-white/5">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Border Finishes</span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-[9px] block text-slate-500">Radius</span>
                  <input 
                    type="text" 
                    value={activeStyles.borderRadius || ''} 
                    onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                    placeholder="8px / 50%"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[9px] block text-slate-500">Thickness</span>
                  <input 
                    type="text" 
                    value={activeStyles.borderWidth || ''} 
                    onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                    placeholder="1px"
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Atmosphere Shadow and Frosted Glass Dropdowns */}
            <div className="space-y-2 p-2.5 bg-black/20 rounded-lg border border-white/5 text-xs">
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Atmospheric Shadow & Glass</span>
              <div>
                <span className="text-[9px] block text-slate-500">Elevation shadow effect</span>
                <select 
                  value={activeStyles.boxShadow || ''}
                  onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-[11px] outline-none"
                >
                  <option value="">None / Flat</option>
                  <option value="0 4px 14px rgba(0,0,0,0.12)">Soft Floating Lift</option>
                  <option value="0 10px 40px rgba(0,0,0,0.3)">Deep Architectural Depth</option>
                  <option value="0 0 16px rgba(99, 102, 241, 0.45)">Indigo Halo Accent</option>
                  <option value="0 0 20px rgba(244, 63, 94, 0.45)">Cyber Halo Rouge</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-slate-500 block">Opacity</span>
                  <select 
                    value={activeStyles.opacity || ''}
                    onChange={(e) => handleStyleChange('opacity', e.target.value)}
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-[11px] outline-none"
                  >
                    <option value="">100% (Solid)</option>
                    <option value="0.85">85%</option>
                    <option value="0.5">50%</option>
                    <option value="0.2">20%</option>
                  </select>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Backdrop Blur</span>
                  <select 
                    value={activeStyles.backdropFilter || ''}
                    onChange={(e) => handleStyleChange('backdropFilter', e.target.value)}
                    className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1 text-white text-[11px] outline-none"
                  >
                    <option value="">Solid / Flat</option>
                    <option value="blur(4px)">Subtle (4px)</option>
                    <option value="blur(12px)">Medium (12px)</option>
                    <option value="blur(24px)">Heavy (24px)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 6. Custom Attributes & Classes Drawer */}
      <div>
        <SectionHeader title="Attributes & Classes" sec="attributes" icon={Link} />
        {sections.attributes && (
          <div className="p-4 space-y-3.5 text-xs border-b border-white/5 bg-[#181a28]/40 font-mono">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Custom CSS Class</label>
              <input 
                type="text" 
                value={selectedElement.attributes.classAttr || ''} 
                onChange={(e) => handleAttrChange('classAttr', e.target.value)}
                placeholder="e.g. flex items-center p-4 hover:bg-slate-50"
                className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">HTML ID Tag</label>
              <input 
                type="text" 
                value={selectedElement.attributes.idAttr || ''} 
                onChange={(e) => handleAttrChange('idAttr', e.target.value)}
                placeholder="e.g. main-cta-button"
                className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1.5 text-white font-mono"
              />
            </div>

            {/* Element specific modifiers rendering */}
            {selectedElement.type === 'image' && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Image Source URL</label>
                <input 
                  type="text" 
                  value={selectedElement.attributes.src || ''} 
                  onChange={(e) => handleAttrChange('src', e.target.value)}
                  placeholder="https://imageUrl..."
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1.5 text-white font-mono text-[11px]"
                />
              </div>
            )}

            {selectedElement.type === 'input' && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Placeholder Text</label>
                <input 
                  type="text" 
                  value={selectedElement.attributes.placeholder || ''} 
                  onChange={(e) => handleAttrChange('placeholder', e.target.value)}
                  placeholder="Placeholder content..."
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1.5 text-white"
                />
              </div>
            )}

            {['button', 'text', 'heading'].includes(selectedElement.type) && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Text Content</label>
                <textarea 
                  value={selectedElement.attributes.textContent || ''} 
                  onChange={(e) => handleAttrChange('textContent', e.target.value)}
                  rows={3}
                  className="w-full bg-[#10111a] border border-white/10 rounded px-2 py-1.5 text-white scrollbar-thin text-xs font-sans"
                />
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
