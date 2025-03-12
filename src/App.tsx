import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { CredentialManager } from './components/CredentialManager';
import { AccountPanel } from './components/AccountPanel';
import { LandingPage } from './components/LandingPage';
import { LogOut, Shield, Menu, X, Key, User } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<'credentials' | 'account'>('credentials');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-dark-50">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#000000',
          color: '#fff',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }} />
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out glass-panel`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
            <div className="flex items-center">
              <Shield className="text-indigo-400 h-8 w-8 mr-2" />
              <h1 className="text-xl font-bold text-white">Agent Pass</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="mt-4 px-2">
            <button
              onClick={() => setActivePanel('credentials')}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                activePanel === 'credentials'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <Key size={20} className="mr-3" />
              Credentials
            </button>
            <button
              onClick={() => setActivePanel('account')}
              className={`flex items-center w-full px-4 py-2 mt-2 rounded-lg transition-all duration-200 ${
                activePanel === 'account'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <User size={20} className="mr-3" />
              Account
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="glass-panel border-b border-white/5">
            <div className="flex items-center justify-between h-16 px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="flex-1" />
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {activePanel === 'credentials' ? (
              <CredentialManager />
            ) : (
              <AccountPanel />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;