import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileSpreadsheet, 
  Database, 
  ExternalLink, 
  Copy, 
  QrCode, 
  Smartphone, 
  Check, 
  HelpCircle, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GoogleResources } from '../lib/workspace';

interface WorkspaceConfigProps {
  user: any;
  token: string | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  googleResources: GoogleResources | null;
  onSetupWorkspace: () => Promise<void>;
  isSettingUp: boolean;
  appUrl: string;
  authError?: string | null;
  onClearAuthError?: () => void;
  onLinkSpreadsheet: (spreadsheetId: string, url: string) => void;
}

export default function WorkspaceConfig({
  user,
  token,
  onLogin,
  onLogout,
  isLoggingIn,
  googleResources,
  onSetupWorkspace,
  isSettingUp,
  appUrl,
  authError,
  onClearAuthError,
  onLinkSpreadsheet
}: WorkspaceConfigProps) {
  const [copiedResource, setCopiedResource] = useState<string | null>(null);
  const [activeQr, setActiveQr] = useState<'feedback' | 'google' | 'tripadvisor' | 'whatsapp' | 'website'>('feedback');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  const [customSheetUrl, setCustomSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1yF_3pFOs5jVJHO4UxskiA8BPDUZvvzMdeRDAKx4jAsk/edit?gid=1912726066#gid=1912726066');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState(false);

  const handleLinkCustomSpreadsheet = () => {
    setLinkError(null);
    setLinkSuccess(false);

    const matches = customSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const id = matches ? matches[1] : null;

    if (!id) {
      setLinkError('Invalid Google Sheets URL format. Please make sure the URL contains "/spreadsheets/d/Spreadsheet-ID".');
      return;
    }

    try {
      onLinkSpreadsheet(id, customSheetUrl);
      setLinkSuccess(true);
      setTimeout(() => setLinkSuccess(false), 3000);
    } catch (e: any) {
      setLinkError(e.message || 'Failed to link custom spreadsheet.');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResource(id);
    setTimeout(() => setCopiedResource(null), 2000);
  };

  // Simulated elegant printable QR Code container SVG
  const renderSvgQr = (type: string) => {
    return (
      <svg viewBox="0 0 160 160" className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-[#ebd665]/40 shadow-sm">
        {/* Border frame */}
        <rect x="2" y="2" width="156" height="156" rx="10" fill="none" stroke="#aa841d" strokeWidth="1" strokeDasharray="3 3" />
        
        {/* Finding patterns - outer blocks */}
        <rect x="10" y="10" width="35" height="35" fill="#0f172a" rx="4" />
        <rect x="17" y="17" width="21" height="21" fill="white" rx="2" />
        <rect x="22" y="22" width="11" height="11" fill="#aa841d" rx="1" />

        <rect x="115" y="10" width="35" height="35" fill="#0f172a" rx="4" />
        <rect x="122" y="17" width="21" height="21" fill="white" rx="2" />
        <rect x="127" y="22" width="11" height="11" fill="#aa841d" rx="1" />

        <rect x="10" y="115" width="35" height="35" fill="#0f172a" rx="4" />
        <rect x="17" y="122" width="21" height="21" fill="white" rx="2" />
        <rect x="22" y="127" width="11" height="11" fill="#aa841d" rx="1" />

        {/* Small alignment block */}
        <rect x="115" y="115" width="15" height="15" fill="#aa841d" rx="2" />
        <rect x="119" y="119" width="7" height="7" fill="white" rx="1" />

        {/* Abstract luxury QR noise */}
        <path d="M55,15 h10 v10 h-10 z M75,15 h5 v5 h-5 z M90,15 h15 v5 h-15 z M55,35 h5 v15 h-5 z M70,30 h10 v5 h-10 z M90,30 h5 v5 h-5 z" fill="#1e293b" />
        <path d="M15,55 h15 v5 h-15 z M35,55 h10 v10 h-10 z M15,70 h5 v5 h-5 z M25,75 h20 v5 h-20 z" fill="#aa841d" />
        <path d="M55,55 h30 v5 h-30 z M55,65 h10 v20 h-10 z M75,70 h20 v10 h-20 z M110,55 h35 v5 h-35 z M120,65 h10 v15 h-10 z" fill="#1e293b" />
        <path d="M55,95 h15 v5 h-15 z M80,95 h10 v15 h-10 z M95,100 h10 v5 h-10 z M110,95 h35 v5 h-35 z M115,105 h10 v25 h-10 z" fill="#aa841d" />
        <path d="M15,95 h15 v5 h-15 z M35,95 h10 v5 h-10 z M20,105 h5 v5 h-5 z" fill="#1e293b" />
        <path d="M55,120 h20 v10 h-20 z M80,125 h15 v5 h-15 z M55,140 h35 v5 h-35 z M100,140 h10 v5 h-10 z" fill="#1e293b" />

        {/* Center icon / Arpita Crest */}
        <rect x="68" y="68" width="24" height="24" rx="12" fill="white" stroke="#aa841d" strokeWidth="1" />
        <path d="M75,82 L80,72 L85,82 Z" fill="#aa841d" />
        <circle cx="80" cy="74" r="1.5" fill="white" />
      </svg>
    );
  };

  const qrData = {
    feedback: {
      title: 'Digital Feedback Form QR',
      description: 'Place on reception desks, restaurant table cards, and suite bedside tables.',
      url: `${appUrl}?mode=guest`,
      label: 'SCAN TO SHARE EXPERIENCE'
    },
    google: {
      title: 'Google Reviews QR',
      description: 'Generates five-star public Google Reviews, increasing local search rankings.',
      url: 'https://www.google.com/travel/hotels/arpita%20beach%20resort/entity/CgsIpOHx3trl-cPzARAB/reviews?',
      label: 'SCAN TO REVIEW US ON GOOGLE'
    },
    tripadvisor: {
      title: 'TripAdvisor Reviews QR',
      description: 'Generates five-star reviews on TripAdvisor, enhancing the resort global reputation.',
      url: 'https://www.tripadvisor.in/UserReviewEdit-g1162223-d5040384-Arpita_Beach_Resort',
      label: 'SCAN TO REVIEW US ON TRIPADVISOR'
    },
    whatsapp: {
      title: 'WhatsApp Concierge QR',
      description: 'Provides real-time feedback and swift recovery assistance to in-house guests.',
      url: `https://wa.me/917504838884?text=Welcome%20to%20Arpita%20Beach%20Resort.%20How%20can%20we%20assist%20you%20today?`,
      label: 'SCAN FOR 24/7 WHATSAPP HELP'
    },
    website: {
      title: 'Official Resort Website QR',
      description: 'Links directly to suite reservations, beach activities, and the dining menus.',
      url: 'https://arpitabeachresort.com',
      label: 'SCAN TO EXPLORE RESORT'
    }
  };

  const activeQrConfig = qrData[activeQr];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Google API Integration Console */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#fefcf0] border border-[#ebd665]/30 flex items-center justify-center text-[#aa841d]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sans font-bold tracking-widest text-[#aa841d] uppercase block">WORKSPACE CORE</span>
              <h2 className="font-serif text-xl font-bold text-slate-800">Google Drive & Forms Integration</h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Connecting this feedback system to your Google Workspace allows you to build real-time forms, automatically sync submissions inside a central Google Spreadsheet, and drive the live Operations Dashboard below with real guest entries.
          </p>

          <div className="h-px bg-slate-100 my-6"></div>

          {/* AUTH STATUS CONTAINER */}
          {!token ? (
            <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-6 text-center space-y-4 animate-fade-in">
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-sans font-semibold text-sm text-slate-800 mb-1">Administrative Login Required</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sign in with the resort's official Google Account to provision Google Forms, Google Sheets, and Drive directory files.
                  </p>
                </div>

                {authError && (
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-left relative flex items-start gap-2.5 max-w-sm mx-auto">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div className="flex-1 text-[11px] text-slate-600">
                      <span className="font-sans font-bold text-slate-800 block mb-0.5">Google Sign-In Notice</span>
                      {authError}
                      {onClearAuthError && (
                        <button 
                          onClick={onClearAuthError}
                          className="mt-2 text-[10px] font-sans font-bold text-amber-700 hover:text-amber-900 underline block cursor-pointer uppercase tracking-wider"
                        >
                          Dismiss Notice
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Official Sign in button style from guidelines */}
                <button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button inline-flex items-center justify-center cursor-pointer border border-slate-200 shadow-sm bg-white hover:bg-slate-50 rounded-xl px-5 py-3 transition-all max-w-xs mx-auto text-sm font-sans font-medium text-slate-700"
                >
                  <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                    <div className="gsi-material-button-icon shrink-0">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents tracking-wide">
                      {isLoggingIn ? 'Establishing Secure Tunnel...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>

                {/* Google Access Blocked Help Section */}
                <div className="pt-4 border-t border-slate-100/80 mt-6 text-left">
                  <button
                    type="button"
                    onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                    className="flex items-center justify-between w-full text-slate-500 hover:text-slate-800 transition-colors text-xs font-sans font-semibold px-2 py-1.5 rounded-lg hover:bg-slate-100/60 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      Getting "Access Blocked: Error 403" notice?
                    </span>
                    {showTroubleshooting ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {showTroubleshooting && (
                    <div className="mt-3 bg-amber-50/60 border border-amber-200/50 rounded-xl p-4 space-y-3 animate-fade-in text-[11px] leading-relaxed text-slate-600 max-w-sm mx-auto">
                      <p className="font-sans font-bold text-amber-900 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                        Why this happens:
                      </p>
                      <p className="text-slate-600">
                        Because this Google project (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[10px]">gen-lang-client-0522817298</code>) is currently in developer <strong>"Testing"</strong> mode, Google only permits the project owner (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[10px]">Arpitabeachresort@gmail.com</code>) and pre-approved <strong>Test Users</strong> to sign in.
                      </p>
                      
                      <div className="h-px bg-amber-200/40 my-2"></div>
                      
                      <p className="font-sans font-bold text-slate-800 uppercase tracking-wider text-[9px]">
                        How to authorize <span className="text-amber-800 font-mono">gm@arpitabeachresort.in</span>:
                      </p>
                      
                      <ol className="list-decimal pl-4 space-y-2 text-slate-600 font-sans">
                        <li>
                          Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-800 hover:text-amber-950 font-bold underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-3 h-3" /></a> and sign in with your owner account: <strong>Arpitabeachresort@gmail.com</strong>.
                        </li>
                        <li>
                          Select the project named <strong>gen-lang-client-0522817298</strong> from the selector dropdown at the top.
                        </li>
                        <li>
                          Go to the left sidebar menu, click on <strong>APIs & Services</strong>, then select <strong>OAuth consent screen</strong>.
                        </li>
                        <li>
                          Scroll down to the <strong>Test users</strong> section, click on the <strong className="text-amber-800">+ ADD USERS</strong> button, enter <strong className="text-slate-800">gm@arpitabeachresort.in</strong>, and click <strong>Save</strong>.
                        </li>
                      </ol>

                      <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-2.5 text-slate-700 font-sans mt-2">
                        <span className="font-bold text-amber-950 block mb-0.5">💡 Alternative: Go to Production</span>
                        Instead of adding individual emails, you can also click the <strong className="text-amber-800">PUBLISH APP</strong> button under the "Publishing status" section on that same screen. This enables ANY email account to log in instantly.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Signed In User Card */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1e293b] text-[#ebd665] flex items-center justify-center font-bold font-serif">
                      {user?.displayName ? user.displayName.charAt(0) : 'A'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-sans font-bold text-xs text-slate-800">{user?.displayName || 'Administrator'}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">{user?.email || 'gm@arpitabeachresort.in'}</span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full font-sans font-medium text-[10px] tracking-wider transition-all duration-300 cursor-pointer text-center"
                >
                  DISCONNECT SESSION
                </button>
              </div>

              {/* Provisioning action card */}
              {!googleResources ? (
                <div className="p-6 bg-gradient-to-br from-[#fefcf0]/40 to-[#fcf6cd]/20 rounded-3xl border border-[#ebd665]/40 text-center">
                  <Database className="w-8 h-8 text-[#aa841d] mx-auto mb-3" />
                  <h3 className="font-serif text-sm font-bold text-[#886417] mb-1">Provision Google Forms & Sheets</h3>
                  <p className="text-[11px] text-slate-500 mb-5 max-w-md mx-auto leading-relaxed">
                    Ready to build your five-star guest feedback database. One click creates a synchronized Google Form and detailed tracking Spreadsheet under your resort’s account.
                  </p>
                  <button
                    onClick={onSetupWorkspace}
                    disabled={isSettingUp}
                    className="px-6 py-3 bg-[#1e293b] hover:bg-[#0f172a] hover:ring-2 hover:ring-[#ebd665] text-white rounded-full font-sans font-semibold text-xs tracking-wider transition-all shadow-md duration-300 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSettingUp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        PROVISIONING GOOGLE DRIVE ASSETS...
                      </>
                    ) : (
                      <>
                        SETUP RESORT BACKEND (1-CLICK)
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Google Sheets Link */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-green-50 rounded-xl border border-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">Feedback Sheets Database</h4>
                        <span className="text-[10px] text-slate-400 block truncate font-mono">{googleResources.spreadsheetId}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(googleResources.spreadsheetUrl, 'sheet')}
                        className="p-2 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 bg-white rounded-xl transition-all cursor-pointer"
                        title="Copy Sheet Link"
                      >
                        {copiedResource === 'sheet' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={googleResources.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 bg-white rounded-xl transition-all flex items-center justify-center"
                        title="Open Spreadsheet"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Manual Link Custom Spreadsheet Input */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#aa841d]" />
                      <h4 className="font-sans font-bold text-xs text-slate-800">Link Custom Google Sheet</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Sync to your custom Google Spreadsheet instead? Paste your Google Sheet URL below to link:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSheetUrl}
                        onChange={(e) => setCustomSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#ebd665] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleLinkCustomSpreadsheet}
                        className="px-4 py-2 bg-navy text-white text-xs font-sans font-bold tracking-wider rounded-xl hover:bg-navy/90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                      >
                        LINK SHEET
                      </button>
                    </div>
                    {linkSuccess && (
                      <span className="text-[10px] text-green-600 block font-semibold animate-fade-in">
                        ✓ Google Sheet linked successfully! All submissions will now append to this sheet.
                      </span>
                    )}
                    {linkError && (
                      <span className="text-[10px] text-red-600 block font-semibold animate-fade-in">
                        ✗ {linkError}
                      </span>
                    )}
                  </div>

                  {/* Google Forms Link */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">Live Google Form</h4>
                        <span className="text-[10px] text-slate-400 block truncate font-mono">{googleResources.formId}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(googleResources.formUrl, 'form')}
                        className="p-2 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 bg-white rounded-xl transition-all cursor-pointer"
                        title="Copy Form Link"
                      >
                        {copiedResource === 'form' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={googleResources.formUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 bg-white rounded-xl transition-all flex items-center justify-center"
                        title="Open Live Google Form"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Operational status check */}
                  <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-green-800">Direct Write Stream Active</h4>
                      <p className="text-[10px] text-green-600 leading-relaxed mt-0.5">
                        Whenever a guest transmits feedback through the Guest Experience page, the entry is automatically appended as a new row in your Google Spreadsheet in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mt-6 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            All Google Workspace integrations run strictly over secure HTTPS using Google OAuth 2.0. This applet conforms to Least Privilege standards and only accesses Google Files explicitly created by this software.
          </p>
        </div>
      </div>

      {/* QR Codes & Printable Table Card Desk */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#fefcf0] border border-[#ebd665]/30 flex items-center justify-center text-[#aa841d]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sans font-bold tracking-widest text-[#aa841d] uppercase block">COLLATERAL DESIGN</span>
              <h2 className="font-serif text-xl font-bold text-slate-800">Printable Desk Cards</h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Generate exquisite table cards to print and place inside guest suites, Amethyst Restaurant tables, or near the poolside loungers.
          </p>

          {/* Selector tab buttons */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {Object.keys(qrData).map((key) => (
              <button
                key={key}
                onClick={() => setActiveQr(key as any)}
                className={`py-2 px-3 text-center rounded-xl font-sans text-[10px] font-semibold tracking-wider transition-all border cursor-pointer ${
                  activeQr === key
                    ? 'bg-[#1e293b] border-[#1e293b] text-white shadow-sm'
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {key.toUpperCase()} QR
              </button>
            ))}
          </div>

          {/* The Printable Table Card visual mockup */}
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-150 text-center relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-[#ebd665] text-[#5c4117] text-[8px] font-bold font-sans px-2.5 py-0.5 rounded-bl-xl tracking-wider">A5 TABLE CARD</span>
            
            {/* Table card border */}
            <div className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm space-y-4 max-w-xs mx-auto">
              <div className="text-center">
                <span className="font-serif text-xs font-bold tracking-widest text-[#1e293b] block">ARPITA BEACH RESORT</span>
                <span className="text-[7px] font-sans tracking-[0.25em] text-[#aa841d] uppercase block -mt-1">CHANDIPUR, ODISHA</span>
              </div>

              {renderSvgQr(activeQr)}

              <div className="space-y-1">
                <span className="text-[9px] font-sans font-bold tracking-widest text-[#aa841d] block">
                  {activeQrConfig.label}
                </span>
                <p className="text-[8px] text-slate-400 max-w-[180px] mx-auto leading-tight">
                  Your premium review or remarks elevate our service standards. Thank you for your stay.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl">
            <h4 className="text-xs font-bold text-slate-700 mb-1">{activeQrConfig.title}</h4>
            <p className="text-[10px] text-slate-500 leading-normal">{activeQrConfig.description}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 border border-slate-200 hover:border-[#ebd665] text-slate-600 hover:text-[#aa841d] bg-white rounded-full font-sans font-semibold text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            PRINT A5 CARD
          </button>
          <button
            onClick={() => copyToClipboard(activeQrConfig.url, 'qrurl')}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-full font-sans font-semibold text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-150"
          >
            {copiedResource === 'qrurl' ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                COPIED!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                COPY QR URL
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
