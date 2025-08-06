
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/common/logo';
import { Separator } from '@/components/ui/separator';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25C22.56 11.42 22.49 10.61 22.36 9.82H12V14.45H18.02C17.73 16.03 16.85 17.39 15.59 18.25V21.09H19.5C21.43 19.34 22.56 16.03 22.56 12.25Z"
        fill="#4285F4"
      />
      <path
        d="M12 23C14.97 23 17.45 22.02 19.5 20.35L15.59 17.51C14.63 18.15 13.42 18.55 12 18.55C9.09 18.55 6.64 16.64 5.77 14.07L1.75 14.07V16.91C3.64 20.47 7.48 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.77 14.07C5.54 13.41 5.4 12.71 5.4 12C5.4 11.29 5.54 10.59 5.77 9.93L5.77 7.09H1.75C0.94 8.63 0.5 10.26 0.5 12C0.5 13.74 0.94 15.37 1.75 16.91L5.77 14.07Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.45C13.56 5.45 14.88 6.02 15.89 6.94L19.58 3.54C17.45 1.58 14.97 0.5 12 0.5C7.48 0.5 3.64 3.03 1.75 6.59L5.77 9.43C6.64 6.86 9.09 5.45 12 5.45Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
      setError('User ID and password are required.');
      return;
    }
    setError('');
    // Simulate successful login
    localStorage.setItem('user', JSON.stringify({ userId, isAdmin }));
    router.push('/dashboard');
  };

  const handleGoogleLogin = () => {
    // const baseUrl = "https://backend-260725-001-591673101878.us-central1.run.app";
    const baseUrl = "https://sahayak-backend-003-591673101878.us-central1.run.app";
    window.location.href = `${baseUrl}/auth/login`;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl font-headline">Teacher's Sahayak</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User ID</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="user_id"
                  type="text"
                  placeholder="e.g., your_email@school.edu"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_admin"
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
              />
              <Label htmlFor="is_admin" className="font-normal">
                I am an administrator
              </Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-google-blue hover:bg-google-blue/90">
              Login
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            <GoogleIcon className="mr-2" />
            Login with Google
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          Forgot your password? Contact support.
        </p>
      </CardFooter>
    </Card>
  );
}
