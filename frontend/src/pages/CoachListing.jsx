import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import CoachCard from '../components/CoachCard';
import BookSessionModal from '../components/BookSessionModal';
import CoachDetailsModal from '../components/CoachDetailsModal';
import { searchCoaches } from '../services/coachService';
import { useAuth } from '../context/AuthContext';
import { Search, Sparkles, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';

function CoachListing() {
  const { token } = useAuth();

  const [coaches, setCoaches] = useState([]);
  const [skillQuery, setSkillQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [selectedCoachForBook, setSelectedCoachForBook] = useState(null);
  const [selectedCoachForDetails, setSelectedCoachForDetails] = useState(null);

  const fetchCoachesList = useCallback(async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await searchCoaches(token, query);
      setCoaches(data || []);
    } catch (err) {
      console.error('Failed to load coaches:', err);
      setError(err.message || 'Failed to fetch coaches.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCoachesList();
  }, [fetchCoachesList]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchCoachesList(skillQuery);
  }

  function handleQuickSkillFilter(skillName) {
    setSkillQuery(skillName);
    fetchCoachesList(skillName);
  }

  function handleBookingSuccess(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 5000);
  }

  const popularSkills = ['Python', 'React', 'FastAPI', 'Machine Learning', 'System Design', 'JavaScript'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-sm animate-in-modal">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Expert Coaching Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Discover Your Next Mentor
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
            Browse world-class coaches across technical skills, system design, and career development. Book 1-on-1 personalized sessions anytime.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by skill (e.g. Python, React, Architecture, SQL)..."
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              {skillQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSkillQuery('');
                    fetchCoachesList('');
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs shadow-indigo-600/20 transition-all shrink-0"
            >
              Search Coaches
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Popular:
            </span>
            <button
              type="button"
              onClick={() => {
                setSkillQuery('');
                fetchCoachesList('');
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                skillQuery === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Coaches
            </button>
            {popularSkills.map((skill) => (
              <button
                type="button"
                key={skill}
                onClick={() => handleQuickSkillFilter(skill)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  skillQuery.toLowerCase() === skill.toLowerCase()
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Coach Grid or Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-md w-full" />
                  <div className="h-3 bg-slate-200 rounded-md w-4/5" />
                </div>
                <div className="h-8 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : coaches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No coaches found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {skillQuery
                ? `No mentors matched the skill "${skillQuery}". Try searching for another skill or view all coaches.`
                : 'There are currently no registered coaches in the system. Check back soon!'}
            </p>
            {skillQuery && (
              <button
                type="button"
                onClick={() => {
                  setSkillQuery('');
                  fetchCoachesList('');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-500">
                Showing <span className="text-slate-900 font-bold">{coaches.length}</span> {coaches.length === 1 ? 'coach' : 'coaches'} available
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  onBook={(c) => setSelectedCoachForBook(c)}
                  onViewDetails={(c) => setSelectedCoachForDetails(c)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Book Session Modal */}
      <BookSessionModal
        isOpen={Boolean(selectedCoachForBook)}
        onClose={() => setSelectedCoachForBook(null)}
        coach={selectedCoachForBook}
        onSuccess={handleBookingSuccess}
      />

      {/* Coach Details Modal */}
      <CoachDetailsModal
        isOpen={Boolean(selectedCoachForDetails)}
        onClose={() => setSelectedCoachForDetails(null)}
        coach={selectedCoachForDetails}
        onBookSession={(c) => setSelectedCoachForBook(c)}
      />
    </div>
  );
}

export default CoachListing;
