import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import { Cloud, Lock, Mail, User, ArrowRight } from 'lucide-react';

const Login: React.FC<{ setToken: (token: string) => void }> = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const data = isRegister ? { username, email, password } : { email, password };
    try {
      const response = await axios.post(endpoint, data);
      const token = response.data.token;
      if (token && typeof token === 'string' && token.trim().length > 0) {
        const trimmedToken = token.trim();
        // Strict allowlist: only accept valid JWT format (three base64url segments separated by dots)
        const isValidJwt = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(trimmedToken);
        if (isValidJwt) {
          setToken(trimmedToken);
          localStorage.setItem('token', trimmedToken);
        } else {
          console.error('Received token failed validation and was not stored.');
        }
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      alert('Error: ' + (axiosError.response?.data?.message ?? 'An unexpected error occurred'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated ambient background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 glass-panel p-10 rounded-2xl z-10"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Cloud className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            CloudForge
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isRegister ? 'Create a new account' : 'Sign in to orchestrate'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isRegister && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <span className="flex items-center">
              {isRegister ? 'Sign up' : 'Sign in'}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </form>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isRegister ? 'Already have an account?' : 'Deploying for the first time?'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;