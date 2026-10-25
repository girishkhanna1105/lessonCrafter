"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Mail, BookOpen, Pencil, Save, X,
  Loader2, CheckCircle2, ChevronRight, Sparkles
} from "lucide-react";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "History", "English", "Economics", "Other"];
const STUDENT_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SCHOOL_GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored || stored === "undefined") { router.push("/auth"); return; }
    try {
      const u = JSON.parse(stored);
      setUser(u);
      fetch(`/api/profile?userId=${u.id}&role=${u.role || "student"}`)
        .then(r => r.json())
        .then(d => {
          if (d.profile) { setProfile(d.profile); setForm(d.profile); }
          setLoading(false);
        });
    } catch { router.push("/auth"); }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: user.role || "student", profileData: form }),
      });
      const data = await res.json();
      if (data.profile) { setProfile(data.profile); setForm(data.profile); }
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const isStudent = (user?.role || "student") === "student";
  const isCollege = form?.education_level === "college";

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <Navbar />
      <Loader2 className="w-10 h-10 text-cobalt-600 dark:text-cobalt-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cobalt-600 dark:text-cobalt-400 mb-1">Account</p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Your Profile</h1>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-700 text-white text-sm font-bold shadow-md shadow-cobalt-600/20 transition-all active:scale-95">
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => { setEditing(false); setForm(profile); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 text-sm font-bold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {saved && (
          <div className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
          </div>
        )}

        {/* Identity Card */}
        <div className="glass-card p-6 mb-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-5">Identity</p>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black text-cobalt-600 dark:text-cobalt-400">
                {(user?.name || user?.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-lg font-black text-slate-900 dark:text-white">{user?.name || "No name set"}</p>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  isStudent ? "bg-cobalt-500/10 border border-cobalt-500/20 text-cobalt-600 dark:text-cobalt-400" : "bg-marine-500/10 border border-marine-500/20 text-marine-600 dark:text-marine-400"
                }`}>
                  {user?.role || "Student"}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="glass-card p-6 mb-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-5">
            {isStudent ? "Academic Profile" : "Teaching Profile"}
          </p>

          {isStudent ? (
            <div className="space-y-5">
              {/* Education Level */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Education Level</label>
                {editing ? (
                  <div className="flex gap-3">
                    {["school", "college"].map(lvl => (
                      <button key={lvl} onClick={() => setForm({ ...form, education_level: lvl })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                          form?.education_level === lvl
                            ? "bg-cobalt-600 border-cobalt-500 text-white shadow-md shadow-cobalt-600/20"
                            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-cobalt-400"
                        }`}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-900 dark:text-white font-semibold capitalize">{profile?.education_level || "—"}</p>
                )}
              </div>

              {/* Year / Grade */}
              {(editing ? form?.education_level : profile?.education_level) && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">
                    {isCollege ? "Year of Study" : "Grade"}
                  </label>
                  {editing ? (
                    <select value={form?.year_of_study || form?.grade || ""}
                      onChange={e => setForm({ ...form, ...(isCollege ? { year_of_study: e.target.value } : { grade: e.target.value }) })}
                      className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cobalt-500">
                      <option value="">Select...</option>
                      {(isCollege ? STUDENT_YEARS : SCHOOL_GRADES).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold">{profile?.year_of_study || profile?.grade || "—"}</p>
                  )}
                </div>
              )}

              {/* Subject Focus */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Subject Focus</label>
                {editing ? (
                  <select value={form?.subject_focus?.[0] || ""}
                    onChange={e => setForm({ ...form, subject_focus: [e.target.value] })}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cobalt-500">
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <p className="text-slate-900 dark:text-white font-semibold">{profile?.subject_focus?.[0] || "—"}</p>
                )}
              </div>

              {/* Learning Level */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Learning Level</label>
                {editing ? (
                  <div className="flex gap-3">
                    {LEVELS.map(lvl => (
                      <button key={lvl} onClick={() => setForm({ ...form, learning_level: lvl })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                          form?.learning_level === lvl
                            ? "bg-cobalt-600 border-cobalt-500 text-white shadow-md shadow-cobalt-600/20"
                            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:border-cobalt-400"
                        }`}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-900 dark:text-white font-semibold">{profile?.learning_level || "—"}</p>
                )}
              </div>

              {/* Learning Goals */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Learning Goals</label>
                {editing ? (
                  <textarea value={form?.learning_goals || ""}
                    onChange={e => setForm({ ...form, learning_goals: e.target.value })}
                    placeholder="What do you want to achieve with LessonCrafter?"
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cobalt-500 resize-none" />
                ) : (
                  <p className="text-slate-900 dark:text-white font-semibold">{profile?.learning_goals || "—"}</p>
                )}
              </div>
            </div>
          ) : (
            /* Teacher fields */
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Subjects Taught</label>
                {editing ? (
                  <select value={form?.subjects_taught?.[0] || ""}
                    onChange={e => setForm({ ...form, subjects_taught: [e.target.value] })}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cobalt-500">
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <p className="text-slate-900 dark:text-white font-semibold">{profile?.subjects_taught?.[0] || "—"}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Grade Levels Taught</label>
                {editing ? (
                  <input value={form?.grade_levels_taught || ""}
                    onChange={e => setForm({ ...form, grade_levels_taught: e.target.value })}
                    placeholder="e.g. Grade 9-12, College Freshmen"
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cobalt-500" />
                ) : (
                  <p className="text-slate-900 dark:text-white font-semibold">{profile?.grade_levels_taught || "—"}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Teaching Style</label>
                {editing ? (
                  <textarea value={form?.teaching_style || ""}
                    onChange={e => setForm({ ...form, teaching_style: e.target.value })}
                    placeholder="Describe your preferred teaching approach..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cobalt-500 resize-none" />
                ) : (
                  <p className="text-slate-900 dark:text-white font-semibold">{profile?.teaching_style || "—"}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-4">Quick Actions</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push("/studio")}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 transition-all group">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-gray-300 group-hover:text-slate-950 dark:group-hover:text-white">Open Creation Studio</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
            </button>
            <button onClick={() => router.push("/lessons")}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 transition-all group">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-gray-300 group-hover:text-slate-950 dark:group-hover:text-white">View Lesson Archive</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
