import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { Key, RefreshCw, Smartphone, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateApiKey, generateTotpSecret } from '../lib/crypto';

interface UserSettings {
  api_key: string;
  totp_secret: string;
}

export function AccountPanel() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      if (!existingSettings || existingSettings.length === 0) {
        await initializeUserSettings(user.id);
      } else {
        setSettings(existingSettings[0]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error fetching user data');
    } finally {
      setLoading(false);
    }
  }

  async function initializeUserSettings(userId: string) {
    try {
      const apiKey = generateApiKey();
      const totpSecret = generateTotpSecret();

      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          api_key: apiKey,
          totp_secret: totpSecret
        }])
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error initializing user settings:', error);
      toast.error('Error initializing user settings');
    }
  }

  async function regenerateApiKey() {
    try {
      const newApiKey = generateApiKey();

      const { error } = await supabase
        .from('user_settings')
        .update({ api_key: newApiKey })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSettings(prev => prev ? { ...prev, api_key: newApiKey } : null);
      toast.success('API key regenerated successfully');
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast.error('Error regenerating API key');
    }
  }

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(settings?.api_key || '');
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-300">Loading...</div>;
  }

  const totpUrl = settings?.totp_secret
    ? `otpauth://totp/AgentPass:${user?.email}?secret=${settings.totp_secret}&issuer=AgentPass`
    : '';

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <p className="mt-1 text-white">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Account Created</label>
            <p className="mt-1 text-white">
              {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">API Key</h2>
          <button
            onClick={regenerateApiKey}
            className="btn-primary flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Regenerate
          </button>
        </div>
        <div className="flex items-center space-x-3 bg-black/30 p-3 rounded-md">
          <Key className="text-indigo-400" size={20} />
          <input
            type="password"
            value={settings?.api_key || ''}
            readOnly
            className="flex-1 bg-transparent border-none text-gray-300 font-mono focus:outline-none"
          />
          <button
            onClick={handleCopyApiKey}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-full transition-colors"
            title="Copy API key"
          >
            <Copy size={18} />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Use this API key to access your credentials programmatically.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center">
          <Smartphone className="mr-2 text-indigo-400" />
          Two-Factor Authentication
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            Scan this QR code with your authenticator app to enable two-factor authentication.
          </p>
          <div className="bg-white p-4 rounded-lg inline-block">
            <QRCodeSVG value={totpUrl} size={200} />
          </div>
          <p className="text-sm text-gray-400">
            Compatible with Google Authenticator, Authy, and other TOTP apps.
          </p>
        </div>
      </div>
    </div>
  );
}