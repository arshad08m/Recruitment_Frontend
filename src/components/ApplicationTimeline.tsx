import React from 'react';
import { Applicant } from '@/types';
import { CheckCircle, Clock, FileText, Brain, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationTimelineProps {
  applicant: Applicant;
  className?: string;
}

type TimelineStep = {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
};

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ applicant, className }) => {
  const getSteps = (): TimelineStep[] => {
    const hasResume = applicant.resume_score != null;
    const hasBehavioural = applicant.behavioural_score != null;
    const isInProgress = applicant.status === 'In Progress';

    const baseSteps: TimelineStep[] = [
      {
        id: 'applied',
        label: 'Application Started',
        icon: <Send className="w-4 h-4" />,
        status: 'completed',
        timestamp: applicant.applied_at
          ? new Date(applicant.applied_at).toLocaleString()
          : undefined,
      },
      {
        id: 'resume',
        label: 'Resume Analyzed',
        icon: <FileText className="w-4 h-4" />,
        status: hasResume ? 'completed' : (isInProgress ? 'current' : 'completed'),
      },
      {
        id: 'behavioural',
        label: 'Behavioural Assessment',
        icon: <Brain className="w-4 h-4" />,
        status: hasBehavioural ? 'completed' : (hasResume && isInProgress ? 'current' : (isInProgress ? 'pending' : 'completed')),
      },
      {
        id: 'review',
        label: 'Under Review',
        icon: <Clock className="w-4 h-4" />,
        status: isInProgress ? 'pending' : (applicant.status === 'Under Review' ? 'current' : 'completed'),
      },
    ];

    if (applicant.status === 'Shortlisted') {
      baseSteps.push({
        id: 'shortlisted',
        label: 'Shortlisted',
        icon: <CheckCircle className="w-4 h-4" />,
        status: 'completed',
      });
    } else if (applicant.status === 'Rejected') {
      baseSteps.push({
        id: 'decision',
        label: 'Not Selected',
        icon: <CheckCircle className="w-4 h-4" />,
        status: 'completed',
      });
    } else {
      baseSteps.push({
        id: 'decision',
        label: 'Final Decision',
        icon: <CheckCircle className="w-4 h-4" />,
        status: 'pending',
      });
    }

    return baseSteps;
  };

  const steps = getSteps();

  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-3">
          {/* Icon and line */}
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
              step.status === 'completed' && 'bg-success border-success text-success-foreground',
              step.status === 'current' && 'bg-primary border-primary text-primary-foreground',
              step.status === 'pending' && 'bg-muted border-muted-foreground/30 text-muted-foreground',
            )}>
              {step.icon}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'w-0.5 h-8 transition-colors',
                step.status === 'completed' ? 'bg-success' : 'bg-muted-foreground/30'
              )} />
            )}
          </div>
          
          {/* Content */}
          <div className="pb-6 flex-1">
            <p className={cn(
              'font-medium text-sm',
              step.status === 'pending' && 'text-muted-foreground'
            )}>
              {step.label}
            </p>
            {step.timestamp && (
              <p className="text-xs text-muted-foreground mt-0.5">{step.timestamp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
