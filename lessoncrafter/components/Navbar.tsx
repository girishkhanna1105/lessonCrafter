"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, LogOut, Loader2, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className='fixed top-6 left-0 right-0 z-50 flex justify-center px-4'>
      <div className='glass flex items-center justify-between w-full max-w-5xl px-6 py-3 rounded-2xl'>
        {/* Brand Mark */}
        <div id="logo" className='flex items-center gap-2'>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cobalt-600 to-marine-500 flex items-center justify-center shadow-lg shadow-cobalt-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">L</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white hidden sm:block">
              Lesson<span className="text-cobalt-600 dark:text-cobalt-400">Crafter</span>
            </span>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className='hidden md:flex items-center gap-8'>
          <Link href="/" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cobalt-600 dark:hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/lessons" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cobalt-600 dark:hover:text-white transition-colors">
            Archive
          </Link>
          <Link href="/studio" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cobalt-600 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
            Studio
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cobalt-600 dark:hover:text-white transition-colors flex items-center gap-1.5">
              Admin
            </Link>
          )}
        </div>

        {/* Right Action Cluster: Theme Toggle + Auth */}
        <div className="flex items-center gap-3">
          {/* Dual Mode Theme Switcher */}
          <ThemeToggle />

          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Authenticated</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-none">{user.name || user.email}</span>
              </div>
              <Link href="/profile" title="View Profile">
                <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center hover:border-cobalt-500/40 transition-all active:scale-95 cursor-pointer group">
                  <User className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400 group-hover:scale-110 transition-transform" />
                </div>
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 group"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          ) : (
            <Link href="/auth">
              <button className='px-5 py-2 rounded-xl text-xs font-black text-white bg-cobalt-600 hover:bg-cobalt-500 transition-all active:scale-95 shadow-lg shadow-cobalt-600/20 uppercase tracking-wider'>
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}