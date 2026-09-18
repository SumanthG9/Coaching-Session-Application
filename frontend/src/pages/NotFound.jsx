import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'coach' ? '/coach/dashboard' : '/student/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-block mb-6">
          <img src="/favicon.svg" alt="Student-Coach Management" className="w-16 h-16 mx-auto rounded-2xl shadow-lg shadow-indigo-500/20" />
        </Link>
        <p className="text-sm font-extrabold text-indigo-600 tracking-wider uppercase">404 Error</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Sorry, we couldn't find the page or session you're looking for. It may have been moved or doesn't exist.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={user ? dashboardPath : '/'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>{user ? 'Go to Dashboard' : 'Back to Home'}</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-slate-700 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
