import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RB_WORKFLOWS } from '../lib/storyboardWorkflows';
import { generateStoryboard } from '../lib/storyboardEngine';
import { StoryboardResult, WorkflowDefinition } from '../types';
import {
  Sparkles, Film, Copy, Check, Download, Share2,
  RefreshCw, Camera, Mic, Heart, Clapperboard,
  Sliders, ArrowRight, Play, Volume2, Coins
} from 'lucide-react';
import { BuyCreditsModal } from '../components/BuyCreditsModal';

export const StoryboardStudio: React.FC = () => {
  const { wallet, spendCredits, saveStoryboard, showToast } = useAuth();
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition>(RB_WORKFLOWS[0]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'storyboard' | 'visual_assets' | 'specialized'>('all');
  
  const [topic, setTopic] = useState(RB_WORKFLOWS[0].samplePrompt);
  const [productName, setProductName] = useState('');
  const [duration, setDuration] = useState<'10s' | '20s' | '30s' | '60s'>('10s');
  const [language, setLanguage] = useState<'Malay' | 'English'>('Malay');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [targetAudience, setTargetAudience] = useState('TikTok & Reels Audience (Malaysia & SEA)');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<StoryboardResult | null>(null);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  // Filtered workflows
  const filteredWorkflows = RB_WORKFLOWS.filter(w => {
    if (categoryFilter === 'all') return true;
    return w.category === categoryFilter;
  });

  const handleSelectWorkflow = (wf: WorkflowDefinition) => {
    setSelectedWorkflow(wf);
    setTopic(wf.samplePrompt);
  };

  const creditCost = duration === '30s' || duration === '60s' ? 20 : 10;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Please enter a topic or product description', 'warning');
      return;
    }

    if ((wallet?.balance || 0) < creditCost) {
      showToast(`Insufficient credits. You need ${creditCost} credits to generate this storyboard.`, 'error');
      setIsCreditsOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      const success = await spendCredits(
        creditCost,
        `Storyboard Generation: ${selectedWorkflow.name} (${duration})`
      );

      if (!success) {
        setIsGenerating(false);
        return;
      }

      // Simulate generation delay
      setTimeout(() => {
        const generated = generateStoryboard({
          workflowId: selectedWorkflow.id,
          topic: topic.trim(),
          productName: productName.trim() || topic.trim(),
          targetAudience,
          duration,
          language,
          aspectRatio
        });

        setResult(generated);
        saveStoryboard(generated);
        setIsGenerating(false);
        showToast('Viral Storyboard generated successfully!', 'success');
      }, 900);
    } catch {
      setIsGenerating(false);
      showToast('Generation failed. Please try again.', 'error');
    }
  };

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedPromptIndex(index);
      setTimeout(() => setCopiedPromptIndex(null), 2000);
    }
    showToast('Copied to clipboard!', 'info');
  };

  const copyAllPrompts = () => {
    if (!result) return;
    const combined = result.scenes.map(s => `[Scene ${s.scene_number} - ${s.timeframe}]\nPrompt: ${s.ai_image_prompt}\nVideo Motion: ${s.ai_video_prompt}\nDialogue: "${s.dialogue}"`).join('\n\n');
    copyToClipboard(combined);
  };

  const exportMarkdown = () => {
    if (!result) return;
    let md = `# RB Digital Storyboard: ${result.topic}\n`;
    md += `**Workflow**: ${selectedWorkflow.name} | **Duration**: ${result.duration} | **Language**: ${result.language}\n\n`;
    md += `| Scene | Time | Camera | Visual Action | Dialogue | AI Prompt |\n`;
    md += `|---|---|---|---|---|---|\n`;
    result.scenes.forEach(s => {
      md += `| Scene ${s.scene_number} | ${s.timeframe} | ${s.camera} | ${s.visual} | ${s.dialogue} | \`${s.ai_image_prompt}\` |\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard-${selectedWorkflow.id}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Markdown file exported!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 19 RB Digital Creative Workflows
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Storyboard & AI Prompt Studio
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Engineered for high watch time, viral TikTok & Reels retention, and instant Midjourney / Runway video prompt generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 text-xs flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600">Balance:</span>
            <strong className="text-slate-900 font-bold">{wallet?.balance ?? 0} Credits</strong>
          </div>
          <button
            onClick={() => setIsCreditsOpen(true)}
            className="btn-secondary text-xs py-2 px-3"
          >
            + Top Up
          </button>
        </div>
      </div>

      {/* Step 1: Workflow Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">1</span>
              Select RB Digital Workflow
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose from 19 viral short-form storytelling structures and visual styles
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All (19)
            </button>
            <button
              onClick={() => setCategoryFilter('storyboard')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${categoryFilter === 'storyboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Storyboards (9)
            </button>
            <button
              onClick={() => setCategoryFilter('visual_assets')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${categoryFilter === 'visual_assets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Visual Assets (6)
            </button>
            <button
              onClick={() => setCategoryFilter('specialized')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${categoryFilter === 'specialized' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Specialized (4)
            </button>
          </div>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 rounded-2xl border border-slate-200 bg-slate-50/50">
          {filteredWorkflows.map((wf) => {
            const isSelected = selectedWorkflow.id === wf.id;
            return (
              <div
                key={wf.id}
                onClick={() => handleSelectWorkflow(wf)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-red-600 shadow-md ring-1 ring-red-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${wf.badgeColor}`}>
                      {wf.tag}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {wf.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                    {wf.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Rec: {wf.recommendedDuration}</span>
                  <span className="text-red-600 font-semibold">{isSelected ? 'Active' : 'Select'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Input Configuration Form */}
      <form onSubmit={handleGenerate} className="card-apple space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">2</span>
            Configure Video & Topic Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Workflow: <strong className="text-red-600 font-semibold">{selectedWorkflow.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Topic / Pitch */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Topic, Product or Script Idea <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setTopic(selectedWorkflow.samplePrompt)}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium"
              >
                Insert Sample Prompt
              </button>
            </div>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Minuman jus sarang burung premium untuk wanita berkerjaya yang mahu kekal cergas dan awet muda..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
              required
            />
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Product / Brand Name (Optional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. AuraGlow Elixir"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Wanita 25-40 tahun, peminat kecantikan dan kesihatan di TikTok"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
            />
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Video Duration & Scene Count
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '10s', scenes: '4 Scenes', cost: 10 },
                { label: '20s', scenes: '8 Scenes', cost: 10 },
                { label: '30s', scenes: '12 Scenes', cost: 20 },
                { label: '60s', scenes: '24 Scenes', cost: 20 },
              ].map((d) => (
                <button
                  type="button"
                  key={d.label}
                  onClick={() => setDuration(d.label as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    duration === d.label
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold">{d.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{d.scenes}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language & Aspect Ratio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Spoken Dialogue Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm bg-white"
              >
                <option value="Malay">Bahasa Melayu (Viral Slang)</option>
                <option value="English">English (High-Conversion)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm bg-white"
              >
                <option value="9:16">9:16 (TikTok / Reels / Shorts)</option>
                <option value="16:9">16:9 (YouTube Landscape)</option>
                <option value="1:1">1:1 (Square Feed)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>Generation Cost: <strong>{creditCost} Credits</strong></span>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary py-3 px-6 text-sm flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Crafting Viral Storyboard...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Viral Storyboard ({creditCost} Credits)
              </>
            )}
          </button>
        </div>
      </form>

      {/* Step 3: Generated Storyboard Presentation */}
      {result && (
        <div className="card-apple space-y-6 border-red-500/30 shadow-xl animate-in fade-in duration-300">
          
          {/* Result Actions Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Generated
                </span>
                <span className="text-xs text-slate-500">
                  {result.duration} • {result.scenes.length} Scenes • {result.language}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                {result.topic}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyAllPrompts}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy All Prompts
              </button>
              <button
                onClick={exportMarkdown}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Markdown
              </button>
            </div>
          </div>

          {/* Scene Cards Grid */}
          <div className="space-y-4">
            {result.scenes.map((scene, idx) => (
              <div
                key={scene.scene_number}
                className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                      #{scene.scene_number}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Timeframe: <code className="font-mono text-slate-900">{scene.timeframe}</code>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                      Emotion: {scene.emotion}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Visual Scene Action:</span>
                      <p className="text-slate-800 leading-relaxed">{scene.visual}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-slate-500" /> Camera Direction:
                      </span>
                      <p className="text-slate-800 font-mono text-[11px]">{scene.camera}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5 flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-red-500" /> Spoken Dialogue (Voiceover):
                      </span>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium italic shadow-xs">
                        "{scene.dialogue}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Prompts Box */}
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>🎨 Midjourney Image Prompt</span>
                      <button
                        onClick={() => copyToClipboard(scene.ai_image_prompt, idx)}
                        className="text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
                      >
                        {copiedPromptIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <code className="text-[11px] font-mono block text-slate-300 break-words">
                      {scene.ai_image_prompt}
                    </code>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>🎬 Runway / Sora Video Prompt</span>
                      <button
                        onClick={() => copyToClipboard(scene.ai_video_prompt || '', idx + 100)}
                        className="text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
                      >
                        {copiedPromptIndex === idx + 100 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <code className="text-[11px] font-mono block text-slate-300 break-words">
                      {scene.ai_video_prompt}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Top Up Modal */}
      <BuyCreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
    </div>
  );
};
