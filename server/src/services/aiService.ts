import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import { z } from "zod";
import { FileRecord, FolderRecommendation } from "../types";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: process.env.AI_MODEL || "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const RecommendationSchema = z.array(z.object({
  fileId: z.string(),
  category: z.string(),
  proposedFolder: z.string(),
  reason: z.string(),
  confidenceEstimate: z.number().optional(),
  reviewRequired: z.boolean()
}));

export const generateRecommendations = async (archiveId: string, files: FileRecord[]): Promise<FolderRecommendation[]> => {
  if (!apiKey) throw new Error("AI_API_KEY environment variable is missing.");

  const payload = files.map(f => ({
    id: f.id, name: f.originalName, type: f.extension, size: f.sizeBytes, snippet: f.extractedText || "No text available"
  }));

  const prompt = `You are an expert digital archivist. Propose a logical, topic-based folder structure for these files.
    Output JSON Schema: [{ "fileId": "string", "category": "string", "proposedFolder": "string", "reason": "string", "confidenceEstimate": 0.9, "reviewRequired": false }]
    Files: ${JSON.stringify(payload)}`;

  try {
    const result = await model.generateContent(prompt);
    const parsedData = JSON.parse(result.response.text());
    const validatedData = RecommendationSchema.parse(parsedData);

    return validatedData.map((rec) => ({
      id: crypto.randomUUID(), archiveId, fileId: rec.fileId, category: rec.category,
      proposedFolder: rec.proposedFolder, reason: rec.reason,
      confidenceEstimate: rec.confidenceEstimate || 0.8,
      reviewRequired: rec.reviewRequired, status: rec.reviewRequired ? "needs-review" : "pending"
    }));
  } catch (error) {
    console.error("AI Validation/Generation failed:", error);
    throw new Error("Failed to generate and validate folder architecture.");
  }
};
