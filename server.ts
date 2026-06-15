import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limit to handle base64 PDFs comfortably
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets/configuration.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST route to analyze resume match
app.post("/api/analyze", async (req, res): Promise<any> => {
  try {
    const { jobDescription, resumeFileBase64, resumeFileName } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required." });
    }

    if (!resumeFileBase64 || !resumeFileBase64.trim()) {
      return res.status(400).json({ error: "Resume PDF file is required." });
    }

    const ai = getAIClient();

    // Prepare content parts for Gemini
    const pdfPart = {
      inlineData: {
        mimeType: "application/pdf",
        data: resumeFileBase64,
      },
    };

    const textPart = {
      text: `Evaluate the candidates resume (enclosed in the uploaded PDF document) against this Job Description (JD):
      
---
${jobDescription}
---

Your task is to act as an expert Technical Recruiter and Head of Talent. Analyze the mismatch or alignment between the candidate's resume and the job requirements.
Perform deep extraction and critical comparisons. Calculate an honest overall match score out of 100 based on core requirements and resume findings. Keep the tone helpful, constructive, objective, and analytical.`,
    };

    const promptSystem = `You are a professional recruiting operations auditor. You produce extremely precise, formatted candidate evaluations.
When assessing matching skills, missing skills, relative experience, relative projects, and academic background, you evaluate evidence analytically.
Produce evaluation strictly adhering to the requested JSON response schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [pdfPart, textPart],
      config: {
        systemInstruction: promptSystem,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            candidateName: { 
              type: "string",
              description: "The official candidate full name extracted from the top or contact info of the resume."
            },
            candidateTitle: { 
              type: "string",
              description: "The primary job profile, title or current position of the candidate from the resume."
            },
            jobTitle: { 
              type: "string",
              description: "The job title extracted from the Job Description heading or summary."
            },
            matchScore: { 
              type: "integer",
              description: "Overall candidate score from 0 to 100 representing strength of alignment."
            },
            fitStatus: { 
              type: "string", 
              enum: ["Strong Fit", "Moderate Fit", "Weak Fit"],
              description: "Candidate overall compatibility label."
            },
            recommendation: { 
              type: "string", 
              enum: ["Recommended", "Consider with Reservations", "Not Recommended"],
              description: "Hiring suitability recommendation."
            },
            matchingSkills: {
              type: "array",
              description: "Key skills requested in the job description that were clearly found in the candidate's resume.",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Technical or Soft Skill name." },
                  category: { type: "string", description: "e.g., Technical, Soft Skill, Domain Expertise" },
                  explanation: { type: "string", description: "Where or how in the resume/projects this skill matches requested parameters." }
                },
                required: ["name", "category", "explanation"]
              }
            },
            missingSkills: {
              type: "array",
              description: "Critical or important skill requirements in the Job Description that the candidate does not have evidence of in the resume.",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Name of missing tool, technology, or expertise." },
                  category: { type: "string" },
                  importance: { type: "string", enum: ["Critical", "Important", "Nice-to-Have"] },
                  impact: { type: "string", description: "How missing this skill would impact performance or delivery in this specific role." }
                },
                required: ["name", "category", "importance", "impact"]
              }
            },
            experienceAnalysis: {
              type: "object",
              description: "Review of years and relevance of professional professional experience.",
              properties: {
                required: { type: "string", description: "Required industry level or active tenure extracted from Job Description." },
                candidate: { type: "string", description: "Realized tenure/experience shown in resume." },
                evaluation: { type: "string", description: "Analysis comparing candidate experience depth against job description expectations." },
                status: { type: "string", enum: ["Met", "Partially Met", "Not Met", "Exceeded"] }
              },
              required: ["required", "candidate", "evaluation", "status"]
            },
            educationAnalysis: {
              type: "object",
              description: "Degree, Certifications, and academic prerequisites evaluation.",
              properties: {
                required: { type: "string", description: "Required educational degrees or certifications from JD." },
                candidate: { type: "string", description: "Degrees and credentials found on the candidate's resume." },
                evaluation: { type: "string", description: "Details on whether educational standards match or if equivalent work exists." },
                status: { type: "string", enum: ["Met", "Partially Met", "Not Met", "Exceeded"] }
              },
              required: ["required", "candidate", "evaluation", "status"]
            },
            projectRelevance: {
              type: "object",
              description: "Matching academic, personal or industrial projects candidate has published.",
              properties: {
                projectsReviewed: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Title of project." },
                      description: { type: "string", description: "Brief description of the work." },
                      relevanceEvaluation: { type: "string", description: "Why or why not this project is highly relevant to the JD responsibilities." }
                    },
                    required: ["title", "description", "relevanceEvaluation"]
                  }
                },
                overallRelevanceSummary: { type: "string", description: "Synthesized verdict on how candidates practical portfolio lines up with role challenges." }
              },
              required: ["projectsReviewed", "overallRelevanceSummary"]
            },
            strengths: {
              type: "array",
              description: "Top candidate strengths or competitive advantages.",
              items: { type: "string" }
            },
            weaknesses: {
              type: "array",
              description: "Critical talent gaps, shortcomings, or reservations regarding candidate profile.",
              items: { type: "string" }
            },
            finalRecruiterSummary: { 
              type: "string", 
              description: "A summary explaining concrete reasoning for the hiring score and suitability."
            }
          },
          required: [
            "candidateName", "candidateTitle", "jobTitle", "matchScore", "fitStatus", 
            "recommendation", "matchingSkills", "missingSkills", "experienceAnalysis", 
            "educationAnalysis", "projectRelevance", "strengths", "weaknesses", "finalRecruiterSummary"
          ]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response returned from the Gemini modeling endpoint.");
    }

    const evaluationResult = JSON.parse(response.text.trim());
    return res.json({ success: true, result: evaluationResult });

  } catch (error: any) {
    console.error("Analysis route error:", error);
    return res.status(500).json({ 
      error: "Failed to perform matching analysis.", 
      details: error?.message || String(error) 
    });
  }
});

// Setup Vite development server or production client static folder
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite developmental middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static compiled file workspace...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Resume Screening Backend online at http://localhost:${PORT}`);
  });
}

initializeServer();
