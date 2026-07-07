import { FeedbackSubmission, InternalTicket } from '../types';

export const MOCK_FEEDBACKS: FeedbackSubmission[] = [
  {
    id: 'FB-101',
    timestamp: '2026-07-05T14:30:00Z',
    guestInfo: {
      name: 'Elena Rostova',
      roomNumber: 'Suite 405',
      mobile: '+7 912 345 6789',
      email: 'elena.rostova@travelglobe.ru',
      nationality: 'German',
      purposeOfVisit: 'Foreign Tourists',
      checkInDate: '2026-06-30',
      checkOutDate: '2026-07-06',
      department: 'Nirvana Coastal Spa (Future Ready)',
      staffName: 'Priya Sen'
    },
    ratings: {
      spa_ambiance: 5,
      spa_therapist: 5,
      spa_treatments: 5,
      spa_consult: 5,
      spa_tea: 4
    },
    outstandingStaff: 'Therapist Priya Sen',
    comments: 'The beach-salt scrub was divine, absolute bliss. The therapist is highly trained, custom pressure was perfect. Best spa experience I had in India so far!',
    suggestions: 'Offer a wider selection of post-treatment cold juices alongside the hot herbal tea.',
    requiresRecovery: false,
    recoveryStatus: 'Resolved',
    isRepeatGuest: false
  },
  {
    id: 'FB-102',
    timestamp: '2026-07-05T11:15:00Z',
    guestInfo: {
      name: 'Sanjay Mukherjee',
      roomNumber: 'Villa 102',
      mobile: '+91 98300 12345',
      email: 'sanjay.m@mukhgroup.com',
      nationality: 'Indian',
      purposeOfVisit: 'VIP Guests',
      checkInDate: '2026-07-02',
      checkOutDate: '2026-07-07',
      department: 'Amethyst Restaurant',
      staffName: 'Chef Sourav'
    },
    ratings: {
      rest_taste: 5,
      rest_service: 5,
      rest_freshness: 5,
      rest_presentation: 5,
      rest_ambiance: 5
    },
    outstandingStaff: 'Chef Sourav & Server Amit',
    comments: 'The Crab Masala and Odia fish curry were exceptionally fresh, caught locally in Chandipur! The level of attention Chef Sourav paid to our family’s spice preferences is highly commendable.',
    suggestions: 'Perhaps add a small beachfront dining terrace option for dinner under the stars.',
    requiresRecovery: false,
    recoveryStatus: 'Resolved',
    isRepeatGuest: true
  },
  {
    id: 'FB-103',
    timestamp: '2026-07-04T09:40:00Z',
    guestInfo: {
      name: 'Anirban Dasgupta',
      roomNumber: 'Room 204',
      mobile: '+91 94330 56789',
      email: 'anirban_dg@techsolutions.in',
      nationality: 'Indian',
      purposeOfVisit: 'Corporate Guests',
      checkInDate: '2026-07-03',
      checkOutDate: '2026-07-04',
      department: 'Conference & Events',
      staffName: 'Rohan Sharma'
    },
    ratings: {
      conf_av: 3,
      conf_support: 4,
      conf_layout: 5,
      conf_catering: 5,
      conf_coordination: 4
    },
    outstandingStaff: 'Rohan Sharma (IT Coord)',
    comments: 'We had a slight issue with the high-definition projector at the start of our corporate meeting. The IT support team arrived in 2 minutes and resolved the adapter glitch.',
    suggestions: 'Have backup HDMI and Type-C cables already connected to the tables to avoid delay.',
    complaintCategory: 'Technology / AV',
    requiresRecovery: true,
    recoveryStatus: 'Resolved',
    isRepeatGuest: false
  },
  {
    id: 'FB-104',
    timestamp: '2026-07-04T18:00:00Z',
    guestInfo: {
      name: 'Mr. & Mrs. David Carter',
      roomNumber: 'Suite 312',
      mobile: '+1 415 889 2211',
      email: 'david.carter@sftech.co',
      nationality: 'American',
      purposeOfVisit: 'Couples',
      checkInDate: '2026-06-29',
      checkOutDate: '2026-07-05',
      department: 'Housekeeping',
      staffName: 'Deepak G.'
    },
    ratings: {
      hk_clean: 5,
      hk_turndown: 5,
      hk_linen: 5,
      hk_toiletries: 4,
      hk_bathroom: 5
    },
    outstandingStaff: 'Deepak G. from Housekeeping',
    comments: 'Our suite was kept in pristine condition. The towel art (swan pairing) on our anniversary was a heartwarming touch. Exceptional luxury standards.',
    suggestions: 'Provide larger glass bottles of drinking water in the room by default.',
    requiresRecovery: false,
    recoveryStatus: 'Resolved',
    isRepeatGuest: false
  },
  {
    id: 'FB-105',
    timestamp: '2026-07-03T10:20:00Z',
    guestInfo: {
      name: 'Rakesh Patnaik',
      roomNumber: 'Room 118',
      mobile: '+91 99370 11223',
      email: 'rpatnaik@bhubaneswarcorp.com',
      nationality: 'Indian',
      purposeOfVisit: 'Families',
      checkInDate: '2026-07-01',
      checkOutDate: '2026-07-05',
      department: 'In-Room Dining',
      staffName: 'Unknown'
    },
    ratings: {
      ird_order: 4,
      ird_speed: 2,
      ird_temp: 3,
      ird_presentation: 4,
      ird_staff: 4
    },
    outstandingStaff: 'None',
    comments: 'The breakfast was ordered for 8:15 AM but it arrived cold at 8:50 AM. Kids were very hungry. This is not expected of a five-star luxury beach resort.',
    suggestions: 'Optimize delivery hotbox carts for breakfast rushes.',
    complaintCategory: 'Service Delay',
    requiresRecovery: true,
    recoveryStatus: 'In Progress',
    isRepeatGuest: false
  },
  {
    id: 'FB-106',
    timestamp: '2026-07-03T16:50:00Z',
    guestInfo: {
      name: 'Preeti & Vikram Singh',
      roomNumber: 'Suite 501',
      mobile: '+91 88220 99887',
      email: 'preeti.vikram@luxeestate.in',
      nationality: 'Indian',
      purposeOfVisit: 'Families',
      checkInDate: '2026-06-28',
      checkOutDate: '2026-07-03',
      department: 'Infinity Swimming Pool',
      staffName: 'Karan Kumar'
    },
    ratings: {
      pool_water: 5,
      pool_staff: 5,
      pool_towels: 5,
      pool_comfort: 5,
      pool_bites: 5
    },
    outstandingStaff: 'Karan Kumar (Pool Attendant)',
    comments: 'The kids loved the pool! Karan was exceptionally attentive, bringing cold cucumber water and fresh towels as soon as we sat down. Outstanding hospitality.',
    suggestions: 'Have some small floating toys or safe arm-floats available for toddlers.',
    requiresRecovery: false,
    recoveryStatus: 'Resolved',
    isRepeatGuest: true
  },
  {
    id: 'FB-107',
    timestamp: '2026-07-02T11:00:00Z',
    guestInfo: {
      name: 'Vikramaditya Rao',
      roomNumber: 'Villa 105',
      mobile: '+91 91100 44556',
      email: 'vrao@hyderabadbuilders.com',
      nationality: 'Indian',
      purposeOfVisit: 'VIP Guests',
      checkInDate: '2026-06-30',
      checkOutDate: '2026-07-03',
      department: 'Front Office',
      staffName: 'Meera Mohanty'
    },
    ratings: {
      fo_speed: 5,
      fo_welcome: 5,
      fo_staff: 5,
      fo_luggage: 5,
      fo_accuracy: 5
    },
    outstandingStaff: 'Meera Mohanty (Guest Relations)',
    comments: 'From the traditional tilak welcome and refreshing coconut water on arrival, to the smooth checkout, Meera made us feel like royalty. Beautiful Odisha experience.',
    suggestions: 'Keep a digital checkout receipt option via WhatsApp.',
    requiresRecovery: false,
    recoveryStatus: 'Resolved',
    isRepeatGuest: true
  },
  {
    id: 'FB-108',
    timestamp: '2026-07-02T22:30:00Z',
    guestInfo: {
      name: 'Dr. Arindam Sen',
      roomNumber: 'Room 322',
      mobile: '+91 98450 77112',
      email: 'arindam_sen@kolkatahealth.org',
      nationality: 'Indian',
      purposeOfVisit: 'Wedding Guests',
      checkInDate: '2026-07-01',
      checkOutDate: '2026-07-03',
      department: 'Utsav Grand Hall',
      staffName: 'Sujata Patra'
    },
    ratings: {
      banq_coord: 5,
      banq_catering: 5,
      banq_attentiveness: 4,
      banq_ambiance: 5,
      banq_clean: 5
    },
    outstandingStaff: 'Sujata Patra (Event Supervisor)',
    comments: 'The wedding catering was spectacular! The Odia specialty station (Chhena Poda and Rasagola) was the talk of the evening. Elegantly decorated venue.',
    suggestions: 'Add extra hand sanitizing stations next to the live buffet counters.',
    requiresRecovery: false,
    recoveryStatus: 'Resolved',
    isRepeatGuest: false
  },
  {
    id: 'FB-109',
    timestamp: '2026-07-01T23:45:00Z',
    guestInfo: {
      name: 'Marcus & Clara Vance',
      roomNumber: 'Suite 412',
      mobile: '+44 7700 900077',
      email: 'mvance@londondigital.co.uk',
      nationality: 'British',
      purposeOfVisit: 'Foreign Tourists',
      checkInDate: '2026-06-25',
      checkOutDate: '2026-07-02',
      department: 'The waves Bar & Lounge',
      staffName: 'Subhasish'
    },
    ratings: {
      bar_selection: 4,
      bar_mixologist: 5,
      bar_comfort: 5,
      bar_bites: 5,
      bar_attentiveness: 5
    },
    outstandingStaff: 'Subhasish (Mixologist)',
    comments: 'Subhasish is a true artist! He created a custom beach cocktail infused with fresh Odisha mango and lime that was refreshing beyond words. Perfect sea-breeze lounge.',
    suggestions: 'Increase the selection of single-malt scotch whiskies.',
    requiresRecovery: false,
    recoveryStatus: 'Resolved',
    isRepeatGuest: false
  },
  {
    id: 'FB-110',
    timestamp: '2026-07-01T15:15:00Z',
    guestInfo: {
      name: 'Ravi Teja',
      roomNumber: 'Room 214',
      mobile: '+91 90000 88888',
      email: 'raviteja@tejaalloys.com',
      nationality: 'Indian',
      purposeOfVisit: 'Group Tours',
      checkInDate: '2026-06-30',
      checkOutDate: '2026-07-02',
      department: 'Security & Safety',
      staffName: 'Unknown'
    },
    ratings: {
      sec_vigilance: 4,
      sec_welcome: 5,
      sec_valet: 2,
      sec_beach: 5,
      sec_integrity: 4
    },
    outstandingStaff: 'None',
    comments: 'Valet was slow to return my vehicle. I had to wait 25 minutes at the lobby, which caused me to miss my local tour start time.',
    suggestions: 'Hire more valet drivers during peak check-out hours (11 AM to 1 PM).',
    complaintCategory: 'Valet / Parking Delay',
    requiresRecovery: true,
    recoveryStatus: 'Pending',
    isRepeatGuest: false
  }
];

