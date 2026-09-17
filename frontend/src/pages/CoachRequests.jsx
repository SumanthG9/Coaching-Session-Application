import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  getCoachSessionRequests,
  acceptSession,
  rejectSession,
  completeSession,
} from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageSquare,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';

function CoachRequests() {
  const { token } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  // Complete session modal state
  const [sessionToComplete, setSessionToComplete] = useState(null);
  const [coachRemarks, setCoachRemarks] = useState('');
  const [completing, setCompleting] = useState(false);

  // Action loading IDs
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCoachSessionRequests(token);
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load coach requests:', err);
      setError(err.message || 'Failed to fetch session requests.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleAccept(session) {
    setActionLoadingId(session.id);
    setError('');
    try {
      await acceptSession(token, session.id);
      setToastMessage(`Session #${session.id} accepted successfully!`);
      setTimeout(() => setToastMessage(''), 4000);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to accept session:', err);
      setError(err.message || 'Failed to accept session.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(session) {
    if (!window.confirm(`Are you sure you want to decline the session request for "${session.topic}"?`)) {
      return;
    }
    setActionLoadingId(session.id);
    setError('');
    try {
      await rejectSession(token, session.id);
      setToastMessage(`Session #${session.id} rejected.`);
      setTimeout(() => setToastMessage(''), 4000);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to reject session:', err);
      setError(err.message || 'Failed to reject session.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCompleteSubmit(e) {
    e.preventDefault();
    if (!sessionToComplete) return;
    setCompleting(true);
    try {
      await completeSession(token, sessionToComplete.id, coachRemarks.trim() || null);
      setToastMessage(`Session marked as completed with your remarks!`);
      setTimeout(() => setToastMessage(''), 4000);
      setSessionToComplete(null);
      setCoachRemarks('');
      await fetchRequests();
    } catch (err) {
      console.error('Failed to complete session:', err);
      alert(err.message || 'Failed to mark session as completed.');
    } finally {
      setCompleting(false);
    }
  }

  const tabs = [
    { id: 'all', label: 'All Requests' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'Completed' },
    { id: 'rejected', label: 'Rejected / Cancelled' },
  ];

  const filteredSessions = sessions.filter((s) => {
    const status = (s.status || '').toLowerCase();
    if (filterTab === 'all') return true;
    if (filterTab === 'rejected') return status === 'rejected' || status === 'cancelled';
    return status === filterTab;
  });

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Coaching Session Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review student applications, accept or decline calls, and leave feedback on completed sessions
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-slate-200/80">
          {tabs.map((tab) => {
            const count = sessions.filter((s) => {
              const status = (s.status || '').toLowerCase();
              if (tab.id === 'all') return true;
              if (tab.id === 'rejected') return status === 'rejected' || status === 'cancelled';
              return status === tab.id;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  filterTab === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filterTab === tab.id ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-500'
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

        {/* List of Requests */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200/80 p-6 h-36 animate-pulse" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No session requests found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterTab === 'all'
                ? 'You do not have any session requests yet. Once students book time with you, requests will appear here.'
                : `No sessions found in the "${tabs.find((t) => t.id === filterTab)?.label}" tab.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const isPending = session.status?.toLowerCase() === 'pending';
              const isAccepted = session.status?.toLowerCase() === 'accepted';
              const isActionLoading = actionLoadingId === session.id;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-purple-100 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Top metadata */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <StatusBadge status={session.status} />
                        <span className="text-xs font-medium text-slate-400">
                          ID: #{session.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          Student: {session.student_name || `Student #${session.student_id}`}
                        </span>
                      </div>

                      {/* Topic */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {session.topic}
                      </h3>

                      {/* Schedule info */}
                      <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          <span>{session.session_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>
                            {session.start_time?.slice(0, 5)} ({session.duration_minutes} minutes)
                          </span>
                        </div>
                      </div>

                      {/* Student's initial note/message */}
                      {session.student_message && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                          <span className="font-semibold text-slate-700 block mb-0.5">
                            Student Message:
                          </span>
                          {session.student_message}
                        </div>
                      )}

                      {/* Coach remarks */}
                      {session.coach_remarks && (
                        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs mt-2">
                          <span className="font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            Your Remarks & Feedback:
                          </span>
                          <p className="text-purple-800 leading-relaxed">{session.coach_remarks}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                      <Link
                        to={`/coach/sessions/${session.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200/70 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleReject(session)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleAccept(session)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isActionLoading ? 'Accepting...' : 'Accept'}</span>
                          </button>
                        </div>
                      )}

                      {isAccepted && (
                        <button
                          type="button"
                          onClick={() => {
                            setSessionToComplete(session);
                            setCoachRemarks('');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-xs shadow-purple-600/20 transition-all flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Complete Session</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Complete Session Modal with Coach Remarks */}
      <Modal
        isOpen={Boolean(sessionToComplete)}
        onClose={() => setSessionToComplete(null)}
        title="Mark Session as Completed"
        description="Add remarks, summary notes, and action items for the student"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 text-xs">
            <span className="font-semibold text-purple-900 block">
              Topic: {sessionToComplete?.topic}
            </span>
            <span className="text-purple-700">
              Student: {sessionToComplete?.student_name || `Student #${sessionToComplete?.student_id}`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Coach Remarks / Recommendations
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Great progress on system design tradeoffs today! Recommended next steps: review database indexing and Redis caching patterns."
              value={coachRemarks}
              onChange={(e) => setCoachRemarks(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSessionToComplete(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={completing}
              className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 shadow-xs shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              {completing ? 'Completing...' : 'Submit & Complete'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CoachRequests;
