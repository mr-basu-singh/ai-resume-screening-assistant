export interface SkillMatch {
  name: string;
  category: string; // e.g., 'Technical', 'Soft Skill', 'Domain Expertise'
  explanation: string; // why/how it matches
}

export interface SkillGap {
  name: string;
  category: string;
  importance: 'Critical' | 'Important' | 'Nice-to-Have';
  impact: string; // impact of this gap on the role
}

export interface SectionAnalysis {
  required: string;
  candidate: string;
  evaluation: string; // assessment of how they compare
  status: 'Met' | 'Partially Met' | 'Not Met' | 'Exceeded';
}

export interface ResumeAnalysisResult {
  candidateName: string;
  candidateTitle: string;
  jobTitle: string;
  matchScore: number; // 0 to 100
  fitStatus: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit';
  recommendation: 'Recommended' | 'Consider with Reservations' | 'Not Recommended';
  
  matchingSkills: SkillMatch[];
  missingSkills: SkillGap[];
  
  experienceAnalysis: SectionAnalysis;
  educationAnalysis: SectionAnalysis;
  projectRelevance: {
    projectsReviewed: { title: string; description: string; relevanceEvaluation: string }[];
    overallRelevanceSummary: string;
  };
  
  strengths: string[];
  weaknesses: string[];
  finalRecruiterSummary: string;
}

export interface JobAnalysisSession {
  id: string;
  date: string;
  candidateName: string;
  jobTitle: string;
  jobDescription: string;
  resumeFileName: string;
  analysis: ResumeAnalysisResult;
}
