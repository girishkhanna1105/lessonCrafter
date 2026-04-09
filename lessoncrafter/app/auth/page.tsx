"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, ArrowRight, Github } from "lucide-react";
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
        
        // ✨ Check if user has a profile
        const profileRes = await fetch(`/api/profile?userId=${data.user.id}&role=${data.user.role}`);
        const profileData = await profileRes.json();

        if (profileData.hasProfile) {
          router.push("/page2");
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <Card className="w-full max-w-md glass border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <CardHeader className="space-y-1 pb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <CardTitle className="text-3xl font-black text-white">
              {isLogin ? "Welcome Back" : "Join the Future"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isLogin 
                ? "Sign in to access your private lessons." 
                : "Create an account to start your learning journey."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className={`p-3 rounded-xl border text-sm font-medium ${
                  error.includes("successful") 
                    ? "bg-green-500/10 border-green-500/20 text-green-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  {error}
                </div>
              )}
              
              {!isLogin && (
                <>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Full Name"
                      className="pl-10 h-12 glass border-white/5 focus:border-indigo-500/50"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">PH</span>
                    <Input
                      placeholder="Phone Number"
                      className="pl-10 h-12 glass border-white/5 focus:border-indigo-500/50"
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
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="pl-10 h-12 glass border-white/5 focus:border-indigo-500/50"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-10 h-12 glass border-white/5 focus:border-indigo-500/50"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Or Continue With</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            <div className="mt-6">
              <Button type="button" variant="outline" className="w-full h-12 glass border-white/5 hover:bg-white/5 font-bold flex items-center gap-3">
                <Github className="w-5 h-5" />
                GitHub
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8 pt-4">
            <p className="text-sm text-gray-500 text-center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                type="button"
              >
                {isLogin ? "Create one now" : "Sign in here"}
              </button>
            </p>
          </CardFooter>
        </Card>
      </main>
      
      <footer className="py-12 px-6 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] relative z-10">
        Securely powered by Supabase & JWT
      </footer>
    </div>
  );
}
