import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Job, CreateJobRequest } from '@/types';
import { jobsAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

interface JobContextType {
  jobs: Job[];
  isLoading: boolean;
  refreshJobs: () => Promise<void>;
  createJob: (data: CreateJobRequest) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
  getJobById: (id: string) => Job | undefined;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await jobsAPI.getAll();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createJob = useCallback(async (data: CreateJobRequest) => {
    if (!user) throw new Error('Not authenticated');
    const newJob = await jobsAPI.create(data);
    setJobs(prev => [newJob, ...prev]);
    return newJob;
  }, [user]);

  const deleteJob = useCallback(async (id: string) => {
    await jobsAPI.delete(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  const getJobById = useCallback((id: string) => {
    return jobs.find(j => j.id === id);
  }, [jobs]);

  useEffect(() => {
    if (user) {
      refreshJobs();
    } else {
      setJobs([]);
    }
  }, [user, refreshJobs]);

  return (
    <JobContext.Provider
      value={{
        jobs,
        isLoading,
        refreshJobs,
        createJob,
        deleteJob,
        getJobById,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}

