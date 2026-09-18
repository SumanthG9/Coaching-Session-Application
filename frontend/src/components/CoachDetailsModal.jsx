import Modal from './Modal';
import { Briefcase, Calendar, ArrowRight } from 'lucide-react';

function CoachDetailsModal({ isOpen, onClose, coach, onBookSession }) {
  if (!coach) return null;

  const initials = coach.name
    ? coach.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'C';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Coach Profile Details"
      description="Learn more about this mentor's background and areas of expertise"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            {initials}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{coach.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                {coach.years_experience} {coach.years_experience === 1 ? 'Year' : 'Years'} Experience
              </span>
              <span>•</span>
              <span className="font-bold text-slate-900">
                ₹{parseFloat(coach.session_fee || 0).toLocaleString('en-IN')}
                <span className="font-normal text-slate-500">/hr</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About Mentor</h4>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {coach.bio || 'This mentor has not provided a detailed bio yet.'}
          </p>
        </div>

        {/* Availability */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Weekly Availability</h4>
          <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{coach.availability || 'Flexible availability upon session request.'}</span>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Skills & Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {coach.skills && coach.skills.length > 0 ? (
              coach.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">General Career & Technical Mentorship</span>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBookSession(coach);
            }}
            className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <span>Request Coaching Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CoachDetailsModal;
