import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Users,
  Calendar,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

function Landing() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath =
    user?.role === "coach" ? "/coach/dashboard" : "/student/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-transparent">
                CoachFlow
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a
                href="#features"
                className="hover:text-indigo-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hover:text-indigo-600 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#for-who"
                className="hover:text-indigo-600 transition-colors"
              >
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
                    to="/register/student"
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
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-600">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                How It Works
              </a>
              <a
                href="#for-who"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                For Students & Coaches
              </a>
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <Link
                  to={dashboardPath}
                  className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register/student"
                    className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
                  >
                    Get Started as Student
                  </Link>
                  <Link
                    to="/register/coach"
                    className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"
                  >
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
        {/* Background glow effects */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-300/30 to-purple-300/20 rounded-full blur-3xl -z-10 pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-6 shadow-xs animate-soft-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Connect, Learn & Grow with Industry Mentors</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Accelerate Your Journey with{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              1-on-1 Coaching
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover verified coaches, book personalized 1-on-1 sessions, and
            unlock feedback that powers real growth. All in one simple platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to={dashboardPath}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/35 transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register/student"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/35 transition-all duration-200 group"
                >
                  <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Join as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register/coach"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-slate-800 font-semibold border border-slate-200/90 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group"
                >
                  <Briefcase className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span>Apply as Coach</span>
                </Link>
              </>
            )}
          </div>

          {/* Trust stats / Key Highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">100%</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Verified Mentors</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">1-on-1</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Tailored Sessions</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">Flexible</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Direct Scheduling</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">Direct</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Structured Feedback</p>
            </div>
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
              Designed from the ground up to make mentor discovery, booking, and session management smooth and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 card-glow flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Discover Expert Coaches
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">
                Filter and browse coaches by specific skills, years of experience, hourly rates, and real-time availability slots.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 card-glow flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Streamlined Requests
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">
                Request sessions with your preferred date, time, and custom learning agenda. Coaches review and confirm requests with one click.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 card-glow flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Actionable Remarks
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">
                Receive personalized guidance, session notes, and follow-up recommendations directly logged in your session history.
              </p>
            </div>
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
              How CoachFlow Works
            </p>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Get started in just three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-5">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Explore Coaches
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search coaches by domain, programming languages, career skills, or rate. Review bios, background, and ratings.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-5">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Book a 1-on-1 Session
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pick a suitable time slot and submit your session request. Coaches can accept or respond directly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-5">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Level Up with Feedback
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Attend your session, gain actionable insights, and track past completed sessions with detailed coach feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Pathway Section (Students & Coaches) */}
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
                  Connect with experts who have walked the path before you. Get help with career transitions, technical interviews, and skill mastery.
                </p>

                <ul className="space-y-3 mb-8 text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Search coaches by technical skill and experience</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Book flexible sessions that fit your timetable</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>View full session logs, status updates, and notes</span>
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
                  Share your expertise and monetize your time
                </h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Set your own rates, showcase your skills, manage your requests, and make a lasting impact on aspiring talent.
                </p>

                <ul className="space-y-3 mb-8 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Set custom session fees and update your availability</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Accept or reject incoming requests with full agenda context</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Add post-session remarks to track mentee progress</span>
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

      {/* Call to Action Banner */}
      <section className="py-14 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to take the next step in your career?
          </h2>
          <p className="mt-3 text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
            Join hundreds of students and coaches building real skills and meaningful mentorship connections today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register/student"
              className="px-7 py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition-colors shadow-md"
            >
              Get Started Now
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white font-semibold border border-indigo-400/40 transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-slate-900">CoachFlow</span>
            <span className="text-xs text-slate-400 ml-2">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/login" className="hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Link
              to="/register/student"
              className="hover:text-indigo-600 transition-colors"
            >
              Student Sign Up
            </Link>
            <Link
              to="/register/coach"
              className="hover:text-indigo-600 transition-colors"
            >
              Coach Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
