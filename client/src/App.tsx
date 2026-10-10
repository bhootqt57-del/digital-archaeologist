import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Layers, Database, ShieldCheck, FolderTree, CheckSquare, Settings as SettingsIcon, AlertTriangle } from "lucide-react";
import Overview from "./pages/Overview";
import ArchiveExplorer from "./pages/ArchiveExplorer";
import FolderArchitect from "./pages/FolderArchitect";
import MissionControl from "./pages/MissionControl";
import DuplicateDetective from "./pages/DuplicateDetective";
import Settings from "./pages/Settings";

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { name: "Overview", path: "/", icon: Layers },
    { name: "Archive Explorer", path: "/explorer", icon: Database },
    { name: "Duplicate Detective", path: "/duplicates", icon: AlertTriangle },
    { name: "Folder Architect", path: "/architect", icon: FolderTree },
    { name: "Mission Control", path: "/mission", icon: CheckSquare },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col h-screen">
      <div className="p-6 flex items-center space-x-3"><Layers className="text-[#55D6E8] w-8 h-8" /><span className="font-bold text-lg text-slate-900">Archaeologist</span></div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path ? "bg-slate-100 text-[#55D6E8] border border-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>
            <item.icon className="w-5 h-5" /><span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default function App() {
  const [archiveId, setArchiveId] = useState<string | null>(localStorage.getItem("archiveId"));
  const createArchive = async () => { const res = await fetch("/api/archives", { method: "POST" }); const data = await res.json(); setArchiveId(data.id); localStorage.setItem("archiveId", data.id); };
  const loadSample = async () => { const res = await fetch("/api/archives/sample", { method: "POST" }); const data = await res.json(); setArchiveId(data.id); localStorage.setItem("archiveId", data.id); window.location.reload(); };

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <header className="h-20 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-8">
            <h2 className="text-sm font-mono text-slate-500">EvoHacks 2026 // Digital Archaeologist</h2>
            {!archiveId ? (
              <div className="flex space-x-3">
                <button onClick={loadSample} className="bg-slate-100 border border-slate-200 text-slate-900 px-4 py-2 rounded font-medium text-sm hover:bg-slate-100">Load Sample Data</button>
                <button onClick={createArchive} className="bg-[#55D6E8] text-black px-4 py-2 rounded font-medium text-sm hover:bg-cyan-400">Start New Excavation</button>
              </div>
            ) : (
              <div className="text-xs font-mono bg-white shadow-sm border border-slate-200 px-3 py-1 rounded text-[#9B8AFB]">Session: {archiveId.split('-')[0]}</div>
            )}
          </header>
          <main className="p-8">
            <Routes>
              <Route path="/" element={<Overview archiveId={archiveId} />} />
              <Route path="/explorer" element={<ArchiveExplorer archiveId={archiveId} />} />
              <Route path="/duplicates" element={<DuplicateDetective archiveId={archiveId} />} />
              <Route path="/architect" element={<FolderArchitect archiveId={archiveId} />} />
              <Route path="/mission" element={<MissionControl archiveId={archiveId} />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

