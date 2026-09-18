import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  getCoachSessionRequests,
  acceptSession,
  rejectSession,
} from '../services/sessionService';
import { getCoachSkills } from '../services/coachService';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Calendar,
  Layers,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

function CoachDashboard() {
  const { user, token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [sessionToDecline, setSessionToDecline] = useState(null);
  const [declining, setDeclining] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [requestsData, skillsData] = await Promise.all([
        getCoachSessionRequests(token),
        getCoachSkills(token),
      ]);
      const sortedRequests = (requestsData || []).sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id
      );
      setRequests(sortedRequests);
      setSkills(skillsData || []);
    } catch (err) {
      console.error('Failed to load coach dashboard:', err);
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  async function handleQuickAccept(session) {
    setActionLoadingId(session.id);
    try {
      await acceptSession(token, session.id);
      setToastMessage(`Session #${session.id} accepted!`);
      setTimeout(() => setToastMessage(''), 4000);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to accept session:', err);
      setError(err.message || 'Failed to accept session.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleConfirmDecline() {
    if (!sessionToDecline) return;
    setDeclining(true);
    try {
      await rejectSession(token, sessionToDecline.id);
      setToastMessage(`Session request declined.`);
      setTimeout(() => setToastMessage(''), 4000);
      setSessionToDecline(null);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to reject session:', err);
      setError(err.message || 'Failed to decline session.');
    } finally {
      setDeclining(false);
    }
  }

  // Derived stats
  const pendingRequests = requests.filter((r) => r.status?.toLowerCase() === 'pending');
  const acceptedSessions = requests.filter((r) => r.status?.toLowerCase() === 'accepted');
  const completedSessions = requests.filter((r) => r.status?.toLowerCase() === 'completed');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-sm animate-in-modal">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 p-6 sm:p-10 text-white shadow-xl shadow-purple-900/15 mb-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
              <span>Coach Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, Coach {user?.name || ''}!
            </h1>
            <p className="mt-2 text-purple-100 text-sm sm:text-base leading-relaxed">
              Manage student requests, track your schedule, and guide the next generation of engineers and leaders.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/coach/requests"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-800 font-bold text-xs sm:text-sm shadow-md hover:bg-purple-50 transition-all"
              >
                <span>View Session Requests</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/coach/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-sm border border-white/20 transition-all"
              >
                <span>Edit Profile & Skills</span>
              </Link>
            </div>
          </div>
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* 4 Stat Cards using reusable StatCard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            label="Pending Requests"
            value={pendingRequests.length}
            icon={Clock}
            description="Awaiting your approval"
            color="amber"
          />
          <StatCard
            label="Scheduled Sessions"
            value={acceptedSessions.length}
            icon={CheckCircle2}
            description="Upcoming confirmed calls"
            color="emerald"
          />
          <StatCard
            label="Completed Sessions"
            value={completedSessions.length}
            icon={TrendingUp}
            description="Successfully mentored"
            color="purple"
          />
          <StatCard
            label="Skills Listed"
            value={skills.length}
            icon={Layers}
            description="Expertise tags"
            color="slate"
          />
        </div>

        {/* Pending Requests Direct Action Widget */}
        {pendingRequests.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-amber-950">Action Needed: Pending Requests</h2>
                  <p className="text-xs text-amber-800">You have {pendingRequests.length} pending coaching request(s)</p>
                </div>
              </div>
              <Link
                to="/coach/requests"
                className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
              >
                <span>Manage All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">
                        Student: {session.student_name || `Student #${session.student_id}`}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-600" />
                        {session.session_date} at {session.start_time?.slice(0, 5)} ({session.duration_minutes}m)
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{session.topic}</p>
                    {session.student_message && (
                      <p className="text-xs text-slate-500 italic line-clamp-1">
                        "{session.student_message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      disabled={actionLoadingId === session.id}
                      onClick={() => setSessionToDecline(session)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === session.id}
                      onClick={() => handleQuickAccept(session)}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{actionLoadingId === session.id ? '...' : 'Accept'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Sessions Widget */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Confirmed Sessions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Sessions you have accepted and scheduled</p>
            </div>
            <Link
              to="/coach/requests"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : acceptedSessions.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl p-6 text-slate-400 text-xs">
              No upcoming accepted sessions at this moment.
            </div>
          ) : (
            <div className="space-y-3">
              {acceptedSessions.slice(0, 4).map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-slate-100 hover:border-purple-100 hover:bg-slate-50/50 transition-all gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={session.status} size="sm" />
                      <span className="text-xs font-semibold text-slate-800">
                        Student: {session.student_name || `Student #${session.student_id}`}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{session.topic}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-600" />
                        {session.session_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-600" />
                        {session.start_time?.slice(0, 5)} ({session.duration_minutes} min)
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/coach/sessions/${session.id}`}
                    className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Decline Confirmation Modal */}
      <Modal
        isOpen={Boolean(sessionToDecline)}
        onClose={() => setSessionToDecline(null)}
        title="Decline Session Request?"
        description="Are you sure you want to decline this coaching request? The student will be notified."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Decline request for <strong className="text-slate-900">"{sessionToDecline?.topic}"</strong> from student{' '}
            <strong className="text-slate-900">{sessionToDecline?.student_name}</strong>.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={declining}
              onClick={() => setSessionToDecline(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Keep Request
            </button>
            <button
              type="button"
              disabled={declining}
              onClick={handleConfirmDecline}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-all disabled:opacity-50 shadow-xs"
            >
              {declining ? 'Declining...' : 'Confirm Decline'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CoachDashboard;
