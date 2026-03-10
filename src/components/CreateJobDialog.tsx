import { useState } from 'react';
import { CreateJobRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateJobRequest) => Promise<unknown>;
}

export function CreateJobDialog({ open, onOpenChange, onSubmit }: CreateJobDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setJobType('Full-time');
    setExperienceRequired('');
    setSalaryRange('');
    setSkillInput('');
    setRequiredSkills([]);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills(prev => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !location || !experienceRequired) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        title,
        description,
        location,
        job_type: jobType,
        experience_required: experienceRequired,
        required_skills: requiredSkills,
        salary_range: salaryRange || undefined,
      });
      resetForm();
      onOpenChange(false);
      toast({
        title: 'Job posted!',
        description: 'Your job posting is now live.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create job',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Job Posting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Python Developer"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Bangalore"
              />
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experience Required */}
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Required *</Label>
              <Input
                id="experience"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                placeholder="e.g. 3+ years"
              />
            </div>

            {/* Salary Range */}
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. 60K-100K"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter"
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                Add
              </Button>
            </div>
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Job'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
