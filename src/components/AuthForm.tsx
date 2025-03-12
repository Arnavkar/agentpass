import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { KeyRound, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateApiKey, generateTotpSecret } from '../lib/crypto';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const initializeUserSettings = async (userId: string) => {
    try {
      // First check if settings already exist
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      // Only create new settings if none exist
      if (!existingSettings || existingSettings.length === 0) {
        const apiKey = generateApiKey();
        const totpSecret = generateTotpSecret();

        const { error } = await supabase
          .from('user_settings')
          .insert([{
            user_id: userId,
            api_key: apiKey,
            totp_secret: totpSecret
          }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error initializing user settings:', error);
      // Don't show error to user as they're already signed in
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.user) {
          await initializeUserSettings(data.user.id);
        }
        
        toast.success('Logged in successfully!');
      } else {
        const { data: { user }, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (user) {
          await initializeUserSettings(user.id);
        }
        
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Shield className="h-12 w-12 text-indigo-500" />
      </div>
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          {isLogin ? 'Sign In to Agent Pass' : 'Create Agent Pass Account'}
        </h2>
        
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </form>
    </div>
  );
}