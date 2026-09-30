import React from 'react';
import { Clapperboard, Heart, Shield, Terminal, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-xs py-10 mt-auto text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center">
                <Clapperboard className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">RB Digital Storyboard Suite</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Enterprise customer entitlement, automated BCL Malaysia payment reconciliation, and Model Context Protocol (MCP) server for ChatGPT.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> BCL Verified
              </span>
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" /> MCP Ready
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> 19 Workflows
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">Product & Suite</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/studio" className="hover:text-red-600 transition-colors">
                  19 RB Workflows Studio
                </Link>
              </li>
              <li>
                <Link to="/claim" className="hover:text-red-600 transition-colors">
                  BCL Order Claim Portal
                </Link>
              </li>
              <li>
                <Link to="/plugin-setup" className="hover:text-red-600 transition-colors">
                  ChatGPT Plugin Setup
                </Link>
              </li>
              <li>
                <a
                    href={`${import.meta.env.BASE_URL}rb-digital-storyboard-suite-0.2.0.zip`}
                  download
                  className="hover:text-red-600 transition-colors inline-flex items-center gap-1 text-slate-600 font-medium"
                >
                  Download Plugin (.zip)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">Legal & Security</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-400">Supabase Row-Level Security</span>
              </li>
              <li>
                <span className="text-slate-400">PKCE OAuth2 S256 Protocol</span>
              </li>
              <li>
                <span className="text-slate-400">FPX BCL Gateway Encrypted</span>
              </li>
              <li>
                <span className="text-slate-400">Privacy & Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} RB Digital by Najib. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-0.5" /> for viral video creators & builders.
          </div>
        </div>
      </div>
    </footer>
  );
};
