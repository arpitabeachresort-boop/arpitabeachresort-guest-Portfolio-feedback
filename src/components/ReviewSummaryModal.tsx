import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Check, 
  Star, 
  Sparkles, 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2, 
  Send,
  FileText,
  Compass,
  MessageSquare,
  Award
} from 'lucide-react';
import { DEPARTMENTS, GuestInfo } from '../types';

interface ReviewSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  guestInfo: GuestInfo;
  ratings: Record<string, number>;
  ratingComments: Record<string, string>;
  npsScore: number | null;
  staffName: string;
  staffDept: string;
  staffAppreciation: string;
  comments: string;
  suggestions: string;
  requiresRecovery: boolean;
  sentimentResult: { sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Urgent'; keywords: string[]; summary: string };
  uploadedFilesCount: number;
  language: 'en' | 'hi' | 'or' | 'bn';
}

const MODAL_TRANSLATIONS: Record<'en' | 'hi' | 'or' | 'bn', Record<string, string>> = {
  en: {
    title: "Verify Exquisite Feedback Details",
    subtitle: "Please review your ratings and remarks before final submission to our resort executive registry.",
    guestDetails: "Guest & Stay Credentials",
    departRatings: "Departmental Quality Ratings",
    overallRemarks: "Consolidated Remarks & Sentiment",
    staffRecog: "Luxury Team Member Recognition",
    noRatings: "No departments have been rated yet.",
    cancel: "Go Back & Edit",
    confirmSubmit: "Confirm & Submit Feedback",
    submitting: "Syncing with Resort Servers...",
    recoveryTriggered: "Service Recovery Escalation Active",
    recoverySub: "A Guest Relations Manager will contact you immediately for priority resolution.",
    sentimentLabel: "Analyzed Experience Tone",
    filesCount: "Multimedia Attachments"
  },
  hi: {
    title: "प्रतिक्रिया विवरण सत्यापित करें",
    subtitle: "हमारे रिसॉर्ट कार्यकारी रजिस्ट्री में अंतिम सबमिशन से पहले कृपया अपनी रेटिंग और टिप्पणियों की समीक्षा करें।",
    guestDetails: "अतिथि एवं प्रवास प्रमाण पत्र",
    departRatings: "विभागीय गुणवत्ता रेटिंग",
    overallRemarks: "समेकित टिप्पणियां और भावना",
    staffRecog: "लक्जरी टीम सदस्य मान्यता",
    noRatings: "अभी तक किसी भी विभाग को रेटिंग नहीं दी गई है।",
    cancel: "पीछे जाएं और संपादित करें",
    confirmSubmit: "पुष्टि करें और सबमिट करें",
    submitting: "सर्वर के साथ सिंक्रोनाइज़ हो रहा है...",
    recoveryTriggered: "सेवा सुधार एस्केलेशन सक्रिय",
    recoverySub: "एक अतिथि संबंध प्रबंधक प्राथमिकता समाधान के लिए तुरंत आपसे संपर्क करेगा।",
    sentimentLabel: "विश्लेषण किया गया अनुभव टोन",
    filesCount: "मल्टीमीडिया अटैचमेंट"
  },
  or: {
    title: "ମତାମତ ବିବରଣୀ ଯାଞ୍ଚ କରନ୍ତୁ",
    subtitle: "ଆମର ରିସର୍ଟ କାର୍ଯ୍ୟନିର୍ବାହୀ ପ୍ୟାନେଲକୁ ଚୂଡ଼ାନ୍ତ ଦାଖଲ ପୂର୍ବରୁ ଦୟାକରି ଆପଣଙ୍କ ମୂଲ୍ୟାଙ୍କନ ଏବଂ ମନ୍ତବ୍ୟ ସମୀକ୍ଷା କରନ୍ତୁ।",
    guestDetails: "ଅତିଥି ଏବଂ ରହଣି ବିବରଣୀ",
    departRatings: "ବିଭାଗୀୟ ଗୁଣବତ୍ତା ମୂଲ୍ୟାଙ୍କନ",
    overallRemarks: "ଏକତ୍ରିତ ମନ୍ତବ୍ୟ ଏବଂ ଭାବନା",
    staffRecog: "ବିଶିଷ୍ଟ କର୍ମଚାରୀ ସମ୍ମାନ",
    noRatings: "କୌଣସି ବିଭାଗକୁ ମୂଲ୍ୟାଙ୍କନ କରାଯାଇ ନାହିଁ।",
    cancel: "ପଛକୁ ଯାଇ ସଂଶୋଧନ କରନ୍ତୁ",
    confirmSubmit: "ନିଶ୍ଚିତ କରନ୍ତୁ ଏବଂ ଦାଖଲ କରନ୍ତୁ",
    submitting: "ସର୍ଭର ସହିତ ସିଙ୍କ୍ ହେଉଛି...",
    recoveryTriggered: "ସେବା ସୁଧାର ପ୍ରକ୍ରିୟା ସକ୍ରିୟ",
    recoverySub: "ଜଣେ ଅତିଥି ସମ୍ପର୍କ ପ୍ରବନ୍ଧକ ପ୍ରାଥମିକତା ସମାଧାନ ପାଇଁ ତୁରନ୍ତ ଆପଣଙ୍କ ସହ ଯୋଗାଯୋଗ କରିବେ।",
    sentimentLabel: "ସମୀକ୍ଷା କରାଯାଇଥିବା ଭାବନା",
    filesCount: "ମଲ୍ଟିମିଡିଆ ଆଟାଚମେଣ୍ଟ"
  },
  bn: {
    title: "প্রতিক্রিয়া বিবরণ যাচাই করুন",
    subtitle: "আমাদের রিসোর্ট কার্যনির্বাহী প্যানেলে চূড়ান্ত জমা দেওয়ার আগে দয়া করে আপনার রেটিং এবং মন্তব্যগুলি পর্যালোচনা করুন।",
    guestDetails: "অতিথি এবং থাকার বিবরণ",
    departRatings: "বিভাগীয় গুণমান রেটিং",
    overallRemarks: "একত্রিত মন্তব্য এবং অনুভূতি",
    staffRecog: "লাক্সারি টিম মেম্বার স্বীকৃতি",
    noRatings: "কোনো বিভাগকে এখনও রেটিং দেওয়া হয়নি।",
    cancel: "পিছনে যান এবং সম্পাদনা করুন",
    confirmSubmit: "নিশ্চিত করুন এবং জমা দিন",
    submitting: "সার্ভারের সাথে সিঙ্ক হচ্ছে...",
    recoveryTriggered: "পরিষেবা সংশোধন এসকেলেশন সক্রিয়",
    recoverySub: "একজন অতিথি সম্পর্ক ব্যবস্থাপক অগ্রাধিকার সমাধানের জন্য অবিলম্বে আপনার সাথে যোগাযোগ করবেন।",
    sentimentLabel: "বিশ্লেষিত অভিজ্ঞতা টোন",
    filesCount: "মাল্টিমিডিয়া সংযুক্তি"
  }
};

