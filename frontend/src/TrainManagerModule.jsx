import { useMemo, useState, useEffect } from "react";
import {
  Award,
  BarChart2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileBarChart2,
  Gauge,
  LogOut,
  PlayCircle,
  Search,
  Target,
  TrendingUp,
  UserCircle2,
  ArrowUpDown,
  ShieldCheck,
  Bell,
  ShieldAlert,
  Clock,
  Activity,
  FileText,
  AlertTriangle,
  Lock,
  RefreshCw,
  Paperclip,
  Trash2,
  Volume2,
  VolumeX,
  Plus
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import "./sdom.css";


/* ─── Navigation ─── */
const navItems = [
  { key: "dashboard",    label: "Dashboard",     icon: Gauge },
  { key: "myAssessment", label: "My Assessment",  icon: FileBarChart2 },
  { key: "profile",      label: "My Profile",     icon: UserCircle2 }
];

/* ─── Static profile data with requested fields ─── */
const trainManagerProfile = {
  name: "A. Mehta",
  hrmsId: "TM_1001",
  stationName: "Nagpur Junction (NGP)",
  designation: "Train Manager",
  mobileNumber: "+91 98220 77001",
  pmeStatus: "FIT (Periodic Medical Exam) - Due: 2029-08-20",
  refStatus: "COMPLETED (Refresher Course) - Due: 2027-05-12",
  trainingStatus: "ACTIVE (Safety & Automatic Block Certified)",
  currentCategory: "A",
  department: "Operations",
  reportingOfficer: "TI_1001 (Traffic Inspector)",
  joiningDate: "2019-04-12"
};

/* ─── Helper: Score → Category ─── */
function getCategory(score) {
  if (score >= 80) return "A";
  if (score >= 50) return "B";
  if (score >= 26) return "C";
  return "D";
}

function getCategoryColor(cat) {
  return { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#dc2626" }[cat] || "#6b7280";
}

function getCategoryBg(cat) {
  return { A: "#dcfce7", B: "#dbeafe", C: "#fef3c7", D: "#fee2e2" }[cat] || "#f3f4f6";
}

const formatQuarterPeriod = (periodStr) => {
  if (!periodStr) return "—";
  const match = periodStr.match(/Q([1-4])\s+(\d{4})/i);
  if (!match) return periodStr;
  const quarter = parseInt(match[1], 10);
  const year = match[2];
  switch (quarter) {
    case 1: return `01 Jan ${year} – 31 Mar ${year}`;
    case 2: return `01 Apr ${year} – 30 Jun ${year}`;
    case 3: return `01 Jul ${year} – 30 Sep ${year}`;
    case 4: return `01 Oct ${year} – 31 Dec ${year}`;
    default: return periodStr;
  }
};

/* ─── Seed history — ONE test type repeated ─── */
const TEST_NAME = "Train Manager Periodic Assessment";

// Helper to generate correct/incorrect response array for seeded history
function generateMockResponses(score) {
  const correctCount = Math.round((score / 100) * 25);
  const arr = Array(25).fill(null);
  const indices = Array.from({ length: 25 }, (_, i) => i);
  // shuffle indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const correctIndices = new Set(indices.slice(0, correctCount));
  for (let i = 0; i < 25; i++) {
    const q = testQuestions[i];
    if (correctIndices.has(i)) {
      arr[i] = q.answer; // correct
    } else {
      arr[i] = (q.answer + 1) % 4; // incorrect
    }
  }
  return arr;
}

/* ─── 25 MCQ questions ─── */
const rawQuestions = [
  { text: "A signal shows double yellow. The driver should:", options: ["Proceed at full speed", "Prepare to stop at next signal", "Stop immediately", "Sound horn continuously"], answer: 1, explanation: "A double yellow aspect is an attention signal, warning the driver that they are approaching a signal showing a restrictive aspect (single yellow or red) and must prepare to stop." },
  { text: "When a track circuit fails, the train manager must:", options: ["Ignore it and proceed", "Immediately inform the station master", "Wait for someone else to act", "Close the station"], answer: 1, explanation: "Any signal or track circuit failure is a safety hazard. The train manager must notify the Station Master immediately so that proper block working or manual pilot-in procedures can be initiated." },
  { text: "The safe distance to stand from a moving train is:", options: ["0.5 metres", "1 metre", "2 metres", "5 metres"], answer: 2, explanation: "To avoid aerodynamic suction and flying ballast, personnel must maintain a safe distance of at least 2 metres from any moving rail vehicle." },
  { text: "A 'Line Clear' token must be:", options: ["Carried by the guard", "Exchanged only at block stations", "Kept at the engine", "Kept at the signal box"], answer: 1, explanation: "In single line token working territory, the authority to proceed is a tangible token that must only be exchanged at designated block stations under the SM's authority." },
  { text: "Points must be clipped and padlocked when:", options: ["A train is expected", "Maintenance is not needed", "No train is expected for 8 hours", "During night only"], answer: 0, explanation: "For maximum protection during non-interlocked working or defect conditions, points must be physically clipped and padlocked for the authorized route before a train is received." },
  { text: "Which colour indicates a 'Stop' signal?", options: ["Green", "Yellow", "Red", "White"], answer: 2, explanation: "Red is the universal danger aspect indicating a mandatory stop before the signal." },
  { text: "An emergency brake application mid-section requires:", options: ["Driver to restart immediately", "Informing the guard and station master", "Reversing to the last station", "Disconnecting the coupling"], answer: 1, explanation: "An unexpected emergency halt requires immediate coordination with the train guard and the adjacent station masters to protect the block section." },
  { text: "A detonator placed on the track signals the driver to:", options: ["Increase speed", "Stop and proceed cautiously", "Reverse immediately", "Ignore it"], answer: 1, explanation: "A detonator explosion is an audible warning. The loco pilot must stop immediately, investigate, and then proceed with extreme caution at restricted speed." },
  { text: "Fixed signals are distinguished from working signals by:", options: ["Being painted blue", "Having no moving parts", "Being placed lower", "Flashing continuously"], answer: 1, explanation: "Fixed signals are permanent trackside landmarks or boards (like warning boards) that do not have active moving arms or shifting light aspects." },
  { text: "The whistle code for 'Stop' is:", options: ["One long", "Two short", "Three short", "One short"], answer: 0, explanation: "One long continuous blast of the engine whistle is the standard operational code signaling a stop or warning." },
  { text: "When automatic block operations, the speed limit in station limits is:", options: ["15 km/h", "25 km/h", "30 km/h", "50 km/h"], answer: 0, explanation: "Standard automatic block operations speed is strictly capped at 15 km/h to allow train managers and automatic block operations staff to safely switch tracks and prevent high-impact collisions." },
  { text: "A fouling mark indicates:", options: ["The limit of safe track clearance", "A defective rail", "Speed restriction end", "Gradient change"], answer: 0, explanation: "A fouling mark is a physical block placed between two converging tracks indicating the limit up to which vehicles can stand without obstructing movements on the adjacent line." },
  { text: "Who authorises working on a live track?", options: ["The nearest train manager", "The gang mate", "The station master with permit", "Any senior staff"], answer: 2, explanation: "Safety rules forbid working on active tracks without an official block permit and authorization issued by the Station Master on duty." },
  { text: "Verbal communication during train operations must be:", options: ["Quick and informal", "Clear, loud, and repeated back", "Whispered to avoid panic", "Written only"], answer: 1, explanation: "To prevent fatal misunderstandings, all verbal automatic block operations commands and line instructions must be clearly spoken and actively repeated back by the receiver." },
  { text: "A Point Indicator showing 'Normal' means:", options: ["Points are in reverse position", "Points are in normal position", "Points are defective", "No train is expected"], answer: 1, explanation: "A point indicator operates in correspondence with the switch rail position. A 'Normal' display confirms that the points are set for the straight/main line." },
  { text: "In fog, the frequency of detonator placement is:", options: ["Every 500 metres", "Every 1 km", "Every signal", "At engine only"], answer: 2, explanation: "During dense fog or thick weather, additional detonators are placed at the distant signal limits to warn incoming loco pilots of their proximity to the station." },
  { text: "When a train passes, the train manager should:", options: ["Walk along the track", "Stand at least 2 m away and observe", "Record speed", "Signal with a flag immediately"], answer: 1, explanation: "Train Managers are required to perform visual inspection of passing trains (checking for hot axles, hanging parts, or sparks) while standing at a safe distance." },
  { text: "A green hand signal during automatic block operations means:", options: ["Stop", "Proceed", "Caution", "Reverse"], answer: 1, explanation: "A green flag or green hand lamp signal indicates authorization to proceed with the automatic block operations movement." },
  { text: "Interlocking ensures that:", options: ["Signals and points cannot be in conflicting positions", "Only one train can enter the yard", "Points are locked at all times", "Signals always show green"], answer: 0, explanation: "Interlocking is a safety arrangement of signals, points, and other appliances, operated mechanically or electrically, preventing conflicting routes from being cleared simultaneously." },
  { text: "A 'Caution Order' issued to a driver must be:", options: ["Signed and returned to station master", "Kept by the driver until destination", "Torn after reading", "Radioed to control"], answer: 0, explanation: "A caution order contains temporary speed restrictions. The driver must sign and acknowledge receipt, returning the counterfoil to the SM." },
  { text: "The correct way to hold a flag when giving an 'All Right' signal is:", options: ["Waving it rapidly overhead", "Held steadily by the side", "Stretched horizontally at arm's length", "Pointing at the engine"], answer: 2, explanation: "An 'All Right' signal is presented by holding the green flag steadily stretched horizontally at arm's length towards the passing train." },
  { text: "Trap points are used to:", options: ["Increase train speed", "Prevent unauthorized entry into main line", "Derail a runaway vehicle away from the main line", "Signal an emergency stop"], answer: 2, explanation: "Trap points are safety switches designed to derail any runaway carriage or vehicle shifting unauthorizedly towards a busy passenger running line, protecting main line movements." },
  { text: "The SWR (Station Working Rules) must be revised:", options: ["Every 5 years", "As and when changes occur", "Only by the GM", "Never once issued"], answer: 1, explanation: "SWR rules must be amended immediately whenever physical layouts, signaling systems, or operating block instruments are modified at the station." },
  { text: "Before restoring points to normal after engineering work, the train manager must:", options: ["Inform the driver", "Check that the track is clear and inform station master", "Replace detonators", "Wait for green signal"], answer: 1, explanation: "Safety requires the train manager to visually verify that the track switches are free of tools, ballast, or staff before notifying the SM to normalise the routing." },
  { text: "If a signal cannot be lowered, the driver should be given:", options: ["A red flag and stopped", "A 'T/369' caution memo and proceed at 15 km/h", "Permission to proceed at full speed", "A verbal confirmation only"], answer: 1, explanation: "A defective signal requires a physical authorization memo (T/369-3b) handed to the driver, authorizing them to pass the signal at danger at restricted speed." }
];

const testQuestions = rawQuestions.map((q, i) => ({ id: i + 1, ...q }));

const initialHistory = [
  {
    id: 1,
    date: "2026-03-10",
    name: TEST_NAME,
    assessmentPeriod: "March 2026",
    totalScore: 84,
    sections: [
      { title: "Signal Rules", marks: 17, outOf: 20 },
      { title: "Track Handling", marks: 16, outOf: 20 },
      { title: "Communication", marks: 17, outOf: 20 },
      { title: "Safety Response", marks: 17, outOf: 20 },
      { title: "Operational Judgement", marks: 17, outOf: 20 }
    ],
    responses: generateMockResponses(84)
  },
  {
    id: 2,
    date: "2026-02-10",
    name: TEST_NAME,
    assessmentPeriod: "February 2026",
    totalScore: 76,
    sections: [
      { title: "Signal Rules", marks: 15, outOf: 20 },
      { title: "Track Handling", marks: 16, outOf: 20 },
      { title: "Communication", marks: 14, outOf: 20 },
      { title: "Safety Response", marks: 13, outOf: 20 },
      { title: "Operational Judgement", marks: 18, outOf: 20 }
    ],
    responses: generateMockResponses(76)
  },
  {
    id: 3,
    date: "2026-01-10",
    name: TEST_NAME,
    assessmentPeriod: "January 2026",
    totalScore: 88,
    sections: [
      { title: "Signal Rules", marks: 18, outOf: 20 },
      { title: "Track Handling", marks: 18, outOf: 20 },
      { title: "Communication", marks: 17, outOf: 20 },
      { title: "Safety Response", marks: 18, outOf: 20 },
      { title: "Operational Judgement", marks: 17, outOf: 20 }
    ],
    responses: generateMockResponses(88)
  },
  {
    id: 4,
    date: "2025-12-10",
    name: TEST_NAME,
    assessmentPeriod: "December 2025",
    totalScore: 68,
    sections: [
      { title: "Signal Rules", marks: 13, outOf: 20 },
      { title: "Track Handling", marks: 14, outOf: 20 },
      { title: "Communication", marks: 14, outOf: 20 },
      { title: "Safety Response", marks: 14, outOf: 20 },
      { title: "Operational Judgement", marks: 13, outOf: 20 }
    ],
    responses: generateMockResponses(68)
  },
  {
    id: 5,
    date: "2025-11-10",
    name: TEST_NAME,
    assessmentPeriod: "November 2025",
    totalScore: 72,
    sections: [
      { title: "Signal Rules", marks: 15, outOf: 20 },
      { title: "Track Handling", marks: 14, outOf: 20 },
      { title: "Communication", marks: 14, outOf: 20 },
      { title: "Safety Response", marks: 15, outOf: 20 },
      { title: "Operational Judgement", marks: 14, outOf: 20 }
    ],
    responses: generateMockResponses(72)
  }
];

/* ─── Single active test for the current month ─── */
const currentTestSeed = {
  id: "CT-APR-2026",
  name: TEST_NAME,
  period: "April 2026"
};

/* ─── Pie chart custom label ─── */
const PIE_COLORS = { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#dc2626" };

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, payload: inner } = payload[0];
    return (
      <div className="pm-pie-tooltip" style={{ background: '#fff', border: '1px solid #dbe5f0', padding: '8px', borderRadius: '8px' }}>
        <strong>Category {name}</strong>
        <div>{value}% &nbsp;({inner.count} attempt{inner.count !== 1 ? "s" : ""})</div>
      </div>
    );
  }
  return null;
};

