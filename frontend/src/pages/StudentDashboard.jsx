import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import { getMyStudentSessions } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  BookOpen,
  TrendingUp,
  AlertCircle,
  X,
} from 'lucide-react';

function StudentDashboard() {
  const { user, token } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSessions() {
      if (!token) return;
      try {
        const data = await getMyStudentSessions(token);
        setSessions(data || []);
      } catch (err) {
        console.error('Failed to load student dashboard sessions:', err);
        setError(err.message || 'Failed to load sessions.');
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, [token]);

  // Derived statistics
  const pendingCount = sessions.filter((s) => s.status?.toLowerCase() === 'pending').length;
  const acceptedCount = sessions.filter((s) => s.status?.toLowerCase() === 'accepted').length;
  const completedCount = sessions.filter((s) => s.status?.toLowerCase() === 'completed').length;
  const totalCount = sessions.length;

  const upcomingSessions = sessions
    .filter((s) => s.status?.toLowerCase() === 'pending' || s.status?.toLowerCase() === 'accepted')
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-6 sm:p-10 text-white shadow-xl shadow-indigo-600/15 mb-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Student Learning Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
              Connect with experienced tech mentors, book 1-on-1 sessions, and accelerate your career path today.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/student/coaches"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs sm:text-sm shadow-md hover:bg-indigo-50 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Find a Coach</span>
              </Link>
              <Link
                to="/student/sessions"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-sm border border-white/20 transition-all"
              >
                <span>View My Sessions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:bg-rose-100 rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Metric / Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            label="Total Booked"
            value={totalCount}
            icon={BookOpen}
            description="All time requested"
            color="slate"
          />
          <StatCard
            label="Pending Review"
            value={pendingCount}
            icon={Clock}
            description="Awaiting coach acceptance"
            color="amber"
          />
          <StatCard
            label="Confirmed / Active"
            value={acceptedCount}
            icon={CheckCircle2}
            description="Upcoming accepted sessions"
            color="emerald"
          />
          <StatCard
            label="Completed"
            value={completedCount}
            icon={TrendingUp}
            description="Finished mentorship calls"
            color="indigo"
          />
        </div>

        {/* Upcoming Sessions Widget */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming & Active Sessions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pending and confirmed coaching bookings</p>
            </div>
            <Link
              to="/student/sessions"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : upcomingSessions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No upcoming sessions</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ready to level up your career or technical skills?
              </p>
              <Link
                to="/student/coaches"
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                <span>Browse Coaches Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={session.status} size="sm" />
                      <span className="text-xs font-semibold text-slate-800">
                        {session.coach_name ? `With Coach ${session.coach_name}` : `Coach #${session.coach_id}`}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{session.topic}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        {session.session_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {session.start_time?.slice(0, 5)} ({session.duration_minutes} min)
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/student/sessions/${session.id}`}
                    className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
