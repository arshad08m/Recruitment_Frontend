/**
 * API Service Layer — connects to the TalentAI backend at http://localhost:8000
 */

import {
  Job,
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  CreateJobRequest,
  ResumeAnalysis,
  BehaviouralAnalysis,
  Applicant,
  StartApplicationResponse,
  ApplicationQuestionsResponse,
  SubmitApplicationResponse,
  ApplicationDetailResponse,
  RankingResponse,
} from '@/types';

const BASE_URL = 'http://localhost:8000';
const TOKEN_KEY = 'talentai_token';

// ─── Token helpers ──────────────────────────────────────────────────────────

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

// ─── Base fetch ─────────────────────────────────────────────────────────────

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  return response;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authAPI = {
  /** POST /api/auth/login */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, message: err.detail || 'Login failed' };
    }

    const result = await response.json();
    if (result.token) setToken(result.token);

    return {
      success: true,
      user: result.user as User,
      token: result.token,
    };
  },

  /** POST /api/auth/signup */
  signup: async (data: SignupRequest): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, message: err.detail || 'Signup failed' };
    }

    const result = await response.json();
    if (result.token) setToken(result.token);

    return {
      success: result.success ?? true,
      user: result.user as User,
      token: result.token,
      message: result.message,
    };
  },

  /** POST /api/auth/logout */
  logout: async (): Promise<{ success: boolean }> => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearToken();
    }
    return { success: true };
  },
};

// ─── Jobs API ────────────────────────────────────────────────────────────────

export const jobsAPI = {
  /** GET /api/jobs */
  getAll: async (): Promise<Job[]> => {
    const response = await apiFetch('/api/jobs');
    const data = await response.json();
    return (data.jobs as Job[]) ?? [];
  },

  /** POST /api/jobs (recruiter only) */
  create: async (data: CreateJobRequest): Promise<Job> => {
    const response = await apiFetch('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /** GET /api/jobs/{job_id} */
  getById: async (id: string): Promise<Job | null> => {
    const response = await apiFetch(`/api/jobs/${id}`);
    return response.json();
  },

  /** PUT /api/jobs/{job_id} (job owner only) */
  update: async (id: string, data: Partial<CreateJobRequest>): Promise<Job> => {
    const response = await apiFetch(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /** DELETE /api/jobs/{job_id} (job owner only) */
  delete: async (id: string): Promise<boolean> => {
    await apiFetch(`/api/jobs/${id}`, { method: 'DELETE' });
    return true;
  },
};

// ─── Applications API ─────────────────────────────────────────────────────────

export const applicationsAPI = {
  /** POST /api/applications/jobs/{job_id}/start — Step 1: Start application */
  startApplication: async (
    jobId: string,
    candidateName: string,
  ): Promise<StartApplicationResponse> => {
    const formData = new FormData();
    formData.append('candidate_name', candidateName);

    const response = await apiFetch(`/api/applications/jobs/${jobId}/start`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  /** GET /api/applications/{application_id}/questions — Step 3: Get auto-generated questions */
  getApplicationQuestions: async (
    applicationId: string,
  ): Promise<ApplicationQuestionsResponse> => {
    const response = await apiFetch(`/api/applications/${applicationId}/questions`);
    return response.json();
  },

  /** POST /api/applications/{application_id}/submit — Step 5: Finalise application */
  submitApplication: async (
    applicationId: string,
  ): Promise<SubmitApplicationResponse> => {
    const response = await apiFetch(`/api/applications/${applicationId}/submit`, {
      method: 'POST',
    });
    return response.json();
  },

  /** GET /api/applications/{application_id} — Full application detail */
  getApplicationDetail: async (
    applicationId: string,
  ): Promise<ApplicationDetailResponse> => {
    const response = await apiFetch(`/api/applications/${applicationId}`);
    return response.json();
  },

  /** GET /api/applications/my (candidate only) */
  getMyApplications: async (): Promise<{ applications: Applicant[]; total: number }> => {
    const response = await apiFetch('/api/applications/my');
    return response.json();
  },

  /** GET /api/applications/jobs/{job_id}/applicants (recruiter owner only) */
  getApplicants: async (
    jobId: string,
  ): Promise<{
    job_id: string;
    job_title: string;
    applicant_count: number;
    applicants: Applicant[];
  }> => {
    const response = await apiFetch(`/api/applications/jobs/${jobId}/applicants`);
    return response.json();
  },

  /** PUT /api/applications/applicants/{applicant_id}/status (recruiter owner only) */
  updateStatus: async (
    applicantId: string,
    status: 'Shortlisted' | 'Rejected' | 'Under Review',
  ): Promise<boolean> => {
    await apiFetch(`/api/applications/applicants/${applicantId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return true;
  },

  /** PUT /api/applications/applicants/{applicant_id}/unlock (recruiter owner only) */
  unlockDecision: async (applicantId: string): Promise<boolean> => {
    await apiFetch(`/api/applications/applicants/${applicantId}/unlock`, {
      method: 'PUT',
    });
    return true;
  },
};

// ─── Resume API ───────────────────────────────────────────────────────────────

export const resumeAPI = {
  /** POST /api/resume/analyze — multipart form: job_id + file + applicant_id */
  analyze: async (jobId: string, file: File, applicantId: string): Promise<ResumeAnalysis> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_id', jobId);
    formData.append('applicant_id', applicantId);

    const response = await apiFetch('/api/resume/analyze', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  /** GET /api/resume/ranking?job_id={job_id} — Combined ranking */
  getRanking: async (jobId: string): Promise<RankingResponse> => {
    const response = await apiFetch(`/api/resume/ranking?job_id=${encodeURIComponent(jobId)}`);
    return response.json();
  },
};

// ─── Behavioural API ──────────────────────────────────────────────────────────

export const behaviouralAPI = {
  /** POST /api/behavioural/analyze — Step 4: Submit behavioural responses */
  analyze: async (
    candidateId: string,
    jobId: string,
    applicantId: string,
    responses: Array<{ question_id: string; text: string }>,
  ): Promise<BehaviouralAnalysis> => {
    const response = await apiFetch('/api/behavioural/analyze', {
      method: 'POST',
      body: JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId,
        applicant_id: applicantId,
        responses,
      }),
    });
    return response.json();
  },
};

// ─── AI API (Legacy/Standalone — NOT used in application flow) ────────────────

export const aiAPI = {
  /** POST /api/ai/generate-questions — Standalone, not part of application flow */
  generateQuestions: async (jobId: string, numQuestions?: number): Promise<string[]> => {
    const response = await apiFetch('/api/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, num_questions: numQuestions }),
    });
    const data = await response.json();
    return (data.questions as string[]) ?? [];
  },
};
