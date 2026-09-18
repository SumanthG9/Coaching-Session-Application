import { useState } from 'react';
import Modal from './Modal';
import { createSession } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

function BookSessionModal({ isOpen, onClose, coach, onSuccess }) {
  const { token } = useAuth();

  // Calculate today in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [topic, setTopic] = useState('');
  const [studentMessage, setStudentMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!coach) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!sessionDate) {
      setError('Please select a session date');
      return;
    }
    if (sessionDate < today) {
      setError('Session date cannot be in the past');
      return;
    }
    if (!startTime) {
      setError('Please select a start time');
      return;
    }
    if (!topic.trim() || topic.trim().length < 2) {
      setError('Please provide a topic (at least 2 characters)');
      return;
    }

    setLoading(true);

    try {
      // Backend expects start_time as HH:MM:SS
      const formattedTime = startTime.length === 5 ? `${startTime}:00` : startTime;

      await createSession(token, {
        coach_id: coach.id,
        session_date: sessionDate,
        start_time: formattedTime,
        duration_minutes: parseInt(durationMinutes, 10),
        topic: topic.trim(),
        student_message: studentMessage.trim() || null,
      });

      if (onSuccess) {
        onSuccess(`Session request for "${topic}" sent to ${coach.name}!`);
      }
      onClose();
    } catch (err) {
      console.error('Failed to book session:', err);
      setError(err.message || 'Failed to request session. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Session with ${coach.name}`}
      description="Select your preferred schedule, discussion topic, and session duration"
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Coach summary banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
          <div>
            <span className="font-semibold text-indigo-900 block">{coach.name}</span>
            <span className="text-indigo-600">
              ${parseFloat(coach.session_fee || 0).toFixed(0)} / session • {coach.years_experience} yrs experience
            </span>
          </div>
          {coach.availability && (
            <span className="text-slate-600 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-indigo-100">
              {coach.availability}
            </span>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Session Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={today}
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[30, 45, 60, 90].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  durationMinutes === mins
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {mins} mins
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Session Topic / Objective
          </label>
          <input
            type="text"
            required
            placeholder="e.g. System Design Mock Interview or React State Architecture"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Message for Coach <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Share context, questions, or specific areas you'd like to focus on..."
            value={studentMessage}
            onChange={(e) => setStudentMessage(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Request...' : 'Send Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BookSessionModal;
