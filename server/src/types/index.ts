export interface FileRecord {
  id: string;
  archiveId: string;
  originalName: string;
  safeDisplayName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  extractionStatus: "pending" | "success" | "failed" | "unsupported";
  extractedText?: string;
  duplicateGroupId?: string;
  isDuplicate: boolean;
  serverPath: string;
  createdAt: string;
}

export interface DuplicateGroup {
  id: string;
  archiveId: string;
  type: "exact" | "near-duplicate";
  sha256: string;
  fileIds: string[];
  preferredKeepFileId?: string;
}

export interface FolderRecommendation {
  id: string;
  archiveId: string;
  fileId: string;
  category: string;
  proposedFolder: string;
  reason: string;
  confidenceEstimate: number;
  reviewRequired: boolean;
  status: "pending" | "approved" | "rejected" | "needs-review";
}

export interface ArchiveSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "created" | "analyzing" | "ready";
  files: FileRecord[];
  duplicateGroups: DuplicateGroup[];
  recommendations: FolderRecommendation[];
  summary: {
    totalFiles: number;
    totalSizeBytes: number;
    duplicateCount: number;
    duplicateGroupsCount: number;
  };
}
