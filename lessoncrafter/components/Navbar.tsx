"use client";
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, LogOut, Loader2 } from 'lucide-react'

function Navbar() {
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
        <div id="logo" className='flex items-center gap-2'>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              Lesson<span className="text-indigo-400">Crafter</span>
            </span>
          </Link>
        </div>
        
        <div className='hidden md:flex items-center gap-8'>
          <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/lessons" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Archive
          </Link>
          <Link href="/page2" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Create
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Authenticated</span>
                  <span className="text-xs font-bold text-white leading-none">{user.name || user.email}</span>
                </div>
                <Link href="/profile" title="View Profile">
                  <div className="w-10 h-10 rounded-xl glass border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all active:scale-95 cursor-pointer group">
                    <User className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                  </div>
                </Link>
              </div>

              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95 group"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          ) : (
            <Link href="/auth">
              <button className='glass px-6 py-2.5 rounded-xl text-sm font-black text-white hover:bg-white/10 transition-all active:scale-95 shadow-xl shadow-indigo-500/10 uppercase tracking-widest'>
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar