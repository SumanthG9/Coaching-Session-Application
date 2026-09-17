import React from 'react';
import { Briefcase, DollarSign, Calendar, Sparkles, ArrowRight } from 'lucide-react';

function CoachCard({ coach, onBook, onViewDetails }) {
  const skills = coach.skills || [];
  const initials = coach.name
    ? coach.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'C';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg hover:border-indigo-200/80 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Avatar, Name & Rate */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold text-base flex items-center justify-center shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                {coach.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center text-xs font-semibold text-slate-500">
                  <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {coach.years_experience} {coach.years_experience === 1 ? 'yr' : 'yrs'} exp
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 font-medium block">Rate</span>
            <span className="text-base font-extrabold text-slate-900">
              ${parseFloat(coach.session_fee || 0).toFixed(0)}
              <span className="text-xs font-medium text-slate-500">/hr</span>
            </span>
          </div>
        </div>

        {/* Bio excerpt */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {coach.bio || 'Experienced mentor ready to guide you on technical skills and career paths.'}
        </p>

        {/* Skills chips */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
            {skills.length > 0 ? (
              skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">General Coaching</span>
            )}
            {skills.length > 4 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200/60">
                +{skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Availability snippet */}
        {coach.availability && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="line-clamp-1">{coach.availability}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onViewDetails(coach)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors"
        >
          View Profile
        </button>
        <button
          type="button"
          onClick={() => onBook(coach)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/20 flex items-center justify-center gap-1 transition-all"
        >
          <span>Book Session</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default CoachCard;
