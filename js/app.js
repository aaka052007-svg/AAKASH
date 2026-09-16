/**
 * SMARTGATE AI - Main Application Controller
 * Handles routing, view rendering, role switching, user interactions, and demo scenarios.
 */

class SmartGateApp {
  constructor() {
    this.currentView = "dashboard";
    this.isSidebarOpen = false;
    this.historyFilter = { action: "all", search: "" };
    this.leaveFilter = { status: "all" };
    this.studentSearch = "";
    this.activeQrInstance = null;

    // Initialize after DOM loaded
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  init() {
    // Subscribe to store updates
    window.store.subscribe(() => {
      this.updateHeaderAndSidebar();
      this.renderActiveView();
      this.renderNotifications();
    });

    // Start Live Clock
    this.startClock();

    // Check if previously logged in
    const isLoggedIn = localStorage.getItem("SMARTGATE_IS_LOGGED_IN") === "true";
    if (isLoggedIn) {
      document.getElementById("view-login").classList.add("hidden");
      document.getElementById("app-shell").classList.remove("hidden");
      this.updateHeaderAndSidebar();
      this.navigateTo("dashboard");
    } else {
      document.getElementById("view-login").classList.remove("hidden");
      document.getElementById("app-shell").classList.add("hidden");
    }

    // Close popovers on click outside
    document.addEventListener("click", (e) => {
      const roleMenu = document.getElementById("roleDropdownMenu");
      const roleBtn = document.getElementById("roleSwitcherBtn");
      if (roleMenu && !roleMenu.contains(e.target) && roleBtn && !roleBtn.contains(e.target)) {
        roleMenu.classList.add("hidden");
      }

      const notifMenu = document.getElementById("notifDropdownMenu");
      const notifBtn = e.target.closest("button[onclick*='toggleNotificationMenu']");
      if (notifMenu && !notifMenu.contains(e.target) && !notifBtn) {
        notifMenu.classList.add("hidden");
      }
    });
  }

  startClock() {
    const clockEl = document.getElementById("liveClock");
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString([], { hour12: false });
      }
    };
    update();
    setInterval(update, 1000);
  }

  // --- Authentication & Role Switching ---

  selectLoginRole(role) {
    document.getElementById("loginSelectedRole").value = role;
    const btns = document.querySelectorAll("#loginRoleGrid .role-btn");
    btns.forEach(btn => {
      if (btn.innerText.includes(role)) {
        btn.classList.add("active", "border-blue-500", "bg-blue-950/60", "text-blue-300");
        btn.classList.remove("border-slate-700", "bg-slate-900/60", "text-slate-300");
      } else {
        btn.classList.remove("active", "border-blue-500", "bg-blue-950/60", "text-blue-300");
        btn.classList.add("border-slate-700", "bg-slate-900/60", "text-slate-300");
      }
    });

    const userLabel = document.getElementById("loginUserInputLabel");
    const userInput = document.getElementById("loginUsername");
    if (role === "Student") {
      userLabel.textContent = "Student ID";
      userInput.value = "CSE2026A001";
    } else if (role === "Warden") {
      userLabel.textContent = "Faculty / Warden ID";
      userInput.value = "STAFF_WARDEN_01";
    } else if (role === "Security") {
      userLabel.textContent = "Guard Badge ID";
      userInput.value = "STAFF_SEC_01";
    } else {
      userLabel.textContent = "Admin User ID";
      userInput.value = "STAFF_ADMIN_01";
    }
  }

  handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById("loginSelectedRole").value;
    const username = document.getElementById("loginUsername").value.trim();

    localStorage.setItem("SMARTGATE_IS_LOGGED_IN", "true");
    window.store.setRole(role, role === "Student" ? username : null);

    document.getElementById("view-login").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");

    this.showToast(`Logged in successfully as ${role}`, "success");
    this.navigateTo("dashboard");
  }

  quickLogin(role, studentId = null) {
    localStorage.setItem("SMARTGATE_IS_LOGGED_IN", "true");
    window.store.setRole(role, studentId || (role === "Student" ? "CSE2026A001" : null));

    document.getElementById("view-login").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");

    this.showToast(`Switched into demo profile: ${role}`, "info");
    this.navigateTo("dashboard");
  }

  switchRole(role, studentId = null) {
    window.store.setRole(role, studentId);
    document.getElementById("roleDropdownMenu").classList.add("hidden");
    this.showToast(`Switched to active view: ${role}`, "info");
    this.navigateTo("dashboard");
  }

  logout() {
    localStorage.removeItem("SMARTGATE_IS_LOGGED_IN");
    document.getElementById("app-shell").classList.add("hidden");
    document.getElementById("view-login").classList.remove("hidden");
    this.showToast("Logged out of SMARTGATE AI", "info");
  }

  toggleRoleDropdown() {
    const menu = document.getElementById("roleDropdownMenu");
    menu.classList.toggle("hidden");
  }

  toggleNotificationMenu() {
    const menu = document.getElementById("notifDropdownMenu");
    menu.classList.toggle("hidden");
  }

  toggleSidebar() {
    const sidebar = document.getElementById("mainSidebar");
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      sidebar.classList.remove("-translate-x-full");
    } else {
      sidebar.classList.add("-translate-x-full");
    }
  }

  toggleSound() {
    const isMuted = window.soundManager.toggleMute();
    const icon = document.getElementById("soundIcon");
    if (isMuted) {
      icon.className = "fa-solid fa-volume-xmark text-rose-400";
      this.showToast("Sound muted", "info");
    } else {
      icon.className = "fa-solid fa-volume-high text-cyan-400";
      window.soundManager.playScanBeep();
      this.showToast("Sound enabled", "success");
    }
  }

  // --- Header & Sidebar updates ---

  updateHeaderAndSidebar() {
    const role = window.store.currentRole;
    const user = window.store.getCurrentUser();
    const stats = window.store.getStats();

    // Header Role Badge
    const roleBadge = document.getElementById("currentRoleBadge");
    if (roleBadge) {
      roleBadge.textContent = `Role: ${role}`;
    }

    // User Avatar & Name
    const avatarEl = document.getElementById("headerUserAvatar");
    const nameEl = document.getElementById("headerUserName");
    const subEl = document.getElementById("headerUserSub");

    if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    if (nameEl) nameEl.textContent = user.name;
    if (subEl) {
      subEl.textContent = role === "Student" ? user.studentId : user.designation || role;
    }

    // Sidebar Role info
    const sName = document.getElementById("sidebarRoleName");
    const sIcon = document.getElementById("sidebarRoleIcon");
    if (sName) sName.textContent = role;
    if (sIcon) {
      if (role === "Student") sIcon.innerHTML = `<i class="fa-solid fa-graduation-cap"></i>`;
      else if (role === "Warden") sIcon.innerHTML = `<i class="fa-solid fa-user-tie"></i>`;
      else if (role === "Security") sIcon.innerHTML = `<i class="fa-solid fa-user-shield"></i>`;
      else sIcon.innerHTML = `<i class="fa-solid fa-sliders"></i>`;
    }

    // Badges
    const pendingLeaveBadge = document.getElementById("sidebarPendingLeaveCount");
    if (pendingLeaveBadge) {
      pendingLeaveBadge.textContent = stats.pendingRequests;
      pendingLeaveBadge.classList.toggle("hidden", stats.pendingRequests === 0);
    }

    const alertBadge = document.getElementById("sidebarAlertCount");
    if (alertBadge) {
      alertBadge.textContent = stats.activeAlerts;
      alertBadge.classList.toggle("hidden", stats.activeAlerts === 0);
    }

    // Global Unauthorized Banner check
    const banner = document.getElementById("unauthorizedGlobalBanner");
    const unresolvedAlerts = window.store.state.securityAlerts.filter(a => !a.resolved);
    if (banner) {
      if (unresolvedAlerts.length > 0 && (role === "Security" || role === "Admin")) {
        const latest = unresolvedAlerts[0];
        document.getElementById("globalBannerTitle").textContent = `⚠ UNAUTHORIZED EXIT: ${latest.studentName} (${latest.studentId})`;
        document.getElementById("globalBannerDetail").textContent = `${latest.reason} • Time: ${latest.time}`;
        banner.classList.remove("hidden");
      } else {
        banner.classList.add("hidden");
      }
    }
  }

  // --- Router & Navigation ---

  navigateTo(viewName) {
    this.currentView = viewName;

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
    });
    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) activeNav.classList.add("active");

    // Close mobile sidebar if open
    if (window.innerWidth < 1024) {
      const sidebar = document.getElementById("mainSidebar");
      sidebar.classList.add("-translate-x-full");
      this.isSidebarOpen = false;
    }

    this.renderActiveView();
  }

  renderActiveView() {
    const container = document.getElementById("viewContainer");
    if (!container) return;

    switch (this.currentView) {
      case "dashboard":
        this.renderDashboard(container);
        break;
      case "students":
        this.renderStudentsView(container);
        break;
      case "leave-requests":
        this.renderLeaveRequestsView(container);
        break;
      case "smart-gate":
        this.renderSmartGateView(container);
        break;
      case "gate-history":
        this.renderGateHistoryView(container);
        break;
      case "ai-insights":
        this.renderAiInsightsView(container);
        break;
      case "security-alerts":
        this.renderSecurityAlertsView(container);
        break;
      case "settings":
        this.renderSettingsView(container);
        break;
      default:
        this.renderDashboard(container);
    }
  }

  // ======================== VIEW RENDERERS ========================

  // 1. Dynamic Dashboard Router
  renderDashboard(container) {
    const role = window.store.currentRole;
    if (role === "Student") {
      this.renderStudentDashboard(container);
    } else if (role === "Warden") {
      this.renderWardenDashboard(container);
    } else if (role === "Security") {
      this.renderSecurityDashboard(container);
    } else {
      this.renderAdminDashboard(container);
    }
  }

  // --- A. Student Dashboard ---
  renderStudentDashboard(container) {
    const student = window.store.getCurrentUser();
    const myLeaves = window.store.state.leaveRequests.filter(l => l.studentId === student.studentId);
    const activeLeave = myLeaves.find(l => l.status === "Approved");
    const latestLeave = myLeaves[0];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Welcome Banner -->
        <div class="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800/40">
          <div class="relative z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-950/80 text-cyan-300 border border-blue-800/60 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Student Portal
            </div>
            <h2 class="text-2xl font-extrabold text-white">Welcome, ${student.name}</h2>
            <p class="text-slate-400 text-xs mt-1">SmartGate AI Real-Time Out-Pass & Campus Tracking</p>
          </div>

          <div class="flex items-center gap-3 relative z-10">
            <button onclick="window.app.openLeaveModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2">
              <i class="fa-solid fa-plus"></i>
              <span>Apply for Leave</span>
            </button>

            ${activeLeave ? `
              <button onclick="window.app.showGatePass('${activeLeave.id}')" class="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500 text-emerald-300 text-xs font-bold transition-all flex items-center gap-2">
                <i class="fa-solid fa-qrcode"></i>
                <span>Digital Gate Pass</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Student Profile & Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Information Card -->
          <div class="glass-panel p-5 rounded-2xl border border-blue-900/30 space-y-4">
            <div class="flex items-center gap-3 pb-3 border-b border-slate-800">
              <img src="${student.avatar}" class="w-12 h-12 rounded-xl object-cover border border-cyan-500/50">
              <div>
                <h3 class="text-sm font-bold text-white">${student.name}</h3>
                <span class="text-xs font-mono text-cyan-400">${student.studentId}</span>
              </div>
            </div>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-400">Department:</span>
                <span class="font-medium text-slate-200">${student.department}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Year / Batch:</span>
                <span class="font-medium text-slate-200">${student.year}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Hostel & Room:</span>
                <span class="font-medium text-slate-200">${student.hostel} • ${student.room}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Current Status:</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-mono ${student.status === 'Inside Campus' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'}">
                  ${student.status}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Attendance Cutoff:</span>
                <span class="font-mono ${parseFloat(student.attendance) >= 75 ? 'text-emerald-400' : 'text-rose-400 font-bold'}">${student.attendance}</span>
              </div>
            </div>
          </div>

          <!-- Active Leave Status Card -->
          <div class="glass-panel p-5 rounded-2xl border border-blue-900/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Leave Status</span>
                ${latestLeave ? `
                  <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    latestLeave.status === 'Approved' ? 'badge-status-approved' :
                    latestLeave.status === 'Pending' ? 'badge-status-pending' : 'badge-status-rejected'
                  }">
                    ${latestLeave.status.toUpperCase()}
                  </span>
                ` : `<span class="text-xs text-slate-500">None</span>`}
              </div>

              ${latestLeave ? `
                <div class="space-y-2 text-xs">
                  <div class="text-sm font-bold text-white">${latestLeave.destination}</div>
                  <p class="text-slate-400 text-xs line-clamp-2">${latestLeave.reason}</p>
                  <div class="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div><i class="fa-solid fa-clock mr-1 text-cyan-400"></i> ${latestLeave.date} • ${latestLeave.outTime} to ${latestLeave.inTime}</div>
                    <div><i class="fa-solid fa-user-shield mr-1 text-indigo-400"></i> Remarks: ${latestLeave.remarks || 'Pending Review'}</div>
                  </div>
                </div>
              ` : `
                <div class="py-6 text-center text-xs text-slate-400">
                  <i class="fa-solid fa-file-circle-check text-2xl text-slate-600 mb-2"></i>
                  <p>No active leave request submitted today.</p>
                </div>
              `}
            </div>

            <div class="mt-4 pt-3 border-t border-slate-800">
              ${activeLeave ? `
                <button onclick="window.app.showGatePass('${activeLeave.id}')" class="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                  <i class="fa-solid fa-qrcode"></i> View Digital Pass
                </button>
              ` : `
                <button onclick="window.app.openLeaveModal()" class="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                  <i class="fa-solid fa-plus"></i> Apply for Out-Pass
                </button>
              `}
            </div>
          </div>

          <!-- Smart Gate Readiness Card -->
          <div class="glass-panel p-5 rounded-2xl border border-blue-900/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Gate Access Clearance</span>
                <span class="text-xs font-mono text-cyan-400">TERMINAL 01</span>
              </div>

              <div class="p-4 rounded-xl ${activeLeave ? 'bg-emerald-950/40 border border-emerald-700/50' : 'bg-rose-950/30 border border-rose-800/40'} text-center space-y-2">
                <div class="w-10 h-10 mx-auto rounded-full ${activeLeave ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} flex items-center justify-center text-lg font-bold">
                  <i class="fa-solid ${activeLeave ? 'fa-unlock' : 'fa-lock'}"></i>
                </div>
                <div class="text-xs font-bold ${activeLeave ? 'text-emerald-300' : 'text-rose-300'}">
                  ${activeLeave ? 'EXIT AUTHORIZED' : 'GATE EXIT LOCKED'}
                </div>
                <p class="text-[11px] text-slate-400 leading-tight">
                  ${activeLeave ? 'Biometric match will immediately open gate turnstile.' : 'Approaching gate without approved leave will trigger unauthorized alert.'}
                </p>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-800">
              <button onclick="window.app.navigateTo('smart-gate')" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                <i class="fa-solid fa-camera"></i> Test Smart Gate Scanner
              </button>
            </div>
          </div>

        </div>

        <!-- My Leave Requests History Table -->
        <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-clock-rotate-left text-cyan-400"></i> My Leave Requests
            </h3>
            <span class="text-xs text-slate-400">${myLeaves.length} Total Records</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 border-b border-slate-800 uppercase font-mono text-[11px]">
                <tr>
                  <th class="pb-3">Request ID</th>
                  <th class="pb-3">Date & Time</th>
                  <th class="pb-3">Destination</th>
                  <th class="pb-3">Reason</th>
                  <th class="pb-3">Status</th>
                  <th class="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-slate-300">
                ${myLeaves.length > 0 ? myLeaves.map(leave => `
                  <tr class="hover:bg-slate-900/40 transition-colors">
                    <td class="py-3.5 font-mono text-cyan-400">${leave.id}</td>
                    <td class="py-3.5 font-mono">${leave.date} <span class="text-slate-500">${leave.outTime} - ${leave.inTime}</span></td>
                    <td class="py-3.5 font-semibold text-white">${leave.destination}</td>
                    <td class="py-3.5 text-slate-400 max-w-xs truncate">${leave.reason}</td>
                    <td class="py-3.5">
                      <span class="px-2 py-0.5 rounded text-[11px] font-mono ${
                        leave.status === 'Approved' ? 'badge-status-approved' :
                        leave.status === 'Pending' ? 'badge-status-pending' : 'badge-status-rejected'
                      }">
                        ${leave.status}
                      </span>
                    </td>
                    <td class="py-3.5 text-right">
                      ${leave.status === 'Approved' ? `
                        <button onclick="window.app.showGatePass('${leave.id}')" class="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-blue-500/40 rounded text-[11px] font-mono">
                          View Pass
                        </button>
                      ` : `
                        <span class="text-slate-500 text-[11px]">—</span>
                      `}
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" class="py-6 text-center text-slate-400">No leave requests found. Click "Apply for Leave" above.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // --- B. Warden Dashboard ---
  renderWardenDashboard(container) {
    const leaves = window.store.state.leaveRequests;
    const pendingLeaves = leaves.filter(l => l.status === "Pending");
    const reviewedLeaves = leaves.filter(l => l.status !== "Pending");

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Warden Top Banner -->
        <div class="p-6 rounded-2xl glass-panel border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Hostel Warden Console
            </div>
            <h2 class="text-2xl font-extrabold text-white">Hostel Out-Pass Management</h2>
            <p class="text-slate-400 text-xs mt-1">Review student applications, enforce curfew limits, and synchronize approval with Smart Gate AI.</p>
          </div>

          <div class="flex items-center gap-3">
            <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span class="text-[10px] uppercase text-slate-400 font-mono block">Pending Review</span>
              <span class="text-xl font-bold font-mono text-amber-400">${pendingLeaves.length}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span class="text-[10px] uppercase text-slate-400 font-mono block">Approved Today</span>
              <span class="text-xl font-bold font-mono text-emerald-400">${leaves.filter(l => l.status === 'Approved').length}</span>
            </div>
          </div>
        </div>

        <!-- Pending Leave Requests Table -->
        <div class="glass-panel p-6 rounded-2xl border border-amber-900/30 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-hourglass-half text-amber-400"></i> Pending Leave Approvals
            </h3>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
              ${pendingLeaves.length} Requests Awaiting
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 border-b border-slate-800 uppercase font-mono text-[11px]">
                <tr>
                  <th class="pb-3">Student Name</th>
                  <th class="pb-3">Student ID</th>
                  <th class="pb-3">Destination</th>
                  <th class="pb-3">Date & Time</th>
                  <th class="pb-3">Reason</th>
                  <th class="pb-3">Status</th>
                  <th class="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-slate-300">
                ${pendingLeaves.length > 0 ? pendingLeaves.map(leave => `
                  <tr class="hover:bg-slate-900/40 transition-colors">
                    <td class="py-3.5 font-bold text-white">${leave.studentName}</td>
                    <td class="py-3.5 font-mono text-cyan-400">${leave.studentId}</td>
                    <td class="py-3.5">${leave.destination}</td>
                    <td class="py-3.5 font-mono">${leave.date} <span class="text-slate-500">${leave.outTime} - ${leave.inTime}</span></td>
                    <td class="py-3.5 text-slate-400 max-w-xs truncate" title="${leave.reason}">${leave.reason}</td>
                    <td class="py-3.5">
                      <span class="px-2 py-0.5 rounded text-[11px] font-mono badge-status-pending">Pending</span>
                    </td>
                    <td class="py-3.5 text-right space-x-2">
                      <button onclick="window.app.approveLeave('${leave.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-all shadow-md shadow-emerald-600/20">
                        Approve
                      </button>
                      <button onclick="window.app.rejectLeave('${leave.id}')" class="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg font-semibold text-xs transition-all">
                        Reject
                      </button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400">
                      <i class="fa-solid fa-circle-check text-2xl text-emerald-400 mb-2 block"></i>
                      All leave requests have been reviewed!
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Reviewed Leave History -->
        <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-list-check text-cyan-400"></i> Recently Reviewed Requests
            </h3>
            <span class="text-xs text-slate-400">${reviewedLeaves.length} Total</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 border-b border-slate-800 uppercase font-mono text-[11px]">
                <tr>
                  <th class="pb-3">Student Name</th>
                  <th class="pb-3">Student ID</th>
                  <th class="pb-3">Destination</th>
                  <th class="pb-3">Review Remarks</th>
                  <th class="pb-3">Reviewed At</th>
                  <th class="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-slate-300">
                ${reviewedLeaves.map(leave => `
                  <tr class="hover:bg-slate-900/40 transition-colors">
                    <td class="py-3 font-semibold text-slate-200">${leave.studentName}</td>
                    <td class="py-3 font-mono text-cyan-400">${leave.studentId}</td>
                    <td class="py-3">${leave.destination}</td>
                    <td class="py-3 text-slate-400 max-w-xs truncate">${leave.remarks || 'Standard approval'}</td>
                    <td class="py-3 font-mono text-slate-500">${leave.reviewedAt || 'Earlier today'}</td>
                    <td class="py-3 text-right">
                      <span class="px-2 py-0.5 rounded text-[11px] font-mono ${leave.status === 'Approved' ? 'badge-status-approved' : 'badge-status-rejected'}">
                        ${leave.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // --- C. Security Dashboard ---
  renderSecurityDashboard(container) {
    const stats = window.store.getStats();
    const history = window.store.state.gateHistory.slice(0, 10);
    const activeAlerts = window.store.state.securityAlerts.filter(a => !a.resolved);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Security Top Banner -->
        <div class="p-6 rounded-2xl glass-panel border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-950 text-amber-300 border border-amber-800/60 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Terminal 01 Security Guard Post
            </div>
            <h2 class="text-2xl font-extrabold text-white">Live Gate Access & Security Surveillance</h2>
            <p class="text-slate-400 text-xs mt-1">Real-time gate telemetry, biometric clearance feed, and perimeter violation intercept.</p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="window.app.navigateTo('smart-gate')" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-2">
              <i class="fa-solid fa-camera"></i> Open Smart Gate Scanner
            </button>
          </div>
        </div>

        <!-- Today's Gate Activity KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs uppercase font-mono">Students Exited</span>
              <i class="fa-solid fa-arrow-right-from-bracket text-cyan-400"></i>
            </div>
            <div class="text-2xl font-bold font-mono text-white">${stats.exitsToday}</div>
            <div class="text-[11px] text-slate-500 mt-1">Logged today at Terminal 01</div>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs uppercase font-mono">Students Entered</span>
              <i class="fa-solid fa-arrow-right-to-bracket text-emerald-400"></i>
            </div>
            <div class="text-2xl font-bold font-mono text-white">${stats.entriesToday}</div>
            <div class="text-[11px] text-slate-500 mt-1">Returned inside campus</div>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs uppercase font-mono">Currently Outside</span>
              <i class="fa-solid fa-map-pin text-amber-400"></i>
            </div>
            <div class="text-2xl font-bold font-mono text-amber-400">${stats.studentsOutside}</div>
            <div class="text-[11px] text-slate-500 mt-1">Tracking against curfew</div>
          </div>

          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <div class="flex items-center justify-between text-slate-400 mb-2">
              <span class="text-xs uppercase font-mono">Active Alerts</span>
              <i class="fa-solid fa-triangle-exclamation text-rose-400"></i>
            </div>
            <div class="text-2xl font-bold font-mono ${stats.activeAlerts > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}">
              ${stats.activeAlerts}
            </div>
            <div class="text-[11px] text-slate-500 mt-1">Requiring guard intervention</div>
          </div>
        </div>

        <!-- Active Security Alerts Section -->
        ${activeAlerts.length > 0 ? `
          <div class="p-5 rounded-2xl bg-rose-950/40 border border-rose-600/80 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-rose-300 flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-rose-400"></i> Unresolved Gate Violation Alerts
              </h3>
              <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-600 text-white font-bold">Action Required</span>
            </div>
            <div class="space-y-2">
              ${activeAlerts.map(alert => `
                <div class="p-3.5 rounded-xl bg-slate-900/90 border border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div class="font-bold text-white flex items-center gap-2">
                      <span class="text-rose-400">⚠ ${alert.reason}</span>
                      <span class="font-mono text-cyan-400">(${alert.studentId})</span>
                    </div>
                    <div class="text-slate-400 text-[11px] mt-0.5">Student: ${alert.studentName} (${alert.department}) • Flagged at ${alert.time}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="window.app.resolveAlert('${alert.id}')" class="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold">
                      Mark Resolved
                    </button>
                    <button onclick="window.app.notifySecurityAlert('${alert.studentId}')" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-600/30">
                      Dispatch Patrol
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Live Gate Activity Feed Table -->
        <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-tower-broadcast text-cyan-400"></i> Live Gate Activity Feed
              </h3>
              <p class="text-xs text-slate-400">Real-time scan logs streaming from Terminal 01 biometric barrier.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.app.navigateTo('gate-history')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">
                View Full Logs →
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 border-b border-slate-800 uppercase font-mono text-[11px]">
                <tr>
                  <th class="pb-3">Time</th>
                  <th class="pb-3">Student</th>
                  <th class="pb-3">ID</th>
                  <th class="pb-3">Action</th>
                  <th class="pb-3">Verification</th>
                  <th class="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-slate-300">
                ${history.map(item => `
                  <tr class="hover:bg-slate-900/40 transition-colors">
                    <td class="py-3 font-mono text-slate-400">${item.time}</td>
                    <td class="py-3 font-semibold text-white">${item.studentName}</td>
                    <td class="py-3 font-mono text-cyan-400">${item.studentId}</td>
                    <td class="py-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono ${item.action.includes('Exit') ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'}">
                        ${item.action}
                      </span>
                    </td>
                    <td class="py-3 text-slate-400 font-mono text-[11px]">${item.method}</td>
                    <td class="py-3 text-right">
                      <span class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        item.gateStatus.includes('Granted') || item.gateStatus.includes('Recorded')
                          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-700/50'
                          : 'text-rose-400 bg-rose-950/60 border border-rose-700/50'
                      }">
                        ${item.gateStatus}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // --- D. Admin Dashboard ---
  renderAdminDashboard(container) {
    const stats = window.store.getStats();

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Admin Banner -->
        <div class="p-6 rounded-2xl glass-panel border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-950/80 text-cyan-300 border border-cyan-800/60 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Central University Telemetry
            </div>
            <h2 class="text-2xl font-extrabold text-white">Campus Gate Management Overview</h2>
            <p class="text-slate-400 text-xs mt-1">Holistic monitoring of campus population, leave quotas, and gate throughput.</p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
              AI Core: ACTIVE (Latency: 14ms)
            </span>
          </div>
        </div>

        <!-- Campus Overview KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <span class="text-[11px] uppercase font-mono text-slate-400 block mb-1">Total Students</span>
            <div class="text-2xl font-bold font-mono text-white">${stats.totalStudents.toLocaleString()}</div>
            <span class="text-[10px] text-slate-500">Registered on Campus</span>
          </div>
          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <span class="text-[11px] uppercase font-mono text-slate-400 block mb-1">Students Inside</span>
            <div class="text-2xl font-bold font-mono text-emerald-400">${stats.studentsInside.toLocaleString()}</div>
            <span class="text-[10px] text-emerald-500/80">Inside Perimeter</span>
          </div>
          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <span class="text-[11px] uppercase font-mono text-slate-400 block mb-1">Students Outside</span>
            <div class="text-2xl font-bold font-mono text-amber-400">${stats.studentsOutside.toLocaleString()}</div>
            <span class="text-[10px] text-amber-500/80">Authorized Out-Pass</span>
          </div>
          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <span class="text-[11px] uppercase font-mono text-slate-400 block mb-1">Approved Leaves</span>
            <div class="text-2xl font-bold font-mono text-cyan-400">${stats.approvedLeavesToday}</div>
            <span class="text-[10px] text-slate-500">Today's Total</span>
          </div>
          <div class="glass-panel p-4 rounded-2xl border border-blue-900/30">
            <span class="text-[11px] uppercase font-mono text-slate-400 block mb-1">Pending Requests</span>
            <div class="text-2xl font-bold font-mono text-indigo-400">${stats.pendingRequests}</div>
            <span class="text-[10px] text-slate-500">Awaiting Warden</span>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Line Chart: Student Exit Activity by Time -->
          <div class="lg:col-span-2 glass-panel p-6 rounded-2xl border border-blue-900/30 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <i class="fa-solid fa-chart-line text-cyan-400"></i> Student Exit Activity by Time
                </h3>
                <p class="text-xs text-slate-400">Hourly gate traffic curve (Sample Demo Analytics).</p>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                Peak: 17:00 – 19:00
              </span>
            </div>

            <div class="h-64 relative w-full pt-2">
              <canvas id="adminExitChart"></canvas>
            </div>
          </div>

          <!-- Doughnut Chart: Department Distribution -->
          <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 space-y-3">
            <div>
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-cyan-400"></i> Out-Pass by Dept
              </h3>
              <p class="text-xs text-slate-400">Department distribution of today's leaves.</p>
            </div>

            <div class="h-64 relative w-full flex items-center justify-center pt-2">
              <canvas id="adminDeptChart"></canvas>
            </div>
          </div>

        </div>

      </div>
    `;

    // Render Charts after DOM injection
    setTimeout(() => {
      window.charts.renderExitActivityChart("adminExitChart");
      window.charts.renderDeptStatsChart("adminDeptChart");
    }, 50);
  }

  // 2. Smart Gate Verification View
  renderSmartGateView(container) {
    const students = window.store.state.users;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Gate Header -->
        <div class="p-6 rounded-2xl glass-panel border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-950 text-cyan-300 border border-cyan-800/60 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              TERMINAL 01: MAIN NORTH GATE
            </div>
            <h2 class="text-2xl font-extrabold text-white">Smart Gate AI Biometric Verification</h2>
            <p class="text-slate-400 text-xs mt-1">Autonomous campus gate turnstile with instant face embedding match and leave authorization.</p>
          </div>

          <!-- Controls: Mode & Camera -->
          <div class="flex flex-wrap items-center gap-2">
            <button id="toggleCameraBtn" onclick="window.app.toggleLiveCameraFeed()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2">
              <i class="fa-solid fa-video"></i>
              <span id="cameraBtnLabel">Use Live Webcam</span>
            </button>
            <div class="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
              <button onclick="window.gateSimulation.setDirection('exit'); window.app.updateGateDirectionUI('exit')" id="gateDirExitBtn" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold">
                Exit Gate
              </button>
              <button onclick="window.gateSimulation.setDirection('entry'); window.app.updateGateDirectionUI('entry')" id="gateDirEntryBtn" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white font-medium">
                Entry Gate
              </button>
            </div>
          </div>
        </div>

        <!-- Simulation Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Camera / Scanner Canvas (Col 7) -->
          <div class="lg:col-span-7 glass-panel p-5 rounded-3xl border border-blue-900/40 space-y-4">
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-slate-400 uppercase">Scanner Stream:</span>
                <span id="gateScanningBadge" class="px-3 py-1 text-xs font-mono rounded-full bg-slate-800 text-blue-300 border border-blue-800 flex items-center">
                  <span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 mr-2"></span> Scanner Ready
                </span>
              </div>
              <span class="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                AI Prototype Simulation
              </span>
            </div>

            <!-- Canvas Container -->
            <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-blue-900/60 shadow-2xl flex items-center justify-center">
              <canvas id="gateCameraCanvas" class="w-full h-full object-cover"></canvas>
            </div>

            <!-- Physical Barrier Arm Turnstile Visualization -->
            <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400 font-mono">Physical Turnstile Barrier:</span>
                <span class="font-mono text-xs text-slate-300">Servo Motor Channel 01</span>
              </div>
              <div class="h-10 bg-slate-950 rounded-xl p-2 flex items-center border border-slate-800 gate-turnstile-container overflow-hidden">
                <div class="w-4 h-6 bg-slate-700 rounded-sm"></div>
                <div id="gateTurnstileArm" class="gate-barrier-arm h-2.5 bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 border border-blue-500 w-full rounded-r-full"></div>
              </div>
            </div>

          </div>

          <!-- Controls & Verification Progress (Col 5) -->
          <div class="lg:col-span-5 space-y-5">
            
            <!-- Student Selection Dropdown for Testing -->
            <div class="glass-panel p-5 rounded-2xl border border-blue-900/30 space-y-3">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Simulate Target Student
              </label>
              <select id="gateStudentSelect" onchange="window.gateSimulation.resetGate()" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none font-mono">
                ${students.map(s => {
                  const activeLeave = window.store.getStudentActiveLeave(s.studentId);
                  const latestLeave = window.store.getStudentLatestLeave(s.studentId);
                  let badge = "No Leave";
                  if (activeLeave) badge = "APPROVED LEAVE ✓";
                  else if (latestLeave && latestLeave.status === "Pending") badge = "PENDING LEAVE ⏳";
                  else if (latestLeave && latestLeave.status === "Rejected") badge = "REJECTED LEAVE ✕";

                  return `<option value="${s.studentId}">[${badge}] ${s.name} (${s.studentId})</option>`;
                }).join('')}
              </select>
              <p class="text-[11px] text-slate-400">
                Select different students to test both the <strong class="text-emerald-400">Exit Granted</strong> and <strong class="text-rose-400">Unauthorized Exit Denied</strong> flows.
              </p>
            </div>

            <!-- Verification Trigger & Process Steps -->
            <div class="glass-panel p-5 rounded-2xl border border-blue-900/30 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-300">Verification Engine</span>
                <span class="text-xs font-mono text-cyan-400">ResNet-50 AI [SIM]</span>
              </div>

              <!-- Start Button -->
              <button onclick="window.gateSimulation.runVerificationSequence()" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-expand"></i>
                <span>Start Verification Scan</span>
              </button>

              <!-- Progress Steps Display -->
              <div id="gateProcessSteps" class="space-y-2 pt-2">
                <div class="text-xs text-slate-400 italic">Ready for scanner initiation. Position target and click "Start Scan".</div>
              </div>
            </div>

            <!-- Result Box (Initially Hidden) -->
            <div id="gateResultBox" class="hidden">
              <!-- Rendered dynamically by gateSimulation.displayResult -->
            </div>

          </div>

        </div>
      </div>
    `;

    // Initialize Canvas Loop
    setTimeout(() => {
      window.gateSimulation.init("gateCameraCanvas", "liveWebcamElement");
    }, 50);
  }

  updateGateDirectionUI(direction) {
    const exitBtn = document.getElementById("gateDirExitBtn");
    const entryBtn = document.getElementById("gateDirEntryBtn");
    if (direction === "exit") {
      exitBtn.className = "px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold";
      entryBtn.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white font-medium";
    } else {
      entryBtn.className = "px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold";
      exitBtn.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white font-medium";
    }
  }

  async toggleLiveCameraFeed() {
    const isLive = await window.gateSimulation.toggleLiveCamera();
    const btnLabel = document.getElementById("cameraBtnLabel");
    const btn = document.getElementById("toggleCameraBtn");
    if (isLive) {
      btnLabel.textContent = "Stop Live Camera";
      btn.classList.add("bg-rose-900/60", "border-rose-700", "text-rose-200");
      this.showToast("Live webcam feed connected", "info");
    } else {
      btnLabel.textContent = "Use Live Webcam";
      btn.classList.remove("bg-rose-900/60", "border-rose-700", "text-rose-200");
    }
  }

  // 3. Students Directory View
  renderStudentsView(container) {
    const students = window.store.state.users.filter(s => {
      if (!this.studentSearch) return true;
      const term = this.studentSearch.toLowerCase();
      return s.name.toLowerCase().includes(term) || s.studentId.toLowerCase().includes(term) || s.department.toLowerCase().includes(term);
    });

    container.innerHTML = `
      <div class="space-y-6">
        <div class="p-6 rounded-2xl glass-panel border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold text-white">Campus Student Directory</h2>
            <p class="text-slate-400 text-xs mt-1">Directory of enrolled students, hostel allocations, and active campus status.</p>
          </div>
          <div class="w-full md:w-72">
            <input type="text" value="${this.studentSearch}" oninput="window.app.studentSearch = this.value; window.app.renderActiveView();" placeholder="Search by name, roll no, department..."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${students.map(s => {
            const activeLeave = window.store.getStudentActiveLeave(s.studentId);
            return `
              <div class="glass-panel p-5 rounded-2xl border border-blue-900/30 space-y-4 hover:border-blue-700/50 transition-all">
                <div class="flex items-center gap-3">
                  <img src="${s.avatar}" class="w-12 h-12 rounded-xl object-cover border border-cyan-500/40">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-bold text-white truncate">${s.name}</h3>
                    <div class="text-xs font-mono text-cyan-400">${s.studentId}</div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${s.status === 'Inside Campus' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'}">
                    ${s.status}
                  </span>
                </div>

                <div class="space-y-1.5 text-xs border-t border-slate-800 pt-3 text-slate-300">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Department:</span>
                    <span>${s.department}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Hostel:</span>
                    <span>${s.hostel} • ${s.room}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Parent / Guardian:</span>
                    <span class="font-mono text-slate-400">${s.parentName}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Out-Pass Status:</span>
                    <span class="font-mono ${activeLeave ? 'text-emerald-400 font-bold' : 'text-slate-500'}">
                      ${activeLeave ? 'Approved Pass Active' : 'No Active Pass'}
                    </span>
                  </div>
                </div>

                <div class="pt-2 flex items-center gap-2">
                  <button onclick="window.app.switchRole('Student', '${s.studentId}')" class="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/30 rounded-lg text-xs font-medium transition-all">
                    Impersonate
                  </button>
                  <button onclick="window.app.testStudentAtGate('${s.studentId}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all">
                    Test at Gate
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  testStudentAtGate(studentId) {
    this.navigateTo("smart-gate");
    setTimeout(() => {
      const select = document.getElementById("gateStudentSelect");
      if (select) {
        select.value = studentId;
        window.gateSimulation.resetGate();
        this.showToast(`Selected ${studentId} for gate scanner`, "info");
      }
    }, 100);
  }

  // 4. Leave Requests View
  renderLeaveRequestsView(container) {
    const leaves = window.store.state.leaveRequests.filter(l => {
      if (this.leaveFilter.status === "all") return true;
      return l.status.toLowerCase() === this.leaveFilter.status.toLowerCase();
    });

    const isWardenOrAdmin = window.store.currentRole === "Warden" || window.store.currentRole === "Admin";

    container.innerHTML = `
      <div class="space-y-6">
        <div class="p-6 rounded-2xl glass-panel border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold text-white">Campus Leave Requests Registry</h2>
            <p class="text-slate-400 text-xs mt-1">Official registry of student out-pass applications and warden review verdicts.</p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="window.app.openLeaveModal()" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2">
              <i class="fa-solid fa-plus"></i> New Application
            </button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2 text-xs font-mono border-b border-slate-800 pb-3">
          <button onclick="window.app.leaveFilter.status = 'all'; window.app.renderActiveView();" class="px-3 py-1.5 rounded-lg ${this.leaveFilter.status === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
            All (${window.store.state.leaveRequests.length})
          </button>
          <button onclick="window.app.leaveFilter.status = 'Pending'; window.app.renderActiveView();" class="px-3 py-1.5 rounded-lg ${this.leaveFilter.status === 'Pending' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
            Pending (${window.store.state.leaveRequests.filter(l => l.status === 'Pending').length})
          </button>
          <button onclick="window.app.leaveFilter.status = 'Approved'; window.app.renderActiveView();" class="px-3 py-1.5 rounded-lg ${this.leaveFilter.status === 'Approved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
            Approved (${window.store.state.leaveRequests.filter(l => l.status === 'Approved').length})
          </button>
          <button onclick="window.app.leaveFilter.status = 'Rejected'; window.app.renderActiveView();" class="px-3 py-1.5 rounded-lg ${this.leaveFilter.status === 'Rejected' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
            Rejected (${window.store.state.leaveRequests.filter(l => l.status === 'Rejected').length})
          </button>
        </div>

        <!-- Table -->
        <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-slate-800 uppercase font-mono text-[11px]">
              <tr>
                <th class="pb-3">Request ID</th>
                <th class="pb-3">Student Name</th>
                <th class="pb-3">Destination</th>
                <th class="pb-3">Date & Out/In</th>
                <th class="pb-3">Reason</th>
                <th class="pb-3">Status</th>
                <th class="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              ${leaves.map(l => `
                <tr class="hover:bg-slate-900/40 transition-colors">
                  <td class="py-3.5 font-mono text-cyan-400">${l.id}</td>
                  <td class="py-3.5 font-bold text-white">${l.studentName} <span class="block text-[11px] font-mono text-slate-500">${l.studentId}</span></td>
                  <td class="py-3.5">${l.destination}</td>
                  <td class="py-3.5 font-mono">${l.date} <span class="text-slate-500 block">${l.outTime} - ${l.inTime}</span></td>
                  <td class="py-3.5 text-slate-400 max-w-xs truncate" title="${l.reason}">${l.reason}</td>
                  <td class="py-3.5">
                    <span class="px-2 py-0.5 rounded text-[11px] font-mono ${
                      l.status === 'Approved' ? 'badge-status-approved' :
                      l.status === 'Pending' ? 'badge-status-pending' : 'badge-status-rejected'
                    }">
                      ${l.status}
                    </span>
                  </td>
                  <td class="py-3.5 text-right space-x-2">
                    ${isWardenOrAdmin && l.status === 'Pending' ? `
                      <button onclick="window.app.approveLeave('${l.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold">Approve</button>
                      <button onclick="window.app.rejectLeave('${l.id}')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold">Reject</button>
                    ` : l.status === 'Approved' ? `
                      <button onclick="window.app.showGatePass('${l.id}')" class="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-blue-500/40 rounded text-[11px] font-mono">View Pass</button>
                    ` : `
                      <span class="text-slate-500 text-[11px]">—</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 5. Gate History View
  renderGateHistoryView(container) {
    let logs = window.store.state.gateHistory;

    if (this.historyFilter.action !== "all") {
      logs = logs.filter(l => l.action.toLowerCase().includes(this.historyFilter.action.toLowerCase()));
    }
    if (this.historyFilter.search) {
      const term = this.historyFilter.search.toLowerCase();
      logs = logs.filter(l => l.studentName.toLowerCase().includes(term) || l.studentId.toLowerCase().includes(term));
    }

    container.innerHTML = `
      <div class="space-y-6">
        <div class="p-6 rounded-2xl glass-panel border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold text-white">Campus Gate Access History</h2>
            <p class="text-slate-400 text-xs mt-1">Audit trail of all biometric and digital QR verifications recorded at campus gate terminals.</p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="window.app.exportHistoryCsv()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2">
              <i class="fa-solid fa-file-arrow-down"></i> Export to CSV
            </button>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="glass-panel p-4 rounded-2xl border border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 font-mono">
            <button onclick="window.app.historyFilter.action = 'all'; window.app.renderActiveView();" class="px-3 py-1.5 rounded-lg ${this.historyFilter.action === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
              All
            </button>
            <button onclick="window.app.historyFilter.action = 'exit'; window.app.renderActiveView();" class="px-3 py-1.5 rounded-lg ${this.historyFilter.action === 'exit' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
              Exit
            </button>
            <button onclick="window.app.historyFilter.action = 'entry'; window.app.renderActiveView();" class="px-3 py-1.5 rounded-lg ${this.historyFilter.action === 'entry' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
              Entry
            </button>
          </div>

          <div class="w-full sm:w-64">
            <input type="text" value="${this.historyFilter.search}" oninput="window.app.historyFilter.search = this.value; window.app.renderActiveView();" placeholder="Filter by student ID / name..."
              class="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-cyan-400 focus:outline-none">
          </div>
        </div>

        <!-- History Records Table -->
        <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-slate-800 uppercase font-mono text-[11px]">
              <tr>
                <th class="pb-3">Timestamp</th>
                <th class="pb-3">Student Name</th>
                <th class="pb-3">Student ID</th>
                <th class="pb-3">Direction</th>
                <th class="pb-3">Verification Method</th>
                <th class="pb-3">Gate Terminal</th>
                <th class="pb-3 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              ${logs.map(log => `
                <tr class="hover:bg-slate-900/40 transition-colors">
                  <td class="py-3 font-mono text-slate-400">${log.timestamp || log.time}</td>
                  <td class="py-3 font-semibold text-white">${log.studentName}</td>
                  <td class="py-3 font-mono text-cyan-400">${log.studentId}</td>
                  <td class="py-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${log.action.includes('Exit') ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'}">
                      ${log.action}
                    </span>
                  </td>
                  <td class="py-3 text-slate-400 font-mono text-[11px]">${log.method}</td>
                  <td class="py-3 text-slate-400">${log.gateName}</td>
                  <td class="py-3 text-right">
                    <span class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                      log.gateStatus.includes('Granted') || log.gateStatus.includes('Recorded')
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-700/50'
                        : 'text-rose-400 bg-rose-950/60 border border-rose-700/50'
                    }">
                      ${log.gateStatus}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  exportHistoryCsv() {
    const logs = window.store.state.gateHistory;
    let csv = "Timestamp,Student ID,Student Name,Department,Action,Method,Status,Terminal\n";
    logs.forEach(l => {
      csv += `"${l.timestamp}","${l.studentId}","${l.studentName}","${l.department}","${l.action}","${l.method}","${l.gateStatus}","${l.gateName}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SmartGate_History_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.showToast("Gate history exported as CSV", "success");
  }

  // 6. AI Insights View
  renderAiInsightsView(container) {
    const ai = window.store.state.aiAnalytics;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner with Disclaimer -->
        <div class="p-6 rounded-2xl glass-panel border border-cyan-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              AI Analytics & Anomaly Detection Engine
            </div>
            <h2 class="text-2xl font-extrabold text-white">Smart Campus AI Insights</h2>
            <p class="text-slate-400 text-xs mt-1">Simulated predictive traffic modeling, gate clearance latency, and curfew adherence telemetry.</p>
          </div>
          <span class="px-3 py-1.5 rounded-xl bg-blue-950 text-cyan-300 border border-blue-800 text-xs font-mono">
            Model: ResNet-FaceEmbed-v2
          </span>
        </div>

        <!-- AI KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-panel p-5 rounded-2xl border border-blue-900/30">
            <span class="text-xs uppercase font-mono text-slate-400 block mb-1">Peak Exit Window</span>
            <div class="text-xl font-bold font-mono text-cyan-400">${ai.peakExitWindow}</div>
            <p class="text-[11px] text-slate-500 mt-1">Based on historical telemetry</p>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-blue-900/30">
            <span class="text-xs uppercase font-mono text-slate-400 block mb-1">Avg Verification Time</span>
            <div class="text-xl font-bold font-mono text-emerald-400">${ai.averageVerificationLatency}s</div>
            <p class="text-[11px] text-slate-500 mt-1">Turnstile open latency</p>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-blue-900/30">
            <span class="text-xs uppercase font-mono text-slate-400 block mb-1">Match Confidence</span>
            <div class="text-xl font-bold font-mono text-blue-400">${ai.accuracyScore}%</div>
            <p class="text-[11px] text-slate-500 mt-1">Biometric cosine similarity</p>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-blue-900/30">
            <span class="text-xs uppercase font-mono text-slate-400 block mb-1">Curfew Adherence</span>
            <div class="text-xl font-bold font-mono text-amber-400">97.8%</div>
            <p class="text-[11px] text-slate-500 mt-1">On-time return rate</p>
          </div>
        </div>

        <!-- Highlight Callout Message -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-600/40 flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-lg flex-shrink-0">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">AI Behavioral Traffic Analysis</h4>
            <p class="text-xs text-cyan-200 mt-0.5 leading-relaxed">
              “Peak exit activity detected between 5:00 PM and 7:00 PM based on demo records. System recommends deploying 2 dual-channel lanes at Main North Gate during 17:30 - 18:30 to eliminate queue latency.”
            </p>
            <span class="inline-block text-[10px] font-mono text-slate-400 mt-2">
              Note: Clearly labeled as Demo Analytics / AI Immersion Prototype Simulation.
            </span>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 space-y-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-chart-line text-cyan-400"></i> Daily Exit & Entry Flow
            </h3>
            <div class="h-64 relative w-full pt-2">
              <canvas id="aiExitChart"></canvas>
            </div>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 space-y-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-cyan-400"></i> Departmental Outing Quotas
            </h3>
            <div class="h-64 relative w-full flex items-center justify-center pt-2">
              <canvas id="aiDeptChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      window.charts.renderExitActivityChart("aiExitChart");
      window.charts.renderDeptStatsChart("aiDeptChart");
    }, 50);
  }

  // 7. Security Alerts View
  renderSecurityAlertsView(container) {
    const alerts = window.store.state.securityAlerts;

    container.innerHTML = `
      <div class="space-y-6">
        <div class="p-6 rounded-2xl glass-panel border border-rose-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold text-white">Perimeter & Gate Security Alerts</h2>
            <p class="text-slate-400 text-xs mt-1">Incident logs of unauthorized exit attempts, barrier overrides, and curfew violations.</p>
          </div>
        </div>

        <div class="space-y-4">
          ${alerts.map(a => `
            <div class="glass-panel p-5 rounded-2xl border ${a.resolved ? 'border-slate-800' : 'border-rose-600/70 bg-rose-950/20'} flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl ${a.resolved ? 'bg-slate-800 text-slate-400' : 'bg-rose-500/20 text-rose-400'} flex items-center justify-center text-lg flex-shrink-0">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${a.studentName}</span>
                    <span class="font-mono text-cyan-400 text-xs">(${a.studentId})</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${a.resolved ? 'bg-slate-800 text-slate-400' : 'bg-rose-600 text-white font-bold'}">
                      ${a.status}
                    </span>
                  </div>
                  <p class="text-xs text-rose-200 mt-1">${a.reason}</p>
                  <span class="text-[11px] font-mono text-slate-500 mt-1 block">Incident recorded at ${a.time}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                ${!a.resolved ? `
                  <button onclick="window.app.resolveAlert('${a.id}')" class="px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold">
                    Mark Cleared
                  </button>
                  <button onclick="window.app.notifySecurityAlert('${a.studentId}')" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 flex items-center gap-1.5">
                    <i class="fa-solid fa-bullhorn"></i> Dispatch Patrol
                  </button>
                ` : `
                  <span class="text-xs text-emerald-400 font-mono"><i class="fa-solid fa-check"></i> Resolved</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 8. Settings & Demo Controls View
  renderSettingsView(container) {
    container.innerHTML = `
      <div class="space-y-6 max-w-3xl">
        <div class="p-6 rounded-2xl glass-panel border border-blue-800/40">
          <h2 class="text-2xl font-extrabold text-white">System Settings & Demo Sandbox</h2>
          <p class="text-slate-400 text-xs mt-1">Project configuration for AI Immersion demonstration.</p>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-blue-900/30 space-y-4">
          <h3 class="text-sm font-bold text-white">System Metadata</h3>
          <div class="space-y-2 text-xs text-slate-300">
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Application Name:</span>
              <span class="font-bold text-white">SMARTGATE AI</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Project Type:</span>
              <span>AI Immersion Presentation Prototype</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Branding Tagline:</span>
              <span class="text-cyan-400 italic">“Smarter Gates. Faster Exits. Safer Campus.”</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Terminal Gate ID:</span>
              <span class="font-mono text-cyan-300">TERMINAL_01_NORTH</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-slate-400">Audio Feedback:</span>
              <span>Synthesized Web Audio API (Zero external MP3 dependency)</span>
            </div>
          </div>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-rose-900/40 space-y-4">
          <h3 class="text-sm font-bold text-rose-300">Demonstration Reset</h3>
          <p class="text-xs text-slate-400">
            Clear all cached applications, security alerts, and gate history, restoring the initial evaluation dataset.
          </p>
          <button onclick="window.app.resetSystemData()" class="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <i class="fa-solid fa-rotate-left"></i>
            <span>Restore Fresh Demo State</span>
          </button>
        </div>
      </div>
    `;
  }

  // ======================== MODAL & WORKFLOW ACTIONS ========================

  openLeaveModal() {
    const modal = document.getElementById("leaveModal");
    const dateInput = document.getElementById("leaveDate");
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
    const student = window.store.getCurrentUser();
    const contactInput = document.getElementById("leaveEmergencyContact");
    if (contactInput && student && student.parentPhone) {
      contactInput.value = student.parentPhone;
    }
    modal.classList.remove("hidden");
  }

  closeLeaveModal() {
    document.getElementById("leaveModal").classList.add("hidden");
  }

  submitLeaveApplication(e) {
    e.preventDefault();
    const student = window.store.getCurrentUser();
    const date = document.getElementById("leaveDate").value;
    const outTime = document.getElementById("leaveOutTime").value;
    const inTime = document.getElementById("leaveInTime").value;
    const destination = document.getElementById("leaveDestination").value;
    const reason = document.getElementById("leaveReason").value;
    const contact = document.getElementById("leaveEmergencyContact").value;

    const newLeave = window.store.applyLeave({
      studentId: student.studentId,
      date,
      outTime,
      inTime,
      destination,
      reason,
      emergencyContact: contact
    });

    this.closeLeaveModal();
    this.showToast(`Leave application ${newLeave.id} submitted for Warden review!`, "success");
    window.soundManager.playScanBeep();
  }

  approveLeave(leaveId) {
    const success = window.store.updateLeaveStatus(leaveId, "Approved");
    if (success) {
      this.showToast("Leave approved! Student is now authorized at Smart Gate.", "success");
      window.soundManager.playSuccessChime();
    }
  }

  rejectLeave(leaveId) {
    const reason = prompt("Enter reason for rejection (e.g. Low attendance / Disciplinary curfew):", "Attendance threshold not met");
    if (reason !== null) {
      window.store.updateLeaveStatus(leaveId, "Rejected", reason);
      this.showToast("Leave request marked as REJECTED.", "info");
      window.soundManager.playDeniedBuzzer();
    }
  }

  showGatePass(leaveId) {
    const leave = window.store.state.leaveRequests.find(l => l.id === leaveId);
    if (!leave) return;

    const student = window.store.state.users.find(u => u.studentId === leave.studentId);
    document.getElementById("passStudentName").textContent = leave.studentName;
    document.getElementById("passStudentId").textContent = leave.studentId;
    document.getElementById("passDestination").textContent = leave.destination;
    document.getElementById("passCurfewTime").textContent = `Return before ${leave.inTime}`;
    document.getElementById("passIdNumber").textContent = leave.qrPassCode;

    // Render Dynamic QR Code
    const container = document.getElementById("passQrContainer");
    container.innerHTML = "";
    if (window.QRCode) {
      new QRCode(container, {
        text: `SMARTGATE:${leave.studentId}:${leave.id}:APPROVED`,
        width: 140,
        height: 140,
        colorDark: "#070D1E",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    document.getElementById("gatePassModal").classList.remove("hidden");
  }

  closeGatePassModal() {
    document.getElementById("gatePassModal").classList.add("hidden");
  }

  openDemoGuideModal() {
    document.getElementById("demoGuideModal").classList.remove("hidden");
  }

  closeDemoGuideModal() {
    document.getElementById("demoGuideModal").classList.add("hidden");
  }

  resolveAlert(alertId) {
    window.store.resolveAlert(alertId);
    this.showToast("Security alert resolved and marked as inspected", "info");
  }

  notifySecurityAlert(studentId) {
    window.soundManager.playAlertSiren();
    this.showToast("🚨 SECURITY PATROL DISPATCHED TO MAIN NORTH GATE", "alert");
    alert("🚨 SECURITY DISPATCH INITIATED\n\nPatrol Officers at North Gate have been alerted. Gate Barrier held in EMERGENCY LOCK state until clearance.");
  }

  resetSystemData() {
    if (confirm("Reset all SMARTGATE AI demonstration data back to pristine initial state?")) {
      window.store.resetDemoData();
      this.closeDemoGuideModal();
      this.showToast("Demo dataset restored to initial state", "success");
      this.navigateTo("dashboard");
    }
  }

  // --- Guided Demo Scenario Runners ---

  async runScenarioA() {
    this.closeDemoGuideModal();
    this.showToast("Starting Scenario A: Approved Leave Exit Workflow...", "info");

    // 1. Switch to Student Harini
    this.switchRole("Student", "CSE2026A001");
    await new Promise(r => setTimeout(r, 1200));

    // 2. Switch to Warden and show approval
    this.switchRole("Warden");
    this.showToast("Step 2: Warden reviews active leave queue", "info");
    await new Promise(r => setTimeout(r, 1200));

    // 3. Navigate to Smart Gate & trigger scan
    this.navigateTo("smart-gate");
    await new Promise(r => setTimeout(r, 600));

    const select = document.getElementById("gateStudentSelect");
    if (select) select.value = "CSE2026A001";

    this.showToast("Step 3: Harini arrives at Main Gate - Starting scan", "info");
    await new Promise(r => setTimeout(r, 800));

    window.gateSimulation.runVerificationSequence();
  }

  async runScenarioB() {
    this.closeDemoGuideModal();
    this.showToast("Starting Scenario B: Unauthorized Exit Attempt...", "alert");

    // 1. Navigate to Smart Gate
    this.navigateTo("smart-gate");
    await new Promise(r => setTimeout(r, 600));

    // Select Rahul Sharma (No approved leave)
    const select = document.getElementById("gateStudentSelect");
    if (select) select.value = "ECE2026B042";

    this.showToast("Student Rahul Sharma (No approved leave) attempts gate exit", "info");
    await new Promise(r => setTimeout(r, 800));

    window.gateSimulation.runVerificationSequence();
  }

  // --- Notifications Dropdown & Toasts ---

  renderNotifications() {
    const notifs = window.store.state.notifications;
    const currentRole = window.store.currentRole;
    const currentUser = window.store.getCurrentUser();

    // Filter relevant notifications
    const relevant = notifs.filter(n => {
      if (n.targetRole === currentRole) {
        if (currentRole === "Student" && n.studentId && currentUser) {
          return n.studentId === currentUser.studentId;
        }
        return true;
      }
      return false;
    });

    const unreadCount = relevant.filter(n => !n.read).length;
    const badge = document.getElementById("unreadNotifBadge");
    if (badge) {
      badge.textContent = unreadCount;
      badge.classList.toggle("hidden", unreadCount === 0);
    }

    const container = document.getElementById("notifListContainer");
    if (!container) return;

    if (relevant.length === 0) {
      container.innerHTML = `
        <div class="py-6 text-center text-slate-500 text-xs">
          <i class="fa-solid fa-bell-slash text-lg mb-1 block"></i>
          No notifications for current role.
        </div>
      `;
      return;
    }

    container.innerHTML = relevant.map(n => `
      <div class="p-2.5 rounded-xl ${n.read ? 'bg-slate-900/60' : 'bg-blue-950/40 border border-blue-800/40'} text-xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-bold text-white flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-emerald-400' : n.type === 'alert' ? 'bg-rose-500' : 'bg-cyan-400'}"></span>
            ${n.title}
          </span>
          <span class="text-[10px] font-mono text-slate-500">${n.time}</span>
        </div>
        <p class="text-slate-300 text-[11px] leading-tight">${n.message}</p>
      </div>
    `).join('');
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item p-3.5 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-medium text-white ${
      type === "success" ? "bg-emerald-950/90 border-emerald-500/60 shadow-emerald-500/20" :
      type === "alert" ? "bg-rose-950/90 border-rose-500/80 shadow-rose-500/30" :
      "bg-slate-900/95 border-blue-700/60 shadow-blue-500/20"
    }`;

    const icon = type === "success" ? "fa-circle-check text-emerald-400" :
                 type === "alert" ? "fa-triangle-exclamation text-rose-400" :
                 "fa-circle-info text-cyan-400";

    toast.innerHTML = `
      <i class="fa-solid ${icon} text-base flex-shrink-0"></i>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

window.app = new SmartGateApp();
