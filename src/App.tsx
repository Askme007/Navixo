// src/App.tsx

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";

import { LandingPage } from "./components/pages/LandingPage";
import { AuthPage } from "./components/pages/AuthPage";
import { OnboardingPage } from "./components/pages/OnboardingPage";
import { Dashboard } from "./components/pages/Dashboard";
import { ChatbotPage } from "./components/pages/ChatbotPage";
import { RoadmapPage } from "./components/pages/RoadmapPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { NotFoundPage } from "./components/pages/NotFoundPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/auth.service";
import { Toaster } from "./components/ui/sonner";

interface RoadmapRouteProps {
  userName: string;
  onLogout: () => void;
  onNavigateToChat: (message: string) => void;
}

function RoadmapRoute({
  userName,
  onLogout,
  onNavigateToChat,
}: RoadmapRouteProps) {
  const { roadmapId } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  // If no roadmapId in URL, user must be logged in to create a new roadmap
  if (!roadmapId && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <RoadmapPage
      userName={userName}
      onBack={() => navigate(isAuthenticated ? "/dashboard" : "/")}
      onLogout={onLogout}
      onNavigateToChat={onNavigateToChat}
    />
  );
}

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
    <>
      <Toaster position="bottom-right" richColors closeButton />
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
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage
              userName={userName}
              onLogout={handleLogout}
              onNavigate={(path) => navigate("/" + path)}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roadmap/:roadmapId?"
        element={
          <RoadmapRoute
            userName={userName}
            onLogout={handleLogout}
            onNavigateToChat={(message) => {
              setInitialMessage(message);
              setFromRoadmap(true);
              navigate("/chat");
            }}
          />
        }
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
    </>
  );
}