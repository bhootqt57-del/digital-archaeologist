import React, { useState, useEffect } from "react";
import { FileCheck2, AlertTriangle, File } from "lucide-react";

export default function DuplicateDetective({ archiveId }: { archiveId: string | null }) {
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (archiveId) {
      fetch(`https://YOUR-URL.onrender.com/api/archives/${archiveId}/duplicates`).then(r => r.json()).then(d => setDuplicates(d.duplicateGroups || []));
      fetch(`https://YOUR-URL.onrender.com/api/archives/${archiveId}`).then(r => r.json()).then(d => setFiles(d.files || []));
    }
  }, [archiveId]);

  if (!archiveId) return <div className="text-slate-500">Create an archive first.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Duplicate Detective</h1>
      {duplicates.length === 0 ? (
        <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-xl flex items-center space-x-3 text-green-400">
          <FileCheck2 className="w-6 h-6"/> <span>No exact duplicates found. Your archive is clean!</span>
        </div>
      ) : (
        <div className="space-y-6">
          {duplicates.map((group: any, idx: number) => (
            <div key={group.id} className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 text-amber-400 mb-4 border-b border-slate-200 pb-4">
                <AlertTriangle className="w-5 h-5"/>
                <h3 className="font-bold text-lg text-slate-900">Duplicate Group {idx + 1}</h3>
                <span className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded-full border border-slate-200">SHA-256 Hash Match</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {group.fileIds.map((id: string) => {
                  const fileData = files.find(f => f.id === id);
                  return (
                    <div key={id} className="flex justify-between items-center bg-slate-100 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <File className="w-5 h-5 text-[#55D6E8]" />
                        <span className="font-medium text-slate-900">{fileData?.originalName || id}</span>
                        <span className="text-xs text-slate-500">{(fileData?.sizeBytes / 1024).toFixed(1)} KB</span>
                      </div>
                      {id === group.preferredKeepFileId ? (
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded font-medium border border-green-500/30">Preferred Copy</span>
                      ) : (
                        <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded font-medium border border-red-500/30">Redundant</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

