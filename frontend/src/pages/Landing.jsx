import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  GraduationCap,
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
  Award,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    iconBg: "bg-indigo-100 text-indigo-600",
    title: "Discover Expert Coaches",
    description: "Filter and browse coaches by specific technical skills, years of experience, hourly rates, and verified background.",
  },
  {
    icon: Calendar,
    iconBg: "bg-violet-100 text-violet-600",
    title: "Conflict-Free Scheduling",
    description: "Request sessions with your custom agenda. The automated booking engine eliminates double bookings and verifies coach slots.",
  },
  {
    icon: MessageSquare,
    iconBg: "bg-purple-100 text-purple-600",
    title: "Actionable Mentorship Remarks",
    description: "Receive personalized guidance, session takeaways, and follow-up recommendations directly logged in your session history.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Explore Coaches",
    description: "Search coaches by technology stacks, system design expertise, or career goals. Review bios, background, and session rates.",
  },
  {
    step: "2",
    title: "Book a 1-on-1 Session",
    description: "Pick a date and start time with your learning agenda. Coaches review and confirm incoming requests with one click.",
  },
  {
    step: "3",
    title: "Level Up with Feedback",
    description: "Attend your session, gain actionable insights, and review detailed post-session feedback recorded by your mentor.",
  },
];

const HIGHLIGHTS = [
  { value: "100%", label: "Verified Mentors" },
  { value: "1-on-1", label: "Tailored Sessions" },
  { value: "Instant", label: "Availability Checks" },
  { value: "Direct", label: "Structured Feedback" },
];

function Landing() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState(null);

  const dashboardPath = user?.role === "coach" ? "/coach/dashboard" : "/student/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/favicon.svg"
                alt="Student-Coach Management"
                className="w-10 h-10 rounded-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-transparent">
                Student-Coach Management
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
                How It Works
              </a>
              <a href="#for-who" className="hover:text-indigo-600 transition-colors">
                For Students & Coaches
              </a>
            </nav>

            {/* Desktop CTA / Auth actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all duration-150"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 transition-all duration-150"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all duration-150"
                  >
                    Get Started
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-600">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                How It Works
              </a>
              <a href="#for-who" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                For Students & Coaches
              </a>
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <Link to={dashboardPath} className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                    Sign In
                  </Link>
                  <Link to="/register/student" className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
                    Join as Student
                  </Link>
                  <Link to="/register/coach" className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold">
                    Become a Coach
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-6 shadow-xs">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Connect, Learn & Grow with Industry Mentors</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Accelerate Your Life and Career with{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              One-on-One Coaching
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover verified coaches, book personalized 1-on-1 sessions, and unlock direct feedback that powers real career growth.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to={dashboardPath}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25 hover:bg-indigo-700 transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register/student"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25 hover:bg-indigo-700 transition-all duration-200 group"
                >
                  <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Join as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register/coach"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-slate-800 font-semibold border border-slate-200/90 shadow-sm hover:bg-slate-50 transition-all duration-200 group"
                >
                  <Briefcase className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span>Apply as Coach</span>
                </Link>
              </>
            )}
          </div>

          {/* Key Highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {HIGHLIGHTS.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-100 transition-all text-center min-w-0"
              >
                <p className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1 whitespace-nowrap">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Platform Features
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              Everything you need for seamless coaching
            </p>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Designed to make mentor discovery, booking, and session management transparent and frictionless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 card-glow flex flex-col">
                  <div className={`w-12 h-12 rounded-xl ${feat.iconBg} flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Simple Workflow
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              How Student-Coach Management Works
            </p>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Get started in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, idx) => (
              <div key={idx} className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs relative">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-5">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Pathway Section */}
      <section id="for-who" className="py-16 md:py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Who is it for?
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              Built for ambitious learners & dedicated mentors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 border border-indigo-100 flex flex-col justify-between card-glow">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-100/70 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-4">
                  <GraduationCap className="w-4 h-4" />
                  For Students & Learners
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Find the guidance you need to excel
                </h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Connect with experts who have walked the path before you. Get targeted help with system design, technical interviews, and career transitions.
                </p>

                <ul className="space-y-3 mb-8 text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Search coaches by technical skill and years of experience</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Request tailored sessions that fit your timetable</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Review structured post-session feedback and recommendations</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register/student"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Sign Up as a Student
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Coach Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-800 flex flex-col justify-between card-glow shadow-xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wide mb-4 border border-indigo-500/30">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  For Coaches & Mentors
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Share your expertise and mentor the next generation
                </h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Set your session fees, showcase your technical skills, manage your requests, and make a lasting impact.
                </p>

                <ul className="space-y-3 mb-8 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Set custom session rates and specify your availability</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Accept or decline requests with full student agenda context</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Record post-session remarks and action items for mentees</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register/coach"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors shadow-sm"
              >
                Join as a Coach
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-3">
                <img src="/favicon.svg" alt="Student-Coach Management" className="w-8 h-8 rounded-lg" />
                <span className="font-extrabold text-lg text-slate-900">Student-Coach Management</span>
              </Link>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Empowering learners and industry professionals through 1-on-1 mentorship, transparent scheduling, and actionable feedback.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Platform</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link to="/student/coaches" className="hover:text-indigo-600 transition-colors">Find Coaches</Link></li>
                <li><Link to="/register/student" className="hover:text-indigo-600 transition-colors">Student Sign Up</Link></li>
                <li><Link to="/register/coach" className="hover:text-indigo-600 transition-colors">Become a Coach</Link></li>
                <li><Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Trust & Legal</p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <button onClick={() => setLegalModalContent({ title: "Terms of Service", content: "By accessing Student-Coach Management, you agree to treat mentors and students with mutual professional respect. Session cancellations must occur in accordance with platform policies." })} className="hover:text-indigo-600 transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => setLegalModalContent({ title: "Privacy Policy", content: "Student-Coach Management safeguards your personal information and session history. Account information is encrypted and never sold or distributed to third parties." })} className="hover:text-indigo-600 transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setLegalModalContent({ title: "Mentorship Guidelines", content: "All sessions are held to high professional conduct standards. Coaches provide constructive, actionable technical and career advice." })} className="hover:text-indigo-600 transition-colors">
                    Community Guidelines
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} Student-Coach Management. All rights reserved.</p>
            <p>Built with React, FastAPI & PostgreSQL.</p>
          </div>
        </div>
      </footer>

      {/* Legal / Policy Modal */}
      {legalModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">{legalModalContent.title}</h3>
              <button onClick={() => setLegalModalContent(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {legalModalContent.content}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setLegalModalContent(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
