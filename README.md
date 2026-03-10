# TalentAI: AI-Driven Smart Recruitment Portal (Frontend)

**TalentAI** is a modern, AI-powered recruitment platform designed to automate talent acquisition through NLP-driven resume analysis and behavioural insights.

> **Note:** This repository contains the **Frontend (Client-Side Application)** implementation. It is architected to interface with an external AI/ML Engine and Backend API layer.

## 🚀 Supported AI Modules
The frontend is built with ready-to-use interfaces for:
* **NLP Resume Parser:** Upload interface for PDF/DOCX files with structured visualization for skills and experience.
* **Semantic Matching Engine:** UI for displaying candidate-to-job alignment scores based on cosine similarity.
* **Big Five Behavioural Analysis:** Interactive questionnaires and visualization charts for personality trait mapping.
* **AI Ranking Dashboard:** A recruiter-specific view that sorts candidates using AI-driven weighted scoring.

## 🛠️ Tech Stack
* **Framework:** React 18 / Vite
* **Styling:** TailwindCSS / ShadCN UI
* **State & Data:** TanStack Query (React Query) / Axios
* **Visualization:** Recharts (for AI trait analysis)

## 📦 Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Configure the Backend API URL in `src/lib/api-config.ts`.