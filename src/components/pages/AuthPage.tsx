// src/components/pages/AuthPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
interface AuthPageProps {
  onAuth: (name: string) => void;
  onBack: () => void;
}

type Mode = "login" | "signup";

export function AuthPage({ onAuth, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [success, setSuccess] = useState("");

  const navigate = useNavigate(); // Make sure this is declared near the top of your component

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");
        const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3001";
        
        const res = await fetch(`${baseUrl}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });

        const data = await res.json();
        
        if (data.token) {
          authService.setToken(data.token);
          
          // 📍 ADD THIS LINE: Save the user data to local storage!
          authService.setUser(data.user); 
          
          // Set it in the active React state
          onAuth(data.user?.name || "Google User"); 
          
          // Route based on onboarding status
          if (data.user?.onboardingCompleted) {
            navigate("/dashboard"); 
          } else {
            navigate("/onboarding");
          }
          
        } else {
          setError(data.error || "Failed to retrieve authentication token.");
        } 
      } catch (err) {
        console.error("Google auth error:", err);
        setError("Network error during Google authentication.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google popup closed or failed."),
  });


  // Local Auth Listener for Email/Password Sign In
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      authService.setToken(data.token);
      authService.setUser(data.user);

      onAuth(data.user.name);

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      authService.setToken(data.token);
      authService.setUser(data.user);

      onAuth(data.user.name);

      navigate("/onboarding");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
        <div className="w-full">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold tracking-tight text-white">
                Navixo
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {mode === "login"
                  ? "Sign in to continue your execution plan."
                  : "Create an account to start your roadmap and tasks."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-[#0B0B0F] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setSuccess("");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign up
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="login-email"
                    className="text-sm text-slate-200"
                  >
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-12 rounded-2xl border-white/10 bg-[#0B0B0F] text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="login-password"
                    className="text-sm text-slate-200"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-12 rounded-2xl border-white/10 bg-[#0B0B0F] text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-2xl border border-rose-500/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-name"
                    className="text-sm text-slate-200"
                  >
                    Full name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="h-12 rounded-2xl border-white/10 bg-[#0B0B0F] text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-sm text-slate-200"
                  >
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-12 rounded-2xl border-white/10 bg-[#0B0B0F] text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-sm text-slate-200"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      className="h-12 rounded-2xl border-white/10 bg-[#0B0B0F] text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-2xl border border-rose-500/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {success}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            )}

            <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              <div className="h-px flex-1 bg-white/10" /> or{" "}
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithGoogle()}
              disabled={loading}
              className="h-12 w-full flex items-center justify-center gap-3 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
          </div>
        </div>
      </div>
    </div>
  );
}
