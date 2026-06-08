// src/components/pages/AuthCallback.tsx

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

interface AuthCallbackProps {
  onAuth?: (name: string) => void;
}

export function AuthCallback({ onAuth }: AuthCallbackProps) {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent React Strict Mode double-firing
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          console.error("No session found:", error);
          navigate("/auth", { replace: true });
          return;
        }

        // 1. Check if profile already exists in DB
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, full_name")
          .eq("id", session.user.id)
          .maybeSingle();

        const fullName =
          profile?.full_name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "User";

        // Update global auth state if the prop exists
        if (onAuth) onAuth(fullName);

        // 2. Dynamic Routing Based on DB State
        if (profile?.onboarding_completed) {
          // Returning User -> Go straight to Dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // New User -> Create Profile -> Go to Onboarding
          if (!profile) {
            await supabase.from("profiles").upsert(
              {
                id: session.user.id,
                full_name: fullName,
                onboarding_completed: false, // Explicitly false for new users
              },
              { onConflict: "id" },
            );
          }
          navigate("/onboarding", { replace: true });
        }
      } catch (err) {
        console.error("Callback processing error:", err);
        navigate("/auth", { replace: true });
      }
    };

    processCallback();
  }, [navigate, onAuth]);

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 font-medium">
        Authenticating secure session...
      </p>
    </div>
  );
}
