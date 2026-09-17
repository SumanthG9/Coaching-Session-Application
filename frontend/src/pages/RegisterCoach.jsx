import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCoach, login, getCurrentUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Briefcase, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';

function RegisterCoach() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // 1. Register coach
      await registerCoach(name.trim(), email.trim(), password);

      // 2. Automatically login
      const tokenData = await login(email.trim(), password);
      const currentUser = await getCurrentUser(tokenData.access_token);
      loginUser(tokenData.access_token, currentUser);

      // 3. Redirect to coach dashboard
      navigate('/coach/dashboard');
    } catch (err) {
      console.error('Coach registration failed:', err);
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Join as a Mentor & Coach
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Offer your expertise, set your session fees, and mentor the next generation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="coach-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="coach-name"
                  type="text"
                  required
                  placeholder="Dr. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="coach-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="coach-email"
                  type="email"
                  required
                  placeholder="alex.coach@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="coach-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="coach-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 text-sm transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Must contain at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md shadow-purple-600/20 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Coach Profile...</span>
                </>
              ) : (
                <>
                  <span>Register as Coach</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/login" className="text-slate-500 hover:text-slate-800 font-medium">
              Already have an account? <span className="text-purple-600 font-semibold">Log in</span>
            </Link>
            <Link to="/register/student" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Join as Student &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterCoach;
