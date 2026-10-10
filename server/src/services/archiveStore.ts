import crypto from "crypto";
import fs from "fs";
import path from "path";
import { ArchiveSession, DuplicateGroup, FileRecord, FolderRecommendation } from "../types";

class ArchiveStore {
  private sessions: Map<string, ArchiveSession> = new Map();

  createSession(): ArchiveSession {
    const id = crypto.randomUUID();
    const session: ArchiveSession = {
      id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "created",
      files: [], duplicateGroups: [], recommendations: [],
      summary: { totalFiles: 0, totalSizeBytes: 0, duplicateCount: 0, duplicateGroupsCount: 0 }
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): ArchiveSession | undefined { return this.sessions.get(id); }

  async addFiles(sessionId: string, multerFiles: Express.Multer.File[], calculateHash: (p: string) => Promise<string>): Promise<FileRecord[]> {
    let session = this.getSession(sessionId);
    if (!session) { session = this.createSession(); session.id = sessionId; this.sessions.set(sessionId, session); }

    const addedRecords: FileRecord[] = [];
    for (const file of multerFiles) {
      const sha256 = await calculateHash(file.path);
      const ext = path.extname(file.originalname).toLowerCase().replace(".", "") || "unknown";
      
      let extractedText: string | undefined = undefined;
      let extractionStatus: FileRecord["extractionStatus"] = "unsupported";

      if (["txt", "md", "json", "csv"].includes(ext)) {
        try {
          extractedText = fs.readFileSync(file.path, "utf-8").slice(0, 3000);
          extractionStatus = "success";
        } catch { extractionStatus = "failed"; }
      } else if (ext === "pdf") {
        try {
          const pdfParse = require("pdf-parse");
          const dataBuffer = fs.readFileSync(file.path);
          const data = await pdfParse(dataBuffer);
          extractedText = data.text.slice(0, 3000);
          extractionStatus = "success";
        } catch { extractionStatus = "failed"; }
      }

      const fileRecord: FileRecord = {
        id: crypto.randomUUID(), archiveId: sessionId, originalName: file.originalname,
        safeDisplayName: file.originalname.replace(/[^\w\d._-]/g, "_"), extension: ext, mimeType: file.mimetype,
        sizeBytes: file.size, sha256, extractionStatus, extractedText, isDuplicate: false, serverPath: file.path,
        createdAt: new Date().toISOString()
      };
      session.files.push(fileRecord);
      addedRecords.push(fileRecord);
    }
    this.recalculateDuplicates(session);
    return addedRecords;
  }

  private recalculateDuplicates(session: ArchiveSession) {
    const hashMap = new Map<string, FileRecord[]>();
    for (const file of session.files) {
      const group = hashMap.get(file.sha256) || [];
      group.push(file);
      hashMap.set(file.sha256, group);
    }
    const duplicateGroups: DuplicateGroup[] = [];
    for (const [sha256, files] of hashMap.entries()) {
      if (files.length > 1) {
        const groupId = crypto.randomUUID();
        const fileIds = files.map((f) => f.id);
        duplicateGroups.push({ id: groupId, archiveId: session.id, type: "exact", sha256, fileIds, preferredKeepFileId: fileIds[0] });
        files.forEach((file, index) => { file.isDuplicate = index > 0; file.duplicateGroupId = groupId; });
      } else { files[0].isDuplicate = false; files[0].duplicateGroupId = undefined; }
    }
    session.duplicateGroups = duplicateGroups;
    session.summary.totalFiles = session.files.length;
    session.summary.totalSizeBytes = session.files.reduce((acc, f) => acc + f.sizeBytes, 0);
    session.summary.duplicateCount = session.files.filter((f) => f.isDuplicate).length;
    session.summary.duplicateGroupsCount = duplicateGroups.length;
    session.updatedAt = new Date().toISOString();
  }

  removeFile(sessionId: string, fileId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    const fileIndex = session.files.findIndex((f) => f.id === fileId);
    if (fileIndex === -1) return false;
    const [file] = session.files.splice(fileIndex, 1);
    try { if (fs.existsSync(file.serverPath)) fs.unlinkSync(file.serverPath); } catch {}
    this.recalculateDuplicates(session);
    return true;
  }

  saveRecommendations(sessionId: string, recs: FolderRecommendation[]) {
    const session = this.getSession(sessionId);
    if (session) { session.recommendations = recs; session.status = "ready"; session.updatedAt = new Date().toISOString(); }
  }

  updateRecommendationStatus(sessionId: string, recId: string, status: FolderRecommendation["status"]) {
    const session = this.getSession(sessionId);
    if (!session) return false;
    const rec = session.recommendations.find(r => r.id === recId);
    if (rec) { rec.status = status; return true; }
    return false;
  }
}
export const archiveStore = new ArchiveStore();
