import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/public/HomePage';
import { CatalogPage } from './pages/public/CatalogPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AppLayout } from './components/common/AppLayout';

const MainApp = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const { isAuthenticated, isAdmin, isProvider, isClient } = useAuth();

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'catalog':
        return <CatalogPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'login':
        return <LoginPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'register':
        return <RegisterPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'client-dashboard':
        return isAuthenticated && (isClient || isAdmin) ? (
          <ClientDashboard />
        ) : (
          <LoginPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'provider-dashboard':
        return isAuthenticated && (isProvider || isAdmin) ? (
          <ProviderDashboard />
        ) : (
          <LoginPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'admin-dashboard':
        return isAuthenticated && isAdmin ? (
          <AdminDashboard />
        ) : (
          <LoginPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      default:
        return <HomePage onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <AppLayout currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)}>
      {renderContent()}
    </AppLayout>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
