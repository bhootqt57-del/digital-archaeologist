import React, { useEffect, useState } from "react";
import { Database, FileText, CheckCircle } from "lucide-react";

export default function Overview({ archiveId }: { archiveId: string | null }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (archiveId) {
      fetch(`https://YOUR-URL.onrender.com/api/archives/${archiveId}`).then(r => r.json()).then(setData);
    }
  }, [archiveId]);

  if (!archiveId) return <div className="text-slate-500 text-center mt-20">Click "Start New Excavation" to begin.</div>;
  if (!data) return <div className="text-[#55D6E8]">Loading engine...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Archive Overview</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-6">
          <Database className="w-8 h-8 text-[#55D6E8] mb-4" />
          <div className="text-3xl font-bold">{data.summary.totalFiles}</div>
          <div className="text-sm text-slate-500">Files Analyzed</div>
        </div>
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-6">
          <FileText className="w-8 h-8 text-[#9B8AFB] mb-4" />
          <div className="text-3xl font-bold">{data.summary.duplicateCount}</div>
          <div className="text-sm text-slate-500">Exact Duplicates Found</div>
        </div>
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-6">
          <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
          <div className="text-3xl font-bold">{data.recommendations?.length || 0}</div>
          <div className="text-sm text-slate-500">AI Recommendations Ready</div>
        </div>
      </div>
    </div>
  );
}

