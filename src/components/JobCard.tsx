import React from 'react';
import { Job } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Briefcase, Users } from 'lucide-react';

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
  onApply?: () => void;
  showApplicants?: boolean;
  onViewApplicants?: () => void;
}

export const JobCard = React.forwardRef<HTMLDivElement, JobCardProps>(
  ({ job, isApplied, onApply, showApplicants, onViewApplicants }, ref) => {
    return (
      <Card ref={ref} className="h-full flex flex-col hover:shadow-elevated transition-all duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
              {job.title}
            </CardTitle>
            {isApplied && (
              <Badge variant="success" className="shrink-0">Applied</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {job.job_type}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {(job.required_skills ?? []).slice(0, 4).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {(job.required_skills?.length ?? 0) > 4 && (
              <Badge variant="outline" className="text-xs">
                +{(job.required_skills?.length ?? 0) - 4} more
              </Badge>
            )}
          </div>
          {showApplicants && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{job.applicant_count ?? 0} applicants</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          {showApplicants ? (
            <Button onClick={onViewApplicants} className="w-full" size="sm">
              View Applicants ({job.applicant_count ?? 0})
            </Button>
          ) : (
            <Button
              onClick={onApply}
              disabled={isApplied || !job.is_active}
              className="w-full"
              size="sm"
              variant={isApplied ? 'secondary' : 'default'}
            >
              {isApplied ? 'Already Applied' : !job.is_active ? 'Closed' : 'Apply Now'}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
);

JobCard.displayName = 'JobCard';

