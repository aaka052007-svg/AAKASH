/**
 * SMARTGATE AI - Realistic Demo Dataset
 * College Campus Smart Gate Management System
 * Note: All data is fictional for AI Immersion project demonstration.
 */

const INITIAL_DATA = {
  system: {
    name: "SMARTGATE AI",
    version: "2.4.0 (AI Immersion Prototype)",
    tagline: "Smarter Gates. Faster Exits. Safer Campus.",
    campus: "National Institute of Advanced Technology & AI",
    gateName: "Main North Gate - Terminal 01",
    mode: "Simulation Mode (No external biometric hardware required)"
  },

  users: [
    {
      id: "STUDENT_01",
      role: "Student",
      studentId: "CSE2026A001",
      name: "Harini Sree B",
      department: "CSE – AIML",
      year: "3rd Year (Batch 2026)",
      hostel: "Kaveri Girls Hostel",
      room: "Room 304",
      status: "Inside Campus",
      phone: "+91 98765 43210",
      email: "harini.sree@smartgate.edu",
      parentName: "Balasubramanian S",
      parentPhone: "+91 98765 11223",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      faceConfidenceScore: 99.4,
      attendance: "92.4%"
    },
    {
      id: "STUDENT_02",
      role: "Student",
      studentId: "ECE2026B042",
      name: "Rahul Sharma",
      department: "Electronics & Comm. (ECE)",
      year: "3rd Year (Batch 2026)",
      hostel: "Brahmaputra Boys Hostel",
      room: "Room 112",
      status: "Inside Campus",
      phone: "+91 98765 88990",
      email: "rahul.sharma@smartgate.edu",
      parentName: "Vikas Sharma",
      parentPhone: "+91 98765 44332",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80",
      faceConfidenceScore: 98.8,
      attendance: "71.5%"
    },
    {
      id: "STUDENT_03",
      role: "Student",
      studentId: "AIDS2026C105",
      name: "Priya Nair",
      department: "AI & Data Science (AIDS)",
      year: "2nd Year (Batch 2027)",
      hostel: "Ganga Girls Hostel",
      room: "Room 218",
      status: "Inside Campus",
      phone: "+91 98765 66778",
      email: "priya.nair@smartgate.edu",
      parentName: "Mohan Nair",
      parentPhone: "+91 98765 77889",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
      faceConfidenceScore: 99.1,
      attendance: "88.0%"
    },
    {
      id: "STUDENT_04",
      role: "Student",
      studentId: "MECH2025D018",
      name: "Karthik R",
      department: "Mechanical Engineering",
      year: "4th Year (Batch 2025)",
      hostel: "Yamuna Boys Hostel",
      room: "Room 405",
      status: "Outside Campus",
      phone: "+91 98765 33445",
      email: "karthik.r@smartgate.edu",
      parentName: "Ramaswamy K",
      parentPhone: "+91 98765 99001",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
      faceConfidenceScore: 99.5,
      attendance: "85.2%"
    },
    {
      id: "STUDENT_05",
      role: "Student",
      studentId: "IT2027E055",
      name: "Ananya M",
      department: "Information Technology",
      year: "2nd Year (Batch 2027)",
      hostel: "Kaveri Girls Hostel",
      room: "Room 209",
      status: "Inside Campus",
      phone: "+91 98765 22334",
      email: "ananya.m@smartgate.edu",
      parentName: "Murugan P",
      parentPhone: "+91 98765 55667",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80",
      faceConfidenceScore: 98.9,
      attendance: "94.8%"
    },
    {
      id: "STUDENT_06",
      role: "Student",
      studentId: "CSE2026A088",
      name: "Arjun Verma",
      department: "Computer Science & Engg",
      year: "3rd Year (Batch 2026)",
      hostel: "Brahmaputra Boys Hostel",
      room: "Room 220",
      status: "Inside Campus",
      phone: "+91 98765 12121",
      email: "arjun.verma@smartgate.edu",
      parentName: "Suresh Verma",
      parentPhone: "+91 98765 34343",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
      faceConfidenceScore: 99.2,
      attendance: "89.5%"
    }
  ],

  // Staff roles for quick login
  staffProfiles: {
    Warden: {
      id: "STAFF_WARDEN_01",
      name: "Dr. Arisudan Roy",
      role: "Warden",
      designation: "Chief Hostel Warden & Professor",
      department: "Hostel Administration & Student Affairs",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80"
    },
    Security: {
      id: "STAFF_SEC_01",
      name: "Chief Officer Ram Singh",
      role: "Security",
      designation: "Campus Gate Commander (Terminal 01)",
      department: "Campus Security & Surveillance Division",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80"
    },
    Admin: {
      id: "STAFF_ADMIN_01",
      name: "Dean Office / Admin Console",
      role: "Admin",
      designation: "Director of Student Welfare & Campus Tech",
      department: "Central University Administration",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80"
    }
  },

  // Leave Requests Database
  leaveRequests: [
    {
      id: "LR-2026-9041",
      studentId: "CSE2026A001",
      studentName: "Harini Sree B",
      department: "CSE – AIML",
      date: "2026-09-16",
      outTime: "18:30",
      inTime: "22:00",
      destination: "AI Immersion Hackathon Hub, Tech Park",
      reason: "Participating in inter-college Generative AI Hackathon finals presentation.",
      emergencyContact: "+91 98765 11223 (Father: Balasubramanian S)",
      status: "Approved",
      appliedAt: "2026-09-16 14:20",
      reviewedBy: "Dr. Arisudan Roy (Chief Warden)",
      reviewedAt: "2026-09-16 15:05",
      remarks: "Official academic event approved. Return strictly before 10:00 PM.",
      qrPassCode: "PASS-HARINI-CSE2026A001-OK"
    },
    {
      id: "LR-2026-9042",
      studentId: "AIDS2026C105",
      studentName: "Priya Nair",
      department: "AI & Data Science (AIDS)",
      date: "2026-09-16",
      outTime: "19:00",
      inTime: "22:30",
      destination: "Central Medical Clinic & Pharmacy",
      reason: "Urgent dental consultation and collecting prescribed medical supplies.",
      emergencyContact: "+91 98765 77889 (Father: Mohan Nair)",
      status: "Pending",
      appliedAt: "2026-09-16 16:45",
      reviewedBy: null,
      reviewedAt: null,
      remarks: "Awaiting Warden review.",
      qrPassCode: "PASS-PRIYA-AIDS2026C105-PENDING"
    },
    {
      id: "LR-2026-9040",
      studentId: "ECE2026B042",
      studentName: "Rahul Sharma",
      department: "Electronics & Comm. (ECE)",
      date: "2026-09-16",
      outTime: "17:00",
      inTime: "21:30",
      destination: "Phoenix City Mall, Downtown",
      reason: "Personal shopping with friends and dinner.",
      emergencyContact: "+91 98765 44332 (Father: Vikas Sharma)",
      status: "Rejected",
      appliedAt: "2026-09-16 11:15",
      reviewedBy: "Dr. Arisudan Roy (Chief Warden)",
      reviewedAt: "2026-09-16 12:30",
      remarks: "Attendance below mandatory 75% cutoff threshold (Current: 71.5%). Outing unapproved.",
      qrPassCode: "PASS-RAHUL-REJECTED"
    },
    {
      id: "LR-2026-9038",
      studentId: "MECH2025D018",
      studentName: "Karthik R",
      department: "Mechanical Engineering",
      date: "2026-09-16",
      outTime: "14:00",
      inTime: "21:00",
      destination: "TVS R&D Innovation Lab, Industrial Estate",
      reason: "Final semester robotics fabrication project component testing.",
      emergencyContact: "+91 98765 99001 (Father: Ramaswamy K)",
      status: "Approved",
      appliedAt: "2026-09-16 09:00",
      reviewedBy: "Dr. Arisudan Roy (Chief Warden)",
      reviewedAt: "2026-09-16 09:40",
      remarks: "Approved for final year capstone testing.",
      qrPassCode: "PASS-KARTHIK-MECH2025D018-OK"
    }
  ],

  // Gate History Logs
  gateHistory: [
    {
      id: "LOG-10982",
      timestamp: "2026-09-16 14:15:20",
      date: "2026-09-16",
      time: "14:15",
      studentId: "MECH2025D018",
      studentName: "Karthik R",
      department: "Mechanical Engineering",
      action: "Exit",
      method: "Face AI (Biometric)",
      confidence: "99.5%",
      leaveStatus: "Approved",
      leaveId: "LR-2026-9038",
      gateStatus: "Exit Granted",
      gateName: "Main North Gate",
      officer: "Officer Ram Singh"
    },
    {
      id: "LOG-10981",
      timestamp: "2026-09-16 13:40:12",
      date: "2026-09-16",
      time: "13:40",
      studentId: "IT2027E055",
      studentName: "Ananya M",
      department: "Information Technology",
      action: "Entry",
      method: "Digital QR Pass",
      confidence: "Verified",
      leaveStatus: "Normal Entry",
      leaveId: "N/A",
      gateStatus: "Entry Recorded",
      gateName: "Main South Gate",
      officer: "Officer David K"
    },
    {
      id: "LOG-10980",
      timestamp: "2026-09-16 12:05:44",
      date: "2026-09-16",
      time: "12:05",
      studentId: "CSE2026A088",
      studentName: "Arjun Verma",
      department: "Computer Science & Engg",
      action: "Exit",
      method: "Face AI (Biometric)",
      confidence: "99.2%",
      leaveStatus: "Approved",
      leaveId: "LR-2026-9029",
      gateStatus: "Exit Granted",
      gateName: "Main North Gate",
      officer: "Officer Ram Singh"
    },
    {
      id: "LOG-10979",
      timestamp: "2026-09-16 11:20:10",
      date: "2026-09-16",
      time: "11:20",
      studentId: "ECE2026B042",
      studentName: "Rahul Sharma",
      department: "Electronics & Comm.",
      action: "Exit Attempt",
      method: "Face AI (Biometric)",
      confidence: "98.8%",
      leaveStatus: "Rejected",
      leaveId: "LR-2026-9040",
      gateStatus: "Exit Access Denied",
      gateName: "Main North Gate",
      officer: "Officer Ram Singh",
      alertNote: "Unauthorized Exit Triggered: Leave rejected by Warden"
    },
    {
      id: "LOG-10978",
      timestamp: "2026-09-16 09:15:33",
      date: "2026-09-16",
      time: "09:15",
      studentId: "CSE2026A001",
      studentName: "Harini Sree B",
      department: "CSE – AIML",
      action: "Entry",
      method: "Face AI (Biometric)",
      confidence: "99.8%",
      leaveStatus: "Normal Entry",
      leaveId: "N/A",
      gateStatus: "Entry Recorded",
      gateName: "Main North Gate",
      officer: "Officer Ram Singh"
    }
  ],

  // System Notifications
  notifications: [
    {
      id: "NOTIF-101",
      targetRole: "Student",
      studentId: "CSE2026A001",
      title: "Leave Request Approved",
      message: "Your leave request for AI Immersion Hackathon has been approved by Chief Warden Dr. Arisudan Roy.",
      type: "success",
      time: "15:05",
      read: false
    },
    {
      id: "NOTIF-102",
      targetRole: "Warden",
      studentId: "AIDS2026C105",
      title: "New Leave Application",
      message: "Priya Nair (AIDS2026C105) has submitted an urgent medical clinic leave request.",
      type: "info",
      time: "16:45",
      read: false
    },
    {
      id: "NOTIF-103",
      targetRole: "Security",
      studentId: "ECE2026B042",
      title: "Unauthorized Exit Blocked",
      message: "Student Rahul Sharma attempted gate exit without approved leave. Barrier remained locked.",
      type: "alert",
      time: "11:20",
      read: false
    }
  ],

  // Security Unauthorized Alerts
  securityAlerts: [
    {
      id: "ALERT-801",
      studentId: "ECE2026B042",
      studentName: "Rahul Sharma",
      department: "Electronics & Comm. (ECE)",
      time: "11:20 AM",
      reason: "Leave status: REJECTED (Low attendance cutoff). Barrier held locked.",
      status: "Investigated / Guard Advised",
      level: "High",
      resolved: false
    }
  ],

  // AI Insights Analytics Metrics
  aiAnalytics: {
    peakExitWindow: "5:00 PM – 7:00 PM",
    averageVerificationLatency: 1.28,
    accuracyScore: 99.4,
    anomalyCount: 2,
    exitDistributionHours: [
      { hour: "06:00", exits: 4, entries: 12 },
      { hour: "08:00", exits: 15, entries: 84 },
      { hour: "10:00", exits: 22, entries: 35 },
      { hour: "12:00", exits: 48, entries: 26 },
      { hour: "14:00", exits: 62, entries: 18 },
      { hour: "16:00", exits: 85, entries: 24 },
      { hour: "17:00", exits: 142, entries: 38 },
      { hour: "18:00", exits: 186, entries: 52 },
      { hour: "19:00", exits: 110, entries: 98 },
      { hour: "20:00", exits: 45, entries: 140 },
      { hour: "21:00", exits: 18, entries: 172 },
      { hour: "22:00", exits: 6, entries: 65 }
    ],
    deptStats: [
      { dept: "CSE & AIML", count: 182, percentage: 38 },
      { dept: "ECE", count: 96, percentage: 20 },
      { dept: "AIDS", count: 72, percentage: 15 },
      { dept: "Mechanical", count: 68, percentage: 14 },
      { dept: "IT & Other", count: 62, percentage: 13 }
    ]
  }
};

window.INITIAL_DATA = INITIAL_DATA;
