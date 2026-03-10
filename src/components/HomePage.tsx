import { Brain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  onLoginClick: () => void;
}

export function HomePage({ onLoginClick }: HomePageProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] gradient-hero flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Brain className="w-4 h-4" />
          AI-Powered Recruitment
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Welcome to the{' '}
          <span className="text-primary">AI Recruitment Portal</span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Streamline your hiring process with intelligent resume parsing, 
          behavioral assessments, and AI-driven candidate matching.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={onLoginClick} className="text-lg px-8">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="secondary" onClick={onLoginClick} className="text-lg px-8">
            Login to Continue
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            {
              title: 'For Candidates',
              description: 'Upload your resume, get AI insights, and apply to jobs with ease.',
            },
            {
              title: 'For Recruiters',
              description: 'Post jobs, review AI-ranked applicants, and make data-driven decisions.',
            },
            {
              title: 'AI-Powered',
              description: 'NLP resume parsing, behavioural analysis, and intelligent matching.',
            },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="bg-card p-6 rounded-xl shadow-card hover:shadow-elevated transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
