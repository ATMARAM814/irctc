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
  Plus,
  ArrowLeft,
  Users,
  Building2,
  UserPlus,
  Edit
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
  { key: "dashboard",      label: "Dashboard",      icon: Gauge },
  { key: "pointsmen",      label: "Pointsmen",      icon: Users },
  { key: "stationMasters", label: "Station Masters",icon: Building2 },
  { key: "myAssessment",   label: "My Assessment",  icon: FileBarChart2 },
  { key: "profile",        label: "My Profile",     icon: UserCircle2 }
];

/* ─── Static profile data with requested fields ─── */
const stationSuperintendentProfile = {
  name: "R. Kulkarni",
  hrmsId: "SS_1001",
  stationName: "Nagpur Junction (NGP)",
  designation: "Station Superintendent",
  mobileNumber: "+91 98220 55001",
  pmeStatus: "FIT (Periodic Medical Exam) - Due: 2029-05-14",
  refStatus: "COMPLETED (Refresher Course) - Due: 2027-04-12",
  trainingStatus: "ACTIVE (Safety & Supervision Certified)",
  currentCategory: "A",
  department: "Operations",
  reportingOfficer: "Traffic Inspector",
  joiningDate: "2012-03-10"
};

const stationTiMap = {
  "Parbhani Junction": "TI PAR",
  "Amla Junction": "TI AMLA",
  "Badnera Junction": "TI NGP",
  "Akola Junction": "TI PAR",
  "Nagpur Junction": "TI NGP",
  "Wardha Junction": "TI NGP",
  "Betul Station": "TI AMLA",
  "Itarsi Junction": "TI AMLA",
  "Chandrapur Station": "TI NGP",
  "Gondia Junction": "TI NGP",
  "Dhamangaon Station": "TI NGP",
  "Pulgaon Junction": "TI NGP"
};

const getCat = s => s >= 80 ? "A" : s >= 50 ? "B" : s >= 26 ? "C" : "D";

const getUserRisk = (u) => {
  return u.pmeStatus === "Overdue" || u.refStatus === "Expired" || u.score < 50 ? "High" : u.score >= 80 ? "Low" : "Medium";
};

const riskBadge = (r) => {
  const map = { Low: "sdom-badge-success", Medium: "sdom-badge-warning", High: "sdom-badge-danger" };
  return <span className={`sdom-badge ${map[r] || "sdom-badge-neutral"}`}>{r}</span>;
};

const catBadge = (c) => {
  const map = { A: "sdom-badge-success", B: "sdom-badge-info", C: "sdom-badge-warning", D: "sdom-badge-danger" };
  return <span className={`sdom-badge ${map[c] || "sdom-badge-neutral"}`}>{c}</span>;
};

const statusBadge = (s) => {
  const map = { Approved: "sdom-badge-success", Pending: "sdom-badge-warning", Rejected: "sdom-badge-danger", Overdue: "sdom-badge-danger", Active: "sdom-badge-success" };
  return <span className={`sdom-badge ${map[s] || "sdom-badge-neutral"}`}>{s}</span>;
};

const ROLE_MAP = {
  pointsmen: "Pointsman",
  Pointsman: "Pointsman",
  sm: "Station Master",
  "Station Master": "Station Master",
  ss: "Station Superintendent",
  "Station Superintendent": "Station Superintendent",
  tm: "Train Manager",
  "Train Manager": "Train Manager",
  ti: "Traffic Inspector",
  "Traffic Inspector": "Traffic Inspector"
};

const MONTHLY_TREND = [
  { month: "Dec'25", score: 81, safety: 80 },
  { month: "Jan'26", score: 83, safety: 82 },
  { month: "Feb'26", score: 85, safety: 85 },
  { month: "Mar'26", score: 87, safety: 88 },
  { month: "Apr'26", score: 89, safety: 91 },
  { month: "May'26", score: 91, safety: 94 }
];

const INIT_STATIONS = [
  { id: "ST01", name: "Parbhani Junction", code: "PBN", avgScore: 82, safetyPct: 88, highRisk: 1, pointsmenCount: 10 },
  { id: "ST02", name: "Amla Junction", code: "AMLA", avgScore: 65, safetyPct: 71, highRisk: 3, pointsmenCount: 8 },
  { id: "ST03", name: "Badnera Junction", code: "BD", avgScore: 78, safetyPct: 83, highRisk: 1, pointsmenCount: 7 },
  { id: "ST04", name: "Nagpur Junction", code: "NGP", avgScore: 89, safetyPct: 94, highRisk: 0, pointsmenCount: 12 },
  { id: "ST05", name: "Akola Junction", code: "AK", avgScore: 71, safetyPct: 76, highRisk: 2, pointsmenCount: 8 },
  { id: "ST06", name: "Wardha Junction", code: "WR", avgScore: 80, safetyPct: 85, highRisk: 1, pointsmenCount: 9 },
  { id: "ST07", name: "Betul Station", code: "BYT", avgScore: 74, safetyPct: 80, highRisk: 1, pointsmenCount: 6 },
  { id: "ST08", name: "Itarsi Junction", code: "ET", avgScore: 85, safetyPct: 91, highRisk: 1, pointsmenCount: 11 },
  { id: "ST09", name: "Chandrapur Station", code: "CD", avgScore: 68, safetyPct: 73, highRisk: 2, pointsmenCount: 7 },
  { id: "ST10", name: "Gondia Junction", code: "G", avgScore: 82, safetyPct: 87, highRisk: 0, pointsmenCount: 9 },
  { id: "ST11", name: "Dhamangaon Station", code: "DMN", avgScore: 73, safetyPct: 79, highRisk: 1, pointsmenCount: 5 },
  { id: "ST12", name: "Pulgaon Junction", code: "PLO", avgScore: 76, safetyPct: 81, highRisk: 1, pointsmenCount: 6 }
];

