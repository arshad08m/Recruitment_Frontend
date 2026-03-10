import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 gradient-splash flex flex-col items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px hsl(217 91% 60% / 0.3)',
                '0 0 60px hsl(217 91% 60% / 0.5)',
                '0 0 20px hsl(217 91% 60% / 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center"
          >
            <Brain className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
        </div>

        <div className="text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-topbar-foreground mb-2"
          >
            AI Recruitment Portal
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-lg"
          >
            Automating Initial Recruitment
          </motion.p>
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="w-[200px] h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
