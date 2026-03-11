export type UserRole = 'candidate' | 'recruiter';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface ExtractedSkill {
  name: string;
  relevance: number;
  category: 'technical' | 'soft' | 'domain';
}

/** Job as returned by GET /api/jobs and GET /api/jobs/{id} */
export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  experience_required: string;
  required_skills: string[];
  created_by: string;
  created_at: string;
  updated_at?: string;
  applicant_count: number;
  is_active: boolean;
  salary_range?: string;
}

/** Applicant as returned by GET /api/applications/jobs/{id}/applicants and GET /api/applications/my */
export interface Applicant {
  id: string;
  candidate_id: string;
  candidate_name: string;
  job_id: string;
  applied_at: string;
  resume_file: string | null;
  resume_score: number | null;
  behavioural_score: number | null;
  combined_score: number | null;
  fit_score: number | null;
  status: 'In Progress' | 'Under Review' | 'Shortlisted' | 'Rejected';
  extracted_skills: string[] | null;
  personality_traits: { big_five: PersonalityTraits; soft_skills: Record<string, number> } | null;
  locked: boolean;
}

/** Resume analysis response from POST /api/resume/analyze */
export interface ResumeAnalysis {
  candidate_name: string;
  job_title: string;
  scores: {
    skill_score: number;
    responsibility_score: number;
    qualification_score: number;
    tech_proof_score: number;
    final_weighted_score: number;
  };
  skills: {
    jd_skills: string[];
    resume_skills: string[];
    matched: string[];
    missing: string[];
  };
  responsibilities: { matched: string[]; missing: string[] };
  qualifications: { matched: string[]; missing: string[] };
  education: Array<{ degree: string; institution: string; duration: string; score?: string }>;
  experience: Array<{ role: string; organization: string; duration: string; responsibilities: string[] }>;
  projects: Array<{ title: string; tech_stack: string[]; description: string }>;
  certifications: string[];
  achievements: string[];
  analysis_report_pdf?: string;
}

/** Behavioural analysis response from POST /api/behavioural/analyze */
export interface BehaviouralAnalysis {
  sentiment: {
    polarity: number;
    label: string;
  };
  big_five: PersonalityTraits;
  soft_skills: {
    communication: number;
    teamwork: number;
    leadership: number;
    emotional_stability: number;
  };
  behavioural_score: number;
}

/** A single auto-generated behavioural question */
export interface GeneratedQuestion {
  question_id: string;
  text: string;
}

/** Response from GET /api/applications/{id}/questions */
export interface ApplicationQuestionsResponse {
  application_id: string;
  job_id: string;
  job_title: string;
  questions: GeneratedQuestion[];
  total_questions: number;
}

/** Response from POST /api/applications/jobs/{job_id}/start */
export interface StartApplicationResponse {
  success: boolean;
  application_id: string;
  job_id: string;
  job_title: string;
  status: string;
  message: string;
}

/** Response from POST /api/applications/{application_id}/submit */
export interface SubmitApplicationResponse {
  success: boolean;
  application_id: string;
  job_id: string;
  status: string;
  resume_score: number;
  behavioural_score: number;
  combined_score: number;
  fit_score: number;
  scoring_breakdown: Record<string, unknown>;
  message: string;
}

/** Full application detail from GET /api/applications/{application_id} */
export interface ApplicationDetailResponse {
  applicant: Applicant;
  resume_analysis: ResumeAnalysis | null;
  behavioural_analysis: BehaviouralAnalysis | null;
  combined_analysis: Record<string, unknown> | null;
  questions: GeneratedQuestion[] | null;
}

/** Single entry in the ranking list */
export interface RankingEntry {
  rank: number;
  applicant_id: string;
  candidate_id: string;
  candidate_name: string;
  resume_score: number | null;
  behavioural_score: number | null;
  combined_score: number | null;
  fit_score: number | null;
  status: string;
}

/** Response from GET /api/resume/ranking?job_id={job_id} */
export interface RankingResponse {
  job_id: string;
  total_candidates: number;
  ranking: RankingEntry[];
}

export interface ApplicationStats {
  applied: number;
  inProgress: number;
  shortlisted: number;
  rejected: number;
}

export interface HiringMetrics {
  totalApplicants: number;
  shortlisted: number;
  rejected: number;
  underReview: number;
  averageTimeToHire: number;
  averageFitScore: number;
}

export interface SkillGapAnalysis {
  skill: string;
  required: number;
  available: number;
  gap: number;
}

// API Types
export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  job_type: string;
  experience_required: string;
  required_skills: string[];
  salary_range?: string;
}
