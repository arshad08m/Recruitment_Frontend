import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/context/JobContext';
import { Job, Applicant, ApplicationStats } from '@/types';
import { applicationsAPI } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { JobCard } from '@/components/JobCard';
import { ApplicationFlow } from '@/components/ApplicationFlow';
import { ApplicationTimeline } from '@/components/ApplicationTimeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatScorePercent, scoreToProgressValue } from '@/lib/score';
import { FileCheck, CheckCircle, XCircle, Briefcase, TrendingUp, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function CandidateDashboard() {
  const { user } = useAuth();
  const { jobs, refreshJobs } = useJobs();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [myApplications, setMyApplications] = useState<Applicant[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({ applied: 0, inProgress: 0, shortlisted: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<{ job: Job; applicant: Applicant } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadApplications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await applicationsAPI.getMyApplications();
      const apps = data.applications ?? [];
      setMyApplications(apps);

      const newStats = apps.reduce(
        (acc, applicant) => {
          acc.applied++;
          if (applicant.status === 'In Progress') acc.inProgress++;
          if (applicant.status === 'Shortlisted') acc.shortlisted++;
          if (applicant.status === 'Rejected') acc.rejected++;
          return acc;
        },
        { applied: 0, inProgress: 0, shortlisted: 0, rejected: 0 },
      );
      setStats(newStats);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setApplicationOpen(true);
  };

  const handleApplicationSuccess = async () => {
    await refreshJobs();
    await loadApplications();
  };

  const isApplied = (jobId: string) => myApplications.some(a => a.job_id === jobId);

  const getJobForApplication = (app: Applicant): Job | undefined =>
    jobs.find(j => j.id === app.job_id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted': return <Badge variant="shortlisted">{status}</Badge>;
      case 'Rejected': return <Badge variant="rejected">{status}</Badge>;
      case 'In Progress': return <Badge variant="secondary">{status}</Badge>;
      default: return <Badge variant="underReview">{status}</Badge>;
    }
  };

  const handleViewDetails = (applicant: Applicant) => {
    const job = getJobForApplication(applicant);
    if (job) {
      setSelectedApplication({ job, applicant });
      setDetailsOpen(true);
    }
  };

  const chartData = [
    { name: 'In Progress', value: stats.inProgress, color: 'hsl(45, 93%, 47%)' },
    { name: 'Under Review', value: stats.applied - stats.inProgress - stats.shortlisted - stats.rejected, color: 'hsl(217, 91%, 60%)' },
    { name: 'Shortlisted', value: stats.shortlisted, color: 'hsl(142, 76%, 36%)' },
    { name: 'Rejected', value: stats.rejected, color: 'hsl(0, 84%, 60%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h2>
        <p className="text-muted-foreground">Track your applications and explore new opportunities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard label="Total Applied" value={stats.applied} icon={FileCheck} variant="primary" />
            <StatCard label="Shortlisted" value={stats.shortlisted} icon={CheckCircle} variant="success" />
            <StatCard label="Rejected" value={stats.rejected} icon={XCircle} variant="destructive" />
          </>
        )}
      </div>

      {/* Application Analytics */}
      {stats.applied > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Application Analytics
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Available Jobs */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Available Jobs
        </h3>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isApplied={isApplied(job.id)}
                onApply={() => handleApply(job)}
              />
            ))}
          </div>
        )}
      </div>

      {/* My Applications Table */}
      {myApplications.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">My Applications</h3>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead className="min-w-[130px]">Resume Score</TableHead>
                  <TableHead className="min-w-[130px]">Behavioural Score</TableHead>
                  <TableHead className="min-w-[130px]">Combined Score</TableHead>
                  <TableHead className="min-w-[130px]">Fit Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myApplications.map(applicant => {
                  const job = getJobForApplication(applicant);
                  const scoreColor = (v: number) =>
                    v >= 80 ? 'text-green-600 dark:text-green-400' :
                    v >= 60 ? 'text-primary' : 'text-orange-500';
                  const resumeScore = scoreToProgressValue(applicant.resume_score);
                  const behaviouralScore = scoreToProgressValue(applicant.behavioural_score);
                  const combinedScore = scoreToProgressValue(applicant.combined_score);
                  const fitScore = scoreToProgressValue(applicant.fit_score);
                  return (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">
                        <div>{job?.title ?? applicant.job_id}</div>
                        <div className="text-xs text-muted-foreground">{job?.location}</div>
                      </TableCell>

                      {/* Resume Score */}
                      <TableCell>
                        {applicant.resume_score != null ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={`font-semibold ${scoreColor(resumeScore)}`}>
                                {formatScorePercent(applicant.resume_score)}
                              </span>
                            </div>
                            <Progress value={resumeScore} className="h-1.5 w-24" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>

                      {/* Behavioural Score */}
                      <TableCell>
                        {applicant.behavioural_score != null ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={`font-semibold ${scoreColor(behaviouralScore)}`}>
                                {formatScorePercent(applicant.behavioural_score)}
                              </span>
                            </div>
                            <Progress value={behaviouralScore} className="h-1.5 w-24" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>

                      {/* Combined Score */}
                      <TableCell>
                        {applicant.combined_score != null ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={`font-semibold ${scoreColor(combinedScore)}`}>
                                {formatScorePercent(applicant.combined_score)}
                              </span>
                            </div>
                            <Progress value={combinedScore} className="h-1.5 w-24" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>

                      {/* Fit Score */}
                      <TableCell>
                        {applicant.fit_score != null ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={`font-bold ${scoreColor(fitScore)}`}>
                                {formatScorePercent(applicant.fit_score)}
                              </span>
                            </div>
                            <Progress value={fitScore} className="h-1.5 w-24" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>

                      <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!job}
                          onClick={() => handleViewDetails(applicant)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <ApplicationFlow
        job={selectedJob}
        open={applicationOpen}
        onOpenChange={setApplicationOpen}
        onSuccess={handleApplicationSuccess}
      />

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedApplication.job.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedApplication.job.location} · {selectedApplication.job.job_type}</p>
                </div>
                {getStatusBadge(selectedApplication.applicant.status)}
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/30 rounded-lg p-3 text-center border">
                  <p className="text-xs text-muted-foreground mb-1">Fit Score</p>
                  <p className={`text-xl font-bold ${
                    scoreToProgressValue(selectedApplication.applicant.fit_score) >= 80 ? 'text-success' :
                    scoreToProgressValue(selectedApplication.applicant.fit_score) >= 60 ? 'text-primary' : 'text-warning'
                  }`}>
                    {formatScorePercent(selectedApplication.applicant.fit_score)}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center border">
                  <p className="text-xs text-muted-foreground mb-1">Resume</p>
                  <p className="text-xl font-bold text-primary">
                    {formatScorePercent(selectedApplication.applicant.resume_score)}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center border">
                  <p className="text-xs text-muted-foreground mb-1">Behaviour</p>
                  <p className="text-xl font-bold text-primary">
                    {formatScorePercent(selectedApplication.applicant.behavioural_score)}
                  </p>
                </div>
              </div>

              {/* Score bars */}
              <div className="space-y-3">
                {[
                  { label: 'Resume Score', value: selectedApplication.applicant.resume_score },
                  { label: 'Behavioural Score', value: selectedApplication.applicant.behavioural_score },
                  { label: 'Fit Score', value: selectedApplication.applicant.fit_score },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-sm w-36 shrink-0 text-muted-foreground">{label}</span>
                    <Progress
                      value={scoreToProgressValue(value)}
                      className="flex-1 h-2"
                    />
                    <span className={`text-sm font-semibold w-12 text-right ${
                      scoreToProgressValue(value) >= 80 ? 'text-green-600 dark:text-green-400' :
                      scoreToProgressValue(value) >= 60 ? 'text-primary' : 'text-orange-500'
                    }`}>
                      {formatScorePercent(value)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-3">Application Progress</h4>
                <ApplicationTimeline applicant={selectedApplication.applicant} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
