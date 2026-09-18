import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getStudentProfile, updateStudentProfile } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { Phone, GraduationCap, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

function StudentProfile() {
  const { user, token } = useAuth();

  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const profile = await getStudentProfile(token);
        if (profile) {
          setPhone(profile.phone || '');
          setEducation(profile.education || '');
          setBio(profile.bio || '');
        }
      } catch (err) {
        console.error('Failed to load student profile:', err);
        setError(err.message || 'Failed to fetch student profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateStudentProfile(token, {
        phone: phone.trim() || null,
        education: education.trim() || null,
        bio: bio.trim() || null,
      });

      setToastMessage('Profile updated successfully!');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal contact info, education background, and learning goals
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10">
          {/* Account Overview Header */}
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                <Sparkles className="w-3 h-3" /> Student Account
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
            <form onSubmit={handleSave} className="space-y-6">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Education */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Education & Background
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. B.S. in Computer Science at Stanford University"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  About You & Learning Objectives
                </label>
                <textarea
                  rows={4}
                  placeholder="Share a brief overview of what you are working on, your career goals, and what you hope to learn from mentors..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving Profile...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentProfile;
