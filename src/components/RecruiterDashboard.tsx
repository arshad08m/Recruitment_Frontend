import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/context/JobContext';
import { Job } from '@/types';
import { StatCard } from '@/components/StatCard';
import { CreateJobDialog } from '@/components/CreateJobDialog';
import { ApplicantsDialog } from '@/components/ApplicantsDialog';
import { HiringFunnelChart } from '@/components/HiringFunnelChart';
import { SkillGapChart } from '@/components/SkillGapChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Briefcase, Users, Plus, BarChart3, Target, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function RecruiterDashboard() {
  const { user } = useAuth();
  const { jobs, createJob, deleteJob, refreshJobs } = useJobs();

  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicantsOpen, setApplicantsOpen] = useState(false);
  const [selectedJobForAnalytics, setSelectedJobForAnalytics] = useState<string>('');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const totalApplicants = useMemo(
    () => jobs.reduce((sum, job) => sum + (job.applicant_count ?? 0), 0),
    [jobs],
  );

  const activeJobs = useMemo(() => jobs.filter(j => j.is_active).length, [jobs]);

  const handleViewApplicants = (job: Job) => {
    setSelectedJob(job);
    setApplicantsOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await deleteJob(jobToDelete.id);
    } catch (err) {
      console.error(err);
    } finally {
      setJobToDelete(null);
    }
  };

  const chartData = jobs.map(job => ({
    name: job.title.length > 15 ? job.title.slice(0, 15) + '...' : job.title,
    applicants: job.applicant_count ?? 0,
  }));

  const colors = [
    'hsl(217, 91%, 60%)',
    'hsl(217, 91%, 50%)',
    'hsl(217, 91%, 70%)',
    'hsl(142, 76%, 36%)',
    'hsl(45, 93%, 47%)',
  ];

  const jobForSkillGap = selectedJobForAnalytics
    ? jobs.find(j => j.id === selectedJobForAnalytics)
    : jobs[0];

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Recruiter Dashboard</h2>
          <p className="text-muted-foreground">Manage job postings and review candidates</p>
        </div>
        <Button onClick={() => setCreateJobOpen(true)} size="lg">
          <Plus className="w-5 h-5" />
          Create Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Jobs" value={jobs.length} icon={Briefcase} variant="primary" />
        <StatCard label="Active Jobs" value={activeJobs} icon={Target} variant="success" />
        <StatCard label="Total Applicants" value={totalApplicants} icon={Users} variant="default" />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        {jobs.length > 0 && (
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Overview
            </h3>
            <HiringFunnelChart jobs={jobs} />
          </div>
        )}

        {/* Skill Gap Analysis */}
        {jobForSkillGap && (jobForSkillGap.required_skills?.length ?? 0) > 0 && (
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Required Skills
              </h3>
              <Select
                value={selectedJobForAnalytics || jobs[0]?.id || ''}
                onValueChange={setSelectedJobForAnalytics}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title.length > 20 ? job.title.slice(0, 20) + '...' : job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SkillGapChart job={jobForSkillGap} />
          </div>
        )}
      </div>

      {/* Applicants by Job chart */}
      {jobs.length > 0 && totalApplicants > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Applicants by Job
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="applicants" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Posted Jobs</h3>
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No jobs posted yet. Create your first job posting!
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{job.job_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.experience_required}</TableCell>
                    <TableCell>
                      <Badge variant="default">{job.applicant_count ?? 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={job.is_active ? 'shortlisted' : 'secondary'}>
                        {job.is_active ? 'Active' : 'Closed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleViewApplicants(job)}>
                          View Applicants
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setJobToDelete(job)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateJobDialog
        open={createJobOpen}
        onOpenChange={setCreateJobOpen}
        onSubmit={createJob}
      />

      <ApplicantsDialog
        job={selectedJob}
        open={applicantsOpen}
        onOpenChange={setApplicantsOpen}
        onUpdate={refreshJobs}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!jobToDelete} onOpenChange={open => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{jobToDelete?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
