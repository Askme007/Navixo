import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ArrowLeft } from 'lucide-react';
import { PaiLogo } from '../PaiLogo';

interface AuthPageProps {
  onAuth: (name: string) => void;
  onBack: () => void;
}

export function AuthPage({ onAuth, onBack }: AuthPageProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      // Mock login - extract name from email
      const name = loginEmail.split('@')[0];
      onAuth(name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupName && signupEmail && signupPassword) {
      onAuth(signupName);
    }
  };

  const handleGoogleAuth = () => {
    // Mock Google authentication
    onAuth('Demo User');
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 text-white/80 hover:text-white hover:bg-white/5 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Logo and Title - PAI Branding */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#262626] rounded-2xl flex items-center justify-center border border-white/10 shadow-lg shadow-black/20">
              <PaiLogo className="w-8 h-8 sm:w-10 sm:h-10 text-white" size={40} />
            </div>
          </div>
          <h1 className="text-white mb-2 text-2xl sm:text-3xl">Welcome to PAI</h1>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-[2px] w-8 bg-white"></div>
            <p className="text-[#F2F2F2] text-sm sm:text-base">Pathfinder AI</p>
            <div className="h-[2px] w-8 bg-white"></div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg border border-white/10 bg-[#232323] rounded-xl shadow-black/20">
          <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
            <CardTitle className="text-white text-xl sm:text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-[#CCCCCC] text-sm sm:text-base">Sign in to continue your journey</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <Tabs defaultValue="login" className="w-full">
              {/* Tab Navigation */}
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-[#2B2B2B] h-10 sm:h-11 border border-white/10">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-[#CCCCCC] text-sm sm:text-base rounded-md"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-[#CCCCCC] text-sm sm:text-base rounded-md"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="border-white/10 bg-[#333333] text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="border-white/10 bg-[#333333] text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10 rounded-lg"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <a href="#" className="text-sm text-[#CCCCCC] hover:text-white">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white hover:bg-[#F2F2F2] text-black shadow-md shadow-black/20 rounded-lg"
                  >
                    Sign In
                  </Button>
                </form>

                <div className="relative my-6">
                  <Separator className="bg-white/10" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#232323] px-2 text-sm text-[#CCCCCC]">
                    or
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="w-full border-white/10 text-white hover:bg-white/5 bg-[#2B2B2B] rounded-lg"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="border-white/10 bg-[#333333] text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="border-white/10 bg-[#333333] text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="border-white/10 bg-[#333333] text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10 rounded-lg"
                    />
                  </div>
                  
                  <p className="text-xs text-[#CCCCCC]">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>

                  <Button
                    type="submit"
                    className="w-full bg-white hover:bg-[#F2F2F2] text-black shadow-md shadow-black/20 rounded-lg"
                  >
                    Create Account
                  </Button>
                </form>

                <div className="relative my-6">
                  <Separator className="bg-white/10" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#232323] px-2 text-sm text-[#CCCCCC]">
                    or
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  className="w-full border-white/10 text-white hover:bg-white/5 bg-[#2B2B2B] rounded-lg"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <p className="text-center text-sm text-[#CCCCCC] mt-6">
          Demo app — any email and password will work
        </p>
      </div>
    </div>
  );
}