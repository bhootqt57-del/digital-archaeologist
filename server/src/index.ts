import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { calculateFileHash } from "./utils/hash";
import { archiveStore } from "./services/archiveStore";
import { generateRecommendations } from "./services/aiService";

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.get("/api/health", (_req, res) => res.json({ status: "healthy" }));

app.post("/api/archives", (_req, res) => res.status(201).json(archiveStore.createSession()));

app.get("/api/archives/:id", (req, res) => {
  const session = archiveStore.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Archive session not found" });
  res.json(session);
});

app.post("/api/archives/:id/files", upload.array("files"), async (req, res) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) return res.status(400).json({ error: "No files uploaded" });
  try {
    const processedFiles = await archiveStore.addFiles(id, files, calculateFileHash);
    res.json({ success: true, filesUploaded: processedFiles.length, session: archiveStore.getSession(id) });
  } catch (error: any) { res.status(500).json({ error: "File processing failed", details: error.message }); }
});

app.delete("/api/archives/:id/files/:fileId", (req, res) => {
  const success = archiveStore.removeFile(req.params.id, req.params.fileId);
  if (!success) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

app.post("/api/archives/:id/analyse", async (req, res) => {
  const { id } = req.params;
  const session = archiveStore.getSession(id);
  if (!session) return res.status(404).json({ error: "Archive session not found" });
  try {
    session.status = "analyzing";
    const uniqueFiles = session.files.filter(f => !f.isDuplicate);
    const recommendations = await generateRecommendations(id, uniqueFiles);
    archiveStore.saveRecommendations(id, recommendations);
    res.json({ success: true, recommendations });
  } catch (error: any) {
    session.status = "ready";
    res.status(500).json({ error: "AI analysis failed", details: error.message });
  }
});

app.patch("/api/archives/:id/recommendations/:recId", (req, res) => {
  const success = archiveStore.updateRecommendationStatus(req.params.id, req.params.recId, req.body.status);
  if (!success) return res.status(404).json({ error: "Recommendation not found" });
  res.json({ success: true });
});

app.get("/api/archives/:id/export", (req, res) => {
  const session = archiveStore.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Not found" });
  const approved = session.recommendations.filter(r => r.status === "approved");
  if (req.query.format === "csv") {
    const csvHeader = "FileID,OriginalName,ProposedFolder,Reason\n";
    const csvBody = approved.map(r => {
      const file = session.files.find(f => f.id === r.fileId);
      return `${r.fileId},"${file?.originalName}","${r.proposedFolder}","${r.reason}"`;
    }).join("\n");
    res.header('Content-Type', 'text/csv');
    res.attachment(`digital-archaeologist-plan-${session.id}.csv`);
    return res.send(csvHeader + csvBody);
  }
  res.json({ archiveId: session.id, totalApproved: approved.length, plan: approved });
});

app.get("/api/archives/:id/duplicates", (req, res) => {
  const session = archiveStore.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Archive not found" });
  res.json({ duplicateGroups: session.duplicateGroups });
});

app.post("/api/archives/sample", (_req, res) => {
  const session = archiveStore.createSession();
  const t = new Date().toISOString();
  session.files = [
    { id: "f1", archiveId: session.id, originalName: "evohacks-pitch.pdf", safeDisplayName: "evohacks-pitch_pdf", mimeType: "application/pdf", extension: "pdf", sizeBytes: 2048576, sha256: "hashA", extractionStatus: "success", extractedText: "EvoHacks 2026 AI Automation pitch...", isDuplicate: false, serverPath: "", createdAt: t },
    { id: "f2", archiveId: session.id, originalName: "evohacks-pitch-copy.pdf", safeDisplayName: "evohacks-pitch-copy_pdf", mimeType: "application/pdf", extension: "pdf", sizeBytes: 2048576, sha256: "hashA", extractionStatus: "success", extractedText: "EvoHacks 2026 AI Automation pitch...", isDuplicate: true, duplicateGroupId: "g1", serverPath: "", createdAt: t },
    { id: "f3", archiveId: session.id, originalName: "Q3-financials.csv", safeDisplayName: "Q3-financials_csv", mimeType: "text/csv", extension: "csv", sizeBytes: 15420, sha256: "hashB", extractionStatus: "success", extractedText: "Revenue,Expenses...", isDuplicate: false, serverPath: "", createdAt: t }
  ];
  session.duplicateGroups = [{ id: "g1", archiveId: session.id, type: "exact", sha256: "hashA", fileIds: ["f1", "f2"], preferredKeepFileId: "f1" }];
  session.recommendations = [
    { id: "r1", archiveId: session.id, fileId: "f1", category: "Project", proposedFolder: "Hackathons/EvoHacks2026", reason: "Identified as pitch deck", confidenceEstimate: 0.99, reviewRequired: false, status: "pending" },
    { id: "r2", archiveId: session.id, fileId: "f3", category: "Finance", proposedFolder: "Finance/Q3", reason: "Financial spreadsheet", confidenceEstimate: 0.95, reviewRequired: false, status: "pending" }
  ];
  session.summary = { totalFiles: 3, totalSizeBytes: 2063996, duplicateCount: 1, duplicateGroupsCount: 1 };
  session.status = "ready";
  res.status(201).json(session);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`[Digital Archaeologist] Engine on port ${PORT}`));
