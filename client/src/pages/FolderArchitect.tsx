import React, { useState, useEffect } from "react";
import { FolderTree, Sparkles } from "lucide-react";

export default function FolderArchitect({ archiveId }: { archiveId: string | null }) {
  const [recs, setRecs] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchRecs = () => {
    if (archiveId) fetch(`https://YOUR-URL.onrender.com/api/archives/${archiveId}`).then(r => r.json()).then(d => setRecs(d.recommendations || []));
  };
  useEffect(() => { fetchRecs(); }, [archiveId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await fetch(`https://YOUR-URL.onrender.com/api/archives/${archiveId}/analyse`, { method: "POST" });
    setAnalyzing(false);
    fetchRecs();
  };

  if (!archiveId) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Folder Architect</h1>
        <button onClick={handleAnalyze} disabled={analyzing} className="flex items-center space-x-2 bg-[#9B8AFB] text-black px-4 py-2 rounded hover:bg-[#8575e6] disabled:opacity-50">
          <Sparkles className="w-4 h-4" />
          <span>{analyzing ? "AI is Thinking..." : "Run AI Analysis"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recs.map(r => (
          <div key={r.id} className="bg-white shadow-sm border border-slate-200 p-4 rounded-xl flex items-start space-x-4">
            <FolderTree className="w-6 h-6 text-[#55D6E8] mt-1" />
            <div>
              <div className="font-mono text-sm text-[#55D6E8] mb-1">{r.proposedFolder}</div>
              <div className="text-sm text-slate-500 mb-2">{r.reason}</div>
              <span className={`text-xs px-2 py-1 rounded ${r.reviewRequired ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                {r.category} {r.reviewRequired && "(Needs Review)"}
              </span>
            </div>
          </div>
        ))}
        {recs.length === 0 && !analyzing && <div className="text-slate-500">No folders generated yet. Run the AI.</div>}
      </div>
    </div>
  );
}

