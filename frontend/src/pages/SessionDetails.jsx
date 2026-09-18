import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  getSessionById,
  cancelSession,
  acceptSession,
  rejectSession,
  completeSession,
  updateSessionMeetingLink,
} from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Check,
  X,
  FileText,
  Video,
  ExternalLink,
} from 'lucide-react';

function SessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declining, setDeclining] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [coachRemarksInput, setCoachRemarksInput] = useState('');
  const [completing, setCompleting] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);

  // Meeting Link state
  const [meetingLink, setMeetingLink] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getSessionById(token, id);
      setSession(data);
      if (data.coach_remarks) {
        setCoachRemarksInput(data.coach_remarks);
      }
      setMeetingLink(data.meeting_link || '');
    } catch (err) {
      console.error('Failed to load session details:', err);
      setError(err.message || 'Unable to retrieve session details.');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  async function handleSaveMeetingLink(e) {
    if (e) e.preventDefault();
    if (!meetingLink.trim()) {
      showToast('Please provide a valid meeting link.');
      return;
    }
    setSavingLink(true);
    try {
      await updateSessionMeetingLink(token, session.id, meetingLink.trim());
      showToast('Meeting link updated successfully!');
      await fetchSession();
    } catch (err) {
      console.error('Failed to update meeting link:', err);
      showToast(err.message || 'Failed to update meeting link.');
    } finally {
      setSavingLink(false);
    }
  }

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Actions
  async function handleAccept() {
    setActionLoading(true);
    try {
      await acceptSession(token, session.id);
      showToast('Session accepted successfully!');
      await fetchSession();
    } catch (err) {
      showToast(err.message || 'Failed to accept session.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmDecline() {
    setDeclining(true);
    try {
      await rejectSession(token, session.id);
      showToast('Session request declined.');
      setShowDeclineModal(false);
      await fetchSession();
    } catch (err) {
      showToast(err.message || 'Failed to decline session.');
    } finally {
      setDeclining(false);
    }
  }

  async function handleConfirmCancel() {
    setCancelling(true);
    try {
      await cancelSession(token, session.id);
      showToast('Session has been cancelled.');
      setShowCancelModal(false);
      await fetchSession();
    } catch (err) {
      showToast(err.message || 'Failed to cancel session.');
    } finally {
      setCancelling(false);
    }
  }

  async function handleConfirmComplete(e) {
    e.preventDefault();
    setCompleting(true);
    try {
      await completeSession(token, session.id, coachRemarksInput.trim() || null);
      showToast('Session marked as completed!');
      setShowCompleteModal(false);
      await fetchSession();
    } catch (err) {
      showToast(err.message || 'Failed to complete session.');
    } finally {
      setCompleting(false);
    }
  }

  const userRole = (user?.role || '').toLowerCase();
  const isStudent = userRole === 'student';
  const isCoach = userRole === 'coach';
  const status = (session?.status || '').toLowerCase();
  const hasMeetingLink = Boolean(session?.meeting_link && session.meeting_link.trim().length > 0);

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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link
              to={isStudent ? '/student/dashboard' : '/coach/dashboard'}
              className="hover:text-indigo-600 transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              to={isStudent ? '/student/sessions' : '/coach/requests'}
              className="hover:text-indigo-600 transition-colors"
            >
              {isStudent ? 'My Sessions' : 'Session Requests'}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Session #{id}</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-200/80 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-sm font-medium text-slate-600">Loading session details...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-rose-200 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Session</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">{error}</p>
            <button
              onClick={() => navigate(isStudent ? '/student/sessions' : '/coach/requests')}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-indigo-200"
            >
              Return to Sessions
            </button>
          </div>
        )}

        {/* Session Content */}
        {!loading && !error && session && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-transparent rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none"></div>

              <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                      SESSION #{session.id}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {session.topic || 'Coaching Session'}
                  </h1>

                  <p className="text-sm text-slate-500">
                    Requested on {new Date(session.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Status-specific action controls */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Student pending cancellation */}
                  {isStudent && status === 'pending' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-all shadow-sm"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* Coach pending accept/reject */}
                  {isCoach && status === 'pending' && (
                    <>
                      <button
                        onClick={() => setShowDeclineModal(true)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Request</span>
                      </button>
                    </>
                  )}

                  {/* Accepted Sessions: Meeting link controls */}
                  {status === 'accepted' && (
                    <>
                      {isCoach ? (
                        /* Coach: Input to provide meeting link with placeholder and save button */
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <form onSubmit={handleSaveMeetingLink} className="flex items-center gap-2">
                            <div className="relative flex items-center">
                              <Video className="w-4 h-4 text-indigo-500 absolute left-3 pointer-events-none" />
                              <input
                                type="url"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                placeholder="Provide meeting link (e.g. Google Meet, Zoom)..."
                                className="pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 w-full sm:w-72 text-slate-800 placeholder:text-slate-400 font-medium transition-all shadow-2xs"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={savingLink || !meetingLink.trim()}
                              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-all shrink-0 shadow-xs"
                            >
                              {savingLink ? 'Saving...' : 'Save Link'}
                            </button>
                          </form>
                          {session?.meeting_link && (
                            <a
                              href={
                                session.meeting_link.startsWith('http')
                                  ? session.meeting_link
                                  : `https://${session.meeting_link}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Join Meeting</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        /* Student: Can join only if coach provided link, otherwise waiting placeholder */
                        hasMeetingLink ? (
                          <a
                            href={
                              session.meeting_link.trim().startsWith('http')
                                ? session.meeting_link.trim()
                                : `https://${session.meeting_link.trim()}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Live Meeting</span>
                          </a>
                        ) : (
                          <div
                            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold flex items-center gap-2 select-none"
                            title="Your coach has not shared the meeting link yet"
                          >
                            <Video className="w-4 h-4 text-slate-400" />
                            <span>Waiting for coach to provide meeting link</span>
                          </div>
                        )
                      )}
                    </>
                  )}

                  {/* Coach accepted -> complete */}
                  {isCoach && status === 'accepted' && (
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      <span>Complete Session</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Schedule Highlights Bar */}
              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">Date</span>
                    <span className="text-sm font-bold text-slate-900">
                      {session.session_date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">Time & Duration</span>
                    <span className="text-sm font-bold text-slate-900">
                      {session.start_time ? session.start_time.slice(0, 5) : ''} • {session.duration_minutes} mins
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">Status</span>
                    <span className="text-sm font-bold capitalize text-slate-900">
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Student Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-3">
                  Student
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0">
                    {session.student_name ? session.student_name.slice(0, 2).toUpperCase() : 'ST'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {session.student_name || 'Student Profile'}
                    </h3>
                    <p className="text-xs text-slate-500">Student ID: #{session.student_id}</p>
                  </div>
                </div>
              </div>

              {/* Coach Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block mb-3">
                  Coach
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shrink-0">
                    {session.coach_name ? session.coach_name.slice(0, 2).toUpperCase() : 'CO'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {session.coach_name || 'Coach Profile'}
                    </h3>
                    <p className="text-xs text-slate-500">Coach ID: #{session.coach_id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages & Topic Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              {/* Student Message */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Student's Discussion Goals & Notes</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-sm text-slate-700 leading-relaxed italic">
                  {session.student_message ? (
                    `"${session.student_message}"`
                  ) : (
                    <span className="text-slate-400 not-italic">No special notes provided for this session.</span>
                  )}
                </div>
              </div>

              {/* Coach Remarks */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Coach Remarks & Feedback</span>
                </div>
                {session.coach_remarks ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-sm text-emerald-900 leading-relaxed">
                    {session.coach_remarks}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-sm text-slate-400">
                    {status === 'completed'
                      ? 'No remarks recorded.'
                      : 'Remarks will appear here once the coach completes this session.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Session Request?"
        description="Are you sure you want to cancel this booking request? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setShowCancelModal(false)}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
          >
            Keep Session
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all shadow-sm shadow-rose-200"
          >
            {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </Modal>

      {/* Complete Session Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Coaching Session"
        description="Provide feedback, next steps, or key takeaways for your student."
      >
        <form onSubmit={handleConfirmComplete} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Coach Remarks
            </label>
            <textarea
              rows={4}
              required
              value={coachRemarksInput}
              onChange={(e) => setCoachRemarksInput(e.target.value)}
              placeholder="e.g. Elena made great progress on SQLAlchemy async sessions. Recommended reviewing connection pools..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCompleteModal(false)}
              disabled={completing}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={completing}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-200"
            >
              {completing ? 'Completing...' : 'Complete & Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Decline Confirmation Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Decline Session Request?"
        description="Are you sure you want to decline this coaching request? The student will be notified."
        maxWidth="max-w-md"
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setShowDeclineModal(false)}
            disabled={declining}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
          >
            Keep Session
          </button>
          <button
            type="button"
            onClick={handleConfirmDecline}
            disabled={declining}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all shadow-sm"
          >
            {declining ? 'Declining...' : 'Confirm Decline'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default SessionDetails;
