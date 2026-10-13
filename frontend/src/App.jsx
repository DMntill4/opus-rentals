import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/public/HomePage';
import { CatalogPage } from './pages/public/CatalogPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="flex-1">{renderContent()}</main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
