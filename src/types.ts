export interface GuestInfo {
  name: string;
  roomNumber: string;
  mobile: string;
  email: string;
  nationality: string;
  purposeOfVisit: string;
  checkInDate: string;
  checkOutDate: string;
  department: string;
  staffName: string;
}

export interface RatingQuestion {
  id: string;
  text: string;
}

export interface DepartmentConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  questions?: RatingQuestion[];
}

export interface FeedbackSubmission {
  id: string;
  timestamp: string;
  guestInfo: GuestInfo;
  ratings: Record<string, number>; // questionId -> rating (1-5)
  outstandingStaff: string;
  comments: string;
  suggestions: string;
  complaintCategory?: string;
  requiresRecovery: boolean;
  recoveryStatus?: 'Pending' | 'In Progress' | 'Resolved';
  isRepeatGuest: boolean;
  synced?: boolean;
}

export interface InternalTicket {
  id: string;
  feedbackId: string;
  department: string;
  issueCategory: string;
  priorityLevel: 'Low' | 'Medium' | 'High' | 'VIP';
  assignedTo: string;
  rootCause: string;
  correctiveAction: string;
  completionDate: string;
  managerSignature: string;
  closedBy: string;
  followUpRequired: boolean;
}

export const PURPOSES_OF_VISIT = [
  'Families',
  'Couples',
  'Corporate Guests',
  'VIP Guests',
  'Foreign Tourists',
  'Wedding Guests',
  'Banquet Guests',
  'Group Tours'
];

export const NATIONALITIES = [
  'Indian',
  'American',
  'British',
  'German',
  'French',
  'Australian',
  'Japanese',
  'Canadian',
  'Singaporean',
  'Other'
];

export const DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'reservation',
    name: 'Reservation Experience',
    icon: 'CalendarCheck',
    description: 'Booking efficiency, rate clarity, pre-arrival assistance, and reservation accuracy.'
  },
  {
    id: 'front_office',
    name: 'Front Office',
    icon: 'UserCheck',
    description: 'General front desk services, information provision, and luggage porter handling.'
  },
  {
    id: 'check_in',
    name: 'Check-in Process',
    icon: 'Key',
    description: 'Speed of room allocation, key card hand-over, traditional welcome, and check-in smoothness.'
  },
  {
    id: 'room_cleanliness',
    name: 'Room Cleanliness',
    icon: 'Sparkles',
    description: 'Impeccable hygiene, room sanitization, dust-free tables, clean balconies, and fresh aroma.'
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    icon: 'Wind',
    description: 'Suite replenishment, towel hygiene, evening turndown service, and promptness of requests.'
  },
  {
    id: 'room_comfort',
    name: 'Room Comfort',
    icon: 'BedDouble',
    description: 'Premium mattress quality, pillows selection, soundproofing, temperature control, and balcony vistas.'
  },
  {
    id: 'bathroom_cleanliness',
    name: 'Bathroom Cleanliness',
    icon: 'Bath',
    description: 'Deep-cleaned bathtubs, sparkling glass showers, dryness, and luxurious herbal toiletries.'
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: 'Utensils',
    description: 'Fine dining room ambiance, beach-view table setup, background music, and overall restaurant hygiene.'
  },
  {
    id: 'breakfast',
    name: 'Breakfast',
    icon: 'Coffee',
    description: 'Morning buffet spread variety, local Odia dishes, live counter egg station, and beverage freshness.'
  },
  {
    id: 'food_quality',
    name: 'Food Quality',
    icon: 'ChefHat',
    description: 'Ocean seafood freshness, perfect seasoning, coastal spices, Odia authentic delicacies, and presentation.'
  },
  {
    id: 'room_service',
    name: 'Room Service',
    icon: 'Bell',
    description: 'Phone order taking correctness, food temperature on delivery, trolley presentation, and server manners.'
  },
  {
    id: 'swimming_pool',
    name: 'Swimming Pool',
    icon: 'Waves',
    description: 'Infinity pool water clarity, poolside lounger hygiene, pool towel availability, and lifeguard watch.'
  },
  {
    id: 'banquet',
    name: 'Banquet Facilities',
    icon: 'PartyPopper',
    description: 'Utsav Grand Hall layout, event coordination, banquet catering variety, and audio-visual settings.'
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    icon: 'Wifi',
    description: 'High-speed internet connection stability across beachfront paths, gardens, reception, and villas.'
  },
  {
    id: 'beach',
    name: 'Beach Experience',
    icon: 'Sun',
    description: 'Chandipur golden sand cleanliness, private sunset lounge, beach security, and ocean accessibility.'
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: 'Wrench',
    description: 'Electrical fixtures, immediate air-conditioning adjustments, plumbing functionality, and garden upkeep.'
  },
  {
    id: 'security',
    name: 'Security',
    icon: 'Shield',
    description: 'Resort gates vigilance, parking safety, camera security, beach boundaries safety, and valet care.'
  },
  {
    id: 'staff_courtesy',
    name: 'Staff Courtesy',
    icon: 'Heart',
    description: 'Attentiveness, warm Namaste greetings, hospitality etiquette, and genuine service with a smile.'
  },
  {
    id: 'value_for_money',
    name: 'Value for Money',
    icon: 'DollarSign',
    description: 'General five-star value of services, resort amenities, dining pricing, and overall satisfaction.'
  },
  {
    id: 'overall_experience',
    name: 'Overall Experience',
    icon: 'Hotel',
    description: 'Your combined luxury memory of Arpita Beach Resort and the beauty of Chandipur, Odisha.'
  }
];
