import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerUser, login, getCurrentUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Briefcase, ArrowRight, Lock, Mail, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

function Register({ defaultRole }) {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial role from prop, path, or fallback to student
  const initialRole = defaultRole || (location.pathname.includes('coach') ? 'coach' : 'student');
  const [role, setRole] = useState(initialRole);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await registerUser(name.trim(), email.trim(), password, role);

      // Automatically login after successful registration
      const tokenData = await login(email.trim(), password);
      const currentUser = await getCurrentUser(tokenData.access_token);
      loginUser(tokenData.access_token, currentUser);

      navigate(role === 'coach' ? '/coach/dashboard' : '/student/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  const isCoach = role === 'coach';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center justify-center mb-4 group">
          <img src="/favicon.svg" alt="Student-Coach Management" className="w-14 h-14 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform" />
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {isCoach
            ? 'Offer your expertise, set your session fees, and mentor aspiring talent'
            : 'Connect with top-tier tech mentors and schedule 1-on-1 sessions'}
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-6 inline-flex p-1 bg-slate-200/70 rounded-2xl shadow-inner max-w-xs w-full">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !isCoach
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>I'm a Student</span>
          </button>
          <button
            type="button"
            onClick={() => { setRole('coach'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isCoach
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>I'm a Coach</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder={isCoach ? "Dr. Alex Rivera" : "Sarah Connor"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ${
                    isCoach ? 'focus:ring-purple-500/20 focus:border-purple-600' : 'focus:ring-indigo-500/20 focus:border-indigo-600'
                  } text-slate-900 text-sm transition-all`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder={isCoach ? "alex.coach@example.com" : "sarah@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ${
                    isCoach ? 'focus:ring-purple-500/20 focus:border-purple-600' : 'focus:ring-indigo-500/20 focus:border-indigo-600'
                  } text-slate-900 text-sm transition-all`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ${
                    isCoach ? 'focus:ring-purple-500/20 focus:border-purple-600' : 'focus:ring-indigo-500/20 focus:border-indigo-600'
                  } text-slate-900 text-sm transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 ${
                    isCoach ? 'focus:ring-purple-500/20 focus:border-purple-600' : 'focus:ring-indigo-500/20 focus:border-indigo-600'
                  } text-slate-900 text-sm transition-all`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Must contain at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md ${
                isCoach
                  ? 'shadow-purple-600/20 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                  : 'shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              } text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register as {isCoach ? 'Coach' : 'Student'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/login" className="text-slate-500 hover:text-slate-800 font-medium">
              Already have an account? <span className={`font-semibold ${isCoach ? 'text-purple-600' : 'text-indigo-600'}`}>Log in</span>
            </Link>
            <Link to="/" className="text-slate-400 hover:text-slate-600">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