export const MOCK_TICKETS: InternalTicket[] = [
  {
    id: 'TK-101',
    feedbackId: 'FB-105',
    department: 'In-Room Dining',
    issueCategory: 'Service Delay',
    priorityLevel: 'High',
    assignedTo: 'F&B Manager - Mr. Alok Panda',
    rootCause: 'Kitchen received 14 simultaneous suite orders between 8:00 AM and 8:15 AM. Order-trolley elevator got stuck on floor 3 temporarily, creating a bottle-neck.',
    correctiveAction: 'Implemented a staggered delivery routing system. Scheduled routine weekly elevator PM (Preventive Maintenance). Pre-heated heated-boxes prior to morning rush.',
    completionDate: '2026-07-04',
    managerSignature: 'A. Panda',
    closedBy: 'Operations Director',
    followUpRequired: true
  },
  {
    id: 'TK-102',
    feedbackId: 'FB-110',
    department: 'Security & Safety',
    issueCategory: 'Valet / Parking Delay',
    priorityLevel: 'Medium',
    assignedTo: 'Security Chief - Mr. P.K. Nayak',
    rootCause: 'Three major group check-outs occurred at the same time. Only two valet drivers were on duty due to shift change overlap.',
    correctiveAction: 'Redesigned shifts to ensure that shift handovers happen during low-occupancy check-out hours (e.g., 2:00 PM). Valet roster increased by 2 extra associates on high occupancy checkout mornings.',
    completionDate: '2026-07-03',
    managerSignature: 'P.K. Nayak',
    closedBy: 'General Manager',
    followUpRequired: false
  },
  {
    id: 'TK-103',
    feedbackId: 'FB-103',
    department: 'Conference & Events',
    issueCategory: 'Technology / AV',
    priorityLevel: 'Medium',
    assignedTo: 'IT Coord - Rohan Sharma',
    rootCause: 'The floor HDMI cable connector became bent due to frequent heavy-duty corporate plugging.',
    correctiveAction: 'Replaced the cable with a heavy-duty reinforced braided copper HDMI cable. Installed an AV cable cubby box inside the executive board table.',
    completionDate: '2026-07-04',
    managerSignature: 'R. Sharma',
    closedBy: 'IT Manager',
    followUpRequired: false
  }
];
