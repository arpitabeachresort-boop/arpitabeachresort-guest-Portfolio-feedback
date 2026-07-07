import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  LineChart, 
  Database, 
  Compass, 
  HelpCircle, 
  Activity, 
  Settings, 
  BookOpen, 
  AlertTriangle,
  UserCheck,
  Lock,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { 
  initAuth, 
  googleSignIn, 
  logout as googleLogout, 
  createSpreadsheetAndForm, 
  appendFeedbackToGoogleSheet, 
  fetchFeedbackFromGoogleSheet,
  sendManagerAlertEmail,
  GoogleResources 
} from './lib/workspace';
import GuestForm from './components/GuestForm';
import Dashboard from './components/Dashboard';
import WorkspaceConfig from './components/WorkspaceConfig';
import OceanWaveBackground from './components/OceanWaveBackground';
import { FeedbackSubmission, InternalTicket } from './types';
import { MOCK_FEEDBACKS, MOCK_TICKETS } from './lib/mockData';

export default function App() {
  const [viewMode, setViewMode] = useState<'GUEST' | 'STAFF'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'guest') return 'GUEST';
      if (params.get('mode') === 'staff') return 'STAFF';
    }
    return 'GUEST';
  });
  const theme = 'light';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('arpita_theme', 'light');
  }, []);

  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('arpita_google_token') : null;
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAdmin = !!(user && (
    user.email === 'gm@arpitabeachresort.in' || 
    user.email === 'Arpitabeachresort@gmail.com' || 
    user.email?.toLowerCase().includes('arpitabeachresort')
  ));

  // Google Resources Sheet & Form Config
  const [googleResources, setGoogleResources] = useState<GoogleResources | null>(() => {
    const saved = localStorage.getItem('arpita_google_resources');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.spreadsheetId) {
          parsed.spreadsheetId = '1yF_3pFOs5jVJHO4UxskiA8BPDUZvvzMdeRDAKx4jAsk';
          parsed.spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1yF_3pFOs5jVJHO4UxskiA8BPDUZvvzMdeRDAKx4jAsk/edit?gid=1912726066#gid=1912726066';
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return {
      spreadsheetId: '1yF_3pFOs5jVJHO4UxskiA8BPDUZvvzMdeRDAKx4jAsk',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1yF_3pFOs5jVJHO4UxskiA8BPDUZvvzMdeRDAKx4jAsk/edit?gid=1912726066#gid=1912726066',
      formId: '',
      formUrl: ''
    };
  });

  // Master Feedback Data (pre-seeded + client overrides)
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>(() => {
    const saved = localStorage.getItem('arpita_submissions');
    return saved ? JSON.parse(saved) : MOCK_FEEDBACKS;
  });

  // Operational Tickets (pre-seeded + client overrides)
  const [tickets, setTickets] = useState<InternalTicket[]>(() => {
    const saved = localStorage.getItem('arpita_tickets');
    return saved ? JSON.parse(saved) : MOCK_TICKETS;
  });

  // Pending offline submissions that need to sync with Google Sheet
  const [unsyncedSubmissions, setUnsyncedSubmissions] = useState<FeedbackSubmission[]>(() => {
    const saved = localStorage.getItem('arpita_unsynced_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  // Track isSubmitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save states to local storage for persistence across hot reloads
  useEffect(() => {
    localStorage.setItem('arpita_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('arpita_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('arpita_unsynced_submissions', JSON.stringify(unsyncedSubmissions));
  }, [unsyncedSubmissions]);

  useEffect(() => {
    if (googleResources) {
      localStorage.setItem('arpita_google_resources', JSON.stringify(googleResources));
    } else {
      localStorage.removeItem('arpita_google_resources');
    }
  }, [googleResources]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('arpita_google_token', token);
    } else {
      localStorage.removeItem('arpita_google_token');
    }
  }, [token]);

  // Auth initialization
  useEffect(() => {
    initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'guest') {
          setViewMode('GUEST');
        } else if (currentUser?.email === 'gm@arpitabeachresort.in' || currentUser?.email === 'Arpitabeachresort@gmail.com' || currentUser?.email?.toLowerCase().includes('arpitabeachresort')) {
          setViewMode('STAFF');
        }
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
  }, []);

  // Fetch feedback from Google Spreadsheet
  const syncFromGoogleSheet = useCallback(async (accessToken: string, spreadsheetId: string, silent: boolean = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const sheetFeedbacks = await fetchFeedbackFromGoogleSheet(accessToken, spreadsheetId);
      if (sheetFeedbacks.length > 0) {
        setSubmissions(prev => {
          // Merge based on feedback ID, favoring newly fetched sheet items
          const merged = [...prev];
          sheetFeedbacks.forEach(sheetItem => {
            const idx = merged.findIndex(m => m.id === sheetItem.id);
            if (idx >= 0) {
              merged[idx] = sheetItem;
            } else {
              merged.unshift(sheetItem);
            }
          });
          return merged;
        });
      }
    } catch (error: any) {
      const errMsg = error?.message || '';
      const isAuthError = errMsg.includes('401') || errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('invalid credentials');
      
      if (isAuthError) {
        console.warn('Google Access Token has expired or is invalid. Resetting authentication state.');
        setToken(null);
        localStorage.removeItem('arpita_google_token');
        setAuthError('Your administrative session has expired. Please sign in again to keep syncing with Google Sheets.');
        try {
          await googleLogout();
          setUser(null);
        } catch (e) {
          console.warn('Failed to clean up auth on token expiration:', e);
        }
      } else {
        console.warn('Error synchronizing from Google Sheet (possibly offline or temporary):', error);
      }
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, []);

  // Background offline feedback auto-synchronizer
  const syncPendingSubmissions = useCallback(async () => {
    // Only proceed if browser has active connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    if (!token || !googleResources?.spreadsheetId) {
      return;
    }

    const savedPending = localStorage.getItem('arpita_unsynced_submissions');
    const pending: FeedbackSubmission[] = savedPending ? JSON.parse(savedPending) : [];
    if (pending.length === 0) return;

    console.log(`Resort Wi-Fi connectivity stable. Synchronizing ${pending.length} pending offline feedbacks...`);
    
    let successCount = 0;
    const remaining: FeedbackSubmission[] = [];

    for (const sub of pending) {
      try {
        await appendFeedbackToGoogleSheet(token, googleResources.spreadsheetId, sub);
        
        // Push email notification if rating meets "Needs Improvement" (1, 2, or 3 stars)
        const ratingsArray = Object.values(sub.ratings);
        const hasNeedsImprovement = ratingsArray.some(r => r <= 3);
        if (hasNeedsImprovement) {
          try {
            await sendManagerAlertEmail(token, 'arpitabeachresort@gmail.com', sub);
          } catch (e) {
            console.error('Failed to send manager alert for synced item:', e);
          }
        }

        successCount++;
        // Update local submissions list synced state
        setSubmissions(prev => 
          prev.map(item => item.id === sub.id ? { ...item, synced: true } : item)
        );
      } catch (err) {
        console.warn(`Retry failed for submission ${sub.id}:`, err);
        remaining.push(sub);
      }
    }

    setUnsyncedSubmissions(remaining);
    localStorage.setItem('arpita_unsynced_submissions', JSON.stringify(remaining));

    if (successCount > 0) {
      console.log(`Automatically synchronized ${successCount} cached offline submissions to Google Sheets.`);
    }
  }, [token, googleResources]);

  // Trigger Real-time Sheet Sync and polling if logged in and spreadsheet configured
  useEffect(() => {
    if (token && googleResources?.spreadsheetId) {
      // Immediate full sync
      syncFromGoogleSheet(token, googleResources.spreadsheetId, false);

      // Periodic silent sync (every 10 seconds)
      const pollInterval = setInterval(() => {
        syncFromGoogleSheet(token, googleResources.spreadsheetId, true);
      }, 10000);

      return () => clearInterval(pollInterval);
    }
  }, [token, googleResources?.spreadsheetId, syncFromGoogleSheet]);

  // Periodic automatic sync checker for cached offline data
  useEffect(() => {
    if (unsyncedSubmissions.length > 0 && token && googleResources?.spreadsheetId) {
      // Immediate sync attempt
      syncPendingSubmissions();

      const interval = setInterval(() => {
        syncPendingSubmissions();
      }, 12000);

      return () => clearInterval(interval);
    }
  }, [unsyncedSubmissions.length, token, googleResources, syncPendingSubmissions]);

  // Listen to browser online reconnection events
  useEffect(() => {
    const handleReconnected = () => {
      if (token && googleResources?.spreadsheetId) {
        syncPendingSubmissions();
      }
    };
    window.addEventListener('online', handleReconnected);
    return () => window.removeEventListener('online', handleReconnected);
  }, [token, googleResources, syncPendingSubmissions]);

  // Login handler
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        if (result.user.email === 'gm@arpitabeachresort.in' || result.user.email === 'Arpitabeachresort@gmail.com' || result.user.email?.toLowerCase().includes('arpitabeachresort')) {
          setViewMode('STAFF');
        }
      }
    } catch (err: any) {
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user' || 
                            err?.message?.includes('auth/popup-closed-by-user');
      if (isPopupClosed) {
        console.warn('Google Auth Login popup closed by user or blocked by browser.');
        setAuthError('The Google Sign-In popup was closed or blocked. If you are inside the embedded preview iframe, please enable popups or open the application in a new tab using the "Open in new tab" icon at the top right of your screen.');
      } else {
        console.error('Google Auth Login Failed:', err);
        setAuthError(err?.message || 'An unexpected authentication error occurred.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setGoogleResources({
      spreadsheetId: '1yF_3pFOs5jVJHO4UxskiA8BPDUZvvzMdeRDAKx4jAsk',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1yF_3pFOs5jVJHO4UxskiA8BPDUZvvzMdeRDAKx4jAsk/edit?gid=1912726066#gid=1912726066',
      formId: '',
      formUrl: ''
    });
  };

  // Link a custom spreadsheet manually
  const handleLinkSpreadsheet = (spreadsheetId: string, url: string) => {
    const updated = {
      spreadsheetId,
      spreadsheetUrl: url,
      formId: googleResources?.formId || '',
      formUrl: googleResources?.formUrl || ''
    };
    setGoogleResources(updated);
    localStorage.setItem('arpita_google_resources', JSON.stringify(updated));
  };

  // Setup Workspace Sheet & Form
  const handleSetupWorkspace = async () => {
    if (!token) return;
    setIsSettingUp(true);
    try {
      const resources = await createSpreadsheetAndForm(token, 'Arpita Beach Resort');
      setGoogleResources(resources);
    } catch (error: any) {
      alert(`Setup Workspace failed: ${error.message || error}`);
    } finally {
      setIsSettingUp(false);
    }
  };

  // Handle guest feedback submission with unstable connection support
  const handleGuestSubmit = async (submission: FeedbackSubmission): Promise<{ success: boolean; offline: boolean }> => {
    setIsSubmitting(true);
    let offline = false;

    // Check internet connectivity
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    try {
      if (!isOnline) {
        throw new Error('Device is offline');
      }

      // 1. Write to Google Sheet if Workspace link is active
      if (token && googleResources?.spreadsheetId) {
        await appendFeedbackToGoogleSheet(token, googleResources.spreadsheetId, submission);
      }
    } catch (error) {
      console.warn('Network instability or offline state detected. Storing feedback offline...', error);
      offline = true;
    }

    try {
      const augmentedSubmission = { ...submission, synced: !offline };

      // 2. Add to local React states immediately
      setSubmissions(prev => [augmentedSubmission, ...prev]);

      if (offline) {
        // Cache submission in pending sync queue
        setUnsyncedSubmissions(prev => {
          const updated = [...prev, augmentedSubmission];
          localStorage.setItem('arpita_unsynced_submissions', JSON.stringify(updated));
          return updated;
        });
      } else {
        // 3. Trigger email notification to manager's inbox (arpitabeachresort@gmail.com) if rating needs improvement (1, 2 or 3 stars)
        const ratingsArray = Object.values(submission.ratings);
        const hasNeedsImprovement = ratingsArray.some(r => r <= 3);
        if (hasNeedsImprovement && token) {
          sendManagerAlertEmail(token, 'arpitabeachresort@gmail.com', submission)
            .then(success => {
              if (success) {
                console.log('Manager email notification sent successfully.');
              } else {
                console.warn('Failed to send manager email notification.');
              }
            })
            .catch(err => {
              console.error('Error sending email notification:', err);
            });
        }
      }

      // If average rating is extremely low, auto-generate an operational ticket
      const ratingsVal = Object.values(submission.ratings);
      const avg = ratingsVal.length > 0 ? ratingsVal.reduce((a, b) => a + b, 0) / ratingsVal.length : 5;
      if (avg <= 3.0 || submission.requiresRecovery) {
        const newTicket: InternalTicket = {
          id: `TK-${Math.floor(100 + Math.random() * 900)}`,
          feedbackId: submission.id,
          department: submission.guestInfo.department,
          issueCategory: submission.complaintCategory || 'Service Glitch',
          priorityLevel: avg <= 2.0 ? 'VIP' : 'High',
          assignedTo: 'Guest Relations Duty Associate',
          rootCause: 'Low rating recorded. Review pending interview with guest.',
          correctiveAction: 'Generate immediate phone call or room visit callback.',
          completionDate: new Date(Date.now() + 24 * 3600000).toISOString().split('T')[0], // 1 day target
          managerSignature: '',
          closedBy: '',
          followUpRequired: true
        };
        setTickets(prev => [newTicket, ...prev]);
      }

      return { success: true, offline };
    } catch (error) {
      console.error('Submission processing failed:', error);
      // Fallback
      setSubmissions(prev => [submission, ...prev]);
      return { success: true, offline: true };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add operational ticket manually
  const handleAddTicket = (newTicket: InternalTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    // Also update associated feedback recovery status
    setSubmissions(prev => {
      return prev.map(sub => {
        if (sub.id === newTicket.feedbackId) {
          return { ...sub, recoveryStatus: 'In Progress' };
        }
        return sub;
      });
    });
  };

  // Update operational ticket (e.g. close signature)
  const handleUpdateTicket = (updatedTicket: InternalTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    
    // Also mark feedback as resolved if signed off
    if (updatedTicket.managerSignature !== '') {
      setSubmissions(prev => {
        return prev.map(sub => {
          if (sub.id === updatedTicket.feedbackId) {
            return { ...sub, recoveryStatus: 'Resolved' };
          }
          return sub;
        });
      });
    }
  };

  // Force sheet sync
  const handleForceRefresh = async () => {
    if (token && googleResources?.spreadsheetId) {
      await syncFromGoogleSheet(token, googleResources.spreadsheetId);
    } else {
      // Just simulate refresh with minor delay
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const appUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-marble text-navy dark:text-slate-100 font-sans flex flex-col justify-between transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Ocean Wave Backdrop */}
      <OceanWaveBackground />

      {/* GLOBAL HUD SELECTOR HEADER */}
      <header className="bg-navy text-white py-4 px-6 sticky top-0 z-40 shadow-md border-b border-gold/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-gold font-display text-base sm:text-lg font-bold tracking-widest">ARPITA BEACH RESORT</div>
            <div className="h-4 w-px bg-gold/30 hidden md:block"></div>
            <span className="text-[9px] text-slate-300 tracking-[0.25em] font-sans font-semibold uppercase hidden md:block">Complain & Feedback</span>
          </div>

          {/* Header Controls: Switcher & Theme */}
          <div className="flex items-center gap-3">
            {/* Nav switcher */}
            <div className="flex items-center gap-1 bg-[#121e35] p-1.5 rounded-full border border-gold/20">
              <button
                onClick={() => setViewMode('GUEST')}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === 'GUEST'
                    ? 'bg-gold text-white shadow-sm'
                    : 'text-slate-300 hover:text-gold'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                GUEST MODE
              </button>
              <button
                onClick={() => setViewMode('STAFF')}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === 'STAFF'
                    ? 'bg-gold text-white shadow-sm'
                    : 'text-slate-300 hover:text-gold'
                }`}
              >
                {isAdmin ? (
                  <LineChart className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-gold animate-pulse" />
                )}
                OPERATIONS HUB
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN APPLICATION CONTAINER */}
      <main className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full">
        {viewMode === 'GUEST' ? (
          /* GUEST MODE: Beautiful tablet feedback view */
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <GuestForm 
              onSubmit={handleGuestSubmit}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        ) : (
          /* STAFF MODE: Secure check */
          !isAdmin ? (
            /* Secure Access Lock Screen / Login prompt */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl border border-slate-150 shadow-xl overflow-hidden">
                {/* Visual Header */}
                <div className="bg-navy p-8 text-center border-b border-gold/30 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(170,132,29,0.15),transparent_70%)] pointer-events-none" />
                  <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4 text-gold">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-white tracking-wide uppercase">Administrative Clearance Required</h2>
                  <p className="text-xs text-gold font-sans font-bold tracking-widest mt-1 uppercase">Operations Hub Protection</p>
                </div>

                {/* Body Content */}
                <div className="p-8 space-y-6">
                  <p className="text-sm text-slate-600 text-center leading-relaxed max-w-md mx-auto">
                    The Operations Hub is highly restricted and contains active real-time guest feedback scores, sheet connection settings, and operational recovery actions.
                  </p>

                  <div className="h-px bg-slate-100" />

                  {/* Auth Panel */}
                  {!user ? (
                    <div className="text-center space-y-4">
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Please sign in with the resort's official Google Account to authenticate your credentials.
                      </p>

                      {authError && (
                        <div className="bg-red-50/70 border border-red-200/60 rounded-2xl p-4 text-left relative flex items-start gap-3 max-w-md mx-auto animate-fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                          <div className="flex-1 text-xs text-slate-600">
                            <span className="font-sans font-bold text-slate-800 block mb-0.5">Authentication Error</span>
                            {authError}
                            <button 
                              onClick={() => setAuthError(null)}
                              className="mt-2 text-[10px] font-sans font-bold text-red-700 hover:text-red-900 underline block cursor-pointer uppercase tracking-wider"
                            >
                              Clear Notice
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="gsi-material-button inline-flex items-center justify-center cursor-pointer border border-slate-200 shadow-md bg-white hover:bg-slate-50 rounded-2xl px-6 py-3.5 transition-all max-w-xs mx-auto text-sm font-sans font-semibold text-slate-700 active:scale-98"
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
                            {isLoggingIn ? 'Authenticating Admin...' : 'Sign in with Google'}
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    /* User is logged in but is NOT an authorized administrator */
                    <div className="space-y-5 text-center animate-fade-in max-w-md mx-auto">
                      <div className="bg-red-50 border border-red-200/60 rounded-2xl p-5 text-left flex items-start gap-3.5">
                        <ShieldAlert className="w-6 h-6 shrink-0 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-sans font-bold text-sm text-red-900">Access Denied: Unauthorized Account</h4>
                          <p className="text-xs text-red-700/85 leading-relaxed mt-1">
                            You successfully signed in as <strong className="font-mono text-red-950 font-medium text-[11px]">{user.email}</strong>, but this account does not possess administrative clearance.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-slate-500 text-left text-xs space-y-1.5 animate-pulse">
                        <span className="font-sans font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Authorized Accounts:</span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          <li><strong>Arpitabeachresort@gmail.com</strong></li>
                          <li><strong>gm@arpitabeachresort.in</strong></li>
                          <li>Any corporate resort email containing <span className="font-mono text-[10.5px]">arpitabeachresort</span></li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-sans font-bold text-xs tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        SIGN OUT & TRY DIFFERENT ACCOUNT
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-gold" /> AES-256 SSL Encrypted</span>
                    <span>Arpita Security Protocols</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* STAFF MODE: Multi-tab management panel */
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Subsection 1: Google Sync and QR Cards controller */}
              <WorkspaceConfig
                user={user}
                token={token}
                onLogin={handleLogin}
                onLogout={handleLogout}
                isLoggingIn={isLoggingIn}
                googleResources={googleResources}
                onSetupWorkspace={handleSetupWorkspace}
                isSettingUp={isSettingUp}
                appUrl={appUrl}
                authError={authError}
                onClearAuthError={() => setAuthError(null)}
                onLinkSpreadsheet={handleLinkSpreadsheet}
              />

              {/* Subsection 2: Operational charts, guest feed logs, and tickets database */}
              <Dashboard
                submissions={submissions}
                tickets={tickets}
                onUpdateTicket={handleUpdateTicket}
                onAddTicket={handleAddTicket}
                isSyncing={isSyncing}
                onRefresh={handleForceRefresh}
                hasGoogleSync={!!(token && googleResources?.spreadsheetId)}
              />
            </motion.div>
          )
        )}
      </main>

      {/* LUXURY RESORT BRAND FOOTER */}
      <footer className="bg-white/80 dark:bg-[#0B132B]/80 backdrop-blur-sm border-t border-gold/15 dark:border-gold/30 py-6 px-4 transition-colors duration-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h4 className="font-display text-sm font-bold tracking-wider text-navy dark:text-gold">Arpita Beach Resort</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed italic font-serif">
              Sonapur Road, Near Chandipur Sea Beach, Chandipur, Balasore, Odisha, India. Inspired by world-class five-star luxury standards and Indian signature hospitality.
            </p>
          </div>
          <div className="text-center md:text-right space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">gm@arpitabeachresort.in | +91 7504838884</span>
            <span className="text-[9px] text-gold dark:text-gold-star tracking-widest font-sans font-bold uppercase block">ATITHI DEVO BHAVA • THE ESSENCE OF INDIAN COASTAL LUXURY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
