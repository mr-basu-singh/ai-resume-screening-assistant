<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI Resume Screening Assistant

## Overview

AI Resume Screening Assistant is an AI-powered recruitment tool that helps recruiters and hiring managers evaluate candidate resumes against job descriptions. The application analyzes skills, experience, education, and project relevance to generate an overall match score and provide hiring recommendations.

Built using Google AI Studio and Gemini, the application streamlines the initial screening process and helps identify the most suitable candidates efficiently.

---

## Features

### Resume Analysis
- Upload candidate resumes
- Extract key information from resumes
- Identify technical and non-technical skills
- Analyze work experience
- Review educational qualifications
- Evaluate project relevance

### Job Description Matching
- Compare resumes against job descriptions
- Calculate candidate-job match scores
- Identify matching skills
- Detect missing skills
- Analyze experience alignment
- Evaluate educational fit

### Recruiter Dashboard
- Match Score (0–100)
- Candidate Strengths
- Areas of Improvement
- Skill Gap Analysis
- Experience Assessment
- Education Assessment
- Project Relevance Evaluation
- Hiring Recommendation

### Hiring Recommendations
- Recommended
- Consider with Reservations
- Not Recommended

---

## Problem Statement

Recruiters often spend significant time manually reviewing resumes and matching candidates to job requirements. This process can be time-consuming, inconsistent, and prone to human bias.

The AI Resume Screening Assistant addresses this challenge by automating resume analysis and generating structured candidate evaluations.

---

## Solution

The system uses Generative AI to:

1. Analyze candidate resumes.
2. Extract relevant information.
3. Compare candidate qualifications with job requirements.
4. Generate a comprehensive screening report.
5. Provide actionable hiring recommendations.

---

## Technology Stack

### Frontend
- React
- TypeScript
- HTML5
- CSS3

### AI
- Google Gemini
- Google AI Studio

### Deployment
- Google Cloud Run
- GitHub

---

## Application Workflow

```text
Recruiter Inputs Job Description
              │
              ▼
       Upload Resume
              │
              ▼
     AI Extracts Resume Data
              │
              ▼
     Compare with Job Description
              │
              ▼
       Calculate Match Score
              │
              ▼
     Generate Detailed Analysis
              │
              ▼
      Hiring Recommendation
```

---

## Evaluation Criteria

### Skills Match
- Technical Skills
- Programming Languages
- Frameworks
- Tools & Technologies
- Soft Skills

### Experience Analysis
- Relevant Experience
- Industry Exposure
- Role Alignment
- Project Contributions

### Education Analysis
- Degree Relevance
- Certifications
- Academic Background

### Project Relevance
- Technology Stack
- Complexity
- Domain Relevance

---

## Sample Output

### Match Score
**85/100**

### Matching Skills
- Python
- SQL
- Machine Learning
- Data Analysis

### Missing Skills
- Docker
- Kubernetes

### Experience Analysis
Candidate demonstrates relevant industry experience and strong project exposure aligned with the job requirements.

### Education Analysis
Educational qualifications meet the requirements for the role.

### Hiring Recommendation
✅ Recommended

---

## Security Features

- Input Validation
- Resume and JD treated as data only
- Prompt Injection Protection
- Secure API Key Handling
- Error Handling & Recovery
- Safe AI Output Processing

---

## Future Enhancements

- ATS Compatibility Score
- Multi-Resume Screening
- Interview Question Generator
- Candidate Ranking Dashboard
- Resume Improvement Suggestions
- Analytics Dashboard
- Multi-language Support

---

## Project Structure

```text
AI-Resume-Screening-Assistant/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── App.tsx
│
├── public/
│
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/ai-resume-screening-assistant.git
```

### Navigate to Project

```bash
cd ai-resume-screening-assistant
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

---

## Use Cases

- HR Teams
- Recruiters
- Hiring Managers
- Recruitment Agencies
- Startups
- Enterprises
- Placement Cells

---

## Author

**Kumar Basu Singh**

B.Tech (Electrical & Electronics Engineering)

G.L. Bajaj Institute of Technology and Management

### Interests
- Artificial Intelligence
- Agentic AI
- Generative AI


---

## Acknowledgements

- Google AI Studio
- Google Gemini
- GitHub
- Open Source Community

---

## License

This project is for educational, research, and portfolio purposes.
