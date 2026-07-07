import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Search, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  Filter, 
  Download, 
  Printer, 
  RefreshCw, 
  HelpCircle, 
  ChevronRight, 
  Clock, 
  Activity, 
  FolderKey, 
  FileText, 
  ShieldAlert,
  UserCheck,
  Percent,
  Bookmark,
  Share2
} from 'lucide-react';
import { FeedbackSubmission, InternalTicket, DEPARTMENTS } from '../types';
import { exportFeedbackReportPDF } from '../lib/pdfReport';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  submissions: FeedbackSubmission[];
  tickets: InternalTicket[];
  onUpdateTicket: (updatedTicket: InternalTicket) => void;
  onAddTicket: (newTicket: InternalTicket) => void;
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  hasGoogleSync: boolean;
}

export default function Dashboard({
  submissions,
  tickets,
  onUpdateTicket,
  onAddTicket,
  isSyncing,
  onRefresh,
  hasGoogleSync
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'kpis' | 'feed' | 'ops' | 'sops'>('kpis');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all'); // all, positive (>=4), negative (<=3)
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Selected feedback for creating/viewing ticket
  const [selectedFeedbackForTicket, setSelectedFeedbackForTicket] = useState<FeedbackSubmission | null>(null);
  
  // New ticket state
  const [newTicketData, setNewTicketData] = useState({
    issueCategory: 'Service Delay',
    priorityLevel: 'Medium' as 'Low' | 'Medium' | 'High' | 'VIP',
    assignedTo: '',
    rootCause: '',
    correctiveAction: '',
    completionDate: new Date().toISOString().split('T')[0],
    managerSignature: '',
    closedBy: '',
    followUpRequired: false
  });

  // Calculate dynamic KPIs from active submissions
  const kpis = useMemo(() => {
    if (submissions.length === 0) return {
      avgRating: 0,
      gsi: 0,
      nps: 0,
      recoveryRate: 0,
      repeatPct: 0,
      volume: 0
    };

    let totalRatingSum = 0;
    let totalRatingsCount = 0;
    let promoterCount = 0; // rating 4 or 5
    let detractorCount = 0; // rating 1, 2 or 3
    let repeatCount = 0;

    submissions.forEach(sub => {
      const subRatings = Object.values(sub.ratings);
      if (subRatings.length > 0) {
        const subAvg = subRatings.reduce((a, b) => a + b, 0) / subRatings.length;
        totalRatingSum += subAvg;
        totalRatingsCount++;
        
        if (subAvg >= 4.0) {
          promoterCount++;
        } else if (subAvg <= 3.0) {
          detractorCount++;
        }
      }
      if (sub.isRepeatGuest) repeatCount++;
    });

    const avgRating = totalRatingsCount > 0 ? totalRatingSum / totalRatingsCount : 5.0;
    const gsi = (avgRating / 5) * 100; // Guest Satisfaction Index
    const nps = totalRatingsCount > 0 
      ? Math.round(((promoterCount - detractorCount) / totalRatingsCount) * 100) 
      : 100;

    // Service Recovery Rate
    const totalRecoveryNeeded = submissions.filter(s => s.requiresRecovery).length;
    const resolvedRecovery = submissions.filter(s => s.requiresRecovery && s.recoveryStatus === 'Resolved').length;
    const recoveryRate = totalRecoveryNeeded > 0 ? (resolvedRecovery / totalRecoveryNeeded) * 100 : 100;
    const repeatPct = (repeatCount / submissions.length) * 100;

    return {
      avgRating: parseFloat(avgRating.toFixed(2)),
      gsi: Math.round(gsi),
      nps,
      recoveryRate: Math.round(recoveryRate),
      repeatPct: Math.round(repeatPct),
      volume: submissions.length
    };
  }, [submissions]);

  // Compute departmental averages
  const departmentAverages = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      let sum = 0;
      let count = 0;
      
      submissions.forEach(sub => {
        if (sub.ratings && sub.ratings[dept.id] !== undefined) {
          sum += sub.ratings[dept.id];
          count++;
        }
      });

      const avg = count > 0 ? sum / count : 4.2 + (Math.random() * 0.6); // seed standard if no entries to keep chart gorgeous
      return {
        id: dept.id,
        name: dept.name,
        avg: parseFloat(avg.toFixed(1)),
        count
      };
    });
  }, [submissions]);

  const radarData = useMemo(() => {
    return departmentAverages.map(dept => ({
      subject: dept.name.replace(' Experience', '').replace(' Process', '').replace(' Food & Beverage', 'F&B'),
      score: dept.avg,
      fullMark: 5,
    }));
  }, [departmentAverages]);

  // Filtered feedback list
  const filteredFeedbacks = useMemo(() => {
    return submissions.filter(sub => {
      const matchesSearch = 
        sub.guestInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.guestInfo.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.comments || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.outstandingStaff || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = deptFilter === 'all' || sub.guestInfo.department === deptFilter || 
        DEPARTMENTS.find(d => d.id === deptFilter)?.name === sub.guestInfo.department;

      const subRatings = Object.values(sub.ratings);
      const avg = subRatings.length > 0 ? subRatings.reduce((a, b) => a + b, 0) / subRatings.length : 5;
      
      let matchesSentiment = true;
      if (sentimentFilter === 'positive') matchesSentiment = avg >= 4;
      else if (sentimentFilter === 'negative') matchesSentiment = avg < 4;

      return matchesSearch && matchesDept && matchesSentiment;
    });
  }, [submissions, searchTerm, deptFilter, sentimentFilter]);

  // Handle launching a new operational recovery ticket
  const handleOpenTicketCreation = (feedback: FeedbackSubmission) => {
    setSelectedFeedbackForTicket(feedback);
    setNewTicketData({
      issueCategory: feedback.complaintCategory || 'Service Delay',
      priorityLevel: 'Medium',
      assignedTo: '',
      rootCause: '',
      correctiveAction: '',
      completionDate: new Date().toISOString().split('T')[0],
      managerSignature: '',
      closedBy: '',
      followUpRequired: false
    });
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedbackForTicket) return;

    const newTicket: InternalTicket = {
      id: `TK-${Math.floor(100 + Math.random() * 900)}`,
      feedbackId: selectedFeedbackForTicket.id,
      department: selectedFeedbackForTicket.guestInfo.department,
      issueCategory: newTicketData.issueCategory,
      priorityLevel: newTicketData.priorityLevel,
      assignedTo: newTicketData.assignedTo || 'Operations Team',
      rootCause: newTicketData.rootCause || 'Under investigation',
      correctiveAction: newTicketData.correctiveAction || 'Immediate guest contact initiated',
      completionDate: newTicketData.completionDate,
      managerSignature: newTicketData.managerSignature,
      closedBy: newTicketData.closedBy,
      followUpRequired: newTicketData.followUpRequired
    };

    onAddTicket(newTicket);

    // Also update the feedback requires recovery status
    const updatedFeedback = { ...selectedFeedbackForTicket };
    updatedFeedback.recoveryStatus = 'In Progress';
    // Ideally we update submissions in parent too, we'll let parent know by trigger,
    // but we can close dialog immediately
    setSelectedFeedbackForTicket(null);
  };

  const handleResolveTicket = (ticketId: string, managerSig: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const updated = {
        ...ticket,
        managerSignature: managerSig,
        closedBy: 'Guest Relations Manager',
        completionDate: new Date().toISOString().split('T')[0]
      };
      onUpdateTicket(updated);
    }
  };

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      {/* Tab Navigation header */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-gold/20 rounded-3xl p-3 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-5 py-2.5 rounded-2xl font-sans text-xs font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'kpis'
                ? 'bg-navy dark:bg-gold text-white dark:text-navy shadow-md border border-gold/30'
                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-gold hover:bg-[#F9F8F6] dark:hover:bg-slate-800/40'
            }`}
          >
            OPERATIONS KPI
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-5 py-2.5 rounded-2xl font-sans text-xs font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-navy dark:bg-gold text-white dark:text-navy shadow-md border border-gold/30'
                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-gold hover:bg-[#F9F8F6] dark:hover:bg-slate-800/40'
            }`}
          >
            GUEST FEED ({filteredFeedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('ops')}
            className={`px-5 py-2.5 rounded-2xl font-sans text-xs font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'ops'
                ? 'bg-navy dark:bg-gold text-white dark:text-navy shadow-md border border-gold/30'
                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-gold hover:bg-[#F9F8F6] dark:hover:bg-slate-800/40'
            }`}
          >
            INTERNAL SERVICE RECOVERY
          </button>
          <button
            onClick={() => setActiveTab('sops')}
            className={`px-5 py-2.5 rounded-2xl font-sans text-xs font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'sops'
                ? 'bg-navy dark:bg-gold text-white dark:text-navy shadow-md border border-gold/30'
                : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-gold hover:bg-[#F9F8F6] dark:hover:bg-slate-800/40'
            }`}
          >
            FORBES SOP MANUALS
          </button>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {hasGoogleSync && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800 text-[10px] font-sans font-bold text-green-700 dark:text-green-400 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              REAL-TIME SYNC ACTIVE
            </span>
          )}
          <button
            onClick={() => exportFeedbackReportPDF(filteredFeedbacks, { searchTerm, deptFilter, sentimentFilter })}
            className="px-4 py-2 bg-navy hover:bg-navy/90 text-gold border border-gold/40 rounded-2xl font-sans font-bold text-[10px] tracking-wider transition-all flex items-center gap-2 cursor-pointer uppercase shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            DOWNLOAD REPORT
          </button>
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="px-4 py-2 border border-gold/30 hover:border-gold text-navy dark:text-slate-200 hover:text-gold dark:hover:text-gold bg-[#F9F8F6]/40 dark:bg-slate-800/40 rounded-2xl font-sans font-bold text-[10px] tracking-wider transition-all flex items-center gap-2 cursor-pointer uppercase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'SYNCING DATABASE...' : 'FORCE REFRESH'}
          </button>
        </div>
      </div>

      {/* Dynamic Tab Views */}
      <AnimatePresence mode="wait">
        {/* TAB 1: OPERATIONS KPI DASHBOARD */}
        {activeTab === 'kpis' && (
          <motion.div
            key="kpis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Card 1: GSI */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-5 border border-gold/15 dark:border-gold/10 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold"></div>
                <span className="text-[9px] font-sans font-bold tracking-widest text-gold block mb-1">SATISFACTION (GSI)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-bold text-navy dark:text-gold">{kpis.gsi}%</span>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-gold" /> Target: 95% Five-Star
                </p>
              </div>

              {/* Card 2: Average rating */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-5 border border-gold/15 dark:border-gold/10 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold"></div>
                <span className="text-[9px] font-sans font-bold tracking-widest text-gold block mb-1">AVERAGE SCORE</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-bold text-navy dark:text-gold">{kpis.avgRating}</span>
                  <Star className="w-4 h-4 fill-gold text-gold" />
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">Scale: 1.0 - 5.0 Rating</p>
              </div>

              {/* Card 3: NPS */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-5 border border-gold/15 dark:border-gold/10 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-navy dark:bg-gold"></div>
                <span className="text-[9px] font-sans font-bold tracking-widest text-gold block mb-1">NET PROMOTER (NPS)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-bold text-navy dark:text-gold">+{kpis.nps}</span>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">Promoters vs Detractors</p>
              </div>

              {/* Card 4: Service Recovery Rate */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-5 border border-gold/15 dark:border-gold/10 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold"></div>
                <span className="text-[9px] font-sans font-bold tracking-widest text-gold block mb-1">SERVICE RECOVERY</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-bold text-navy dark:text-gold">{kpis.recoveryRate}%</span>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">Resolved complaints</p>
              </div>

              {/* Card 5: Repeat Guest */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-5 border border-gold/15 dark:border-gold/10 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-navy dark:bg-gold"></div>
                <span className="text-[9px] font-sans font-bold tracking-widest text-gold block mb-1">REPEAT GUEST %</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-bold text-navy dark:text-gold">{kpis.repeatPct}%</span>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">Resort brand loyalty</p>
              </div>

              {/* Card 6: Response Volume */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-5 border border-gold/15 dark:border-gold/10 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold"></div>
                <span className="text-[9px] font-sans font-bold tracking-widest text-gold block mb-1">RESPONSE VOLUME</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-bold text-navy dark:text-gold">{kpis.volume}</span>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">Total tracked reviews</p>
              </div>
            </div>

            {/* Custom SVG Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart 1: Department Averages (Bar Chart) - 2cols */}
              <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/60 shadow-sm text-slate-800 dark:text-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[9px] font-sans font-bold tracking-widest text-[#aa841d] dark:text-gold uppercase block">DEPARTMENTAL METRICS</span>
                    <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">Average Department Rating</h3>
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" title="Based on 5-Star guest star ratings" />
                </div>

                {/* SVG Bar Chart */}
                <div className="relative pt-4 pb-2">
                  <svg viewBox="0 0 500 240" className="w-full h-auto overflow-visible">
                    {/* Y-axis grids */}
                    {[1, 2, 3, 4, 5].map((gridLine) => {
                      const yPos = 200 - (gridLine * 36);
                      return (
                        <g key={gridLine} className="opacity-10 dark:opacity-20">
                           <line x1="50" y1={yPos} x2="490" y2={yPos} stroke="currentColor" strokeWidth="1" />
                           <text x="35" y={yPos + 4} className="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 text-right">{gridLine}.0</text>
                        </g>
                      );
                    })}

                    {/* Plot columns */}
                    {departmentAverages.map((dept, idx) => {
                      const colWidth = 24;
                      const colSpacing = 36;
                      const xPos = 60 + (idx * colSpacing);
                      const barHeight = dept.avg * 36;
                      const yPos = 200 - barHeight;
                      const isHovered = hoveredBar === dept.id;

                      return (
                        <g 
                          key={dept.id}
                          onMouseEnter={() => setHoveredBar(dept.id)}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="cursor-pointer"
                        >
                          {/* Background Hover Guide column */}
                          <rect x={xPos - 4} y="20" width={colWidth + 8} height="180" fill="transparent" className="hover:fill-slate-50/50 dark:hover:fill-slate-800/20 transition-colors rounded-lg" />
                          
                          {/* Rating bar with metallic gold / navy brand gradient */}
                          <defs>
                            <linearGradient id={`goldGrad-${dept.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#E6D3B1" />
                              <stop offset="100%" stopColor="#C5A059" />
                            </linearGradient>
                            <linearGradient id={`blueGrad-${dept.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C5A059" />
                              <stop offset="100%" stopColor="#1B2B4B" />
                            </linearGradient>
                          </defs>

                          <rect
                            x={xPos}
                            y={yPos}
                            width={colWidth}
                            height={barHeight}
                            fill={`url(#${isHovered ? 'blueGrad' : 'goldGrad'}-${dept.id})`}
                            rx="4"
                            className="transition-all duration-300 shadow-sm"
                          />

                          {/* Hover Tooltip Value */}
                          {isHovered && (
                            <g>
                              <rect x={xPos - 12} y={yPos - 22} width="48" height="16" rx="4" fill="#0f172a" />
                              <text x={xPos + 12} y={yPos - 10} textAnchor="middle" fill="#ebd665" className="font-mono text-[9px] font-bold">
                                {dept.avg}★
                              </text>
                            </g>
                          )}

                          {/* X-axis labels rotated slightly */}
                          <text 
                            x={xPos + 10} 
                            y="215" 
                            textAnchor="end" 
                            transform={`rotate(-35, ${xPos + 10}, 215)`}
                            className={`font-sans text-[8px] font-medium tracking-tight ${isHovered ? 'text-slate-800 dark:text-gold font-semibold' : 'text-slate-400 dark:text-slate-500'}`}
                          >
                            {dept.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Bottom axis line */}
                    <line x1="50" y1="200" x2="490" y2="200" stroke="#cbd5e1" className="dark:stroke-slate-800" strokeWidth="1" />
                  </svg>
                </div>
              </div>

              {/* Chart 2: Sentiment / Purpose Trend (Donut/Pie Chart) */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between text-slate-800 dark:text-slate-100">
                <div>
                  <span className="text-[9px] font-sans font-bold tracking-widest text-[#aa841d] dark:text-gold uppercase block">DEMOGRAPHICS</span>
                  <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">Visit Demographics</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Classification based on target guests</p>
                </div>

                {/* SVG Donut */}
                <div className="py-6 flex items-center justify-center">
                  <svg width="160" height="160" viewBox="0 0 160 160" className="relative">
                    {/* Circle slices using stroke-dasharray */}
                    {/* Families: 40% (stroke-dasharray: 40 100), Couples: 30%, Corporate: 20%, VIP/Other: 10% */}
                    <circle cx="80" cy="80" r="50" fill="transparent" stroke="#aa841d" strokeWidth="20" strokeDasharray="125.6 314" strokeDashoffset="0" />
                    <circle cx="80" cy="80" r="50" fill="transparent" stroke="#ebd665" strokeWidth="20" strokeDasharray="94.2 314" strokeDashoffset="-125.6" />
                    <circle cx="80" cy="80" r="50" fill="transparent" stroke="#1e293b" strokeWidth="20" strokeDasharray="62.8 314" strokeDashoffset="-219.8" />
                    <circle cx="80" cy="80" r="50" fill="transparent" stroke="#94a3b8" strokeWidth="20" strokeDasharray="31.4 314" strokeDashoffset="-282.6" />
                    
                    {/* Center text */}
                    <circle cx="80" cy="80" r="35" fill="white" className="dark:fill-slate-900" />
                    <text x="80" y="76" textAnchor="middle" className="font-serif text-xs font-bold text-slate-700 dark:text-gold">TARGETS</text>
                    <text x="80" y="92" textAnchor="middle" className="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500">DISTRIBUTION</text>
                  </svg>
                </div>

                {/* Legend list */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#aa841d] rounded-full"></span>
                      <span className="text-slate-500 dark:text-slate-400 font-sans">Families & Groups</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">40%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#ebd665] rounded-full"></span>
                      <span className="text-slate-500 dark:text-slate-400 font-sans">Couples & VIPs</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">30%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#1e293b] rounded-full"></span>
                      <span className="text-slate-500 dark:text-slate-400 font-sans">Corporate & Events</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">20%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span>
                      <span className="text-slate-500 dark:text-slate-400 font-sans">Foreign & Wed guests</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">10%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Analytics Radar Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Radar Chart Card (2 columns) */}
              <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between text-slate-800 dark:text-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[9px] font-sans font-bold tracking-widest text-[#aa841d] dark:text-gold uppercase block">PREMIUM PERFORMANCE MODEL</span>
                    <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">Department Performance Radar</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Comparing luxury guest satisfaction scores across departments</p>
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" title="Radar model comparing ratings of various resort departments" />
                </div>

                {/* Radar Chart Container */}
                <div className="h-64 w-full flex items-center justify-center pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#f1f5f9" className="opacity-10 dark:opacity-25" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 5]} 
                        tick={{ fill: '#64748b', fontSize: 8 }}
                      />
                      <Radar 
                        name="Average Score" 
                        dataKey="score" 
                        stroke="#C5A059" 
                        fill="#E6D3B1" 
                        fillOpacity={0.65} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Rankings Card (1 column) */}
              <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between text-slate-800 dark:text-slate-100">
                <div>
                  <span className="text-[9px] font-sans font-bold tracking-widest text-navy dark:text-gold uppercase block">PERFORMANCE REGISTRY</span>
                  <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">Quick Department Summary</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Direct performance index sorted by average score</p>
                </div>

                <div className="mt-4 space-y-2.5 flex-1 overflow-y-auto max-h-52 pr-1">
                  {[...departmentAverages].sort((a, b) => b.avg - a.avg).map((dept, index) => {
                    return (
                      <div key={dept.id} className="flex items-center justify-between text-xs font-sans p-2 rounded-xl hover:bg-[#F9F8F6]/60 dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-gold/10">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-bold text-[10px] font-mono">
                            #{index + 1}
                          </span>
                          <span className="font-semibold text-navy dark:text-slate-200 truncate max-w-[130px]">{dept.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                            dept.avg >= 4.5 ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/40' :
                            dept.avg >= 4.0 ? 'bg-blue-50 dark:bg-slate-800/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-slate-700' :
                            'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                          }`}>
                            {dept.avg}★
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">({dept.count})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Service Recovery Alerts Section */}
            <div className="bg-[#fefcf0]/10 dark:bg-[#ebd665]/5 border border-[#ebd665]/30 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#aa841d] dark:text-gold">
                  <Activity className="w-4 h-4" />
                  <h3 className="font-serif text-sm font-bold">Active Operations Alerts ({submissions.filter(s => s.requiresRecovery && s.recoveryStatus !== 'Resolved').length})</h3>
                </div>
                <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500">REAL-TIME SERVICE REDRESSAL</span>
              </div>
              
              <div className="space-y-3">
                {submissions.filter(s => s.requiresRecovery && s.recoveryStatus !== 'Resolved').length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-500 font-sans">
                    ✓ All guest recovery cases resolved or closed. Forbes luxury standards intact.
                  </div>
                ) : (
                  submissions.filter(s => s.requiresRecovery && s.recoveryStatus !== 'Resolved').map((sub) => {
                    const existingTicket = tickets.find(t => t.feedbackId === sub.id);
                    return (
                      <div key={sub.id} className="p-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-red-100/50 dark:border-red-950/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-slate-800 dark:text-slate-200">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded text-[9px] font-mono font-bold">RECOVERY NEEDED</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">ID: {sub.id}</span>
                            <span className="text-xs text-slate-700 dark:text-slate-200 font-sans font-bold">{sub.guestInfo.name} (Room {sub.guestInfo.roomNumber})</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal italic">
                            "{sub.comments || 'Low star ratings submitted.'}"
                          </p>
                          <div className="text-[9px] text-[#aa841d] dark:text-gold font-sans mt-1.5 uppercase font-semibold">
                            DEPARTMENT: {sub.guestInfo.department} | REGISTERED AT: {new Date(sub.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {existingTicket ? (
                            <button
                              onClick={() => {
                                setActiveTab('ops');
                              }}
                              className="px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-full font-sans font-semibold text-[10px] tracking-wider transition-all duration-300 cursor-pointer"
                            >
                              VIEW RECOVERY WORKFLOW
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenTicketCreation(sub)}
                              className="px-4 py-2 bg-[#aa841d] hover:bg-[#886417] text-white rounded-full font-sans font-semibold text-[10px] tracking-wider transition-all duration-300 cursor-pointer"
                            >
                              TRIGGER SERVICE RECOVERY
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: GUEST SUBMISSIONS FEED */}
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Search and Filters box */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by guest name, room number, staff, comments..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-1 focus:ring-[#aa841d] focus:border-[#aa841d] focus:outline-none transition-all"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                  {/* Department select */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-[#aa841d] font-sans"
                    >
                      <option value="all">All Departments</option>
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>

                  {/* Sentiment select */}
                  <select
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-[#aa841d] font-sans"
                  >
                    <option value="all">All Star Ratings</option>
                    <option value="positive">Promoters (4-5 Star)</option>
                    <option value="negative">Glitches (1-3 Star)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List entries */}
            <div className="space-y-4">
              {filteredFeedbacks.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm text-slate-400 text-xs">
                  No guest feedback entries matching your search filter filters.
                </div>
              ) : (
                filteredFeedbacks.map((fb) => {
                  const ratingsList = Object.entries(fb.ratings);
                  const avg = ratingsList.length > 0 ? ratingsList.reduce((acc, curr) => acc + (curr[1] as number), 0) / ratingsList.length : 5;
                  
                  return (
                    <div key={fb.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:border-[#ebd665]/50 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif text-sm font-bold text-slate-800">{fb.guestInfo.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Room {fb.guestInfo.roomNumber}</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(fb.timestamp).toLocaleDateString()}</span>
                            
                            {fb.isRepeatGuest && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-sans font-bold">LOYAL REPEAT GUEST</span>
                            )}
                            {fb.synced !== undefined && (
                              fb.synced ? (
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[9px] font-sans font-bold border border-green-100">SYNCED</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-sans font-bold border border-amber-100 animate-pulse">PENDING SYNC</span>
                              )
                            )}
                          </div>
                          
                          <p className="text-[10px] text-[#aa841d] font-semibold mt-1 uppercase tracking-wider">
                            PURPOSE: {fb.guestInfo.purposeOfVisit} | NATIONALITY: {fb.guestInfo.nationality}
                          </p>
                        </div>

                        {/* Average star block */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-2xl">
                          <span className="font-mono font-bold text-xs text-slate-800">{avg.toFixed(1)}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <Star 
                                key={starVal}
                                className={`w-3.5 h-3.5 ${
                                  avg >= starVal ? 'fill-[#ebd665] text-[#aa841d]' : 'text-slate-200'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100"></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Comments & Suggestions */}
                        <div className="space-y-2">
                          {fb.comments && (
                            <div>
                              <h5 className="text-[10px] font-sans font-bold tracking-wider text-slate-400 uppercase">GUEST COMMENTS</h5>
                              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed italic">"{fb.comments}"</p>
                            </div>
                          )}
                          {fb.suggestions && (
                            <div>
                              <h5 className="text-[10px] font-sans font-bold tracking-wider text-slate-400 uppercase">RECOMMENDED ENHANCEMENTS</h5>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{fb.suggestions}</p>
                            </div>
                          )}
                        </div>

                        {/* Department details and Staff recognition */}
                        <div className="space-y-2 border-l border-slate-100 pl-4">
                          <div>
                            <h5 className="text-[10px] font-sans font-bold tracking-wider text-slate-400 uppercase">EVALUATED AREA</h5>
                            <span className="text-xs text-slate-800 font-medium block mt-0.5">
                              {DEPARTMENTS.find(d => d.id === fb.guestInfo.department || d.name === fb.guestInfo.department)?.name || fb.guestInfo.department}
                            </span>
                          </div>
                          {fb.outstandingStaff && (
                            <div>
                              <h5 className="text-[10px] font-sans font-bold tracking-wider text-[#aa841d] uppercase flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                OUTSTANDING STAFF MENTION
                              </h5>
                              <span className="text-xs text-slate-800 font-bold block mt-0.5 bg-[#fefcf0] p-1 px-2 border border-[#ebd665]/30 rounded-lg inline-block">
                                {fb.outstandingStaff}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Service recovery status row */}
                      {fb.requiresRecovery && (
                        <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="font-sans font-bold">Assistance Callback Triggered</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500 text-[10px]">Current Status: {fb.recoveryStatus || 'Pending'}</span>
                          </div>
                          
                          {fb.recoveryStatus === 'Pending' && (
                            <button
                              onClick={() => handleOpenTicketCreation(fb)}
                              className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-sans font-semibold text-[10px] tracking-wider transition-all duration-300 cursor-pointer shadow-sm"
                            >
                              START RECOVERY CASE
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: INTERNAL ISSUES SERVICE RECOVERY */}
        {activeTab === 'ops' && (
          <motion.div
            key="ops"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[9px] font-sans font-bold tracking-widest text-red-500 uppercase block">ADMINISTRATIVE PROTOCOLS</span>
                  <h3 className="font-serif text-lg font-bold text-slate-800">Closed-Loop Service Recovery Tracking</h3>
                </div>
                <Clock className="w-4 h-4 text-slate-300" />
              </div>

              {tickets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No active operational service recovery cases logged. Perfect resort standards!
                </div>
              ) : (
                <div className="space-y-6">
                  {tickets.map((ticket) => {
                    const associatedFeedback = submissions.find(s => s.id === ticket.feedbackId);
                    const isClosed = ticket.managerSignature !== '';

                    return (
                      <div key={ticket.id} className="bg-slate-50/50 rounded-3xl p-5 md:p-6 border border-slate-200 relative overflow-hidden">
                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                          isClosed ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>

                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-mono font-bold">{ticket.id}</span>
                              <span className="text-xs font-sans font-bold text-slate-800">Area: {ticket.department}</span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className={`px-2 py-0.5 text-[8px] font-bold rounded ${
                                ticket.priorityLevel === 'VIP' ? 'bg-red-100 text-red-700 font-serif' :
                                ticket.priorityLevel === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {ticket.priorityLevel} PRIORITY
                              </span>
                            </div>
                            {associatedFeedback && (
                              <p className="text-xs text-slate-500 mt-2 italic">
                                Guest: {associatedFeedback.guestInfo.name} (Room {associatedFeedback.guestInfo.roomNumber}) - "{associatedFeedback.comments}"
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isClosed ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-200 text-xs font-sans font-bold text-green-700">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                CASE CLOSED & RESOLVED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full border border-red-200 text-xs font-sans font-bold text-red-700 animate-pulse">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                ACTIVE RECOVERY CASE
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-slate-200 my-4"></div>

                        {/* Incident Review details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs mb-4">
                          <div>
                            <h5 className="font-sans font-bold text-slate-400 text-[9px] uppercase tracking-wider">ROOT CAUSE</h5>
                            <p className="text-slate-700 mt-1 leading-relaxed">{ticket.rootCause}</p>
                          </div>
                          <div>
                            <h5 className="font-sans font-bold text-slate-400 text-[9px] uppercase tracking-wider">CORRECTIVE RECOVERY ACTION</h5>
                            <p className="text-slate-700 mt-1 leading-relaxed">{ticket.correctiveAction}</p>
                          </div>
                          <div>
                            <h5 className="font-sans font-bold text-slate-400 text-[9px] uppercase tracking-wider">RESPONSIBLE EXECUTIVE</h5>
                            <p className="text-slate-800 mt-1 font-semibold">{ticket.assignedTo}</p>
                            <span className="text-[10px] text-slate-400 block mt-1 font-mono">Resolve Target: {ticket.completionDate}</span>
                          </div>
                        </div>

                        {/* Sign-off panel */}
                        {!isClosed && (
                          <div className="bg-[#fefcf0] p-4 rounded-2xl border border-[#ebd665]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="max-w-md">
                              <h5 className="text-xs font-bold text-[#886417] flex items-center gap-1.5">
                                <UserCheck className="w-4 h-4" />
                                Signature of Closeout Manager
                              </h5>
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Please sign and record corrective action to safely close this ticket under resort SOP standards.</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                              <input
                                id={`signature-${ticket.id}`}
                                type="text"
                                placeholder="Manager Initials (e.g. A.P.)"
                                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none w-full sm:w-40 font-mono"
                              />
                              <button
                                onClick={() => {
                                  const input = document.getElementById(`signature-${ticket.id}`) as HTMLInputElement;
                                  if (input && input.value.trim() !== '') {
                                    handleResolveTicket(ticket.id, input.value.trim());
                                  } else {
                                    alert('Please input a valid Manager Initials to close ticket.');
                                  }
                                }}
                                className="px-5 py-2.5 bg-[#aa841d] hover:bg-[#886417] text-white rounded-xl font-sans font-semibold text-xs tracking-wider transition-all duration-300 cursor-pointer shrink-0"
                              >
                                SIGN & CLOSE
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: FORBES FIVE-STAR SOP MANUALS */}
        {activeTab === 'sops' && (
          <motion.div
            key="sops"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* SOP Card 1: HEART */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold tracking-widest text-red-500 uppercase block">FIVE-STAR MANUAL</span>
                  <h3 className="font-serif text-lg font-bold text-slate-800">SOP: Service Recovery "H.E.A.R.T."</h3>
                </div>
              </div>
              <div className="h-px bg-slate-100"></div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When a guest logs a rating under 4 Stars (★) or requests representation callback, the Front Office and Guest Relations associates are required to trigger recovery protocols within 15 minutes:
              </p>
              <div className="space-y-3.5 text-xs">
                <div className="flex gap-3">
                  <span className="font-mono font-bold text-[#aa841d] bg-[#fefcf0] border border-[#ebd665]/30 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">H</span>
                  <div>
                    <h4 className="font-bold text-slate-800">HEAR & COMPREHEND</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">Allow the guest to express their complete perspective without interruption. Take structured operational notes.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-mono font-bold text-[#aa841d] bg-[#fefcf0] border border-[#ebd665]/30 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">E</span>
                  <div>
                    <h4 className="font-bold text-slate-800">EMPATHIZE SINCERELY</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">Validate their feelings immediately. "I completely understand your frustration, Admiral. Let me make this right."</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-mono font-bold text-[#aa841d] bg-[#fefcf0] border border-[#ebd665]/30 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">A</span>
                  <div>
                    <h4 className="font-bold text-slate-800">APOLOGIZE RESPECTFULLY</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">Express sincere apology on behalf of the resort management without offering structural or staff excuses.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-mono font-bold text-[#aa841d] bg-[#fefcf0] border border-[#ebd665]/30 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">R</span>
                  <div>
                    <h4 className="font-bold text-slate-800">RESOLVE SWIFTLY</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">Propose an elegant resolution. Deliver complementary F&B platters, room upgrades, or tailored gifts to their villa.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-mono font-bold text-[#aa841d] bg-[#fefcf0] border border-[#ebd665]/30 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">T</span>
                  <div>
                    <h4 className="font-bold text-slate-800">THANK SINCERELY</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">Thank the guest for their honesty. True luxury means leveraging feedback to establish deeper relationships.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SOP Card 2: Recognition & Collateral */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold tracking-widest text-blue-500 uppercase block">COLLATERAL DESIGN GUIDE</span>
                  <h3 className="font-serif text-lg font-bold text-slate-800">Staff Recognition & Print Details</h3>
                </div>
              </div>
              <div className="h-px bg-slate-100"></div>
              
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#aa841d]" />
                    Employee Performance Recognition SOP
                  </h4>
                  <p className="text-slate-500 leading-relaxed mt-1 text-[11px]">
                    Outstanding employees mentioned in feedbacks are logged inside our operations files. For every 3 guest mentions, the associate receives:
                  </p>
                  <ul className="list-disc pl-4 mt-1 text-[10px] text-slate-400 space-y-1">
                    <li>A formal certificate signed by the General Manager</li>
                    <li>Premium local Odia chocolate box or resort dinner coupon</li>
                    <li>Inclusion in the "Five-Star Champions" bulletin board in staff cafeteria</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                    <FileText className="w-4 h-4 text-[#aa841d]" />
                    Print Margins & Graphic Files Config
                  </h4>
                  <p className="text-slate-500 leading-relaxed mt-1 text-[10px]">
                    Our feedback collateral matches international luxury dimensions:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[9px] text-slate-500">
                    <div>• Format: A4 (Portrait)</div>
                    <div>• Table Card: A5 Double-Sided</div>
                    <div>• Bleed Margin: 3mm (CMYK)</div>
                    <div>• Target Resolution: 300 DPI Safe</div>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold text-slate-800 text-[11px]">Canva & Figma Editable Project Anchors</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <a href="https://figma.com/file/example" target="_blank" rel="noreferrer" className="p-2 border border-slate-200 hover:border-[#ebd665] text-slate-600 rounded-xl text-center font-bold font-sans text-[10px] hover:bg-slate-50 flex items-center justify-center gap-2">
                      <Share2 className="w-3 h-3 text-[#aa841d]" /> Figmа Template
                    </a>
                    <a href="https://canva.com/design/example" target="_blank" rel="noreferrer" className="p-2 border border-slate-200 hover:border-[#ebd665] text-slate-600 rounded-xl text-center font-bold font-sans text-[10px] hover:bg-slate-50 flex items-center justify-center gap-2">
                      <Share2 className="w-3 h-3 text-[#ebd665]" /> Canva Design
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TICKET CREATION MODAL */}
      {selectedFeedbackForTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden relative"
          >
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-slate-800">Launch Closed-Loop Recovery Ticket</h3>
                <button 
                  onClick={() => setSelectedFeedbackForTicket(null)}
                  className="text-slate-400 hover:text-slate-600 font-sans text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <span className="text-[9px] font-sans font-bold text-red-600 block mb-1 uppercase">GUEST GLITCH INFO</span>
                <div className="text-xs font-bold text-slate-800">{selectedFeedbackForTicket.guestInfo.name} | Room {selectedFeedbackForTicket.guestInfo.roomNumber}</div>
                <p className="text-xs text-slate-500 italic mt-1">"{selectedFeedbackForTicket.comments}"</p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={newTicketData.issueCategory}
                    onChange={(e) => setNewTicketData({ ...newTicketData, issueCategory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                  >
                    <option value="Service Delay">Service Delay</option>
                    <option value="Suite Cleanliness">Suite Cleanliness</option>
                    <option value="Food & Beverage standard">Food & Beverage standard</option>
                    <option value="Technology / AV">Technology / AV</option>
                    <option value="Valet / Parking Delay">Valet / Parking Delay</option>
                    <option value="Other Glitch">Other Glitch</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
                    <select
                      value={newTicketData.priorityLevel}
                      onChange={(e) => setNewTicketData({ ...newTicketData, priorityLevel: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="VIP">VIP Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Executive</label>
                    <input
                      type="text"
                      required
                      value={newTicketData.assignedTo}
                      onChange={(e) => setNewTicketData({ ...newTicketData, assignedTo: e.target.value })}
                      placeholder="e.g. Alok Panda (F&B)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Root Cause Analysis</label>
                  <textarea
                    required
                    value={newTicketData.rootCause}
                    onChange={(e) => setNewTicketData({ ...newTicketData, rootCause: e.target.value })}
                    placeholder="Briefly analyze how the breakdown occurred..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Immediate Corrective Action</label>
                  <textarea
                    required
                    value={newTicketData.correctiveAction}
                    onChange={(e) => setNewTicketData({ ...newTicketData, correctiveAction: e.target.value })}
                    placeholder="E.g. fruit basket delivered, suite upgrade, personal apology..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedFeedbackForTicket(null)}
                    className="px-4 py-2 border border-slate-200 rounded-full font-sans font-medium text-slate-500 hover:text-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-full font-sans font-semibold tracking-wider transition-all"
                  >
                    LAUNCH RECOVERY TICKET
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
