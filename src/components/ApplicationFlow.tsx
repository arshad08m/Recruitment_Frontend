import React, { useState, useEffect, useCallback } from 'react';
import { Job, ResumeAnalysis, BehaviouralAnalysis } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Upload, Loader2, Clock, CheckCircle, AlertTriangle, Brain, FileText, TrendingUp, User, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resumeAPI, applicationsAPI, behaviouralAPI, aiAPI } from '@/lib/api';

interface ApplicationFlowProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = 'upload' | 'analysis' | 'behavioural' | 'submitting' | 'results';

const FALLBACK_QUESTIONS = [
  'Tell us about a challenging situation you handled at work and how you resolved it.',
  'How do you handle pressure and tight deadlines?',
  'Describe a failure you experienced and what you learned from it.',
];

export const ApplicationFlow = React.forwardRef<HTMLDivElement, ApplicationFlowProps>(
  ({ job, open, onOpenChange, onSuccess }, ref) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('upload');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [behaviouralResult, setBehaviouralResult] = useState<BehaviouralAnalysis | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>(['', '', '']);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(180);
    const [timerActive, setTimerActive] = useState(false);
    const [timeExpired, setTimeExpired] = useState(false);

    // Reset state when dialog closes or job changes
    useEffect(() => {
      if (!open) {
        setStep('upload');
        setResumeFile(null);
        setAnalysis(null);
        setBehaviouralResult(null);
        setQuestions([]);
        setAnswers(['', '', '']);
        setTimeLeft(180);
        setTimerActive(false);
        setTimeExpired(false);
      }
    }, [open]);

    // Timer logic
    useEffect(() => {
      if (!timerActive || timeExpired) return;
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimeExpired(true);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [timerActive, timeExpired]);

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (validTypes.includes(file.type) || file.name.match(/\.(pdf|docx?)/i)) {
          setResumeFile(file);
          toast({ title: 'File Uploaded', description: file.name });
        } else {
          toast({ title: 'Invalid File', description: 'Please upload a PDF or DOCX file', variant: 'destructive' });
        }
      }
    };

    const handleAnalyzeResume = async () => {
      if (!resumeFile || !job) return;

      setIsAnalyzing(true);
      try {
        // Run resume analysis and AI question generation in parallel
        const [result, generatedQuestions] = await Promise.all([
          resumeAPI.analyze(resumeFile, job.description),
          aiAPI.generateQuestions(job.description).catch(() => [] as string[]),
        ]);
        setAnalysis(result);
        const finalQuestions = generatedQuestions.length > 0
          ? generatedQuestions.slice(0, 5)
          : FALLBACK_QUESTIONS;
        setQuestions(finalQuestions);
        setAnswers(new Array(finalQuestions.length).fill(''));
        setStep('analysis');
      } catch (error) {
        toast({
          title: 'Analysis failed',
          description: error instanceof Error ? error.message : 'Could not analyze resume',
          variant: 'destructive',
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    const startBehavioural = () => {
      setStep('behavioural');
      setTimerActive(true);
    };

    const handleAnswerChange = useCallback((index: number, value: string) => {
      if (timeExpired) return;
      setAnswers(prev => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    }, [timeExpired]);

    const handleSubmit = async () => {
      if (!job || !user) return;

      setIsSubmitting(true);
      setStep('submitting');

      try {
        // 1. Create the application record — returns applicant_id
        const applyResult = await applicationsAPI.apply(job.id, user.username);
        const applicantId = applyResult.applicant_id;

        // 2. Write resume scores onto the new applicant record.
        //    The backend caches resumes by MD5 hash so no re-parsing happens;
        //    it simply saves resume_score / extracted_skills against applicant_id.
        if (resumeFile) {
          await resumeAPI
            .analyze(resumeFile, job.description, applicantId)
            .catch(err => console.warn('Resume score write-back failed (non-critical):', err));
        }

        // 3. Submit behavioural analysis — backend writes behavioural_score to applicant record
        let bResult: BehaviouralAnalysis | null = null;
        const responses = questions.map((q, i) => ({
          question_id: `q${i + 1}`,
          text: answers[i] || '',
        }));
        if (responses.length > 0) {
          bResult = await behaviouralAPI
            .analyze(user.id, job.id, responses)
            .catch(err => { console.warn('Behavioural analysis failed (non-critical):', err); return null; });
        }

        setBehaviouralResult(bResult);
        toast({
          title: 'Application Submitted!',
          description: `Successfully applied. Application ID: ${applicantId}`,
        });
        onSuccess();
        setStep('results');
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to submit application';
        const isDuplicate = msg.toLowerCase().includes('already') || msg.includes('409') || msg.includes('Conflict');
        toast({
          title: isDuplicate ? 'Already Applied' : 'Submission Failed',
          description: isDuplicate ? 'You have already applied to this job.' : msg,
          variant: 'destructive',
        });
        setStep('behavioural');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!job) return null;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent ref={ref} className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {step === 'upload' && 'Upload Resume'}
              {step === 'analysis' && 'AI Resume Analysis'}
              {step === 'behavioural' && 'Behavioural Assessment'}
              {step === 'submitting' && 'Submitting...'}
              {step === 'results' && 'Your Assessment Results'}
            </DialogTitle>
            <p className="text-muted-foreground">
              {job.title} — {job.location}
            </p>
          </DialogHeader>

          {/* Progress indicator */}
          {step !== 'submitting' && (
            <div className="flex items-center gap-2 mb-4">
              {(['upload', 'analysis', 'behavioural', 'results'] as Step[]).map((s, i) => {
                const steps: Step[] = ['upload', 'analysis', 'behavioural', 'results'];
                const currentIdx = steps.indexOf(step);
                return (
                  <div key={s} className="flex-1">
                    <div className={`w-full h-1.5 rounded-full ${
                      step === s ? 'bg-primary' : currentIdx > i ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 1: Upload Resume */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="resume" className="cursor-pointer">
                  <span className="text-lg font-medium block mb-2">
                    {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                  </span>
                  <span className="text-sm text-muted-foreground">PDF or DOCX (max 10MB)</span>
                </Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={!resumeFile || isAnalyzing}
                  onClick={handleAnalyzeResume}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Resume Analysis */}
          {step === 'analysis' && analysis && (
            <div className="space-y-4">
              {/* Overall score */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Overall Match Score</span>
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(analysis.scores.final_weighted_score)}%
                  </span>
                </div>
                <Progress value={analysis.scores.final_weighted_score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Candidate: {analysis.candidate_name} — Role: {analysis.job_title}
                </p>
              </div>

              {/* Score breakdown */}
              <div className="bg-muted/30 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Score Breakdown</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Skills', value: analysis.scores.skill_score },
                    { label: 'Responsibilities', value: analysis.scores.responsibility_score },
                    { label: 'Qualifications', value: analysis.scores.qualification_score },
                    { label: 'Tech Proof', value: analysis.scores.tech_proof_score },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{Math.round(value)}%</span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills matched / missing */}
              {(analysis.skills.matched.length > 0 || analysis.skills.missing.length > 0) && (
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Skills</span>
                  </div>
                  {analysis.skills.matched.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Matched</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.skills.matched.slice(0, 8).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.skills.missing.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Missing</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.skills.missing.slice(0, 8).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resume skills (all detected) */}
              {analysis.skills.resume_skills.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">All Detected Resume Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.skills.resume_skills.slice(0, 12).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                    {analysis.skills.resume_skills.length > 12 && (
                      <Badge variant="outline" className="text-xs">+{analysis.skills.resume_skills.length - 12} more</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* PDF report link */}
              {analysis.analysis_report_pdf && (
                <a
                  href={`http://localhost:8000${analysis.analysis_report_pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary underline hover:text-primary/80"
                >
                  <FileText className="w-4 h-4" />
                  Download Full Analysis Report (PDF)
                </a>
              )}

              <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-semibold">Next Step</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete the behavioural assessment to strengthen your application.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep('upload')}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button className="flex-1" onClick={startBehavioural}>
                  Continue to Assessment <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Behavioural Assessment */}
          {step === 'behavioural' && (
            <div className="space-y-4">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                timeExpired ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Time Left: {formatTime(timeLeft)}</span>
                {timeExpired && <span className="ml-auto text-sm">Time is over. Answers locked.</span>}
              </div>

              <div className="space-y-4">
                {(questions.length > 0 ? questions : FALLBACK_QUESTIONS).slice(0, 5).map((question, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-medium">{question}</Label>
                    <Textarea
                      value={answers[index] ?? ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={timeExpired}
                      rows={3}
                      placeholder="Type your answer here..."
                      onPaste={(e) => e.preventDefault()}
                      className={timeExpired ? 'opacity-60' : ''}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => { setTimerActive(false); setStep('analysis'); }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Submitting state */}
          {step === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Submitting your application...</p>
              <p className="text-muted-foreground">Please wait</p>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Application submitted successfully!</span>
              </div>

              {behaviouralResult ? (
                <>
                  {/* Behavioural score */}
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Behavioural Score</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {Math.round(behaviouralResult.behavioural_score * 100)}%
                      </span>
                    </div>
                    <Progress value={behaviouralResult.behavioural_score * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      Sentiment: {behaviouralResult.sentiment.label} ({behaviouralResult.sentiment.polarity.toFixed(2)})
                    </p>
                  </div>

                  {/* Big Five personality */}
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Big Five Personality</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(behaviouralResult.big_five).map(([trait, value]) => (
                        <div key={trait} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{trait}</span>
                            <span className="font-medium">{Math.round((value as number) * 100)}%</span>
                          </div>
                          <Progress value={(value as number) * 100} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Soft skills */}
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Soft Skills</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(behaviouralResult.soft_skills).map(([skill, value]) => (
                        <div key={skill} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{skill.replace('_', ' ')}</span>
                            <span className="font-medium">{Math.round((value as number) * 100)}%</span>
                          </div>
                          <Progress value={(value as number) * 100} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 border text-center">
                  <p className="text-sm text-muted-foreground">Behavioural analysis could not be retrieved.</p>
                </div>
              )}

              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

ApplicationFlow.displayName = 'ApplicationFlow';
