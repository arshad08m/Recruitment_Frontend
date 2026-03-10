import { useState, useEffect } from 'react';
import { Job, Applicant } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FitScoreGauge } from '@/components/FitScoreGauge';
import { User, Calendar, CheckCircle, XCircle, Edit, Loader2 } from 'lucide-react';
import { applicationsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ApplicantsDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ApplicantsDialog({ job, open, onOpenChange, onUpdate }: ApplicantsDialogProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Fetch applicants when dialog opens
  useEffect(() => {
    if (open && job) {
      setIsLoading(true);
      setApplicants([]);
      setSelectedApplicant(null);
      applicationsAPI
        .getApplicants(job.id)
        .then(data => setApplicants(data.applicants ?? []))
        .catch(err => {
          toast({ title: 'Error', description: err.message ?? 'Failed to load applicants', variant: 'destructive' });
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, job]);

  if (!job) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return <Badge variant="shortlisted">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="rejected">{status}</Badge>;
      default:
        return <Badge variant="underReview">{status}</Badge>;
    }
  };

  const sortedApplicants = [...applicants].sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0));

  const handleStatusUpdate = async (status: 'Shortlisted' | 'Rejected') => {
    if (!selectedApplicant) return;
    setIsUpdating(true);
    try {
      await applicationsAPI.updateStatus(selectedApplicant.id, status);
      const updated = { ...selectedApplicant, status, locked: true };
      setSelectedApplicant(updated);
      setApplicants(prev => prev.map(a => a.id === updated.id ? updated : a));
      onUpdate();
      toast({
        title: 'Decision Saved',
        description: `Candidate ${status === 'Shortlisted' ? 'shortlisted' : 'rejected'} successfully`,
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditDecision = async () => {
    if (!selectedApplicant) return;
    setIsUpdating(true);
    try {
      await applicationsAPI.unlockDecision(selectedApplicant.id);
      const updated = { ...selectedApplicant, locked: false };
      setSelectedApplicant(updated);
      setApplicants(prev => prev.map(a => a.id === updated.id ? updated : a));
      toast({ title: 'Decision Unlocked', description: 'You can now change your decision' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to unlock decision', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedApplicant ? selectedApplicant.candidate_name : 'Applicants'}
          </DialogTitle>
          <p className="text-muted-foreground">
            {selectedApplicant
              ? `Applied for ${job.title}`
              : `${applicants.length} applicant${applicants.length !== 1 ? 's' : ''} for ${job.title} (ranked by fit score)`}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading applicants...</p>
          </div>
        ) : !selectedApplicant ? (
          // ── Applicants List ──────────────────────────────────────────────
          <div className="space-y-3">
            {applicants.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No applicants yet</p>
              </div>
            ) : (
              sortedApplicants.map((applicant, index) => (
                <Card
                  key={applicant.id}
                  className="cursor-pointer hover:shadow-elevated transition-all"
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{applicant.candidate_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(applicant.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            (applicant.fit_score ?? 0) >= 80 ? 'text-success' :
                            (applicant.fit_score ?? 0) >= 60 ? 'text-primary' : 'text-warning'
                          }`}>
                            {applicant.fit_score ?? '—'}
                            {applicant.fit_score != null ? '%' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">Fit Score</p>
                        </div>
                        {getStatusBadge(applicant.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          // ── Applicant Detail View ────────────────────────────────────────
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedApplicant(null)} className="mb-2">
              ← Back to list
            </Button>

            {/* Fit Score gauge */}
            <div className="flex justify-center">
              <FitScoreGauge
                score={selectedApplicant.fit_score ?? 0}
                resumeScore={selectedApplicant.resume_score ?? 0}
                behaviourScore={selectedApplicant.behavioural_score ?? 0}
                resumeWeight={50}
                behaviourWeight={50}
                size="lg"
              />
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Resume Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedApplicant.resume_score ?? 0} className="flex-1 h-2" />
                    <span className="font-semibold text-sm">{selectedApplicant.resume_score ?? '—'}{selectedApplicant.resume_score != null ? '%' : ''}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Behavioural Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedApplicant.behavioural_score ?? 0} className="flex-1 h-2" />
                    <span className="font-semibold text-sm">{selectedApplicant.behavioural_score ?? '—'}{selectedApplicant.behavioural_score != null ? '%' : ''}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Meta info */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applied on</span>
                  <span className="text-sm font-medium">{new Date(selectedApplicant.applied_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Status</span>
                  {getStatusBadge(selectedApplicant.status)}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="success"
                className="flex-1"
                disabled={selectedApplicant.locked || isUpdating}
                onClick={() => handleStatusUpdate('Shortlisted')}
              >
                <CheckCircle className="w-4 h-4" />
                Proceed
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={selectedApplicant.locked || isUpdating}
                onClick={() => handleStatusUpdate('Rejected')}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                variant="secondary"
                disabled={!selectedApplicant.locked || isUpdating}
                onClick={handleEditDecision}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
