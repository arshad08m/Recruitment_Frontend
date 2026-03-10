import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { JobProvider } from '@/context/JobContext';
import { SplashScreen } from '@/components/SplashScreen';
import { TopBar } from '@/components/TopBar';
import { AuthDialog } from '@/components/AuthDialog';
import { HomePage } from '@/components/HomePage';
import { CandidateDashboard } from '@/components/CandidateDashboard';
import { RecruiterDashboard } from '@/components/RecruiterDashboard';
import { Toaster } from '@/components/ui/toaster';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return <HomePage onLoginClick={() => setAuthDialogOpen(true)} />;
    }

    if (user?.role === 'candidate') {
      return <CandidateDashboard />;
    }

    if (user?.role === 'recruiter') {
      return <RecruiterDashboard />;
    }

    return <HomePage onLoginClick={() => setAuthDialogOpen(true)} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {!showSplash && (
        <>
          <TopBar onLoginClick={() => setAuthDialogOpen(true)} />
          <main>{renderContent()}</main>
          <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
          <Toaster />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <AppContent />
      </JobProvider>
    </AuthProvider>
  );
}

export default App;
