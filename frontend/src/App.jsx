import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { HomePage } from './pages/public/HomePage';
import { CatalogPage } from './pages/public/CatalogPage';
import { ToolDetailPage } from './pages/public/ToolDetailPage';
import { StitchAuthPage } from './pages/public/StitchAuthPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { CheckoutPage } from './pages/client/CheckoutPage';
import { InvoicePage } from './pages/client/InvoicePage';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SystemStatesGalleryPage } from './pages/public/SystemStatesGalleryPage';
import { AppLayout } from './components/common/AppLayout';

const MainApp = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedInvoiceRental, setSelectedInvoiceRental] = useState(null);
  const { isAuthenticated, isAdmin, isProvider, isClient } = useAuth();

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setCurrentTab('tool-detail');
  };

  const handleOpenInvoice = (rental) => {
    setSelectedInvoiceRental(rental);
    setCurrentTab('invoice');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'catalog':
        return (
          <CatalogPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectTool={handleSelectTool}
          />
        );
      case 'tool-detail':
        return (
          <ToolDetailPage
            tool={selectedTool}
            onBack={() => setCurrentTab('catalog')}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onViewInvoice={handleOpenInvoice}
          />
        );
      case 'invoice':
        return (
          <InvoicePage
            rental={selectedInvoiceRental}
            onBack={() => setCurrentTab('client-dashboard')}
          />
        );
      case 'system-states':
        return <SystemStatesGalleryPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'login':
        return <StitchAuthPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'register':
        return <StitchAuthPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'client-dashboard':
        return isAuthenticated && (isClient || isAdmin) ? (
          <ClientDashboard
            onOpenInvoice={handleOpenInvoice}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        ) : (
          <StitchAuthPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'provider-dashboard':
        return isAuthenticated && (isProvider || isAdmin) ? (
          <ProviderDashboard />
        ) : (
          <StitchAuthPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'admin-dashboard':
        return isAuthenticated && isAdmin ? (
          <AdminDashboard />
        ) : (
          <StitchAuthPage onNavigate={(tab) => setCurrentTab(tab)} />
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
      <CartProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
