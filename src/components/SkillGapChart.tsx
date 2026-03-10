import React from 'react';
import { Job } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SkillGapChartProps {
  job: Job;
  className?: string;
}

export const SkillGapChart: React.FC<SkillGapChartProps> = ({ job, className }) => {
  const skills = job.required_skills ?? [];

  const skillData = skills.map(skill => ({
    skill,
    required: 100,
  }));

  if (skillData.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground text-center py-4">
          No required skills defined for this job.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={skillData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
            <YAxis
              dataKey="skill"
              type="category"
              width={100}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [`${value}%`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="required" name="Required" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
