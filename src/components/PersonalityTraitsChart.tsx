import React from 'react';
import { PersonalityTraits } from '@/types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface PersonalityTraitsChartProps {
  traits: PersonalityTraits;
  className?: string;
}

export const PersonalityTraitsChart: React.FC<PersonalityTraitsChartProps> = ({ traits, className }) => {
  const data = [
    { trait: 'Openness', value: traits.openness, fullMark: 100 },
    { trait: 'Conscientiousness', value: traits.conscientiousness, fullMark: 100 },
    { trait: 'Extraversion', value: traits.extraversion, fullMark: 100 },
    { trait: 'Agreeableness', value: traits.agreeableness, fullMark: 100 },
    { trait: 'Emotional Stability', value: 100 - traits.neuroticism, fullMark: 100 },
  ];

  return (
    <div className={className}>
      <h4 className="text-sm font-semibold mb-2 text-center">Big Five Personality Profile</h4>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="trait" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.4}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
