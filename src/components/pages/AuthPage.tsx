//src\components\pages\AuthPage.tsx

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ArrowLeft } from "lucide-react";
import { NavixoLogo } from "../NavixoLogo";
import { motion } from "motion/react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

interface AuthPageProps {
  onAuth: (name: string) => void;
  onBack: () => void;
}

export function AuthPage({ onAuth, onBack }: AuthPageProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Reset scroll position to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user && !waitingForVerification) {
          navigate("/dashboard");
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [waitingForVerification, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    setLoading(false);

    if (error) {
      setLoginError(error.message);
      return;
    }

    if (data.session && data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            "",
          onboarding_completed: true,
        },
        {
          onConflict: "id",
        },
      );

      if (profileError) {
        console.error("Profile upsert failed:", profileError);
        setLoginError("Failed to initialize profile");
        return;
      }

      const fullName = data.user.user_metadata?.full_name;

      const name =
        fullName && fullName.trim().length > 0
          ? fullName
          : data.user.email?.split("@")[0] || "User";

      onAuth(name);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignupError(null);
    setSignupSuccess(null);

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName },
        emailRedirectTo: `${API_URL}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        setSignupError(
          "An account with this email already exists. Please sign in.",
        );
      } else {
        setSignupError(error.message);
      }
      return;
    }

    if (!data?.user?.identities?.length) {
      setSignupError(
        "This email is already registered. Please sign in instead.",
      );
      return;
    }

    setWaitingForVerification(true);
    setSignupSuccess(
      "Verification email sent. Please check your inbox and confirm your email.",
    );
  };

  const handleGoogleAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });

    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/8 via-[#0B0B0F] to-[#8B5CF6]/8" />

      {/* Subtle background glow blobs */}
      <div className="absolute top-[30%] left-[20%] w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-[120px]" />
      <div className="absolute top-[70%] right-[15%] w-80 h-80 bg-[#8B5CF6]/8 rounded-full blur-[100px]" />

      {/* Back Button */}
      {/* <Button
        variant="ghost"
        onClick={onBack}
        className="text-white/60 hover:text-white hover:bg-white/5 transition-all px-3 py-2 h-auto rounded-xl"
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button> */}
      <div className="w-full max-w-[440px] relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        ></motion.div>

        {/* Logo - Clean, No Container */}
        {/* <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <NavixoLogo size={56} variant="white" />
        </motion.div> */}

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border border-white/10 bg-gradient-to-br from-[#13151B]/90 to-[#0D0F13]/90 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">
            <CardContent className="p-8">
              <Tabs
                defaultValue="login"
                className="w-full"
                onValueChange={setActiveTab}
              >
                {/* Tab Navigation */}
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent h-12 p-0 gap-2">
                  <TabsTrigger
                    value="login"
                    className="
    text-[#9CA3AF]
    hover:text-white
    data-[state=active]:bg-white
    data-[state=active]:!text-black
    data-[state=active]:hover:!text-black
    rounded-xl
    transition-all
    duration-200
  "
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    Sign In
                  </TabsTrigger>

                  <TabsTrigger
                    value="signup"
                    className="
    text-[#9CA3AF]
    hover:text-white
    data-[state=active]:bg-white
    data-[state=active]:!text-black
    data-[state=active]:hover:!text-black
    rounded-xl
    transition-all
    duration-200
  "
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <div className="mb-8">
                    <h2
                      className="text-white mb-2"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 600,
                        fontSize: "24px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Welcome back
                    </h2>
                    <p
                      className="text-[#9CA3AF]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "15px",
                      }}
                    >
                      Continue your career journey with Navixo
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="login-email"
                        className="text-[#D0D6E8]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="h-12 bg-[#1A1A24]/70 border border-white/10 text-white placeholder:text-[#6B7280] rounded-2xl px-4 focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)] transition-all hover:bg-[#1A1A24]/90"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: "15px",
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="login-password"
                        className="text-[#D0D6E8]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Password
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="h-12 bg-[#1A1A24]/70 border border-white/10 text-white placeholder:text-[#6B7280] rounded-2xl px-4 focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)] transition-all hover:bg-[#1A1A24]/90"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: "15px",
                        }}
                      />
                      {loginError && (
                        <p className="text-red-500 text-sm mt-1">
                          {loginError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <a
                        href="#"
                        className="text-[#9CA3AF] hover:text-white transition-colors"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Forgot password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-white hover:bg-[#F2F2F2] text-black hover:text-black rounded-xl transition-all mt-6 shadow-[0_8px_24px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "15px",
                      }}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <Separator className="bg-white/10" />
                    <span
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#13151B] px-3 text-[#6B7280]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "13px",
                      }}
                    >
                      or
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleAuth}
                    className="w-full h-12 border border-white/10 text-white hover:text-white hover:bg-[#1A1A24]/70 hover:border-[#3B82F6]/50 bg-[#1A1A24]/50 rounded-xl transition-all hover:-translate-y-0.5"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                <TabsContent value="signup" className="mt-0">
                  <div className="mb-8">
                    <h2
                      className="text-white mb-2"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 600,
                        fontSize: "24px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Create your account
                    </h2>
                    <p
                      className="text-[#9CA3AF]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "15px",
                      }}
                    >
                      Start building your personalized AI career roadmap
                    </p>
                  </div>

                  <form
                    onSubmit={handleSignup}
                    className={`space-y-5 ${
                      waitingForVerification
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-name"
                        className="text-[#D0D6E8]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Full Name
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        className="h-12 bg-[#1A1A24]/70 border border-white/10 text-white placeholder:text-[#6B7280] rounded-2xl px-4 focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)] transition-all hover:bg-[#1A1A24]/90"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: "15px",
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-email"
                        className="text-[#D0D6E8]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="h-12 bg-[#1A1A24]/70 border border-white/10 text-white placeholder:text-[#6B7280] rounded-2xl px-4 focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)] transition-all hover:bg-[#1A1A24]/90"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: "15px",
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-[#D0D6E8]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                        }}
                      >
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="h-12 bg-[#1A1A24]/70 border border-white/10 text-white placeholder:text-[#6B7280] rounded-2xl px-4 focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.2)] transition-all hover:bg-[#1A1A24]/90"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: "15px",
                        }}
                      />
                      {signupError && (
                        <p className="text-red-500 text-sm mt-1">
                          {signupError}
                        </p>
                      )}

                      {waitingForVerification && (
                        <div className="bg-[#14F4C9]/10 border border-[#14F4C9]/30 rounded-xl p-4 text-center text-[#14F4C9] text-sm">
                          <p className="mb-2 font-medium">
                            Check your email to continue
                          </p>
                          <p>
                            We've sent a verification link to{" "}
                            <b>{signupEmail}</b>. Open it to activate your
                            account.
                          </p>
                        </div>
                      )}
                    </div>

                    <p
                      className="text-[#6B7280] pt-2"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "13px",
                        lineHeight: "1.5",
                      }}
                    >
                      By creating an account, you agree to our{" "}
                      <a
                        href="#"
                        className="text-white hover:text-white/80 transition-colors"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-white hover:text-white/80 transition-colors"
                      >
                        Privacy Policy
                      </a>
                      .
                    </p>

                    <Button
                      type="submit"
                      disabled={loading || waitingForVerification}
                      className="w-full h-12 bg-white hover:bg-[#F2F2F2] text-black hover:text-black rounded-xl transition-all mt-6 shadow-[0_8px_24px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "15px",
                      }}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <Separator className="bg-white/10" />
                    <span
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#13151B] px-3 text-[#6B7280]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "13px",
                      }}
                    >
                      or
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleAuth}
                    className="w-full h-12 border border-white/10 text-white hover:text-white hover:bg-[#1A1A24]/70 hover:border-[#3B82F6]/50 bg-[#1A1A24]/50 rounded-xl transition-all hover:-translate-y-0.5"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
        </motion.div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-[#6B7280] mt-8"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
          }}
        >
          By continuing, you agree to Navixo's{" "}
          <a
            href="#"
            className="text-white/70 hover:text-white transition-colors"
          >
            Terms of Service
          </a>
        </motion.p>
      </div>
    </div>
  );
}
