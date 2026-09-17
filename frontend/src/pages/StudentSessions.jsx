import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getMyStudentSessions, cancelSession } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  UserCheck,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

function StudentSessions() {
  const { token } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Cancel modal confirmation
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyStudentSessions(token);
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load student sessions:', err);
      setError(err.message || 'Failed to retrieve sessions.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function handleConfirmCancel() {
    if (!sessionToCancel) return;
    setCancelling(true);
    try {
      await cancelSession(token, sessionToCancel.id);
      setToastMessage('Session request has been cancelled.');
      setTimeout(() => setToastMessage(''), 4000);
      setSessionToCancel(null);
      await fetchSessions();
    } catch (err) {
      console.error('Failed to cancel session:', err);
      alert(err.message || 'Could not cancel session.');
    } finally {
      setCancelling(false);
    }
  }

  // Filter tabs
  const tabs = [
    { id: 'all', label: 'All Sessions' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled / Rejected' },
  ];

  const filteredSessions = sessions.filter((s) => {
    const status = (s.status || '').toLowerCase();
    if (filterTab === 'all') return true;
    if (filterTab === 'cancelled') return status === 'cancelled' || status === 'rejected';
    return status === filterTab;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-sm animate-in-modal">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Coaching Sessions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track upcoming sessions, review coach remarks, and manage booking requests
            </p>
          </div>
          <Link
            to="/student/coaches"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <span>Find a Coach</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab Filter Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-slate-200/80">
          {tabs.map((tab) => {
            const count = sessions.filter((s) => {
              const status = (s.status || '').toLowerCase();
              if (tab.id === 'all') return true;
              if (tab.id === 'cancelled') return status === 'cancelled' || status === 'rejected';
              return status === tab.id;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  filterTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filterTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Sessions List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200/80 p-6 h-36 animate-pulse" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No sessions found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterTab === 'all'
                ? "You haven't requested any coaching sessions yet. Browse mentors to book your first session!"
                : `No sessions found in the "${tabs.find((t) => t.id === filterTab)?.label}" tab.`}
            </p>
            {filterTab === 'all' && (
              <Link
                to="/student/coaches"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <span>Browse Available Coaches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const isPending = session.status?.toLowerCase() === 'pending';
              const isCompleted = session.status?.toLowerCase() === 'completed';

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-indigo-100 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Top metadata */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <StatusBadge status={session.status} />
                        <span className="text-xs font-medium text-slate-400">
                          ID: #{session.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          Coach: {session.coach_name || `Coach #${session.coach_id}`}
                        </span>
                      </div>

                      {/* Topic Title */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {session.topic}
                      </h3>

                      {/* Date, Time, Duration */}
                      <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{session.session_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            {session.start_time?.slice(0, 5)} ({session.duration_minutes} mins)
                          </span>
                        </div>
                      </div>

                      {/* Student Message */}
                      {session.student_message && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                          <span className="font-semibold text-slate-700 block mb-0.5">Your Note:</span>
                          {session.student_message}
                        </p>
                      )}

                      {/* Coach Remarks */}
                      {session.coach_remarks && (
                        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs mt-2">
                          <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            Coach Remarks & Feedback:
                          </span>
                          <p className="text-indigo-800 leading-relaxed">{session.coach_remarks}</p>
                        </div>
                      )}
                    </div>

                    {/* Pending Actions */}
                    {isPending && (
                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => setSessionToCancel(session)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors"
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal to Cancel */}
      <Modal
        isOpen={Boolean(sessionToCancel)}
        onClose={() => setSessionToCancel(null)}
        title="Cancel Session Request?"
        description="Are you sure you want to withdraw this pending coaching request?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            This will mark your request for <strong className="text-slate-900 font-semibold">"{sessionToCancel?.topic}"</strong> as cancelled.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={cancelling}
              onClick={() => setSessionToCancel(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Keep Request
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default StudentSessions;
