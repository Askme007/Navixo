// src/components/pages/AuthPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;

  useEffect(() => {
    window.scrollTo(0, 0);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;
      if (!data.user) throw new Error("Login failed.");

      const fullName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split("@")[0] ||
        "User";

      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: fullName,
          onboarding_completed: true,
        },
        { onConflict: "id" },
      );

      onAuth(fullName);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!name.trim()) {
        throw new Error("Full name is required.");
      }

      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${apiUrl}/auth/callback`,
        },
      });

      if (signupError) throw signupError;

      if (!data?.user?.identities?.length) {
        throw new Error("This email is already registered. Please sign in.");
      }

      setSuccess("Verification email sent. Check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
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
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 rounded-2xl border-white/10 bg-[#0B0B0F] text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/30"
                  />
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
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="h-12 rounded-2xl border-white/10 bg-[#0B0B0F] text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-400/30"
                  />
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
              <div className="h-px flex-1 bg-white/10" />
              or
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={loading}
              className="h-12 w-full rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
