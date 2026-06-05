//src\components\pages\AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name:
            user.user_metadata?.full_name || user.user_metadata?.name || "",
          onboarding_completed: true,
        },
        {
          onConflict: "id",
        },
      );
      if (profileError) {
        console.error("Profile upsert failed:", profileError);
        navigate("/auth");
        return;
      }

      navigate("/dashboard", { replace: true });
    };

    run();
  }, []);

  return <p className="text-white p-6">Finishing sign in…</p>;
}
