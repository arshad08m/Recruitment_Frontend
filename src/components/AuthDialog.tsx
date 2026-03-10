import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, signup, isLoading } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('');
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !role) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'signup' && !email) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'signup') {
      const result = await signup(username, password, role, email);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Account created successfully. Please login.',
        });
        setMode('login');
        setPassword('');
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Signup failed',
          variant: 'destructive',
        });
      }
    } else {
      const result = await login(username, password, role);
      if (result.success) {
        toast({
          title: 'Welcome!',
          description: `Logged in as ${username}`,
        });
        resetForm();
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Login failed',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            variant={mode === 'login' ? 'default' : 'secondary'}
            className="flex-1"
            onClick={() => setMode('login')}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={mode === 'signup' ? 'default' : 'secondary'}
            className="flex-1"
            onClick={() => setMode('signup')}
          >
            Signup
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidate">Candidate</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'login' ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Login' : 'Create Account'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