export default function ReviewSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  guestInfo,
  ratings,
  ratingComments,
  npsScore,
  staffName,
  staffDept,
  staffAppreciation,
  comments,
  suggestions,
  requiresRecovery,
  sentimentResult,
  uploadedFilesCount,
  language
}: ReviewSummaryModalProps) {
  
  if (!isOpen) return null;

  const mt = (key: string) => {
    return MODAL_TRANSLATIONS[language]?.[key] || MODAL_TRANSLATIONS['en'][key] || key;
  };

  // Filter departments that actually have star ratings
  const ratedDepts = DEPARTMENTS.filter(d => ratings[d.id] !== undefined && ratings[d.id] > 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy/65 backdrop-blur-sm"
        />

        {/* Modal dialog */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gold/30 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Top Gold Border Bar */}
            <div className="h-2 bg-gradient-to-r from-gold via-yellow-400 to-gold shrink-0"></div>

            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-b from-[#F9F8F6]/40 to-white shrink-0">
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans font-extrabold tracking-[0.25em] text-gold uppercase">Arpita Beach Resort</span>
                  <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-[9px] font-extrabold font-mono">PRE-SUBMIT REVIEW</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-navy tracking-tight">{mt('title')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{mt('subtitle')}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-navy transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 bg-[#F9F8F6]/10">
              
              {/* SECTION 1: GUEST stayed parameters */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-gold">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-navy">{mt('guestDetails')}</span>
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Guest Name</p>
                    <p className="font-semibold text-navy truncate">{guestInfo.name || 'Unspecified'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Room/Table</p>
                    <p className="font-semibold text-navy font-mono">{guestInfo.roomNumber || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Mobile</p>
                    <p className="font-semibold text-navy font-mono">{guestInfo.mobile || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
                    <p className="font-semibold text-navy truncate">{guestInfo.email || 'N/A'}</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Nationality</p>
                    <p className="font-semibold text-navy">{guestInfo.nationality || 'Indian'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Purpose of Visit</p>
                    <p className="font-semibold text-navy">{guestInfo.purposeOfVisit || 'Family'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Check-In</p>
                    <p className="font-semibold text-navy font-mono">{guestInfo.checkInDate || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Check-Out</p>
                    <p className="font-semibold text-navy font-mono">{guestInfo.checkOutDate || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DEPARTMENT RATINGS & COMMENTS */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-gold">
                  <Star className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-navy">{mt('departRatings')}</span>
                </div>
                <div className="h-px bg-slate-100"></div>

                {ratedDepts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-2">{mt('noRatings')}</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto pr-2 space-y-2">
                    {ratedDepts.map((dept) => {
                      const starRating = ratings[dept.id];
                      const comment = ratingComments[dept.id];
                      return (
                        <div key={dept.id} className="pt-2 first:pt-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-navy uppercase truncate block">{dept.name}</span>
                              <span className="text-[9px] text-slate-400 capitalize block">Category: {dept.id}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    className={`w-3.5 h-3.5 ${s <= starRating ? 'fill-gold text-gold' : 'text-slate-200'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold font-mono text-navy shrink-0">{starRating}/5</span>
                            </div>
                          </div>
                          {comment && (
                            <p className="text-[10px] text-slate-500 bg-[#F9F8F6] p-2 rounded-lg italic border-l-2 border-gold/40">
                              " {comment} "
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 3: STAFF APPRECIATION & NPS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Team member recognition card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-gold">
                    <Award className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-navy">{mt('staffRecog')}</span>
                  </div>
                  <div className="h-px bg-slate-100"></div>
                  {staffName.trim() ? (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Nominee</span>
                          <span className="font-bold text-navy truncate block">{staffName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Department</span>
                          <span className="font-bold text-navy truncate block">{staffDept || 'Hospitality'}</span>
                        </div>
                      </div>
                      {staffAppreciation.trim() && (
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Appreciation Message</span>
                          <p className="text-[10px] text-slate-600 italic bg-[#F9F8F6]/60 p-2 rounded-lg">"{staffAppreciation}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No team member specified for direct appreciation.</p>
                  )}
                </div>

                {/* Net Promoter Score (NPS) and Media Attachments Summary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-gold">
                    <Compass className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-navy">Net Promoter & Documents</span>
                  </div>
                  <div className="h-px bg-slate-100"></div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Net Promoter Score (NPS) Guess:</span>
                      {npsScore !== null ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                          npsScore >= 9 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : npsScore >= 7 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {npsScore} / 10 ({npsScore >= 9 ? 'Promoter' : npsScore >= 7 ? 'Passive' : 'Detractor'})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">{mt('filesCount')}:</span>
                      <span className="font-bold text-navy font-mono bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {uploadedFilesCount} {uploadedFilesCount === 1 ? 'file' : 'files'} attached
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Service Recovery Status:</span>
                      {requiresRecovery ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" /> ESCALATED PRIORITY
                        </span>
                      ) : (
                        <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                          Standard Review
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 4: REMARKS COMMENTS & AI SENTIMENT ANALYSIS */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-gold">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-navy">{mt('overallRemarks')}</span>
                </div>
                <div className="h-px bg-slate-100"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Detailed Comments</span>
                    <p className="text-navy font-serif leading-relaxed italic bg-[#F9F8F6]/40 p-2 rounded-xl mt-1 text-[11px] max-h-24 overflow-y-auto">
                      "{comments ? comments : 'No custom comments specified.'}"
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Recommendations for Enhancement</span>
                    <p className="text-navy font-serif leading-relaxed italic bg-[#F9F8F6]/40 p-2 rounded-xl mt-1 text-[11px] max-h-24 overflow-y-auto">
                      "{suggestions ? suggestions : 'No enhancements recommended.'}"
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 bg-navy/5 border border-navy/10 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-navy">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>{mt('sentimentLabel')}</span>
                    </div>
                    <span className="text-[8px] font-mono bg-navy text-white px-2 py-0.5 rounded-full uppercase tracking-wider">PREVIEW ANALYSIS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {sentimentResult.sentiment === 'Positive' && '😍'}
                      {sentimentResult.sentiment === 'Neutral' && '😐'}
                      {sentimentResult.sentiment === 'Negative' && '😞'}
                      {sentimentResult.sentiment === 'Urgent' && '🚨'}
                    </span>
                    <span className={`font-bold text-[10px] tracking-wide uppercase ${
                      sentimentResult.sentiment === 'Positive' ? 'text-green-600' :
                      sentimentResult.sentiment === 'Urgent' ? 'text-red-600' :
                      sentimentResult.sentiment === 'Negative' ? 'text-orange-600' : 'text-slate-500'
                    }`}>
                      {sentimentResult.sentiment} Sentiment
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-normal italic font-serif">
                    "{sentimentResult.summary}"
                  </p>
                </div>
              </div>

              {/* Priority Service Recovery banner if triggered */}
              {requiresRecovery && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-left">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">{mt('recoveryTriggered')}</h4>
                      <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">{mt('recoverySub')}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 sm:justify-between items-center shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-navy rounded-full font-sans font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
                {mt('cancel')}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-navy to-[#1e2d42] hover:bg-navy/90 text-white rounded-full font-sans font-bold text-xs tracking-[0.1em] uppercase transition-all shadow-md duration-300 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    {mt('submitting')}
                  </>
                ) : (
                  <>
                    {mt('confirmSubmit')}
                    <Send className="w-4 h-4 text-gold" />
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </div>

      </div>
    </AnimatePresence>
  );
}
