"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_no: "",
    role: "student",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.status !== 200 && data.status !== 200 && data.message) {
        throw new Error(data.message || "Operation failed");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Check if user has a profile
        const profileRes = await fetch(`/api/profile?userId=${data.user.id}&role=${data.user.role}`);
        const profileData = await profileRes.json();

        if (profileData.hasProfile) {
          router.push("/studio");
        } else {
          router.push("/onboarding");
        }
        router.refresh();
      } else {
        setIsLogin(true);
        setError("Registration successful! Please sign in to complete your profile.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 pt-28 sm:pt-32 relative overflow-hidden">
        {/* Cobalt architectural glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cobalt-600/10 rounded-full blur-[140px] pointer-events-none" />
        
        <Card className="w-full max-w-md glass border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 my-auto">
          <CardHeader className="space-y-1 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-cobalt-500/10 flex items-center justify-center border border-cobalt-500/20 mb-4">
              <Lock className="w-6 h-6 text-cobalt-600 dark:text-cobalt-400" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Join LessonCrafter"}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {isLogin 
                ? "Sign in to access your creation studio and lessons." 
                : "Create an account to start synthesizing interactive lessons."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className={`p-3 rounded-xl border text-sm font-medium ${
                  error.includes("successful") 
                    ? "bg-jade-500/10 border-jade-500/20 text-jade-500" 
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                  {error}
                </div>
              )}
              
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Full Name"
                        className="pl-10 h-12 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 focus:border-cobalt-500"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs font-mono">TEL</span>
                      <Input
                        placeholder="Phone Number"
                        className="pl-10 h-12 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 focus:border-cobalt-500"
                        value={formData.phone_no}
                        onChange={(e) => setFormData({...formData, phone_no: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="pl-10 h-12 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 focus:border-cobalt-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-10 h-12 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 focus:border-cobalt-500"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cobalt-600/20 active:scale-95 text-base cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8 pt-2">
            <p className="text-sm text-slate-500 text-center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-cobalt-600 dark:text-cobalt-400 font-bold hover:underline transition-all cursor-pointer"
                type="button"
              >
                {isLogin ? "Create one now" : "Sign in here"}
              </button>
            </p>
          </CardFooter>
        </Card>
      </main>
      
      <footer className="py-8 px-6 text-center text-xs text-slate-400 font-mono font-bold uppercase tracking-widest relative z-10">
        Authenticated securely via Supabase & JWT
      </footer>
    </div>
  );
}
