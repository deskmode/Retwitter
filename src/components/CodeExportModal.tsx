import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileCode, 
  FolderTree, 
  Download, 
  Database, 
  BookOpen, 
  Layers, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { FLUTTER_CODE_FILES, FlutterCodeFile } from '../data/flutterSourceCode';
import { useTheme } from '../context/ThemeContext';

interface CodeExportModalProps {
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ onClose }) => {
  const { resolvedDark } = useTheme();
  const [selectedFile, setSelectedFile] = useState<FlutterCodeFile>(FLUTTER_CODE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'config', label: 'Config & Entry' },
    { id: 'model', label: 'Models' },
    { id: 'service', label: 'Services' },
    { id: 'screen', label: 'Screens' },
    { id: 'database', label: 'PostgreSQL & SQL' },
    { id: 'docs', label: 'Android Build Guide' },
  ];

  const filteredFiles = activeCategory === 'all' 
    ? FLUTTER_CODE_FILES 
    : FLUTTER_CODE_FILES.filter(f => f.category === activeCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.path.split('/').pop() || 'file.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col border overflow-hidden ${
          resolvedDark ? 'bg-[#111418] border-slate-800 text-[#E2E2E6]' : 'bg-[#FDFBFF] border-[#E0E2EC] text-[#1A1C1E]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          resolvedDark ? 'border-slate-800 bg-[#151B24]' : 'border-[#F0F2F5] bg-[#F4F6FA]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0061A4] flex items-center justify-center text-white shadow-xs">
              <FolderTree size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2 text-[#1A1C1E] dark:text-[#E2E2E6]">
                ReTwitter Flutter Project Explorer
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Production Ready
                </span>
              </h2>
              <p className="text-xs text-[#535F70] dark:text-slate-400">
                100% Free & Open Source · Flutter + Supabase + PostgreSQL RLS + Material Design 3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0061A4] hover:bg-[#00518A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              title="Copy current file code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#74777F]/40 hover:bg-[#F0F2F5] dark:hover:bg-slate-800 text-[#1A1C1E] dark:text-[#E2E2E6] text-xs font-medium transition-all"
              title="Download this file"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#74777F] hover:text-[#1A1C1E] dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={`px-6 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto text-xs font-medium ${
          resolvedDark ? 'border-slate-800 bg-[#111418]' : 'border-[#F0F2F5] bg-[#FDFBFF]'
        }`}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                activeCategory === c.id
                  ? resolvedDark
                    ? 'bg-[#00497D] text-[#D1E4FF] font-semibold border border-[#00497D]'
                    : 'bg-[#D1E4FF] text-[#001D36] font-semibold border border-[#D1E4FF]'
                  : 'text-[#535F70] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200 hover:bg-[#F0F2F5] dark:hover:bg-slate-800/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Workspace Body: Left Tree + Right Code Editor */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* File Tree Sidebar */}
          <div className={`w-64 border-r flex flex-col shrink-0 overflow-y-auto ${
            resolvedDark ? 'border-slate-800 bg-slate-900/30' : 'border-[#E0E2EC] bg-[#F8F9FC]'
          }`}>
            <div className="p-3 text-[11px] font-semibold text-[#74777F] dark:text-slate-400 uppercase tracking-wider">
              Project Files ({filteredFiles.length})
            </div>
            <div className="space-y-0.5 px-2 pb-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                      isSelected
                        ? resolvedDark
                          ? 'bg-[#00497D]/50 text-[#D1E4FF] font-semibold border border-[#00497D]'
                          : 'bg-[#D1E4FF]/60 text-[#001D36] font-semibold border border-[#D1E4FF]'
                        : 'text-[#535F70] dark:text-slate-400 hover:text-[#1A1C1E] dark:hover:text-slate-200 hover:bg-[#F0F2F5] dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <FileCode size={14} className={isSelected ? 'text-[#0061A4] dark:text-[#9ECAFF]' : 'text-[#74777F] dark:text-slate-500'} />
                    <span className="truncate font-mono">{file.path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Code Display */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0A0E17] text-slate-300">
            {/* File info bar */}
            <div className="px-5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-900/40">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono font-bold text-[#9ECAFF]">{selectedFile.path}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400 truncate">{selectedFile.description}</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                {selectedFile.language}
              </span>
            </div>

            {/* Code lines */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed selection:bg-[#0061A4]/30">
              <pre className="text-slate-300 whitespace-pre">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
