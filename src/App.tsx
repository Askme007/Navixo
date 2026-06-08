// src\App.tsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient"; // ✅ IMPORTANT

import { LandingPage } from "./components/pages/LandingPage";
import { AuthPage } from "./components/pages/AuthPage";
import { OnboardingPage } from "./components/pages/OnboardingPage";
import { Dashboard } from "./components/pages/Dashboard";
import { ChatbotPage } from "./components/pages/ChatbotPage";
import { RoadmapPage } from "./components/pages/RoadmapPage";
import { AuthCallback } from "./components/pages/AuthCallback";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const navigate = useNavigate();

  // 👇 REAL AUTH USER (from Supabase)
  const [user, setUser] = useState(null);

  const [userName, setUserName] = useState<string>("");
  const [initialMessage, setInitialMessage] = useState<string | undefined>();
  const [fromRoadmap, setFromRoadmap] = useState(false);

  // 🔥 Load user session on refresh
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);

        const fullName = data.user.user_metadata?.full_name;
        if (fullName) setUserName(fullName);
        else setUserName(data.user.email?.split("@")[0] ?? "");
      }
    });

    // 🔥 Listen for login/logout
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name;
        setUserName(fullName || session.user.email?.split("@")[0] || "");
      }
    });
  }, []);

  // Handle login/signup from AuthPage
  const handleAuth = (name: string) => {
    setUserName(name);
    navigate("/onboarding");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage onGetStarted={() => navigate("/auth")} />}
      />

      <Route
        path="/auth"
        element={<AuthPage onAuth={handleAuth} onBack={() => navigate("/")} />}
      />

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute user={user}>
            <OnboardingPage
              onComplete={() => navigate("/dashboard")}
              onBack={() => navigate("/auth")}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard
              userName={userName}
              onLogout={handleLogout}
              onNavigate={(p) => navigate("/" + p)}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute user={user}>
            <ChatbotPage
              userName={userName}
              onBack={() => navigate("/dashboard")}
              onLogout={handleLogout}
              onNavigateToDashboard={() => navigate("/dashboard")}
              onNavigateToRoadmap={() => navigate("/roadmap")}
              initialMessage={initialMessage}
              fromRoadmap={fromRoadmap}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roadmap/:roadmapId?"
        element={
          <ProtectedRoute user={user}>
            <RoadmapPage
              userName={userName}
              onBack={() => navigate("/dashboard")}
              onLogout={handleLogout}
              onNavigateToChat={(msg) => {
                setInitialMessage(msg);
                setFromRoadmap(true);
                navigate("/chat");
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
