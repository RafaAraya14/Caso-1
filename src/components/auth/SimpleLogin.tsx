import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabase';

interface SimpleLoginFormProps {
  onLoginSuccess: () => void;
}

const SimpleLoginForm: React.FC<SimpleLoginFormProps> = ({ onLoginSuccess: _onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setMessage('');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setMessage(signInError.message);
        return;
      }

      if (data.user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignUp = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(`❌ Signup Error: ${error.message}`);
      } else {
        setMessage('✅ Account created! Check your email for verification.');
      }
    } catch (error) {
      setMessage('❌ Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-300 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">20minCoach</h1>
          <p className="text-gray-600 dark:text-gray-400">Real Supabase Authentication</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 mb-6">
          <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">🔐 Real Auth:</h3>
          <p className="text-sm text-blue-700 dark:text-blue-200">
            This connects to actual Supabase authentication
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {isLoading ? '⏳ Logging in...' : '🔐 Login'}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {isLoading ? '⏳ Creating account...' : '✨ Sign Up'}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`mt-4 p-4 rounded-xl ${
              message.includes('❌')
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300'
                : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-300'
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="text-center pt-4 mt-6 border-t border-gray-300 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            🔐 <strong>Real Authentication</strong> - Connected to Supabase
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginForm;