// Global Web Audio synth for Emergency sound
let audioCtx = null;
let alarmOsc = null;
let alarmGain = null;
let alarmInterval = null;

function startAlarmSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
    
    alarmOsc = audioCtx.createOscillator();
    alarmGain = audioCtx.createGain();
    
    alarmOsc.connect(alarmGain);
    alarmGain.connect(audioCtx.destination);
    
    alarmOsc.type = "sine";
    alarmOsc.frequency.setValueAtTime(500, audioCtx.currentTime);
    alarmGain.gain.setValueAtTime(0, audioCtx.currentTime);
    
    alarmOsc.start();
    
    let state = true;
    alarmInterval = setInterval(() => {
      if (!audioCtx) return;
      // sweep frequency between 500Hz and 850Hz to sound like a warning klaxon
      alarmOsc.frequency.setValueAtTime(state ? 850 : 500, audioCtx.currentTime);
      alarmGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      state = !state;
    }, 450);
  } catch (err) {
    console.error("Audio Context initiation failed:", err);
  }
}

function stopAlarmSound() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (alarmOsc) {
    try { alarmOsc.stop(); } catch(e) {}
    alarmOsc = null;
  }
  if (audioCtx) {
    try { audioCtx.close(); } catch(e) {}
    audioCtx = null;
  }
}

