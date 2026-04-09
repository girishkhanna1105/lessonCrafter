"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, GraduationCap, School, Target, Languages, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [studentData, setStudentData] = useState({
    institution_type: 'college',
    institution_name: '',
    grade_or_year: '',
    learning_goal: 'deep_understanding',
    subject_focus: [] as string[],
  });

  const [teacherData, setTeacherData] = useState({
    institution_type: 'college',
    institution_name: '',
    teaching_style: 'lecture',
    assessment_preference: 'mcq',
    subjects_taught: [] as string[],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") {
      router.push("/auth");
    } else {
      const u = JSON.parse(storedUser);
      setUser(u);
      setSelectedRole(u.role || 'student');
    }
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    const profileData = selectedRole === 'teacher' ? teacherData : studentData;
    
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: selectedRole,
          profileData
        }),
      });

      if (res.ok) {
        // Update local user object to show profile is complete and new role
        const updatedUser = { ...user, role: selectedRole, hasProfile: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        router.push("/page2");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-32 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-2xl relative z-10 transition-all duration-500">
          
          {/* Progress Header */}
          <div className="flex justify-between items-center mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                  step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-gray-600 border border-white/5'
                }`}>
                  {i}
                </div>
                {i < 4 && <div className={`h-1 flex-1 mx-4 rounded-full transition-all duration-700 ${step > i ? 'bg-indigo-600' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>

          <Card className="glass border-white/10 shadow-2xl p-4 md:p-8">
            <CardHeader className="text-center space-y-2 mb-8">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4 animate-float">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-black text-white capitalize">
                {step === 1 ? "Choose Your Path" : "Personalize Your Experience"}
              </CardTitle>
              <CardDescription className="text-gray-400 max-w-md mx-auto">
                {step === 1 ? "Tell us how you intend to use LessonCrafter to tailor our AI engines for you." : "Help us understand your background to generate perfectly tailored lessons."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              
              {/* STEP 1: Role Selection */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-8 duration-500">
                  <button
                    onClick={() => setSelectedRole('student')}
                    className={`p-8 rounded-[2rem] border transition-all text-center flex flex-col items-center gap-6 group ${
                      selectedRole === 'student'
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-500/20'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === 'student' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`}>
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Student</h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">I want to learn independently and track my study progress.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedRole('teacher')}
                    className={`p-8 rounded-[2rem] border transition-all text-center flex flex-col items-center gap-6 group ${
                      selectedRole === 'teacher'
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-500/20'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`}>
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Teacher</h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">I want to create high-quality curriculum and shared materials.</p>
                    </div>
                  </button>
                </div>
              )}

              {/* STEP 2: Institution */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    {['School', 'College', selectedRole === 'teacher' ? 'Coaching' : 'Self Learner'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          const val = type.toLowerCase().replace(' ', '_');
                          selectedRole === 'teacher' 
                            ? setTeacherData({...teacherData, institution_type: val as any}) 
                            : setStudentData({...studentData, institution_type: val as any});
                        }}
                        className={`p-6 rounded-2xl border transition-all text-left flex flex-col gap-3 group ${
                          (selectedRole === 'teacher' ? teacherData.institution_type : studentData.institution_type) === type.toLowerCase().replace(' ', '_')
                            ? 'bg-indigo-600/10 border-indigo-500 shadow-xl'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {type === 'School' && <School className="w-6 h-6 text-indigo-400" />}
                        {type === 'College' && <GraduationCap className="w-6 h-6 text-indigo-400" />}
                        {(type === 'Coaching' || type === 'Self Learner') && <BookOpen className="w-6 h-6 text-indigo-400" />}
                        <span className="font-bold text-white uppercase tracking-widest text-xs">{type}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Name of Institution</label>
                    <Input 
                      placeholder="e.g. Stanford University" 
                      className="glass h-14 rounded-2xl border-white/10 px-6"
                      value={selectedRole === 'teacher' ? teacherData.institution_name : studentData.institution_name}
                      onChange={(e) => {
                        selectedRole === 'teacher'
                          ? setTeacherData({...teacherData, institution_name: e.target.value})
                          : setStudentData({...studentData, institution_name: e.target.value});
                      }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Level & Course */}
              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                  {selectedRole === 'student' ? (
                    <>
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                          {studentData.institution_type === 'college' ? 'Current Year of Study' : 'Current Grade'}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(studentData.institution_type === 'college' ? ['1st', '2nd', '3rd', '4th'] : ['6th', '7th', '8th', '9th', '10th', '11th', '12th']).map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setStudentData({...studentData, grade_or_year: lvl})}
                              className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                studentData.grade_or_year === lvl
                                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Primary Course / Subject</label>
                        <div className="relative group">
                          <select 
                            value={studentData.subject_focus[0] && ['Computer Science', 'Physics', 'Mathematics', 'Biology', 'Chemistry', 'Business', 'Literature', 'History', 'Fine Arts', 'Robotics'].includes(studentData.subject_focus[0]) ? studentData.subject_focus[0] : (studentData.subject_focus[0] ? 'Other' : '')} 
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'Other') {
                                setStudentData({...studentData, subject_focus: ['']});
                              } else {
                                setStudentData({...studentData, subject_focus: [val]});
                              }
                            }}
                            className="w-full h-14 glass rounded-2xl border-white/10 px-6 text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer pr-10"
                          >
                            <option value="" disabled className="bg-gray-900">Select your major/subject</option>
                            {['Computer Science', 'Physics', 'Mathematics', 'Biology', 'Chemistry', 'Business', 'Literature', 'History', 'Fine Arts', 'Robotics', 'Other'].map(course => (
                              <option key={course} value={course} className="bg-gray-900">{course}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                             <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                          </div>
                        </div>

                        {/* Custom Input for 'Other' */}
                        {(studentData.subject_focus[0] === '' || !['Computer Science', 'Physics', 'Mathematics', 'Biology', 'Chemistry', 'Business', 'Literature', 'History', 'Fine Arts', 'Robotics'].includes(studentData.subject_focus[0])) && studentData.subject_focus[0] !== undefined && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                             <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Please specify your field</label>
                             <Input 
                              placeholder="e.g. Quantum Engineering or Psychology" 
                              className="glass h-14 rounded-2xl border-indigo-500/30 px-6 focus:border-indigo-500 ease-in-out transition-all"
                              value={studentData.subject_focus[0] === 'Other' ? '' : studentData.subject_focus[0]}
                              onChange={(e) => setStudentData({...studentData, subject_focus: [e.target.value]})}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Preferred Teaching Style</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['Lecture', 'Activity Based', 'Flipped'].map((style) => (
                             <button
                              key={style}
                              onClick={() => setTeacherData({...teacherData, teaching_style: style.toLowerCase().replace(' ', '_') as any})}
                              className={`p-4 rounded-xl border transition-all text-sm font-bold ${
                                teacherData.teaching_style === style.toLowerCase().replace(' ', '_')
                                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Primary Subject Area</label>
                        <Input 
                          placeholder="e.g. Theoretical Physics" 
                          className="glass h-14 rounded-2xl border-white/10 px-6"
                          value={teacherData.subjects_taught[0] || ''}
                          onChange={(e) => setTeacherData({...teacherData, subjects_taught: [e.target.value]})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Goals / Assessment */}
              {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                  {selectedRole === 'student' ? (
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Primary Learning Goal</label>
                      <div className="space-y-3">
                        {['Exam Prep', 'Deep Understanding', 'Quick Overview'].map((goal) => (
                          <button
                            key={goal}
                            onClick={() => setStudentData({...studentData, learning_goal: goal.toLowerCase().replace(' ', '_') as any})}
                            className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                              studentData.learning_goal === goal.toLowerCase().replace(' ', '_')
                                ? 'bg-indigo-600/10 border-indigo-500'
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <span className="font-bold text-white">{goal}</span>
                            <Target className={`w-5 h-5 transition-transform group-hover:rotate-45 ${studentData.learning_goal === goal.toLowerCase().replace(' ', '_') ? 'text-indigo-400' : 'text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Default Assessment Method</label>
                       <div className="space-y-3">
                        {['MCQ', 'Descriptive', 'Project Based'].map((pref) => (
                          <button
                            key={pref}
                            onClick={() => setTeacherData({...teacherData, assessment_preference: pref.toLowerCase().replace(' ', '_') as any})}
                            className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                              teacherData.assessment_preference === pref.toLowerCase().replace(' ', '_')
                                ? 'bg-indigo-600/10 border-indigo-500'
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <span className="font-bold text-white">{pref}</span>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="pt-8 flex gap-4">
                {step > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                    className="h-14 px-8 rounded-2xl text-gray-400 font-bold hover:text-white transition-all"
                  >
                    Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    className="flex-1 h-14 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/10 group active:scale-95"
                  >
                    Next Step
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinish}
                    disabled={loading}
                    className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/30 group active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Launch Workspace
                        <Sparkles className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="py-8 px-6 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] relative z-10">
        Step {step} of 4 • Securing your learning path
      </footer>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
