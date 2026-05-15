import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HeartPulse, User, ShieldAlert, Stethoscope, XCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Patient'); // Patient, Doctor, Admin
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      
      // Enforce segregated login portal rules
      if (user.role !== activeTab) {
         setError(`Account found, but you must use the ${user.role} portal to log in.`);
         // Optional: logout the user or let them stay logged in but show error.
         // For true segregation, we would wipe token, but we can just show error.
         return;
      }

      // Redirect based on role
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const getThemeColors = () => {
    if (activeTab === 'Doctor') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 focus:ring-emerald-500';
    if (activeTab === 'Admin') return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 focus:ring-indigo-500';
    return 'text-primary-600 dark:text-primary-500 bg-primary-100 dark:bg-primary-900 focus:ring-primary-500';
  };

  const activeColor = getThemeColors();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button onClick={() => {setActiveTab('Patient'); setError('');}} className={`flex-1 py-4 flex flex-col items-center gap-1 font-medium text-sm transition-colors ${activeTab === 'Patient' ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 border-t-2 border-t-primary-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <User size={18} /> Patient
          </button>
          <button onClick={() => {setActiveTab('Doctor'); setError('');}} className={`flex-1 py-4 flex flex-col items-center gap-1 font-medium text-sm transition-colors ${activeTab === 'Doctor' ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 border-t-2 border-t-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <Stethoscope size={18} /> Doctor
          </button>
          <button onClick={() => {setActiveTab('Admin'); setError('');}} className={`flex-1 py-4 flex flex-col items-center gap-1 font-medium text-sm transition-colors ${activeTab === 'Admin' ? 'bg-white dark:bg-dark-card text-indigo-600 dark:text-indigo-400 border-t-2 border-t-indigo-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <ShieldAlert size={18} /> Admin
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${activeTab === 'Doctor' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : activeTab === 'Admin' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'}`}>
               {activeTab === 'Patient' && <HeartPulse size={36} />}
               {activeTab === 'Doctor' && <Stethoscope size={36} />}
               {activeTab === 'Admin' && <ShieldAlert size={36} />}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
            {activeTab} Portal
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">Sign in to your {activeTab.toLowerCase()} account</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100 dark:border-red-900/50 flex justify-between items-center gap-3 text-left">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="shrink-0 text-red-500 hover:text-red-700 transition-colors"><XCircle size={18}/></button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                required
                className={`w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${activeTab === 'Doctor' ? 'focus:ring-emerald-500' : activeTab === 'Admin' ? 'focus:ring-indigo-500' : 'focus:ring-primary-500'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`${activeTab.toLowerCase()}@example.com`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                required
                className={`w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${activeTab === 'Doctor' ? 'focus:ring-emerald-500' : activeTab === 'Admin' ? 'focus:ring-indigo-500' : 'focus:ring-primary-500'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className={`w-full text-white font-semibold py-3 rounded-lg transition-colors shadow-sm ${activeTab === 'Doctor' ? 'bg-emerald-600 hover:bg-emerald-500' : activeTab === 'Admin' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-primary-600 hover:bg-primary-500'}`}
            >
              Access {activeTab} Portal
            </button>
          </form>

          {activeTab === 'Patient' && (
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-500 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