/* ─── Main component ─── */
function TrainManagerModule({ user, onLogout }) {
  const fullName = user?.name && user.name !== "Train Manager User" ? user.name : trainManagerProfile.name;
  const employeeId = user?.hrmsId || trainManagerProfile.hrmsId;

  const [activeNav, setActiveNav] = useState("dashboard");
  const [screenMode, setScreenMode] = useState("default");
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(`tm_history_${employeeId}`);
    return saved ? JSON.parse(saved) : initialHistory;
  });
  
  const [historyDateSearch, setHistoryDateSearch] = useState("");
  const [historySortOrder, setHistorySortOrder] = useState("date-desc");
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // My Assessment state (mirrors SM module)
  const [myAssessSelected, setMyAssessSelected] = useState(null);
  const [tmMcqTest, setPmMcqTest] = useState(() => {
    const saved = localStorage.getItem(`tm_mcq_test_${employeeId}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [testAssigned, setTestAssigned] = useState(() => {
    const saved = localStorage.getItem(`tm_test_assigned_${employeeId}`);
    if (saved === null) {
      localStorage.setItem(`tm_test_assigned_${employeeId}`, "Assigned");
      return "Assigned";
    }
    return saved;
  });
  const [tmActiveQIdx, setPmActiveQIdx] = useState(0);
  const [tmTestResponses, setPmTestResponses] = useState(() => Array(25).fill(null));
  
  const [currentTest, setCurrentTest] = useState(() => {
    const saved = localStorage.getItem(`tm_current_test_${employeeId}`);
    if (saved) return JSON.parse(saved);
    const mcqResult = localStorage.getItem(`tm_mcq_test_${employeeId}`);
    if (mcqResult && JSON.parse(mcqResult).completed) {
      return null;
    }
    return currentTestSeed;
  });
  
  const [activeTest, setActiveTest] = useState(null);
  const [responses, setResponses] = useState(Array(25).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [statusText, setStatusText] = useState("");

  /* ─── Extra State Additions ─── */
  // 1. MCQ Timer (30 minutes = 1800 seconds)
  const [assessmentTimeLeft, setAssessmentTimeLeft] = useState(1800);
  const [isAssessmentTimerRunning, setIsAssessmentTimerRunning] = useState(false);

  // 2. Secure Login Session Timer (15 minutes = 900 seconds)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(900);

  // 3. Real-Time Notifications
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "danger", message: "CRITICAL: PME Medical examination scheduled on 2026-06-10.", time: "10 mins ago", read: false },
    { id: 2, type: "warning", message: "Safety Directive: New speed restriction (15km/h) active at Siding Points 12B.", time: "2 hours ago", read: false },
    { id: 3, type: "info", message: "Circular Update: SWR (Station Working Rules) Amendment v4.2 published.", time: "1 day ago", read: true },
    { id: 4, type: "success", message: "Training status updated: Periodic Safety Refresher completed.", time: "3 days ago", read: true }
  ]);

  // 4. Audit Activity Logs
  const [profileSubTab, setProfileSubTab] = useState("details"); // "details" | "audit"
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, timestamp: "2026-05-27 10:00:12", category: "Auth", action: "User session initialized (IP: 10.244.15.68)", user: "A. Mehta" },
    { id: 2, timestamp: "2026-05-27 10:01:45", category: "Profile", action: "PME & REF health profile retrieved", user: "A. Mehta" },
    { id: 3, timestamp: "2026-05-27 10:03:10", category: "System", action: "Audited dashboard integrity checklist successfully", user: "A. Mehta" }
  ]);

  // 5. Emergency Alert & Siren State
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyType, setEmergencyType] = useState("Obstruction on Track");
  const [emergencyLocation, setEmergencyLocation] = useState("Nagpur Yard Line 2");
  const [alarmMuted, setAlarmMuted] = useState(false);

  // 6. Safety Reports
  const [safetySubTab, setSafetySubTab] = useState("track"); // "track" | "incident" | "history"
  const [safetyReports, setSafetyReports] = useState([
    { id: 101, type: "Track Defect", defect: "Rail Joint Crack", location: "KM 104/2 Near Gate", severity: "High - Urgent Action", status: "RESOLVED", date: "2026-05-24", desc: "Visible hair crack on joint fishplate." },
    { id: 102, type: "Abnormal Incident", defect: "Hot Axle Exchanged Flag", location: "Line 1 Main", severity: "Medium - Investigating", status: "UNDER REPAIR", date: "2026-05-26", desc: "Detected sparks during all-right hand signal. Notified Station Master." }
  ]);

  // File Upload State Mock
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // Form Fields: Track Issue
  const [trackLocation, setTrackLocation] = useState("");
  const [trackLine, setTrackLine] = useState("Line 1");
  const [trackDefect, setTrackDefect] = useState("Rail Fracture");
  const [trackSeverity, setTrackSeverity] = useState("High - Urgent Action");
  const [trackDesc, setTrackDesc] = useState("");

  // Form Fields: Abnormal Incident
  const [incidentType, setIncidentType] = useState("Hot Axle");
  const [incidentTrain, setIncidentTrain] = useState("");
  const [incidentTime, setIncidentTime] = useState("");
  const [incidentAction, setIncidentAction] = useState("");

  // Track user notifications unread count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  /* ─── EFFECT: Secure Session CountDown ─── */
  useEffect(() => {
    const sessionTimer = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(sessionTimer);
          stopAlarmSound();
          alert("Secure Session Timeout (15 mins reached). For safety, you are logged out of the Indian Railways Operations Panel.");
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(sessionTimer);
  }, [onLogout]);

  /* ─── EFFECT: Assessment MCQ Countdown Timer ─── */
  useEffect(() => {
    let timer = null;
    if (isAssessmentTimerRunning && assessmentTimeLeft > 0) {
      timer = setInterval(() => {
        setAssessmentTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsAssessmentTimerRunning(false);
            submitTest(true); // force auto-submit!
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAssessmentTimerRunning, assessmentTimeLeft]);
  /* ─── Derived metrics ─── */
  const latestScore = history.length ? history[0].totalScore : null;
  const latestCategory = latestScore !== null ? getCategory(latestScore) : "—";
  const averageScore = history.length
    ? Math.round(history.reduce((s, i) => s + i.totalScore, 0) / history.length)
    : 0;
  const answeredCount = responses.filter(v => v !== null).length;
  const completionRate = Math.round((answeredCount / 25) * 100);

  /* ─── Dynamic Performance Summary ─── */
  const performanceSummaryText = useMemo(() => {
    const rec = myAssessSelected || selectedRecord;
    if (!rec || !rec.sections || rec.sections.length === 0) return "";
    const { totalScore, sections } = rec;
    const lowestSec = [...sections].sort((a, b) => a.marks - b.marks)[0];
    const highestSec = [...sections].sort((a, b) => b.marks - a.marks)[0];

    let summary = `Assessment score achieved: ${totalScore}/100 (${totalScore >= 80 ? 'Outstanding Competency' : totalScore >= 50 ? 'Satisfactory Operations' : 'Requires Training'}). `;
    summary += `Demonstrated excellent competency in "${highestSec.title}" scoring ${highestSec.marks}/${highestSec.outOf} marks. `;
    if (lowestSec.marks < lowestSec.outOf) {
      summary += `However, low-scoring markers are observed in "${lowestSec.title}" (${lowestSec.marks}/${lowestSec.outOf}). It is highly recommended to study the Station Working Rules (SWR) for block operations and undergo periodic coaching.`;
    } else {
      summary += `Achieved flawless accuracy in all modules. Recommended to maintain this premium standard in daily train manager operations.`;
    }
    return summary;
  }, [myAssessSelected, selectedRecord]);

  /* ─── Chart data ─── */
  const trendData = useMemo(() =>
    [...history].reverse().map(r => ({
      date: r.assessmentPeriod.slice(0, 7),
      score: r.totalScore
    })), [history]);

  const pieData = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    history.forEach(r => { counts[getCategory(r.totalScore)]++; });
    const total = history.length || 1;
    return Object.entries(counts)
      .filter(([, c]) => c > 0)
      .map(([cat, count]) => ({
        name: cat,
        value: Math.round((count / total) * 100),
        count
      }));
  }, [history]);

  /* ─── Filtered / sorted history ─── */
  const filteredHistory = useMemo(() => {
    let list = history.filter(item =>
      historyDateSearch.trim() === "" || item.date.includes(historyDateSearch.trim())
    );
    if (historySortOrder === "score-asc") list = [...list].sort((a, b) => a.totalScore - b.totalScore);
    else if (historySortOrder === "score-desc") list = [...list].sort((a, b) => b.totalScore - a.totalScore);
    else if (historySortOrder === "date-asc") list = [...list].sort((a, b) => a.date.localeCompare(b.date));
    return list;
  }, [history, historyDateSearch, historySortOrder]);

  /* ─── Navigation ─── */
  const goToNavPage = (key) => {
    setActiveNav(key);
    setScreenMode("default");
    setStatusText("");
  };

  const openScorecard = (record) => {
    setSelectedRecord(record);
    setActiveNav("history");
    setScreenMode("scorecard");
  };

  const logActivity = (category, action) => {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog = {
      id: Date.now(),
      timestamp: time,
      category,
      action,
      user: fullName
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const triggerNotification = (type, message) => {
    const newAlert = {
      id: Date.now(),
      type,
      message,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  /* ─── My Assessment Test Actions (mirrors SM) ─── */
  const startTestAttempt = () => {
    setPmActiveQIdx(0);
    setPmTestResponses(Array(25).fill(null));
    setScreenMode("takeTest");
  };

  const handleSubmitTestAttempt = () => {
    const correctCount = tmTestResponses.filter((r, idx) => r === testQuestions[idx].answer).length;
    const percentage = Math.round((correctCount / 25) * 100);
    const passStatus = percentage >= 60 ? "PASSED" : "FAILED";
    const today = new Date().toISOString().slice(0, 10);
    const testResult = {
      completed: true,
      correctCount,
      responses: [...tmTestResponses],
      submittedDate: today,
      percentage,
      passStatus
    };
    localStorage.setItem(`tm_mcq_test_${employeeId}`, JSON.stringify(testResult));
    setPmMcqTest(testResult);
    localStorage.setItem(`tm_test_assigned_${employeeId}`, "Completed");
    setTestAssigned("Completed");
    const record = {
      id: Date.now(),
      date: today,
      assessmentPeriod: "Q2 2026",
      name: TEST_NAME,
      assessedBy: "Online Self-Exam",
      totalScore: correctCount * 4,
      sections: [
        { title: "Signal Rules",          marks: 0, outOf: 20 },
        { title: "Track Handling",         marks: 0, outOf: 20 },
        { title: "Communication",          marks: 0, outOf: 20 },
        { title: "Safety Response",        marks: 0, outOf: 20 },
        { title: "Operational Judgement",  marks: 0, outOf: 20 }
      ],
      responses: [...tmTestResponses],
      approvalStatus: "Completed",
      isOnlineExam: true
    };
    const newHistory = [record, ...history];
    setHistory(newHistory);
    localStorage.setItem(`tm_history_${employeeId}`, JSON.stringify(newHistory));
    setScreenMode("default");
    setStatusText(`Assessment submitted! Score: ${percentage}% (${correctCount}/25). Status: Completed.`);
  };

  /* ─── Test Actions ─── */
  const handleReattempt = () => {
    localStorage.removeItem(`tm_mcq_test_${employeeId}`);
    localStorage.setItem(`tm_current_test_${employeeId}`, JSON.stringify(currentTestSeed));
    setCurrentTest(currentTestSeed);
    setActiveTest(currentTestSeed);
    setResponses(Array(25).fill(null));
    setCurrentQuestion(0);
    setStatusText("New CBT automatic block operations safety test session initialized.");
    setActiveNav("current");
    setScreenMode("attempt");
    logActivity("Assessment", "Periodic CBT assessment re-attempt session started.");
    triggerNotification("info", "New automatic block operations safety CBT competency exam session active.");
  };

  const startTest = () => {
    setActiveTest(currentTest || currentTestSeed);
    setResponses(Array(25).fill(null));
    setCurrentQuestion(0);
    setStatusText("");
    setIsAssessmentTimerRunning(false);
    setActiveNav("current");
    setScreenMode("attempt");
    logActivity("Assessment", "Periodic assessment test started.");
  };

  const handleSelectOption = (idx) => {
    setResponses(prev => { const n = [...prev]; n[currentQuestion] = idx; return n; });
  };

  const evaluateTest = () => {
    let correct = 0;
    const sec = [0, 0, 0, 0, 0];
    responses.forEach((r, i) => {
      const si = Math.floor(i / 5);
      if (r === testQuestions[i].answer) { correct++; sec[si] += 4; }
    });
    const sections = [
      "Signal Rules", 
      "Track Handling", 
      "Communication", 
      "Safety Response", 
      "Operational Judgement"
    ].map((title, i) => ({ title, marks: sec[i], outOf: 20 }));
    return { totalScore: correct * 4, sections };
  };

  const submitTest = (isAutoSubmit = false) => {
    setIsAssessmentTimerRunning(false);
    const { totalScore, sections } = evaluateTest();
    const today = new Date().toISOString().slice(0, 10);
    const record = {
      id: Date.now(),
      date: today,
      name: TEST_NAME,
      assessmentPeriod: activeTest ? activeTest.period : "April 2026",
      totalScore,
      sections,
      responses: [...responses]
    };
    const newHistory = [record, ...history];
    setHistory(newHistory);
    localStorage.setItem(`tm_history_${employeeId}`, JSON.stringify(newHistory));
    
    setCurrentTest(null);
    localStorage.setItem(`tm_current_test_${employeeId}`, JSON.stringify(null));

    // Save MCQ result for Traffic Inspector
    const correctCount = Math.round(totalScore / 4);
    const percentage = Math.round((correctCount / 25) * 100);
    const mcqResult = {
      completed: true,
      correctCount: correctCount,
      submittedDate: today,
      percentage: percentage
    };
    localStorage.setItem(`tm_mcq_test_${employeeId}`, JSON.stringify(mcqResult));

    setSelectedRecord(record);
    setActiveTest(null);
    setActiveNav("history");
    setScreenMode("scorecard");
    
    const label = isAutoSubmit ? "Auto-submitted (Time Expired)" : "Submitted Successfully";
    setStatusText(`Assessment evaluation completed! ${label}.`);
    logActivity("Assessment", `Submitted test with score ${totalScore}% (Cat. ${getCategory(totalScore)})`);
    triggerNotification("success", `Assessment complete! Score: ${totalScore}/100. Grade: Category ${getCategory(totalScore)}`);
  };

  /* ─── Secure Session Actions ─── */
  const refreshSession = () => {
    setSessionTimeLeft(900);
    logActivity("Auth", "User secure login session refreshed to 15:00.");
    triggerNotification("success", "Operations login session renewed safely.");
  };

  /* ─── File Attachment Handlers ─── */
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const files = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + " MB"
      }));
      setAttachedFiles(prev => [...prev, ...files]);
      logActivity("Safety", `Attached safety evidence: ${files.map(x=>x.name).join(', ')}`);
    }
  };

  const removeAttachedFile = (idx) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  /* ─── Form Submission: Track Issue ─── */
  const submitTrackIssue = (e) => {
    e.preventDefault();
    if (!trackLocation.trim() || !trackDesc.trim()) {
      alert("Please fill in location and description details.");
      return;
    }
    const newReport = {
      id: Date.now(),
      type: "Track Defect",
      defect: trackDefect,
      location: `${trackLine} - KM ${trackLocation}`,
      severity: trackSeverity,
      status: "PENDING MASTER ACTION",
      date: new Date().toISOString().slice(0, 10),
      desc: trackDesc,
      attachments: [...attachedFiles]
    };
    setSafetyReports(prev => [newReport, ...prev]);
    
    logActivity("Safety", `Safety track defect reported: ${trackDefect} at KM ${trackLocation}`);
    triggerNotification("danger", `SAFETY REPORT SUBMITTED: Defect: ${trackDefect} | Loc: KM ${trackLocation}`);
    
    // Reset
    setTrackLocation("");
    setTrackDesc("");
    setAttachedFiles([]);
    setFileInputKey(Date.now());
    setSafetySubTab("history");
    setStatusText("Safety report logged. Forwarded to Station Master & Traffic Inspector.");
  };

  /* ─── Form Submission: Incident ─── */
  const submitIncidentReport = (e) => {
    e.preventDefault();
    if (!incidentTrain.trim() || !incidentAction.trim()) {
      alert("Please enter Train Number and Actions taken.");
      return;
    }
    const newReport = {
      id: Date.now(),
      type: "Abnormal Incident",
      defect: incidentType,
      location: `Train ${incidentTrain} (${incidentTime || "Current"})`,
      severity: "High - Immediate Action",
      status: "STATION INVESTIGATION ACTIVE",
      date: new Date().toISOString().slice(0, 10),
      desc: incidentAction,
      attachments: [...attachedFiles]
    };
    setSafetyReports(prev => [newReport, ...prev]);
    
    logActivity("Safety", `Abnormal incident logged: ${incidentType} in Train ${incidentTrain}`);
    triggerNotification("warning", `INCIDENT ALERT: ${incidentType} detected on Train ${incidentTrain}.`);
    
    // Reset
    setIncidentTrain("");
    setIncidentAction("");
    setIncidentTime("");
    setAttachedFiles([]);
    setFileInputKey(Date.now());
    setSafetySubTab("history");
    setStatusText("Abnormal incident report logged and dispatched to Division Controller.");
  };

  /* ─── Emergency Broadcast Actions ─── */
  const openEmergencyDialog = () => {
    setEmergencyModalOpen(true);
  };

  const triggerEmergencyBroadcast = () => {
    setEmergencyModalOpen(false);
    setEmergencyActive(true);
    setAlarmMuted(false);
    startAlarmSound();
    
    logActivity("EMERGENCY", `CRITICAL: Pulse emergency alert triggered! Type: ${emergencyType} at ${emergencyLocation}`);
    triggerNotification("danger", `🚨 BROADCAST ACTIVE: ${emergencyType} at ${emergencyLocation}. Dispatching rescue!`);
    setStatusText("EMERGENCY BROADCAST TRANSMITTING SYSTEM-WIDE!");
  };

  const clearEmergencyState = () => {
    setEmergencyActive(false);
    stopAlarmSound();
    logActivity("EMERGENCY", "Emergency alert acknowledged and cleared.");
    triggerNotification("success", "Emergency alert deactivated. Operational line clear reinstated.");
    setStatusText("Emergency broadcast deactivated. Tracks returned to safe normal status.");
  };

  const toggleAlarmMute = () => {
    if (alarmMuted) {
      startAlarmSound();
      setAlarmMuted(false);
    } else {
      stopAlarmSound();
      setAlarmMuted(true);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    logActivity("System", "Notifications inbox marked read.");
  };

  /* ═══════════════════════════════════════
     RENDER: PROFILE & AUDIT
  ═══════════════════════════════════════ */
  /* ═══════════════════════════════════════
     RENDER: DASHBOARD
  ═══════════════════════════════════════ */
  const renderDashboardPage = () => (
    <div className="pm-dashboard-layout">
      {/* Summary cards */}
      <div className="pm-summary-cards">
        <article className="pm-sum-card" style={{ cursor: "pointer" }} onClick={() => setActiveNav("myAssessment")}>
          <div className="pm-sum-icon" style={{ background: "#eff6ff" }}>
            <Target size={20} color="#2563eb" />
          </div>
          <div>
            <label>Latest Score</label>
            <strong>{latestScore !== null ? `${latestScore}/100` : "—"}</strong>
          </div>
        </article>

        <article className="pm-sum-card" style={{ cursor: "pointer" }} onClick={() => setActiveNav("myAssessment")}>
          <div className="pm-sum-icon" style={{ background: "#f0fdf4" }}>
            <Gauge size={20} color="#16a34a" />
          </div>
          <div>
            <label>Average Score</label>
            <strong>{averageScore}/100</strong>
          </div>
        </article>

        <article className="pm-sum-card" style={{ cursor: "pointer" }} onClick={() => setActiveNav("myAssessment")}>
          <div className="pm-sum-icon" style={{ background: getCategoryBg(latestCategory) }}>
            <ShieldCheck size={20} color={getCategoryColor(latestCategory)} />
          </div>
          <div>
            <label>Current Category</label>
            <strong style={{ color: getCategoryColor(latestCategory) }}>
              {latestCategory !== "—" ? `Category ${latestCategory}` : "—"}
            </strong>
          </div>
        </article>

        <article className="pm-sum-card" style={{ cursor: "pointer" }} onClick={() => setActiveNav("myAssessment")}>
          <div className="pm-sum-icon" style={{ background: "#fdf4ff" }}>
            <Award size={20} color="#9333ea" />
          </div>
          <div>
            <label>Total Attempts</label>
            <strong>{history.length}</strong>
          </div>
        </article>
      </div>

      <div className="pm-charts-row">
        {/* Performance Trends Chart */}
        <div className="pm-chart-card">
          <div className="pm-chart-header">
            <TrendingUp size={16} />
            <h3>Assessment Performance Trend</h3>
          </div>
          {trendData.length < 2 ? (
            <p className="pm-empty-state">At least 2 attempts needed to show trend.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13 }}
                  formatter={(v) => [`${v}/100`, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: "#2563eb", strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="pm-chart-card">
          <div className="pm-chart-header">
            <BarChart2 size={16} />
            <h3>Category Grade Distribution</h3>
          </div>
          {pieData.length === 0 ? (
            <p className="pm-empty-state">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     RENDER: PROFILE
  ═══════════════════════════════════════ */
  const renderProfilePage = () => {
    const personalScoreData = [...history].reverse().map(h => ({
      month: h.assessmentPeriod.replace(" 2026", "").replace(" 2025", ""),
      score: h.totalScore
    }));

    return (
      <div className="sdom-fade">
        {/* Hero header */}
        <div className="sdom-station-header" style={{ marginBottom: 24 }}>
          <div className="sdom-station-header-meta">
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Staff Profile</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4 }}>{fullName}</div>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>{trainManagerProfile.designation} &bull; {trainManagerProfile.stationName} &bull; Central Railway</div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <span className="sdom-badge sdom-badge-success">Category {latestCategory}</span>
              <span className="sdom-badge sdom-badge-success">Low Risk</span>
              <span className="sdom-badge sdom-badge-success">Active</span>
            </div>
          </div>
          <div className="sdom-station-header-stats">
            <div className="sdom-station-header-stat">
              <span className="val">{latestScore !== null ? latestScore : "—"}</span>
              <span className="lbl">Latest Score</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }}/>
            <div className="sdom-station-header-stat">
              <span className="val">{trainManagerProfile.mobileNumber}</span>
              <span className="lbl">Contact</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }}/>
            <div className="sdom-station-header-stat">
              <span className="val">{history.length ? history[0].date : trainManagerProfile.joiningDate}</span>
              <span className="lbl">Last Assessment</span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="sdom-row-2" style={{ marginBottom: "24px" }}>
          <div className="sdom-chart-card">
            <div className="sdom-chart-title" style={{ marginBottom: "16px" }}>Personal & Professional Details</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', paddingBottom: '20px' }}>
              {[
                ["Employee ID / HRMS ID", employeeId],
                ["Designation", trainManagerProfile.designation],
                ["Mobile Number", trainManagerProfile.mobileNumber],
                ["Email ID", `${employeeId.toLowerCase()}@rail.in`],
                ["Account Status", "Active"],
                ["Current Zone", "Central Railway"],
                ["Current Division", "Nagpur"],
                ["Current Station Placement", trainManagerProfile.stationName],
                ["Reporting Officer", trainManagerProfile.reportingOfficer]
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{lbl}</div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Operational Specifications */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#0f172a', fontWeight: '800', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                Operational & Safety Dates
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', fontSize: '13px' }}>
                <div><strong>PME Last Completed:</strong><div style={{fontWeight: 700, color: "#065f46", marginTop: 4}}>2024-10-16 (FIT)</div></div>
                <div><strong>PME Next Due:</strong><div style={{fontWeight: 700, color: "#991b1b", marginTop: 4}}>2029-08-20</div></div>
                <div><strong>Refresher Course Completed:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>2024-04-13</div></div>
                <div><strong>Refresher Course Due:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>2027-05-12</div></div>
                <div style={{ gridColumn: "span 2" }}><strong>Training Clearance:</strong><div style={{fontWeight: 700, color: "#d97706", marginTop: 4}}>{trainManagerProfile.trainingStatus}</div></div>
              </div>
            </div>
          </div>

          <div className="sdom-chart-card">
            <div className="sdom-chart-title">Score Trend</div>
            <div className="sdom-chart-subtitle">Your assessment score progression</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={personalScoreData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="month" fontSize={11}/>
                  <YAxis domain={[40, 100]} fontSize={11}/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════
     RENDER: MY ASSESSMENT (mirrors SM module exactly)
  ═══════════════════════════════════════ */
  const renderMyAssessment = () => {
    /* Scorecard detail view */
    if (myAssessSelected) {
      const sc = myAssessSelected;
      const cat = getCategory(sc.totalScore);
      const liveTotal = sc.totalScore || 0;
      const performanceSummary = performanceSummaryText;

      return (
        <div className="ti2-card animate-fade-in" style={{ padding: "24px", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          <div className="ti2-card-hdr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "20px" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}><ShieldCheck size={22} color="#16a34a"/> Detailed Evaluation Scorecard</h2>
            <button className="ti2-primary-btn" onClick={() => setMyAssessSelected(null)}>← Return to History</button>
          </div>

          <div className="pm-scorecard-hero" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
            <div className="pm-sc-score-circle" style={{ width: "90px", height: "90px", borderRadius: "50%", border: `6px solid ${getCategoryColor(cat) || "#2563eb"}`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flexShrink: 0, background: "#fff" }}>
              <strong style={{ fontSize: "24px", color: getCategoryColor(cat) || "#2563eb", fontWeight: "800" }}>{liveTotal}</strong>
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", marginTop: "-2px" }}>/100</span>
            </div>
            <div>
              <span className="pm-cat-badge-lg" style={{ background: getCategoryBg(cat), color: getCategoryColor(cat), display: "inline-block", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
                Final Category: Category {cat}
              </span>
              <p className="pm-sc-period" style={{ margin: "2px 0", fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>{sc.assessmentPeriod} - Self-Compliance Audit</p>
              <p className="pm-sc-date" style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Attempt Completed: {sc.date} &nbsp;·&nbsp; Assessed By: {sc.assessedBy || "Traffic Inspector"}</p>
            </div>
          </div>

          {/* Dynamic Performance Summary */}
          <div className="pm-performance-summary-box" style={{ background: "#eff6ff", borderLeft: "4px solid #2563eb", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "6px" }}>📊 Official Performance Evaluation Summary</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#1e3a8a", lineHeight: "1.5" }}>{performanceSummary || `Assessment score: ${liveTotal}/100. Periodic evaluation completed.`}</p>
          </div>

          {/* Competency Module Breakdown */}
          <div className="pm-sc-sections" style={{ marginBottom: "30px" }}>
            <h3 style={{ fontSize: "15px", color: "#0f172a", marginBottom: "16px", fontWeight: "700" }}>Safety Domain Competency Breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(sc.sections || []).map(s => {
                const spc = Math.round((s.marks / s.outOf) * 100);
                const barColor = spc >= 80 ? "#16a34a" : spc >= 50 ? "#2563eb" : spc >= 26 ? "#d97706" : "#dc2626";
                return (
                  <div key={s.title} className="pm-sc-section-row" style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px" }}>
                    <span className="pm-sc-section-name" style={{ width: "260px", fontWeight: "600", color: "#334155" }}>{s.title}</span>
                    <div className="pm-sc-bar-wrap" style={{ flexGrow: 1, height: "8px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                      <div className="pm-sc-bar-fill" style={{ width: `${spc}%`, height: "100%", background: barColor, borderRadius: "999px" }} />
                    </div>
                    <span className="pm-sc-section-marks" style={{ width: "60px", textAlign: "right", fontWeight: "700", color: "#0f172a" }}>{s.marks}/{s.outOf}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete MCQ Question Review */}
          <div className="pm-mcq-review-panel" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
            <div className="pm-chart-header" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} color="#475569"/>
              <h3 style={{ margin: 0, fontSize: "15px", color: "#0f172a", fontWeight: "700" }}>Complete Assessment Question Review</h3>
            </div>
            <p className="pm-subtitle" style={{ fontSize: "12px", color: "#64748b", marginTop: "-10px", marginBottom: "20px" }}>
              Below is the detailed response evaluation for all 25 compulsory questions. Correct responses are highlighted in green; incorrect choices are highlighted in red.
            </p>
            <div className="pm-review-questions-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {testQuestions.map((q, qIndex) => {
                const selectedOpt = sc.responses ? sc.responses[qIndex] : null;
                const isCorrect = selectedOpt === q.answer;
                return (
                  <div key={qIndex} className={`pm-review-question-card ${isCorrect ? "correct-card" : "wrong-card"}`}>
                    <div className="pm-rq-header">
                      <span className="pm-rq-number">Question {qIndex + 1}</span>
                      {isCorrect ? (
                        <span className="pm-rq-badge success">Correct (+4 Marks)</span>
                      ) : (
                        <span className="pm-rq-badge danger">Incorrect (0 Marks)</span>
                      )}
                    </div>
                    <h4 className="pm-rq-text">{q.text}</h4>
                    <div className="pm-rq-options-grid">
                      {q.options.map((opt, oIdx) => {
                        const wasSelected = selectedOpt === oIdx;
                        const isOptCorrect = q.answer === oIdx;
                        let optClass = "";
                        if (wasSelected) optClass = isCorrect ? "opt-selected-correct" : "opt-selected-wrong";
                        else if (isOptCorrect) optClass = "opt-correct-unselected";
                        return (
                          <div key={oIdx} className={`pm-rq-option-item ${optClass}`}>
                            <span className="font-mono opt-prefix">{["A","B","C","D"][oIdx]}</span>
                            <span className="opt-label-text">{opt}</span>
                            {wasSelected && <span className="opt-user-tag">{isCorrect ? "✓ Selected" : "✗ Selected"}</span>}
                            {!wasSelected && isOptCorrect && <span className="opt-correct-tag">✓ Correct Key</span>}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div style={{ marginTop: "16px", background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", borderLeft: "4px solid #f97316", fontSize: "12.5px", color: "#334155" }}>
                        <strong style={{ color: "#c2410c" }}>💡 Operational Safety Explanation: </strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    const testActive = testAssigned === "Assigned" && (!tmMcqTest || !tmMcqTest.completed);

    /* History list */
    return (
      <section className="sm2-card">
        {/* MCQ Assessment Assignment Banner */}
        {testActive ? (
          <div style={{
            background:"linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)",
            border:"1.5px solid #fed7aa",
            borderRadius:12,
            padding:20,
            marginBottom:24,
            boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)"
          }}>
            <div style={{display:"flex", gap:16, alignItems:"start"}}>
              <div style={{
                background:"#ffedd5",
                borderRadius:50,
                width:42,
                height:42,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                flexShrink:0
              }}>
                <ShieldCheck size={22} color="#ea580c"/>
              </div>
              <div style={{flex:1}}>
                <h3 style={{margin:"0 0 6px", fontSize:16, fontWeight:700, color:"#c2410c"}}>
                  ⚠️ Pending Competency Assessment
                </h3>
                <p style={{margin:"0 0 14px", fontSize:13, color:"#9a3412", lineHeight:1.4}}>
                  Your supervisor (Traffic Inspector)has scheduled a periodic safety &amp; competency assessment for you. You must complete the 25-question MCQ exam.
                </p>
                <button
                  onClick={startTestAttempt}
                  style={{
                    background:"#ea580c",
                    color:"#ffffff",
                    border:"none",
                    padding:"10px 20px",
                    borderRadius:8,
                    fontSize:13.5,
                    fontWeight:700,
                    cursor:"pointer",
                    boxShadow:"0 4px 6px rgba(234, 88, 12, 0.2)",
                    display:"flex",
                    alignItems:"center",
                    gap:8
                  }}
                >
                  Start 25 MCQ Online Assessment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background:"#f0fdf4",
            border:"1.5px solid #bbf7d0",
            borderRadius:12,
            padding:18,
            marginBottom:24,
            display:"flex",
            alignItems:"center",
            gap:14
          }}>
            <ShieldCheck size={24} color="#16a34a"/>
            <div style={{flex:1}}>
              <h3 style={{margin:"0 0 2px", fontSize:14.5, fontWeight:700, color:"#14532d"}}>
                All assessments are up to date. No pending test available.
              </h3>
              <p style={{margin:0, fontSize:12, color:"#166534"}}>
                Your periodic safety and competency evaluation is currently active and compliant.
              </p>
            </div>
            <div style={{display:"flex", gap:16, fontSize:12, textAlign:"right"}}>
              <div>
                <span style={{color:"#166534", display:"block"}}>Last Exam Score</span>
                <strong style={{color:"#14532d", fontSize:13}}>{tmMcqTest ? `${tmMcqTest.correctCount}/25 (${tmMcqTest.percentage}%)` : `${history[0]?.totalScore || 84}/100`}</strong>
              </div>
              <div style={{borderLeft:"1px solid #bbf7d0", paddingLeft:16}}>
                <span style={{color:"#166534", display:"block"}}>Next Due Date</span>
                <strong style={{color:"#14532d", fontSize:13}}>25 Sep 2026</strong>
              </div>
            </div>
          </div>
        )}

        <div className="sm2-card-hdr"><h2>My Assessment History </h2></div>
        <p className="sm2-subtitle">All assessments conducted by the Traffic Inspector/Station Supervisor for your record. Click any row to view the detailed scorecard.</p>

        {/* Summary strip */}
        <div className="sm2-myassess-summary">
          <div className="sm2-report-mini">
            <label>Total Assessments</label>
            <strong>{history.length}</strong>
          </div>
          <div className="sm2-report-mini">
            <label>Latest Score</label>
            <strong>{history[0]?.totalScore ?? "—"}/{history[0]?.isOnlineExam ? 25 : 100}</strong>
          </div>
          <div className="sm2-report-mini">
            <label>Average SM Score</label>
            <strong>{
              (() => {
                const regs = history.filter(h => !h.isOnlineExam);
                return regs.length ? `${Math.round(regs.reduce((s, a) => s + a.totalScore, 0) / regs.length)}/100` : "—";
              })()
            }</strong>
          </div>
          <div className="sm2-report-mini">
            <label>Latest Assessment</label>
            <strong style={{color: getCategoryColor(getCategory(history[0]?.totalScore || 0))}}>
              {history[0]?.isOnlineExam ? "Online CBT" : `Category ${getCategory(history[0]?.totalScore || 0)}`}
            </strong>
          </div>
        </div>

        {/* List */}
        <div className="sm2-myassess-list">
          <div className="sm2-myassess-head">
            {["Period","Date","Score Scale","Category","Assessed By","Status",""].map(h =>
              <span key={h}>{h}</span>)}
          </div>
          {history.map(sc => {
            const cat = getCategory(sc.totalScore);
            return (
              <button key={sc.id} className="sm2-myassess-row" onClick={() => setMyAssessSelected(sc)}>
                <span title={`Cycle: ${sc.assessmentPeriod}\nDuration: ${formatQuarterPeriod(sc.assessmentPeriod)}`}>
                  <strong>{formatQuarterPeriod(sc.assessmentPeriod)}</strong>
                </span>
                <span>{sc.date}</span>
                <span><strong>{sc.totalScore}/{sc.isOnlineExam ? 25 : 100}</strong></span>
                <span>
                  <span className="sm2-badge" style={{background:getCategoryBg(cat),color:getCategoryColor(cat)}}>
                    {sc.isOnlineExam ? "CBT Exam" : `Cat. ${cat}`}
                  </span>
                </span>
                <span style={{fontSize:11,color:"#64748b"}}>{sc.assessedBy || "TI_1001 (Traffic Inspector)"}</span>
                <span>
                  <span className={`sm2-status-pill sm2-status-${(sc.approvalStatus || "approved").toLowerCase()}`}>{sc.approvalStatus || "Approved"}</span>
                </span>
                <span style={{color:"#2563eb",fontSize:12,fontWeight:600}}>View Form</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  /* ═══════════════════════════════════════
     RENDER: TAKE TEST SCREEN (mirrors SM renderTakeTest)
  ═══════════════════════════════════════ */
  const renderTakeTest = () => {
    const question = testQuestions[tmActiveQIdx];
    const answeredCount = tmTestResponses.filter(r => r !== null && r !== undefined).length;
    const completionRate = Math.round((answeredCount / 25) * 100);
    const unansweredCount = 25 - answeredCount;

    return (
      <div style={{
        position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:999999,
        background:"#f1f5f9", display:"flex", flexDirection:"column",
        height:"100vh", width:"100vw", overflow:"hidden", fontFamily:"'Poppins', sans-serif"
      }}>
        <header style={{
          background:"#1e293b", color:"#ffffff", padding:"16px 24px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          boxShadow:"0 4px 6px -1px rgba(0,0,0,0.1)", height:"70px", flexShrink:0
        }}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <ShieldCheck size={28} color="#ea580c"/>
            <div>
              <h1 style={{fontSize:18, fontWeight:800, margin:0, color:"#ffffff", letterSpacing:"0.5px"}}>
                TRAIN MANAGER CBT COMPETENCY EVALUATION
              </h1>
              <p style={{margin:0, fontSize:11, color:"#94a3b8", fontWeight:500}}>
                Official Railway Safety &amp; Operational Assessment
              </p>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:16}}>
            <div style={{background:"#334155", padding:"6px 16px", borderRadius:8, fontSize:13, fontWeight:700, color:"#cbd5e1", border:"1px solid #475569"}}>
              ⚙️ STATUS: <span style={{color:"#ea580c"}}>Active Exam Session</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to abort the exam? Your progress will not be saved.")) {
                  setScreenMode("default");
                }
              }}
              style={{padding:"8px 18px", borderRadius:8, fontSize:13, background:"#ef4444", color:"#ffffff", border:"none", fontWeight:700, cursor:"pointer"}}
            >
              Exit Exam
            </button>
          </div>
        </header>

        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"#ffffff", borderBottom:"1.5px solid #e2e8f0", padding:"12px 24px", height:"50px", flexShrink:0, fontSize:13.5, color:"#334155"}}>
          <div>Candidate: <strong style={{color:"#1e3a8a"}}>{fullName}</strong> &nbsp;|&nbsp; HRMS: <strong style={{color:"#1e3a8a"}}>{employeeId}</strong> &nbsp;|&nbsp; Station: <strong>{trainManagerProfile.stationName}</strong></div>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <span style={{fontWeight:600}}>Progress: <strong style={{color:"#ea580c"}}>{answeredCount} / 25 Answered</strong> ({completionRate}%)</span>
            <div style={{width:140, height:8, background:"#e2e8f0", borderRadius:4, overflow:"hidden"}}>
              <div style={{width:`${completionRate}%`, height:"100%", background:"#ea580c", borderRadius:4}}/>
            </div>
          </div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 340px", flex:1, overflow:"hidden"}}>
          {/* Left: Question Pane */}
          <div style={{padding:"32px 40px", display:"flex", flexDirection:"column", background:"#f8fafc", overflowY:"auto", height:"100%"}}>
            <div style={{background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:14, padding:36, boxShadow:"0 10px 15px -3px rgba(0,0,0,0.05)", flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between", marginBottom:24}}>
              <div>
                <span style={{fontSize:12.5, fontWeight:800, color:"#ea580c", background:"#fff7ed", padding:"6px 14px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.8px"}}>
                  Compulsory Question {tmActiveQIdx + 1} of 25
                </span>
                <h2 style={{fontSize:22, fontWeight:700, color:"#0f172a", marginTop:24, marginBottom:28, lineHeight:1.5}}>{question.text}</h2>
                <div style={{display:"flex", flexDirection:"column", gap:14}}>
                  {question.options.map((opt, oi) => {
                    const isSelected = tmTestResponses[tmActiveQIdx] === oi;
                    return (
                      <label key={oi} style={{display:"flex", alignItems:"center", gap:16, padding:"18px 24px", border:isSelected ? "2.5px solid #ea580c" : "1.5px solid #e2e8f0", borderRadius:12, background:isSelected ? "#fff7ed" : "#ffffff", cursor:"pointer", boxShadow:isSelected ? "0 4px 6px rgba(234,88,12,0.08)" : "none", transition:"all 0.15s ease"}}>
                        <input type="radio" name={`pmq-${tmActiveQIdx}`} checked={isSelected} onChange={() => { const r=[...tmTestResponses]; r[tmActiveQIdx]=oi; setPmTestResponses(r); }} style={{width:20, height:20, accentColor:"#ea580c"}}/>
                        <span style={{fontSize:15, fontWeight:800, color:isSelected?"#c2410c":"#64748b", width:24}}>{["A","B","C","D"][oi]}</span>
                        <span style={{fontSize:15, color:"#1e293b", fontWeight:isSelected?700:500}}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 24px", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)"}}>
              <button disabled={tmActiveQIdx===0} onClick={() => setPmActiveQIdx(p=>Math.max(0,p-1))} style={{padding:"12px 28px", borderRadius:8, fontSize:14, fontWeight:700, background:tmActiveQIdx===0?"#f1f5f9":"#ffffff", color:tmActiveQIdx===0?"#94a3b8":"#334155", border:"1.5px solid #cbd5e1", cursor:tmActiveQIdx===0?"not-allowed":"pointer"}}>← Previous Question</button>
              <div style={{fontSize:14, color:"#64748b"}}>
                {unansweredCount>0 ? <span style={{color:"#b45309",fontWeight:800}}>⚠️ {unansweredCount} question{unansweredCount>1?"s":""} remaining</span> : <span style={{color:"#16a34a",fontWeight:800}}>✓ All 25 answered! You can submit.</span>}
              </div>
              <button disabled={tmActiveQIdx===24} onClick={() => setPmActiveQIdx(p=>Math.min(24,p+1))} style={{padding:"12px 28px", borderRadius:8, fontSize:14, fontWeight:700, background:tmActiveQIdx===24?"#f1f5f9":"#ffffff", color:tmActiveQIdx===24?"#94a3b8":"#334155", border:"1.5px solid #cbd5e1", cursor:tmActiveQIdx===24?"not-allowed":"pointer"}}>Next Question →</button>
            </div>
          </div>

          {/* Right: Navigator Sidebar */}
          <div style={{background:"#ffffff", borderLeft:"1.5px solid #e2e8f0", padding:"24px", display:"flex", flexDirection:"column", gap:20, overflowY:"auto", height:"100%"}}>
            <div style={{textAlign:"center", paddingBottom:16, borderBottom:"1.5px solid #f1f5f9"}}>
              <div style={{width:60, height:60, borderRadius:"50%", background:"#ffedd5", color:"#ea580c", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, margin:"0 auto 10px"}}>{fullName.charAt(0)}</div>
              <h3 style={{fontSize:15, fontWeight:700, color:"#1e293b", margin:0}}>{fullName}</h3>
              <span style={{fontSize:12, color:"#64748b", fontWeight:500}}>HRMS ID: {employeeId}</span>
            </div>
            <h4 style={{fontSize:12, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.6px", margin:0}}>Question Palette</h4>
            <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, maxHeight:220, overflowY:"auto", paddingRight:4}}>
              {testQuestions.map((q, idx) => {
                const isCurrent = idx===tmActiveQIdx;
                const isAnswered = tmTestResponses[idx]!==null && tmTestResponses[idx]!==undefined;
                let bg="#ffffff", border="1.5px solid #cbd5e1", color="#475569", fw="600";
                if (isCurrent) { bg="#ffedd5"; border="2px solid #ea580c"; color="#c2410c"; fw="800"; }
                else if (isAnswered) { bg="#dcfce7"; border="1.5px solid #86efac"; color="#15803d"; }
                else { bg="#fef3c7"; border="1.5px solid #fde047"; color="#a16207"; }
                return <button key={q.id} onClick={()=>setPmActiveQIdx(idx)} style={{height:40, borderRadius:8, fontSize:13, fontWeight:fw, background:bg, border, color, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}>{q.id}</button>;
              })}
            </div>
            <div style={{borderTop:"1.5px solid #f1f5f9", paddingTop:16, fontSize:12, color:"#64748b", display:"flex", flexDirection:"column", gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{width:16,height:16,background:"#dcfce7",border:"1.5px solid #86efac",borderRadius:4}}/><span>Attempted</span></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{width:16,height:16,background:"#fef3c7",border:"1.5px solid #fde047",borderRadius:4}}/><span style={{color:"#a16207",fontWeight:600}}>Unattempted</span></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{width:16,height:16,background:"#ffedd5",border:"2px solid #ea580c",borderRadius:4}}/><span>Current Focus</span></div>
            </div>
            <div style={{marginTop:"auto", paddingTop:20, borderTop:"1.5px solid #f1f5f9"}}>
              <button
                disabled={unansweredCount>0}
                onClick={handleSubmitTestAttempt}
                style={{width:"100%", padding:"14px 16px", borderRadius:10, fontSize:14.5, fontWeight:800, background:unansweredCount>0?"#cbd5e1":"#16a34a", color:unansweredCount>0?"#94a3b8":"#ffffff", border:"none", cursor:unansweredCount>0?"not-allowed":"pointer", boxShadow:unansweredCount>0?"none":"0 4px 12px rgba(22,163,74,0.3)"}}
              >
                Submit Examination
              </button>
              {unansweredCount>0 && <p style={{fontSize:11, color:"#b45309", margin:"8px 0 0", textAlign:"center", fontWeight:600}}>* All 25 questions must be answered before submission ({unansweredCount} remaining)</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════
     RENDER: TEST HISTORY (legacy — kept for internal dispatch)
  ═══════════════════════════════════════ */
  const renderHistoryPage = () => {
    // Top summary statistics calculated reactively:
    const totalAssessments = history.length;
    const latestScore = history.length ? history[0].totalScore : null;
    const averageScore = history.length
      ? Math.round(history.reduce((s, i) => s + i.totalScore, 0) / history.length)
      : 0;
    const latestCategory = latestScore !== null ? getCategory(latestScore) : "—";

    // Paginated history list
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
    const currentPage = Math.min(historyPage, totalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

    return (
      <section className="pm-page-card animate-fade-in">
        <div className="pm-page-header">
          <h2>Periodic Evaluation Archive</h2>
        </div>
        <p className="pm-subtitle">Historical ledger of standard Train Manager CBT safety competency trials.</p>

        {/* 4 Premium High-Fidelity Analytics Cards (Traffic Inspector Alignment) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div className="sdom-summary-card" style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ background: "#eff6ff", color: "#2563eb", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" }}>Total Assessments</div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>{totalAssessments} Attempts</div>
            </div>
          </div>

          <div className="sdom-summary-card" style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ background: "#f0fdf4", color: "#16a34a", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" }}>Latest Score</div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>{latestScore !== null ? `${latestScore}/100` : "—"}</div>
            </div>
          </div>

          <div className="sdom-summary-card" style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ background: "#fff7ed", color: "#ea580c", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" }}>Average Score</div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>{averageScore}/100</div>
            </div>
          </div>

          <div className="sdom-summary-card" style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ background: getCategoryBg(latestCategory), color: getCategoryColor(latestCategory), width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" }}>Latest Category</div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: getCategoryColor(latestCategory), marginTop: "2px" }}>
                {latestCategory !== "—" ? `Cat. ${latestCategory}` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Sort Panel */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "20px", padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 12px", width: "320px" }}>
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Search by period (e.g. April 2026)"
              value={historyDateSearch}
              onChange={e => { setHistoryDateSearch(e.target.value); setHistoryPage(1); }}
              style={{ border: "none", outline: "none", fontSize: "13px", width: "100%", color: "#334155" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 12px" }}>
            <ArrowUpDown size={14} color="#64748b" />
            <select 
              value={historySortOrder} 
              onChange={e => { setHistorySortOrder(e.target.value); setHistoryPage(1); }}
              style={{ border: "none", outline: "none", fontSize: "13px", color: "#334155", fontWeight: "600", cursor: "pointer" }}
            >
              <option value="date-desc">Newest Attempt First</option>
              <option value="date-asc">Oldest Attempt First</option>
              <option value="score-desc">Highest Score First</option>
              <option value="score-asc">Lowest Score First</option>
            </select>
          </div>
        </div>

        {/* Search empty state */}
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", background: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
            <Search size={36} color="#94a3b8" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#475569", margin: "0 0 6px" }}>No attempts found</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Try clearing your search query or sorting filters.</p>
          </div>
        ) : (
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                  <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: "700", color: "#475569" }}>Attempt No.</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: "700", color: "#475569" }}>Period</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: "700", color: "#475569" }}>Assessment Date</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: "700", color: "#475569" }}>Score</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: "700", color: "#475569" }}>Category</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: "700", color: "#475569" }}>Assessed By</th>
                  <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: "700", color: "#475569" }}>Status</th>
                  <th style={{ padding: "14px 18px", textAlign: "right", fontWeight: "700", color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((record, index) => {
                  const absoluteIdx = filteredHistory.length - (startIndex + index);
                  const cat = getCategory(record.totalScore);
                  return (
                    <tr key={record.id} className="sdom-table-row-hover" style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s ease" }}>
                      <td style={{ padding: "14px 18px", fontWeight: "700", color: "#1e3a8a" }}>#{absoluteIdx}</td>
                      <td style={{ padding: "14px 18px", fontWeight: "600", color: "#334155" }}>{record.assessmentPeriod}</td>
                      <td style={{ padding: "14px 18px", color: "#64748b" }}>{record.date}</td>
                      <td style={{ padding: "14px 18px", fontWeight: "800", color: "#0f172a" }}>{record.totalScore} / 100</td>
                      <td style={{ padding: "14px 18px" }}>
                        <span 
                          style={{ 
                            background: getCategoryBg(cat), 
                            color: getCategoryColor(cat), 
                            fontWeight: "800", 
                            fontSize: "12px", 
                            padding: "4px 10px", 
                            borderRadius: "6px",
                            textTransform: "uppercase" 
                          }}
                        >
                          Cat. {cat}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", color: "#334155", fontWeight: "500" }}>TI_1001 (Traffic Inspector)</td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ background: "#dcfce7", color: "#15803d", fontWeight: "700", fontSize: "11px", padding: "4px 8px", borderRadius: "20px" }}>
                          Approved
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <button 
                          onClick={() => openScorecard(record)}
                          style={{ 
                            background: "#eff6ff", 
                            color: "#2563eb", 
                            border: "none", 
                            fontWeight: "700", 
                            padding: "6px 14px", 
                            borderRadius: "6px", 
                            cursor: "pointer", 
                            fontSize: "12.5px",
                            transition: "all 0.15s ease" 
                          }}
                        >
                          View Form
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing <b>{startIndex + 1}</b> to <b>{Math.min(startIndex + itemsPerPage, filteredHistory.length)}</b> of <b>{filteredHistory.length}</b> attempts
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff", color: currentPage === 1 ? "#94a3b8" : "#334155", fontWeight: "600", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "12.5px" }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                    style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff", color: currentPage === totalPages ? "#94a3b8" : "#334155", fontWeight: "600", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "12.5px" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  /* ═══════════════════════════════════════
     RENDER: SCORECARD & QUESTION REVIEW
  ═══════════════════════════════════════ */
  const renderScorecardPage = () => {
    if (!selectedRecord) return (
      <section className="pm-page-card">
        <p className="pm-empty-state">Select a record from History to review.</p>
      </section>
    );

    const cat = getCategory(selectedRecord.totalScore);

    return (
      <div className="ti2-card animate-fade-in" style={{ padding: "24px", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
        <div className="ti2-card-hdr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "20px" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}><ShieldCheck size={22} color="#16a34a"/> Detailed Evaluation Scorecard</h2>
          <button className="ti2-primary-btn" onClick={() => setScreenMode("default")}>← Return to History</button>
        </div>

        <div className="pm-scorecard-hero" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
          <div className="pm-sc-score-circle" style={{ width: "90px", height: "90px", borderRadius: "50%", border: `6px solid ${getCategoryColor(cat)}`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flexShrink: 0, background: "#fff" }}>
            <strong style={{ fontSize: "24px", color: getCategoryColor(cat), fontWeight: "800" }}>{selectedRecord.totalScore}</strong>
            <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", marginTop: "-2px" }}>/100</span>
          </div>
          <div>
            <span className="pm-cat-badge-lg" style={{ background: getCategoryBg(cat), color: getCategoryColor(cat), display: "inline-block", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
              Final Category: Category {cat}
            </span>
            <p className="pm-sc-period" style={{ margin: "2px 0", fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>{selectedRecord.assessmentPeriod} - Self-Compliance Audit</p>
            <p className="pm-sc-date" style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Attempt Completed: {selectedRecord.date} &nbsp;·&nbsp; Assessed By: TI_1001 (Traffic Inspector)</p>
          </div>
        </div>

        {/* Dynamic Performance Summary */}
        <div className="pm-performance-summary-box" style={{ background: "#eff6ff", borderLeft: "4px solid #2563eb", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
          <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "6px" }}>📊 Official Performance Evaluation Summary</h4>
          <p style={{ margin: 0, fontSize: "13px", color: "#1e3a8a", lineHeight: "1.5" }}>{performanceSummaryText}</p>
        </div>

        {/* Competency Module Breakdown */}
        <div className="pm-sc-sections" style={{ marginBottom: "30px" }}>
          <h3 style={{ fontSize: "15px", color: "#0f172a", marginBottom: "16px", fontWeight: "700" }}>Safety Domain Competency Breakdown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {selectedRecord.sections.map(s => {
              const spc = Math.round((s.marks / s.outOf) * 100);
              const barColor = getCategoryColor(getCategory(spc));
              return (
                <div key={s.title} className="pm-sc-section-row" style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px" }}>
                  <span className="pm-sc-section-name" style={{ width: "260px", fontWeight: "600", color: "#334155" }}>{s.title}</span>
                  <div className="pm-sc-bar-wrap" style={{ flexGrow: 1, height: "8px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                    <div className="pm-sc-bar-fill" style={{ width: `${spc}%`, height: "100%", background: barColor, borderRadius: "999px" }} />
                  </div>
                  <span className="pm-sc-section-marks" style={{ width: "60px", textAlign: "right", fontWeight: "700", color: "#0f172a" }}>{s.marks}/{s.outOf}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complete MCQ Question Review */}
        <div className="pm-mcq-review-panel" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
          <div className="pm-chart-header" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={16} color="#475569"/>
            <h3 style={{ margin: 0, fontSize: "15px", color: "#0f172a", fontWeight: "700" }}>Complete Assessment Question Review</h3>
          </div>
          <p className="pm-subtitle" style={{ fontSize: "12px", color: "#64748b", marginTop: "-10px", marginBottom: "20px" }}>
            Below is the detailed response evaluation for all 25 compulsory questions. Correct responses are highlighted in green; incorrect choices are highlighted in red.
          </p>

          <div className="pm-review-questions-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {testQuestions.map((q, qIndex) => {
              const selectedOpt = selectedRecord.responses ? selectedRecord.responses[qIndex] : null;
              const isCorrect = selectedOpt === q.answer;

              return (
                <div key={qIndex} className={`pm-review-question-card ${isCorrect ? "correct-card" : "wrong-card"}`}>
                  <div className="pm-rq-header">
                    <span className="pm-rq-number">Question {qIndex + 1}</span>
                    {isCorrect ? (
                      <span className="pm-rq-badge success">Correct (+4 Marks)</span>
                    ) : (
                      <span className="pm-rq-badge danger">Incorrect (0 Marks)</span>
                    )}
                  </div>
                  <h4 className="pm-rq-text">{q.text}</h4>

                  <div className="pm-rq-options-grid">
                    {q.options.map((opt, oIdx) => {
                      const wasSelected = selectedOpt === oIdx;
                      const isOptCorrect = q.answer === oIdx;
                      
                      let optClass = "";
                      if (wasSelected) {
                        optClass = isCorrect ? "opt-selected-correct" : "opt-selected-wrong";
                      } else if (isOptCorrect) {
                        optClass = "opt-correct-unselected";
                      }

                      return (
                        <div key={oIdx} className={`pm-rq-option-item ${optClass}`}>
                          <span className="font-mono opt-prefix">{["A", "B", "C", "D"][oIdx]}</span>
                          <span className="opt-label-text">{opt}</span>
                          {wasSelected && (
                            <span className="opt-user-tag">{isCorrect ? "✓ Selected" : "✗ Selected"}</span>
                          )}
                          {!wasSelected && isOptCorrect && (
                            <span className="opt-correct-tag">✓ Correct Key</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Operational Safety Explanation */}
                  {q.explanation && (
                    <div style={{ marginTop: "16px", background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", borderLeft: "4px solid #f97316", fontSize: "12.5px", color: "#334155" }}>
                      <strong style={{ color: "#c2410c" }}>💡 Operational Safety Explanation: </strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════
     RENDER: CURRENT TEST (SCHEDULED)
  ═══════════════════════════════════════ */
  const renderCurrentTestsPage = () => {
    const isTestActivated = localStorage.getItem("tm_test_activated_" + employeeId) === "true";
    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Assigned Competency Trials</h2>
        </div>
        <p className="pm-subtitle">Mandatory periodically scheduled evaluation of SWR Rules and points automatic block operations safety clearance.</p>

        <div className="pm-current-tests">
          {!isTestActivated ? (
            <div className="pm-no-test-banner" style={{ background: "#f8fafc", border: "2px dashed #cbd5e1" }}>
              <Lock size={40} color="#64748b" />
              <h3>Competency Exam Locked</h3>
              <p>Your periodic evaluation has not been activated by the Traffic Inspector yet. Please request your Traffic Inspector to activate your test so you can attempt it.</p>
            </div>
          ) : !currentTest ? (
            <div className="pm-no-test-banner">
              <CheckCircle2 size={40} color="#16a34a" />
              <h3>All caught up!</h3>
              <p>Your periodic evaluation for April 2026 is fully completed. Grade successfully filed to Station Supervisor records.</p>
              
              <button 
                onClick={handleReattempt}
                className="pm-start-btn" 
                style={{ 
                  marginTop: "18px", 
                  background: "#f97316", 
                  border: "none",
                  fontWeight: "800",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)"
                }}
              >
                Reappear for CBT Exam (Dev Mode)
              </button>
            </div>
          ) : (
            <article className="pm-test-card-premium">
              <div className="pm-tc-header">
                <ClipboardList size={22} color="#f97316" />
                <div>
                  <h3>{currentTest.name}</h3>
                  <p>Scheduled Period: <strong>{currentTest.period}</strong></p>
                </div>
              </div>
              <div className="pm-tc-meta-row">
                <span className="pm-mini-pill">📝 25 Compulsory Questions</span>
                <span className="pm-mini-pill">⏱ Unlimited Time (No timer)</span>
                <span className="pm-mini-pill">🎯 MCQ Single Key Option</span>
                <span className="pm-mini-pill">⚠️ Answering All Required to Submit</span>
              </div>
              <div className="pm-tc-sections-preview">
                {["Signal Rules", "Track Handling", "Communication", "Safety Response", "Operational Judgement"].map(s => (
                  <span key={s} className="pm-tc-section-chip">{s}</span>
                ))}
              </div>
              <button className="pm-start-btn" onClick={startTest} style={{ background: "#f97316", border: "none" }}>
                <PlayCircle size={18} /> Initialize Assessment Command
              </button>
            </article>
          )}
        </div>
      </section>
    );
  };

  /* ═══════════════════════════════════════
     RENDER: TEST ATTEMPT (WITH TIMER)
  ═══════════════════════════════════════ */
  const renderAttemptPage = () => {
    if (!activeTest) return renderCurrentTestsPage();
    const question = testQuestions[currentQuestion];
    const unansweredCount = 25 - answeredCount;

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        background: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif"
      }}>
        {/* Header Bar: TCS iON Style with Safety Orange Accent */}
        <header style={{
          background: "#1e293b",
          color: "#ffffff",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          height: "70px",
          flexShrink: 0
        }}>
          <div style={{display: "flex", alignItems: "center", gap: 12}}>
            <ShieldCheck size={28} color="#f97316"/>
            <div>
              <h1 style={{fontSize: 18, fontWeight: 800, margin: 0, color: "#ffffff", letterSpacing: "0.5px"}}>
                TRAIN MANAGER CBT COMPETENCY EVALUATION
              </h1>
              <p style={{margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 500}}>
                Official Railway Safety &amp; Operational Assessment
              </p>
            </div>
          </div>
          
          <div style={{display: "flex", alignItems: "center", gap: 16}}>
            <div style={{
              background: "#334155",
              padding: "6px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "#cbd5e1",
              border: "1px solid #475569"
            }}>
              ⚙️ STATUS: <span style={{color: "#f97316"}}>Active Exam Session</span>
            </div>
            
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to abort the exam? Your progress will not be saved.")) {
                  setActiveTest(null);
                  setScreenMode("default");
                  logActivity("Assessment", "Periodic assessment aborted by user.");
                }
              }} 
              style={{
                padding: "8px 18px", 
                borderRadius: 8, 
                fontSize: 13, 
                background: "#ef4444", 
                color: "#ffffff", 
                border: "none", 
                fontWeight: 700, 
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
                transition: "all 0.2s ease"
              }}
            >
              Exit Exam
            </button>
          </div>
        </header>

        {/* Candidate & Progress Strip */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff",
          borderBottom: "1.5px solid #e2e8f0",
          padding: "12px 24px",
          height: "50px",
          flexShrink: 0,
          fontSize: 13.5,
          color: "#334155"
        }}>
          <div>
            Candidate Name: <strong style={{color: "#1e3a8a"}}>{fullName}</strong> &nbsp;|&nbsp; HRMS ID: <strong style={{color: "#1e3a8a"}}>{employeeId}</strong> &nbsp;|&nbsp; Station: <strong>{trainManagerProfile.stationName}</strong>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 12}}>
            <span style={{fontWeight: 600}}>Progress: <strong style={{color: "#f97316"}}>{answeredCount} / 25 Answered</strong> ({completionRate}%)</span>
            <div style={{width: 140, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden"}}>
              <div style={{width: `${completionRate}%`, height: "100%", background: "#f97316", borderRadius: 4}}/>
            </div>
          </div>
        </div>

        {/* Main Split Body */}
        <div style={{
          display: "grid", 
          gridTemplateColumns: "1fr 340px", 
          flex: 1, 
          overflow: "hidden"
        }}>
          {/* Left Column: Spacious Question Pane */}
          <div style={{
            padding: "32px 40px", 
            display: "flex", 
            flexDirection: "column", 
            background: "#f8fafc",
            overflowY: "auto",
            height: "100%"
          }}>
            {/* Immersive Question Card (Glassmorphism & Clean drop shadow) */}
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 36,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              marginBottom: 24
            }}>
              <div>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: "#f97316",
                  background: "#fff7ed",
                  padding: "6px 14px",
                  borderRadius: 20,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px"
                }}>
                  Compulsory Question {currentQuestion + 1} of 25
                </span>
                
                <h2 style={{
                  fontSize: 22, 
                  fontWeight: 700, 
                  color: "#0f172a", 
                  marginTop: 24, 
                  marginBottom: 28, 
                  lineHeight: 1.5
                }}>
                  {question.text}
                </h2>

                <div style={{display: "flex", flexDirection: "column", gap: 14}}>
                  {question.options.map((opt, oi) => {
                    const isSelected = responses[currentQuestion] === oi;
                    return (
                      <label key={oi} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "18px 24px",
                        border: isSelected ? "2.5px solid #f97316" : "1.5px solid #e2e8f0",
                        borderRadius: 12,
                        background: isSelected ? "#fff7ed" : "#ffffff",
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 4px 6px rgba(249, 115, 22, 0.08)" : "none",
                        transition: "all 0.15s ease"
                      }} className="pm-option-hover">
                        <input
                          type="radio"
                          name={`tm-q-${question.id}`}
                          checked={isSelected}
                          onChange={() => handleSelectOption(oi)}
                          style={{width: 20, height: 20, accentColor: "#f97316"}}
                        />
                        <span style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: isSelected ? "#c2410c" : "#64748b",
                          width: 24
                        }}>{["A", "B", "C", "D"][oi]}</span>
                        <span style={{
                          fontSize: 15, 
                          color: "#1e293b", 
                          fontWeight: isSelected ? 700 : 500
                        }}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Immersive Control Footer Bar */}
            <div style={{
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "16px 24px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <button
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
                style={{
                  padding: "12px 28px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  background: currentQuestion === 0 ? "#f1f5f9" : "#ffffff",
                  color: currentQuestion === 0 ? "#94a3b8" : "#334155",
                  border: "1.5px solid #cbd5e1",
                  cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                ← Previous Question
              </button>

              <div style={{fontSize: 14, color: "#64748b"}}>
                {unansweredCount > 0 ? (
                  <span style={{color: "#b45309", fontWeight: 800, display: "flex", alignItems: "center", gap: 6}}>
                    ⚠️ {unansweredCount} question{unansweredCount > 1 ? "s" : ""} remaining to unlock submission
                  </span>
                ) : (
                  <span style={{color: "#16a34a", fontWeight: 800, display: "flex", alignItems: "center", gap: 6}}>
                    ✓ All 25 questions attempted! You can now submit.
                  </span>
                )}
              </div>

              <button
                disabled={currentQuestion === 24}
                onClick={() => setCurrentQuestion(p => Math.min(24, p + 1))}
                style={{
                  padding: "12px 28px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  background: currentQuestion === 24 ? "#f1f5f9" : "#ffffff",
                  color: currentQuestion === 24 ? "#94a3b8" : "#334155",
                  border: "1.5px solid #cbd5e1",
                  cursor: currentQuestion === 24 ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                Next Question →
              </button>
            </div>
          </div>

          {/* Right Column: Navigator Sidebar */}
          <div style={{
            background: "#ffffff",
            borderLeft: "1.5px solid #e2e8f0",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            overflowY: "auto",
            height: "100%"
          }}>
            <div style={{textAlign: "center", paddingBottom: 16, borderBottom: "1.5px solid #f1f5f9"}}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#ffedd5",
                color: "#f97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                margin: "0 auto 10px"
              }}>
                {fullName.charAt(0)}
              </div>
              <h3 style={{fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0}}>{fullName}</h3>
              <span style={{fontSize: 12, color: "#64748b", fontWeight: 500}}>HRMS ID: {employeeId}</span>
            </div>

            <h4 style={{
              fontSize: 12, 
              fontWeight: 800, 
              color: "#475569", 
              textTransform: "uppercase", 
              letterSpacing: "0.6px", 
              margin: 0
            }}>
              Question Palette
            </h4>

            {/* Grid of questions */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8,
              maxHeight: 220,
              overflowY: "auto",
              paddingRight: 4
            }}>
              {testQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestion;
                const isAnswered = responses[idx] !== null && responses[idx] !== undefined;
                
                let btnBg = "#ffffff";
                let btnBorder = "1.5px solid #cbd5e1";
                let btnColor = "#475569";
                let fontWeight = "600";

                if (isCurrent) {
                  btnBg = "#ffedd5";
                  btnBorder = "2px solid #f97316";
                  btnColor = "#c2410c";
                  fontWeight = "800";
                } else if (isAnswered) {
                  btnBg = "#dcfce7";
                  btnBorder = "1.5px solid #86efac";
                  btnColor = "#15803d";
                } else {
                  btnBg = "#fef3c7";
                  btnBorder = "1.5px solid #fde047";
                  btnColor = "#a16207";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    style={{
                      height: 40,
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: fontWeight,
                      background: btnBg,
                      border: btnBorder,
                      color: btnColor,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.1s ease"
                    }}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>

            {/* Legend section */}
            <div style={{
              borderTop: "1.5px solid #f1f5f9",
              paddingTop: 16,
              fontSize: 12,
              color: "#64748b",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              <div style={{display: "flex", alignItems: "center", gap: 10}}>
                <span style={{width: 16, height: 16, background: "#dcfce7", border: "1.5px solid #86efac", borderRadius: 4}}/>
                <span style={{fontWeight: 500}}>Attempted</span>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: 10}}>
                <span style={{width: 16, height: 16, background: "#fef3c7", border: "1.5px solid #fde047", borderRadius: 4}}/>
                <span style={{fontWeight: 600, color: "#a16207"}}>Unattempted</span>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: 10}}>
                <span style={{width: 16, height: 16, background: "#ffedd5", border: "2px solid #f97316", borderRadius: 4}}/>
                <span style={{fontWeight: 500}}>Current Focus</span>
              </div>
            </div>

            {/* Submission Section at Bottom */}
            <div style={{
              marginTop: "auto", 
              paddingTop: 20, 
              borderTop: "1.5px solid #f1f5f9"
            }}>
              <button
                disabled={unansweredCount > 0}
                onClick={() => submitTest(false)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 10,
                  fontSize: 14.5,
                  fontWeight: 800,
                  background: unansweredCount > 0 ? "#cbd5e1" : "#16a34a",
                  color: unansweredCount > 0 ? "#94a3b8" : "#ffffff",
                  border: "none",
                  cursor: unansweredCount > 0 ? "not-allowed" : "pointer",
                  boxShadow: unansweredCount > 0 ? "none" : "0 4px 12px rgba(22, 163, 74, 0.3)",
                  transition: "all 0.2s ease"
                }}
              >
                Submit Examination
              </button>
              {unansweredCount > 0 && (
                <p style={{
                  fontSize: 11,
                  color: "#b45309",
                  margin: "8px 0 0",
                  textAlign: "center",
                  fontWeight: 600,
                  lineHeight: 1.4
                }}>
                  * All 25 questions must be answered before submission ({unansweredCount} remaining)
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════
     RENDER: SAFETY & EMERGENCY MODULE
  ═══════════════════════════════════════ */
  const renderSafetyPage = () => (
    <section className="pm-page-card">
      <div className="pm-page-header">
        <h2>Safety Broadcast & Incident Reports</h2>
        <button className="pm-emergency-trigger-btn animate-pulse" onClick={openEmergencyDialog}>
          🚨 TRIGGER SYSTEM EMERGENCY ALERT
        </button>
      </div>
      <p className="pm-subtitle font-semibold">Immediate access to railway safety logs, abnormal track defect forms, and division-wide broadcasts.</p>

      {/* Safety Sub-Tabs */}
      <div className="pm-subnav-tabs" style={{ marginBottom: "16px" }}>
        <button 
          className={`pm-subtab-btn ${safetySubTab === "track" ? "active" : ""}`}
          onClick={() => setSafetySubTab("track")}
        >
          <AlertTriangle size={16} /> Report Track Defect
        </button>
        <button 
          className={`pm-subtab-btn ${safetySubTab === "incident" ? "active" : ""}`}
          onClick={() => setSafetySubTab("incident")}
        >
          <FileText size={16} /> Log Abnormal Incident
        </button>
        <button 
          className={`pm-subtab-btn ${safetySubTab === "history" ? "active" : ""}`}
          onClick={() => setSafetySubTab("history")}
        >
          <ShieldCheck size={16} /> View Filed Safety Tickets ({safetyReports.length})
        </button>
      </div>

      {safetySubTab === "track" && (
        <form onSubmit={submitTrackIssue} className="pm-safety-form">
          <div className="pm-safety-form-grid">
            <div className="pm-form-field">
              <label>Siding / Station Line Location</label>
              <select value={trackLine} onChange={e => setTrackLine(e.target.value)}>
                <option value="Line 1 Main">Line 1 Main</option>
                <option value="Line 2 Loop">Line 2 Loop</option>
                <option value="Siding Line A">Siding Line A</option>
                <option value="Marshalling Yard Point 14">Marshalling Yard Point 14</option>
                <option value="Cross-over 11A">Cross-over 11A</option>
              </select>
            </div>
            <div className="pm-form-field">
              <label>KM Mark Location (e.g. 102/4)</label>
              <input 
                type="text" 
                placeholder="Enter KM Mark" 
                value={trackLocation} 
                onChange={e => setTrackLocation(e.target.value)} 
                required 
              />
            </div>
            <div className="pm-form-field">
              <label>Track Defect Class</label>
              <select value={trackDefect} onChange={e => setTrackDefect(e.target.value)}>
                <option value="Rail Fracture">Rail Joint Crack / Fracture</option>
                <option value="Points Jammed">Siding Point Jam / Failure</option>
                <option value="Track Obstruction">Obstruction on Siding (Fouling)</option>
                <option value="Ballast Washout">Ballast Washout / Sinkage</option>
                <option value="Vegetation Overgrowth">High Vegetation Blockage</option>
              </select>
            </div>
            <div className="pm-form-field">
              <label>Severity Category</label>
              <select value={trackSeverity} onChange={e => setTrackSeverity(e.target.value)}>
                <option value="High - Urgent Action">High - Urgent (Suspend Movements)</option>
                <option value="Medium - Caution Advised">Medium - Caution (15 km/h restriction)</option>
                <option value="Low - Monitor Area">Low - Watchful (Monitor daily)</option>
              </select>
            </div>
            <div className="pm-form-field pm-field-wide">
              <label>Defect Observations & Technical Details</label>
              <textarea 
                rows="4" 
                placeholder="Explain the visual findings, track alignment defects, or points feedback failures in detail..."
                value={trackDesc}
                onChange={e => setTrackDesc(e.target.value)}
                required
              />
            </div>
            
            {/* File Attachment Upload Mock */}
            <div className="pm-form-field pm-field-wide pm-upload-area">
              <label><Paperclip size={14} /> Upload Details (Photos, Track Reports, Audio Logs)</label>
              <div className="pm-file-selector-box">
                <input 
                  key={fileInputKey}
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  className="pm-hidden-file-input" 
                  id="safety-evidence-files" 
                />
                <label htmlFor="safety-evidence-files" className="pm-file-upload-label">
                  <Plus size={18} /> Click to Choose Files to Upload
                </label>
              </div>

              {attachedFiles.length > 0 && (
                <div className="pm-attached-files-list">
                  <h5>Evidence Files Queued ({attachedFiles.length}):</h5>
                  <ul>
                    {attachedFiles.map((file, fIdx) => (
                      <li key={fIdx}>
                        <span>📎 {file.name} ({file.size})</span>
                        <button type="button" onClick={() => removeAttachedFile(fIdx)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="pm-safety-submit-btn">
            Log Track defect safety ticket
          </button>
        </form>
      )}

      {safetySubTab === "incident" && (
        <form onSubmit={submitIncidentReport} className="pm-safety-form">
          <div className="pm-safety-form-grid">
            <div className="pm-form-field">
              <label>Abnormal incident Type</label>
              <select value={incidentType} onChange={e => setIncidentType(e.target.value)}>
                <option value="Hot Axle">Hot Axle / Sparks on Wheel</option>
                <option value="Flat Tyre">Flat Tyre / Heavy Impact Thuds</option>
                <option value="Brake Binding">Brake Binding (Heavy Smoke)</option>
                <option value="Hanging Parts">Hanging Coupling / Gear Parts</option>
                <option value="SPAD Incident">SPAD (Signal Passed at Danger)</option>
                <option value="Open Siding Gate">Unlocked Siding Gate during transit</option>
              </select>
            </div>
            <div className="pm-form-field">
              <label>Train Number & Name (e.g. 12289 Duronto)</label>
              <input 
                type="text" 
                placeholder="Enter Train Details" 
                value={incidentTrain} 
                onChange={e => setIncidentTrain(e.target.value)} 
                required 
              />
            </div>
            <div className="pm-form-field">
              <label>Time of Observation</label>
              <input 
                type="datetime-local" 
                value={incidentTime} 
                onChange={e => setIncidentTime(e.target.value)} 
              />
            </div>
            <div className="pm-form-field">
              <label>Immediate Safety Actions Taken</label>
              <input 
                type="text" 
                placeholder="e.g. Flagged Red, informed SM on Walkie-Talkie" 
                value={incidentAction} 
                onChange={e => setIncidentAction(e.target.value)} 
                required
              />
            </div>
            <div className="pm-form-field pm-field-wide">
              <label>Incident Details & Hand-Signal Remarks</label>
              <textarea 
                rows="4" 
                placeholder="Describe the train movement, automatic block operations speeds, visual smoke, wheel fire, or hand signal exchanges..."
                value={trackDesc}
                onChange={e => setTrackDesc(e.target.value)}
              />
            </div>
            
            {/* File Upload Incident Details */}
            <div className="pm-form-field pm-field-wide pm-upload-area">
              <label><Paperclip size={14} /> Upload Incident Photos / Logs</label>
              <div className="pm-file-selector-box">
                <input 
                  key={fileInputKey}
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  className="pm-hidden-file-input" 
                  id="incident-evidence-files" 
                />
                <label htmlFor="incident-evidence-files" className="pm-file-upload-label">
                  <Plus size={18} /> Choose Evidence Logs
                </label>
              </div>

              {attachedFiles.length > 0 && (
                <div className="pm-attached-files-list">
                  <h5>Attached Evidence Logs ({attachedFiles.length}):</h5>
                  <ul>
                    {attachedFiles.map((file, fIdx) => (
                      <li key={fIdx}>
                        <span>📎 {file.name} ({file.size})</span>
                        <button type="button" onClick={() => removeAttachedFile(fIdx)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="pm-safety-submit-btn warning">
            File Critical Incident Report
          </button>
        </form>
      )}

      {safetySubTab === "history" && (
        <div className="pm-safety-records-list">
          <h3 style={{ fontSize: "16px", color: "#0e2e4f", marginBottom: "14px" }}>Submitted Safety Reports Ledger</h3>
          <div className="pm-safety-ledger-grid">
            {safetyReports.map(report => (
              <article key={report.id} className="pm-safety-ticket-card">
                <div className="pm-ticket-header">
                  <span className={`pm-ticket-type-badge ${report.type === "Track Defect" ? "defect" : "incident"}`}>
                    {report.type}
                  </span>
                  <span className="pm-ticket-date font-mono">{report.date}</span>
                </div>
                <h4>{report.defect}</h4>
                <div className="pm-ticket-details">
                  <div><strong>Loc:</strong> {report.location}</div>
                  <div><strong>Severity:</strong> <span className="text-danger-bold">{report.severity}</span></div>
                </div>
                <p className="pm-ticket-desc">{report.desc}</p>
                {report.attachments && report.attachments.length > 0 && (
                  <div className="pm-ticket-attachments">
                    <strong>Attachments ({report.attachments.length}):</strong>
                    <ul>
                      {report.attachments.map((at, idx) => <li key={idx} className="font-mono text-small">📎 {at.name} ({at.size})</li>)}
                    </ul>
                  </div>
                )}
                <div className="pm-ticket-footer">
                  <span>Ticket #{report.id}</span>
                  <span className={`pm-ticket-status ${report.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {report.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );

  /* ─── Content dispatcher ─── */
  const renderBodyContent = () => {
    if (screenMode === "takeTest") return renderTakeTest();
    if (activeNav === "dashboard") return renderDashboardPage();
    if (activeNav === "profile") return renderProfilePage();
    if (activeNav === "myAssessment") return renderMyAssessment();
    if (activeNav === "safety") return renderSafetyPage();
    return renderDashboardPage();
  };

  /* ═══════════════════════════════════════
     SHELL LAYOUT
  ═══════════════════════════════════════ */
  return (
    <div className={`pm-layout ${emergencyActive ? "emergency-glow-active" : ""}`}>
      <input type="checkbox" id="sdom-sidebar-toggle" className="sdom-sidebar-checkbox" style={{ display: "none" }} />
      
      {/* ── Flashing Emergency Alert Banner ── */}
      {emergencyActive && (
        <div className="pm-emergency-siren-banner">
          <div className="siren-message">
            <span className="siren-light animate-flash">🚨 ALERT</span>
            <strong>MANDATORY EMERGENCY BROADCAST ACTIVE: {emergencyType} detected at {emergencyLocation}! All train & siding movements are frozen immediately.</strong>
          </div>
          <div className="siren-controls">
            <button className="pm-siren-mute-btn" onClick={toggleAlarmMute}>
              {alarmMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              {alarmMuted ? "Unmute Alarm" : "Mute Sound"}
            </button>
            <button className="pm-siren-clear-btn" onClick={clearEmergencyState}>
              Clear & Safe Return
            </button>
          </div>
        </div>
      )}

      <header className="pm-topbar">
        <label htmlFor="sdom-sidebar-toggle" className="sdom-sidebar-toggle-btn"></label>
        <div className="pm-topbar-brand">
          <div className="pm-topbar-logo">IR</div>
          <div>
            <h1>Indian Railway Evaluation Command</h1>
            <p>Operations Workspace: Train Manager Module</p>
          </div>
        </div>



        <div className="pm-user-strip">
          {/* ── Real-Time Notifications Bell Dropdown ── */}
          <div className="pm-notification-bell-container">
            <button className="pm-bell-btn" onClick={() => setBellDropdownOpen(!bellDropdownOpen)}>
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="pm-bell-badge">{unreadNotificationsCount}</span>
              )}
            </button>

            {bellDropdownOpen && (
              <div className="pm-bell-dropdown">
                <div className="pm-bell-header">
                  <h4>Operations Notifications</h4>
                  {unreadNotificationsCount > 0 && (
                    <button onClick={markAllNotificationsRead}>Mark read</button>
                  )}
                </div>
                <div className="pm-bell-list">
                  {notifications.map(n => (
                    <div key={n.id} className={`pm-bell-item ${n.read ? 'read' : 'unread'} type-${n.type}`}>
                      <div className="pm-bell-item-dot"></div>
                      <div className="pm-bell-item-content">
                        <p>{n.message}</p>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="pm-bell-empty">No alerts received today.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pm-user-avatar">{fullName.charAt(0)}</div>
          <div>
            <strong>{fullName}</strong>
            <span>HRMS ID: {employeeId}</span>
          </div>
          <button className="pm-logout-btn" onClick={() => { stopAlarmSound(); onLogout(); }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <div className="pm-content-shell">
        <aside className="pm-sidebar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.key && screenMode === "default";
            return (
              <button
                key={item.key}
                className={`pm-nav-item ${isActive ? "active" : ""}`}
                onClick={() => { goToNavPage(item.key); setBellDropdownOpen(false); }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          

        </aside>

        <main className="pm-main-panel">
          <div className="pm-main-header-band">
            <div>
              <p className="pm-hero-eyebrow">Nagpur Junction Operations</p>
              <h2 className="pm-main-title">
                {screenMode === "scorecard" ? "Detailed Evaluation scorecard"
                  : screenMode === "attempt" ? "Competency Examination Attempt"
                  : navItems.find(i => i.key === activeNav)?.label || "Workspace"}
              </h2>
            </div>
            <div className="pm-header-kpis">
              <div className="pm-hkpi">
                <Award size={14} />
                <span>{history.length} Assessments</span>
              </div>
              <div className="pm-hkpi">
                <Gauge size={14} />
                <span>Avg {averageScore}</span>
              </div>
              <div className="pm-hkpi" style={{ color: getCategoryColor(latestCategory) }}>
                <ShieldCheck size={14} />
                <span>Cat. {latestCategory}</span>
              </div>
            </div>
          </div>

          {statusText && (
            <div className="pm-status-banner">
              <CheckCircle2 size={15} /> {statusText}
            </div>
          )}

          {renderBodyContent()}
        </main>
      </div>

      {/* ── EMERGENCY BROADCAST SETUP MODAL ── */}
      {emergencyModalOpen && (
        <div className="pm-emergency-modal-overlay">
          <div className="pm-emergency-modal">
            <div className="modal-header">
              <h2>🚨 CONFIRM URGENT DIVISION-WIDE BROADCAST</h2>
              <button onClick={() => setEmergencyModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="danger-notice">
                WARNING: Triggering this broadcast sends an audio warning signal and locks automatic block operations/movement panels on all active Station Master & Superintendent terminals! Use for genuine safety emergencies only.
              </p>
              <div className="modal-fields">
                <label>Emergency Category</label>
                <select value={emergencyType} onChange={e => setEmergencyType(e.target.value)}>
                  <option value="Obstruction on Track">Obstruction on Siding (Fouling Clearance)</option>
                  <option value="Derailment Danger">Visible Rail Crack / Splitting Point</option>
                  <option value="Signal Failure">Critical Signal Lock Failure</option>
                  <option value="Hot Axle Fire Spark">Hot Axle / Spark Smoke in Incoming train</option>
                  <option value="Other Danger">Other Major Track Danger</option>
                </select>
                
                <label>Vulnerable Location / Track</label>
                <input 
                  type="text" 
                  value={emergencyLocation} 
                  onChange={e => setEmergencyLocation(e.target.value)} 
                  placeholder="e.g. Line 2 Loop Siding, KM 102/4" 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEmergencyModalOpen(false)}>Cancel</button>
              <button className="confirm-btn" onClick={triggerEmergencyBroadcast}>
                CONFIRM & BROADCAST ALARM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainManagerModule;


