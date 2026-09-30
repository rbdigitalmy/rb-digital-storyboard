import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Clapperboard, Sparkles, Shield, User, Settings,
  LogOut, Coins, Menu, X, PlusCircle, CheckCircle2, ChevronDown
} from 'lucide-react';
import { ConfigModal } from './ConfigModal';
import { BuyCreditsModal } from './BuyCreditsModal';

export const Navbar: React.FC = () => {
  const { currentUser, wallet, mode, switchDemoUser, signOut } = useAuth();
  const location = useLocation();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <Clapperboard className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
                    RB Digital
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                      Studio
                    </span>
                  </span>
                  <span className="text-[10px] block text-slate-400 font-medium -mt-0.5">
                    ChatGPT Plugin Access & SaaS
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-red-600 bg-red-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/studio"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/studio') ? 'text-red-600 bg-red-50/60 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Storyboard Studio
                </Link>
                <Link
                  to="/claim"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/claim') ? 'text-red-600 bg-red-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Claim Past Order
                </Link>
                <Link
                  to="/plugin-setup"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/plugin-setup') ? 'text-red-600 bg-red-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  ChatGPT Plugin
                </Link>
                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin') ? 'text-slate-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    Admin Console
                  </Link>
                )}
              </nav>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5">
              
              {/* Wallet Credits Pill */}
              <div className="hidden sm:flex items-center bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-xl p-1 pr-2.5 transition-all">
                <button
                  onClick={() => setIsCreditsOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-red-600 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                  <span>{wallet?.balance.toLocaleString() ?? 0}</span>
                  <span className="text-[11px] font-normal text-slate-500">Credits</span>
                </button>
                <button
                  onClick={() => setIsCreditsOpen(true)}
                  title="Top-up credits"
                  className="ml-1.5 text-red-600 hover:text-red-700 hover:scale-110 transition-transform"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mode indicator & Config */}
              <button
                onClick={() => setIsConfigOpen(true)}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                  mode === 'sandbox'
                    ? 'border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100/60'
                    : 'border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/60'
                }`}
                title="Configure Live Supabase / Toggle Mode"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${mode === 'sandbox' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                <span className="capitalize">{mode}</span>
                <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Role Quick Switcher Pill (Convenience for testing) */}
              <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
                <button
                  onClick={() => switchDemoUser('customer')}
                  className={`px-2 py-1 rounded-lg font-medium transition-all ${
                    currentUser?.role === 'customer'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => switchDemoUser('admin')}
                  className={`px-2 py-1 rounded-lg font-medium transition-all ${
                    currentUser?.role === 'admin'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser?.full_name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{currentUser?.full_name}</p>
                      <p className="text-slate-400 truncate">{currentUser?.email}</p>
                      <span className="inline-block mt-1 uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {currentUser?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/studio"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        Storyboard Studio
                      </Link>
                      <Link
                        to="/claim"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        Claim Past Order
                      </Link>
                      {currentUser?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-3.5 py-2 text-indigo-600 font-semibold hover:bg-indigo-50/50"
                        >
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsConfigOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span>API Configuration</span>
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center justify-between"
                      >
                        <span>Reset / Sign Out</span>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </Link>
            <Link
              to="/studio"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Storyboard Studio
            </Link>
            <Link
              to="/claim"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Claim Past Order
            </Link>
            <Link
              to="/plugin-setup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              ChatGPT Plugin
            </Link>
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Admin Console
              </Link>
            )}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Credits: {wallet?.balance}</span>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCreditsOpen(true);
                }}
                className="text-xs font-semibold text-red-600"
              >
                + Top Up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
      <BuyCreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
    </>
  );
};
