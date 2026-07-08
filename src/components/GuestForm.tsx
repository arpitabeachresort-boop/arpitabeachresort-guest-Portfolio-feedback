import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  User, 
  Home, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Compass, 
  Send, 
  Gift,
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CalendarCheck,
  UserCheck,
  Key,
  Wind,
  BedDouble,
  Bath,
  Utensils,
  Coffee,
  ChefHat,
  Bell,
  Waves,
  PartyPopper,
  Wifi,
  Sun,
  Wrench,
  Shield,
  Heart,
  DollarSign,
  Hotel,
  Trash2,
  Paperclip,
  Volume2,
  X,
  Play,
  Square,
  Languages,
  Mic,
  FileText
} from 'lucide-react';
import { DEPARTMENTS, PURPOSES_OF_VISIT, NATIONALITIES, GuestInfo, FeedbackSubmission, DepartmentConfig } from '../types';
import SpeechToTextButton from './SpeechToTextButton';
import ReviewSummaryModal from './ReviewSummaryModal';

interface GuestFormProps {
  onSubmit: (submission: FeedbackSubmission) => Promise<{ success: boolean; offline: boolean } | boolean>;
  isSubmitting: boolean;
}

type Language = 'en' | 'hi' | 'or' | 'bn';

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    title: "Guest Feedback & Complain Recovery",
    thankYou: "Thank You for Staying with Us",
    experiencePrompt: "How was your experience at Arpita Beach Resort?",
    excellent: "Excellent",
    veryGood: "Very Good",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    guestInfo: "Guest Information",
    ratings: "Departmental Ratings",
    remarks: "Review & Remarks",
    fullName: "Guest Full Name",
    roomNumber: "Room or Table Number",
    mobile: "Mobile Contact",
    email: "Email Address",
    nationality: "Nationality",
    purpose: "Purpose of Visit",
    checkIn: "Check-in Date",
    checkOut: "Check-out Date",
    continueRatings: "Continue to Ratings",
    backToHome: "Back to Home",
    npsPrompt: "How likely are you to recommend Arpita Beach Resort to your friends and family?",
    npsHelp: "Scale from 0 (Not Likely) to 10 (Extremely Likely)",
    promoter: "Promoter (Exceptional)",
    passive: "Passive (Satisfactory)",
    detractor: "Detractor (Requires Recovery)",
    staffPrompt: "Did any team member make your stay memorable?",
    staffName: "Employee Name",
    staffDept: "Department",
    staffMsg: "Appreciation Message",
    uploadPrompt: "Photo, Video, Document & Voice Note Upload",
    uploadHelp: "Drag & drop or tap to upload files to support your feedback",
    commentPrompt: "Detailed Experience Remarks",
    suggestionPrompt: "Recommendations for Enhancement",
    callbackPrompt: "Request Guest Relations Representative Callback",
    callbackHelp: "Toggle this if you faced any discomfort and wish for immediate administrative redressal.",
    submitBtn: "Transmit Exquisite Feedback",
    submitting: "Transmitting Feedback...",
    atithi: "Atithi Devo Bhava",
    successMsg: "Your feedback has been recorded in our secure operations database. At Arpita Beach Resort, we strive to elevate every aspect of your stay. Your remarks have been shared directly with our MD Mr. Ujjwal Kumar.",
    offlineMsg: "Resort Wi-Fi appears unstable or offline. Your exquisite feedback has been securely cached locally on this device. It will automatically synchronize with our master servers the instant connection is restored.",
    assistanceMsg: "Our Guest Relations Manager has been notified and will reach out shortly for a luxury service recovery resolution.",
    subAnother: "SUBMIT ANOTHER RESPONSE",
    shareGoogle: "SHARE ON GOOGLE REVIEWS",
    shareTripadvisor: "SHARE ON TRIPADVISOR",
    optionalComment: "Add optional comment...",
    aiSummary: "AI Sentiment Analysis (Real-time Preview)",
    sentiment: "Detected Sentiment",
    keywords: "Extracted Key Concepts",
    detected: "Detected",
    urgent: "Urgent (Priority Service Recovery Triggered!)",
    positive: "Positive (Delighted)",
    neutral: "Neutral (Satisfactory)",
    negative: "Negative (Requires Attention)",
    allDeptsText: "Exquisite ratings will be synced directly to arpitabeachresort@gmail.com and the resort administrative panel."
  },
  hi: {
    title: "अतिथि प्रतिक्रिया एवं शिकायत निवारण",
    thankYou: "हमारे साथ रहने के लिए धन्यवाद",
    experiencePrompt: "अर्पिता बीच रिसॉर्ट में आपका अनुभव कैसा रहा?",
    excellent: "उत्कृष्ट",
    veryGood: "बहुत अच्छा",
    good: "अच्छा",
    fair: "ठीक-ठाक",
    poor: "खराब",
    guestInfo: "अतिथि जानकारी",
    ratings: "विभागीय रेटिंग",
    remarks: "समीक्षा और टिप्पणियां",
    fullName: "अतिथि का पूरा नाम",
    roomNumber: "कमरा या टेबल नंबर",
    mobile: "मोबाइल नंबर",
    email: "ईमेल पता",
    nationality: "राष्ट्रीयता",
    purpose: "यात्रा का उद्देश्य",
    checkIn: "चेक-इन तिथि",
    checkOut: "चेक-आउट तिथि",
    continueRatings: "रेटिंग के साथ जारी रखें",
    backToHome: "मुख्य पृष्ठ पर जाएं",
    npsPrompt: "आप अपने मित्रों और परिवार को अर्पिता बीच रिसॉर्ट की सिफारिश करने की कितनी संभावना रखते हैं?",
    npsHelp: "पैमाना 0 (बिल्कुल नहीं) से 10 (अत्यधिक संभावना)",
    promoter: "प्रमोटर (असाधारण)",
    passive: "निष्क्रिय (संतोषजनक)",
    detractor: "नुकसानदेह (ध्यान देने योग्य)",
    staffPrompt: "क्या किसी टीम सदस्य ने आपके प्रवास को यादगार बनाया?",
    staffName: "कर्मचारी का नाम",
    staffDept: "विभाग",
    staffMsg: "सराहना संदेश",
    uploadPrompt: "फोटो, वीडियो, दस्तावेज़ और वॉयस नोट अपलोड",
    uploadHelp: "अपनी प्रतिक्रिया के समर्थन में फ़ाइलें ड्रैग और ड्रॉप करें या अपलोड करें",
    commentPrompt: "विस्तृत अनुभव टिप्पणियाँ",
    suggestionPrompt: "सुधार के लिए सिफारिशें",
    callbackPrompt: "अतिथि संबंध प्रतिनिधि कॉलबैक का अनुरोध करें",
    callbackHelp: "यदि आपको कोई असुविधा हुई है और आप तत्काल प्रशासनिक समाधान चाहते हैं तो इसे चालू करें।",
    submitBtn: "उत्कृष्ट प्रतिक्रिया भेजें",
    submitting: "प्रतिक्रिया भेजी जा रही है...",
    atithi: "अतिथि देवो भव",
    successMsg: "आपकी प्रतिक्रिया हमारे सुरक्षित संचालन डेटाबेस में दर्ज कर ली गई है। अर्पिता बीच रिसॉर्ट में, हम आपके प्रवास के हर पहलू को बेहतर बनाने का प्रयास करते हैं। आपकी टिप्पणियां सीधे हमारे एमडी श्री उज्ज्वल कुमार के साथ साझा की गई हैं।",
    offlineMsg: "रिसॉर्ट वाई-फाई अस्थिर या ऑफलाइन लगता है। आपकी उत्कृष्ट प्रतिक्रिया इस डिवाइस पर सुरक्षित रूप से स्थानीय रूप से सहेजी गई है। कनेक्शन बहाल होते ही यह स्वचालित रूप से हमारे मुख्य सर्वर के साथ सिंक्रोनाइज़ हो जाएगी।",
    assistanceMsg: "हमारे अतिथि संबंध प्रबंधक को सूचित कर दिया गया है और वे शीघ्र ही एक लक्जरी सेवा सुधार के लिए संपर्क करेंगे।",
    subAnother: "दूसरी प्रतिक्रिया सबमिट करें",
    shareGoogle: "गूगल पर समीक्षा साझा करें",
    shareTripadvisor: "ट्रिपएडवाइजर पर समीक्षा साझा करें",
    optionalComment: "वैकल्पिक टिप्पणी जोड़ें...",
    aiSummary: "एआई भावना विश्लेषण (रीयल-टाइम पूर्वावलोकन)",
    sentiment: "पहचानी गई भावना",
    keywords: "निकाले गए प्रमुख विचार",
    detected: "पहचाना गया",
    urgent: "अत्यावश्यक (तत्काल सेवा सुधार सक्रिय!)",
    positive: "सकारात्मक (प्रसन्न)",
    neutral: "तटस्थ (संतोषजनक)",
    negative: "नकारात्मक (ध्यान देने योग्य)",
    allDeptsText: "उत्कृष्ट रेटिंग सीधे arpitabeachresort@gmail.com और रिसॉर्ट प्रशासनिक पैनल से सिंक की जाएगी।"
  },
  or: {
    title: "ଅତିଥି ମତାମତ ଓ ଅଭିଯୋଗ ସୁଧାର",
    thankYou: "ଆମ ସହିତ ରହିଥିବାରୁ ଧନ୍ୟବାଦ",
    experiencePrompt: "ଅର୍ପିତା ବିଚ୍ ରିସର୍ଟରେ ଆପଣଙ୍କର ଅନୁଭବ କିପରି ଥିଲା?",
    excellent: "ଉତ୍କୃଷ୍ଟ",
    veryGood: "ବହୁତ ଭଲ",
    good: "ଭଲ",
    fair: "ସାଧାରଣ",
    poor: "ଖରାପ",
    guestInfo: "ଅତିଥି ସୂଚନା",
    ratings: "ବିଭାଗୀୟ ମୂଲ୍ୟାଙ୍କନ",
    remarks: "ସମୀକ୍ଷା ଓ ମନ୍ତବ୍ୟ",
    fullName: "ଅତିଥିଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ନାମ",
    roomNumber: "ରୁମ୍ କିମ୍ବା ଟେବୁଲ୍ ନମ୍ବର",
    mobile: "ମୋବାଇଲ୍ ନମ୍ବର",
    email: "ଇମେଲ୍ ଠିକଣା",
    nationality: "ରାଷ୍ଟ୍ରୀୟତା",
    purpose: "ଭ୍ରମଣର ଉଦ୍ଦେଶ୍ୟ",
    checkIn: "ଚେକ୍-ଇନ୍ ତାରିଖ",
    checkOut: "ଚେକ୍-ଆଉଟ୍ ତାରିଖ",
    continueRatings: "ମୂଲ୍ୟାଙ୍କନ ସହିତ ଆଗକୁ ବଢନ୍ତୁ",
    backToHome: "ମୁଖ୍ୟ ପୃଷ୍ଠାକୁ ଯାଆନ୍ତୁ",
    npsPrompt: "ଆପଣ ନିଜ ବନ୍ଧୁ ଏବଂ ପରିବାରକୁ ଅର୍ପିତା ବିଚ୍ ରିସର୍ଟ ସୁପାରିଶ କରିବାର କେତେ ସମ୍ଭାବନା ରଖନ୍ତି?",
    npsHelp: "ସ୍କେଲ୍ ୦ (ବିଲକୁଲ୍ ନୁହେଁ) ରୁ ୧୦ (ଅତ୍ୟଧିକ ସମ୍ଭାବନା)",
    promoter: "ପ୍ରମୋଟର (ଅସାଧାରଣ)",
    passive: "ନିଷ୍କ୍ରିୟ (ସନ୍ତୋଷଜନକ)",
    detractor: "ଅସନ୍ତୁଷ୍ଟ (ଧ୍ୟାନ ଦେବା ଯୋଗ୍ୟ)",
    staffPrompt: "କୌଣସି କର୍ମଚାରୀ ଆପଣଙ୍କ ରହଣିକୁ ସ୍ମରଣୀୟ କରିଛନ୍ତି କି?",
    staffName: "କର୍ମଚାରୀଙ୍କ ନାମ",
    staffDept: "ବିଭାଗ",
    staffMsg: "ପ୍ରଶଂସା ବାର୍ତ୍ତା",
    uploadPrompt: "ଫଟୋ, ଭିଡିଓ, ଦଲିଲ ଏବଂ ଭଏସ୍ ନୋଟ୍ ଅପଲୋଡ୍",
    uploadHelp: "ଆପଣଙ୍କ ମତାମତ ସମର୍ଥନରେ ଫାଇଲ୍ ଡ୍ରାଗ୍ କରନ୍ତୁ କିମ୍ବା ଅପଲୋଡ୍ କରନ୍ତୁ",
    commentPrompt: "ବିସ୍ତୃତ ଅନୁଭବ ମନ୍ତବ୍ୟ",
    suggestionPrompt: "ଉନ୍ନତି ପାଇଁ ସୁପାରିଶ",
    callbackPrompt: "ଅତିଥି ସମ୍ପର୍କ ପ୍ରତିନିଧି କଲବ୍ୟାକ୍ ଅନୁରୋଧ କରନ୍ତୁ",
    callbackHelp: "ଯଦି ଆପଣ କୌଣସି ଅସୁବିଧାର ସମ୍ମୁଖୀନ ହୋଇଛନ୍ତି ଏବଂ ତୁରନ୍ତ ପ୍ରଶାସନିକ ସମାଧାନ ଚାହୁଁଛନ୍ତି ତେବେ ଏହାକୁ ଅନ୍ କରନ୍ତୁ।",
    submitBtn: "ମତାମତ ପ୍ରେରଣ କରନ୍ତୁ",
    submitting: "ମତାମତ ପ୍ରେରଣ କରାଯାଉଛି...",
    atithi: "ଅତିଥି ଦେବୋ ଭବ",
    successMsg: "ଆପଣଙ୍କ ମତାମତ ଆମର ସୁରକ୍ଷିତ ପରିଚାଳନା ଡାଟାବେସରେ ସଫଳତାର ସହ ପଞ୍ଜିକୃତ ହୋଇଛି। ଅର୍ପିତା ବିଚ୍ ରିସର୍ଟରେ, ଆମେ ଆପଣଙ୍କ ରହଣିର ପ୍ରତ୍ୟେକ ଦିଗକୁ ଅଧିକ ଉନ୍ନତ କରିବାକୁ ଚେଷ୍ଟା କରୁ। ଆପଣଙ୍କ ମନ୍ତବ୍ୟ ଆମର ଏମଡି ଶ୍ରୀ ଉଜ୍ଜ୍ୱଳ କୁମାରଙ୍କ ସହ ସିଧାସଳଖ ଶେୟାର କରାଯାଇଛି।",
    offlineMsg: "ରିସର୍ଟ ୱାଇ-ଫାଇ ଅସ୍ଥିର କିମ୍ବା ଅଫଲାଇନ୍ ଥିବା ପରି ଜଣାପଡୁଛି। ଆପଣଙ୍କ ମତାମତ ଏହି ଡିଭାଇସରେ ସୁରକ୍ଷିତ ଭାବେ ସଂରକ୍ଷିତ ହୋଇଛି। କନେକ୍ସନ ଫେରିବା ମାତ୍ରେ ଏହା ସ୍ୱୟଂଚାଳିତ ଭାବେ ଆମ ସର୍ଭର ସହ ସିଙ୍କ୍ ହୋଇଯିବ।",
    assistanceMsg: "ଆମର ଅତିଥି ସମ୍ପର୍କ ପ୍ରବନ୍ଧକଙ୍କୁ ସୂଚନା ଦିଆଯାଇଛି ଏବଂ ସେ ସେବା ସୁଧାର ପାଇଁ ଶୀଘ୍ର ଆପଣଙ୍କ ସହ ଯୋଗାଯୋଗ କରିବେ।",
    subAnother: "ଅନ୍ୟ ଏକ ପ୍ରତିକ୍ରିୟା ଦାଖଲ କରନ୍ତୁ",
    shareGoogle: "ଗୁଗୁଲ୍ ସମୀକ୍ଷା ଶେୟାର କରନ୍ତୁ",
    shareTripadvisor: "ଟ୍ରିପ୍ ଆଡଭାଇଜର ସମୀକ୍ଷା ଶେୟାର କରନ୍ତୁ",
    optionalComment: "ବିକଳ୍ପ ମନ୍ତବ୍ୟ ଯୋଡନ୍ତୁ...",
    aiSummary: "AI ଭାବନା ବିଶ୍ଳେଷଣ (ରିଅଲ୍-ଟାଇମ୍ ପ୍ରିଭ୍ୟୁ)",
    sentiment: "ଚିହ୍ନଟ ହୋଇଥିବା ଭାବନା",
    keywords: "ବିଶ୍ଳେଷିତ ପ୍ରମୁଖ ବିଷୟବସ୍ତୁ",
    detected: "ଚିହ୍ନଟ",
    urgent: "ଜରୁରୀକାଳୀନ (ତୁରନ୍ତ ସେବା ସୁଧାର ସକ୍ରିୟ!)",
    positive: "ସକାରାତ୍ମକ (ପ୍ରସନ୍ନ)",
    neutral: "ସାଧାରଣ (ସନ୍ତୋଷଜନକ)",
    negative: "ନକାରାତ୍ମକ (ଧ୍ୟାନ ଦେବା ଯୋଗ୍ୟ)",
    allDeptsText: "ମୂଲ୍ୟାଙ୍କନ ସିଧାସଳଖ arpitabeachresort@gmail.com ଏବଂ ଆଡମିନିଷ୍ଟ୍ରେଟିଭ୍ ପ୍ୟାନେଲ୍ ସହିତ ସିଙ୍କ୍ ହେବ।"
  },
  bn: {
    title: "অতিথি প্রতিক্রিয়া ও অভিযোগ সংশোধন",
    thankYou: "আমাদের সাথে থাকার জন্য ধন্যবাদ",
    experiencePrompt: "অর্পিতা বিচ রিসোর্টে আপনার অভিজ্ঞতা কেমন ছিল?",
    excellent: "চমৎকার",
    veryGood: "খুব ভালো",
    good: "ভালো",
    fair: "মোটামুটি",
    poor: "খারাপ",
    guestInfo: "অতিথি তথ্য",
    ratings: "বিভাগীয় মূল্যায়ন",
    remarks: "পর্যালোচনা এবং মন্তব্য",
    fullName: "অতিথির পুরো নাম",
    roomNumber: "রুম বা টেবিল নম্বর",
    mobile: "মোবাইল নম্বর",
    email: "ইমেল ঠিকানা",
    nationality: "জাতীয়তা",
    purpose: "ভ্রমণের উদ্দেশ্য",
    checkIn: "চেক-ইন তারিখ",
    checkOut: "চেক-আউট তারিখ",
    continueRatings: "মূল্যায়ন সহ এগিয়ে যান",
    backToHome: "মূল পৃষ্ঠাতে যান",
    npsPrompt: "আপনি আপনার বন্ধুদের এবং পরিবারকে অর্পিতা বিচ রিসর্টের সুপারিশ করার কতটা সম্ভাবনা রাখেন?",
    npsHelp: "স্কেল ০ (একেবারে না) থেকে ১০ (অত্যন্ত সম্ভাবনা)",
    promoter: "প্রমোটার (অসাধারণ)",
    passive: "নিষ্ক্রিয় (সন্তোষজনক)",
    detractor: "অসন্তুষ্ট (মনোযোগ দেওয়া উচিত)",
    staffPrompt: "কোনো টিম মেম্বার কি আপনার থাকা স্মরণীয় করে তুলেছেন?",
    staffName: "कर्मचारীর নাম",
    staffDept: "বিভাগ",
    staffMsg: "প্রশংসা বার্তা",
    uploadPrompt: "ছবি, ভিডিও, নথি এবং ভয়েস নোট আপলোড",
    uploadHelp: "আপনার প্রতিক্রিয়ার সমর্থনে ফাইল ড্র্যাগ এবং ড্রপ করুন বা আপলোড করুন",
    commentPrompt: "বিস্তারিত অভিজ্ঞতা মন্তব্য",
    suggestionPrompt: "উন্নতির জন্য সুপারিশ",
    callbackPrompt: "অতিথি সম্পর্ক প্রতিনিধির কলব্যাকের অনুরোধ করুন",
    callbackHelp: "আপনি কোনো অস্বস্তির সম্মুখীন হলে এবং তাত্ক্ষণিক প্রশাসনিক সমাধান চাইলে এটি অন করুন।",
    submitBtn: "চমৎকার প্রতিক্রিয়া প্রেরণ করুন",
    submitting: "প্রতিক্রিয়া পাঠানো হচ্ছে...",
    atithi: "অতিথি দেবো ভব",
    successMsg: "আপনার প্রতিক্রিয়া আমাদের সুরক্ষিত পরিচালনা ডেটাবেসে সফলভাবে নথিভুক্ত করা হয়েছে। অর্পিতা বিচ রিসোর্টে, আমরা আপনার থাকার প্রতিটি দিক উন্নত করার চেষ্টা করি। আপনার মন্তব্য সরাসরি আমাদের এমডি শ্রী উজ্জ্বল কুমার বাবুর সাথে শেয়ার করা হয়েছে।",
    offlineMsg: "রিসর্ট ওয়াই-ফাই অস্থির বা অফলাইন বলে মনে হচ্ছে। আপনার চমৎকার প্রতিক্রিয়া এই ডিভাইসে নিরাপদে স্থানীয়ভাবে সংরক্ষিত হয়েছে। সংযোগ পুনরুদ্ধার হওয়ার সাথে সাথেই এটি আমাদের প্রধান সার্ভারের সাথে সিঙ্ক হয়ে যাবে।",
    assistanceMsg: "আমাদের অতিথি সম্পর্ক ব্যবস্থাপককে জানানো হয়েছে এবং তিনি সেবা সংশোধনের জন্য শীঘ্রই আপনার সাথে যোগাযোগ করবেন।",
    subAnother: "অন্য প্রতিক্রিয়া জমা দিন",
    shareGoogle: "গুগল রিভিউ শেয়ার করুন",
    shareTripadvisor: "ট্রিপঅ্যাডভাইজার রিভিউ শেয়ার করুন",
    optionalComment: "ঐচ্ছিক মন্তব্য যোগ করুন...",
    aiSummary: "এআই অনুভূতি বিশ্লেষণ (রিয়েল-টাইম পূর্বরূপ)",
    sentiment: "শনাক্ত অনুভূতি",
    keywords: "বিশ্লেষিত প্রধান বিষয়বস্তু",
    detected: "শনাক্ত",
    urgent: "জরুরী (তাত্ক্ষণিক সেবা সংশোধন সক্রিয়!)",
    positive: "ইতিবাচক (আনন্দিত)",
    neutral: "নিরপেক্ষ (সন্তোষজনক)",
    negative: "নেতিবাচক (মনোযোগ দেওয়া উচিত)",
    allDeptsText: "মূল্যায়ন সরাসরি arpitabeachresort@gmail.com এবং রিসোর্ট প্রশাসনিক প্যানেলে সিঙ্ক করা হবে।"
  }
};

const CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'reception', label: 'Reception & Booking' },
  { id: 'accommodation', label: 'Suite & Upkeep' },
  { id: 'dining', label: 'Fine Dining' },
  { id: 'leisure', label: 'Resort & Comfort' }
];

const CATEGORY_ORDER = ['all', 'reception', 'accommodation', 'dining', 'leisure'];

const DEPT_CATEGORY_MAP: Record<string, string> = {
  reservation: 'reception',
  front_office: 'reception',
  check_in: 'reception',
  room_cleanliness: 'accommodation',
  housekeeping: 'accommodation',
  room_comfort: 'accommodation',
  bathroom_cleanliness: 'accommodation',
  maintenance: 'accommodation',
  restaurant: 'dining',
  breakfast: 'dining',
  food_quality: 'dining',
  room_service: 'dining',
  swimming_pool: 'leisure',
  banquet: 'leisure',
  wifi: 'leisure',
  beach: 'leisure',
  security: 'leisure',
  staff_courtesy: 'leisure',
  value_for_money: 'leisure',
  overall_experience: 'leisure'
};

const getIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName) {
    case 'CalendarCheck': return <CalendarCheck className={className} />;
    case 'UserCheck': return <UserCheck className={className} />;
    case 'Key': return <Key className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'BedDouble': return <BedDouble className={className} />;
    case 'Bath': return <Bath className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'ChefHat': return <ChefHat className={className} />;
    case 'Bell': return <Bell className={className} />;
    case 'Waves': return <Waves className={className} />;
    case 'PartyPopper': return <PartyPopper className={className} />;
    case 'Wifi': return <Wifi className={className} />;
    case 'Sun': return <Sun className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'DollarSign': return <DollarSign className={className} />;
    case 'Hotel': return <Hotel className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export default function GuestForm({ onSubmit, isSubmitting }: GuestFormProps) {
  // Navigation Steps:
  // 0: LANDING SCREEN (Emoji Selection)
  // 1: Guest Information
  // 2: Departmental Ratings
  // 3: Detailed Feedback, NPS, Staff, Media Uploads, AI Sentiment
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [language, setLanguage] = useState<Language>('en');

  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    roomNumber: '',
    mobile: '',
    email: '',
    nationality: 'Indian',
    purposeOfVisit: 'Families',
    checkInDate: new Date(Date.now() - 4 * 24 * 3600000).toISOString().split('T')[0],
    checkOutDate: new Date().toISOString().split('T')[0],
    department: 'overall',
    staffName: ''
  });

  // Ratings for all 20 categories
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingComments, setRatingComments] = useState<Record<string, string>>({});
  const [expandedCommentDept, setExpandedCommentDept] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Net Promoter Score (NPS)
  const [npsScore, setNpsScore] = useState<number | null>(null);

  // Staff Recognition Fields
  const [staffName, setStaffName] = useState('');
  const [staffDept, setStaffDept] = useState('');
  const [staffAppreciation, setStaffAppreciation] = useState('');

  // General remarks
  const [comments, setComments] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [requiresRecovery, setRequiresRecovery] = useState(false);

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: string; size: string; url: string; rawFile?: File }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);

  // Real-time Sentiment analysis cache
  const [sentimentResult, setSentimentResult] = useState<{ sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Urgent'; keywords: string[]; summary: string }>({
    sentiment: 'Neutral',
    keywords: [],
    summary: 'Awaiting comment text...'
  });

  const [submitted, setSubmitted] = useState(false);
  const [wasSubmittedOffline, setWasSubmittedOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Auto-detect browser language
  useEffect(() => {
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en';
    if (browserLang.startsWith('or')) {
      setLanguage('or');
    } else if (browserLang.startsWith('hi')) {
      setLanguage('hi');
    } else if (browserLang.startsWith('bn')) {
      setLanguage('bn');
    } else {
      setLanguage('en');
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor voice recording duration
  useEffect(() => {
    if (isRecording) {
      recordIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
      setRecordingDuration(0);
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  // Real-time Sentiment Analyzer & Keyword Extractor
  useEffect(() => {
    const combinedText = (comments + ' ' + suggestions + ' ' + staffAppreciation + ' ' + Object.values(ratingComments).join(' ')).trim().toLowerCase();
    
    if (combinedText.length < 5) {
      setSentimentResult({
        sentiment: 'Neutral',
        keywords: [],
        summary: language === 'en' ? 'Awaiting detailed guest comments...' : TRANSLATIONS[language]?.commentPrompt || 'Awaiting comments...'
      });
      return;
    }

    // 1. Keyword extraction
    const extractedKeywords: string[] = [];
    if (combinedText.match(/clean|hygiene|dirty|washroom|bathroom|smell|odor|pot|rubbish|dust|spotless|linen|towel/)) extractedKeywords.push('Cleanliness');
    if (combinedText.match(/food|taste|curry|spicy|delicious|breakfast|dinner|lunch|chef|restaurant|menu|seafood|dish/)) extractedKeywords.push('Food');
    if (combinedText.match(/service|staff|courteous|polite|rude|friendly|hospitality|namaste|waiter|reception|bell/)) extractedKeywords.push('Staff & Service');
    if (combinedText.match(/delay|slow|late|wait|timer|lag|waitings/)) extractedKeywords.push('Delay');
    if (combinedText.match(/pool|swim|water|infinity/)) extractedKeywords.push('Pool');
    if (combinedText.match(/wifi|wi-fi|internet|connect|offline|speed|online|network/)) extractedKeywords.push('Wi-Fi');
    if (combinedText.match(/money|value|expensive|cost|price|bill|charge/)) extractedKeywords.push('Value for Money');
    if (combinedText.match(/beach|sea|sunset|sand|tide/)) extractedKeywords.push('Beach Experience');

    // 2. Sentiment scoring
    let score = 0;
    const positiveWords = ['excellent', 'good', 'great', 'delicious', 'amazing', 'beautiful', 'wonderful', 'impeccable', 'luxurious', 'friendly', 'helpful', 'perfect', 'love', 'loved', 'delighted', 'outstanding', 'best', 'memorable', 'clean', 'fresh', 'happy', 'exquisite', 'spotless', 'namaste', 'vibe', 'scenery'];
    const negativeWords = ['bad', 'poor', 'dirty', 'slow', 'delay', 'rude', 'disappointed', 'worst', 'broken', 'uncomfortable', 'cold', 'smell', 'smelly', 'angry', 'failure', 'fail', 'glitch', 'expensive', 'unhappy', 'problem', 'issue', 'waste', 'disgusting'];
    
    positiveWords.forEach(w => { if (combinedText.includes(w)) score += 1.5; });
    negativeWords.forEach(w => { if (combinedText.includes(w)) score -= 2; });

    // 3. Urgent triggers
    const isUrgent = combinedText.match(/complaint|awful|horrible|terrible|stolen|theft|refund|poison|leak|safety|unacceptable|incident|danger/) || requiresRecovery;

    let finalSentiment: 'Positive' | 'Neutral' | 'Negative' | 'Urgent' = 'Neutral';
    if (isUrgent) {
      finalSentiment = 'Urgent';
    } else if (score > 1) {
      finalSentiment = 'Positive';
    } else if (score < -1) {
      finalSentiment = 'Negative';
    }

    // 4. Summary generation
    let finalSummary = '';
    const formattedKeywords = extractedKeywords.length > 0 ? extractedKeywords.join(', ') : 'general resort experience';
    
    if (finalSentiment === 'Urgent') {
      finalSummary = `🚨 Priority service recovery is triggered. The guest is highly concerned regarding aspects of [${formattedKeywords}] and immediate guest relations contact has been requested.`;
    } else if (finalSentiment === 'Positive') {
      finalSummary = `✨ Exquisite guest sentiment detected! The guest expresses deep satisfaction with [${formattedKeywords}], praising Arpita Beach Resort's luxury standard.`;
    } else if (finalSentiment === 'Negative') {
      finalSummary = `⚠️ Constructive critique detected regarding [${formattedKeywords}]. This response has been queued for immediate staff evaluation and review.`;
    } else {
      finalSummary = `✍️ Balanced guest feedback recorded regarding [${formattedKeywords}]. Remarks will be indexed for monthly performance reviews.`;
    }

    setSentimentResult({
      sentiment: finalSentiment,
      keywords: extractedKeywords,
      summary: finalSummary
    });
  }, [comments, suggestions, ratingComments, staffAppreciation, requiresRecovery, language]);

  const t = (key: string) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || key;
  };

  // Prepopulate first overall rating from landing page selection
  const handleSelectLandingEmoji = (stars: number) => {
    setRatings(prev => ({ ...prev, overall_experience: stars }));
    setNpsScore(stars * 2); // default NPS guess based on emoji
    setStep(1); // proceed to guest details
  };

  const handleRatingChange = (deptId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [deptId]: rating }));
    // Auto-trigger recovery alert toggle on poor departmental ratings (<=2)
    if (rating <= 2) {
      setRequiresRecovery(true);
    }
  };

  const validateStep1 = () => {
    return (
      guestInfo.name.trim() !== '' &&
      guestInfo.roomNumber.trim() !== '' &&
      guestInfo.mobile.trim() !== '' &&
      guestInfo.email.trim() !== ''
    );
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    const newFilesList = [...uploadedFiles];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileUrl = URL.createObjectURL(file);
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      
      newFilesList.push({
        name: file.name,
        type: file.type,
        size: sizeInMB,
        url: fileUrl,
        rawFile: file
      });
    }
    
    setUploadedFiles(newFilesList);
  };

  const removeUploadedFile = (index: number) => {
    const updated = [...uploadedFiles];
    URL.revokeObjectURL(updated[index].url);
    updated.splice(index, 1);
    setUploadedFiles(updated);
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setUploadedFiles(prev => [
          ...prev, 
          {
            name: `Live Voice Note - ${new Date().toLocaleTimeString()}.webm`,
            type: 'audio/webm',
            size: (audioBlob.size / 1024).toFixed(1) + ' KB',
            url: audioUrl,
            rawFile: new File([audioBlob], 'voicenote.webm', { type: 'audio/webm' })
          }
        ]);
        setAudioChunks([]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start voice recorder:', error);
      alert('Microphone access is required for recording. Please verify your system settings or upload a recorded audio file manually.');
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop the mic stream tracks to free resource
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsReviewModalOpen(false);
    
    // Aggregate rated department list names
    const ratedDepts = DEPARTMENTS.filter(dept => ratings[dept.id] !== undefined).map(d => d.name);
    const evaluatedDeptsString = ratedDepts.length > 0 ? ratedDepts.join(', ') : 'None';

    // Format staff recognition text to save in backwards-compatible field
    let aggregatedStaffText = '';
    if (staffName.trim()) {
      aggregatedStaffText = `Employee: ${staffName} [Dept: ${staffDept || 'N/A'}] - Message: "${staffAppreciation || 'memorable stay appreciation'}"`;
    }

    // Build rich payload
    const payload: FeedbackSubmission = {
      id: `FB-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      guestInfo: {
        ...guestInfo,
        department: evaluatedDeptsString,
        staffName: staffName || guestInfo.staffName // preserve
      },
      ratings,
      outstandingStaff: aggregatedStaffText,
      comments: comments || 'None',
      suggestions: suggestions || 'None',
      requiresRecovery: requiresRecovery || Object.values(ratings).some((v: any) => v <= 2) || sentimentResult.sentiment === 'Urgent',
      recoveryStatus: 'Pending',
      isRepeatGuest: Math.random() > 0.8
    };

    // Store custom fields in the object so administrative dashboard can render them elegantly
    const extendedPayload = {
      ...payload,
      npsScore: npsScore !== null ? npsScore : undefined,
      npsClass: npsScore !== null ? (npsScore >= 9 ? 'Promoter' : npsScore >= 7 ? 'Passive' : 'Detractor') : undefined,
      sentiment: sentimentResult.sentiment,
      sentimentKeywords: sentimentResult.keywords,
      sentimentSummary: sentimentResult.summary,
      ratingsComments: ratingComments,
      mediaFiles: uploadedFiles.map(f => ({ name: f.name, type: f.type, url: f.url }))
    };

    const result = await onSubmit(extendedPayload as any);
    let isSuccess = false;
    let isOffline = false;

    if (typeof result === 'boolean') {
      isSuccess = result;
    } else if (result && typeof result === 'object') {
      isSuccess = result.success;
      isOffline = !!result.offline;
    }

    if (isSuccess) {
      setWasSubmittedOffline(isOffline);
      setSubmitted(true);
    }
  };

  const resetForm = () => {
    setStep(0);
    setGuestInfo({
      name: '',
      roomNumber: '',
      mobile: '',
      email: '',
      nationality: 'Indian',
      purposeOfVisit: 'Families',
      checkInDate: new Date(Date.now() - 4 * 24 * 3600000).toISOString().split('T')[0],
      checkOutDate: new Date().toISOString().split('T')[0],
      department: 'overall',
      staffName: ''
    });
    setRatings({});
    setRatingComments({});
    setNpsScore(null);
    setStaffName('');
    setStaffDept('');
    setStaffAppreciation('');
    setComments('');
    setSuggestions('');
    setRequiresRecovery(false);
    setSubmitted(false);
    setWasSubmittedOffline(false);
    setUploadedFiles([]);
  };

  const filteredDepartments = selectedCategory === 'all' 
    ? DEPARTMENTS 
    : DEPARTMENTS.filter(d => DEPT_CATEGORY_MAP[d.id] === selectedCategory);

  // Success screen
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white rounded-3xl shadow-xl border border-gold/30 overflow-hidden text-center relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gold via-yellow-400 to-gold"></div>
        <div className="p-8 md:p-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-[#F9F8F6] rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/50"
          >
            <CheckCircle2 className="w-10 h-10 text-gold" />
          </motion.div>
          
          <span className="text-[10px] font-sans font-extrabold tracking-[0.3em] text-gold uppercase block mb-1">ARPITA BEACH RESORT</span>
          <h2 className="font-serif text-3xl font-semibold text-navy mb-4 tracking-tight">{t('atithi')}</h2>
          <p className="text-sm font-medium text-gold tracking-wider uppercase mb-4">Feedback Saved Successfully</p>
          <div className="h-px bg-slate-100 max-w-xs mx-auto my-6"></div>
          
          {wasSubmittedOffline ? (
            <div className="mb-6 p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-left max-w-md mx-auto">
              <div className="flex gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Offline mode active</h4>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">{t('offlineMsg')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-slate-600 leading-relaxed mb-6 text-sm px-4">
                Dear <span className="font-semibold text-navy">{guestInfo.name}</span> , {t('successMsg')}
              </p>

              {/* COMPLIMENTARY ₹5000 DIGITAL GIFT VOUCHER CERTIFICATE */}
              <div className="mb-8 max-w-md mx-auto p-0.5 rounded-3xl bg-gradient-to-r from-[#aa841d] via-yellow-400 to-[#aa841d] shadow-lg relative overflow-hidden">
                {/* Ticket Background */}
                <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 relative overflow-hidden text-left border border-gold/15">
                  {/* Decorative side notches to look like a real ticket */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#f8f9fa] dark:bg-slate-950 border-r border-gold/20"></div>
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#f8f9fa] dark:bg-slate-950 border-l border-gold/20"></div>

                  {/* Decorative Sparkle inside the card */}
                  <div className="absolute top-4 right-4 text-[#aa841d] opacity-25">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>

                  <div className="text-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-4 mb-4">
                    <span className="text-[10px] font-sans font-extrabold tracking-[0.3em] text-[#aa841d] uppercase block">ARPITA BEACH RESORT</span>
                    <h3 className="font-serif text-lg font-bold text-navy dark:text-white mt-1">Official Gift Voucher</h3>
                    <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-sans font-bold tracking-wider mt-2 uppercase">ISSUED SECURELY</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-sans font-bold text-slate-400 tracking-wider uppercase">VALUE</span>
                      <span className="font-serif text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">₹5,000.00 INR</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-sans font-bold text-slate-400 tracking-wider uppercase">GUEST NAME</span>
                      <span className="text-xs font-sans font-extrabold text-navy dark:text-white uppercase tracking-wide truncate max-w-[200px]">
                        {guestInfo.name || 'Valued Guest'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-sans font-bold text-slate-400 tracking-wider uppercase">REDEMPTION CODE</span>
                      <span className="font-mono text-xs font-bold text-[#aa841d] bg-[#aa841d]/10 px-2.5 py-1 rounded border border-[#aa841d]/20 tracking-widest select-all">
                        ARP-V5000-{guestInfo.roomNumber ? guestInfo.roomNumber.replace(/\s+/g, '').toUpperCase() : 'GST'}-{Math.random().toString(36).substr(2, 4).toUpperCase()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 text-center italic leading-relaxed">
                      "Valid for 1 year from today. Redeemable on accommodation, dining, or resort activities on your future visit to Arpita Beach Resort."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(requiresRecovery || Object.values(ratings).some((v: any) => v <= 2) || sentimentResult.sentiment === 'Urgent') && (
            <div className="mb-8 p-4 bg-red-50/70 rounded-2xl border border-red-200 text-left max-w-md mx-auto">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">IMMEDIATE SERVICE RECOVERY ESCALATION ACTIVE</h4>
                  <p className="text-[11px] text-red-700 mt-1 leading-relaxed">{t('assistanceMsg')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-navy hover:bg-navy/90 text-white rounded-full font-sans font-medium text-xs tracking-wider transition-all shadow-md duration-300 w-full sm:w-auto cursor-pointer"
            >
              {t('subAnother')}
            </button>
            <a 
              href="https://www.google.com/travel/hotels/arpita%20beach%20resort/entity/CgsIpOHx3trl-cPzARAB/reviews?" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 bg-[#aa841d] hover:bg-[#927018] text-white rounded-full font-sans font-semibold text-xs tracking-wider transition-all shadow-md duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <span>{t('shareGoogle')}</span>
            </a>
            <a 
              href="https://www.tripadvisor.in/UserReviewEdit-g1162223-d5040384-Arpita_Beach_Resort" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 bg-[#00AF87] hover:bg-[#009170] text-white rounded-full font-sans font-semibold text-xs tracking-wider transition-all shadow-md duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <span>{t('shareTripadvisor')}</span>
            </a>
          </div>
        </div>
        
        <div className="bg-[#F9F8F6] border-t border-slate-100 px-8 py-4">
          <p className="text-[11px] text-slate-500 font-sans">
            Arpita Beach Resort, Chandipur-on-Sea, Balasore, Odisha, India | gm@arpitabeachresort.in
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto luxury-glass rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-500 z-10">
      {/* Brand Header Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-yellow-400 to-gold"></div>
      
      {/* Luxury Multilingual Language & Network Header bar */}
      <div className="p-3.5 bg-[#F9F8F6]/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 md:px-10 transition-colors">
        <div className="flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-gold" />
          <span className="text-[10px] font-sans font-bold text-navy/85 dark:text-gold/90 uppercase tracking-widest">Select Preferred Language</span>
        </div>
        <div className="flex flex-row flex-nowrap items-center bg-slate-200/50 dark:bg-slate-800/40 p-0.5 rounded-full border border-slate-200/40 dark:border-slate-700/50 shadow-inner overflow-x-auto scrollbar-none max-w-full">
          {(['en', 'hi', 'or', 'bn'] as Language[]).map(lang => (
            <button
              type="button"
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                language === lang 
                  ? 'bg-navy dark:bg-gold text-white dark:text-navy font-bold shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-gold'
              }`}
            >
              {lang === 'en' && 'English'}
              {lang === 'hi' && 'हिंदी'}
              {lang === 'or' && 'ଓଡ଼ିଆ'}
              {lang === 'bn' && 'বাংলা'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-b from-[#F9F8F6]/20 to-white dark:from-slate-900/10 dark:to-slate-900/40 flex flex-col items-center justify-center text-center transition-colors">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="h-px w-6 bg-gold"></span>
          <span className="text-[10px] font-sans font-extrabold tracking-[0.3em] text-gold uppercase">ARPITA BEACH RESORT</span>
          <span className="h-px w-6 bg-gold"></span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy dark:text-white leading-tight tracking-tight">
          {t('title')}
        </h1>

        
        <div className="mt-3.5">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800/40 text-[10px] font-sans font-bold text-green-700 dark:text-green-400 shadow-sm transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              RESORT NETWORK SYNC CONNECTED (SECURE CLOUD API)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 rounded-full border border-amber-200 dark:border-amber-800/40 text-[10px] font-sans font-bold text-amber-700 dark:text-amber-400 shadow-sm transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              OFFLINE CACHING ACTIVE (WILL SYNC AUTOMATICALLY)
            </span>
          )}
        </div>
      </div>

      {/* Progress Trackers (only visible after landing step) */}
      {step > 0 && (
        <div className="px-6 md:px-10 py-4 bg-[#F9F8F6]/40 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs overflow-x-auto whitespace-nowrap transition-colors">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step >= 1 ? 'bg-navy dark:bg-gold text-white dark:text-navy border border-gold/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>1</span>
            <span className={`font-semibold tracking-wider text-[10px] uppercase ${step === 1 ? 'text-navy dark:text-gold font-bold' : 'text-slate-400 dark:text-slate-500'}`}>{t('guestInfo')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 mx-2 shrink-0" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step >= 2 ? 'bg-navy dark:bg-gold text-white dark:text-navy border border-gold/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>2</span>
            <span className={`font-semibold tracking-wider text-[10px] uppercase ${step === 2 ? 'text-navy dark:text-gold font-bold' : 'text-slate-400 dark:text-slate-500'}`}>{t('ratings')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 mx-2 shrink-0" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step >= 3 ? 'bg-navy dark:bg-gold text-white dark:text-navy border border-gold/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>3</span>
            <span className={`font-semibold tracking-wider text-[10px] uppercase ${step === 3 ? 'text-navy font-bold' : 'text-slate-400'}`}>{t('remarks')}</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 md:p-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: LANDING SCREEN */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center py-6 space-y-8"
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-gold/10 border border-gold/25 text-gold shadow-sm">
                    <span className="text-2xl filter drop-shadow-sm select-none animate-bounce">🙏</span>
                  </div>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight tracking-tight text-navy dark:text-white flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
                  <span>Namaste.</span>
                  <span>Atithi Devo Bhava.</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed font-sans">
                  {t('experiencePrompt')}
                </p>
              </div>

              {/* Interactive Emojis */}
              <div className="grid grid-cols-5 gap-3 max-w-xl mx-auto pt-4 px-2">
                {[
                  { stars: 5, label: t('excellent'), emoji: '😍', color: 'hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-300 dark:hover:border-green-800/50 text-green-700 dark:text-green-400' },
                  { stars: 4, label: t('veryGood'), emoji: '😊', color: 'hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:border-teal-300 dark:hover:border-teal-800/50 text-teal-700 dark:text-teal-400' },
                  { stars: 3, label: t('good'), emoji: '😐', color: 'hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-800/50 text-amber-700 dark:text-amber-400' },
                  { stars: 2, label: t('fair'), emoji: '😞', color: 'hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300 dark:hover:border-orange-800/50 text-orange-700 dark:text-orange-400' },
                  { stars: 1, label: t('poor'), emoji: '😢', color: 'hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800/50 text-red-700 dark:text-red-400' }
                ].map((item) => (
                  <motion.button
                    type="button"
                    key={item.stars}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSelectLandingEmoji(item.stars)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-[#F9F8F6]/20 dark:bg-slate-900/40 transition-all cursor-pointer shadow-sm text-slate-700 dark:text-slate-300 hover:shadow-md ${item.color}`}
                  >
                    <span className="text-4xl md:text-5xl mb-2.5 block filter drop-shadow-md select-none">{item.emoji}</span>
                    <span className="text-[10px] md:text-xs font-sans font-bold tracking-wide leading-tight">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 bg-navy dark:bg-gold text-white dark:text-navy rounded-full font-sans font-bold text-xs tracking-wider transition-all shadow-md hover:bg-navy/90 dark:hover:bg-gold/90 flex items-center gap-2 mx-auto cursor-pointer hover:shadow-lg hover:scale-102 active:scale-98"
                >
                  START SURVEY
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* GORGEOUS GUEST GIFT VOUCHER INCENTIVE CARD */}
              <div className="pt-2 max-w-md mx-auto">
                <motion.div
                  type="button"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  className="mt-2 p-5 rounded-3xl border border-dashed border-[#aa841d]/50 bg-gradient-to-br from-[#FDFCF7] to-[#F3EDE4] dark:from-slate-900/80 dark:to-slate-800/50 text-center relative overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer select-none group border-2"
                >
                  {/* Decorative golden sparkle and gift icons in background */}
                  <div className="absolute top-2 right-3 text-[#aa841d] opacity-20 group-hover:opacity-60 transition-opacity">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="absolute bottom-2 left-3 text-[#aa841d] opacity-15 group-hover:opacity-40 transition-opacity">
                    <Gift className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-4 text-left">
                    {/* Gilded Stamp / Gift Box Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#aa841d] to-[#d4af37] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Gift className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-sans font-extrabold tracking-[0.25em] text-[#aa841d] dark:text-gold uppercase">GUEST REWARD</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-sans font-bold tracking-wide uppercase">Active Incentive</span>
                      </div>
                      <h4 className="font-serif text-sm md:text-base font-extrabold text-navy dark:text-white leading-snug">
                        Get ₹5000/- Gift Voucher
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-sans">
                        After finishing all the feedback (Google / TripAdvisor), you will receive a <strong className="text-[#aa841d] dark:text-gold">₹5000 Gift Voucher</strong>. It can be redeemed on your future visit!
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: GUEST DETAILS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="bg-[#F9F8F6] dark:bg-slate-900/40 p-4 rounded-2xl border border-gold/10 dark:border-gold/30 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-gold animate-bounce shrink-0" />
                <p className="text-[11px] text-navy dark:text-gold font-bold tracking-wide uppercase leading-tight">
                  Step 1: Provide your reservation details so we may log your visit history.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold" />
                    {t('fullName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestInfo.name}
                    onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    placeholder="e.g. Admiral Ravi Patnaik"
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-900/40 text-navy dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>

                {/* Room */}
                <div>
                  <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-gold" />
                    {t('roomNumber')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestInfo.roomNumber}
                    onChange={e => setGuestInfo({ ...guestInfo, roomNumber: e.target.value })}
                    placeholder="e.g. Suite 304 or Table 9"
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-900/40 text-navy dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    {t('mobile')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestInfo.mobile}
                    onChange={e => setGuestInfo({ ...guestInfo, mobile: e.target.value })}
                    placeholder="e.g. +91 7504838884"
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-900/40 text-navy dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold" />
                    {t('email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={guestInfo.email}
                    onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    placeholder="e.g. name@arpitabeachresort.com"
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-900/40 text-navy dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gold" />
                    {t('nationality')}
                  </label>
                  <select
                    value={guestInfo.nationality}
                    onChange={e => setGuestInfo({ ...guestInfo, nationality: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-900/40 text-navy dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  >
                    {NATIONALITIES.map(n => <option key={n} value={n} className="dark:bg-slate-900 dark:text-white">{n}</option>)}
                  </select>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-gold" />
                    {t('purpose')}
                  </label>
                  <select
                    value={guestInfo.purposeOfVisit}
                    onChange={e => setGuestInfo({ ...guestInfo, purposeOfVisit: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-900/40 text-navy dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  >
                    {PURPOSES_OF_VISIT.map(p => <option key={p} value={p} className="dark:bg-slate-900 dark:text-white">{p}</option>)}
                  </select>
                </div>

                {/* Check In */}
                <div>
                  <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    {t('checkIn')}
                  </label>
                  <input
                    type="date"
                    value={guestInfo.checkInDate}
                    onChange={e => setGuestInfo({ ...guestInfo, checkInDate: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-900/40 text-navy dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>

                {/* Check Out */}
                <div>
                  <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    {t('checkOut')}
                  </label>
                  <input
                    type="date"
                    value={guestInfo.checkOutDate}
                    onChange={e => setGuestInfo({ ...guestInfo, checkOutDate: e.target.value })}
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-900/40 text-navy dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-gold rounded-full font-sans font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('backToHome')}
                </button>
                <button
                  type="button"
                  disabled={!validateStep1()}
                  onClick={() => {
                    setSelectedCategory('all');
                    setStep(2);
                  }}
                  className="px-6 py-3 bg-navy dark:bg-gold hover:bg-navy/95 dark:hover:bg-gold/90 disabled:bg-slate-100 dark:disabled:bg-slate-900/20 text-white dark:text-navy disabled:text-slate-400 dark:disabled:text-slate-600 rounded-full font-sans font-bold text-xs tracking-[0.1em] uppercase transition-all shadow-md duration-300 flex items-center gap-2 cursor-pointer hover:shadow-lg hover:scale-102 active:scale-98"
                >
                  {t('continueRatings')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DEPARTMENTAL RATINGS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Filter Categories Row */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                {CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-sans font-bold tracking-wide transition-all cursor-pointer ${
                      selectedCategory === cat.id 
                        ? 'bg-white dark:bg-slate-800 text-navy dark:text-gold shadow-md border border-slate-100 dark:border-slate-700' 
                        : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-gold'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of rating cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDepartments.map((dept) => {
                  const currentRating = ratings[dept.id] || 0;
                  const isCommentsExpanded = expandedCommentDept === dept.id || ratingComments[dept.id];

                  return (
                    <motion.div
                      layout
                      key={dept.id}
                      className="bg-[#F9F8F6]/25 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-5 shadow-sm transition-all hover:border-gold/40 dark:hover:border-gold/50 hover:bg-white dark:hover:bg-slate-800/40 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gold">
                          <div className="w-8 h-8 rounded-full bg-[#F9F8F6] dark:bg-slate-900 border border-gold/20 dark:border-gold/40 flex items-center justify-center text-gold">
                            {getIcon(dept.icon, "w-4 h-4 text-gold")}
                          </div>
                          <div>
                            <h4 className="text-xs font-sans font-extrabold tracking-wider text-navy dark:text-gold uppercase">{dept.name}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{DEPT_CATEGORY_MAP[dept.id]} Service</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed font-sans">{dept.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <button
                                type="button"
                                key={starVal}
                                onClick={() => handleRatingChange(dept.id, starVal)}
                                className="p-0.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                              >
                                <Star 
                                  className={`w-5 h-5 transition-all ${
                                    currentRating >= starVal 
                                      ? 'fill-gold text-gold scale-110 drop-shadow-sm' 
                                      : 'text-slate-300 dark:text-slate-700 hover:text-gold/60'
                                  }`} 
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] font-mono font-bold text-navy dark:text-slate-200">
                            {currentRating > 0 ? `${currentRating}/5 Stars` : 'Not Rated'}
                          </span>
                        </div>

                        {!isCommentsExpanded ? (
                          <button
                            type="button"
                            onClick={() => setExpandedCommentDept(dept.id)}
                            className="text-[10px] font-sans font-bold text-gold hover:text-gold/80 hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            ✍️ {t('optionalComment')}
                          </button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-1.5"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[9px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase">Specific remarks for {dept.name}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const updatedComments = { ...ratingComments };
                                  delete updatedComments[dept.id];
                                  setRatingComments(updatedComments);
                                  setExpandedCommentDept(null);
                                }}
                                className="text-red-400 hover:text-red-600 text-[9px] font-bold uppercase cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={ratingComments[dept.id] || ''}
                                onChange={e => setRatingComments({ ...ratingComments, [dept.id]: e.target.value })}
                                placeholder="e.g. delicious, clean but delayed, excellent team manners..."
                                className="flex-1 text-xs px-3 py-1.5 bg-[#F9F8F6]/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                              />
                              <SpeechToTextButton
                                value={ratingComments[dept.id] || ''}
                                onChange={newVal => setRatingComments({ ...ratingComments, [dept.id]: newVal })}
                                language={language}
                                placeholderName={dept.name}
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = CATEGORY_ORDER.indexOf(selectedCategory);
                    if (currentIndex <= 0) {
                      setStep(1);
                    } else {
                      setSelectedCategory(CATEGORY_ORDER[currentIndex - 1]);
                    }
                  }}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-gold rounded-full font-sans font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = CATEGORY_ORDER.indexOf(selectedCategory);
                      if (currentIndex < CATEGORY_ORDER.length - 1) {
                        setSelectedCategory(CATEGORY_ORDER[currentIndex + 1]);
                      } else {
                        setStep(3);
                      }
                    }}
                    className="px-6 py-3 bg-navy dark:bg-gold hover:bg-navy/95 dark:hover:bg-gold/90 text-white dark:text-navy rounded-full font-sans font-bold text-xs tracking-[0.1em] uppercase transition-all shadow-md duration-300 flex items-center gap-2 cursor-pointer hover:shadow-lg hover:scale-102 active:scale-98"
                  >
                    {(() => {
                      const currentIndex = CATEGORY_ORDER.indexOf(selectedCategory);
                      if (currentIndex < CATEGORY_ORDER.length - 1) {
                        const nextCat = CATEGORIES.find(c => c.id === CATEGORY_ORDER[currentIndex + 1]);
                        return `NEXT: ${nextCat?.label.toUpperCase()}`;
                      }
                      return "CONTINUE TO REMARKS";
                    })()}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEWS & WORKFLOW INTEGRATIONS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* NPS - NET PROMOTER SCORE */}
              <div className="p-5 bg-[#F9F8F6]/30 dark:bg-slate-900/30 border border-gold/15 dark:border-slate-800/80 rounded-3xl space-y-4 shadow-sm">
                <div className="text-center space-y-1">
                  <span className="text-xs font-sans font-bold text-gold uppercase tracking-widest">LOYALTY METRICS</span>
                  <h4 className="font-serif text-base font-bold text-navy dark:text-white leading-tight">{t('npsPrompt')}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{t('npsHelp')}</p>
                </div>

                <div className="flex justify-between items-center gap-1 max-w-lg mx-auto overflow-x-auto py-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                    const isSelected = npsScore === score;
                    // color scale from red to green
                    let scoreBg = 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700';
                    if (isSelected) {
                      if (score <= 6) scoreBg = 'bg-red-500 text-white border-red-500 shadow-md scale-110';
                      else if (score <= 8) scoreBg = 'bg-amber-500 text-white border-amber-500 shadow-md scale-110';
                      else scoreBg = 'bg-green-600 text-white border-green-600 shadow-md scale-110';
                    }

                    return (
                      <button
                        type="button"
                        key={score}
                        onClick={() => setNpsScore(score)}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all shrink-0 cursor-pointer ${scoreBg}`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>

                {npsScore !== null && (
                  <div className="text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-bold shadow-sm border ${
                      npsScore >= 9 
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30' 
                        : npsScore >= 7 
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30' 
                        : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30'
                    }`}>
                      {npsScore >= 9 && `😍 ${t('promoter')}`}
                      {npsScore >= 7 && npsScore <= 8 && `😐 ${t('passive')}`}
                      {npsScore <= 6 && `😞 ${t('detractor')}`}
                    </span>
                  </div>
                )}
              </div>

              {/* STAFF RECOGNITION */}
              <div className="p-5 bg-white dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-navy dark:text-gold">{t('staffPrompt')}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1">{t('staffName')}</label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={e => setStaffName(e.target.value)}
                      placeholder="e.g. Sourav Kumar"
                      className="w-full text-xs px-3 py-2 bg-[#F9F8F6]/30 dark:bg-slate-950/40 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase mb-1">{t('staffDept')}</label>
                    <select
                      value={staffDept}
                      onChange={e => setStaffDept(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F9F8F6]/30 dark:bg-slate-950/40 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none"
                    >
                      <option value="" className="dark:bg-slate-900 dark:text-white">Select Department...</option>
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.name} className="dark:bg-slate-900 dark:text-white">{d.name}</option>)}
                    </select>
                  </div>
                </div>

                 <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase">{t('staffMsg')}</label>
                    <SpeechToTextButton
                      value={staffAppreciation}
                      onChange={setStaffAppreciation}
                      language={language}
                      placeholderName="staff appreciation"
                    />
                  </div>
                  <textarea
                    value={staffAppreciation}
                    onChange={e => setStaffAppreciation(e.target.value)}
                    rows={2}
                    placeholder="Describe how they made your stay memorable. Their supervisor and HR team will be notified."
                    className="w-full text-xs px-3 py-2 bg-[#F9F8F6]/30 dark:bg-slate-950/40 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>
                {staffName.trim() && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-sans font-bold text-green-700 dark:text-green-400 uppercase bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-full px-2 py-0.5 mt-1 animate-pulse">
                    📨 HR & GM Email Alerts queued for {staffName}
                  </span>
                )}
              </div>

              {/* PHOTO, VIDEO, VOICE NOTES MULTIMEDIA UPLOAD */}
              <div className="p-5 bg-[#F9F8F6]/20 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800/60 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gold shrink-0" />
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-navy dark:text-gold">{t('uploadPrompt')}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500">PREVIEW BEFORE TRANSMITTING</span>
                </div>

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-gold bg-gold/5 scale-[0.99]' 
                      : 'border-slate-300 dark:border-slate-700 hover:border-gold/50 bg-[#F9F8F6]/10 dark:bg-slate-900/30'
                  }`}
                  onClick={triggerFileSelect}
                >
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <span className="text-3xl block select-none">📁</span>
                    <p className="text-xs font-semibold text-navy dark:text-slate-200">{t('uploadHelp')}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Supported types: Photos, Videos, Documents, Voice Recording</p>
                  </div>
                </div>

                {/* Live Voice Note Recorder module */}
                <div className="p-4 bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-navy dark:text-gold uppercase tracking-wide flex items-center gap-1.5">
                      <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gold'}`} />
                      Live Voice Note Recorder
                    </h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Record a high-fidelity voice memo directly inside the applet</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isRecording && (
                      <span className="text-xs font-mono font-bold text-red-600 animate-pulse bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 px-2 py-1 rounded-lg">
                        REC {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-4 py-2 rounded-full font-sans font-bold text-[10px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse shadow-md' 
                          : 'bg-[#F9F8F6] dark:bg-slate-800 text-navy dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-3 h-3 fill-white" />
                          STOP RECORDING
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3" />
                          RECORD VOICE NOTE
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Media Files Preview Container */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-sans font-extrabold text-navy dark:text-gold tracking-wider uppercase block">Uploaded Files Preview ({uploadedFiles.length})</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="p-3 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-xl relative flex flex-col justify-between group shadow-sm text-slate-900 dark:text-white">
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(idx)}
                            className="absolute top-2 right-2 p-1 bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full cursor-pointer z-10 transition-transform hover:scale-110"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* File preview based on mime type */}
                          <div className="space-y-2">
                            {file.type.startsWith('image/') ? (
                              <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            ) : file.type.startsWith('video/') ? (
                              <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <video src={file.url} controls className="w-full h-full object-contain" />
                              </div>
                            ) : file.type.startsWith('audio/') || file.type.includes('webm') ? (
                              <div className="py-2 px-1 bg-[#F9F8F6]/50 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-navy dark:text-gold">
                                  <Volume2 className="w-4 h-4 text-gold shrink-0" />
                                  <span>Voice Playback Audio</span>
                                </div>
                                <audio src={file.url} controls className="w-full mt-1 h-8" />
                              </div>
                            ) : (
                              <div className="h-16 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center gap-3 px-3">
                                <FileText className="w-6 h-6 text-gold shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-navy dark:text-gold truncate">{file.name}</p>
                                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">PDF/DOC Document</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                              <span className="truncate max-w-[150px]">{file.name}</span>
                              <span className="shrink-0 font-bold text-slate-500 dark:text-slate-400">{file.size}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

               {/* TEXT COMMENTS & RECOMMENDATIONS */}
              <div className="grid grid-cols-1 gap-4">
                {/* Detailed comments */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase">
                      {t('commentPrompt')}
                    </label>
                    <SpeechToTextButton
                      value={comments}
                      onChange={setComments}
                      language={language}
                      placeholderName="experience comments"
                    />
                  </div>
                  <textarea
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    rows={3}
                    placeholder="Please share any memorable moments, observations, or highlights of your visit at Chandipur..."
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-950/40 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>

                {/* Suggestions */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-sans font-bold text-navy dark:text-slate-200 tracking-wider uppercase">
                      {t('suggestionPrompt')}
                    </label>
                    <SpeechToTextButton
                      value={suggestions}
                      onChange={setSuggestions}
                      language={language}
                      placeholderName="improvement suggestions"
                    />
                  </div>
                  <textarea
                    value={suggestions}
                    onChange={e => setSuggestions(e.target.value)}
                    rows={2}
                    placeholder="How can we further refine our service standards or suite properties to exceed your expectations?"
                    className="w-full text-sm px-4 py-2.5 bg-[#F9F8F6]/30 dark:bg-slate-950/40 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
                  />
                </div>
              </div>

              {/* REAL-TIME AI SENTIMENT INTERFACE PREVIEW */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-navy via-[#1e2d42] to-navy text-white relative overflow-hidden shadow-md border border-gold/35">
                {/* Glow decorations */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-2xl"></div>
                
                <div className="relative space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                      <span className="text-[10px] font-sans font-extrabold text-gold tracking-widest uppercase">{t('aiSummary')}</span>
                    </div>
                    <span className="text-[8px] font-sans font-bold uppercase tracking-widest bg-gold/20 border border-gold/40 text-gold rounded-full px-2 py-0.5">GEMINI SENTIMENT CORE</span>
                  </div>

                  <div className="h-px bg-white/10"></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">{t('sentiment')}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xl">
                          {sentimentResult.sentiment === 'Positive' && '😍'}
                          {sentimentResult.sentiment === 'Neutral' && '😐'}
                          {sentimentResult.sentiment === 'Negative' && '😞'}
                          {sentimentResult.sentiment === 'Urgent' && '🚨'}
                        </span>
                        <span className={`font-bold tracking-wide uppercase ${
                          sentimentResult.sentiment === 'Positive' ? 'text-green-400' :
                          sentimentResult.sentiment === 'Urgent' ? 'text-red-400' :
                          sentimentResult.sentiment === 'Negative' ? 'text-orange-400' : 'text-slate-300'
                        }`}>
                          {sentimentResult.sentiment === 'Positive' && t('positive')}
                          {sentimentResult.sentiment === 'Neutral' && t('neutral')}
                          {sentimentResult.sentiment === 'Negative' && t('negative')}
                          {sentimentResult.sentiment === 'Urgent' && t('urgent')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">{t('keywords')}</p>
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {sentimentResult.keywords.length > 0 ? (
                          sentimentResult.keywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/10 text-gold rounded-md text-[9px] font-bold uppercase border border-gold/20">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">No topics detected yet...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider mb-1">AUTOMATED MANAGEMENT SUMMARY</p>
                    <p className="text-[11px] text-slate-200 leading-relaxed font-serif italic">
                      "{sentimentResult.summary}"
                    </p>
                  </div>
                </div>
              </div>

              {/* SERVICE RECOVERY SOLICITATION BUTTON */}
              <div className="p-5 bg-red-50/20 rounded-3xl border border-red-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="max-w-md">
                  <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    {t('callbackPrompt')}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('callbackHelp')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequiresRecovery(!requiresRecovery)}
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-300 shrink-0 cursor-pointer ${
                    requiresRecovery ? 'bg-red-500' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${
                    requiresRecovery ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-500 hover:text-navy rounded-full font-sans font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-gold to-[#B59049] hover:brightness-110 text-white rounded-full font-sans font-bold text-xs tracking-[0.1em] uppercase transition-all shadow-md duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    t('submitting')
                  ) : (
                    <>
                      {t('submitBtn')}
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </form>

      <ReviewSummaryModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleFinalSubmit}
        isSubmitting={isSubmitting}
        guestInfo={guestInfo}
        ratings={ratings}
        ratingComments={ratingComments}
        npsScore={npsScore}
        staffName={staffName}
        staffDept={staffDept}
        staffAppreciation={staffAppreciation}
        comments={comments}
        suggestions={suggestions}
        requiresRecovery={requiresRecovery}
        sentimentResult={sentimentResult}
        uploadedFilesCount={uploadedFiles.length}
        language={language}
      />
    </div>
  );
}
