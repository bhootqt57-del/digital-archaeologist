import React from "react";
import { Trash2, Shield, Cpu } from "lucide-react";

export default function Settings() {
  const handleClear = () => { localStorage.removeItem("archiveId"); window.location.href = "/"; };
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Workspace Settings</h1>
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center space-x-2 text-[#55D6E8]"><Cpu className="w-5 h-5" /> <span>AI Provider Status</span></h2>
        <p className="text-slate-500 text-sm">Gemini API is securely abstracted on the Node.js backend. The LLM processes metadata to generate taxonomy structures. Your API keys are never exposed to the client.</p>
      </div>
      <div className="bg-white shadow-sm border border-red-900/40 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center space-x-2 text-red-400"><Shield className="w-5 h-5" /> <span>Danger Zone</span></h2>
        <p className="text-slate-500 text-sm">Wiping the session will disconnect you from the current backend archive and clear your local workspace state. Your original local files are untouched.</p>
        <button onClick={handleClear} className="flex items-center space-x-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-4 py-2 rounded font-medium transition-colors"><Trash2 className="w-4 h-4" /> <span>Clear Workspace Session</span></button>
      </div>
    </div>
  );
}

