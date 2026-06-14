// src/App.tsx

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { LandingPage } from "./components/pages/LandingPage";
import { AuthPage } from "./components/pages/AuthPage";
import { OnboardingPage } from "./components/pages/OnboardingPage";
import { Dashboard } from "./components/pages/Dashboard";
import { ChatbotPage } from "./components/pages/ChatbotPage";
import { RoadmapPage } from "./components/pages/RoadmapPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/auth.service";

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");

  const [initialMessage, setInitialMessage] = useState<string>();
  const [fromRoadmap, setFromRoadmap] = useState(false);

  useEffect(() => {
    const currentUser = authService.getUser();

    if (currentUser) {
      setUser(currentUser);
      setUserName(currentUser.name);
    }
  }, []);

  const handleAuth = () => {
    const currentUser = authService.getUser();

    if (!currentUser) return;

    setUser(currentUser);
    setUserName(currentUser.name);

    navigate("/dashboard");
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
        element={
          <LandingPage
            onGetStarted={() => navigate("/auth")}
          />
        }
      />

      <Route
        path="/auth"
        element={
          <AuthPage
            onAuth={handleAuth}
            onBack={() => navigate("/")}
          />
        }
      />

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
              onNavigate={(path) => navigate("/" + path)}
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
              onNavigateToChat={(message) => {
                setInitialMessage(message);
                setFromRoadmap(true);
                navigate("/chat");
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}