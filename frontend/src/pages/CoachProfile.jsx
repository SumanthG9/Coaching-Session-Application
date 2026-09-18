import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  getCoachProfile,
  updateCoachProfile,
  getCoachSkills,
  addCoachSkill,
  deleteCoachSkill,
} from '../services/coachService';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  IndianRupee,
  Calendar,
  Sparkles,
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

function CoachProfile() {
  const { user, token } = useAuth();

  // Profile fields
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);
  const [sessionFee, setSessionFee] = useState(0);
  const [availability, setAvailability] = useState('');

  // Skills
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Status
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const [profile, skillsData] = await Promise.all([
          getCoachProfile(token),
          getCoachSkills(token),
        ]);

        if (profile) {
          setBio(profile.bio || '');
          setYearsExperience(profile.years_experience ?? 0);
          setSessionFee(profile.session_fee ? parseFloat(profile.session_fee) : 0);
          setAvailability(profile.availability || '');
        }

        setSkills(skillsData || []);
      } catch (err) {
        console.error('Failed to load coach data:', err);
        setError(err.message || 'Failed to fetch coach profile information.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  async function handleProfileSave(e) {
    e.preventDefault();
    setSavingProfile(true);
    setError('');

    if (yearsExperience < 0) {
      setError('Years of experience cannot be negative');
      setSavingProfile(false);
      return;
    }

    if (sessionFee < 0) {
      setError('Session fee cannot be negative');
      setSavingProfile(false);
      return;
    }

    try {
      await updateCoachProfile(token, {
        bio: bio.trim() || null,
        years_experience: parseInt(yearsExperience, 10),
        session_fee: parseFloat(sessionFee),
        availability: availability.trim() || null,
      });

      setToastMessage('Profile details updated successfully!');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update coach profile:', err);
      setError(err.message || 'Failed to update coach profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    const skillName = newSkillInput.trim();
    if (!skillName) return;

    if (skillName.length < 2) {
      setError('Skill name must have at least 2 characters');
      return;
    }

    setAddingSkill(true);
    setError('');

    try {
      const created = await addCoachSkill(token, skillName);
      setSkills((prev) => [...prev, created]);
      setNewSkillInput('');
      setToastMessage(`Skill "${skillName}" added!`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add skill:', err);
      setError(err.message || 'Failed to add skill.');
    } finally {
      setAddingSkill(false);
    }
  }

  async function handleDeleteSkill(skillId) {
    try {
      await deleteCoachSkill(token, skillId);
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
      setToastMessage('Skill removed');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to remove skill:', err);
      setError(err.message || 'Failed to remove skill.');
    }
  }

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Coach Profile & Skills
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define your rate, experience, availability schedule, and showcase your technical expertise
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: Profile Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10">
            <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'C'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                  <Sparkles className="w-3 h-3" /> Mentor / Coach Account
                </span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-28 bg-slate-100 rounded-xl" />
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Years of Experience */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Years of Experience
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        required
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* Session Fee */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Session Fee (₹ INR)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        required
                        value={sessionFee}
                        onChange={(e) => setSessionFee(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Weekly Availability Schedule
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Mon-Fri 6:00 PM - 9:00 PM, Sat 10:00 AM - 2:00 PM EST"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    About You / Mentor Bio
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your background, achievements, coaching philosophy, and what students can expect..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs shadow-purple-600/20 transition-all disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving Details...' : 'Save Profile Details'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Skills Management */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Skills & Expertise</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Students search and discover mentors by skill tags. Add your specialized technologies and frameworks.
              </p>
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="e.g. Python, React, FastAPI, System Design, GraphQL..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
              <button
                type="submit"
                disabled={addingSkill || !newSkillInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs shadow-purple-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{addingSkill ? 'Adding...' : 'Add Skill'}</span>
              </button>
            </form>

            {/* Current Skills List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Active Skills ({skills.length})
              </span>

              {skills.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl p-4 text-slate-400 text-xs">
                  No skills added yet. Add a skill above to help students find you in search results.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 group"
                    >
                      <span>{s.skill}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(s.id)}
                        className="text-purple-400 hover:text-rose-600 rounded-full p-0.5 hover:bg-purple-100 transition-colors"
                        title="Remove skill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CoachProfile;
