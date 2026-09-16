# SMARTGATE AI
### AI-Powered Smart Student Entry & Exit Management System
> *"Smarter Gates. Faster Exits. Safer Campus."*

**SMARTGATE AI** is a modern, responsive college campus gate management web application built for an **AI Immersion Project Demonstration**. It unites student out-pass applications, hostel warden reviews, AI biometric gate verification, perimeter violation tracking, and campus security telemetry into a single, cohesive dashboard.

---

## 🌟 Key Features

1. **Role-Based Workflows & Quick Role Switcher**:
   - **Student Portal**: Profile, current status (Inside/Outside campus), apply for electronic leave pass, track status (Approved/Pending/Rejected), and view dynamic QR Gate Pass.
   - **Warden Console**: Real-time queue of pending student leave requests with 1-click **Approve** and **Reject** controls, attendance threshold checks, and curfew notes.
   - **Smart Gate Verification**:
     - Realistic biometric face scanning and Digital QR ID scanning.
     - Dual mode: High-tech AI simulation canvas (facial landmarks, bounding box, laser sweep, 99.4% confidence match) or live webcam stream with AI HUD overlay.
     - Multi-stage verification pipeline: Target Detected $\to$ Biometric Embedding Matched $\to$ Warden Registry Checked $\to$ Access Decision.
     - Physical turnstile barrier animation (servo arm lifts open on access granted).
     - Synthesized Web Audio API sound effects (beeps, success chords, denied buzzers, security sirens).
   - **Security Dashboard**:
     - Real-time KPI stat cards: *Students Exited*, *Students Entered*, *Currently Outside*, *Active Alerts*.
     - Live gate activity telemetry stream with auto-updating records.
     - **Unauthorized Exit Attempt Alert**: Visual strobe banner and siren sound when unapproved exit occurs, with 1-click **Dispatch Guard** action.
   - **Admin Dashboard**:
     - Comprehensive campus telemetry: Total Students (2,450), Inside Campus, Outside Campus, Approved Leaves, and Pending Requests.
     - Interactive **Student Exit Activity by Time** hourly chart (Chart.js) highlighting peak 5:00 PM – 7:00 PM traffic.
     - Department-wise leave distribution donut chart.
   - **Gate History**:
     - Searchable and filterable audit trail of all entrance/exit scans with export to CSV.
   - **AI Insights**:
     - Latency statistics (1.28s avg verification), match confidence scores, curfew compliance rate (97.8%), and peak exit traffic analysis.
     - Clearly labeled as *AI Immersion Prototype Simulation*.

---

## 🚀 Quick Start Guide

### Option 1: Using Python HTTP Server (Recommended)
Open PowerShell or Command Prompt in the project folder and run:
```powershell
python run_server.py
```
This starts the local web server at `http://localhost:8000` and automatically opens it in your default web browser.

Alternatively:
```powershell
python -m http.server 8000
```
Then visit `http://localhost:8000` in Google Chrome, Microsoft Edge, or Firefox.

### Option 2: Direct File Open
You can also directly double-click `index.html` to open it in any modern browser.

---

## 🎭 Presentation Demo Scenarios

During evaluation or faculty presentations, use the top bar's **"Guided Demo"** button or follow these two core demonstration flows:

### Scenario A: Approved Leave Exit (The Happy Path)
1. **Student Login**: Click **Harini Sree B** (`CSE2026A001`). View her profile and her approved leave request for the *"AI Immersion Hackathon"*. Click **View Digital Gate Pass** to inspect the dynamic QR code.
2. **Warden View**: Use the top-bar role switcher to switch to **Warden**. See how wardens review requests, and observe that Harini's status is already Approved.
3. **Smart Gate Clearance**: Navigate to the **Smart Gate** page.
4. Select `Harini Sree B [APPROVED LEAVE ✓]` and click **Start Verification Scan**.
5. Observe the high-tech AI detection, biometric feature extraction, and warden registry query.
6. The gate announces **`EXIT ACCESS GRANTED ✓`**, the barrier arm swings open, and a melodic chime sounds.
7. **Security Update**: Navigate to **Security** or **Gate History** to verify that Harini's exit was logged, student status shifted to `Outside Campus`, and the *Students Exited* KPI incremented.

### Scenario B: Unauthorized Exit Attempt (Security Defense)
1. **At Smart Gate**: Select student `Rahul Sharma [REJECTED LEAVE ✕]` (or any student without an approved leave).
2. Click **Start Verification Scan**.
3. The biometric AI matches his face, queries the registry, and discovers his leave is rejected (attendance below 75% cutoff).
4. System triggers **`EXIT ACCESS DENIED ⚠`**, the barrier remains locked, and an alarm buzzer sounds.
5. A flashing **`UNAUTHORIZED EXIT ATTEMPT`** banner appears on the Security and Admin dashboards with a **Dispatch Patrol** button.

---

## 👥 Demo Profiles & Fictional Personas

| Role | Name | ID / Code | Notes |
| :--- | :--- | :--- | :--- |
| **Student** | Harini Sree B | `CSE2026A001` | CSE – AIML (3rd Year), Approved Out-Pass |
| **Student** | Rahul Sharma | `ECE2026B042` | ECE (3rd Year), Rejected Leave (Attendance 71.5%) |
| **Student** | Priya Nair | `AIDS2026C105` | AI & DS (2nd Year), Pending Leave Request |
| **Student** | Karthik R | `MECH2025D018` | Mechanical (4th Year), Approved, Already Outside |
| **Warden** | Dr. Arisudan Roy | `STAFF_WARDEN_01` | Chief Hostel Warden & Professor |
| **Security** | Officer Ram Singh | `STAFF_SEC_01` | Terminal 01 Gate Commander |
| **Admin** | Central Console | `STAFF_ADMIN_01` | Director of Student Welfare & Campus Tech |

*Password for all demo profiles:* `demo123` *(or use the 1-click login buttons)*.

---

## 🛡️ Prototype Disclosure
*All facial recognition, biometric embeddings, and AI telemetry shown in this demonstration are simulated for academic prototype demonstration and UI evaluation. No actual biometric data is recorded, stored, or transmitted to third-party servers.*
