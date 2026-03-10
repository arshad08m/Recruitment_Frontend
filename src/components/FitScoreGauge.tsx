import React from 'react';
import { cn } from '@/lib/utils';

interface FitScoreGaugeProps {
  score: number;
  resumeScore: number;
  behaviourScore: number;
  resumeWeight: number;
  behaviourWeight: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FitScoreGauge: React.FC<FitScoreGaugeProps> = ({ 
  score, 
  resumeScore, 
  behaviourScore, 
  resumeWeight, 
  behaviourWeight,
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-primary';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Circular gauge */}
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', textSizeClasses[size], getScoreColor(score))}>
            {score}%
          </span>
          <span className="text-xs text-muted-foreground">Fit Score</span>
        </div>
      </div>

      <p className={cn('text-sm font-medium mt-2', getScoreColor(score))}>
        {getScoreLabel(score)}
      </p>

      {/* Breakdown */}
      <div className="mt-3 w-full space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Resume ({resumeWeight}%)</span>
          <span className="font-medium">{resumeScore}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Behaviour ({behaviourWeight}%)</span>
          <span className="font-medium">{behaviourScore}%</span>
        </div>
      </div>
    </div>
  );
};
