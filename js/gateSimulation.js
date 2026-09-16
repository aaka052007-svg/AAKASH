/**
 * SMARTGATE AI - Gate Verification & AI Simulator Engine
 * Features:
 * - Canvas-based AI face landmark & biometric bounding box simulation
 * - Optional HTML5 live webcam stream with AI overlay
 * - Multi-stage verification pipeline
 * - Sound effects & gate turnstile animation
 * - Real-time state persistence
 */

class GateSimulationEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.videoElement = null;
    this.animationFrameId = null;
    this.isScanning = false;
    this.scanProgress = 0;
    this.currentMode = "face"; // 'face' | 'qr'
    this.gateDirection = "exit"; // 'exit' | 'entry'
    this.isLiveCamera = false;
    this.stream = null;
    this.scanStep = "idle"; // 'idle' | 'detecting' | 'verifying_id' | 'checking_leave' | 'result'
    this.lastResult = null;
  }

  init(canvasId, videoId) {
    this.canvas = document.getElementById(canvasId);
    this.videoElement = document.getElementById(videoId);

    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.startCanvasLoop();
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    this.resetGate();
  }

  setDirection(direction) {
    this.gateDirection = direction;
    this.resetGate();
  }

  async toggleLiveCamera() {
    if (this.isLiveCamera) {
      this.stopLiveCamera();
      return false;
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("Webcam access is not supported by your browser in this environment.");
          return false;
        }
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
        });
        if (this.videoElement) {
          this.videoElement.srcObject = this.stream;
          this.videoElement.play();
        }
        this.isLiveCamera = true;
        return true;
      } catch (err) {
        console.warn("Live camera access failed or was denied:", err);
        alert("Webcam permission denied or camera not found. Using high-tech AI simulation mode.");
        this.isLiveCamera = false;
        return false;
      }
    }
  }

  stopLiveCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.isLiveCamera = false;
  }

  startCanvasLoop() {
    let scanLineY = 0;
    let scanDirection = 1;
    let pulseAlpha = 0.5;

    const render = () => {
      if (!this.canvas || !this.ctx) return;
      const w = this.canvas.width = this.canvas.offsetWidth || 480;
      const h = this.canvas.height = this.canvas.offsetHeight || 360;

      this.ctx.clearRect(0, 0, w, h);

      if (this.isLiveCamera && this.videoElement && this.videoElement.readyState >= 2) {
        // Render video frame to canvas
        this.ctx.drawImage(this.videoElement, 0, 0, w, h);
      } else {
        // High-tech AI simulation background
        const grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "#081024");
        grad.addColorStop(1, "#030712");
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);

        // Futuristic grid
        this.ctx.strokeStyle = "rgba(30, 58, 138, 0.25)";
        this.ctx.lineWidth = 1;
        const gridSize = 28;
        for (let x = 0; x < w; x += gridSize) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, h);
          this.ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(w, y);
          this.ctx.stroke();
        }

        // Selected student silhouette / avatar in simulation
        const currentStudent = this.getSelectedStudent();
        if (currentStudent && currentStudent.avatar) {
          const imgSize = 130;
          const cx = w / 2;
          const cy = h / 2 - 10;

          // Outer halo
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, imgSize / 2 + 12, 0, Math.PI * 2);
          this.ctx.strokeStyle = this.isScanning ? "rgba(56, 189, 248, 0.8)" : "rgba(37, 99, 235, 0.4)";
          this.ctx.lineWidth = 2;
          this.ctx.stroke();

          // Text label
          this.ctx.fillStyle = "rgba(226, 232, 240, 0.8)";
          this.ctx.font = "12px 'JetBrains Mono', monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText(`TARGET: ${currentStudent.studentId} • ${currentStudent.name.toUpperCase()}`, cx, cy + imgSize / 2 + 30);
        }
      }

      // Drawing AI Recognition Overlays
      const boxW = Math.min(w * 0.55, 240);
      const boxH = Math.min(h * 0.65, 260);
      const boxX = (w - boxW) / 2;
      const boxY = (h - boxH) / 2 - 10;

      // Draw corner brackets
      const cornerLen = 24;
      this.ctx.strokeStyle = this.getOverlayColor();
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = this.getOverlayColor();
      this.ctx.shadowBlur = this.isScanning ? 12 : 4;

      // Top-Left
      this.ctx.beginPath();
      this.ctx.moveTo(boxX, boxY + cornerLen);
      this.ctx.lineTo(boxX, boxY);
      this.ctx.lineTo(boxX + cornerLen, boxY);
      this.ctx.stroke();

      // Top-Right
      this.ctx.beginPath();
      this.ctx.moveTo(boxX + boxW - cornerLen, boxY);
      this.ctx.lineTo(boxX + boxW, boxY);
      this.ctx.lineTo(boxX + boxW, boxY + cornerLen);
      this.ctx.stroke();

      // Bottom-Left
      this.ctx.beginPath();
      this.ctx.moveTo(boxX, boxY + boxH - cornerLen);
      this.ctx.lineTo(boxX, boxY + boxH);
      this.ctx.lineTo(boxX + cornerLen, boxY + boxH);
      this.ctx.stroke();

      // Bottom-Right
      this.ctx.beginPath();
      this.ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
      this.ctx.lineTo(boxX + boxW, boxY + boxH);
      this.ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
      this.ctx.stroke();

      this.ctx.shadowBlur = 0; // reset

      // Facial landmarks & mesh points simulation when scanning
      if (this.currentMode === "face") {
        const cx = w / 2;
        const cy = h / 2 - 10;
        const pts = [
          { x: cx - 25, y: cy - 20 }, // left eye
          { x: cx + 25, y: cy - 20 }, // right eye
          { x: cx, y: cy + 5 },       // nose bridge
          { x: cx, y: cy + 18 },      // nose tip
          { x: cx - 22, y: cy + 40 }, // mouth left
          { x: cx + 22, y: cy + 40 }, // mouth right
          { x: cx, y: cy + 46 },      // chin center
          { x: cx - 45, y: cy + 10 }, // left jaw
          { x: cx + 45, y: cy + 10 }  // right jaw
        ];

        pts.forEach((pt, i) => {
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          this.ctx.fillStyle = this.isScanning ? "rgba(56, 189, 248, 0.9)" : "rgba(148, 163, 184, 0.5)";
          this.ctx.fill();

          // Connect subtle mesh lines
          if (this.isScanning && i < pts.length - 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(pt.x, pt.y);
            this.ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
            this.ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        });
      } else {
        // QR Code scanning reticle
        this.ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
        this.ctx.strokeRect(boxX + 25, boxY + 25, boxW - 50, boxH - 50);
      }

      // Laser scan line
      if (this.isScanning) {
        scanLineY += 3 * scanDirection;
        if (scanLineY > boxH) scanDirection = -1;
        if (scanLineY < 0) scanDirection = 1;

        const currentY = boxY + scanLineY;
        const grad = this.ctx.createLinearGradient(boxX, currentY, boxX + boxW, currentY);
        grad.addColorStop(0, "rgba(56, 189, 248, 0)");
        grad.addColorStop(0.5, "rgba(56, 189, 248, 0.95)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(boxX, currentY - 2, boxW, 4);

        // Scan glow aura
        this.ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
        this.ctx.fillRect(boxX, boxY, boxW, scanLineY);
      }

      // HUD Text telemetry
      this.ctx.font = "10px 'JetBrains Mono', monospace";
      this.ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      this.ctx.textAlign = "left";
      this.ctx.fillText(`FPS: 60.0 | LATENCY: 14ms`, 16, 24);
      this.ctx.fillText(`MODE: ${this.currentMode.toUpperCase()} AI [SIM]`, 16, 38);

      this.ctx.textAlign = "right";
      this.ctx.fillText(`GATE: TERMINAL-01`, w - 16, 24);
      this.ctx.fillText(`STATUS: ${this.scanStep.toUpperCase()}`, w - 16, 38);

      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  getOverlayColor() {
    if (this.scanStep === "result") {
      return this.lastResult && this.lastResult.granted ? "#10B981" : "#EF4444";
    }
    if (this.isScanning) {
      return "#38BDF8"; // Cyber Blue
    }
    return "#3B82F6"; // Default slate blue
  }

  getSelectedStudent() {
    const selector = document.getElementById("gateStudentSelect");
    const studentId = selector ? selector.value : "CSE2026A001";
    return window.store.state.users.find(u => u.studentId === studentId) || window.store.state.users[0];
  }

  resetGate() {
    this.isScanning = false;
    this.scanStep = "idle";
    this.lastResult = null;

    const resultBox = document.getElementById("gateResultBox");
    if (resultBox) {
      resultBox.classList.add("hidden");
    }

    const liveBadge = document.getElementById("gateScanningBadge");
    if (liveBadge) {
      liveBadge.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 mr-2"></span> Scanner Ready`;
      liveBadge.className = "px-3 py-1 text-xs font-mono rounded-full bg-slate-800 text-blue-300 border border-blue-800 flex items-center";
    }

    const gateArm = document.getElementById("gateTurnstileArm");
    if (gateArm) {
      gateArm.classList.remove("gate-open-animation", "border-emerald-500", "border-rose-500");
      gateArm.classList.add("border-blue-500");
    }

    const stepsContainer = document.getElementById("gateProcessSteps");
    if (stepsContainer) {
      stepsContainer.innerHTML = `
        <div class="text-sm text-slate-400 italic">Ready for scanner initiation. Position target and click "Start Scan".</div>
      `;
    }
  }

  async runVerificationSequence() {
    if (this.isScanning) return;
    this.isScanning = true;
    this.scanStep = "detecting";

    const student = this.getSelectedStudent();
    if (!student) {
      alert("Please select a student to simulate verification.");
      this.resetGate();
      return;
    }

    const stepsContainer = document.getElementById("gateProcessSteps");
    const liveBadge = document.getElementById("gateScanningBadge");
    const resultBox = document.getElementById("gateResultBox");
    if (resultBox) resultBox.classList.add("hidden");

    if (liveBadge) {
      liveBadge.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping mr-2"></span> Scanning in progress...`;
      liveBadge.className = "px-3 py-1 text-xs font-mono rounded-full bg-amber-950/70 text-amber-300 border border-amber-600 flex items-center";
    }

    // Step 1: Face Detection & Feature Extraction
    window.soundManager.playScanBeep();
    if (stepsContainer) {
      stepsContainer.innerHTML = `
        <div class="flex items-center gap-3 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60 animate-pulse">
          <div class="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">1</div>
          <div class="text-xs text-blue-200">
            <span class="font-semibold">Target Detected:</span> Aligning facial bounding mesh & extracting 128-D vector embeddings...
          </div>
        </div>
      `;
    }

    await new Promise(r => setTimeout(r, 1100));

    // Step 2: Biometric Identity Match
    this.scanStep = "verifying_id";
    window.soundManager.playScanBeep();
    const confidence = (98.6 + Math.random() * 1.1).toFixed(1);

    if (stepsContainer) {
      stepsContainer.innerHTML += `
        <div class="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 mt-2">
          <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">✓</div>
          <div class="text-xs text-emerald-200">
            <span class="font-semibold text-emerald-300">Identity Verified (${confidence}% confidence):</span> 
            ${student.name} | ID: <span class="font-mono text-cyan-300">${student.studentId}</span> (${student.department})
          </div>
        </div>
      `;
    }

    await new Promise(r => setTimeout(r, 900));

    // Step 3: Check Leave Approval Status (if exit mode)
    this.scanStep = "checking_leave";
    if (stepsContainer) {
      stepsContainer.innerHTML += `
        <div class="flex items-center gap-3 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60 mt-2 animate-pulse">
          <div class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">3</div>
          <div class="text-xs text-indigo-200">
            <span class="font-semibold">Querying Warden Registry:</span> Checking active authorized leave passes for today...
          </div>
        </div>
      `;
    }

    await new Promise(r => setTimeout(r, 800));

    // Step 4: Access Decision Phase
    this.isScanning = false;
    this.scanStep = "result";

    // Determine authorization
    const activeLeave = window.store.getStudentActiveLeave(student.studentId);
    const latestLeave = window.store.getStudentLatestLeave(student.studentId);
    let isGranted = false;
    let denialReason = "";

    if (this.gateDirection === "exit") {
      if (activeLeave) {
        isGranted = true;
      } else {
        isGranted = false;
        if (latestLeave && latestLeave.status === "Pending") {
          denialReason = "Leave application is still PENDING warden approval.";
        } else if (latestLeave && latestLeave.status === "Rejected") {
          denialReason = `Leave application was REJECTED by Warden (${latestLeave.remarks}).`;
        } else {
          denialReason = "No active approved leave found in warden registry for today.";
        }
      }
    } else {
      // Entry mode: All recognized students are permitted back in
      isGranted = true;
    }

    this.lastResult = {
      student,
      granted: isGranted,
      direction: this.gateDirection,
      reason: denialReason,
      leave: activeLeave || latestLeave
    };

    // Render Final Decision Card
    this.displayResult(this.lastResult);

    // Record into Store
    if (this.gateDirection === "exit") {
      if (isGranted) {
        window.soundManager.playSuccessChime();
        window.store.recordGateScan({
          studentId: student.studentId,
          action: "Exit",
          method: this.currentMode === "face" ? "Face AI (Biometric)" : "Digital QR Pass",
          status: "Exit Granted",
          leaveStatus: "Approved",
          officer: "Officer Ram Singh"
        });
      } else {
        window.soundManager.playDeniedBuzzer();
        setTimeout(() => window.soundManager.playAlertSiren(), 300);
        window.store.recordGateScan({
          studentId: student.studentId,
          action: "Exit Attempt",
          method: this.currentMode === "face" ? "Face AI (Biometric)" : "Digital QR Pass",
          status: "Exit Access Denied",
          leaveStatus: latestLeave ? latestLeave.status : "No Leave Filed",
          officer: "Officer Ram Singh",
          reason: denialReason
        });
      }
    } else {
      // Entry
      window.soundManager.playSuccessChime();
      window.store.recordGateScan({
        studentId: student.studentId,
        action: "Entry",
        method: this.currentMode === "face" ? "Face AI (Biometric)" : "Digital QR Pass",
        status: "Entry Recorded",
        leaveStatus: "Normal Entry",
        officer: "Officer Ram Singh"
      });
    }

    // Trigger state refresh
    if (window.app && window.app.renderActiveView) {
      window.app.renderActiveView();
    }
  }

  displayResult(result) {
    const resultBox = document.getElementById("gateResultBox");
    const liveBadge = document.getElementById("gateScanningBadge");
    const gateArm = document.getElementById("gateTurnstileArm");

    if (!resultBox) return;
    resultBox.classList.remove("hidden");

    if (result.granted) {
      // GRANTED
      if (liveBadge) {
        liveBadge.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2"></span> ACCESS GRANTED`;
        liveBadge.className = "px-3 py-1 text-xs font-mono rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500 flex items-center";
      }

      if (gateArm) {
        gateArm.classList.add("gate-open-animation", "border-emerald-500");
      }

      resultBox.innerHTML = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 text-2xl font-bold">
                ✓
              </div>
              <div>
                <span class="text-xs uppercase tracking-widest text-emerald-400 font-mono font-semibold">Verification Complete</span>
                <h3 class="text-xl font-bold text-white tracking-wide">
                  ${result.direction === 'exit' ? 'EXIT ACCESS GRANTED' : 'CAMPUS ENTRY RECORDED'}
                </h3>
              </div>
            </div>
            <span class="px-2.5 py-1 text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
              GATE BARRIER: OPEN
            </span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-emerald-800/40 text-xs">
            <div>
              <span class="text-slate-400 block">Student Name:</span>
              <span class="font-semibold text-slate-100">${result.student.name}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Student ID:</span>
              <span class="font-mono text-cyan-300">${result.student.studentId}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Department:</span>
              <span class="text-slate-200">${result.student.department}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Warden Leave Status:</span>
              <span class="text-emerald-400 font-semibold font-mono">APPROVED ✓</span>
            </div>
          </div>

          <div class="mt-3 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
            <div class="text-slate-300">
              <span class="text-slate-400">Destination:</span> ${result.leave ? result.leave.destination : 'Campus In-Bounds'} 
              • <span class="text-slate-400">Curfew Return:</span> ${result.leave ? result.leave.inTime : '22:00'}
            </div>
            <span class="text-emerald-400 font-mono text-[11px]">Auto-logged to Gate History ✓</span>
          </div>
        </div>
      `;
    } else {
      // DENIED
      if (liveBadge) {
        liveBadge.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mr-2"></span> ACCESS DENIED`;
        liveBadge.className = "px-3 py-1 text-xs font-mono rounded-full bg-rose-950/90 text-rose-300 border border-rose-500 flex items-center";
      }

      if (gateArm) {
        gateArm.classList.add("border-rose-500");
      }

      resultBox.innerHTML = `
        <div class="p-4 rounded-xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500 shadow-2xl shadow-rose-500/30 animate-pulse">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 text-2xl font-bold">
                ✕
              </div>
              <div>
                <span class="text-xs uppercase tracking-widest text-rose-400 font-mono font-bold">Security Violation Detected</span>
                <h3 class="text-xl font-bold text-white tracking-wide">EXIT ACCESS DENIED</h3>
              </div>
            </div>
            <span class="px-2.5 py-1 text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-bold">
              GATE BARRIER: LOCKED
            </span>
          </div>

          <div class="mt-3 p-3 rounded-lg bg-rose-950/60 border border-rose-700/60 text-xs text-rose-200">
            <div class="font-bold text-rose-300 mb-1 flex items-center gap-1.5">
              <span>⚠</span> UNAUTHORIZED EXIT ATTEMPT
            </div>
            <div>${result.reason}</div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-rose-800/40 text-xs">
            <div>
              <span class="text-slate-400 block">Student:</span>
              <span class="font-semibold text-slate-100">${result.student.name}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Student ID:</span>
              <span class="font-mono text-cyan-300">${result.student.studentId}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Hostel:</span>
              <span class="text-slate-200">${result.student.hostel}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Leave Registry:</span>
              <span class="text-rose-400 font-bold font-mono">UNAPPROVED ✕</span>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between pt-2">
            <span class="text-xs text-slate-400">Campus Security & Warden alerted instantly.</span>
            <button onclick="window.app.notifySecurityAlert('${result.student.studentId}')" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/30">
              <span>🚨</span> Notify Security / Dispatch Guard
            </button>
          </div>
        </div>
      `;
    }
  }
}

window.gateSimulation = new GateSimulationEngine();
