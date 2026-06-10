import React, { useState } from 'react';
import { Sparkles, RefreshCw, Layers, Check, HelpCircle } from 'lucide-react';
import { AetherElement } from '../types';

interface AIBuilderProps {
  onAILayoutReceived: (node: AetherElement) => void;
}

export default function AIBuilder({ onAILayoutReceived }: AIBuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorStr, setErrorStr] = useState<string | null>(null);

  // Friendly reassuring messages during structural synthesis
  const [loadingMsg, setLoadingMsg] = useState('Consulting Gemini AI layout architects...');
  const loadingPhrases = [
    'Consulting Gemini AI layout architects...',
    'Synthesizing structural margins and responsive flexboxes...',
    'Injecting elegant high-contrast brand layouts...',
    'Structuring nested element trees and responsive CSS nodes...',
    'Mapping absolute and relative viewport behaviors...'
  ];

  const handleGenAISubmit = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    setSuccess(false);
    setErrorStr(null);

    // Rotate messages for amazing UX
    let phaseIdx = 0;
    const interval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % loadingPhrases.length;
      setLoadingMsg(loadingPhrases[phaseIdx]);
    }, 2800);

    try {
      const res = await fetch('/api/generate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          currentContext: 'Modern Web Application Container Portfolio'
        })
      });

      const data = await res.json();
      if (data.success && data.layout) {
        onAILayoutReceived(data.layout);
        setSuccess(true);
        setPrompt('');
      } else {
        throw new Error(data.error || 'The compiler failed to parse the structural JSON node.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorStr(err.message || 'Server timeout. Check that GEMINI_API_KEY is configured in Settings > Secrets.');
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0b0c16] flex flex-col items-center justify-center text-slate-200 h-full p-8 select-none font-sans">
      
      <div className="max-w-xl w-full bg-[#121422] border border-white/5 p-8 rounded-xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Ambient neon decorative background mesh */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* AI Branding */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">AetherForge AI Assistant</h2>
            <span className="text-[10px] text-slate-500 block font-mono">POWERED BY GEMINI-3.5-FLASH</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Instruct our AI assistant to instantly formulate a clean visual layout code branch. Our engine compiles natural language design requests into standard nested visual containers equipped with complete height and typography variables.
        </p>

        {/* Prompts submission form */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Configure Design layout request</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={generating}
              placeholder="e.g. Create a landing page navbar with logo placeholder on left, menu elements in center, and rounded contact purple button on right."
              rows={4}
              className="w-full bg-[#0b0c16] border border-white/10 rounded-lg p-4 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition resize-none disabled:opacity-40"
            />
          </div>

          {errorStr && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md">
              <p className="font-semibold mb-0.5">Generator Failure</p>
              <p className="opacity-80 text-[11px]">{errorStr}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-md flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Visual nodes generated successfully! Canvas updated, select to view styles.</span>
            </div>
          )}

          {generating ? (
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex flex-col items-center justify-center text-xs space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="font-medium text-indigo-300 animate-pulse">{loadingMsg}</span>
            </div>
          ) : (
            <button
              onClick={handleGenAISubmit}
              disabled={!prompt.trim() || generating}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-md hover:shadow-indigo-500/10"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" /> Compile layout code branch
            </button>
          )}
        </div>

        {/* Tip panel */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-500">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>The generated nodes can be freely adjusted or extended via workflows.</span>
        </div>

      </div>

    </div>
  );
}
