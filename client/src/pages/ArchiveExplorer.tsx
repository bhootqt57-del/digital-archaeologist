import React, { useState, useEffect } from "react";
import { UploadCloud, Trash2, AlertCircle } from "lucide-react";

export default function ArchiveExplorer({ archiveId }: { archiveId: string | null }) {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = () => {
    if (archiveId) fetch(`https://YOUR-URL.onrender.com/api/archives/${archiveId}`).then(r => r.json()).then(d => setFiles(d.files || []));
  };
  useEffect(() => { fetchFiles(); }, [archiveId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !archiveId) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(f => formData.append("files", f));
    await fetch(`https://YOUR-URL.onrender.com/api/archives/${archiveId}/files`, { method: "POST", body: formData });
    setUploading(false);
    fetchFiles();
  };

  const handleDelete = async (fileId: string) => {
    await fetch(`https://YOUR-URL.onrender.com/api/archives/${archiveId}/files/${fileId}`, { method: "DELETE" });
    fetchFiles();
  };

  if (!archiveId) return <div className="text-slate-500">Create an archive first.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Archive Explorer</h1>
      <div className="border-2 border-dashed border-slate-200 bg-white shadow-sm rounded-xl p-10 text-center relative hover:border-[#55D6E8] transition-colors">
        <UploadCloud className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-900 font-medium">Drag & Drop files here or click to browse</p>
        <p className="text-sm text-slate-500 mt-2">Supports TXT, MD, JSON, CSV, PDF, PNG (Max 10MB)</p>
        <input type="file" multiple onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        {uploading && <div className="mt-4 text-[#55D6E8]">Encrypting and hashing uploads...</div>}
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="p-4 font-medium text-slate-500">Filename</th>
              <th className="p-4 font-medium text-slate-500">Size</th>
              <th className="p-4 font-medium text-slate-500">Status</th>
              <th className="p-4 font-medium text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {files.map(f => (
              <tr key={f.id} className="hover:bg-slate-100">
                <td className="p-4">{f.originalName}</td>
                <td className="p-4 font-mono text-xs">{(f.sizeBytes / 1024).toFixed(1)} KB</td>
                <td className="p-4">
                  {f.isDuplicate ? (
                    <span className="flex items-center text-amber-400"><AlertCircle className="w-4 h-4 mr-2"/> Duplicate</span>
                  ) : (
                    <span className="text-green-400">Unique</span>
                  )}
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(f.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

