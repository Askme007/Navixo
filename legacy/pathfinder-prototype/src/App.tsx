import { useState } from 'react';
import { LandingPage } from './components/pages/LandingPage';
import { AuthPage } from './components/pages/AuthPage';
import { OnboardingPage } from './components/pages/OnboardingPage';
import { Dashboard } from './components/pages/Dashboard';
import { ChatbotPage } from './components/pages/ChatbotPage';
import { RoadmapPage } from './components/pages/RoadmapPage';
import { SkillGapPage } from './components/pages/SkillGapPage';

type Page = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'chatbot' | 'roadmap' | 'skillgap';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [previousPage, setPreviousPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [onboardingData, setOnboardingData] = useState<Record<string, string>>({});
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>(undefined);

  const handleAuth = (name: string) => {
    setIsAuthenticated(true);
    setUserName(name);
    setCurrentPage('onboarding');
  };

  const handleOnboardingComplete = (answers: Record<string, string>) => {
    setOnboardingData(answers);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
    setOnboardingData({});
    setCurrentPage('landing');
  };

  const navigateTo = (page: Page) => {
    setPreviousPage(currentPage);
    setChatInitialMessage(undefined); // Clear initial message when navigating normally
    setCurrentPage(page);
  };

  const navigateToChatWithMessage = (message: string) => {
    setPreviousPage(currentPage);
    setChatInitialMessage(message);
    setCurrentPage('chatbot');
  };

  const navigateBack = () => {
    setCurrentPage(previousPage);
  };

  return (
    <div className="min-h-screen dark">
      {currentPage === 'landing' && (
        <LandingPage onGetStarted={() => navigateTo('auth')} />
      )}
      
      {currentPage === 'auth' && (
        <AuthPage onAuth={handleAuth} onBack={() => navigateTo('landing')} />
      )}
      
      {currentPage === 'onboarding' && isAuthenticated && (
        <OnboardingPage 
          onComplete={handleOnboardingComplete}
          onBack={() => navigateTo('auth')}
        />
      )}
      
      {currentPage === 'dashboard' && isAuthenticated && (
        <Dashboard 
          userName={userName}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'chatbot' && isAuthenticated && (
        <ChatbotPage 
          userName={userName}
          onBack={() => navigateTo('dashboard')}
          onLogout={handleLogout}
          onNavigateToDashboard={() => navigateTo('dashboard')}
          onNavigateToRoadmap={() => navigateTo('roadmap')}
          onNavigateToSkillGap={() => navigateTo('skillgap')}
          initialMessage={chatInitialMessage}
          fromRoadmap={previousPage === 'roadmap'}
        />
      )}
      
      {currentPage === 'roadmap' && isAuthenticated && (
        <RoadmapPage 
          userName={userName}
          onBack={() => navigateTo('dashboard')}
          onLogout={handleLogout}
          onNavigateToSkillGap={() => navigateTo('skillgap')}
          onNavigateToChat={navigateToChatWithMessage}
        />
      )}
      
      {currentPage === 'skillgap' && isAuthenticated && (
        <SkillGapPage 
          userName={userName}
          onBack={() => navigateTo('dashboard')}
          onLogout={handleLogout}
          fromRoadmap={previousPage === 'roadmap'}
        />
      )}
    </div>
  );
}