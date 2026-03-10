import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TopBarProps {
  onLoginClick: () => void;
}

export function TopBar({ onLoginClick }: TopBarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-topbar text-topbar-foreground shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">AI Recruitment Portal</h1>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Badge 
                variant={user.role === 'candidate' ? 'candidate' : 'recruiter'}
                className="hidden sm:inline-flex"
              >
                {user.username} ({user.role})
              </Badge>
              <Badge 
                variant={user.role === 'candidate' ? 'candidate' : 'recruiter'}
                className="sm:hidden"
              >
                {user.role}
              </Badge>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout? You will need to login again to access your dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Badge variant="guest">Guest</Badge>
              <Button onClick={onLoginClick} size="sm">
                Login / Signup
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
