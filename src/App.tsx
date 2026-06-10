// src/App.tsx

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { LandingPage } from "./components/pages/LandingPage";
import { AuthPage } from "./components/pages/AuthPage";
import { OnboardingPage } from "./components/pages/OnboardingPage";
import { Dashboard } from "./components/pages/Dashboard";
import { ChatbotPage } from "./components/pages/ChatbotPage";
import { RoadmapPage } from "./components/pages/RoadmapPage";
import { AuthCallback } from "./components/pages/AuthCallback";

import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/auth.service";

export default function App() {
  const navigate = useNavigate();

  // 👇 REAL AUTH USER (from Supabase)
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");

  const [initialMessage, setInitialMessage] = useState<string | undefined>();
  const [fromRoadmap, setFromRoadmap] = useState(false);

  useEffect(() => {
    const storedUser = authService.getUser();

    if (storedUser) {
      setUser(storedUser);
      setUserName(storedUser.name || "");
    }
  }, []);

  // Handle login/signup from AuthPage
  const handleAuth = (name: string) => {
    const currentUser = authService.getUser();

    setUser(currentUser);
    setUserName(name);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setUserName("");
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
            <ChatbotPage
            userName={userName}
            onBack={() => navigate("/dashboard")}
            initialMessage={initialMessage}
            fromRoadmap={fromRoadmap}
          />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roadmap/:roadmapId?"
        element={
          <ProtectedRoute>
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
