import React from 'react';
import { Job } from '@/types';
import { FunnelChart, Funnel, Cell, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface HiringFunnelChartProps {
  jobs: Job[];
  className?: string;
}

export const HiringFunnelChart: React.FC<HiringFunnelChartProps> = ({ jobs, className }) => {
  const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicant_count ?? 0), 0);
  const activeJobs = jobs.filter(j => j.is_active).length;

  const data = [
    { name: 'Job Postings', value: jobs.length, fill: 'hsl(217, 91%, 60%)' },
    { name: 'Active Jobs', value: activeJobs, fill: 'hsl(45, 93%, 47%)' },
    { name: 'Applications', value: totalApplicants, fill: 'hsl(142, 76%, 36%)' },
  ].filter(d => d.value > 0);


  return (
    <div className={className}>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Funnel
              dataKey="value"
              data={data}
              isAnimationActive
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList 
                position="center" 
                fill="white" 
                stroke="none"
                fontSize={12}
                formatter={(value: number) => value.toString()}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="text-muted-foreground">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
