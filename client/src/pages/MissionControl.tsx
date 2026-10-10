import React, { useState, useEffect } from "react";
import { Check, X, Download } from "lucide-react";

export default function MissionControl({ archiveId }: { archiveId: string | null }) {
  const [recs, setRecs] = useState<any[]>([]);

  const fetchRecs = () => {
    if (archiveId) fetch(`/api/archives/${archiveId}`).then(r => r.json()).then(d => setRecs(d.recommendations || []));
  };
  useEffect(() => { fetchRecs(); }, [archiveId]);

  const updateStatus = async (recId: string, status: string) => {
    await fetch(`/api/archives/${archiveId}/recommendations/${recId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
    });
    fetchRecs();
  };

  const handleExport = () => {
    window.open(`/api/archives/${archiveId}/export?format=csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cleanup Mission Control</h1>
        <button onClick={handleExport} className="flex items-center space-x-2 border border-slate-200 bg-white shadow-sm px-4 py-2 rounded hover:bg-slate-100">
          <Download className="w-4 h-4 text-[#55D6E8]" />
          <span>Export Plan (CSV)</span>
        </button>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="p-4 font-medium text-slate-500">Destination Folder</th>
              <th className="p-4 font-medium text-slate-500">Reason</th>
              <th className="p-4 font-medium text-slate-500">Status</th>
              <th className="p-4 font-medium text-slate-500">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {recs.map(r => (
              <tr key={r.id} className="hover:bg-slate-100">
                <td className="p-4 font-mono text-[#55D6E8]">{r.proposedFolder}</td>
                <td className="p-4 text-slate-500">{r.reason}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${r.status === 'approved' ? 'bg-green-500/20 text-green-400' : r.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20'}`}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 flex space-x-2">
                  <button onClick={() => updateStatus(r.id, "approved")} className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded text-green-400"><Check className="w-4 h-4"/></button>
                  <button onClick={() => updateStatus(r.id, "rejected")} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400"><X className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

