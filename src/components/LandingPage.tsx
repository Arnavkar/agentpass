import React, { useEffect, useRef } from 'react';
import { Shield, Key, Lock, Zap, ArrowRight, GitBranch, RefreshCw, Fingerprint } from 'lucide-react';
import { AuthForm } from './AuthForm';

export function LandingPage() {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showAuth, setShowAuth] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !observerRefs.current.includes(el)) {
      observerRefs.current.push(el);
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-dark-50 p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-xl font-bold text-white">Agent Pass</span>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="btn-primary px-6 py-2"
            >
              Sign In / Sign Up
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-indigo-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Shield className="h-20 w-20 text-indigo-500" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              One Key to Rule Them All
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Stop juggling countless API keys. Agent Pass securely manages your credentials with human-in-the-loop interaction.
            </p>
            <div className="mt-10">
              <button 
                onClick={() => setShowAuth(true)}
                className="btn-primary text-lg px-8 py-4 relative z-10"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-black to-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div ref={addToRefs} className="feature-card">
              <div className="h-12 w-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6">
                <Key className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Centralized Key Management
              </h3>
              <p className="text-gray-400">
                Store all your API keys, tokens, and credentials in one secure location. No more scattered secrets across different files.
              </p>
            </div>

            <div ref={addToRefs} className="feature-card">
              <div className="h-12 w-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                End-to-End Encryption
              </h3>
              <p className="text-gray-400">
                Your credentials are encrypted at rest and in transit. Only you have access to your sensitive data.
              </p>
            </div>

            <div ref={addToRefs} className="feature-card">
              <div className="h-12 w-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Runtime Injection
              </h3>
              <p className="text-gray-400">
                Seamlessly inject credentials into your applications at runtime with our secure API integration.
              </p>
            </div>

            <div ref={addToRefs} className="feature-card">
              <div className="h-12 w-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6">
                <Fingerprint className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Biometric Security
              </h3>
              <p className="text-gray-400">
                Enhanced protection with multi-factor authentication, including biometric and Face ID verification for secure access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            How It Works
          </h2>
          <div className="space-y-24">
            <div ref={addToRefs} className="workflow-step">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <Key className="h-8 w-8 text-indigo-400" />
                </div>
                <ArrowRight className="h-8 w-8 text-gray-600 mx-4" />
                <div className="h-16 w-16 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-8 w-8 text-indigo-400" />
                </div>
                <ArrowRight className="h-8 w-8 text-gray-600 mx-4" />
                <div className="h-16 w-16 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <GitBranch className="h-8 w-8 text-indigo-400" />
                </div>
              </div>
              <div className="mt-8 text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Store Once, Use Everywhere
                </h3>
                <p className="text-gray-400">
                  Add your credentials to Agent Pass and access them securely across all your applications and environments.
                </p>
              </div>
            </div>

            <div ref={addToRefs} className="workflow-step">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-indigo-400" />
                </div>
                <ArrowRight className="h-8 w-8 text-gray-600 mx-4" />
                <div className="h-16 w-16 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <Lock className="h-8 w-8 text-indigo-400" />
                </div>
              </div>
              <div className="mt-8 text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Secure Runtime Access
                </h3>
                <p className="text-gray-400">
                  Your applications request credentials only when needed, with built-in security measures and access controls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-t from-black to-dark-50">
        <div ref={addToRefs} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Simplify Your Credential Management?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of developers who trust Agent Pass with their sensitive credentials.
          </p>
          <button 
            onClick={() => setShowAuth(true)}
            className="btn-primary text-lg px-8 py-4"
          >
            Start Using Agent Pass
          </button>
        </div>
      </div>
    </div>
  );
}