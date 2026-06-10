import React, { useState } from 'react';
import { AssetItem } from '../types';
import { FolderOpen, Upload, Trash, Image, Video, FileCode, Check, RefreshCw } from 'lucide-react';

interface AssetManagerProps {
  assets: AssetItem[];
  setAssets: (items: AssetItem[]) => void;
}

export default function AssetManager({
  assets,
  setAssets
}: AssetManagerProps) {
  const [activeUpload, setActiveUpload] = useState(false);
  const [fontCombo, setFontCombo] = useState('modern');

  // Simulated WebP background asset uploader
  const handleSimulatedWebPUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveUpload(true);
    setTimeout(() => {
      const newAsset: AssetItem = {
        id: `web-asset-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, "") + ".webp", // Auto optimize to WebP
        type: file.type.includes('video') ? 'video' : 'image',
        size: `${Math.round(file.size / 1024)} KB`,
        url: URL.createObjectURL(file) // Local object url
      };
      setAssets([...assets, newAsset]);
      setActiveUpload(false);
    }, 1500);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  return (
    <div className="flex-1 bg-[#0b0c16] flex text-slate-200 h-full overflow-hidden select-none font-sans">
      
      {/* Visual Asset listing directory map */}
      <div className="flex-1 p-6 flex flex-col h-full overflow-y-auto border-r border-white/5 space-y-6">
        <div className="flex items-center justify-between col-span-full">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Asset Catalog & Font Pairs</h2>
          </div>

          <label className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded flex items-center gap-1.5 cursor-pointer transition shadow">
            <Upload className="w-4 h-4" /> Upload Brand WebP File
            <input 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={handleSimulatedWebPUpload}
              disabled={activeUpload}
            />
          </label>
        </div>

        {activeUpload && (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Optimizing file structure, compiling image dimensions and mapping layout as WebP...</span>
            </div>
          </div>
        )}

        {/* Gallery Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="bg-[#121422] border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between group shadow-lg">
              <div className="relative aspect-video bg-black/40 flex items-center justify-center">
                
                {asset.type === 'image' ? (
                  <img 
                    referrerPolicy="no-referrer"
                    src={asset.url} 
                    alt={asset.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video className="w-8 h-8 text-slate-500" />
                )}

                <button 
                  onClick={() => removeAsset(asset.id)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 p-1.5 rounded text-slate-300 hover:text-white transition opacity-0 group-hover:opacity-100 shadow"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-[#161828]/50 flex items-center justify-between">
                <div>
                  <span className="block font-medium text-xs text-slate-200 truncate max-w-[120px]">{asset.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{asset.size}</span>
                </div>
                <div className="bg-[#0b0c16] border border-white/5 px-2 py-0.5 rounded text-[10px] text-indigo-400 font-mono font-medium tracking-wide uppercase">
                  {asset.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RHS brand Typography Pair configs inspector */}
      <div className="w-80 bg-[#161824] border-l border-white/5 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider pb-2 border-b border-white/5">Brand Typography Pairs</h3>
        
        {/* Preset selections */}
        <div className="space-y-3.5 text-xs">
          
          <div 
            onClick={() => setFontCombo('modern')}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              fontCombo === 'modern' ? 'border-indigo-500 bg-indigo-500/5 text-white' : 'border-white/5 hover:border-white/10 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider">Tech-Forward Modern</span>
              {fontCombo === 'modern' && <Check className="w-4 h-4 text-indigo-400" />}
            </div>
            <p className="font-sans font-semibold text-sm mb-1">Space Grotesk</p>
            <p className="font-sans text-xs italic opacity-70">Inter Body styles</p>
            <div className="mt-3 text-[10px] bg-black/20 p-1.5 rounded text-indigo-300 font-mono">
              --font-sans: "Space Grotesk", sans-serif;
            </div>
          </div>

          <div 
            onClick={() => setFontCombo('editorial')}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              fontCombo === 'editorial' ? 'border-indigo-500 bg-indigo-500/5 text-white' : 'border-white/5 hover:border-white/10 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider">Editorial Classic</span>
              {fontCombo === 'editorial' && <Check className="w-4 h-4 text-indigo-400" />}
            </div>
            <p className="font-serif font-bold text-sm mb-1">Playfair Display</p>
            <p className="font-sans text-xs italic opacity-70 font-mono">JetBrains Mono body markings</p>
            <div className="mt-3 text-[10px] bg-black/20 p-1.5 rounded text-indigo-300 font-mono">
              --font-serif: "Playfair Display", serif;
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