const INIT_USERS = [
  // Station Masters
  { id: "SM_1001", name: "S. Deshmukh", role: "Station Master", designation: "Station Master", station: "Parbhani Junction", cat: "A", lastAssessDate: "2026-03-20", score: 86, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 11001", joiningDate: "2018-02-12" },
  { id: "SM_2102", name: "A. Kulkarni", role: "Station Master", designation: "Station Master", station: "Parbhani Junction", cat: "B", lastAssessDate: "2026-02-14", score: 72, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 11002", joiningDate: "2019-05-15" },
  { id: "SM_2201", name: "M. Patil", role: "Station Master", designation: "Station Master", station: "Amla Junction", cat: "A", lastAssessDate: "2026-03-12", score: 84, pmeStatus: "Fit", refStatus: "Pending", contact: "+91 98765 11003", joiningDate: "2016-08-20" },
  { id: "SM_2202", name: "R. Sharma", role: "Station Master", designation: "Station Master", station: "Amla Junction", cat: "C", lastAssessDate: "2026-01-30", score: 54, pmeStatus: "Pending", refStatus: "Pending", contact: "+91 98765 11004", joiningDate: "2021-10-10" },
  { id: "SM_2301", name: "V. Singh", role: "Station Master", designation: "Station Master", station: "Badnera Junction", cat: "A", lastAssessDate: "2026-03-15", score: 88, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 11005", joiningDate: "2015-04-12" },
  { id: "SM_2302", name: "T. Mehta", role: "Station Master", designation: "Station Master", station: "Badnera Junction", cat: "B", lastAssessDate: "2026-02-20", score: 71, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 11006", joiningDate: "2020-03-18" },
  { id: "SM_2401", name: "K. Raghuvanshi", role: "Station Master", designation: "Station Master", station: "Nagpur Junction", cat: "A", lastAssessDate: "2026-03-22", score: 92, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 11007", joiningDate: "2014-06-25" },
  { id: "SM_2501", name: "P. Wankhede", role: "Station Master", designation: "Station Master", station: "Akola Junction", cat: "B", lastAssessDate: "2026-03-01", score: 74, pmeStatus: "Overdue", refStatus: "Expired", contact: "+91 98765 11008", joiningDate: "2017-09-08" },
  
  // Pointsmen
  { id: "PM_1001", name: "K. Pawar", role: "Pointsman", designation: "Pointsman Grade I", station: "Parbhani Junction", cat: "A", lastAssessDate: "2026-04-10", score: 80, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 22001", joiningDate: "2020-01-10" },
  { id: "PM_1002", name: "R. Verma", role: "Pointsman", designation: "Pointsman Grade I", station: "Amla Junction", cat: "B", lastAssessDate: "2026-04-09", score: 68, pmeStatus: "Fit", refStatus: "Pending", contact: "+91 98765 22002", joiningDate: "2021-06-18" },
  { id: "PM_1003", name: "D. Rane", role: "Pointsman", designation: "Pointsman Grade II", station: "Amla Junction", cat: "D", lastAssessDate: "2026-04-08", score: 44, pmeStatus: "Unfit", refStatus: "Pending", contact: "+91 98765 22003", joiningDate: "2022-11-22" },
  { id: "PM_1004", name: "J. Shaikh", role: "Pointsman", designation: "Pointsman Grade I", station: "Badnera Junction", cat: "A", lastAssessDate: "2026-04-04", score: 88, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 22004", joiningDate: "2019-12-05" },
  { id: "PM_1005", name: "A. Gade", role: "Pointsman", designation: "Pointsman Grade II", station: "Akola Junction", cat: "C", lastAssessDate: "2026-03-24", score: 58, pmeStatus: "Overdue", refStatus: "Cleared", contact: "+91 98765 22005", joiningDate: "2023-04-15" },
  { id: "PM_1006", name: "S. Meshram", role: "Pointsman", designation: "Pointsman Grade I", station: "Nagpur Junction", cat: "A", lastAssessDate: "2026-03-28", score: 94, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 22006", joiningDate: "2018-05-19" },
  { id: "PM_1007", name: "G. Chawla", role: "Pointsman", designation: "Pointsman Grade II", station: "Itarsi Junction", cat: "A", lastAssessDate: "2026-03-14", score: 82, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 22007", joiningDate: "2020-07-20" },
  { id: "PM_1008", name: "H. Singh", role: "Pointsman", designation: "Pointsman Grade I", station: "Wardha Junction", cat: "B", lastAssessDate: "2026-03-10", score: 76, pmeStatus: "Fit", refStatus: "Expired", contact: "+91 98765 22008", joiningDate: "2017-02-28" },
  { id: "PM_1009", name: "B. Yadav", role: "Pointsman", designation: "Pointsman Grade II", station: "Chandrapur Station", cat: "C", lastAssessDate: "2026-03-05", score: 51, pmeStatus: "Overdue", refStatus: "Pending", contact: "+91 98765 22009", joiningDate: "2022-09-01" },
  { id: "PM_1010", name: "N. Dewangan", role: "Pointsman", designation: "Pointsman Grade I", station: "Gondia Junction", cat: "A", lastAssessDate: "2026-03-18", score: 85, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 22010", joiningDate: "2019-08-11" },
  
  // Station Superintendents
  { id: "SS_1001", name: "S. K. Mukherjee", role: "Station Superintendent", designation: "Station Superintendent", station: "Nagpur Junction", cat: "A", lastAssessDate: "2026-04-14", score: 92, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 33001", joiningDate: "2012-05-18" },
  { id: "SS_1002", name: "H. S. Rawat", role: "Station Superintendent", designation: "Station Superintendent", station: "Parbhani Junction", cat: "A", lastAssessDate: "2026-03-22", score: 89, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 33002", joiningDate: "2013-09-10" },
  { id: "SS_1003", name: "Anand Vardhan", role: "Station Superintendent", designation: "Station Superintendent", station: "Akola Junction", cat: "B", lastAssessDate: "2026-02-18", score: 75, pmeStatus: "Fit", refStatus: "Pending", contact: "+91 98765 33003", joiningDate: "2015-11-05" },

  // Train Managers
  { id: "TM_1001", name: "Dilip Kumar", role: "Train Manager", designation: "Train Manager", station: "Nagpur Junction", cat: "A", lastAssessDate: "2026-04-20", score: 90, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 44001", joiningDate: "2017-06-12" },
  { id: "TM_1002", name: "Vikas Dubey", role: "Train Manager", designation: "Train Manager", station: "Badnera Junction", cat: "B", lastAssessDate: "2026-03-11", score: 78, pmeStatus: "Fit", refStatus: "Pending", contact: "+91 98765 44002", joiningDate: "2019-10-22" },
  { id: "TM_1003", name: "J. P. Nadda", role: "Train Manager", designation: "Train Manager", station: "Amla Junction", cat: "C", lastAssessDate: "2026-01-25", score: 56, pmeStatus: "Pending", refStatus: "Expired", contact: "+91 98765 44003", joiningDate: "2021-04-15" }
];

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
const TEST_NAME = "Station Superintendent Periodic Assessment";

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
  { text: "Who is the primary authority responsible for verifying and signing the Station Working Rules (SWR) correction slips?", options: ["The Senior Section Engineer (Signal)", "The Station Superintendent and Senior DOM", "The AOM/G on duty", "The Chief Track Inspector"], answer: 1, explanation: "The Station Superintendent, along with the Senior Divisional Operations Manager (DOM), holds joint responsibility for signing and implementing SWR correction slips at the station yard limits." },
  { text: "During non-interlocked working for yard remodeling, what is the most critical duty of the Station Superintendent?", options: ["Delegating all route setup to pointsmen", "Personally supervising correct line setup, clamping, and padlocking of points", "Increasing train speed to clear congestion", "Suspending all communications with adjacent stations"], answer: 1, explanation: "Non-interlocked working is highly safety-critical. The Station Superintendent must personally ensure points are set, clamped, and padlocked before authorizing movements." },
  { text: "If a train passes a reception signal at danger (SPAD) inside station limits, what immediate action must the Station Superintendent take?", options: ["Direct the driver to proceed immediately to avoid delay", "Log the incident and instruct the SM on duty to protect the line and inform Control", "Quietly replace the signal bulb", "Blame the station superintendent on duty"], answer: 1, explanation: "SPAD is a major incident. The SS must ensure the line is immediately protected, the incident is logged, and the Divisional Control/Safety officer is notified." },
  { text: "In the event of a fire in the station control room, what is the first priority for the Station Superintendent?", options: ["Call the railway division headquarters for permission to evacuate", "Evacuate staff, use portable CO2 extinguishers, and isolate power supplies", "Protect physical files first", "Run out to the platform to check train schedules"], answer: 1, explanation: "The first priority in case of fire is life safety, followed by utilizing fire fighting equipment and isolating the electric/traction supply." },
  { text: "Who is responsible for supervising the shunting of passenger coaches containing passengers?", options: ["Any Station Superintendent", "The Station Superintendent or AOM/G on duty", "The Train Guard only", "The Coach Attendant"], answer: 1, explanation: "Shunting of occupied passenger vehicles must be personally supervised by the SS or the AOM/G on duty to prevent casualties." },
  { text: "If a AOM/G on duty is observed showing severe signs of fatigue or illness, the Station Superintendent must:", options: ["Instruct them to complete the shift anyway", "Arrange immediate relief and ensure the SM does not perform active block operations", "Give them strong coffee and ignore it", "Report them for misconduct"], answer: 1, explanation: "Active block operations require high alertness. Operating under fatigue/illness is a major safety hazard; relief must be arranged immediately." },
  { text: "In single-line token block working, what must the SS verify regarding token custody?", options: ["Tokens can be left on the counter", "Tokens must be secured in the block instrument and handled only by authorized staff", "Any passenger can hand over the token", "Drivers can carry multiple tokens"], answer: 1, explanation: "Safety tokens represent block authority and must remain secured inside block instruments under lock and key." },
  { text: "When a passing train is reported to have a 'Hot Axle' by the gateman, what must the Station Superintendent ensure?", options: ["The train is allowed to proceed to destination", "The train is stopped immediately at the station and the hot axle wagon is detached", "The train is speeded up to cool down the axle", "Instruct the driver to turn off the alarm"], answer: 1, explanation: "A hot axle can cause derailment. The train must be stopped at the station immediately, examined, and the defective wagon detached." },
  { text: "Before authorizing a Track Maintenance Block (Traffic Block) for the P-Way team, what is required?", options: ["A verbal nod from the driver", "A signed block permit exchanged between the SS/SM on duty and the block applicant", "No formal paperwork is required", "A general announcement on the platform"], answer: 1, explanation: "Track block working requires strict adherence to physical block permits, exchange of private numbers, and physical block protection." },
  { text: "A large parcel has fallen onto the track of Platform 3. The SS must immediately:", options: ["Wait for the scheduled cleaning staff", "Instruct the SM to set the signals to 'Red' for Platform 3 and clear the track", "Let the next incoming train push the parcel away", "Move it after the next train passes"], answer: 1, explanation: "Any track obstruction must be protected immediately by setting signals to danger/on and verifying the obstruction is cleared." },
  { text: "If water rises above rail level at the station yard, what action should the SS coordinate?", options: ["Allow trains to pass at normal speed", "Stop train movements or restrict speed to walking pace under direct engineering guidance", "Turn off all station lights", "Drain water onto the adjacent highway"], answer: 1, explanation: "Water logging reduces track stability and obscures points. Train movements must be stopped or restricted under track engineer supervision." },
  { text: "A passenger collapses on Platform 2 with severe chest pain. What is the SS's protocol?", options: ["Ask the passenger to take a taxi to the hospital", "Call the railway doctor, summon local ambulance, and administer basic first aid", "Tell them to wait for the next train", "Do nothing unless they are railway staff"], answer: 1, explanation: "The SS is responsible for arranging immediate medical aid, coordinating with local ambulances, and contacting the nearest railway hospital." },
  { text: "A freight train halts at the station. Before clearing the signal for an adjacent line train, the SS must verify:", options: ["The freight train is painted clean", "The rear vehicle of the freight train has completely cleared the fouling mark", "The freight driver has signed the logbook", "The passenger platform is empty"], answer: 1, explanation: "A train must stand completely clear of the fouling mark to prevent side-swipe collisions with trains on adjacent lines." },
  { text: "How often should the Station Superintendent conduct mock fire drills at the station?", options: ["Once in 3 years", "Jointly with fire services every 3 months or as per division rules", "Only when a fire occurs", "Never, it is not required"], answer: 1, explanation: "Periodic safety audits and mock drills (fire, emergency evacuation) are mandatory to ensure staff preparedness." },
  { text: "Under what condition can a driver pass a semi-automatic signal at 'Danger' within station limits?", options: ["On verbal instructions over walkie-talkie", "On receiving a physical Authority Memo (T/369-3b) and verifying points are correctly set", "When they are running late", "If the signal flashes yellow"], answer: 1, explanation: "Passing a signal at danger requires strict physical authorization (T/369-3b) and verifying the route is locked and clear." },
  { text: "To prevent stabled wagons from rolling back or moving, what must the SS ensure?", options: ["Hand brakes are fully applied, safety chains locked, and wooden wedges placed under wheels", "Points are kept unlocked", "A station superintendent stands behind the wagon", "Nothing, wagons cannot move on their own"], answer: 0, explanation: "Securing stabled loads requires full handbrake application, safety chains, and wooden wedges/skids to prevent runaway movements." },
  { text: "When exhibiting a hand signal to a pilot, where should the station staff stand?", options: ["Directly between the rails", "In a safe, highly visible position clear of the tracks", "On top of the cabin", "Inside the station master's office"], answer: 1, explanation: "Personal safety is key. Staff must stand in a safe, visible location, clear of track suction or vehicle overhang." },
  { text: "A signal is bobbing (randomly changing aspects). What must the SS instruct the SM on duty to do?", options: ["Ignore it until it stabilizes", "Treat it as showing its most restrictive aspect (Stop/Red) and report the defect immediately", "Turn off the signal power", "Tell the driver to speed through"], answer: 1, explanation: "Any fluctuating or bobbing signal must be treated as a danger/restrictive signal for safety." },
  { text: "Where should the emergency point chain keys and interlocking override keys be stored?", options: ["In the station superintendent's personal locker", "In a sealed glass box under the joint custody of the Station Superintendent/Master on duty", "Left in the keyholes at all times", "In the station manager's car"], answer: 1, explanation: "Safety critical keys must remain under strict custody in a secure box to prevent unauthorized operations." },
  { text: "If a Station Superintendent's PME is overdue by even one day, the Station Superintendent must:", options: ["Allow them to work shunting duties today anyway", "Strictly pull them off safety-related duties and send them for medical evaluation", "Extend their medical fitness verbally", "Let them work night shifts only"], answer: 1, explanation: "Safety rules forbid any staff with overdue PME from performing active safety-critical railway duties." },
  { text: "A train passes with its rear brake van missing. The SS/SM on duty must immediately:", options: ["Close the block section and alert adjacent stations and control of train parting", "Let the train proceed to destination", "Call a track maintenance worker", "Wave a green flag at the next train"], answer: 0, explanation: "A missing brake van indicates a train parting. The block section must be closed and adjacent stations notified to prevent rear-end collisions." },
  { text: "Where must safety detonators be stored at the station?", options: ["In a damp basement", "In a dry, locked metallic tin box away from heat and moisture", "On the open booking office shelf", "In the staff dining room"], answer: 1, explanation: "Detonators contain explosives and must be stored in dry, secure metallic boxes to prevent deterioration." },
  { text: "How often should safety briefings be held for the station staff under the SS's oversight?", options: ["Once a year during inspections", "Daily or before shift handovers to discuss SWR highlights and safe operations", "Only after a major accident", "Bi-annually"], answer: 1, explanation: "Shift-level safety briefings keep rules fresh and prevent complacency among station masters and ground crew." },
  { text: "When block instruments fail on a double line section, what block system must be adopted?", options: ["Line Clear Ticket / Paper Line Clear Working under SWR guidance", "Automatic block working without permission", "Stop all trains indefinitely", "Follow the train ahead closely"], answer: 0, explanation: "Block instrument failure requires transitioning to Paper Line Clear Ticket working, adhering strictly to SWR manual block procedures." },
  { text: "A AOM/G has missed their scheduled safety refresher course training. The SS must:", options: ["Allow them to continue active duty", "Take them off block operations duties immediately until retraining is completed", "Give them a handbook to read on shift", "Exempt them under station authority"], answer: 1, explanation: "Retraining is a statutory safety requirement. Staff with expired refresher training cannot operate block consoles." }
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
function StationSuperintendentModule({ user, onLogout }) {
  const fullName = user?.name && user.name !== "Station Superintendent User" ? user.name : stationSuperintendentProfile.name;
  const employeeId = user?.hrmsId || stationSuperintendentProfile.hrmsId;

  const [activeNav, setActiveNav] = useState("dashboard");

  // CRUD & Staff Directory States
  const [view, setView] = useState(null);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("ti_users");
    return saved ? JSON.parse(saved) : INIT_USERS;
  });
  useEffect(() => {
    localStorage.setItem("ti_users", JSON.stringify(users));
  }, [users]);

  const [stations, setStations] = useState(() => {
    const saved = localStorage.getItem("ti_stations");
    return saved ? JSON.parse(saved) : INIT_STATIONS;
  });
  useEffect(() => {
    localStorage.setItem("ti_stations", JSON.stringify(stations));
  }, [stations]);

  const myStations = useMemo(() => stations, [stations]);

  const [roleF, setRoleF] = useState({ name: "", station: "All", ti: "All", cat: "All", risk: "All" });
  const [editingUser, setEditingUser] = useState(null);
  const [transferringUser, setTransferringUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    id: "",
    name: "",
    role: "Station Master",
    designation: "Station Master",
    station: "",
    contact: "",
    joiningDate: "",
    pmeStatus: "Fit",
    refStatus: "Cleared"
  });

  const addAuditLog = (event, details) => {
    logActivity("System", `${event}: ${details}`);
  };
  const [screenMode, setScreenMode] = useState("default");
  const [historyDateSearch, setHistoryDateSearch] = useState("");
  const [historySortOrder, setHistorySortOrder] = useState("date-desc");
  const [historyPage, setHistoryPage] = useState(1);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`ss_history_${employeeId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error reading SS history:", e);
    }
    return initialHistory;
  });

  const [selectedRecord, setSelectedRecord] = useState(null);

  // My Assessment state (mirrors SM module)
  const [myAssessSelected, setMyAssessSelected] = useState(null);
  const [ssMcqTest, setSsMcqTest] = useState(() => {
    const saved = localStorage.getItem(`ss_mcq_test_${employeeId}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [testAssigned, setTestAssigned] = useState(() => {
    const saved = localStorage.getItem(`ss_test_assigned_${employeeId}`);
    if (saved === null) {
      localStorage.setItem(`ss_test_assigned_${employeeId}`, "Assigned");
      return "Assigned";
    }
    return saved;
  });
  const [ssActiveQIdx, setSsActiveQIdx] = useState(0);
  const [ssTestResponses, setSsTestResponses] = useState(() => Array(25).fill(null));
  
  const [currentTest, setCurrentTest] = useState(() => {
    const saved = localStorage.getItem(`ss_current_test_${employeeId}`);
    if (saved) return JSON.parse(saved);
    const mcqResult = localStorage.getItem(`ss_mcq_test_${employeeId}`);
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
    { id: 4, type: "success", message: "Training status updated: Periodic Shunting Refresher completed.", time: "3 days ago", read: true }
  ]);

  // 4. Audit Activity Logs
  const [profileSubTab, setProfileSubTab] = useState("details"); // "details" | "audit"
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, timestamp: "2026-05-27 10:00:12", category: "Auth", action: "User session initialized (IP: 10.244.15.68)", user: "R. Kulkarni" },
    { id: 2, timestamp: "2026-05-27 10:01:45", category: "Profile", action: "PME & REF health profile retrieved", user: "R. Kulkarni" },
    { id: 3, timestamp: "2026-05-27 10:03:10", category: "System", action: "Audited dashboard integrity checklist successfully", user: "R. Kulkarni" }
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
    { id: 102, type: "Abnormal Incident", defect: "Hot Axle Exchanged Flag", location: "Line 1 Main", severity: "Medium - Investigating", status: "UNDER REPAIR", date: "2026-05-26", desc: "Detected sparks during all-right hand signal. Notified AOM/G." }
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
      summary += `However, low-scoring markers are observed in "${lowestSec.title}" (${lowestSec.marks}/${lowestSec.outOf}). It is highly recommended to study the Station Working Rules (SWR) for points locking/shunting and undergo periodic coaching.`;
    } else {
      summary += `Achieved flawless accuracy in all modules. Recommended to maintain this premium standard in daily track shunting.`;
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

  /* ── User admin actions ── */
  const openAddUserModal = (defaultRole = "Station Master") => {
    let defaultDesig = defaultRole;
    if (defaultRole === "Pointsman") defaultDesig = "Pointsman Grade I";
    setNewUserData({
      id: "",
      name: "",
      role: defaultRole,
      designation: defaultDesig,
      station: myStations[0]?.name || "",
      contact: "",
      joiningDate: new Date().toISOString().slice(0, 10),
      pmeStatus: "Fit",
      refStatus: "Cleared",
      reportingSm: defaultRole === "Pointsman" ? "S. Deshmukh" : defaultRole === "Train Manager" ? "NGP-BSL Section" : "",
      shift: defaultRole === "Pointsman" ? "Morning Shift (06:00 - 14:00)" : defaultRole === "Train Manager" ? "Goods Train Beat" : "",
      workLocation: defaultRole === "Pointsman" ? "Yard Area" : defaultRole === "Train Manager" ? "Nagpur Depot" : ""
    });
    setShowAddUserModal(true);
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.id.trim() || !newUserData.station || !newUserData.contact.trim() || !newUserData.joiningDate) {
      triggerNotification("danger", "Please fill out all required fields.");
      return;
    }
    
    let finalId = newUserData.id.trim();
    if (newUserData.role === "Station Master") {
      if (!finalId.startsWith("SM_")) {
        finalId = "SM_" + finalId.replace(/^SM_|^PM_|^SS_|^TM_/i, "");
      }
    } else if (newUserData.role === "Pointsman") {
      if (!finalId.startsWith("PM_")) {
        finalId = "PM_" + finalId.replace(/^SM_|^PM_|^SS_|^TM_/i, "");
      }
    } else if (newUserData.role === "Station Superintendent") {
      if (!finalId.startsWith("SS_")) {
        finalId = "SS_" + finalId.replace(/^SM_|^PM_|^SS_|^TM_/i, "");
      }
    } else if (newUserData.role === "Train Manager") {
      if (!finalId.startsWith("TM_")) {
        finalId = "TM_" + finalId.replace(/^SM_|^PM_|^SS_|^TM_/i, "");
      }
    }

    if (users.some(u => u.id === finalId)) {
      triggerNotification("danger", `User with Employee ID ${finalId} already exists!`);
      return;
    }

    const newUser = {
      id: finalId,
      name: newUserData.name.trim(),
      role: newUserData.role,
      designation: newUserData.designation || newUserData.role,
      station: newUserData.station,
      cat: "A",
      lastAssessDate: new Date().toISOString().slice(0, 10),
      score: 80,
      pmeStatus: newUserData.pmeStatus,
      refStatus: newUserData.refStatus,
      contact: newUserData.contact.trim(),
      joiningDate: newUserData.joiningDate,
      reportingSm: newUserData.role === "Pointsman" || newUserData.role === "Train Manager" ? newUserData.reportingSm : "",
      shift: newUserData.role === "Pointsman" || newUserData.role === "Train Manager" ? newUserData.shift : "",
      workLocation: newUserData.role === "Pointsman" || newUserData.role === "Train Manager" ? newUserData.workLocation : ""
    };

    setUsers(prev => [...prev, newUser]);
    setShowAddUserModal(false);
    
    addAuditLog("Added New User", `Staff: ${newUser.name} (${newUser.id})`);
    triggerNotification("success", `Added Staff: ${newUser.name} (${newUser.id})`);
  };

  const handleEditUser = (userRec) => {
    setEditingUser({ ...userRec });
  };

  const saveEditedUser = (e) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    addAuditLog("User Profile Modified", `Staff ID: ${editingUser.id}, Name: ${editingUser.name}`);
    triggerNotification("success", `Profile updated for ${editingUser.name}.`);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you absolutely sure you want to revoke operational access for ${userName} (${userId})?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      addAuditLog("Revoked User Access", `Staff ID: ${userId}, Name: ${userName}`);
      triggerNotification("danger", `Revoked access: ${userName} (${userId}).`);
    }
  };

  const handleTransferClick = (userRec) => {
    setTransferringUser({ ...userRec, targetStation: userRec.station });
  };

  const confirmTransfer = () => {
    setUsers(prev => prev.map(u => u.id === transferringUser.id ? { ...u, station: transferringUser.targetStation } : u));
    addAuditLog("Staff Station Transfer", `Staff: ${transferringUser.name} moved from ${transferringUser.station} to ${transferringUser.targetStation}`);
    triggerNotification("warning", `Transferred ${transferringUser.name} to ${transferringUser.targetStation}.`);
    setTransferringUser(null);
  };

  /* ─── My Assessment Test Actions (mirrors SM) ─── */
  const startTestAttempt = () => {
    setSsActiveQIdx(0);
    setSsTestResponses(Array(25).fill(null));
    setScreenMode("takeTest");
  };

  const handleSubmitTestAttempt = () => {
    const correctCount = ssTestResponses.filter((r, idx) => r === testQuestions[idx].answer).length;
    const percentage = Math.round((correctCount / 25) * 100);
    const passStatus = percentage >= 60 ? "PASSED" : "FAILED";
    const today = new Date().toISOString().slice(0, 10);
    const testResult = {
      completed: true,
      correctCount,
      responses: [...ssTestResponses],
      submittedDate: today,
      percentage,
      passStatus
    };
    localStorage.setItem(`ss_mcq_test_${employeeId}`, JSON.stringify(testResult));
    setSsMcqTest(testResult);
    localStorage.setItem(`ss_test_assigned_${employeeId}`, "Completed");
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
      responses: [...ssTestResponses],
      approvalStatus: "Completed",
      isOnlineExam: true
    };
    const newHistory = [record, ...history];
    setHistory(newHistory);
    localStorage.setItem(`ss_history_${employeeId}`, JSON.stringify(newHistory));
    setScreenMode("default");
    setStatusText(`Assessment submitted! Score: ${percentage}% (${correctCount}/25). Status: Completed.`);
  };

  /* ─── Test Actions ─── */
  const handleReattempt = () => {
    localStorage.removeItem(`ss_mcq_test_${employeeId}`);
    localStorage.setItem(`ss_current_test_${employeeId}`, JSON.stringify(currentTestSeed));
    setCurrentTest(currentTestSeed);
    setActiveTest(currentTestSeed);
    setResponses(Array(25).fill(null));
    setCurrentQuestion(0);
    setStatusText("New CBT shunting safety test session initialized.");
    setActiveNav("current");
    setScreenMode("attempt");
    logActivity("Assessment", "Periodic CBT assessment re-attempt session started.");
    triggerNotification("info", "New shunting safety CBT competency exam session active.");
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
      responses: [...responses],
      assessedBy: "Traffic Inspector",
      approvalStatus: "Completed",
      isOnlineExam: true
    };
    const newHistory = [record, ...history];
    setHistory(newHistory);
    localStorage.setItem(`ss_history_${employeeId}`, JSON.stringify(newHistory));
    
    setCurrentTest(null);
    localStorage.setItem(`ss_current_test_${employeeId}`, JSON.stringify(null));

    // Save MCQ result for Traffic Inspector
    const correctCount = Math.round(totalScore / 4);
    const percentage = Math.round((correctCount / 25) * 100);
    const mcqResult = {
      completed: true,
      correctCount: correctCount,
      submittedDate: today,
      percentage: percentage
    };
    localStorage.setItem(`ss_mcq_test_${employeeId}`, JSON.stringify(mcqResult));

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
    setStatusText("Safety report logged. Forwarded to Traffic Inspector & P-Way inspector.");
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
        <article className="pm-sum-card" onClick={() => setActiveNav("myAssessment")} style={{ cursor: "pointer" }}>
          <div className="pm-sum-icon" style={{ background: "#eff6ff" }}>
            <Target size={20} color="#2563eb" />
          </div>
          <div>
            <label>Latest Score</label>
            <strong>{latestScore !== null ? `${latestScore}/100` : "—"}</strong>
          </div>
        </article>

        <article className="pm-sum-card" onClick={() => setActiveNav("myAssessment")} style={{ cursor: "pointer" }}>
          <div className="pm-sum-icon" style={{ background: "#f0fdf4" }}>
            <Gauge size={20} color="#16a34a" />
          </div>
          <div>
            <label>Average Score</label>
            <strong>{averageScore}/100</strong>
          </div>
        </article>

        <article className="pm-sum-card" onClick={() => setActiveNav("myAssessment")} style={{ cursor: "pointer" }}>
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

        <article className="pm-sum-card" onClick={() => setActiveNav("myAssessment")} style={{ cursor: "pointer" }}>
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
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>{stationSuperintendentProfile.designation} &bull; {stationSuperintendentProfile.stationName} &bull; Central Railway</div>
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
              <span className="val">{stationSuperintendentProfile.mobileNumber}</span>
              <span className="lbl">Contact</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }}/>
            <div className="sdom-station-header-stat">
              <span className="val">{history.length ? history[0].date : stationSuperintendentProfile.joiningDate}</span>
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
                ["Designation", stationSuperintendentProfile.designation],
                ["Mobile Number", stationSuperintendentProfile.mobileNumber],
                ["Email ID", `${employeeId.toLowerCase()}@rail.in`],
                ["Account Status", "Active"],
                ["Current Zone", "Central Railway"],
                ["Current Division", "Nagpur"],
                ["Current Station Placement", stationSuperintendentProfile.stationName],
                ["Reporting Officer", stationSuperintendentProfile.reportingOfficer]
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
                <div><strong>PME Next Due:</strong><div style={{fontWeight: 700, color: "#991b1b", marginTop: 4}}>2028-10-15</div></div>
                <div><strong>Refresher Course Completed:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>2024-04-13</div></div>
                <div><strong>Refresher Course Due:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>2027-04-12</div></div>
                <div style={{ gridColumn: "span 2" }}><strong>Training Clearance:</strong><div style={{fontWeight: 700, color: "#d97706", marginTop: 4}}>{stationSuperintendentProfile.trainingStatus}</div></div>
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

    const testActive = testAssigned === "Assigned" && (!ssMcqTest || !ssMcqTest.completed);

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
                  Your supervisor has scheduled a periodic safety &amp; competency assessment for you. You must complete the 25-question MCQ exam.
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
                <strong style={{color:"#14532d", fontSize:13}}>{ssMcqTest ? `${ssMcqTest.correctCount}/25 (${ssMcqTest.percentage}%)` : `${history[0]?.totalScore || 84}/100`}</strong>
              </div>
              <div style={{borderLeft:"1px solid #bbf7d0", paddingLeft:16}}>
                <span style={{color:"#166534", display:"block"}}>Next Due Date</span>
                <strong style={{color:"#14532d", fontSize:13}}>25 Sep 2026</strong>
              </div>
            </div>
          </div>
        )}

        <div className="sm2-card-hdr"><h2>My Assessment History</h2></div>
        <p className="sm2-subtitle">All assessments conducted by the Traffic Inspector for your record. Click any row to view the detailed scorecard.</p>

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
            <label>Average TI Score</label>
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
                <span style={{fontSize:11,color:"#64748b"}}>{sc.assessedBy || "S. Deshmukh (TI)"}</span>
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
    const question = testQuestions[ssActiveQIdx];
    const answeredCount = ssTestResponses.filter(r => r !== null && r !== undefined).length;
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
                STATION SUPERINTENDENT CBT COMPETENCY EVALUATION
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
          <div>Candidate: <strong style={{color:"#1e3a8a"}}>{fullName}</strong> &nbsp;|&nbsp; HRMS: <strong style={{color:"#1e3a8a"}}>{employeeId}</strong> &nbsp;|&nbsp; Station: <strong>{stationSuperintendentProfile.stationName}</strong></div>
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
                  Compulsory Question {ssActiveQIdx + 1} of 25
                </span>
                <h2 style={{fontSize:22, fontWeight:700, color:"#0f172a", marginTop:24, marginBottom:28, lineHeight:1.5}}>{question.text}</h2>
                <div style={{display:"flex", flexDirection:"column", gap:14}}>
                  {question.options.map((opt, oi) => {
                    const isSelected = ssTestResponses[ssActiveQIdx] === oi;
                    return (
                      <label key={oi} style={{display:"flex", alignItems:"center", gap:16, padding:"18px 24px", border:isSelected ? "2.5px solid #ea580c" : "1.5px solid #e2e8f0", borderRadius:12, background:isSelected ? "#fff7ed" : "#ffffff", cursor:"pointer", boxShadow:isSelected ? "0 4px 6px rgba(234,88,12,0.08)" : "none", transition:"all 0.15s ease"}}>
                        <input type="radio" name={`ssq-${ssActiveQIdx}`} checked={isSelected} onChange={() => { const r=[...ssTestResponses]; r[ssActiveQIdx]=oi; setSsTestResponses(r); }} style={{width:20, height:20, accentColor:"#ea580c"}}/>
                        <span style={{fontSize:15, fontWeight:800, color:isSelected?"#c2410c":"#64748b", width:24}}>{["A","B","C","D"][oi]}</span>
                        <span style={{fontSize:15, color:"#1e293b", fontWeight:isSelected?700:500}}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 24px", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)"}}>
              <button disabled={ssActiveQIdx===0} onClick={() => setSsActiveQIdx(p=>Math.max(0,p-1))} style={{padding:"12px 28px", borderRadius:8, fontSize:14, fontWeight:700, background:ssActiveQIdx===0?"#f1f5f9":"#ffffff", color:ssActiveQIdx===0?"#94a3b8":"#334155", border:"1.5px solid #cbd5e1", cursor:ssActiveQIdx===0?"not-allowed":"pointer"}}>← Previous Question</button>
              <div style={{fontSize:14, color:"#64748b"}}>
                {unansweredCount>0 ? <span style={{color:"#b45309",fontWeight:800}}>⚠️ {unansweredCount} question{unansweredCount>1?"s":""} remaining</span> : <span style={{color:"#16a34a",fontWeight:800}}>✓ All 25 answered! You can submit.</span>}
              </div>
              <button disabled={ssActiveQIdx===24} onClick={() => setSsActiveQIdx(p=>Math.min(24,p+1))} style={{padding:"12px 28px", borderRadius:8, fontSize:14, fontWeight:700, background:ssActiveQIdx===24?"#f1f5f9":"#ffffff", color:ssActiveQIdx===24?"#94a3b8":"#334155", border:"1.5px solid #cbd5e1", cursor:ssActiveQIdx===24?"not-allowed":"pointer"}}>Next Question →</button>
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
                const isCurrent = idx===ssActiveQIdx;
                const isAnswered = ssTestResponses[idx]!==null && ssTestResponses[idx]!==undefined;
                let bg="#ffffff", border="1.5px solid #cbd5e1", color="#475569", fw="600";
                if (isCurrent) { bg="#ffedd5"; border="2px solid #ea580c"; color="#c2410c"; fw="800"; }
                else if (isAnswered) { bg="#dcfce7"; border="1.5px solid #86efac"; color="#15803d"; }
                else { bg="#fef3c7"; border="1.5px solid #fde047"; color="#a16207"; }
                return <button key={q.id} onClick={()=>setSsActiveQIdx(idx)} style={{height:40, borderRadius:8, fontSize:13, fontWeight:fw, background:bg, border, color, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}>{q.id}</button>;
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
        <p className="pm-subtitle">Historical ledger of standard Station Superintendent CBT safety competency trials.</p>

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
                      <td style={{ padding: "14px 18px", color: "#334155", fontWeight: "500" }}>{record.assessedBy || "S. Deshmukh (TI)"}</td>
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
            <p className="pm-sc-date" style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Attempt Completed: {selectedRecord.date} &nbsp;·&nbsp; Assessed By: S. Deshmukh (Traffic Inspector)</p>
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
    const isTestActivated = localStorage.getItem("ss_test_activated_" + employeeId) === "true";
    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Assigned Competency Trials</h2>
        </div>
        <p className="pm-subtitle">Mandatory periodically scheduled evaluation of SWR Rules and points shunting safety clearance.</p>

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
                STATION SUPERINTENDENT CBT COMPETENCY EVALUATION
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
            Candidate Name: <strong style={{color: "#1e3a8a"}}>{fullName}</strong> &nbsp;|&nbsp; HRMS ID: <strong style={{color: "#1e3a8a"}}>{employeeId}</strong> &nbsp;|&nbsp; Station: <strong>{stationSuperintendentProfile.stationName}</strong>
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
                          name={`pm-q-${question.id}`}
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
                placeholder="Describe the train movement, shunting speeds, visual smoke, wheel fire, or hand signal exchanges..."
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

  const renderStaffDetail = (s) => {
    const computedRisk = getUserRisk(s);
    const scoreData = MONTHLY_TREND.map((m, i) => ({ month: m.month, score: Math.max(50, s.score - 10 + i * 2) }));
    
    return (
      <div className="sdom-fade animate-fade-in">
        <div style={{ marginBottom: 24 }}>
          <button className="sdom-back-btn" onClick={() => {
            setView(null);
          }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 700 }}>
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        <div className="sdom-station-header" style={{ marginBottom: 24 }}>
          <div className="sdom-station-header-meta">
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Staff Profile</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>{ROLE_MAP[s.role] || s.role} &bull; {s.station} &bull; {s.zone || "Central Railway"}</div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              {catBadge(s.cat || getCat(s.score))}
              {riskBadge(computedRisk)}
              {statusBadge(s.status || "Active")}
            </div>
          </div>
          <div className="sdom-station-header-stats">
            <div className="sdom-station-header-stat">
              <span className="val">{s.score}%</span>
              <span className="lbl">Latest Score</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }} />
            <div className="sdom-station-header-stat">
              <span className="val">{s.contact || "—"}</span>
              <span className="lbl">Contact</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }} />
            <div className="sdom-station-header-stat">
              <span className="val">{s.lastAssessDate || s.lastDate || "—"}</span>
              <span className="lbl">Last Assessment</span>
            </div>
          </div>
        </div>

        <div className="sdom-row-2">
          <div className="sdom-chart-card">
            <div className="sdom-chart-title" style={{ marginBottom: "16px" }}>Personal &amp; Professional Details</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', paddingBottom: '20px' }}>
              {[
                ["Employee ID / HRMS ID", s.id],
                ["Designation", ROLE_MAP[s.role] || s.role],
                ["Mobile Number", s.contact || "N/A"],
                ["Email ID", s.email || `${s.id?.toLowerCase()}@rail.in`],
                ["Account Status", s.status || "Active"],
                ["Current Zone", s.zone || "Central Railway"],
                ["Current Division", s.division || "Nagpur Division"],
                ["Current Station Placement", s.station],
                ["Reporting Officer", s.reportingAom || "TI R. Khan (Safety)"]
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{lbl}</div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* AOM Parity: Operational Specifications */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#0f172a', fontWeight: '800', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                Operational Profile Specifications
              </h4>
              
              {(s.role === "Pointsman" || s.role === "pointsmen") && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                  <div><strong>Reporting Station Master:</strong><div style={{fontWeight: 700, color: "#1e3a5f", marginTop: 4}}>{s.reportingSm || "S. Deshmukh (SM)"}</div></div>
                  <div><strong>Assigned Shift:</strong><div style={{fontWeight: 700, color: "#1e3a5f", marginTop: 4}}>{s.shift || "Morning Shift (06:00 - 14:00)"}</div></div>
                  <div><strong>Work Location Setup:</strong><div style={{fontWeight: 700, color: "#1e3a5f", marginTop: 4}}>{s.workLocation || "Yard Area"}</div></div>
                </div>
              )}

              {(s.role === "Station Master" || s.role === "sm" || s.role === "Station Superintendent" || s.role === "ss") && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                  <div><strong>Operational Station:</strong><div style={{fontWeight: 700, color: "#065f46", marginTop: 4}}>{s.station || "N/A"}</div></div>
                  <div><strong>Operational Division:</strong><div style={{fontWeight: 700, color: "#065f46", marginTop: 4}}>{s.division || "Nagpur Division"}</div></div>
                  <div><strong>Operational Zone:</strong><div style={{fontWeight: 700, color: "#065f46", marginTop: 4}}>{s.zone || "Central Railway"}</div></div>
                </div>
              )}

              {(s.role === "Train Manager" || s.role === "tm") && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                  <div><strong>Crew Depot:</strong><div style={{fontWeight: 700, color: "#6b21a8", marginTop: 4}}>{s.workLocation || "Nagpur Depot"}</div></div>
                  <div><strong>Assigned Shift:</strong><div style={{fontWeight: 700, color: "#6b21a8", marginTop: 4}}>{s.shift || "Goods Train Beat"}</div></div>
                  <div><strong>Assigned Section Beats:</strong><div style={{fontWeight: 700, color: "#6b21a8", marginTop: 4}}>{s.reportingSm || "NGP-BSL Section"}</div></div>
                </div>
              )}
            </div>
          </div>

          <div className="sdom-chart-card">
            <div className="sdom-chart-title">Score Trend</div>
            <div className="sdom-chart-subtitle">Monthly performance tracking for this employee</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis domain={[40, 100]} fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRoleView = (roleKey, title) => {
    if (view?.type === "staffDetail") return renderStaffDetail(view.data);

    const filtered = users.filter(s => {
      const isRoleMatch = s.role === roleKey;
      if (!isRoleMatch) return false;
      
      const userTi = stationTiMap[s.station] || "TI NGP";
      const userCat = s.cat || getCat(s.score);
      const isHighRisk = s.pmeStatus === "Overdue" || s.refStatus === "Expired" || s.score < 50;
      const userRisk = isHighRisk ? "High" : s.score >= 80 ? "Low" : "Medium";
      
      return (
        (roleF.station === "All" || s.station === roleF.station) &&
        (roleF.ti      === "All" || userTi    === roleF.ti)      &&
        (roleF.cat     === "All" || userCat   === roleF.cat)     &&
        (roleF.risk    === "All" || userRisk  === roleF.risk)    &&
        (!roleF.name   || s.name.toLowerCase().includes(roleF.name.toLowerCase()) ||
                          s.id.toLowerCase().includes(roleF.name.toLowerCase()))
      );
    });

    const STATION_OPTS = ["All", ...stations.map(s => s.name)];
    const TI_OPTS      = ["All", "TI PAR", "TI AMLA", "TI NGP"];

    return (
      <div className="ti2-page-body animate-fade-in">
        <div className="sdom-fade">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h1 className="sdom-page-title">{title} Management</h1>
              <p className="sdom-page-subtitle">Search, filter and manage all {title.toLowerCase()}s in the division.</p>
            </div>
            <button className="sdom-btn-primary" onClick={() => openAddUserModal(roleKey)}>
              <Plus size={16} /> Add New {title}
            </button>
          </div>

          {/* Filters */}
          <div className="sdom-filter-bar">
            <div className="sdom-filter-field" style={{ minWidth: 200 }}>
              <label>Name / ID</label>
              <input value={roleF.name} onChange={e => setRoleF(p => ({ ...p, name: e.target.value }))} placeholder="Search..." />
            </div>
            <div className="sdom-filter-field">
              <label>Station</label>
              <select value={roleF.station} onChange={e => setRoleF(p => ({ ...p, station: e.target.value }))}>
                {STATION_OPTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="sdom-filter-field">
              <label>TI Area</label>
              <select value={roleF.ti} onChange={e => setRoleF(p => ({ ...p, ti: e.target.value }))}>
                {TI_OPTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="sdom-filter-field">
              <label>Category</label>
              <select value={roleF.cat} onChange={e => setRoleF(p => ({ ...p, cat: e.target.value }))}>
                <option>All</option><option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </div>
            <div className="sdom-filter-field">
              <label>Risk Level</label>
              <select value={roleF.risk} onChange={e => setRoleF(p => ({ ...p, risk: e.target.value }))}>
                <option>All</option><option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>

          <div className="sdom-chart-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: "#1e293b" }}>{filtered.length} staff found</span>
            </div>
            <div className="sdom-table-wrap">
              <table className="sdom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Emp ID</th>
                    <th>Station</th>
                    <th>TI Area</th>
                    <th>Category</th>
                    <th>Risk</th>
                    <th>Last Score</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                        No records found
                      </td>
                    </tr>
                  )}
                  {filtered.map(s => {
                    const grade = s.cat || getCat(s.score);
                    const computedRisk = getUserRisk(s);
                    const computedStatus = s.pmeStatus === "Unfit" ? "Rejected" : s.refStatus === "Expired" ? "Pending" : "Approved";
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700 }}>{s.name}</td>
                        <td style={{ color: "#64748b", fontSize: "0.85rem" }}>{s.id}</td>
                        <td>{s.station}</td>
                        <td>{stationTiMap[s.station] || "TI NGP"}</td>
                        <td>{catBadge(grade)}</td>
                        <td>{riskBadge(computedRisk)}</td>
                        <td style={{ fontWeight: 700 }}>{s.score}%</td>
                        <td>{statusBadge(computedStatus)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                            <button className="sdom-btn-outline" style={{ padding: "5px 10px", fontSize: "0.8rem" }} onClick={() => setView({ type: "staffDetail", data: s, returnTo: activeNav })}>View</button>
                            <button className="sdom-icon-btn" title="Edit" onClick={() => handleEditUser(s)} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Edit size={15} color="#2563eb"/></button>
                            <button className="sdom-icon-btn" title="Transfer Station" onClick={() => handleTransferClick(s)} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><RefreshCw size={15} color="#d97706"/></button>
                            <button className="sdom-icon-btn" title="Remove" onClick={() => handleDeleteUser(s.id, s.name)} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={15} color="#dc2626"/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditUserModal = () => (
    <div className="sdom-modal-overlay" onClick={e => e.target === e.currentTarget && setEditingUser(null)}>
      <div className="sdom-modal" style={{ width: "900px", maxWidth: "95vw" }}>
        <form onSubmit={saveEditedUser} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
            <div style={{
              background: "linear-gradient(135deg, #0d2c4d 0%, #1e40af 100%)",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(13, 44, 77, 0.2)",
              color: "#ffffff"
            }}>
              <UserPlus size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0d2c4d", letterSpacing: "-0.5px" }}>
                EDIT SYSTEM USER
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                Role-Based Operational Staff Provisioning &amp; Management Console
              </p>
            </div>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d2c4d', margin: '0 0 10px', fontSize: '15px', fontWeight: '800' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d2c4d', display: 'inline-block' }}></span>
              1. General &amp; Contact Information
            </h4>
            <div style={{ height: '1px', background: '#d5dfeb', marginBottom: '16px' }}></div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sdom-modal-field">
                <label>Full Name *</label>
                <input 
                  value={editingUser.name || ""} 
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} 
                  placeholder="Enter full name (e.g. A. K. Sharma)" 
                  required
                />
              </div>
              <div className="sdom-modal-field">
                <label>Mobile Number *</label>
                <input 
                  value={editingUser.contact || ""} 
                  onChange={e => setEditingUser({ ...editingUser, contact: e.target.value })} 
                  placeholder="Enter 10-digit mobile number" 
                  required
                />
              </div>
              <div className="sdom-modal-field">
                <label>HRMS ID / Employee ID *</label>
                <input 
                  value={editingUser.id || ""} 
                  disabled
                  placeholder="Enter unique ID" 
                />
              </div>
              <div className="sdom-modal-field">
                <label>Email ID *</label>
                <input 
                  value={editingUser.email || ""} 
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} 
                  placeholder="Enter email address (e.g. user@rail.in)" 
                />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d2c4d', margin: '0 0 10px', fontSize: '15px', fontWeight: '800' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d2c4d', display: 'inline-block' }}></span>
              2. Designation &amp; Station Placement Setup
            </h4>
            <div style={{ height: '1px', background: '#d5dfeb', marginBottom: '16px' }}></div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sdom-modal-field">
                <label>Role / Designation *</label>
                <select 
                  value={editingUser.role} 
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value, designation: e.target.value })}
                  required
                >
                  <option value="Pointsman">Pointsman</option>
                  <option value="Station Master">Station Master</option>
                  <option value="Station Superintendent">Station Superintendent</option>
                  <option value="Train Manager">Train Manager</option>
                </select>
              </div>
              <div className="sdom-modal-field">
                <label>Division *</label>
                <select 
                  value={editingUser.division || "Nagpur"} 
                  onChange={e => setEditingUser({ ...editingUser, division: e.target.value })}
                >
                  {["Nagpur", "Pune", "Mumbai", "Solapur", "Bhusawal"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="sdom-modal-field">
                <label>Railway Zone *</label>
                <select 
                  value={editingUser.zone || "Central Railway"} 
                  onChange={e => setEditingUser({ ...editingUser, zone: e.target.value })}
                >
                  {["Central Railway", "Western Railway", "Northern Railway", "Southern Railway", "Eastern Railway"].map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="sdom-modal-field">
                <label>Station Name *</label>
                <select 
                  value={editingUser.station} 
                  onChange={e => setEditingUser({ ...editingUser, station: e.target.value })}
                  required
                >
                  {myStations.map(s => <option key={s.id} value={s.name}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="sdom-modal-field">
                <label>Category *</label>
                <select 
                  value={editingUser.cat || "A"} 
                  onChange={e => setEditingUser({ ...editingUser, cat: e.target.value })}
                >
                  <option>A</option><option>B</option><option>C</option><option>D</option>
                </select>
              </div>
              <div className="sdom-modal-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>PME Status</label>
                  <select style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={editingUser.pmeStatus} onChange={e => setEditingUser({ ...editingUser, pmeStatus: e.target.value })} required>
                    <option>Fit</option>
                    <option>Unfit</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>REF Status</label>
                  <select style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={editingUser.refStatus} onChange={e => setEditingUser({ ...editingUser, refStatus: e.target.value })} required>
                    <option>Cleared</option>
                    <option>Pending</option>
                    <option>Expired</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Role-Based Custom Operational Profile */}
          {(editingUser.role === "Station Master" || editingUser.role === "Station Superintendent") && (
            <div style={{ padding: 18, background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, marginBottom: 16 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', margin: '0 0 10px', fontSize: '14px', fontWeight: '800' }}>
                {editingUser.role} Operational Setup
              </h4>
              <div style={{ height: '1px', backgroundColor: '#a7f3d0', marginBottom: '16px' }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sdom-modal-field">
                  <label>Operational Station *</label>
                  <select 
                    value={editingUser.smStation || editingUser.station || ""} 
                    onChange={e => setEditingUser({ ...editingUser, smStation: e.target.value, station: e.target.value })}
                  >
                    <option value="">Select Operational Station</option>
                    {myStations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="sdom-modal-field">
                  <label>Operational Zone *</label>
                  <select 
                    value={editingUser.smZone || editingUser.zone || "Central Railway"} 
                    onChange={e => setEditingUser({ ...editingUser, smZone: e.target.value, zone: e.target.value })}
                  >
                    <option value="">Select Zone</option>
                    {["Central Railway", "Western Railway", "Northern Railway", "Southern Railway", "Eastern Railway"].map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className="sdom-modal-field">
                  <label>Operational Division *</label>
                  <select 
                    value={editingUser.smDivision || editingUser.division || "Nagpur"} 
                    onChange={e => setEditingUser({ ...editingUser, smDivision: e.target.value, division: e.target.value })}
                  >
                    <option value="">Select Division</option>
                    {["Nagpur", "Pune", "Mumbai", "Solapur", "Bhusawal"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {editingUser.role === "Pointsman" && (
            <div style={{ padding: 18, background: "#f0f7ff", border: "1px solid #c2e0ff", borderRadius: 10 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d2c4d', margin: '0 0 10px', fontSize: '14px', fontWeight: '800' }}>
                Pointsman Operational Setup
              </h4>
              <div style={{ height: '1px', backgroundColor: '#c2e0ff', marginBottom: '16px' }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sdom-modal-field">
                  <label>Reporting Station Master *</label>
                  <input 
                    value={editingUser.reportingSm || ""} 
                    onChange={e => setEditingUser({ ...editingUser, reportingSm: e.target.value })} 
                    placeholder="Station Master Name"
                  />
                </div>
                <div className="sdom-modal-field">
                  <label>Work Location Setup *</label>
                  <select 
                    value={editingUser.workLocation || ""} 
                    onChange={e => setEditingUser({ ...editingUser, workLocation: e.target.value })}
                  >
                    <option value="">Select Location</option>
                    <option value="Yard">Yard Area</option>
                    <option value="Cabin A">Cabin A</option>
                    <option value="Cabin B">Cabin B</option>
                    <option value="Platform Area">Platform Area</option>
                    <option value="Level Crossing Gate">Level Crossing Gate</option>
                  </select>
                </div>
                <div className="sdom-modal-field">
                  <label>Assigned Shift *</label>
                  <select 
                    value={editingUser.shift || ""} 
                    onChange={e => setEditingUser({ ...editingUser, shift: e.target.value })}
                  >
                    <option value="">Select Shift</option>
                    <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                    <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                    <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                    <option value="General Shift (09:00 - 18:00)">General Shift (09:00 - 18:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {editingUser.role === "Train Manager" && (
            <div style={{ padding: 18, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b21a8', margin: '0 0 10px', fontSize: '14px', fontWeight: '800' }}>
                Train Manager Operational Setup
              </h4>
              <div style={{ height: '1px', backgroundColor: '#e9d5ff', marginBottom: '16px' }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sdom-modal-field">
                  <label>Crew Depot *</label>
                  <select 
                    value={editingUser.workLocation || "Nagpur Depot"} 
                    onChange={e => setEditingUser({ ...editingUser, workLocation: e.target.value })}
                  >
                    <option value="Nagpur Depot">Nagpur Depot</option>
                    <option value="Pune Depot">Pune Depot</option>
                    <option value="Mumbai Depot">Mumbai Depot</option>
                    <option value="Solapur Depot">Solapur Depot</option>
                    <option value="Bhusawal Depot">Bhusawal Depot</option>
                  </select>
                </div>
                <div className="sdom-modal-field">
                  <label>Assigned Section Beats *</label>
                  <input 
                    value={editingUser.reportingSm || "NGP-BSL Section"} 
                    onChange={e => setEditingUser({ ...editingUser, reportingSm: e.target.value })} 
                    placeholder="E.g. NGP-BSL, NGP-DURG"
                  />
                </div>
                <div className="sdom-modal-field">
                  <label>Assigned Shift *</label>
                  <select 
                    value={editingUser.shift || "Goods Train Beat"} 
                    onChange={e => setEditingUser({ ...editingUser, shift: e.target.value })}
                  >
                    <option value="Mail/Express Beat">Mail/Express Beat</option>
                    <option value="Passenger Beat">Passenger Beat</option>
                    <option value="Goods Train Beat">Goods Train Beat</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="sdom-modal-actions" style={{ marginTop: 24 }}>
            <button className="sdom-btn-primary" type="submit" style={{ flex: 1 }}>
              🔒 UPDATE USER ACCOUNT
            </button>
            <button className="sdom-btn-ghost" type="button" style={{ flex: 1 }} onClick={() => setEditingUser(null)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderTransferUserModal = () => (
    <div className="sdom-modal-overlay" onClick={e => e.target === e.currentTarget && setTransferringUser(null)}>
      <div className="sdom-modal" style={{ width: "450px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0d2c4d" }}>Transfer Personnel Deployment</h3>
          <button type="button" onClick={() => setTransferringUser(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>&times;</button>
        </div>

        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.4" }}>
          Transfer <strong>{transferringUser.name}</strong> from <strong>{transferringUser.station}</strong> to another station section.
        </p>

        <div className="sdom-modal-field">
          <label>Select Deployment Station</label>
          <select value={transferringUser.targetStation} onChange={e=>setTransferringUser({...transferringUser, targetStation: e.target.value})}>
            {myStations.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
          </select>
        </div>

        <div className="sdom-modal-actions" style={{ marginTop: "24px" }}>
          <button type="button" className="sdom-btn-primary" style={{ flex: 1 }} onClick={confirmTransfer}>Confirm Transfer</button>
          <button type="button" className="sdom-btn-ghost" style={{ flex: 1 }} onClick={() => setTransferringUser(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const renderAddUserModal = () => (
    <div className="sdom-modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddUserModal(false)}>
      <div className="sdom-modal" style={{ width: "900px", maxWidth: "95vw" }}>
        <form onSubmit={handleAddUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
            <div style={{
              background: "linear-gradient(135deg, #0d2c4d 0%, #1e40af 100%)",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(13, 44, 77, 0.2)",
              color: "#ffffff"
            }}>
              <UserPlus size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0d2c4d", letterSpacing: "-0.5px" }}>
                ADD NEW SYSTEM USER
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                Role-Based Operational Staff Provisioning &amp; Management Console
              </p>
            </div>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d2c4d', margin: '0 0 10px', fontSize: '15px', fontWeight: '800' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d2c4d', display: 'inline-block' }}></span>
              1. General &amp; Contact Information
            </h4>
            <div style={{ height: '1px', background: '#d5dfeb', marginBottom: '16px' }}></div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sdom-modal-field">
                <label>Full Name *</label>
                <input 
                  value={newUserData.name || ""} 
                  onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} 
                  placeholder="Enter full name (e.g. A. K. Sharma)" 
                  required
                />
              </div>
              <div className="sdom-modal-field">
                <label>Mobile Number *</label>
                <input 
                  value={newUserData.contact || ""} 
                  onChange={e => setNewUserData({ ...newUserData, contact: e.target.value })} 
                  placeholder="Enter 10-digit mobile number" 
                  required
                />
              </div>
              <div className="sdom-modal-field">
                <label>HRMS ID / Employee ID *</label>
                <input 
                  value={newUserData.id || ""} 
                  onChange={e => setNewUserData({ ...newUserData, id: e.target.value })} 
                  placeholder="Enter unique ID (e.g. PM_8820)" 
                  required
                />
              </div>
              <div className="sdom-modal-field">
                <label>Email ID *</label>
                <input 
                  value={newUserData.email || ""} 
                  onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} 
                  placeholder="Enter email address (e.g. user@rail.in)" 
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d2c4d', margin: '0 0 10px', fontSize: '15px', fontWeight: '800' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d2c4d', display: 'inline-block' }}></span>
              2. Designation &amp; Station Placement Setup
            </h4>
            <div style={{ height: '1px', background: '#d5dfeb', marginBottom: '16px' }}></div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sdom-modal-field">
                <label>Role / Designation *</label>
                <select 
                  value={newUserData.role} 
                  onChange={e => {
                    const selectedRole = e.target.value;
                    const defaultDesig = selectedRole === "Pointsman" ? "Pointsman Grade I" : selectedRole;
                    setNewUserData({ ...newUserData, role: selectedRole, designation: defaultDesig });
                  }}
                  required
                >
                  <option value="Pointsman">Pointsman</option>
                  <option value="Station Master">Station Master</option>
                  <option value="Station Superintendent">Station Superintendent</option>
                  <option value="Train Manager">Train Manager</option>
                </select>
              </div>
              <div className="sdom-modal-field">
                <label>Division *</label>
                <select 
                  value={newUserData.division || "Nagpur"} 
                  onChange={e => setNewUserData({ ...newUserData, division: e.target.value })}
                >
                  {["Nagpur", "Pune", "Mumbai", "Solapur", "Bhusawal"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="sdom-modal-field">
                <label>Railway Zone *</label>
                <select 
                  value={newUserData.zone || "Central Railway"} 
                  onChange={e => setNewUserData({ ...newUserData, zone: e.target.value })}
                >
                  {["Central Railway", "Western Railway", "Northern Railway", "Southern Railway", "Eastern Railway"].map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="sdom-modal-field">
                <label>Station Name *</label>
                <select 
                  value={newUserData.station} 
                  onChange={e => setNewUserData({ ...newUserData, station: e.target.value })}
                  required
                >
                  {myStations.map(s => <option key={s.id} value={s.name}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="sdom-modal-field">
                <label>Category *</label>
                <select 
                  value={newUserData.cat || "A"} 
                  onChange={e => setNewUserData({ ...newUserData, cat: e.target.value })}
                >
                  <option>A</option><option>B</option><option>C</option><option>D</option>
                </select>
              </div>
              <div className="sdom-modal-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>PME Status</label>
                  <select style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={newUserData.pmeStatus} onChange={e => setNewUserData({ ...newUserData, pmeStatus: e.target.value })} required>
                    <option>Fit</option>
                    <option>Unfit</option>
                    <option>Overdue</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>REF Status</label>
                  <select style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={newUserData.refStatus} onChange={e => setNewUserData({ ...newUserData, refStatus: e.target.value })} required>
                    <option>Cleared</option>
                    <option>Pending</option>
                    <option>Expired</option>
                  </select>
                </div>
              </div>
              <div className="sdom-modal-field">
                <label>Joining Date *</label>
                <input 
                  type="date" 
                  value={newUserData.joiningDate || ""} 
                  onChange={e => setNewUserData({ ...newUserData, joiningDate: e.target.value })} 
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Role-Based Custom Operational Profile */}
          {(newUserData.role === "Station Master" || newUserData.role === "Station Superintendent") && (
            <div style={{ padding: 18, background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, marginBottom: 16 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', margin: '0 0 10px', fontSize: '14px', fontWeight: '800' }}>
                {newUserData.role} Operational Setup
              </h4>
              <div style={{ height: '1px', backgroundColor: '#a7f3d0', marginBottom: '16px' }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sdom-modal-field">
                  <label>Operational Station *</label>
                  <select 
                    value={newUserData.smStation || newUserData.station || ""} 
                    onChange={e => setNewUserData({ ...newUserData, smStation: e.target.value, station: e.target.value })}
                  >
                    <option value="">Select Operational Station</option>
                    {myStations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="sdom-modal-field">
                  <label>Operational Zone *</label>
                  <select 
                    value={newUserData.smZone || newUserData.zone || "Central Railway"} 
                    onChange={e => setNewUserData({ ...newUserData, smZone: e.target.value, zone: e.target.value })}
                  >
                    <option value="">Select Zone</option>
                    {["Central Railway", "Western Railway", "Northern Railway", "Southern Railway", "Eastern Railway"].map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className="sdom-modal-field">
                  <label>Operational Division *</label>
                  <select 
                    value={newUserData.smDivision || newUserData.division || "Nagpur"} 
                    onChange={e => setNewUserData({ ...newUserData, smDivision: e.target.value, division: e.target.value })}
                  >
                    <option value="">Select Division</option>
                    {["Nagpur", "Pune", "Mumbai", "Solapur", "Bhusawal"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {newUserData.role === "Pointsman" && (
            <div style={{ padding: 18, background: "#f0f7ff", border: "1px solid #c2e0ff", borderRadius: 10 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d2c4d', margin: '0 0 10px', fontSize: '14px', fontWeight: '800' }}>
                Pointsman Operational Setup
              </h4>
              <div style={{ height: '1px', backgroundColor: '#c2e0ff', marginBottom: '16px' }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sdom-modal-field">
                  <label>Reporting Station Master *</label>
                  <input 
                    value={newUserData.reportingSm || ""} 
                    onChange={e => setNewUserData({ ...newUserData, reportingSm: e.target.value })} 
                    placeholder="Station Master Name"
                  />
                </div>
                <div className="sdom-modal-field">
                  <label>Work Location Setup *</label>
                  <select 
                    value={newUserData.workLocation || ""} 
                    onChange={e => setNewUserData({ ...newUserData, workLocation: e.target.value })}
                  >
                    <option value="">Select Location</option>
                    <option value="Yard">Yard Area</option>
                    <option value="Cabin A">Cabin A</option>
                    <option value="Cabin B">Cabin B</option>
                    <option value="Platform Area">Platform Area</option>
                    <option value="Level Crossing Gate">Level Crossing Gate</option>
                  </select>
                </div>
                <div className="sdom-modal-field">
                  <label>Assigned Shift *</label>
                  <select 
                    value={newUserData.shift || ""} 
                    onChange={e => setNewUserData({ ...newUserData, shift: e.target.value })}
                  >
                    <option value="">Select Shift</option>
                    <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                    <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                    <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                    <option value="General Shift (09:00 - 18:00)">General Shift (09:00 - 18:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {newUserData.role === "Train Manager" && (
            <div style={{ padding: 18, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b21a8', margin: '0 0 10px', fontSize: '14px', fontWeight: '800' }}>
                Train Manager Operational Setup
              </h4>
              <div style={{ height: '1px', backgroundColor: '#e9d5ff', marginBottom: '16px' }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sdom-modal-field">
                  <label>Crew Depot *</label>
                  <select 
                    value={newUserData.workLocation || "Nagpur Depot"} 
                    onChange={e => setNewUserData({ ...newUserData, workLocation: e.target.value })}
                  >
                    <option value="Nagpur Depot">Nagpur Depot</option>
                    <option value="Pune Depot">Pune Depot</option>
                    <option value="Mumbai Depot">Mumbai Depot</option>
                    <option value="Solapur Depot">Solapur Depot</option>
                    <option value="Bhusawal Depot">Bhusawal Depot</option>
                  </select>
                </div>
                <div className="sdom-modal-field">
                  <label>Assigned Section Beats *</label>
                  <input 
                    value={newUserData.reportingSm || "NGP-BSL Section"} 
                    onChange={e => setNewUserData({ ...newUserData, reportingSm: e.target.value })} 
                    placeholder="E.g. NGP-BSL, NGP-DURG"
                  />
                </div>
                <div className="sdom-modal-field">
                  <label>Assigned Shift *</label>
                  <select 
                    value={newUserData.shift || "Goods Train Beat"} 
                    onChange={e => setNewUserData({ ...newUserData, shift: e.target.value })}
                  >
                    <option value="Mail/Express Beat">Mail/Express Beat</option>
                    <option value="Passenger Beat">Passenger Beat</option>
                    <option value="Goods Train Beat">Goods Train Beat</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="sdom-modal-actions" style={{ marginTop: 24 }}>
            <button className="sdom-btn-primary" type="submit" style={{ flex: 1 }}>
              👤 ADD USER ACCOUNT
            </button>
            <button className="sdom-btn-ghost" type="button" style={{ flex: 1 }} onClick={() => setShowAddUserModal(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  /* ─── Content dispatcher ─── */
  const renderBodyContent = () => {
    if (screenMode === "takeTest") return renderTakeTest();
    if (activeNav === "dashboard") return renderDashboardPage();
    if (activeNav === "profile") return renderProfilePage();
    if (activeNav === "myAssessment") return renderMyAssessment();
    if (activeNav === "safety") return renderSafetyPage();
    if (activeNav === "pointsmen") return renderRoleView("Pointsman", "Pointsman");
    if (activeNav === "stationMasters") return renderRoleView("Station Master", "Station Master");
    return renderDashboardPage();
  };

  /* ═══════════════════════════════════════
     SHELL LAYOUT
  ═══════════════════════════════════════ */
  return (
    <div className={`pm-layout ${emergencyActive ? "emergency-glow-active" : ""}`}>
      
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
        <div className="pm-topbar-brand">
          <div className="pm-topbar-logo">IR</div>
          <div>
            <h1>Indian Railway Evaluation Command</h1>
            <p>Operations Workspace: Station Superintendent Module</p>
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
                WARNING: Triggering this broadcast sends an audio warning signal and locks shunting/movement panels on all active Traffic Inspector & Superintendent terminals! Use for genuine safety emergencies only.
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
      {showAddUserModal && renderAddUserModal()}
      {editingUser && renderEditUserModal()}
      {transferringUser && renderTransferUserModal()}
    </div>
  );
}

export default StationSuperintendentModule;


