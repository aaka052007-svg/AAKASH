/**
 * SMARTGATE AI - Central Reactive Store
 * Handles localStorage persistence, event dispatching, and business logic.
 */

class SmartGateStore {
  constructor() {
    this.STORAGE_KEY = "SMARTGATE_AI_STORAGE_V1";
    this.listeners = [];
    this.state = this.loadState();

    // Default current role & user
    this.currentRole = localStorage.getItem("SMARTGATE_CURRENT_ROLE") || "Student";
    this.currentStudentId = localStorage.getItem("SMARTGATE_CURRENT_STUDENT") || "CSE2026A001";
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load saved state, falling back to initial data", e);
    }
    return JSON.parse(JSON.stringify(window.INITIAL_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
    window.dispatchEvent(new CustomEvent("smartgate:state-updated", { detail: this.state }));
  }

  // --- Role & Identity ---

  setRole(role, studentId = null) {
    this.currentRole = role;
    localStorage.setItem("SMARTGATE_CURRENT_ROLE", role);
    if (studentId) {
      this.currentStudentId = studentId;
      localStorage.setItem("SMARTGATE_CURRENT_STUDENT", studentId);
    }
    this.notify();
  }

  getCurrentUser() {
    if (this.currentRole === "Student") {
      return (
        this.state.users.find(u => u.studentId === this.currentStudentId) ||
        this.state.users[0]
      );
    }
    return this.state.staffProfiles[this.currentRole] || this.state.staffProfiles.Security;
  }

  // --- Student Leave Actions ---

  applyLeave({ studentId, date, outTime, inTime, destination, reason, emergencyContact }) {
    const student = this.state.users.find(u => u.studentId === studentId);
    if (!student) return null;

    const newId = `LR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newLeave = {
      id: newId,
      studentId: student.studentId,
      studentName: student.name,
      department: student.department,
      date: date || new Date().toISOString().split('T')[0],
      outTime: outTime || "18:00",
      inTime: inTime || "21:30",
      destination: destination || "City Center",
      reason: reason || "Personal outing / College project",
      emergencyContact: emergencyContact || student.parentPhone,
      status: "Pending",
      appliedAt: nowStr,
      reviewedBy: null,
      reviewedAt: null,
      remarks: "Awaiting Warden Review",
      qrPassCode: `PASS-${student.name.split(' ')[0].toUpperCase()}-${student.studentId}-PENDING`
    };

    this.state.leaveRequests.unshift(newLeave);

    // Add notification for Warden
    this.state.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      targetRole: "Warden",
      studentId: student.studentId,
      title: "New Leave Application",
      message: `${student.name} (${student.studentId}) submitted a leave application for ${destination}.`,
      type: "info",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });

    this.saveState();
    return newLeave;
  }

  updateLeaveStatus(leaveId, newStatus, remarks = "") {
    const leave = this.state.leaveRequests.find(l => l.id === leaveId);
    if (!leave) return false;

    leave.status = newStatus;
    leave.reviewedBy = "Dr. Arisudan Roy (Chief Warden)";
    leave.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    leave.remarks = remarks || (newStatus === "Approved" ? "Approved by Chief Warden. Adhere to return curfew." : "Rejected due to attendance or disciplinary policies.");

    if (newStatus === "Approved") {
      leave.qrPassCode = `PASS-${leave.studentName.split(' ')[0].toUpperCase()}-${leave.studentId}-OK`;
    }

    // Notify Student
    this.state.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      targetRole: "Student",
      studentId: leave.studentId,
      title: `Leave Request ${newStatus}`,
      message: `Your leave request ${leave.id} for "${leave.destination}" was ${newStatus.toLowerCase()} by the Warden.`,
      type: newStatus === "Approved" ? "success" : "alert",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });

    this.saveState();
    return true;
  }

  // --- Smart Gate Actions ---

  recordGateScan({ studentId, action, method, status, leaveStatus, officer, reason }) {
    const student = this.state.users.find(u => u.studentId === studentId);
    if (!student) return null;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const dateStr = now.toISOString().split('T')[0];
    const isGranted = status === "Exit Granted" || status === "Entry Recorded";

    const logEntry = {
      id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: timestampStr,
      date: dateStr,
      time: timeStr,
      studentId: student.studentId,
      studentName: student.name,
      department: student.department,
      action: action, // "Exit" | "Entry" | "Exit Attempt"
      method: method || "Face AI (Biometric)",
      confidence: `${(98.5 + Math.random() * 1.3).toFixed(1)}%`,
      leaveStatus: leaveStatus || "Not Checked",
      gateStatus: status, // "Exit Granted" | "Exit Access Denied" | "Entry Recorded"
      gateName: "Main North Gate",
      officer: officer || "Officer Ram Singh",
      alertNote: reason || ""
    };

    this.state.gateHistory.unshift(logEntry);

    // Update Student Inside/Outside status
    if (status === "Exit Granted") {
      student.status = "Outside Campus";
      // Notify Student
      this.state.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        targetRole: "Student",
        studentId: student.studentId,
        title: "Gate Exit Recorded",
        message: `Your exit was logged at ${timeStr} through Main North Gate. Return before specified in-time.`,
        type: "info",
        time: timeStr,
        read: false
      });
    } else if (status === "Entry Recorded") {
      student.status = "Inside Campus";
      // Notify Student
      this.state.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        targetRole: "Student",
        studentId: student.studentId,
        title: "Campus Re-entry Recorded",
        message: `Welcome back! Your entry was logged at ${timeStr}.`,
        type: "success",
        time: timeStr,
        read: false
      });
    } else if (status === "Exit Access Denied") {
      // Create Security Alert
      const alertId = `ALERT-${Math.floor(800 + Math.random() * 200)}`;
      const newAlert = {
        id: alertId,
        studentId: student.studentId,
        studentName: student.name,
        department: student.department,
        time: timeStr,
        reason: reason || "Attempted exit without approved warden leave pass. Gate turnstile locked.",
        status: "Active Alert",
        level: "High",
        resolved: false
      };

      this.state.securityAlerts.unshift(newAlert);

      // Security Notification
      this.state.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        targetRole: "Security",
        studentId: student.studentId,
        title: "⚠ UNAUTHORIZED EXIT ATTEMPT",
        message: `${student.name} (${student.studentId}) attempted unapproved exit at Main North Gate. Turnstile locked.`,
        type: "alert",
        time: timeStr,
        read: false
      });
    }

    this.saveState();
    return logEntry;
  }

  resolveAlert(alertId) {
    const alert = this.state.securityAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.status = "Resolved / Guard Cleared";
      this.saveState();
    }
  }

  markNotificationRead(notifId) {
    const n = this.state.notifications.find(item => item.id === notifId);
    if (n) {
      n.read = true;
      this.saveState();
    }
  }

  markAllNotificationsRead() {
    this.state.notifications.forEach(n => { n.read = true; });
    this.saveState();
  }

  resetDemoData() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.state = JSON.parse(JSON.stringify(window.INITIAL_DATA));
    this.saveState();
  }

  // --- Utility Getters ---

  getStudentActiveLeave(studentId) {
    return this.state.leaveRequests.find(
      l => l.studentId === studentId && l.status === "Approved"
    );
  }

  getStudentLatestLeave(studentId) {
    return this.state.leaveRequests.find(l => l.studentId === studentId);
  }

  getStats() {
    const totalStudents = 2450;
    const trackedOutside = this.state.users.filter(u => u.status === "Outside Campus").length;
    // Scale for realistic large campus metrics
    const simulatedOutsideBase = 318;
    const studentsOutside = simulatedOutsideBase + trackedOutside;
    const studentsInside = totalStudents - studentsOutside;

    const approvedLeavesToday = this.state.leaveRequests.filter(
      l => l.status === "Approved"
    ).length;
    const pendingRequests = this.state.leaveRequests.filter(
      l => l.status === "Pending"
    ).length;

    const exitsToday = this.state.gateHistory.filter(
      l => l.gateStatus === "Exit Granted"
    ).length;
    const entriesToday = this.state.gateHistory.filter(
      l => l.gateStatus === "Entry Recorded"
    ).length;
    const activeAlerts = this.state.securityAlerts.filter(a => !a.resolved).length;

    return {
      totalStudents,
      studentsInside,
      studentsOutside,
      approvedLeavesToday,
      pendingRequests,
      exitsToday,
      entriesToday,
      activeAlerts
    };
  }
}

window.store = new SmartGateStore();
