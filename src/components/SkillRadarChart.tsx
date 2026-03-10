import React from 'react';
import { ExtractedSkill } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SkillRadarChartProps {
  skills: ExtractedSkill[];
  title?: string;
  showCategories?: boolean;
  className?: string;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ 
  skills, 
  title = 'Skills Overview',
  showCategories = true,
  className 
}) => {
  const technicalSkills = skills.filter(s => s.category === 'technical');
  const softSkills = skills.filter(s => s.category === 'soft');
  const domainSkills = skills.filter(s => s.category === 'domain');

  const renderSkillGroup = (groupSkills: ExtractedSkill[], label: string, colorClass: string) => {
    if (groupSkills.length === 0) return null;
    
    return (
      <div className="space-y-2">
        {showCategories && (
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</h5>
        )}
        <div className="space-y-2">
          {groupSkills.map((skill, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{skill.name}</span>
                <Badge variant="secondary" className="text-xs">{skill.relevance}%</Badge>
              </div>
              <Progress value={skill.relevance} className={`h-1.5 ${colorClass}`} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {title && <h4 className="text-sm font-semibold mb-4">{title}</h4>}
      <div className="space-y-4">
        {renderSkillGroup(technicalSkills, 'Technical Skills', '')}
        {renderSkillGroup(softSkills, 'Soft Skills', '')}
        {renderSkillGroup(domainSkills, 'Domain Knowledge', '')}
      </div>
    </div>
  );
};
