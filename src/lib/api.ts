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
  /** POST /api/applications/jobs/{job_id}/apply (candidate only) */
  apply: async (
    jobId: string,
    candidateName: string,
  ): Promise<{ success: boolean; applicant_id: string; applied_at: string }> => {
    const formData = new FormData();
    formData.append('candidate_name', candidateName);
    formData.append('job_id', jobId);

    const response = await apiFetch(`/api/applications/jobs/${jobId}/apply`, {
      method: 'POST',
      body: formData,
    });
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
  /** POST /api/resume/analyze — multipart form: jd_text + file + optional applicant_id */
  analyze: async (file: File, jdText: string, applicantId?: string): Promise<ResumeAnalysis> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jd_text', jdText);
    if (applicantId) {
      formData.append('applicant_id', applicantId);
    }

    const response = await apiFetch('/api/resume/analyze', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  /** GET /api/resume/ranking */
  getRanking: async (): Promise<Array<{ candidate_name: string; score: number; pdf: string }>> => {
    const response = await apiFetch('/api/resume/ranking');
    return response.json();
  },
};

// ─── Behavioural API ──────────────────────────────────────────────────────────

export const behaviouralAPI = {
  /** POST /api/behavioural/analyze */
  analyze: async (
    candidateId: string,
    jobId: string,
    responses: Array<{ question_id: string; text: string }>,
  ): Promise<BehaviouralAnalysis> => {
    const response = await apiFetch('/api/behavioural/analyze', {
      method: 'POST',
      body: JSON.stringify({ candidate_id: candidateId, job_id: jobId, responses }),
    });
    return response.json();
  },
};

// ─── AI API ───────────────────────────────────────────────────────────────────

export const aiAPI = {
  /** POST /api/ai/generate-questions?job_description=... */
  generateQuestions: async (jobDescription: string): Promise<string[]> => {
    const params = new URLSearchParams({ job_description: jobDescription });
    const response = await apiFetch(`/api/ai/generate-questions?${params.toString()}`, {
      method: 'POST',
    });
    const data = await response.json();
    return (data.questions as string[]) ?? [];
  },
};
