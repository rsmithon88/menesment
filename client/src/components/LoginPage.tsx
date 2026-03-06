import React, { useState } from 'react';
import { FacebookIcon } from '../constants';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl m-4">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">দারুস সালাম মাদরাসা</h1>
            <p className="mt-2 text-text-secondary">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              ইমেইল
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="আপনার ইমেইল"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-gray-700">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
            >
              {isLoading ? 'লোড হচ্ছে...' : 'লগইন করুন'}
            </button>
          </div>
        </form>
         <div className="text-center mt-6 pt-4 border-t text-sm">
            <a href="https://www.facebook.com/share/16Kyy8Db1G/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-text-secondary hover:text-primary transition-colors">
                <span className="mr-2">Developer by HM.Abdul Alim</span>
                <FacebookIcon className="h-5 w-5" />
            </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
