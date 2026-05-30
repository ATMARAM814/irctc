import { useMemo, useState, useEffect } from "react";
import {
  Activity, AlertTriangle, ArrowUpDown, Award, BarChart3, Building2,
  CheckCircle2, CheckCircle, ChevronRight, ClipboardCheck,
  FileBarChart2, FileCheck, Filter, LogOut, Search, ShieldCheck,
  TrendingUp, TrendingDown, UserCircle2, Users, XCircle, Eye,
  Calendar, BookOpen, Clock, HeartHandshake, HelpCircle, Download,
  FileSpreadsheet, FileText, Bell, Plus, RefreshCw, Edit, Trash2, Lock, Maximize2,
  ArrowLeft, UserCheck, BusFront, ClipboardList, UserPlus, Send, Train, ExternalLink,
  Gauge
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList
} from "recharts";
import "./sdom.css";

/* ═══════════════════════════════════════════
   NAV CONFIG
   (Full 12 Sidebar Menu Items)
═══════════════════════════════════════════ */
const NAV = [
  { key: "dashboard",               label: "Dashboard",                    icon: Gauge },
  { key: "pointsmen",               label: "Pointsmen",                    icon: Users },
  { key: "stationMasters",          label: "Station Masters",              icon: Building2 },
  { key: "stationSuperintendents",  label: "Station Superintendents",      icon: UserCheck },
  { key: "trainManagers",           label: "Train Managers",               icon: BusFront },
  { key: "stations",                label: "Stations",                     icon: Building2 },
  { key: "approvals",               label: "Approvals",                    icon: CheckCircle },
  { key: "assessments",             label: "Assessments",                  icon: FileCheck },
  { key: "pmePosition",             label: "PME Position",                 icon: Activity },
  { key: "refPosition",             label: "REF Position",                 icon: Award },
  { key: "inspections",             label: "Inspections",                  icon: Eye },
  { key: "counselling",             label: "Counselling",                  icon: HeartHandshake },
  { key: "myAssessment",            label: "My Assessment",                icon: FileBarChart2 },
  { key: "reports",                 label: "Reports and Analytics",        icon: BarChart3 },
  { key: "profile",                 label: "My Profile",                   icon: UserCircle2 },
];

const TI_PROFILE = {
  designation: "Traffic Inspector (Safety Officer)",
  jurisdiction: "Parbhani-Amla Section",
  hrmsId: "TI_1001",
  dob: "1985-05-14",
  doa: "2017-04-12",
  pmeDueDate: "2029-08-20",
  pmeDoneDate: "2025-08-20",
  isolatorCertDate: "2026-02-18",
  autoTrainingDate: "2026-03-05",
  counsellingDate: "2026-05-12"
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


/* ═══════════════════════════════════════════
   HELPERS & CATEGORIES
═══════════════════════════════════════════ */
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

const CAT_C  = { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#dc2626" };
const CAT_B  = { A: "#dcfce7", B: "#dbeafe", C: "#fef3c7", D: "#fee2e2" };
const PIE_C  = ["#16a34a", "#2563eb", "#d97706", "#dc2626"];
const RISK_C = { High: "#dc2626", Medium: "#d97706", Low: "#16a34a" };
const RISK_B = { High: "#fee2e2", Medium: "#fef3c7", Low: "#dcfce7" };

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


/* ═══════════════════════════════════════════
   STATIC MOCK DATA — 12 STATIONS
═══════════════════════════════════════════ */
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

const DEFAULT_SS_TM_USERS = [
  // Station Superintendents
  { id: "SS_1001", name: "S. K. Mukherjee", role: "Station Superintendent", designation: "Station Superintendent", station: "Nagpur Junction", cat: "A", lastAssessDate: "2026-04-14", score: 92, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 33001", joiningDate: "2012-05-18" },
  { id: "SS_1002", name: "H. S. Rawat", role: "Station Superintendent", designation: "Station Superintendent", station: "Parbhani Junction", cat: "A", lastAssessDate: "2026-03-22", score: 89, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 33002", joiningDate: "2013-09-10" },
  { id: "SS_1003", name: "Anand Vardhan", role: "Station Superintendent", designation: "Station Superintendent", station: "Akola Junction", cat: "B", lastAssessDate: "2026-02-18", score: 75, pmeStatus: "Fit", refStatus: "Pending", contact: "+91 98765 33003", joiningDate: "2015-11-05" },

  // Train Managers
  { id: "TM_1001", name: "Dilip Kumar", role: "Train Manager", designation: "Train Manager", station: "Nagpur Junction", cat: "A", lastAssessDate: "2026-04-20", score: 90, pmeStatus: "Fit", refStatus: "Cleared", contact: "+91 98765 44001", joiningDate: "2017-06-12" },
  { id: "TM_1002", name: "Vikas Dubey", role: "Train Manager", designation: "Train Manager", station: "Badnera Junction", cat: "B", lastAssessDate: "2026-03-11", score: 78, pmeStatus: "Fit", refStatus: "Pending", contact: "+91 98765 44002", joiningDate: "2019-10-22" },
  { id: "TM_1003", name: "J. P. Nadda", role: "Train Manager", designation: "Train Manager", station: "Amla Junction", cat: "C", lastAssessDate: "2026-01-25", score: 56, pmeStatus: "Pending", refStatus: "Expired", contact: "+91 98765 44003", joiningDate: "2021-04-15" }
];

const MONTHLY = [
  { month: "Nov 25", assessments: 14, avgScore: 72, safetyAvg: 74 },
  { month: "Dec 25", assessments: 18, avgScore: 74, safetyAvg: 76 },
  { month: "Jan 26", assessments: 24, avgScore: 71, safetyAvg: 73 },
  { month: "Feb 26", assessments: 32, avgScore: 77, safetyAvg: 79 },
  { month: "Mar 26", assessments: 38, avgScore: 80, safetyAvg: 82 },
  { month: "Apr 26", assessments: 42, avgScore: 83, safetyAvg: 85 }
];

const INIT_PM_ASSESSMENTS = [
  {
    id: "PA_1001", pointsmanName: "K. Pawar", hrmsId: "PM_1001",
    station: "Parbhani Junction", assessingSM: "S. Deshmukh",
    submissionDate: "2026-04-10", status: "Pending",
    originalSections: [
      { title: "Knowledge of Rules",      score: 20, max: 25 },
      { title: "Alertness & Observation", score: 18, max: 25 },
      { title: "Safety Record",           score: 12, max: 15 },
      { title: "Leadership & Management", score: 11, max: 15 },
      { title: "Discipline",              score: 8,  max: 10 },
      { title: "Appearance & Neatness",   score: 7,  max: 10 },
    ],
    meta: { pmeStatus: "Fit", refStatus: "Cleared", alcoholicStatus: "Non-Alcoholic" },
    tiRemarks: "", tiModified: false, auditTrail: []
  },
  {
    id: "PA_1002", pointsmanName: "R. Verma", hrmsId: "PM_1002",
    station: "Amla Junction", assessingSM: "M. Patil",
    submissionDate: "2026-04-09", status: "Pending",
    originalSections: [
      { title: "Knowledge of Rules",      score: 17, max: 25 },
      { title: "Alertness & Observation", score: 16, max: 25 },
      { title: "Safety Record",           score: 10, max: 15 },
      { title: "Leadership & Management", score: 9,  max: 15 },
      { title: "Discipline",              score: 6,  max: 10 },
      { title: "Appearance & Neatness",   score: 6,  max: 10 },
    ],
    meta: { pmeStatus: "Fit", refStatus: "Pending", alcoholicStatus: "Non-Alcoholic" },
    tiRemarks: "", tiModified: false, auditTrail: []
  },
  {
    id: "PA_1003", pointsmanName: "D. Rane", hrmsId: "PM_1003",
    station: "Amla Junction", assessingSM: "M. Patil",
    submissionDate: "2026-04-08", status: "Pending",
    originalSections: [
      { title: "Knowledge of Rules",      score: 14, max: 25 },
      { title: "Alertness & Observation", score: 13, max: 25 },
      { title: "Safety Record",           score: 8,  max: 15 },
      { title: "Leadership & Management", score: 7,  max: 15 },
      { title: "Discipline",              score: 4,  max: 10 },
      { title: "Appearance & Neatness",   score: 4,  max: 10 },
    ],
    meta: { pmeStatus: "Unfit", refStatus: "Pending", alcoholicStatus: "Alcoholic" },
    tiRemarks: "", tiModified: false, auditTrail: []
  },
  {
    id: "PA_1004", pointsmanName: "J. Shaikh", hrmsId: "PM_1004",
    station: "Badnera Junction", assessingSM: "V. Singh",
    submissionDate: "2026-04-04", status: "Approved",
    originalSections: [
      { title: "Knowledge of Rules",      score: 23, max: 25 },
      { title: "Alertness & Observation", score: 22, max: 25 },
      { title: "Safety Record",           score: 15, max: 15 },
      { title: "Leadership & Management", score: 13, max: 15 },
      { title: "Discipline",              score: 9,  max: 10 },
      { title: "Appearance & Neatness",   score: 9,  max: 10 },
    ],
    finalSections: [
      { title: "Knowledge of Rules",      score: 23, max: 25 },
      { title: "Alertness & Observation", score: 22, max: 25 },
      { title: "Safety Record",           score: 15, max: 15 },
      { title: "Leadership & Management", score: 13, max: 15 },
      { title: "Discipline",              score: 9,  max: 10 },
      { title: "Appearance & Neatness",   score: 9,  max: 10 },
    ],
    meta: { pmeStatus: "Fit", refStatus: "Cleared", alcoholicStatus: "Non-Alcoholic" },
    tiRemarks: "Excellent field performance. Approved as submitted.",
    tiModified: false, approvalDate: "2026-04-05",
    auditTrail: [{ action: "Approved without modification", by: "TI R. Khan", date: "2026-04-05" }]
  },
];

const TI_SM_CRITERIA = [
  { key: "stationMgmt",  label: "Station Management",          weight: 5, count: 5,
    criteria: ["Efficient train handling", "Accurate scheduling", "Staff deployment", "Complaint resolution", "Log maintenance"] },
  { key: "safety",       label: "Safety & Compliance",         weight: 4, count: 5,
    criteria: ["Safety protocols followed", "Incident reporting timely", "Emergency drill conducted", "Hazard identification", "PPE enforced"] },
  { key: "staffSupervision", label: "Staff Supervision",       weight: 3, count: 5,
    criteria: ["Regular briefings conducted", "Feedback provided to staff", "Leave management", "Timekeeping enforced", "Staff morale maintained"] },
  { key: "documentation", label: "Documentation & Reporting",   weight: 3, count: 5,
    criteria: ["Daily log accurate", "Monthly report submitted", "Incident records maintained", "Assessment documents filed", "Handover notes complete"] },
  { key: "emergency",    label: "Emergency Handling",          weight: 5, count: 5,
    criteria: ["Responded to emergencies promptly", "Coordinated with control office", "Passenger management during disruption", "Track clear protocol followed", "Post-incident review done"] },
];

const defaultSMForm = () => ({
  stationMgmt:      Array(5).fill(null),
  safety:           Array(5).fill(null),
  staffSupervision: Array(5).fill(null),
  documentation:    Array(5).fill(null),
  emergency:        Array(5).fill(null),
  knowledgeMarks: "", alcoholicStatus: "", pmeStatus: "Fit",
  refStatus: "Cleared", counselling: "Not Required",
  automaticTraining: "Not Required", remarks: ""
});

const computeSMScore = form => {
  let total = 0;
  TI_SM_CRITERIA.forEach(c => {
    form[c.key].forEach(v => { if (v === "Yes") total += c.weight; });
  });
  const km = Math.min(parseInt(form.knowledgeMarks) || 0, 25);
  return { ynScore: Math.min(total, 75), knowledge: km, total: Math.min(total, 75) + km };
};

const INIT_SM_LIST = [
  { id: "SMA_5001", name: "S. Deshmukh", hrmsId: "SM_1001", station: "Parbhani Junction", lastDate: "2026-03-20", status: "Pending" },
  { id: "SMA_5002", name: "M. Patil",    hrmsId: "SM_2201", station: "Amla Junction",       lastDate: "2026-03-12", status: "Pending" },
  { id: "SMA_5003", name: "V. Singh",    hrmsId: "SM_2301", station: "Badnera Junction",   lastDate: "2026-03-15", status: "Submitted" },
  { id: "SMA_5004", name: "A. Kulkarni", hrmsId: "SM_2102", station: "Parbhani Junction",  lastDate: "2026-02-14", status: "Pending" },
];

const TI_TM_CRITERIA = [
  { key: "trainSafety",  label: "Train Safety & Brake Inspection",   weight: 5, count: 5,
    criteria: ["Brake power certificate verification", "BP/FP pressure gauge monitoring", "Tail lamp/board correctness", "Loose coupling check", "Vigilance control check"] },
  { key: "signaling",    label: "Signaling & Whistle Compliance",    weight: 4, count: 5,
    criteria: ["Hand signal exchange with SM", "Whistling at gate/whistle boards", "Fog signal detonator drill", "Acknowledge route aspects", "Correct flags/lamps display"] },
  { key: "shunting",     label: "Shunting & Coupling Ops",           weight: 3, count: 5,
    criteria: ["Coordinating shunting movement", "Screw/CBC coupling secured", "Hand brake application on sidings", "Point locking verification", "Clearance distance estimation"] },
  { key: "documentation", label: "Train Log & Guard Certificates",  weight: 3, count: 5,
    criteria: ["Train journal logs accurate", "Caution orders noted", "Guard's certificate issued properly", "Rough journal handovers complete", "Incident report log filled"] },
  { key: "emergency",    label: "Emergency Train Protection",        weight: 5, count: 5,
    criteria: ["Flashing amber tail light active", "Detonator protection at 600m/1200m", "Informing control/SM of disruption", "First-aid response coordination", "Track clearance verification"] },
];

const defaultTMForm = () => ({
  trainSafety:      Array(5).fill(null),
  signaling:        Array(5).fill(null),
  shunting:         Array(5).fill(null),
  documentation:    Array(5).fill(null),
  emergency:        Array(5).fill(null),
  knowledgeMarks: "", alcoholicStatus: "", pmeStatus: "Fit",
  refStatus: "Cleared", counselling: "Not Required",
  automaticTraining: "Not Required", remarks: ""
});

const computeTMScore = form => {
  let total = 0;
  TI_TM_CRITERIA.forEach(c => {
    form[c.key]?.forEach(v => { if (v === "Yes") total += c.weight; });
  });
  const km = Math.min(parseInt(form.knowledgeMarks) || 0, 25);
  return { ynScore: Math.min(total, 75), knowledge: km, total: Math.min(total, 75) + km };
};

const INIT_TM_LIST = [
  { id: "TMA_6001", name: "R. P. Yadav", hrmsId: "TM_3001", station: "Nagpur Junction", lastDate: "2026-04-02", status: "Pending" },
  { id: "TMA_6002", name: "S. K. Mishra", hrmsId: "TM_3002", station: "Parbhani Junction", lastDate: "2026-03-25", status: "Pending" },
  { id: "TMA_6003", name: "D. K. Sen", hrmsId: "TM_3003", station: "Badnera Junction", lastDate: "2026-03-18", status: "Submitted" },
  { id: "TMA_6004", name: "A. V. Joshi", hrmsId: "TM_3004", station: "Amla Junction", lastDate: "2026-02-28", status: "Pending" },
];

const INIT_SS_LIST = [
  { id: "SSA_7001", name: "S. K. Mukherjee", hrmsId: "SS_1001", station: "Nagpur Junction",    lastDate: "2026-04-05", status: "Pending" },
  { id: "SSA_7002", name: "H. S. Rawat",     hrmsId: "SS_1002", station: "Parbhani Junction",  lastDate: "2026-03-28", status: "Pending" },
  { id: "SSA_7003", name: "Anand Vardhan",   hrmsId: "SS_1003", station: "Akola Junction",     lastDate: "2026-03-10", status: "Submitted" },
];

const TI_SS_CRITERIA = [
  { key: "stationOps",    label: "Station Operations & Supervision",   weight: 5, count: 5,
    criteria: ["Train reception/dispatch procedures", "Station yard supervision during peak hours", "Platform safety compliance", "Crowd management protocols", "Block instrument operation"] },
  { key: "staffMgmt",    label: "Staff Management & Discipline",       weight: 4, count: 5,
    criteria: ["Duty roster maintenance", "Punctuality and attendance tracking", "Leave management compliance", "Uniform & conduct enforcement", "Safety briefing conduct"] },
  { key: "records",      label: "Records & Documentation",             weight: 3, count: 5,
    criteria: ["Station log book accuracy", "Accident/incident reporting", "Block register maintenance", "Cash and freight register audit", "Train delay reporting"] },
  { key: "safety",       label: "Safety Compliance & Emergency",       weight: 5, count: 5,
    criteria: ["Emergency evacuation drill conduct", "Fire equipment serviceability check", "Signal failure response protocol", "Fog signal deployment knowledge", "Coordination with control office"] },
  { key: "infra",        label: "Infrastructure & Asset Maintenance",  weight: 3, count: 5,
    criteria: ["Platform surface and lighting check", "Footover bridge safety assessment", "Washroom hygiene maintenance", "Waiting room orderliness", "Coach indication board accuracy"] },
];

const defaultSSForm = () => ({
  stationOps:   Array(5).fill(null),
  staffMgmt:    Array(5).fill(null),
  records:      Array(5).fill(null),
  safety:       Array(5).fill(null),
  infra:        Array(5).fill(null),
  knowledgeMarks: "", alcoholicStatus: "", pmeStatus: "Fit",
  refStatus: "Cleared", counselling: "Not Required",
  automaticTraining: "Not Required", remarks: ""
});

const computeSSScore = form => {
  let total = 0;
  TI_SS_CRITERIA.forEach(c => {
    form[c.key]?.forEach(v => { if (v === "Yes") total += c.weight; });
  });
  const km = Math.min(parseInt(form.knowledgeMarks) || 0, 25);
  return { ynScore: Math.min(total, 75), knowledge: km, total: Math.min(total, 75) + km };
};

const INIT_INSPECTIONS = [
  { id: "IN_101", date: "2026-05-10", station: "Amla Junction", officer: "TI R. Khan", observations: "Siding point interlocking operation checked. Satisfactory speed compliance.", risk: "Low", status: "Closed" },
  { id: "IN_102", date: "2026-05-18", station: "Chandrapur Station", officer: "TI R. Khan", observations: "Joint gap clearance in crossing 12B slightly wide. Safety Speed restriction of 15km/h advised.", risk: "Medium", status: "Active" },
  { id: "IN_103", date: "2026-05-24", station: "Akola Junction", officer: "TI R. Khan", observations: "Station Master logs audit. Slight delay in registering daily block clearing times.", risk: "Low", status: "Pending Action" }
];

const INIT_COUNSELLING = [
  { id: "CL_101", date: "2026-05-12", staffName: "D. Rane", designation: "Pointsman Grade II", station: "Amla Junction", topics: "Alcoholic rehabilitation counseling. Safety and alertness briefing.", duration: "45 mins", progress: "Under Monitor" },
  { id: "CL_102", date: "2026-05-20", staffName: "A. Gade", designation: "Pointsman Grade II", station: "Akola Junction", topics: "Periodic medical exam preparation. Rest compliance counseling.", duration: "30 mins", progress: "Completed" }
];

// Interactive quiz questions for self-assessments
const TI_QUIZ = [
  { q: "What whistle code must be sounded when a train is passing through a station without stopping?", opts: ["One long", "Continuous short blasts", "One long and one short", "Two short blasts"], ans: 0, explanation: "One long whistle is sounded to alert station staff, pointsmen, and level crossing gatemen of a train passing through without stopping." },
  { q: "During track circuit failures, what token is issued to authorize train movements into block sections?", opts: ["T/369(3b)", "T/806 (Shunting Order)", "Caution Order (T/B)", "Line Clear Ticket"], ans: 0, explanation: "T/369(3b) is the written authority issued to pass a defective reception stop signal at danger, containing speed restrictions for track anomalies." },
  { q: "Fouling mark lines indicate:", opts: ["Defective rail marker", "Safe distance clearance boundary limit", "Points switching end point", "Speed restrictions end"], ans: 1, explanation: "A fouling mark is placed at the convergence of two tracks, indicating the boundary within which vehicles must remain to avoid collision with traffic on the adjacent line." },
  { q: "Periodic Refresher Courses (REF) for Pointsman Grade I must be completed every:", opts: ["1 Year", "2 Years", "3 Years", "5 Years"], ans: 2, explanation: "Safety refresher training for pointsmen is mandated once every 3 years to ensure operational rule compliance and hands-on skill currency." },
  { q: "A Signal showing double yellow lights warns the driver to:", opts: ["Stop immediately", "Prepare to stop at the next signal", "Proceed at full authorized speed", "Sound whistle continuously"], ans: 1, explanation: "A double yellow aspect is an attention signal, warning the driver that they are approaching a signal showing a restrictive aspect (single yellow or red)." },
  { q: "How often must a Traffic Inspector audit the Station log registers?", opts: ["Weekly", "Monthly", "Quarterly", "Bi-annually"], ans: 1, explanation: "As per the Safety Audit Manual, a Traffic Inspector must perform a thorough physical audit of station logs, books, and registers at least once a month." },
  { q: "During a total failure of communications on double lines, which authority form is issued?", opts: ["T/A 602", "T/B 602", "T/C 602", "T/D 602"], ans: 1, explanation: "Form T/B 602 is the official authority issued to run trains during total failure of communication on a double line section." },
  { q: "What whistle code indicates 'Train Parting'?", opts: ["One long, one short", "Two long, two short", "One long, one short, one long, one short", "Continuous short blasts"], ans: 2, explanation: "One long, one short, one long, one short whistle code is sounded repeatedly to warn the station staff and loco crew of mid-section train parting." },
  { q: "A signal with double yellow aspect warns the driver to:", opts: ["Proceed at full speed", "Prepare to stop at the next signal", "Proceed with 15km/h", "Stop immediately"], ans: 1, explanation: "Prepare to stop at the next signal is indicated by a double yellow attention aspect on the distant signal." },
  { q: "Under normal conditions, a gate signal shows what aspect when the level crossing gate is open to road traffic?", opts: ["Red", "Yellow", "Green", "Double Yellow"], ans: 0, explanation: "A gate signal will show Red (Danger) if the interlocked level crossing gate is open to road traffic, protecting the block section from vehicles." },
  { q: "Refresher training for Pointsman Grade I must be completed every:", opts: ["1 Year", "2 Years", "3 Years", "5 Years"], ans: 2, explanation: "Standard operations manuals require Pointsmen Grade I to undergo refresher safety courses every 3 years." },
  { q: "Periodic medical examinations (PME) for Station Masters must be completed every four years until age:", opts: ["45", "50", "55", "60"], ans: 2, explanation: "Safety-category personnel including Station Masters must undergo a periodic medical examination (PME) every 4 years up to age 55, then every 2 years." },
  { q: "Isolation of a running line from sidings is designed to prevent:", opts: ["Over-speeding", "Collisions due to rolling stock escape", "Signal failures", "Interlocking failures"], ans: 1, explanation: "Siding isolation prevents rolling stock or stalled vehicles from accidentally escaping, rolling out, and fouling the active running lines." },
  { q: "What whistle code is sounded when entering a tunnel?", opts: ["One long blast", "Continuous short blasts", "Two short blasts", "Continuous long whistle"], ans: 3, explanation: "Loco pilots must sound a continuous long whistle when entering and passing through a tunnel to warn any track patrolmen or engineering staff." },
  { q: "Fuses or detonators are used to protect track defects at a distance of:", opts: ["600m and 1200m", "500m and 1000m", "800m and 2000m", "1200m and 2000m"], ans: 0, explanation: "In case of track obstruction, 3 detonators are placed: 1st at 600m, 2nd at 1200m, and the 3rd at 1210m to warn oncoming train crews." },
  { q: "What class of station has points and signals interlocked, enabling line clear exchange?", opts: ["Class A", "Class B", "Class C", "Non-interlocked"], ans: 1, explanation: "Class B stations are standard interlocked block stations equipped with home and starter signals, authorizing Line Clear exchange." },
  { q: "The standard shunting authority form is:", opts: ["T/369(3b)", "T/806", "T/A 901", "T/511"], ans: 1, explanation: "Form T/806 is the official shunting order, listing all authorized shunt movements, point locks, and speed restrictions." },
  { q: "If a Station Master detects a hot axle on a passing train, they must first:", opts: ["Call the division control office", "Display danger hand signal and stop the train", "Inform the next station", "Log the event"], ans: 1, explanation: "Safety protocols dictate that the Station Master must immediately exhibit a danger hand signal to stop the train and prevent axle failure or derailment." },
  { q: "The maximum speed under 'Caution Order' when no speed limit is specified is:", opts: ["15 km/h", "30 km/h", "45 km/h", "20 km/h"], ans: 0, explanation: "If no specific speed limit is written on a Caution Order, the standard maximum speed is restricted to 15 km/h for track inspection beats." },
  { q: "Which class of station serves strictly as a block hut without point switches?", opts: ["Class A", "Class B", "Class C", "Class D"], ans: 2, explanation: "Class C block stations (or block huts) do not have point switches or loop lines, serving strictly as intermediate block boundaries." },
  { q: "Who is responsible for point locking during shunting operations?", opts: ["Pointsman", "Station Master", "Cabin Master", "Train Manager"], ans: 1, explanation: "The Station Master on duty is ultimately responsible for ensuring that facing points are locked and clamped during shunting operations." },
  { q: "A flashing red aspect on a signal indicates:", opts: ["Track circuit defect", "Proceed with caution", "Stop and proceed after 1 min", "Gate signal alert"], ans: 2, explanation: "A flashing red light or 'Danger' aspect indicates that the driver must stop the train and can proceed after waiting 1 minute by day/2 minutes by night." },
  { q: "A trap point isolation is used to protect:", opts: ["Passenger platform lines", "Running lines from siding vehicles", "Level crossings", "Relay room locking"], ans: 1, explanation: "Trap points derail an escaping vehicle or siding vehicle to prevent it from fouling or colliding with trains running on the main line." },
  { q: "Refresher training for Traffic Inspectors must be completed every:", opts: ["3 Years", "5 Years", "2 Years", "None"], ans: 0, explanation: "Periodic training courses for Traffic Inspectors are conducted once every 3 years to maintain proficiency in safety, engineering, and operating rules." },
  { q: "During block instrument failure, line clear is authorized using:", opts: ["Token", "Paper Line Clear Ticket", "Cabin ticket", "Hand signal"], ans: 1, explanation: "A Paper Line Clear Ticket (PLCT) is the written authority issued to proceed when block instruments fail, ensuring absolute block safety." }
];

function generateTiMockResponses(score) {
  const correctCount = Math.round((score / 100) * 25);
  const arr = Array(25).fill(null);
  const indices = Array.from({ length: 25 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const correctIndices = new Set(indices.slice(0, correctCount));
  for (let i = 0; i < 25; i++) {
    const q = TI_QUIZ[i];
    if (correctIndices.has(i)) {
      arr[i] = q.ans;
    } else {
      arr[i] = (q.ans + 1) % q.opts.length;
    }
  }
  return arr;
}

const getPerformanceSummaryText = (score, sections) => {
  if (!sections || sections.length === 0) return "Self-compliance check completed successfully.";
  const lowestSec = [...sections].sort((a, b) => a.marks - b.marks)[0];
  const highestSec = [...sections].sort((a, b) => b.marks - a.marks)[0];

  let summary = `Assessment score achieved: ${score}/100 (${score >= 80 ? 'Outstanding Competency' : score >= 50 ? 'Satisfactory Operations' : 'Requires Training'}). `;
  summary += `Demonstrated excellent compliance in "${highestSec.title}" scoring ${highestSec.marks}/${highestSec.outOf} marks. `;
  if (lowestSec.marks < lowestSec.outOf) {
    summary += `However, some area of improvement is observed in "${lowestSec.title}" (${lowestSec.marks}/${lowestSec.outOf}). It is recommended to review the standard operating manuals and safety bulletins for this section.`;
  } else {
    summary += `Achieved perfect scores across all compliance parameters.`;
  }
  return summary;
};

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

const INIT_TI_ASSESS_HISTORY = [
  {
    id: 1, date: "2026-03-20", period: "Q1 2026", assessedBy: "AOM_GM_1001 — P. Joshi",
    totalScore: 88, category: "A", approvalStatus: "Approved",
    aomRemarks: "Outstanding supervisory performance. Excellent cross-station coordination.",
    sections: [
      { title: "Whistle Codes & Hand Signals",          marks: 18, outOf: 20 },
      { title: "Token & Line Clear Authorities",        marks: 17, outOf: 20 },
      { title: "Station Interlocking & Track Circuits", marks: 18, outOf: 20 },
      { title: "Shunting Operations & Point Locking",   marks: 17, outOf: 20 },
      { title: "Gate Signals & Siding Isolation",        marks: 18, outOf: 20 },
    ],
    userAnswers: generateTiMockResponses(88)
  },
  {
    id: 2, date: "2025-12-15", period: "Q4 2025", assessedBy: "AOM_GM_1001 — P. Joshi",
    totalScore: 81, category: "A", approvalStatus: "Approved",
    aomRemarks: "Good performance. Minor issues in documentation speed.",
    sections: [
      { title: "Whistle Codes & Hand Signals",          marks: 16, outOf: 20 },
      { title: "Token & Line Clear Authorities",        marks: 16, outOf: 20 },
      { title: "Station Interlocking & Track Circuits", marks: 17, outOf: 20 },
      { title: "Shunting Operations & Point Locking",   marks: 15, outOf: 20 },
      { title: "Gate Signals & Siding Isolation",        marks: 17, outOf: 20 },
    ],
    userAnswers: generateTiMockResponses(81)
  },
  {
    id: 3, date: "2025-09-10", period: "Q3 2025", assessedBy: "AOM_GM_1001 — P. Joshi",
    totalScore: 93, category: "A", approvalStatus: "Approved",
    aomRemarks: "Exemplary. Best performing TI in the division this quarter.",
    sections: [
      { title: "Whistle Codes & Hand Signals",          marks: 19, outOf: 20 },
      { title: "Token & Line Clear Authorities",        marks: 18, outOf: 20 },
      { title: "Station Interlocking & Track Circuits", marks: 19, outOf: 20 },
      { title: "Shunting Operations & Point Locking",   marks: 18, outOf: 20 },
      { title: "Gate Signals & Siding Isolation",        marks: 19, outOf: 20 },
    ],
    userAnswers: generateTiMockResponses(93)
  }
];


/* ═══════════════════════════════════════════
   CUSTOM TOOLTIP
═══════════════════════════════════════════ */
const TiTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ti2-tooltip">
      <strong>{label}</strong>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN MODULE COMPONENT
═══════════════════════════════════════════ */

const generateGraphCompleteData = (baseUsers, baseStations) => {
  const stationsList = baseStations || INIT_STATIONS;
  const usersList = [...(baseUsers || INIT_USERS)];
  
  const hasSS = usersList.some(u => u.role === "Station Superintendent");
  if (!hasSS) {
    usersList.push(...DEFAULT_SS_TM_USERS);
  }

  const names = [
    "Rahul Sharma", "Amit Patel", "Vikram Singh", "Sanjay Dutt", "Vijay Kumar",
    "Rohan Gupta", "Deepak Rao", "Karan Johar", "Abhishek Shah", "Manish Pandey",
    "Suresh Raina", "Girish Karnad", "Pranav Mukherji", "Shantanu Sen", "Animesh Roy"
  ];

  const designations = {
    "Pointsman": "Pointsman Grade I",
    "Station Master": "Station Master",
    "Station Superintendent": "Station Superintendent",
    "Train Manager": "Train Manager"
  };

  const categories = ["A", "B", "C"];
  let userCounter = 2000;

  stationsList.forEach((st, sidx) => {
    const roles = ["Pointsman", "Station Master", "Station Superintendent", "Train Manager"];
    roles.forEach(role => {
      const exists = usersList.some(u => u.station === st.name && u.role === role);
      if (!exists) {
        const id = (role === "Pointsman" ? "PM_" : role === "Station Master" ? "SM_" : role === "Station Superintendent" ? "SS_" : "TM_") + userCounter++;
        const nameIdx = (sidx + role.length) % names.length;
        const name = names[nameIdx] + " (" + st.code + ")";
        const cat = categories[userCounter % categories.length];
        
        usersList.push({
          id,
          name,
          role,
          designation: designations[role],
          station: st.name,
          cat,
          lastAssessDate: `2026-03-${10 + (userCounter % 15)}`,
          score: 65 + (userCounter % 30),
          pmeStatus: "Fit",
          refStatus: "Cleared",
          contact: `+91 98765 ${userCounter}`,
          joiningDate: `2018-05-${12 + (userCounter % 15)}`
        });
      }
    });
  });

  return usersList;
};

const generateAssessmentsForGraphs = (usersList, stationsList) => {
  const pmAssess = [];
  const smAssess = [];
  const ssAssess = [];
  const tmAssess = [];

  stationsList.forEach((st, sidx) => {
    // 1. Pointsman Assessments (1 Approved, 1 Pending for each station)
    const stPMs = usersList.filter(u => u.station === st.name && u.role === "Pointsman");
    stPMs.forEach((pm, pidx) => {
      const isApproved = pidx % 2 === 0;
      pmAssess.push({
        id: `PA_${pm.id}`,
        pointsmanName: pm.name,
        hrmsId: pm.id,
        station: st.name,
        assessingSM: `SM at ${st.code}`,
        submissionDate: `2026-04-${10 + pidx}`,
        status: isApproved ? "Approved" : "Pending",
        originalSections: [
          { title: "Knowledge of Rules",      score: 18 + (pidx % 6), max: 25 },
          { title: "Alertness & Observation", score: 18 + (pidx % 6), max: 25 },
          { title: "Safety Record",           score: 10 + (pidx % 4), max: 15 },
          { title: "Leadership & Management", score: 10 + (pidx % 4), max: 15 },
          { title: "Discipline",              score: 7 + (pidx % 3),  max: 10 },
          { title: "Appearance & Neatness",   score: 7 + (pidx % 3),  max: 10 },
        ],
        finalSections: isApproved ? [
          { title: "Knowledge of Rules",      score: 18 + (pidx % 6), max: 25 },
          { title: "Alertness & Observation", score: 18 + (pidx % 6), max: 25 },
          { title: "Safety Record",           score: 10 + (pidx % 4), max: 15 },
          { title: "Leadership & Management", score: 10 + (pidx % 4), max: 15 },
          { title: "Discipline",              score: 7 + (pidx % 3),  max: 10 },
          { title: "Appearance & Neatness",   score: 7 + (pidx % 3),  max: 10 },
        ] : undefined,
        meta: { pmeStatus: "Fit", refStatus: "Cleared", alcoholicStatus: "Non-Alcoholic" },
        tiRemarks: isApproved ? "Field assessment approved successfully." : "",
        tiModified: false,
        approvalDate: isApproved ? "2026-04-12" : undefined,
        auditTrail: isApproved ? [{ action: "Approved without modification", by: "TI R. Khan", date: "2026-04-12" }] : []
      });
    });

    // 2. SM Assessment (1 Pending or Submitted per station)
    const stSMs = usersList.filter(u => u.station === st.name && u.role === "Station Master");
    stSMs.forEach((sm, smidx) => {
      const status = smidx % 2 === 0 ? "Pending" : "Submitted";
      smAssess.push({
        id: `SMA_${sm.id}`,
        name: sm.name,
        hrmsId: sm.id,
        station: st.name,
        lastDate: `2026-03-${15 + smidx}`,
        status
      });
    });

    // 3. SS Assessment (1 Pending or Submitted per station)
    const stSSs = usersList.filter(u => u.station === st.name && u.role === "Station Superintendent");
    stSSs.forEach((ss, ssidx) => {
      const status = ssidx % 2 === 0 ? "Pending" : "Submitted";
      ssAssess.push({
        id: `SSA_${ss.id}`,
        name: ss.name,
        hrmsId: ss.id,
        station: st.name,
        lastDate: `2026-04-${5 + ssidx}`,
        status
      });
    });

    // 4. TM Assessment (1 Pending or Submitted per station)
    const stTMs = usersList.filter(u => u.station === st.name && u.role === "Train Manager");
    stTMs.forEach((tm, tmidx) => {
      const status = tmidx % 2 === 0 ? "Pending" : "Submitted";
      tmAssess.push({
        id: `TMA_${tm.id}`,
        name: tm.name,
        hrmsId: tm.id,
        station: st.name,
        lastDate: `2026-03-${20 + tmidx}`,
        status
      });
    });
  });

  return { pmAssess, smAssess, ssAssess, tmAssess };
};

const POPULATED_USERS = generateGraphCompleteData(INIT_USERS, INIT_STATIONS);
const { pmAssess: POPULATED_PM, smAssess: POPULATED_SM, ssAssess: POPULATED_SS, tmAssess: POPULATED_TM } = generateAssessmentsForGraphs(POPULATED_USERS, INIT_STATIONS);

export default function TrafficInspectorModule({ user, onLogout }) {
  const [activePage, setActivePage]       = useState("dashboard");
  // Dynamic Graph Completer V3 Migration Block
  if (localStorage.getItem("ti_data_graph_complete_v3") !== "true") {
    localStorage.setItem("ti_users", JSON.stringify(POPULATED_USERS));
    localStorage.setItem("ti_sm_list", JSON.stringify(POPULATED_SM));
    localStorage.setItem("ti_tm_list", JSON.stringify(POPULATED_TM));
    localStorage.setItem("ti_ss_list", JSON.stringify(POPULATED_SS));
    localStorage.setItem("ti_data_graph_complete_v3", "true");
  }


  const [statusMsg, setStatusMsg]         = useState("");
  const [view, setView]                   = useState(null);

  // Chart Zoom Modal States
  const [isChartZoomModalOpen, setIsChartZoomModalOpen] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState("progress"); // "progress" | "score" | "category"
  const [zoomPopupPage, setZoomPopupPage] = useState(1);
  const [zoomPopupSearch, setZoomPopupSearch] = useState("");
  const [zoomPopupZone, setZoomPopupZone] = useState("All");
  const [zoomPopupDivision, setZoomPopupDivision] = useState("All");
  const [zoomPopupStationName, setZoomPopupStationName] = useState("All");
  const [zoomPopupStationCode, setZoomPopupStationCode] = useState("All");
  const [zoomPopupCategory, setZoomPopupCategory] = useState("All");
  const [zoomPopupRisk, setZoomPopupRisk] = useState("All");
  const [zoomPopupStatus, setZoomPopupStatus] = useState("All");
  const [zoomPopupStartDate, setZoomPopupStartDate] = useState("");
  const [zoomPopupEndDate, setZoomPopupEndDate] = useState("");

  // Fullscreen Analytics States
  const [fullscreenChart, setFullscreenChart] = useState(null); // 'station' | 'trend' | 'grade' | null
  const [fsSearch, setFsSearch] = useState("");
  const [fsCatFilter, setFsCatFilter] = useState("All");
  const [fsRiskFilter, setFsRiskFilter] = useState("All");

  // Notifications Bell
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "danger", message: "CRITICAL: PME overdue for SM P. Wankhede (Akola Junction)", time: "Just now", read: false },
    { id: 2, type: "warning", message: "Safety alert: Joint gap crack observed at Chandrapur Crossing 12B", time: "2 hours ago", read: false },
    { id: 3, type: "success", message: "Audit cleared: Parbhani Junction monthly logs verified.", time: "1 day ago", read: true }
  ]);

  // System Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, timestamp: "2026-05-27 10:00:12", event: "User session initialized.", details: "IP: 10.24.12.8" },
    { id: 2, timestamp: "2026-05-27 10:02:44", event: "Dashboard KPI matrices synced successfully.", details: "Calculations based on 12 stations" }
  ]);

  // Master Users & Stations States
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("ti_users");
    const initialList = saved ? JSON.parse(saved) : POPULATED_USERS;
    const hasSS = initialList.some(u => u.role === "Station Superintendent");
    if (!hasSS) {
      return [...initialList, ...DEFAULT_SS_TM_USERS];
    }
    return initialList;
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

  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [newStationData, setNewStationData] = useState({ name: "", code: "" });

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

  const [pmList, setPmList]               = useState(POPULATED_PM);
  const [smList, setSmList]               = useState(() => {
    const saved = localStorage.getItem("ti_sm_list");
    return saved ? JSON.parse(saved) : POPULATED_SM;
  });
  useEffect(() => {
    localStorage.setItem("ti_sm_list", JSON.stringify(smList));
  }, [smList]);

  const [tmList, setTmList]               = useState(() => {
    const saved = localStorage.getItem("ti_tm_list");
    return saved ? JSON.parse(saved) : POPULATED_TM;
  });
  useEffect(() => {
    localStorage.setItem("ti_tm_list", JSON.stringify(tmList));
  }, [tmList]);

  useEffect(() => {
    // Migration: automatically update any references of SM_2101 to SM_1001 in localStorage
    const savedUsers = localStorage.getItem("ti_users");
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        let changed = false;
        const updated = parsed.map(u => {
          if (u.id === "SM_2101") {
            changed = true;
            return { ...u, id: "SM_1001" };
          }
          return u;
        });
        if (changed) {
          localStorage.setItem("ti_users", JSON.stringify(updated));
          setUsers(updated);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const savedSmList = localStorage.getItem("ti_sm_list");
    if (savedSmList) {
      try {
        const parsed = JSON.parse(savedSmList);
        let changed = false;
        const updated = parsed.map(s => {
          if (s.hrmsId === "SM_2101") {
            changed = true;
            return { ...s, hrmsId: "SM_1001" };
          }
          return s;
        });
        if (changed) {
          localStorage.setItem("ti_sm_list", JSON.stringify(updated));
          setSmList(updated);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [inspections, setInspections]     = useState(INIT_INSPECTIONS);
  const [counsellings, setCounsellings]   = useState(INIT_COUNSELLING);
  
  // Interactive Self-Assessment State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tiAssessments, setTiAssessments] = useState(() => {
    const saved = localStorage.getItem("ti_assessments");
    let history = saved ? JSON.parse(saved) : INIT_TI_ASSESS_HISTORY;
    let changed = false;
    history = history.map(item => {
      if (!item.userAnswers) {
        changed = true;
        return {
          ...item,
          userAnswers: generateTiMockResponses(item.totalScore)
        };
      }
      return item;
    });
    if (changed) {
      localStorage.setItem("ti_assessments", JSON.stringify(history));
    }
    return history;
  });
  useEffect(() => {
    localStorage.setItem("ti_assessments", JSON.stringify(tiAssessments));
  }, [tiAssessments]);

  const [quizState, setQuizState]         = useState("idle"); // "idle" | "quiz" | "result"
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers]     = useState(Array(25).fill(null));
  const [latestQuizScore, setLatestQuizScore] = useState(null);

  // AOM Assigned Exam State
  const [isExamAssigned, setIsExamAssigned] = useState(() => localStorage.getItem("ti_exam_assigned") === "true");

  // Search, Filters & Expanded Blocks
  const [selectedReportUserId, setSelectedReportUserId] = useState(null);
  const [selectedSM, setSelectedSM]       = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stSearch, setStSearch]           = useState("");
  const [stCatFilter, setStCatFilter]     = useState("All");
  
  // All Users Page Controls
  const [userSearch, setUserSearch]       = useState("");
  const [userStationFilter, setUserStationFilter] = useState("All");
  const [userDesignationFilter, setUserDesignationFilter] = useState("All");
  const [userCategoryFilter, setUserCategoryFilter] = useState("All");
  const [userRiskFilter, setUserRiskFilter] = useState("All");
  const [roleF, setRoleF] = useState({ name: "", station: "All", ti: "All", cat: "All", risk: "All" });
  
  // Edit User Modal State
  const [editingUser, setEditingUser]     = useState(null);
  const [transferringUser, setTransferringUser] = useState(null);

  // PM Review Page States
  const [reviewTab, setReviewTab]         = useState("Pending");
  const [reviewSearch, setReviewSearch]   = useState("");
  const [reviewStation, setReviewStation] = useState("All");
  const [selectedPmId, setSelectedPmId]   = useState(null);
  const [editSections, setEditSections]   = useState({});
  const [tiRemarks, setTiRemarks]         = useState({});
  const [showAudit, setShowAudit]         = useState({});
  const [rejectMode, setRejectMode]       = useState({});

  // SM Assess States
  const [activeSmId, setActiveSmId]       = useState(null);
  const [smForms, setSmForms]             = useState(() => {
    const saved = localStorage.getItem("ti_sm_forms");
    return saved ? JSON.parse(saved) : {};
  });
  useEffect(() => {
    localStorage.setItem("ti_sm_forms", JSON.stringify(smForms));
  }, [smForms]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUsers = localStorage.getItem("ti_users");
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedStations = localStorage.getItem("ti_stations");
      if (savedStations) setStations(JSON.parse(savedStations));

      const savedSmList = localStorage.getItem("ti_sm_list");
      if (savedSmList) setSmList(JSON.parse(savedSmList));

      const savedSmForms = localStorage.getItem("ti_sm_forms");
      if (savedSmForms) setSmForms(JSON.parse(savedSmForms));

      setIsExamAssigned(localStorage.getItem("ti_exam_assigned") === "true");
    };
    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(() => {
      const current = localStorage.getItem("ti_exam_assigned") === "true";
      setIsExamAssigned(current);
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [smLocked, setSmLocked]           = useState({});

  // TM Assess States
  const [activeTmId, setActiveTmId]       = useState(null);
  const [tmForms, setTmForms]             = useState(() => {
    const saved = localStorage.getItem("ti_tm_forms");
    return saved ? JSON.parse(saved) : {};
  });
  useEffect(() => {
    localStorage.setItem("ti_tm_forms", JSON.stringify(tmForms));
  }, [tmForms]);
  const [tmLocked, setTmLocked]           = useState({});

  // Station Superintendent assessment state
  const [ssList, setSsList]               = useState(() => {
    const saved = localStorage.getItem("ti_ss_list");
    return saved ? JSON.parse(saved) : POPULATED_SS;
  });
  useEffect(() => {
    localStorage.setItem("ti_ss_list", JSON.stringify(ssList));
  }, [ssList]);
  const [ssForms, setSsForms]             = useState(() => {
    const saved = localStorage.getItem("ti_ss_forms");
    return saved ? JSON.parse(saved) : {};
  });
  useEffect(() => {
    localStorage.setItem("ti_ss_forms", JSON.stringify(ssForms));
  }, [ssForms]);
  const [ssLocked, setSsLocked]           = useState({});
  const [activeSsId, setActiveSsId]       = useState(null);

  // Unified Assessments page sub-state
  const [assessRole, setAssessRole]       = useState(null); // "SM" | "SS" | "TM"
  const [rosterSearch, setRosterSearch]   = useState("");
  const [rosterStation, setRosterStation] = useState("All");
  const [rosterStatus, setRosterStatus]   = useState("All");
  const [rosterDate, setRosterDate]       = useState("");

  const [repF, setRepF] = useState({ search: "", role: "All", station: "All", cat: "All", risk: "All" });
  const [repApplied, setRepApplied] = useState(false);

  useEffect(() => {
    if (activeSmId) {
      const smAssess = smList.find(s => s.id === activeSmId);
      if (smAssess && smAssess.examScore !== undefined) {
        setSmForms(prev => {
          const existing = prev[activeSmId];
          if (existing && existing.knowledgeMarks !== smAssess.examScore.toString()) {
            return {
              ...prev,
              [activeSmId]: {
                ...existing,
                knowledgeMarks: smAssess.examScore.toString()
              }
            };
          }
          return prev;
        });
      }
    }
  }, [smList, activeSmId]);

  // Reports Filters
  const [rpStation, setRpStation]         = useState("All");
  const [rpCat, setRpCat]                 = useState("All");
  const [rpRisk, setRpRisk]               = useState("All");
  const [rpSearch, setRpSearch]           = useState("");
  const [rpSort, setRpSort]               = useState("date-desc");

  // Inspections / Counselling forms
  const [showInspForm, setShowInspForm]   = useState(false);
  const [newInsp, setNewInsp]             = useState({ station: "Parbhani Junction", officer: "TI R. Khan", observations: "", risk: "Low" });
  const [showCounForm, setShowCounForm]   = useState(false);
  const [newCoun, setNewCoun]             = useState({ staffName: "", designation: "Pointsman Grade I", station: "Parbhani Junction", topics: "", duration: "30 mins", progress: "Under Monitor" });

  // Dashboard filtering & scroll toggle
  const [dbStationFilter, setDbStationFilter] = useState("All");
  const [dbSearchQuery, setDbSearchQuery] = useState("");

  const tiName = user?.name  || "R. Khan";
  const tiId   = user?.hrmsId || "TI_1001";

  const myStations = useMemo(() => {
    return stations.filter(st => !st.assignedTi || st.assignedTi === tiId);
  }, [stations, tiId]);

  const handleAddStationSubmit = (e) => {
    e.preventDefault();
    if (!newStationData.name.trim() || !newStationData.code.trim()) {
      setStatusMsg("Station name and code are required.");
      return;
    }
    const codeUpper = newStationData.code.trim().toUpperCase();
    if (stations.some(st => st.code.toUpperCase() === codeUpper)) {
      setStatusMsg(`Station with code ${codeUpper} already exists!`);
      return;
    }
    const newStation = {
      id: "ST_" + Date.now(),
      name: newStationData.name.trim(),
      code: codeUpper,
      avgScore: 80,
      safetyPct: 100,
      highRisk: 0,
      pointsmenCount: 0,
      assignedTi: tiId
    };
    setStations(prev => [...prev, newStation]);
    setShowAddStationModal(false);
    setNewStationData({ name: "", code: "" });
    setStatusMsg(`Station "${newStation.name}" successfully added under your jurisdiction.`);
    addAuditLog("Added New Station", `Station: ${newStation.name} (${newStation.code})`);
    triggerNotification("success", `Added Station: ${newStation.name} (${newStation.code})`);
  };

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
      setStatusMsg("Please fill out all required fields.");
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
      setStatusMsg(`User with Employee ID ${finalId} already exists!`);
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
    
    setStatusMsg(`Personnel "${newUser.name}" successfully added and rostered.`);
    addAuditLog("Added New User", `Staff: ${newUser.name} (${newUser.id})`);
    triggerNotification("success", `Added Staff: ${newUser.name} (${newUser.id})`);
  };

  // Trigger Notifications & Audit Logs Helper
  const triggerNotification = (type, message) => {
    setNotifications(prev => [{ id: Date.now(), type, message, time: "Just now", read: false }, ...prev]);
  };

  const addAuditLog = (event, details) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAuditLogs(prev => [{ id: Date.now(), timestamp, event, details }, ...prev]);
  };

  const exportAlert = (format, filename) => {
    alert(`✓ EXPORT COMPLETE: Dataset "${filename}" exported successfully in ${format} format to your local downloads directory.`);
    addAuditLog("Report Exported", `File: ${filename}.${format.toLowerCase()}`);
    triggerNotification("success", `Report "${filename}" exported safely.`);
  };

  /* ── Derived calculations ── */
  const myUsers = useMemo(() => {
    return users.filter(u => myStations.some(st => st.name === u.station));
  }, [users, myStations]);

  const myPmList = useMemo(() => {
    return pmList.filter(p => myStations.some(st => st.name === p.station));
  }, [pmList, myStations]);

  const mySmList = useMemo(() => {
    return smList.filter(s => myStations.some(st => st.name === s.station));
  }, [smList, myStations]);

  const myTmList = useMemo(() => {
    return tmList.filter(t => myStations.some(st => st.name === t.station));
  }, [tmList, myStations]);

  const totalPM     = myUsers.filter(u => u.role === "Pointsman").length;
  const totalSMs    = myUsers.filter(u => u.role === "Station Master").length;
  const pending     = myPmList.filter(p=>p.status==="Pending").length;
  const highRiskAll = myUsers.filter(u => u.pmeStatus === "Overdue" || u.refStatus === "Expired" || u.score < 50).length;
  const avgScoreAll = Math.round(myUsers.reduce((s, u) => s + u.score, 0) / (myUsers.length || 1));

  // Station level scores derived dynamically from user database!
  const stationStats = useMemo(() => {
    return myStations.map(st => {
      const stUsers = users.filter(u => u.station === st.name);
      const avg = stUsers.length ? Math.round(stUsers.reduce((s, u) => s + u.score, 0) / stUsers.length) : st.avgScore;
      const riskCount = stUsers.filter(u => u.pmeStatus === "Overdue" || u.refStatus === "Expired" || u.score < 50).length;
      return {
        ...st,
        avgScore: avg,
        highRisk: riskCount,
        safetyPct: Math.max(50, Math.min(100, 100 - (riskCount * 12)))
      };
    });
  }, [myStations, users]);

  const bestSt  = [...stationStats].sort((a,b)=>b.avgScore-a.avgScore)[0];
  const worstSt = [...stationStats].sort((a,b)=>a.avgScore-b.avgScore)[0];
  const highRiskSt = [...stationStats].sort((a,b)=>b.highRisk-a.highRisk)[0];

  const filteredStations = useMemo(() => {
    return stationStats.filter(st => {
      const matchesSearch = st.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) || st.code.toLowerCase().includes(dbSearchQuery.toLowerCase());
      const matchesFilter = dbStationFilter === "All" || st.name === dbStationFilter;
      return matchesSearch && matchesFilter;
    });
  }, [stationStats, dbSearchQuery, dbStationFilter]);

  const stBarData = filteredStations.map(st=>({ name:st.code, nameFull: st.name, avgScore:st.avgScore, safetyPct:st.safetyPct, highRisk:st.highRisk }));

  const pieData = useMemo(()=>{
    const c = { A: 0, B: 0, C: 0, D: 0 };
    myUsers.forEach(u => {
      const cat = u.cat || getCat(u.score);
      if (c[cat] !== undefined) {
        c[cat]++;
      }
    });
    return Object.entries(c).map(([name,value])=>({name,value}));
  }, [myUsers]);

  const myStationsProgress = useMemo(() => {
    return myStations.map(st => {
      const pmCompleted = myPmList.filter(p => p.station === st.name && p.status === "Approved").length;
      const pmPending = myPmList.filter(p => p.station === st.name && p.status === "Pending").length;
      
      const smCompleted = mySmList.filter(s => s.station === st.name && (s.status === "Submitted" || s.status === "Approved")).length;
      const smPending = mySmList.filter(s => s.station === st.name && s.status === "Pending").length;
      
      const ssCompleted = ssList.filter(s => s.station === st.name && (s.status === "Submitted" || s.status === "Approved")).length;
      const ssPending = ssList.filter(s => s.station === st.name && s.status === "Pending").length;

      const tmCompleted = myTmList.filter(t => t.station === st.name && (t.status === "Submitted" || t.status === "Approved")).length;
      const tmPending = myTmList.filter(t => t.station === st.name && t.status === "Pending").length;

      return {
        name: st.code,
        completed: pmCompleted + smCompleted + ssCompleted + tmCompleted,
        pending: pmPending + smPending + ssPending + tmPending
      };
    });
  }, [myStations, myPmList, mySmList, ssList, myTmList]);

  const roleBarData = useMemo(() => {
    const pmCount = myUsers.filter(u => u.role === "Pointsman").length;
    const smCount = myUsers.filter(u => u.role === "Station Master").length;
    const ssCount = myUsers.filter(u => u.role === "Station Superintendent").length;
    const tmCount = myUsers.filter(u => u.role === "Train Manager").length;

    return [
      { role: "Pointsmen", count: pmCount },
      { role: "Station Masters", count: smCount },
      { role: "Station Superintendents", count: ssCount },
      { role: "Train Managers", count: tmCount }
    ];
  }, [myUsers]);

  const myCompliance = useMemo(() => {
    const overallSafetyPct = myStations.length ? Math.round(stationStats.reduce((s, st) => s + st.safetyPct, 0) / myStations.length) : 0;
    const pmeFitCount = myUsers.filter(u => u.pmeStatus === "Fit").length;
    const pmeCompletionRate = myUsers.length ? Math.round((pmeFitCount / myUsers.length) * 100) : 0;
    const refClearedCount = myUsers.filter(u => u.refStatus === "Cleared").length;
    const refCompletionRate = myUsers.length ? Math.round((refClearedCount / myUsers.length) * 100) : 0;

    return [
      { label: "Overall Safety Compliance", pct: overallSafetyPct, color: "#16a34a" },
      { label: "PME Completion Rate", pct: pmeCompletionRate, color: "#2563eb" },
      { label: "REF Completion Rate", pct: refCompletionRate, color: "#7c3aed" },
      { label: "Incident Reporting Compliance", pct: 92, color: "#0891b2" },
      { label: "Disciplinary Clean Record", pct: 96, color: "#16a34a" }
    ];
  }, [myStations, stationStats, myUsers]);

  const topStations = useMemo(() => [...stationStats].sort((a, b) => b.avgScore - a.avgScore).slice(0, 5), [stationStats]);
  const bottomStations = useMemo(() => [...stationStats].sort((a, b) => a.avgScore - b.avgScore).slice(0, 5), [stationStats]);

  const myPipeline = useMemo(() => {
    const approvedCount = myPmList.filter(p => p.status === "Approved").length + mySmList.filter(s => s.status === "Approved").length + myTmList.filter(t => t.status === "Approved").length;
    const pendingCount = myPmList.filter(p => p.status === "Pending").length + mySmList.filter(s => s.status === "Pending" || s.status === "Submitted").length + myTmList.filter(t => t.status === "Pending" || t.status === "Submitted").length;
    const rejectedCount = mySmList.filter(s => s.status === "Rejected").length + myTmList.filter(t => t.status === "Rejected").length;
    const overdueCount = myUsers.filter(u => u.pmeStatus === "Overdue" || u.refStatus === "Expired").length;

    return [
      { label: "Approved", count: approvedCount, dot: "#1E3A5F" },
      { label: "Pending", count: pendingCount, dot: "#4A90D9" },
      { label: "Rejected", count: rejectedCount, dot: "#B83A3A" },
      { label: "Overdue", count: overdueCount, dot: "#5A6B7C" }
    ];
  }, [myPmList, mySmList, myTmList, myUsers]);

  const myAssessmentMonthly = useMemo(() => {
    return MONTHLY.map(m => {
      const scale = myStations.length / 12.0;
      return {
        month: m.month,
        approved: Math.round(m.assessments * scale * 0.8),
        pending: Math.round(m.assessments * scale * 0.15),
        rejected: Math.round(m.assessments * scale * 0.04),
        overdue: Math.round(m.assessments * scale * 0.01)
      };
    });
  }, [myStations]);

  // Fullscreen Derived Calculations
  const filteredFsStations = useMemo(() => {
    return stationStats.filter(st => {
      const q = fsSearch.toLowerCase();
      const matchesSearch = st.name.toLowerCase().includes(q) || st.code.toLowerCase().includes(q);
      const grade = getCat(st.avgScore);
      const matchesCat = fsCatFilter === "All" || grade === fsCatFilter;
      const riskLevel = st.highRisk >= 2 ? "High" : st.highRisk > 0 ? "Medium" : "Low";
      const matchesRisk = fsRiskFilter === "All" || riskLevel === fsRiskFilter;
      return matchesSearch && matchesCat && matchesRisk;
    });
  }, [stationStats, fsSearch, fsCatFilter, fsRiskFilter]);

  const fsStBarData = useMemo(() => {
    return filteredFsStations.map(st => ({
      name: st.code,
      nameFull: st.name,
      avgScore: st.avgScore,
      safetyPct: st.safetyPct,
      highRisk: st.highRisk
    }));
  }, [filteredFsStations]);

  const filteredFsUsers = useMemo(() => {
    return users.filter(u => {
      if (u.role !== "Pointsman") return false;
      const q = fsSearch.toLowerCase();
      const matchesSearch = u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      const grade = getCat(u.score);
      const matchesCat = fsCatFilter === "All" || grade === fsCatFilter;
      const risk = u.pmeStatus === "Overdue" || u.refStatus === "Expired" || u.score < 50 ? "High" : u.score >= 80 ? "Low" : "Medium";
      const matchesRisk = fsRiskFilter === "All" || risk === fsRiskFilter;
      return matchesSearch && matchesCat && matchesRisk;
    });
  }, [users, fsSearch, fsCatFilter, fsRiskFilter]);

  const fsPieData = useMemo(() => {
    const c = { A: 0, B: 0, C: 0, D: 0 };
    filteredFsUsers.forEach(u => {
      c[getCat(u.score)]++;
    });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [filteredFsUsers]);

  const filteredPM = useMemo(()=>{
    return pmList.filter(p=>{
      const st = p.status === reviewTab;
      const s  = !reviewSearch || p.pointsmanName.toLowerCase().includes(reviewSearch.toLowerCase()) || p.hrmsId.toLowerCase().includes(reviewSearch.toLowerCase());
      const r  = reviewStation==="All" || p.station===reviewStation;
      return st && s && r;
    });
  },[pmList,reviewTab,reviewSearch,reviewStation]);

  const selectedPM = pmList.find(p=>p.id===selectedPmId)||null;

  /* ── Role Roster filtering ── */
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const isRoleMatch = 
        activePage === "pointsmen" ? u.role === "Pointsman" : 
        activePage === "stationMasters" ? u.role === "Station Master" : 
        activePage === "stationSuperintendents" ? u.role === "Station Superintendent" : 
        activePage === "trainManagers" ? u.role === "Train Manager" : true;
      if (!isRoleMatch) return false;

      const q = userSearch.toLowerCase();
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      const matchesStation = userStationFilter === "All" || u.station === userStationFilter;
      const matchesCategory = userCategoryFilter === "All" || (u.cat || getCat(u.score)) === userCategoryFilter;
      
      const isHighRisk = u.pmeStatus === "Overdue" || u.refStatus === "Expired" || u.score < 50;
      const matchesRisk = userRiskFilter === "All" || (userRiskFilter === "High" && isHighRisk) || (userRiskFilter === "Non-High" && !isHighRisk);

      return matchesSearch && matchesStation && matchesCategory && matchesRisk;
    });
  }, [users, userSearch, userStationFilter, userCategoryFilter, userRiskFilter, activePage]);

  const filteredReport = useMemo(()=>{
    let list = users.map(u => ({
      name: u.name,
      hrmsId: u.id,
      station: u.station,
      score: u.score,
      cat: u.cat || getCat(u.score),
      risk: u.pmeStatus === "Overdue" || u.refStatus === "Expired" || u.score < 50 ? "High" : u.score >= 80 ? "Low" : "Medium",
      date: u.lastAssessDate
    }));
    list = list.filter(r=>{
      const q = rpSearch.toLowerCase();
      const srch = !q||r.name.toLowerCase().includes(q)||r.station.toLowerCase().includes(q);
      const st   = rpStation==="All"||r.station===rpStation;
      const cat  = rpCat==="All"||r.cat===rpCat;
      const risk = rpRisk==="All"||r.risk===rpRisk;
      return srch&&st&&cat&&risk;
    });
    if (rpSort==="score-desc") list=[...list].sort((a,b)=>b.score-a.score);
    if (rpSort==="score-asc")  list=[...list].sort((a,b)=>a.score-b.score);
    return list;
  },[users,rpSearch,rpStation,rpCat,rpRisk,rpSort]);

  /* ── Navigation ── */
  const goTo = pg => {
    setActivePage(pg);
    setStatusMsg("");
    setSelectedPmId(null);
    setActiveSmId(null);
    setActiveSsId(null);
    setActiveTmId(null);
    setAssessRole(null);
    setSelectedStation(null);
    setSelectedReportUserId(null);
    setRepApplied(false);
    setBellDropdownOpen(false);
    setRoleF({ name: "", station: "All", ti: "All", cat: "All", risk: "All" });
    setView(null);
  };

  useEffect(() => {
    if (selectedStation) {
      const st = selectedStation;
      const matched = stationStats.find(s => s.name === st.name || s.code === st.code) || st;
      
      const smCount = users.filter(u => u.station === matched.name && (u.role === "Station Master" || u.role === "sm")).length;
      const pmCount = users.filter(u => u.station === matched.name && (u.role === "Pointsman" || u.role === "pointsmen")).length;
      const pmPending = myPmList.filter(p => p.station === matched.name && p.status === "Pending").length;
      const smPending = mySmList.filter(s => s.station === matched.name && s.status === "Pending").length;
      const tmPending = myTmList.filter(t => t.station === matched.name && t.status === "Pending").length;
      const pending = pmPending + smPending + tmPending;
      
      setView({
        type: "stationDetail",
        data: {
          ...matched,
          ti: user.name || "TI R. Khan",
          smCount,
          pmCount,
          score: matched.avgScore || matched.score,
          safety: matched.safetyPct || matched.safety,
          highRisk: matched.highRisk,
          pending
        }
      });
    } else {
      setView(null);
    }
  }, [selectedStation, stationStats, users, myPmList, mySmList, myTmList, user]);

  const handleChartClick = (state, chartType) => {
    let clickedStationName = "";
    if (state && state.activeLabel) {
      const matched = stationStats.find(st => st.code === state.activeLabel);
      if (matched) {
        clickedStationName = matched.name;
      }
    }
    
    if (clickedStationName) {
      setZoomPopupSearch(clickedStationName);
      setSelectedChartType(chartType);
      setIsChartZoomModalOpen(true);
      setZoomPopupPage(1);
    } else {
      setSelectedChartType(chartType);
      setIsChartZoomModalOpen(true);
      setZoomPopupPage(1);
    }
  };

  const handlePieClick = (data) => {
    if (data && data.name) {
      const catLetter = data.name.replace("Category ", "").trim();
      setZoomPopupCategory(catLetter);
    } else {
      setZoomPopupCategory("All");
    }
    setSelectedChartType("category");
    setIsChartZoomModalOpen(true);
    setZoomPopupPage(1);
  };

  const renderChartZoomModal = () => {
    if (!isChartZoomModalOpen) return null;

    const filtered = stationStats.map(st => {
      const pmDone = myPmList.filter(p => p.station === st.name && p.status === "Approved").length;
      const smDone = mySmList.filter(s => s.station === st.name && (s.status === "Approved" || s.status === "Submitted")).length;
      const tmDone = myTmList.filter(t => t.station === st.name && (t.status === "Approved" || t.status === "Submitted")).length;
      const completed = pmDone + smDone + tmDone;

      const pmPending = myPmList.filter(p => p.station === st.name && p.status === "Pending").length;
      const smPending = mySmList.filter(s => s.station === st.name && s.status === "Pending").length;
      const tmPending = myTmList.filter(t => t.station === st.name && t.status === "Pending").length;
      const pending = pmPending + smPending + tmPending;

      const riskLevel = st.highRisk >= 2 ? "High" : st.highRisk > 0 ? "Medium" : "Low";
      const category = getCat(st.avgScore);

      return {
        ...st,
        stationName: st.name,
        stationCode: st.code,
        completed,
        pending,
        avgScore: st.avgScore,
        category,
        riskLevel,
        assessmentStatus: pending > 0 ? "Pending" : "Approved",
        lastUpdatedDate: st.lastUpdatedDate || "2026-05-28",
        zone: st.zone || "Central Railway",
        division: st.division || "Parbhani-Amla Section"
      };
    }).filter(st => {
      const q = zoomPopupSearch.trim().toLowerCase();
      const matchesSearch = !q || st.stationName.toLowerCase().includes(q) || st.stationCode.toLowerCase().includes(q);
      
      const matchesZone = zoomPopupZone === "All" || st.zone === zoomPopupZone;
      const matchesDivision = zoomPopupDivision === "All" || st.division === zoomPopupDivision;
      
      const matchesName = zoomPopupStationName === "All" || !zoomPopupStationName.trim() || st.stationName.toLowerCase().includes(zoomPopupStationName.toLowerCase());
      const matchesCode = zoomPopupStationCode === "All" || !zoomPopupStationCode.trim() || st.stationCode.toLowerCase().includes(zoomPopupStationCode.toLowerCase());
      
      const matchesCategory = zoomPopupCategory === "All" || st.category === zoomPopupCategory;
      const matchesRisk = zoomPopupRisk === "All" || st.riskLevel === zoomPopupRisk;
      const matchesStatus = zoomPopupStatus === "All" || st.assessmentStatus === zoomPopupStatus;

      let matchesDate = true;
      if (zoomPopupStartDate) {
        matchesDate = matchesDate && st.lastUpdatedDate >= zoomPopupStartDate;
      }
      if (zoomPopupEndDate) {
        matchesDate = matchesDate && st.lastUpdatedDate <= zoomPopupEndDate;
      }

      return matchesSearch && matchesZone && matchesDivision && matchesName && matchesCode && matchesCategory && matchesRisk && matchesStatus && matchesDate;
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const currentPage = Math.min(zoomPopupPage, totalPages);

    const paginated = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const modalChartData = paginated.map(st => ({
      station: st.stationCode,
      name: st.stationName,
      completed: st.completed,
      pending: st.pending,
      avgScore: st.avgScore
    }));

    const catA = paginated.filter(s => s.category === "A").length;
    const catB = paginated.filter(s => s.category === "B").length;
    const catC = paginated.filter(s => s.category === "C").length;
    const catD = paginated.filter(s => s.category === "D").length;
    const totalCount = catA + catB + catC + catD;

    const modalPieData = [
      { name: "Category A", value: catA, color: "#1E3A5F" },
      { name: "Category B", value: catB, color: "#2B6CB0" },
      { name: "Category C", value: catC, color: "#D69E2E" },
      { name: "Category D", value: catD, color: "#C53030" }
    ].filter(item => item.value > 0);

    const handleResetPopupFilters = () => {
      setZoomPopupSearch("");
      setZoomPopupZone("All");
      setZoomPopupDivision("All");
      setZoomPopupStationName("All");
      setZoomPopupStationCode("All");
      setZoomPopupCategory("All");
      setZoomPopupRisk("All");
      setZoomPopupStatus("All");
      setZoomPopupStartDate("");
      setZoomPopupEndDate("");
      setZoomPopupPage(1);
    };

    return (
      <div 
        className="zoom-modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          overflowY: "auto",
          display: "block",
          padding: 0,
          animation: "fadeIn 0.2s ease-out"
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <div 
          className="zoom-modal-container"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 0,
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
            overflow: "visible",
            border: "none",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Modal Header */}
          <div 
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8fafc",
              position: "sticky",
              top: 0,
              zIndex: 100
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
                {selectedChartType === "progress" 
                  ? "Station-wise Evaluation Progress" 
                  : selectedChartType === "score" 
                  ? "Station-wise Average Score" 
                  : "Category Distribution"}
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                Page {currentPage} of {totalPages} (Showing 10 stations per page out of {filtered.length} matching stations)
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setIsChartZoomModalOpen(false)}
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Close Zoom View
              </button>
            </div>
          </div>

          {/* Modal Body Container */}
          <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "20px", overflow: "visible" }}>
            
            {/* 1. FILTER CONTROLS GRID */}
            <div 
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Operational Search & Diagnostics Filters
                </h4>
                <button
                  type="button"
                  onClick={handleResetPopupFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: "750",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  Reset Diagnostics Filters
                </button>
              </div>
              <div 
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "12px"
                }}
              >
                {/* Search */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Quick Search</label>
                  <input
                    type="text"
                    placeholder="Search name/code..."
                    value={zoomPopupSearch}
                    onChange={(e) => { setZoomPopupSearch(e.target.value); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>

                {/* Zone */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Zone</label>
                  <select
                    value={zoomPopupZone}
                    onChange={(e) => { setZoomPopupZone(e.target.value); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", background: "#ffffff", color: "#334155" }}
                  >
                    <option value="All">All Zones</option>
                    <option value="Central Railway">Central Railway</option>
                  </select>
                </div>

                {/* Division */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Division/Section</label>
                  <select
                    value={zoomPopupDivision}
                    onChange={(e) => { setZoomPopupDivision(e.target.value); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", background: "#ffffff", color: "#334155" }}
                  >
                    <option value="All">All Sections</option>
                    <option value="Parbhani-Amla Section">Parbhani-Amla</option>
                  </select>
                </div>

                {/* Station Name */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Station Name</label>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={zoomPopupStationName === "All" ? "" : zoomPopupStationName}
                    onChange={(e) => { setZoomPopupStationName(e.target.value || "All"); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>

                {/* Station Code */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Station Code</label>
                  <input
                    type="text"
                    placeholder="Filter by code..."
                    value={zoomPopupStationCode === "All" ? "" : zoomPopupStationCode}
                    onChange={(e) => { setZoomPopupStationCode(e.target.value || "All"); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Category</label>
                  <select
                    value={zoomPopupCategory}
                    onChange={(e) => { setZoomPopupCategory(e.target.value); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", background: "#ffffff", color: "#334155" }}
                  >
                    <option value="All">All Categories</option>
                    <option value="A">Cat. A</option>
                    <option value="B">Cat. B</option>
                    <option value="C">Cat. C</option>
                    <option value="D">Cat. D</option>
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Risk Level</label>
                  <select
                    value={zoomPopupRisk}
                    onChange={(e) => { setZoomPopupRisk(e.target.value); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", background: "#ffffff", color: "#334155" }}
                  >
                    <option value="All">All Risks</option>
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Status</label>
                  <select
                    value={zoomPopupStatus}
                    onChange={(e) => { setZoomPopupStatus(e.target.value); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", background: "#ffffff", color: "#334155" }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Date range start */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>Start Date</label>
                  <input
                    type="date"
                    value={zoomPopupStartDate}
                    onChange={(e) => { setZoomPopupStartDate(e.target.value); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", color: "#334155" }}
                  />
                </div>

                {/* Date range end */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>End Date</label>
                  <input
                    type="date"
                    value={zoomPopupEndDate}
                    onChange={(e) => { setZoomPopupEndDate(e.target.value); setZoomPopupPage(1); }}
                    style={{ width: "100%", padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", color: "#334155" }}
                  />
                </div>
              </div>
            </div>

            {/* 2. DYNAMIC REAL-TIME CHART BOX */}
            <div 
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "750", color: "#0f172a" }}>
                  {selectedChartType === "progress" 
                    ? "Evaluation Progress Trends (Completed vs Pending)" 
                    : selectedChartType === "score" 
                    ? "Average Safety Evaluation Scores (/100)" 
                    : "Category Distribution Breakdown"}
                </h4>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                  Showing up to 10 stations on this page
                </span>
              </div>
              
              <div style={{ height: "260px", width: "100%" }}>
                {selectedChartType === "category" ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", gap: "60px" }}>
                    <div style={{ width: "220px", height: "220px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={modalPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={88}
                            dataKey="value"
                            label={({ name, value }) => `${name.replace("Category ", "")}: ${value}`}
                          >
                            {modalPieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} Station(s)`, "Count"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {modalPieData.map((item) => (
                        <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                          <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: item.color }} />
                          <span>{item.name}:</span>
                          <span style={{ color: "#0f172a" }}>{item.value} Station(s) ({((item.value / (totalCount || 1)) * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={modalChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      barGap={6}
                    >
                      <XAxis
                        dataKey="station"
                        tick={{ fontSize: 10, fill: "#475569" }}
                        height={40}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#475569" }} domain={selectedChartType === "score" ? [0, 100] : undefined} />
                      <Tooltip 
                        contentStyle={{ background: "#0f172a", color: "#ffffff", borderRadius: "8px", border: "none", fontSize: "12px" }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                      {selectedChartType === "progress" ? (
                        <>
                          <Bar dataKey="completed" fill="#0d2948" name="Completed Evaluations" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="pending" fill="#f5ae3f" name="Pending Evaluations" radius={[4, 4, 0, 0]} />
                        </>
                      ) : (
                        <Bar dataKey="avgScore" fill="#1f7a5c" name="Average Evaluation Score" radius={[4, 4, 0, 0]} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 3. DETAILED STATION DATA TABLE */}
            <div 
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155" }}>Station Name</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155" }}>Code</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155" }}>Section/Division</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155" }}>Zone</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155", textAlign: "right" }}>Completed</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155", textAlign: "right" }}>Pending</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155", textAlign: "right" }}>Avg. Score</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155", textAlign: "center" }}>Category</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155", textAlign: "center" }}>Risk Level</th>
                    <th style={{ padding: "12px 16px", fontWeight: "700", color: "#334155" }}>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                        No stations matching the selected diagnostics criteria.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((st) => {
                      const riskColor = st.riskLevel === "High" ? "#ef4444" : st.riskLevel === "Medium" ? "#ea580c" : "#16a34a";
                      const riskBg = st.riskLevel === "High" ? "#fef2f2" : st.riskLevel === "Medium" ? "#fff7ed" : "#dcfce7";
                      const catBg = st.category === "A" ? "#eff6ff" : st.category === "B" ? "#f5f3ff" : st.category === "C" ? "#fffbeb" : "#fdf2f8";
                      const catColor = st.category === "A" ? "#1e40af" : st.category === "B" ? "#5b21b6" : st.category === "C" ? "#92400e" : "#9d174d";

                      return (
                        <tr key={st.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 16px", fontWeight: "600", color: "#0f172a" }}>{st.stationName}</td>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>{st.stationCode}</td>
                          <td style={{ padding: "12px 16px", color: "#475569" }}>{st.division}</td>
                          <td style={{ padding: "12px 16px", color: "#475569" }}>{st.zone}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "700", color: "#0d2948" }}>{st.completed}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "700", color: "#f5ae3f" }}>{st.pending}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: "700", color: "#1f7a5c" }}>{st.avgScore}/100</td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <span style={{ background: catBg, color: catColor, padding: "2px 8px", borderRadius: "4px", fontWeight: "700", fontSize: "11px" }}>
                              Cat {st.category}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <span style={{ background: riskBg, color: riskColor, padding: "3px 8px", borderRadius: "6px", fontWeight: "700", fontSize: "11px" }}>
                              {st.riskLevel}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#64748b" }}>{st.lastUpdatedDate}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Modal Footer (SLIDER / TABS PAGINATION) */}
          <div 
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e2e8f0",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ fontSize: "13px", color: "#475569", fontWeight: "600" }}>
              Showing {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} stations
            </div>
            
            {/* Page tabs */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setZoomPopupPage(p => Math.max(p - 1, 1))}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: currentPage === 1 ? "default" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>

              <div style={{ display: "flex", gap: "4px" }}>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const active = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setZoomPopupPage(pageNum)}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        background: active ? "var(--brand-primary, #0B1F3A)" : "#ffffff",
                        color: active ? "#ffffff" : "#334155",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setZoomPopupPage(p => Math.min(p + 1, totalPages))}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: currentPage === totalPages ? "default" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── User admin actions ── */
  const handleEditUser = (userRec) => {
    setEditingUser({ ...userRec });
  };

  const saveEditedUser = (e) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    addAuditLog("User Profile Modified", `Staff ID: ${editingUser.id}, Name: ${editingUser.name}`);
    triggerNotification("success", `Profile updated for ${editingUser.name}.`);
    setEditingUser(null);
    setStatusMsg("User profile updated successfully.");
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you absolutely sure you want to revoke operational access for ${userName} (${userId})?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      addAuditLog("Revoked User Access", `Staff ID: ${userId}, Name: ${userName}`);
      triggerNotification("danger", `Revoked access: ${userName} (${userId}).`);
      setStatusMsg(`Revoked evaluation and access clearance for ${userName}.`);
    }
  };

  const handleTransferClick = (userRec) => {
    setTransferringUser({ ...userRec, targetStation: userRec.station });
  };

  const confirmTransfer = () => {
    setUsers(prev => prev.map(u => u.id === transferringUser.id ? { ...u, station: transferringUser.targetStation } : u));
    addAuditLog("Staff Station Transfer", `Staff: ${transferringUser.name} moved from ${transferringUser.station} to ${transferringUser.targetStation}`);
    triggerNotification("warning", `Transferred ${transferringUser.name} to ${transferringUser.targetStation}.`);
    setStatusMsg(`Operational deployment of ${transferringUser.name} transferred to ${transferringUser.targetStation}.`);
    setTransferringUser(null);
  };

  /* ── PM Review Actions ── */
  const openPmReview = id => {
    const rec = pmList.find(p=>p.id===id);
    if (!rec) return;
    setSelectedPmId(id);
    setEditSections(prev=>({...prev,[id]:rec.originalSections.map(s=>({...s}))}));
    setTiRemarks(prev=>({...prev,[id]:rec.tiRemarks||""}));
    setRejectMode(prev=>({...prev,[id]:false}));
  };

  const updateSec = (id,idx,val) => {
    setEditSections(prev=>{
      const arr=[...prev[id]]; arr[idx]={...arr[idx],score:Math.max(0,Math.min(arr[idx].max,Number(val)||0))};
      return {...prev,[id]:arr};
    });
  };

  const finalizePM = (id,mode,rejectNote="") => {
    setPmList(prev=>prev.map(p=>{
      if (p.id!==id) return p;
      const secs  = editSections[id]||p.originalSections;
      const total = secs.reduce((s,x)=>s+x.score,0);
      const modified = JSON.stringify(secs)!==JSON.stringify(p.originalSections);
      const audit = [...(p.auditTrail||[]),{
        action: mode==="reject"?"Rejected":(modified?"Modified & Approved":"Approved without modification"),
        by:`TI ${tiName}`, date:new Date().toISOString().slice(0,10),
        remark: mode==="reject"?rejectNote:(tiRemarks[id]||"")
      }];
      return {
        ...p, status: mode==="reject"?"Rejected":"Approved",
        finalSections:mode==="reject"?p.originalSections:secs,
        finalScore:total, tiRemarks:tiRemarks[id]||rejectNote,
        tiModified:modified, approvalDate:new Date().toISOString().slice(0,10),
        auditTrail:audit
      };
    }));
    
    // Update target Pointsman's dynamic performance score in the main users database!
    const targetAssess = pmList.find(p => p.id === id);
    if (targetAssess && mode !== "reject") {
      const finalSecs = editSections[id] || targetAssess.originalSections;
      const finalSum = finalSecs.reduce((s, x) => s + x.score, 0);
      setUsers(prev => prev.map(u => u.id === targetAssess.hrmsId ? { ...u, score: finalSum, cat: getCat(finalSum) } : u));
    }

    setSelectedPmId(null);
    setStatusMsg(mode==="reject"?"Assessment rejected. SM has been notified.":`Assessment ${mode==="approve"?"approved":"modified & approved"} successfully.`);
    addAuditLog(mode==="reject"?"Rejected PM Assessment":"Approved PM Assessment", `Staff ID: ${targetAssess?.hrmsId || ""}, Score: ${mode==="reject"?"-":total}`);
    triggerNotification("success", `Reviewed PM Assessment for ${targetAssess?.pointsmanName || ""}.`);
    setReviewTab(mode==="reject"?"Rejected":"Approved");
  };

  /* ── SM Form ── */
  const openSMForm = (id, forceUnlock = false) => {
    setActiveSmId(id);
    const smAssess = smList.find(s => s.id === id);
    setSmLocked(prev => ({
      ...prev,
      [id]: forceUnlock ? false : (smAssess ? smAssess.status === "Submitted" : false)
    }));
    setSmForms(prev => {
      const existing = prev[id] || defaultSMForm();
      if (smAssess && smAssess.examScore !== undefined) {
        return {
          ...prev,
          [id]: {
            ...existing,
            knowledgeMarks: smAssess.examScore.toString()
          }
        };
      }
      return {
        ...prev,
        [id]: existing
      };
    });
  };

  const handleSendExamAccess = (id) => {
    setSmList(prev => prev.map(s => s.id === id ? { ...s, status: "Exam Sent" } : s));
    setStatusMsg("Exam access link sent successfully to the Station Master.");
    addAuditLog("Sent Exam Access", `Exam sent to SM: ${smList.find(s => s.id === id)?.name}`);
    triggerNotification("success", `Exam access granted to SM ${smList.find(s => s.id === id)?.name}`);
  };

  const toggleSMYN = (id,key,idx,val) => {
    if (smLocked[id]) return;
    setSmForms(prev=>{
      const f={...prev[id]}; const arr=[...f[key]]; arr[idx]=arr[idx]===val?null:val;
      return {...prev,[id]:{...f,[key]:arr}};
    });
  };
  const setSMField = (id,key,val) => { if(smLocked[id])return; setSmForms(p=>({...p,[id]:{...p[id],[key]:val}})); };

  const submitSMAssessment = id => {
    const f = smForms[id];
    if (!f?.alcoholicStatus){ setStatusMsg("Alcoholic/Non-Alcoholic status is mandatory."); return; }
    const {total} = computeSMScore(f);
    
    const isAlcoholic = f.alcoholicStatus === "Alcoholic";
    const cat = isAlcoholic ? "D" : getCat(total);

    setSmList(prev=>prev.map(s=>s.id===id?{...s,status:"Submitted",score:total,category:cat}:s));
    setSmLocked(p=>({...p,[id]:true}));
    
    // Update Station Master's dynamic performance score in the main users database!
    const smAssess = smList.find(s => s.id === id);
    if (smAssess) {
      setUsers(prev => prev.map(u => u.id === smAssess.hrmsId ? {
        ...u,
        score: total,
        cat: cat,
        alcoholicStatus: f.alcoholicStatus,
        pmeStatus: f.pmeStatus,
        refStatus: f.refStatus
      } : u));
    }

    setStatusMsg("SM assessment submitted. Pending AOM approval.");
    addAuditLog("Submitted SM Assessment", `SM: ${smAssess?.name || ""}, Grand Score: ${total}`);
    triggerNotification("success", `Field evaluation logged for SM ${smAssess?.name || ""}.`);
    setActiveSmId(null);
  };

  /* ── TM Form ── */
  const openTMForm = (id, forceUnlock = false) => {
    setActiveTmId(id);
    const tmAssess = tmList.find(t => t.id === id);
    setTmLocked(prev => ({
      ...prev,
      [id]: forceUnlock ? false : (tmAssess ? tmAssess.status === "Submitted" : false)
    }));
    setTmForms(prev => {
      const existing = prev[id] || defaultTMForm();
      if (tmAssess && tmAssess.examScore !== undefined) {
        return {
          ...prev,
          [id]: {
            ...existing,
            knowledgeMarks: tmAssess.examScore.toString()
          }
        };
      }
      return {
        ...prev,
        [id]: existing
      };
    });
  };

  const handleSendTMExamAccess = (id) => {
    setTmList(prev => prev.map(t => t.id === id ? { ...t, status: "Exam Sent" } : t));
    setStatusMsg("Exam access link sent successfully to the Train Manager.");
    addAuditLog("Sent Exam Access", `Exam sent to TM: ${tmList.find(t => t.id === id)?.name}`);
    triggerNotification("success", `Exam access granted to TM ${tmList.find(t => t.id === id)?.name}`);
  };

  const toggleTMYN = (id, key, idx, val) => {
    if (tmLocked[id]) return;
    setTmForms(prev => {
      const f = { ...prev[id] };
      const arr = [...f[key]];
      arr[idx] = arr[idx] === val ? null : val;
      return { ...prev, [id]: { ...f, [key]: arr } };
    });
  };

  const setTMField = (id, key, val) => {
    if (tmLocked[id]) return;
    setTmForms(p => ({ ...p, [id]: { ...p[id], [key]: val } }));
  };

  const submitTMAssessment = id => {
    const f = tmForms[id];
    if (!f?.alcoholicStatus) {
      setStatusMsg("Alcoholic/Non-Alcoholic status is mandatory.");
      return;
    }
    const { total } = computeTMScore(f);

    const isAlcoholic = f.alcoholicStatus === "Alcoholic";
    const cat = isAlcoholic ? "D" : getCat(total);

    setTmList(prev => prev.map(t => t.id === id ? { ...t, status: "Submitted", score: total, category: cat } : t));
    setTmLocked(p => ({ ...p, [id]: true }));

    // Update Train Manager's dynamic performance score in the main users database!
    const tmAssess = tmList.find(t => t.id === id);
    if (tmAssess) {
      setUsers(prev => prev.map(u => u.id === tmAssess.hrmsId ? {
        ...u,
        score: total,
        cat: cat,
        alcoholicStatus: f.alcoholicStatus,
        pmeStatus: f.pmeStatus,
        refStatus: f.refStatus
      } : u));
    }

    setStatusMsg("TM assessment submitted. Pending AOM approval.");
    addAuditLog("Submitted TM Assessment", `TM: ${tmAssess?.name || ""}, Grand Score: ${total}`);
    triggerNotification("success", `Field evaluation logged for TM ${tmAssess?.name || ""}.`);
    setActiveTmId(null);
  };

  /* ── SS Helpers ── */
  const openSSForm = (id, forceUnlock = false) => {
    if (forceUnlock) setSsLocked(p => ({ ...p, [id]: false }));
    setActiveSsId(id);
    setAssessRole("SS");
    setActivePage("assessments");
  };

  const handleSendSSExamAccess = (id) => {
    setSsList(prev => prev.map(s => s.id === id ? { ...s, status: "Exam Sent" } : s));
    triggerNotification("info", "Exam access link sent to Station Superintendent.");
  };

  const toggleSSYN = (id, key, idx, val) => {
    if (ssLocked[id]) return;
    setSsForms(p => ({
      ...p,
      [id]: {
        ...(p[id] || defaultSSForm()),
        [key]: (p[id]?.[key] || Array(5).fill(null)).map((v, i) => i === idx ? (v === val ? null : val) : v)
      }
    }));
  };

  const setSSField = (id, key, val) => { if (ssLocked[id]) return; setSsForms(p => ({ ...p, [id]: { ...(p[id] || defaultSSForm()), [key]: val } })); };

  const submitSSAssessment = id => {
    const f = ssForms[id];
    if (!f?.alcoholicStatus) {
      setStatusMsg("Alcoholic/Non-Alcoholic status is mandatory.");
      return;
    }
    const { total } = computeSSScore(f);
    const isAlcoholic = f.alcoholicStatus === "Alcoholic";
    const cat = isAlcoholic ? "D" : getCat(total);

    setSsList(prev => prev.map(s => s.id === id ? { ...s, status: "Submitted", score: total, category: cat } : s));
    setSsLocked(p => ({ ...p, [id]: true }));

    const ssAssess = ssList.find(s => s.id === id);
    if (ssAssess) {
      setUsers(prev => prev.map(u => u.id === ssAssess.hrmsId ? {
        ...u, score: total, cat: cat,
        alcoholicStatus: f.alcoholicStatus, pmeStatus: f.pmeStatus, refStatus: f.refStatus
      } : u));
    }

    setStatusMsg("SS assessment submitted. Pending AOM approval.");
    addAuditLog("Submitted SS Assessment", `SS: ${ssAssess?.name || ""}, Grand Score: ${total}`);
    triggerNotification("success", `Field evaluation logged for SS ${ssAssess?.name || ""}.`);
    setActiveSsId(null);
  };

  /* ── Logging Inspections & Counselling ── */
  const submitInspection = (e) => {
    e.preventDefault();
    const newRecord = {
      id: "IN_" + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      station: newInsp.station,
      officer: newInsp.officer,
      observations: newInsp.observations,
      risk: newInsp.risk,
      status: "Active"
    };
    setInspections(prev => [newRecord, ...prev]);
    addAuditLog("Logged Station Inspection", `Station: ${newInsp.station}, Risk: ${newInsp.risk}`);
    triggerNotification("warning", `NEW INSPECTION REPORT FILED: ${newInsp.station}`);
    setStatusMsg(`Inspection audit log successfully created for ${newInsp.station}.`);
    setNewInsp({ station: "Parbhani Junction", officer: "TI R. Khan", observations: "", risk: "Low" });
    setShowInspForm(false);
  };

  const submitCounselling = (e) => {
    e.preventDefault();
    const newRecord = {
      id: "CL_" + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      staffName: newCoun.staffName,
      designation: newCoun.designation,
      station: newCoun.station,
      topics: newCoun.topics,
      duration: newCoun.duration,
      progress: newCoun.progress
    };
    setCounsellings(prev => [newRecord, ...prev]);
    addAuditLog("Logged Counselling Session", `Staff: ${newCoun.staffName}, Topics: ${newCoun.topics.slice(0,25)}...`);
    triggerNotification("success", `Counselling session registered for ${newCoun.staffName}.`);
    setStatusMsg(`Staff safety counseling briefing registered for ${newCoun.staffName}.`);
    setNewCoun({ staffName: "", designation: "Pointsman Grade I", station: "Parbhani Junction", topics: "", duration: "30 mins", progress: "Under Monitor" });
    setShowCounForm(false);
  };

  /* ── Self-Assessment Interactive Quiz ── */
  const startQuiz = () => {
    setQuizAnswers(Array(25).fill(null));
    setCurrentQuestion(0);
    setQuizState("quiz");
  };

  const handleSelectQuizOpt = (optIdx) => {
    setQuizAnswers(prev => {
      const next = [...prev];
      next[currentQuestion] = optIdx;
      return next;
    });
  };

  const submitQuiz = () => {
    let correctCount = 0;
    quizAnswers.forEach((ans, idx) => {
      if (ans === TI_QUIZ[idx].ans) correctCount++;
    });
    const finalScore = correctCount * 4; // 25 questions = 100 max
    setLatestQuizScore(finalScore);
    
    const getDomainScore = (startIdx, endIdx) => {
      let score = 0;
      for (let i = startIdx; i <= endIdx; i++) {
        if (quizAnswers[i] === TI_QUIZ[i].ans) score += 4;
      }
      return score;
    };

    // Add to assessment history in state
    const today = new Date().toISOString().slice(0, 10);
    const newRecord = {
      id: Date.now(),
      date: today,
      period: "Assigned Assessment " + today,
      assessedBy: "AOM Assigned Exam",
      totalScore: finalScore,
      category: getCat(finalScore),
      approvalStatus: "Approved",
      aomRemarks: "Assigned safety compliance assessment submitted by Traffic Inspector R. Khan.",
      sections: [
        { title: "Whistle Codes & Hand Signals", marks: getDomainScore(0, 4), outOf: 20 },
        { title: "Token & Line Clear Authorities", marks: getDomainScore(5, 9), outOf: 20 },
        { title: "Station Interlocking & Track Circuits", marks: getDomainScore(10, 14), outOf: 20 },
        { title: "Shunting Operations & Point Locking", marks: getDomainScore(15, 19), outOf: 20 },
        { title: "Gate Signals & Siding Isolation", marks: getDomainScore(20, 24), outOf: 20 }
      ],
      userAnswers: [...quizAnswers]
    };
    
    setTiAssessments(prev => [newRecord, ...prev]);
    setSelectedRecord(newRecord);
    localStorage.removeItem("ti_exam_assigned");
    setIsExamAssigned(false);
    addAuditLog("Assigned Assessment Completed", `Score: ${finalScore}/100`);
    triggerNotification("success", `Compliance check complete: Scored ${finalScore}%`);
    setQuizState("result");
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addAuditLog("Notifications Inbox Read", "Marked all alerts read.");
  };

  /* ═══════════════════════════════════════════
     RENDER: DASHBOARD
     (Highly scrollable & optimized for 12 stations)
  ═══════════════════════════════════════════ */
  const renderDashboard = ()=>(
    <div className="sdom-fade">
      {/* Page header */}
      <h1 className="sdom-page-title">{TI_PROFILE.jurisdiction} Section Command Center</h1>
      <p className="sdom-page-subtitle">Complete strategic overview of your section — staff, performance, safety and assessment pipeline.</p>

      {/* ── Summary Cards ── */}
      <div className="sdom-summary-cards">
        {[
          { key: "stations", label: "Stations", count: myStations.length, sub: "Assigned in your section", icon: <Building2 size={18} />, color: "#1E3A5F", onClick: () => goTo("stations") },
          { key: "pointsmen", label: "Pointsmen", count: totalPM, sub: "Across assigned stations", icon: <Users size={18} />, color: "#1E3A5F", onClick: () => { goTo("pointsmen"); setUserStationFilter("All"); setUserCategoryFilter("All"); setUserRiskFilter("All"); setUserSearch(""); } },
          { key: "sm", label: "Station Masters", count: totalSMs, sub: "Across assigned stations", icon: <Building2 size={18} />, color: "#1E3A5F", onClick: () => { goTo("stationMasters"); setUserStationFilter("All"); setUserCategoryFilter("All"); setUserRiskFilter("All"); setUserSearch(""); } },
          { key: "pending", label: "Pending Approvals", count: pending, sub: "Assessments awaiting review", icon: <ClipboardCheck size={18} />, color: "#1E3A5F", onClick: () => { goTo("reviewPM"); setReviewTab("Pending"); } },
          { key: "avg", label: "Average Score", count: `${avgScoreAll}/100`, sub: "Section-wide average", icon: <Activity size={18} />, color: "#1E3A5F", onClick: () => goTo("reports") },
          { key: "risk", label: "High-Risk Staff", count: highRiskAll, sub: "Requires immediate attention", icon: <AlertTriangle size={18} />, color: "#1E3A5F", onClick: () => { goTo("pointsmen"); setUserRiskFilter("High"); setUserStationFilter("All"); setUserCategoryFilter("All"); setUserSearch(""); } },
        ].map((c) => (
          <div 
            className="sdom-stat-card" 
            key={c.key}
            style={{ cursor: "pointer" }}
            onClick={c.onClick}
          >
            <div className="sdom-stat-icon">
              <span style={{ color: "#1E3A5F" }}>{c.icon}</span>
            </div>
            <div className="sdom-stat-label">{c.label}</div>
            <div className="sdom-stat-value">{c.count}</div>
            <div className="sdom-stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Station-wise Progress & Average Score Row ── */}
      <div className="sdom-row-2">
        <div className="sdom-chart-card">
          <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div className="sdom-chart-title">Station-wise Evaluation Progress</div>
              <div className="sdom-chart-subtitle">Completed and pending assessments in your section</div>
            </div>
            <button
              type="button"
              onClick={() => handleChartClick(null, "progress")}
              style={{
                background: "var(--brand-primary, #0B1F3A)",
                color: "#ffffff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              View Full Screen
            </button>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={myStationsProgress}
                margin={{ top: 8, right: 12, left: -20, bottom: 5 }}
                barGap={6}
                onClick={(state) => handleChartClick(state, "progress")}
                style={{ cursor: "pointer" }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9E2EC" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#627D98" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: "#627D98" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: "0.85rem", borderRadius: 6, border: "1px solid #D9E2EC" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey="completed"
                  fill="var(--brand-secondary, #1E3A5F)"
                  radius={[4, 4, 0, 0]}
                  name="Completed"
                  barSize={12}
                />
                <Bar
                  dataKey="pending"
                  fill="#D69E2E"
                  radius={[4, 4, 0, 0]}
                  name="Pending"
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="sdom-chart-card">
          <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div className="sdom-chart-title">Station-wise Average Score</div>
              <div className="sdom-chart-subtitle">Average performance scores for your stations</div>
            </div>
            <button
              type="button"
              onClick={() => handleChartClick(null, "score")}
              style={{
                background: "#1f7a5c",
                color: "#ffffff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              View Full Screen
            </button>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stationStats.map(st => ({ station: st.code, avgScore: st.avgScore }))}
                margin={{ top: 8, right: 12, left: -20, bottom: 5 }}
                onClick={(state) => handleChartClick(state, "score")}
                style={{ cursor: "pointer" }}
                barSize={18}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9E2EC" />
                <XAxis
                  dataKey="station"
                  tick={{ fontSize: 10, fill: "#627D98" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#627D98" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: "0.85rem", borderRadius: 6, border: "1px solid #D9E2EC" }} formatter={(value) => [`${value}/100`, "Average Score"]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey="avgScore"
                  fill="#1f7a5c"
                  radius={[4, 4, 0, 0]}
                  name="Average Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Role-wise Staff Distribution Row ── */}
      <div className="sdom-row-1" style={{ marginBottom: "24px" }}>
        <div className="sdom-chart-card">
          <div className="sdom-chart-title">Role-wise Staff Distribution</div>
          <div className="sdom-chart-subtitle">Staff count per role in your section</div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleBarData} margin={{ top: 16, right: 40, left: 0, bottom: 8 }} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9E2EC" />
                <XAxis dataKey="role" fontSize={12} tick={{ fill: "#102A43", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: "#627D98" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: "0.85rem", borderRadius: 6, border: "1px solid #D9E2EC" }} />
                <Bar dataKey="count" fill="#1E3A5F" radius={[5, 5, 0, 0]}>
                  <LabelList dataKey="count" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "#102A43" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Grade & Safety Row ── */}
      <div className="sdom-row-2">
        <div className="sdom-chart-card">
          <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div className="sdom-chart-title">Grade/Category Distribution</div>
              <div className="sdom-chart-subtitle">Staff grades in your section</div>
            </div>
            <button
              type="button"
              onClick={() => handlePieClick(null)}
              style={{
                background: "var(--brand-primary, #0B1F3A)",
                color: "#ffffff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              View Full Screen
            </button>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ cursor: "pointer" }}>
                <Pie
                  data={pieData.map(d => ({ name: `Grade ${d.name}`, value: d.value, fill: d.name === "A" ? "#1E3A5F" : d.name === "B" ? "#2B6CB0" : d.name === "C" ? "#D69E2E" : "#C53030" }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  onClick={(data) => handlePieClick(data)}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.name === "A" ? "#1E3A5F" : d.name === "B" ? "#2B6CB0" : d.name === "C" ? "#D69E2E" : "#C53030"} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sdom-chart-card">
          <div className="sdom-chart-title">Safety Compliance Analytics</div>
          <div className="sdom-chart-subtitle">Section compliance rates across categories</div>
          <div style={{ marginTop: 16 }}>
            {myCompliance.map((c) => (
              <div className="sdom-compliance-item" key={c.label}>
                <div className="sdom-compliance-header">
                  <span>{c.label}</span>
                  <span className="sdom-compliance-pct">{c.pct}%</span>
                </div>
                <div className="sdom-compliance-track">
                  <div className="sdom-compliance-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Monthly Score & Safety Trend Row ── */}
      <div className="sdom-row-1" style={{ marginBottom: "24px" }}>
        <div className="sdom-chart-card">
          <div className="sdom-chart-title">Section-wide Performance &amp; Safety Trend (Last 6 Months)</div>
          <div className="sdom-chart-subtitle">Average assessment scores and safety compliance percentage in your section</div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis domain={[60, 100]} fontSize={12} />
                <Tooltip contentStyle={{ fontSize: "0.85rem", borderRadius: 6, border: "1px solid #D9E2EC" }} />
                <Legend wrapperStyle={{ fontSize: "0.82rem" }} />
                <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#1E3A5F" strokeWidth={2.5} dot={{ r: 4, fill: "#1E3A5F" }} />
                <Line type="monotone" dataKey="safetyAvg" name="Safety Compliance%" stroke="#2F855A" strokeWidth={2.5} dot={{ r: 4, fill: "#2F855A" }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Top/Bottom Performing Stations Row ── */}
      <div className="sdom-row-2">
        <div className="sdom-chart-card">
          <div className="sdom-chart-title" style={{ marginBottom: 4 }}>Top Performing Stations</div>
          <div className="sdom-chart-subtitle">Highest average assessment score in your section</div>
          <div className="sdom-table-wrap">
            <table className="sdom-table">
              <thead>
                <tr><th>#</th><th>Station</th><th>Avg Score</th><th>Safety %</th><th>High Risk</th></tr>
              </thead>
              <tbody>
                {topStations.map((st, i) => (
                  <tr key={st.id}>
                    <td style={{ color: "#9FB3C8", fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{st.name}</td>
                    <td><span style={{ color: "#2F855A", fontWeight: 700 }}>{st.avgScore}%</span></td>
                    <td>{st.safetyPct}%</td>
                    <td>{st.highRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sdom-chart-card">
          <div className="sdom-chart-title" style={{ marginBottom: 4 }}>Stations Needing Attention</div>
          <div className="sdom-chart-subtitle">Lowest average assessment score in your section</div>
          <div className="sdom-table-wrap">
            <table className="sdom-table">
              <thead>
                <tr><th>#</th><th>Station</th><th>Avg Score</th><th>Safety %</th><th>High Risk</th></tr>
              </thead>
              <tbody>
                {bottomStations.map((st, i) => (
                  <tr key={st.id}>
                    <td style={{ color: "#9FB3C8", fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{st.name}</td>
                    <td><span style={{ color: st.avgScore < 75 ? "#C53030" : "#D69E2E", fontWeight: 700 }}>{st.avgScore}%</span></td>
                    <td>{st.safetyPct}%</td>
                    <td>{st.highRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Assessment Pipeline Row ── */}
      <div className="sdom-row-1">
        <div className="sdom-chart-card">
          <div className="sdom-chart-title">Assessment Pipeline</div>
          <div className="sdom-chart-subtitle">Section-wide pipeline status and trend</div>
          <div className="sdom-pipeline-row" style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            {myPipeline.map((p) => (
              <div className="sdom-pipeline-card" key={p.label} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "10px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", flex: 1 }}>
                <div className="sdom-pipeline-dot" style={{ background: p.dot, width: "10px", height: "10px", borderRadius: "50%" }} />
                <div>
                  <div className="sdom-pipeline-lbl" style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>{p.label}</div>
                  <div className="sdom-pipeline-val" style={{ fontSize: "18px", fontWeight: "800" }}>{p.count}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 280, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={myAssessmentMonthly} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9E2EC" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "#627D98" }} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} tick={{ fill: "#627D98" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: "0.85rem", borderRadius: 6, border: "1px solid #D9E2EC" }} />
                <Legend wrapperStyle={{ fontSize: "0.82rem" }} />
                <Bar dataKey="approved" name="Approved" fill="#1E3A5F" barSize={12} radius={[2, 2, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#4A90D9" barSize={12} radius={[2, 2, 0, 0]} />
                <Bar dataKey="rejected" name="Rejected" fill="#B83A3A" barSize={12} radius={[2, 2, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#5A6B7C" barSize={12} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════
     RENDER: PROFILE
  ═══════════════════════════════════════════ */
  const renderProfile = () => {
    const sectionPerformanceData = [
      { month: "Dec'25", score: 76 },
      { month: "Jan'26", score: 78 },
      { month: "Feb'26", score: 81 },
      { month: "Mar'26", score: 84 },
      { month: "Apr'26", score: 86 },
      { month: "May'26", score: 88 }
    ];

    return (
      <div className="sdom-fade">
        {/* Hero header */}
        <div className="sdom-station-header" style={{ marginBottom: 24 }}>
          <div className="sdom-station-header-meta">
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Staff Profile</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4 }}>{user?.name || tiName}</div>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>{TI_PROFILE.designation} &bull; Nagpur Division &bull; Central Railway</div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <span className="sdom-badge sdom-badge-success">Category A</span>
              <span className="sdom-badge sdom-badge-success">Inspector</span>
              <span className="sdom-badge sdom-badge-success">Active</span>
            </div>
          </div>
          <div className="sdom-station-header-stats">
            <div className="sdom-station-header-stat">
              <span className="val">88%</span>
              <span className="lbl">Section Avg</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }}/>
            <div className="sdom-station-header-stat">
              <span className="val">+91 98900 12211</span>
              <span className="lbl">Contact</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }}/>
            <div className="sdom-station-header-stat">
              <span className="val">2026-05-28</span>
              <span className="lbl">Last Audit</span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="sdom-row-2" style={{ marginBottom: "24px" }}>
          <div className="sdom-chart-card">
            <div className="sdom-chart-title" style={{ marginBottom: "16px" }}>Personal & Professional Details</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', paddingBottom: '20px' }}>
              {[
                ["Employee ID / HRMS ID", user?.hrmsId || tiId],
                ["Designation", TI_PROFILE.designation],
                ["Mobile Number", "+91 98900 12211"],
                ["Email ID", `${(user?.hrmsId || tiId).toLowerCase()}@rail.in`],
                ["Account Status", "Active"],
                ["Current Zone", "Central Railway"],
                ["Current Division", "Nagpur Division"],
                ["Current Placement", TI_PROFILE.jurisdiction],
                ["Reporting Officer", "P. K. Verma (Sr. DOM)"]
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{lbl}</div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Operational & Safety Dates Card */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#0f172a', fontWeight: '800', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                Operational & Safety Dates
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', fontSize: '13px' }}>
                <div><strong>Last Section Audit Done:</strong><div style={{fontWeight: 700, color: "#065f46", marginTop: 4}}>2026-05-24</div></div>
                <div><strong>Next Audit Due:</strong><div style={{fontWeight: 700, color: "#991b1b", marginTop: 4}}>2026-06-24</div></div>
                <div><strong>Inspector Safety Training:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>2025-11-05</div></div>
                <div><strong>Safety Seminar Attended:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>2026-04-02</div></div>
                
                <div><strong>PME Done Date:</strong><div style={{fontWeight: 700, color: "#065f46", marginTop: 4}}>{TI_PROFILE.pmeDoneDate}</div></div>
                <div><strong>PME Due Date:</strong><div style={{fontWeight: 700, color: "#991b1b", marginTop: 4}}>{TI_PROFILE.pmeDueDate}</div></div>
                <div><strong>Isolator Certificate issued:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>{TI_PROFILE.isolatorCertDate}</div></div>
                <div><strong>Automatic Training Date:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>{TI_PROFILE.autoTrainingDate}</div></div>
                <div style={{ gridColumn: "span 2" }}><strong>Counselling Done Date:</strong><div style={{fontWeight: 700, color: "#d97706", marginTop: 4}}>{TI_PROFILE.counsellingDate || "2026-04-10"}</div></div>
                
                <div style={{ gridColumn: "span 2", marginTop: 8 }}>
                  <strong>Assigned Stations Under Jurisdiction ({myStations.length})</strong>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {myStations.map(st => <span key={st.id} className="sdom-badge sdom-badge-blue" style={{ fontSize: "11px", fontWeight: "700" }}>{st.code} - {st.name}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sdom-chart-card">
            <div className="sdom-chart-title">Section Performance Trend</div>
            <div className="sdom-chart-subtitle">Section Average Performance progression</div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sectionPerformanceData}>
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

  // Sub-view: Staff Detail (drill-down) - Declared at parent scope
  const renderStaffDetail = (s) => {
    const computedRisk = getUserRisk(s);
    const scoreData = MONTHLY_TREND.map((m, i) => ({ month: m.month, score: Math.max(50, s.score - 10 + i * 2) }));
    
    return (
      <div className="sdom-fade">
        <div style={{ marginBottom: 24 }}>
          <button className="sdom-back-btn" onClick={() => {
            if (view?.returnTo === "stationDetail") {
              setView({ type: "stationDetail", data: view.stationData });
            } else if (view?.returnTo === "pointsmen" || view?.returnTo === "stationMasters" || view?.returnTo === "stationSuperintendents" || view?.returnTo === "trainManagers") {
              setView(null);
            } else {
              setView(null);
              setSelectedStation(null);
            }
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
              <span className="val">{s.score}</span>
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

  /* ═══════════════════════════════════════════
     RENDER: STATIONS
     (Card grid layout + detailed clickable sub-view)
  ═══════════════════════════════════════════ */
  const renderStations = () => {
    const RISK_COLORS = {
      Low: "#16a34a",
      Medium: "#f59e0b",
      High: "#ef4444"
    };

    const CAT_COLORS = {
      A: "#16a34a",
      B: "#2563eb",
      C: "#d97706",
      D: "#dc2626"
    };

    const renderCategoryBadge = (category) => {
      const value = String(category || "").trim().toUpperCase();
      const isRank = ["A", "B", "C", "D"].includes(value);

      if (isRank) {
        return <span className={`category-circle category-${value.toLowerCase()}`}>{value}</span>;
      }

      return <span className="category-text-chip">{value || "-"}</span>;
    };

    // Sub-view: Station Detail Dashboard (drill-down)
    const renderStationDetail = (st) => {
      const stStaff = users.filter(s => s.station === st.name).map(u => ({
        ...u,
        risk: getUserRisk(u)
      }));
      const pmList = stStaff.filter(s => s.role === "Pointsman" || s.role === "pointsmen");
      const smList = stStaff.filter(s => s.role === "Station Master" || s.role === "sm");
      
      const catCount = ["A", "B", "C", "D"].map(c => ({
        cat: `Cat ${c}`,
        count: stStaff.filter(s => (s.cat || getCat(s.score)) === c).length,
        fill: CAT_COLORS[c]
      }));

      const riskCount = [
        { name: "Low", value: stStaff.filter(s => s.risk === "Low").length, fill: "#16a34a" },
        { name: "Medium", value: stStaff.filter(s => s.risk === "Medium").length, fill: "#f59e0b" },
        { name: "High", value: stStaff.filter(s => s.risk === "High").length, fill: "#ef4444" },
      ].filter(r => r.value > 0);

      const trend = MONTHLY_TREND.map(m => ({ ...m, score: Math.max(60, st.score - 8 + MONTHLY_TREND.indexOf(m) * 2) }));

      return (
        <div className="sdom-fade">
          <div style={{ marginBottom: 20 }}>
            <button className="sdom-back-btn" onClick={() => { setView(null); setSelectedStation(null); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 700 }}>
              <ArrowLeft size={16} /> Back to Stations
            </button>
          </div>

          <div className="sdom-station-header">
            <div className="sdom-station-header-meta">
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Station Analytics Dashboard</div>
              <div style={{ fontSize: "1.9rem", fontWeight: 800, marginBottom: 4 }}>{st.name}</div>
              <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>Code: <b>{st.code}</b> &bull; Assigned TI: <b>{st.ti}</b></div>
              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                <span className="sdom-badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>{st.smCount} Station Masters</span>
                <span className="sdom-badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>{st.pmCount} Pointsmen</span>
                <span className={`sdom-badge ${st.highRisk > 4 ? "sdom-badge-red" : "sdom-badge-green"}`}>{st.highRisk} High-Risk</span>
              </div>
            </div>
            <div className="sdom-station-header-stats">
              <div className="sdom-station-header-stat">
                <span className="val">{st.score}</span>
                <span className="lbl">Avg Score</span>
              </div>
              <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }} />
              <div className="sdom-station-header-stat">
                <span className="val">{st.safety}%</span>
                <span className="lbl">Safety</span>
              </div>
              <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }} />
              <div className="sdom-station-header-stat">
                <span className="val">{st.pending}</span>
                <span className="lbl">Pending</span>
              </div>
              <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }} />
              <div className="sdom-station-header-stat">
                <span className="val">{stStaff.length}</span>
                <span className="lbl">Total Staff</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total Staff", val: stStaff.length },
              { label: "Pending Assessments", val: st.pending },
              { label: "Completed", val: stStaff.filter(s => s.status === "Approved" || s.status === "Submitted").length },
              { label: "High-Risk Pointsmen", val: pmList.filter(s => s.risk === "High").length },
              { label: "Safety Compliance", val: `${st.safety}%` },
            ].map(c => (
              <div key={c.label} className="sdom-stat-card">
                <div className="sdom-stat-value">{c.val}</div>
                <div className="sdom-stat-label">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="sdom-row-2">
            <div className="sdom-chart-card">
              <div className="sdom-chart-title">Category/Grade Distribution</div>
              <div className="sdom-chart-subtitle">A/B/C/D breakdown of staff at this station</div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catCount} barSize={46} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9E2EC" />
                    <XAxis dataKey="cat" fontSize={12} tick={{ fill: "#102A43", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis fontSize={11} tick={{ fill: "#627D98" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: "0.85rem", borderRadius: 6, border: "1px solid #D9E2EC" }} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                      {catCount.map((d, i) => <Cell key={i} fill={CAT_COLORS[Object.keys(CAT_COLORS)[i]]} />)}
                      <LabelList dataKey="count" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "#102A43" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="sdom-chart-card">
              <div className="sdom-chart-title">Risk Distribution</div>
              <div className="sdom-chart-subtitle">Staff risk level breakdown at this station</div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskCount} cx="50%" cy="50%" innerRadius={70} outerRadius={105}
                         dataKey="value" paddingAngle={4}
                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                         labelLine={false}>
                      {riskCount.map((d, i) => <Cell key={i} fill={RISK_COLORS[d.name]} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: "0.82rem" }} />
                    <Tooltip contentStyle={{ fontSize: "0.85rem", borderRadius: 6, border: "1px solid #D9E2EC" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="sdom-row-1">
            <div className="sdom-chart-card">
              <div className="sdom-chart-title" style={{ marginBottom: 16 }}>Station Masters</div>
              <div className="sdom-table-wrap">
                <table className="sdom-table">
                  <thead><tr><th>Name</th><th>HRMS ID</th><th>Category</th><th>Last Score</th><th>Last Assessment</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {smList.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>No Station Masters assigned</td></tr>}
                    {smList.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700 }}>{s.name}</td>
                        <td style={{ color: "#64748b", fontSize: "0.85rem" }}>{s.id}</td>
                        <td>{catBadge(s.cat || getCat(s.score))}</td>
                        <td style={{ fontWeight: 700 }}>{s.score}</td>
                        <td>{s.lastAssessDate || s.lastDate || "—"}</td>
                        <td>{statusBadge(s.status || "Active")}</td>
                        <td><button className="sdom-btn-ghost" onClick={() => setView({ type: "staffDetail", data: s, returnTo: "stationDetail", stationData: st })}>View Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="sdom-row-1">
            <div className="sdom-chart-card">
              <div className="sdom-chart-title" style={{ marginBottom: 16 }}>Pointsmen</div>
              <div className="sdom-table-wrap">
                <table className="sdom-table">
                  <thead><tr><th>Name</th><th>HRMS ID</th><th>Category</th><th>Risk Level</th><th>Latest Score</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {pmList.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>No Pointsmen assigned</td></tr>}
                    {pmList.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700 }}>{s.name}</td>
                        <td style={{ color: "#64748b", fontSize: "0.85rem" }}>{s.id}</td>
                        <td>{catBadge(s.cat || getCat(s.score))}</td>
                        <td>{riskBadge(s.risk)}</td>
                        <td style={{ fontWeight: 700 }}>{s.score}</td>
                        <td>{statusBadge(s.status || "Active")}</td>
                        <td><button className="sdom-btn-ghost" onClick={() => setView({ type: "staffDetail", data: s, returnTo: "stationDetail", stationData: st })}>View Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    };

    if (view?.type === "staffDetail") return renderStaffDetail(view.data);
    if (view?.type === "stationDetail") return renderStationDetail(view.data);

    // Main Station List rendering (looks exactly like AOM's renderStations)
    const filtered = stationStats.map(st => {
      const smCount = users.filter(u => u.station === st.name && (u.role === "Station Master" || u.role === "sm")).length;
      const pmCount = users.filter(u => u.station === st.name && (u.role === "Pointsman" || u.role === "pointsmen")).length;
      const pmPending = myPmList.filter(p => p.station === st.name && p.status === "Pending").length;
      const smPending = mySmList.filter(s => s.station === st.name && s.status === "Pending").length;
      const tmPending = myTmList.filter(t => t.station === st.name && t.status === "Pending").length;
      const pending = pmPending + smPending + tmPending;
      
      return {
        ...st,
        ti: user.name || "TI R. Khan",
        smCount,
        pmCount,
        score: st.avgScore,
        safety: st.safetyPct,
        highRisk: st.highRisk,
        pending
      };
    }).filter(st => {
      const q = stSearch.toLowerCase();
      const matchesSearch = !q || st.name.toLowerCase().includes(q) || st.code.toLowerCase().includes(q);
      const matchesCat = stCatFilter === "All" || getCat(st.avgScore) === stCatFilter;
      return matchesSearch && matchesCat;
    });

    return (
      <div className="sdom-fade">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h1 className="sdom-page-title">Stations</h1>
            <p className="sdom-page-subtitle">Full list of stations under your jurisdiction. Click a station to open its complete analytics dashboard.</p>
          </div>
          <button className="sdom-btn-primary" onClick={() => {
            setNewStationData({ name: "", code: "" });
            setShowAddStationModal(true);
          }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Add New Station
          </button>
        </div>

        <div className="sdom-filter-bar" style={{ display: "flex", gap: "12px", flexWrap: "nowrap", marginBottom: "16px" }}>
          <div className="sdom-filter-field" style={{ flex: 1 }}>
            <label>Search Station</label>
            <input value={stSearch} onChange={e => setStSearch(e.target.value)} placeholder="Station name or code..." />
          </div>
          <div className="sdom-filter-field" style={{ width: "200px" }}>
            <label>Category Filter</label>
            <select value={stCatFilter} onChange={e => setStCatFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="A">Grade A Stations</option>
              <option value="B">Grade B Stations</option>
              <option value="C">Grade C Stations</option>
              <option value="D">Grade D Stations</option>
            </select>
          </div>
        </div>

        <div className="sdom-chart-card">
          <div className="sdom-table-wrap">
            <table className="sdom-table">
              <thead>
                <tr>
                  <th>Station Name</th>
                  <th>Code</th>
                  <th>Assigned TI</th>
                  <th>SMs</th>
                  <th>Pointsmen</th>
                  <th>Avg Score</th>
                  <th>Safety %</th>
                  <th>High Risk</th>
                  <th>Pending</th>
                  <th>Dashboard</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", color: "#64748b", padding: "24px" }}>
                      No stations found matching filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(st => (
                    <tr key={st.id}>
                      <td style={{ fontWeight: 700 }}>{st.name}</td>
                      <td><span className="sdom-badge sdom-badge-blue">{st.code}</span></td>
                      <td>{st.ti}</td>
                      <td>{st.smCount}</td>
                      <td>{st.pmCount}</td>
                      <td style={{ fontWeight: 700, color: st.score >= 85 ? "#16a34a" : st.score >= 75 ? "#d97706" : "#dc2626" }}>{st.score}%</td>
                      <td>{st.safety}%</td>
                      <td>{st.highRisk > 3 ? <span style={{ color: "#dc2626", fontWeight: 700 }}>{st.highRisk}</span> : st.highRisk}</td>
                      <td>{st.pending}</td>
                      <td>
                        <button className="sdom-btn-primary" style={{ padding: "7px 14px", fontSize: "0.82rem" }} onClick={() => setSelectedStation(st)}>
                          Open Station Dashboard
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAddStationModal && (
          <div className="sdom-modal-overlay" style={{ zIndex: 9999 }}>
            <div className="sdom-modal" style={{ width: "450px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0B1F3A" }}>Add New Station</h3>
                <button type="button" onClick={() => setShowAddStationModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>&times;</button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="sdom-filter-field">
                  <label style={{ fontWeight: 600, fontSize: "0.8rem", color: "#334155" }}>Station Name</label>
                  <input type="text" value={newStationData.name} onChange={e => setNewStationData({ ...newStationData, name: e.target.value })} placeholder="e.g. Wardha Junction" />
                </div>
                <div className="sdom-filter-field">
                  <label style={{ fontWeight: 600, fontSize: "0.8rem", color: "#334155" }}>Station Code</label>
                  <input type="text" value={newStationData.code} onChange={e => setNewStationData({ ...newStationData, code: e.target.value })} placeholder="e.g. WR" />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button className="sdom-btn-outline" onClick={() => setShowAddStationModal(false)}>Cancel</button>
                <button className="sdom-btn-primary" onClick={handleAddStationSubmit}>Create Station</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     RENDER: ROLE VIEW (Parity with AOM Pointsmen & Station Masters Directories)
     (Allows search, filter, edit, shift, and delete actions for scoped roles)
     (Provides full AOM design alignment using sdom.css tokens)
  ═══════════════════════════════════════════ */
  const renderEditUserModal = () => (
    <div className="sdom-modal-overlay" onClick={e => e.target === e.currentTarget && setEditingUser(null)}>
      <div className="sdom-modal" style={{ width: "900px", maxWidth: "95vw" }}>
        <form onSubmit={saveEditedUser} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Header inside modal */}
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

          {/* Section 1: General & Contact Information */}
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

          {/* Section 2: Designation & Station Placement Setup */}
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
          
          {/* Header inside modal */}
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

          {/* Section 1: General & Contact Information */}
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

          {/* Section 2: Designation & Station Placement Setup */}
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


  const renderRoleView = (roleKey, title) => {
    // If a profile detail is being viewed
    if (view?.type === "staffDetail") return renderStaffDetail(view.data);

    // Filter logic mirroring SuperAdmin's generic filtering
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

          {/* Filters - EXACT match of SuperAdmin style */}
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
                            <button className="sdom-btn-outline" style={{ padding: "5px 10px", fontSize: "0.8rem" }} onClick={() => setView({ type: "staffDetail", data: s, returnTo: activePage })}>View</button>
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

        {/* Modals rendered inside the page for visual safety */}
        {editingUser && renderEditUserModal()}
        {transferringUser && renderTransferUserModal()}
        {showAddUserModal && renderAddUserModal()}
      </div>
    );
  };


  /* ═══════════════════════════════════════════
     RENDER: MY ASSESSMENTS PAGE
     (Interactive Quiz + timeline scorecard history)
  ═══════════════════════════════════════════ */
  const renderMyAssessment = ()=>{
    if (quizState === "quiz") {
      const question = TI_QUIZ[currentQuestion];
      const answeredCount = quizAnswers.filter(r => r !== null && r !== undefined).length;
      const completionRate = Math.round((answeredCount / 25) * 100);
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
          overflow: "hidden"
        }}>
          {/* Header Bar: TCS iON Style */}
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
                  TRAFFIC INSPECTOR CBT COMPETENCY EVALUATION
                </h1>
                <p style={{margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 500}}>
                  Official Online Railway Rules &amp; Operational Safety Examination (2026 Cycle)
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
                â³ TIME ELAPSED: <span style={{color: "#3b82f6"}}>Active Session</span>
              </div>
              
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to exit the exam? Your progress will not be saved.")) {
                    setQuizState("idle");
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
              Candidate Name: <strong style={{color: "#2563eb"}}>{tiName}</strong> &nbsp;|&nbsp; HRMS ID: <strong style={{color: "#2563eb"}}>{tiId}</strong> &nbsp;|&nbsp; Section Scope: <strong>Parbhani-Amla Section</strong>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 12}}>
              <span style={{fontWeight: 600}}>Progress: <strong style={{color: "#2563eb"}}>{answeredCount} / 25 Answered</strong> ({completionRate}%)</span>
              <div style={{width: 140, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden"}}>
                <div style={{width: `${completionRate}%`, height: "100%", background: "#2563eb", borderRadius: 4}}/>
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
              
              {/* Immersive Question Card */}
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
                    color: "#2563eb",
                    background: "#dbeafe",
                    padding: "6px 14px",
                    borderRadius: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px"
                  }}>
                    Question {currentQuestion + 1} of 25
                  </span>
                  
                  <h2 style={{
                    fontSize: 22, 
                    fontWeight: 700, 
                    color: "#0f172a", 
                    marginTop: 24, 
                    marginBottom: 28, 
                    lineHeight: 1.5
                  }}>
                    {question.q}
                  </h2>

                  <div style={{display: "flex", flexDirection: "column", gap: 14}}>
                    {question.opts.map((opt, oi) => {
                      const isSelected = quizAnswers[currentQuestion] === oi;
                      return (
                        <label key={oi} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "18px 24px",
                          border: isSelected ? "2.5px solid #2563eb" : "1.5px solid #e2e8f0",
                          borderRadius: 12,
                          background: isSelected ? "#eff6ff" : "#ffffff",
                          cursor: "pointer",
                          boxShadow: isSelected ? "0 4px 6px rgba(37, 99, 235, 0.08)" : "none",
                          transition: "all 0.15s ease"
                        }} className="sm-option-hover">
                          <input
                            type="radio"
                            name={`ti-q-${currentQuestion}`}
                            checked={isSelected}
                            onChange={() => {
                              handleSelectQuizOpt(oi);
                            }}
                            style={{width: 20, height: 20, accentColor: "#2563eb"}}
                          />
                          <span style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: isSelected ? "#1e40af" : "#64748b",
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
                  â† Previous Question
                </button>

                <div style={{fontSize: 14, color: "#64748b"}}>
                  {unansweredCount > 0 ? (
                    <span style={{color: "#d97706", fontWeight: 800, display: "flex", alignItems: "center", gap: 6}}>
                      âš ï¸ {unansweredCount} question{unansweredCount > 1 ? "s" : ""} remaining to unlock submission
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
                  background: "#dbeafe",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  margin: "0 auto 10px"
                }}>
                  {tiName.charAt(0)}
                </div>
                <h3 style={{fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0}}>{tiName}</h3>
                <span style={{fontSize: 12, color: "#64748b", fontWeight: 500}}>HRMS ID: {tiId}</span>
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
                {TI_QUIZ.map((q, idx) => {
                  const isCurrent = idx === currentQuestion;
                  const isAnswered = quizAnswers[idx] !== null && quizAnswers[idx] !== undefined;
                  
                  let btnBg = "#ffffff";
                  let btnBorder = "1.5px solid #cbd5e1";
                  let btnColor = "#475569";
                  let fontWeight = "600";

                  if (isCurrent) {
                    btnBg = "#dbeafe";
                    btnBorder = "2px solid #2563eb";
                    btnColor = "#1e40af";
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
                      key={idx}
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
                      {idx + 1}
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
                  <span style={{width: 16, height: 16, background: "#dbeafe", border: "2px solid #2563eb", borderRadius: 4}}/>
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
                  onClick={submitQuiz}
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
                    * All 25 questions must be answered first ({unansweredCount} remaining)
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      );
    }

    if (selectedRecord) {
      const sc = selectedRecord;
      const cat = sc.category || "A";
      const liveTotal = sc.totalScore || 0;
      const performanceSummary = getPerformanceSummaryText(liveTotal, sc.sections);

      return (
        <div className="ti2-card animate-fade-in" style={{ padding: "24px", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          <div className="ti2-card-hdr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "20px" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}><ShieldCheck size={22} color="#16a34a"/> Detailed Evaluation Scorecard</h2>
            <button className="ti2-primary-btn" onClick={() => { setSelectedRecord(null); setQuizState("idle"); }}>← Return to History</button>
          </div>

          <div className="pm-scorecard-hero" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
            <div className="pm-sc-score-circle" style={{ width: "90px", height: "90px", borderRadius: "50%", border: `6px solid ${CAT_C[cat] || "#2563eb"}`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flexShrink: 0, background: "#fff" }}>
              <strong style={{ fontSize: "24px", color: CAT_C[cat] || "#2563eb", fontWeight: "800" }}>{liveTotal}</strong>
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", marginTop: "-2px" }}>/100</span>
            </div>
            <div>
              <span className="pm-cat-badge-lg" style={{ background: CAT_B[cat], color: CAT_C[cat], display: "inline-block", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
                Final Category: Category {cat}
              </span>
              <p className="pm-sc-period" style={{ margin: "2px 0", fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>{sc.period} - Self-Compliance Audit</p>
              <p className="pm-sc-date" style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Attempt Completed: {sc.date} &nbsp;·&nbsp; Assessed By: {sc.assessedBy || "Area Operation Manager"}</p>
            </div>
          </div>

          {/* Dynamic Performance Summary */}
          <div className="pm-performance-summary-box" style={{ background: "#eff6ff", borderLeft: "4px solid #2563eb", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "6px" }}>📊 Official Performance Evaluation Summary</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#1e3a8a", lineHeight: "1.5" }}>{performanceSummary}</p>
          </div>

          {/* Competency Domain Breakdown */}
          <div className="pm-sc-sections" style={{ marginBottom: "30px" }}>
            <h3 style={{ fontSize: "15px", color: "#0f172a", marginBottom: "16px", fontWeight: "700" }}>Safety Domain Competency Breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sc.sections.map(s => {
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
              {TI_QUIZ.map((q, qIndex) => {
                const selectedOpt = sc.userAnswers ? sc.userAnswers[qIndex] : null;
                const isCorrect = selectedOpt === q.ans;

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
                    <h4 className="pm-rq-text">{q.q}</h4>

                    <div className="pm-rq-options-grid">
                      {q.opts.map((opt, oIdx) => {
                        const wasSelected = selectedOpt === oIdx;
                        const isOptCorrect = q.ans === oIdx;
                        
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

    const testActive = isExamAssigned;
    const avgScore = tiAssessments.length 
      ? Math.round(tiAssessments.reduce((s, a) => s + a.totalScore, 0) / tiAssessments.length) 
      : 0;

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
                  Your supervisor (Area Operation Manager) has scheduled a periodic safety &amp; competency assessment for you. You must complete the 25-question MCQ exam.
                </p>
                <button
                  onClick={startQuiz}
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
                <strong style={{color:"#14532d", fontSize:13}}>{tiAssessments[0] ? `${tiAssessments[0].totalScore}%` : "88%"}</strong>
              </div>
              <div style={{borderLeft:"1px solid #bbf7d0", paddingLeft:16}}>
                <span style={{color:"#166534", display:"block"}}>Next Due Date</span>
                <strong style={{color:"#14532d", fontSize:13}}>25 Sep 2026</strong>
              </div>
            </div>
          </div>
        )}

        <div className="sm2-card-hdr"><h2>My Assessment History (by AOM)</h2></div>
        <p className="sm2-subtitle">All assessments conducted by the Area Operation Manager for your section. Click any row to view the detailed scorecard.</p>

        {/* Summary strip */}
        <div className="sm2-myassess-summary">
          <div className="sm2-report-mini">
            <label>Total Assessments</label>
            <strong>{tiAssessments.length}</strong>
          </div>
          <div className="sm2-report-mini">
            <label>Latest Score</label>
            <strong>{tiAssessments[0] ? `${tiAssessments[0].totalScore}/100` : "—"}</strong>
          </div>
          <div className="sm2-report-mini">
            <label>Average AOM Score</label>
            <strong>{avgScore ? `${avgScore}/100` : "—"}</strong>
          </div>
          <div className="sm2-report-mini">
            <label>Latest Assessment</label>
            <strong style={{color: CAT_C[tiAssessments[0]?.category] || "#2563eb"}}>
              {tiAssessments[0] ? `Category ${tiAssessments[0].category}` : "—"}
            </strong>
          </div>
        </div>

        {/* List */}
        <div className="sm2-myassess-list">
          <div className="sm2-myassess-head">
            {["Period","Date","Score Scale","Category","Assessed By","Status",""].map(h =>
              <span key={h}>{h}</span>)}
          </div>
          {tiAssessments.map(sc => {
            const cat = sc.category;
            return (
              <button key={sc.id} className="sm2-myassess-row" onClick={() => setSelectedRecord(sc)}>
                <span title={`Cycle: ${sc.period}\nDuration: ${formatQuarterPeriod(sc.period)}`}>
                  <strong>{formatQuarterPeriod(sc.period)}</strong>
                </span>
                <span>{sc.date}</span>
                <span><strong>{sc.totalScore}/100</strong></span>
                <span>
                  <span className="sm2-badge" style={{background:CAT_B[cat],color:CAT_C[cat]}}>
                    Cat. {cat}
                  </span>
                </span>
                <span style={{fontSize:11,color:"#64748b"}}>{sc.assessedBy}</span>
                <span>
                  <span className={`sm2-status-pill sm2-status-${sc.approvalStatus.toLowerCase()}`}>{sc.approvalStatus}</span>
                </span>
                <span style={{color:"#2563eb",fontSize:12,fontWeight:600}}>View Form</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  /* ═══════════════════════════════════════════
     RENDER: PME POSITION PAGE
  ═══════════════════════════════════════════ */
  const renderPmePosition = () => {
    const due = users.filter(u => u.pmeStatus === "Due" || u.pmeStatus === "Pending");
    const fit = users.filter(u => u.pmeStatus === "Fit");
    const overdue = users.filter(u => u.pmeStatus === "Overdue" || u.pmeStatus === "Unfit");
    
    return (
      <div className="ti2-page-body animate-fade-in">
        <div className="ti2-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2>Periodic Medical Examination (PME) Position</h2>
              <p className="ti2-subtitle" style={{ margin: "2px 0 0" }}>Track periodic medical exam clearances, overdue alerts, and compliance targets.</p>
            </div>
            <button className="ti2-view-profile-btn" onClick={() => exportAlert("PDF", "Section_PME_Compliance_Report")}>
              <Download size={13}/> PME Report
            </button>
          </div>

          <div className="ti2-myassess-summary" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="ti2-report-mini" style={{ borderLeft: "4px solid #16a34a" }}><label>PME FIT Clearance</label><strong style={{ color: "#16a34a" }}>{fit.length} staff</strong></div>
            <div className="ti2-report-mini" style={{ borderLeft: "4px solid #d97706" }}><label>PME Due / Pending</label><strong style={{ color: "#d97706" }}>{due.length} staff</strong></div>
            <div className="ti2-report-mini" style={{ borderLeft: "4px solid #dc2626" }}><label>PME Overdue (High Risk)</label><strong style={{ color: "#dc2626" }}>{overdue.length} alerts</strong></div>
          </div>

          <div className="ti2-profile-sec-title" style={{ color: "#dc2626" }}>CRITICAL PME OVERDUE ALERTS ({overdue.length})</div>
          <div className="ti2-table-wrap">
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.5fr 1fr 1.2fr", padding: "10px 14px", background: "#fee2e2", color: "#991b1b", fontWeight: "700", fontSize: "11px" }}>
              <span>Staff Name</span>
              <span>HRMS ID</span>
              <span>Designation</span>
              <span>Assigned Station</span>
              <span>PME Status</span>
              <span>Action Taken</span>
            </div>
            {overdue.map(u => (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.5fr 1fr 1.2fr", padding: "12px 14px", borderBottom: "1px solid #fecdd3", fontSize: "13px", alignItems: "center" }}>
                <strong>{u.name}</strong>
                <span style={{ fontFamily: "monospace" }}>{u.id}</span>
                <span>{u.designation}</span>
                <strong>{u.station}</strong>
                <span style={{ color: "#dc2626", fontWeight: "800" }}>{u.pmeStatus}</span>
                <span><button className="ti2-danger-btn" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => { triggerNotification("warning", `Counselling scheduled for ${u.name}`); setGoToCounselling(u.name); }}>Schedule Counselling</button></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const setGoToCounselling = (name) => {
    setNewCoun(prev => ({ ...prev, staffName: name, topics: "PME evaluation preparation and rest compliance briefings." }));
    goTo("counselling");
    setShowCounForm(true);
  };

  /* ═══════════════════════════════════════════
     RENDER: REF POSITION PAGE
  ═══════════════════════════════════════════ */
  const renderRefPosition = () => {
    const completed = users.filter(u => u.refStatus === "Cleared");
    const pending = users.filter(u => u.refStatus === "Pending");
    const expired = users.filter(u => u.refStatus === "Expired" || u.refStatus === "Failed");

    return (
      <div className="ti2-page-body animate-fade-in">
        <div className="ti2-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2>Refresher Course (REF) training position</h2>
              <p className="ti2-subtitle" style={{ margin: "2px 0 0" }}>Monitor pointsmen safety refresher training compliance ledger.</p>
            </div>
            <button className="ti2-view-profile-btn" onClick={() => exportAlert("PDF", "REF_Refresher_Training_Position")}>
              <Download size={13}/> REF Report
            </button>
          </div>

          <div className="ti2-myassess-summary" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="ti2-report-mini" style={{ borderLeft: "4px solid #16a34a" }}><label>REF Cleared / Completed</label><strong style={{ color: "#16a34a" }}>{completed.length} staff</strong></div>
            <div className="ti2-report-mini" style={{ borderLeft: "4px solid #d97706" }}><label>REF Pending Class</label><strong style={{ color: "#d97706" }}>{pending.length} staff</strong></div>
            <div className="ti2-report-mini" style={{ borderLeft: "4px solid #dc2626" }}><label>REF Expired alerts</label><strong style={{ color: "#dc2626" }}>{expired.length} personnel</strong></div>
          </div>

          <div className="ti2-profile-sec-title">REF Training Alert List</div>
          <div className="ti2-table-wrap">
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.5fr 1fr 1.2fr", padding: "10px 14px", background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "11px" }}>
              <span>Staff Name</span>
              <span>HRMS ID</span>
              <span>Designation</span>
              <span>Station Section</span>
              <span>REF Status</span>
              <span>Action Clearance</span>
            </div>
            {users.filter(u => u.refStatus !== "Cleared").map(u => (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.5fr 1fr 1.2fr", padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "13px", alignItems: "center" }}>
                <strong>{u.name}</strong>
                <span style={{ fontFamily: "monospace" }}>{u.id}</span>
                <span>{u.designation}</span>
                <strong>{u.station}</strong>
                <span style={{ color: u.refStatus === "Expired" ? "#dc2626" : "#d97706", fontWeight: "800" }}>{u.refStatus}</span>
                <span><button className="ti2-primary-btn-sm" style={{ fontSize: "11px", padding: "5px 12px" }} onClick={() => { alert(`✓ Clear REF action submitted: ${u.name} scheduled for refresher training batches.`); setUsers(prev=>prev.map(x=>x.id===u.id?{...x, refStatus: "Cleared"}:x)); addAuditLog("Clear REF training", `Scheduled refresher course for ${u.name}`); }}>Clear REF</button></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     RENDER: INSPECTIONS PAGE
  ═══════════════════════════════════════════ */
  const renderInspections = () => (
    <div className="ti2-page-body animate-fade-in">
      <div className="ti2-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2>Field Inspection Reports &amp; Schedules</h2>
            <p className="ti2-subtitle" style={{ margin: "2px 0 0" }}>Schedule field audits, document safety observations, and log track point compliance.</p>
          </div>
          <button className="ti2-primary-btn" onClick={() => setShowInspForm(!showInspForm)}>
            <Plus size={13}/> {showInspForm ? "Close Form" : "Log New Inspection"}
          </button>
        </div>

        {showInspForm && (
          <form onSubmit={submitInspection} className="ti2-assess-form" style={{ padding: "18px", border: "1px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc", marginBottom: "18px" }}>
            <div className="ti2-form-field">
              <label>Audited Station</label>
              <select value={newInsp.station} onChange={e=>setNewInsp({...newInsp, station: e.target.value})} required>
                {myStations.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
              </select>
            </div>
            
            <div className="ti2-form-field">
              <label>Risk Level Class</label>
              <select value={newInsp.risk} onChange={e=>setNewInsp({...newInsp, risk: e.target.value})} required>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="ti2-form-field" style={{ gridColumn: "1/-1" }}>
              <label>Safety Observations &amp; Point Audit Remarks</label>
              <textarea rows={3} value={newInsp.observations} onChange={e=>setNewInsp({...newInsp, observations: e.target.value})} placeholder="Describe joint clearance, signal relays, shunting speed compliance observations..." required/>
            </div>

            <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" className="ti2-ghost-btn" onClick={() => setShowInspForm(false)}>Cancel</button>
              <button type="submit" className="ti2-primary-btn">Submit Inspection Log</button>
            </div>
          </form>
        )}

        {/* Inspections ledger list */}
        <div className="ti2-table-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 3fr 1.2fr 1fr", padding: "10px 14px", background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "11px" }}>
            <span>Inspection Date</span>
            <span>Station audited</span>
            <span>Safety Observations</span>
            <span>Risk Severity</span>
            <span>Status</span>
          </div>

          {inspections.map(i => (
            <div key={i.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 3fr 1.2fr 1fr", padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "13px", alignItems: "center" }}>
              <strong>{i.date}</strong>
              <strong>{i.station}</strong>
              <span>{i.observations}</span>
              <span><span className="ti2-badge" style={{ background: RISK_B[i.risk], color: RISK_C[i.risk] }}>{i.risk} Risk</span></span>
              <span><span className="ti2-pill-grey">{i.status}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════
     RENDER: COUNSELLING PAGE
  ═══════════════════════════════════════════ */
  const renderCounselling = () => (
    <div className="ti2-page-body animate-fade-in">
      <div className="ti2-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2>Staff Counselling &amp; Behaviour Records</h2>
            <p className="ti2-subtitle" style={{ margin: "2px 0 0" }}>Brief high-risk pointsmen, log safety awareness counseling sessions, and track behaviour logs.</p>
          </div>
          <button className="ti2-primary-btn" onClick={() => setShowCounForm(!showCounForm)}>
            <Plus size={13}/> {showCounForm ? "Close Form" : "Log Counselling Briefing"}
          </button>
        </div>

        {showCounForm && (
          <form onSubmit={submitCounselling} className="ti2-assess-form" style={{ padding: "18px", border: "1px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc", marginBottom: "18px" }}>
            <div className="ti2-form-field">
              <label>Staff Roster Personnel</label>
              <select value={newCoun.staffName} onChange={e=>{
                const targetUser = users.find(u => u.name === e.target.value);
                setNewCoun({ ...newCoun, staffName: e.target.value, designation: targetUser?.designation || "Pointsman", station: targetUser?.station || "Parbhani Junction" });
              }} required>
                <option value="">Select staff member…</option>
                {users.map(u => <option key={u.id} value={u.name}>{u.name} ({u.designation} - {u.station})</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="ti2-form-field">
                <label>Session Duration</label>
                <input type="text" value={newCoun.duration} onChange={e=>setNewCoun({...newCoun, duration: e.target.value})} placeholder="e.g. 45 mins" required/>
              </div>
              <div className="ti2-form-field">
                <label>Progress Status</label>
                <select value={newCoun.progress} onChange={e=>setNewCoun({...newCoun, progress: e.target.value})} required>
                  <option>Under Monitor</option>
                  <option>Completed</option>
                  <option>Recommended for REF</option>
                </select>
              </div>
            </div>

            <div className="ti2-form-field" style={{ gridColumn: "1/-1" }}>
              <label>Briefing Topics &amp; Counselling Notes</label>
              <textarea rows={3} value={newCoun.topics} onChange={e=>setNewCoun({...newCoun, topics: e.target.value})} placeholder="Focus topics: Alcoholic rehabilitation, safe shunting speeds, whistle codes compliance, alertness..." required/>
            </div>

            <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" className="ti2-ghost-btn" onClick={() => setShowCounForm(false)}>Cancel</button>
              <button type="submit" className="ti2-primary-btn">Submit Counselling Brief</button>
            </div>
          </form>
        )}

        {/* Counselling list */}
        <div className="ti2-table-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1.2fr 2.5fr 1fr 1.2fr", padding: "10px 14px", background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "11px" }}>
            <span>Counselling Date</span>
            <span>Staff Name</span>
            <span>Designation</span>
            <span>Focus Briefing Topics</span>
            <span>Duration</span>
            <span>Progress Status</span>
          </div>

          {counsellings.map(c => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1.2fr 2.5fr 1fr 1.2fr", padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "13px", alignItems: "center" }}>
              <strong>{c.date}</strong>
              <strong>{c.staffName}</strong>
              <span><span className="ti2-pill-grey" style={{ fontSize: "10px", fontWeight: "700" }}>{c.designation}</span></span>
              <span>{c.topics}</span>
              <span>{c.duration}</span>
              <span><span className="ti2-badge" style={{ background: c.progress === "Completed" ? "#d1fae5" : "#fef3c7", color: c.progress === "Completed" ? "#065f46" : "#92400e" }}>{c.progress}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── APPROVALS (AOM PARITY REPLICATION) ── */
  const renderApprovals = ()=>{
    const tabs = ["Pending", "Approved", "Rejected"];

    /* ─── DETAIL VIEW ─── */
    if (selectedPM) {
      const secs = editSections[selectedPM.id]||selectedPM.originalSections;
      const liveTotal = secs.reduce((s,x)=>s+x.score,0);
      const liveCat   = getCat(liveTotal);
      const locked    = selectedPM.status!=="Pending";
      const reject    = rejectMode[selectedPM.id]||false;

      const pme = selectedPM.meta?.pmeStatus || "Fit";
      const ref = selectedPM.meta?.refStatus || "Cleared";
      const alc = selectedPM.meta?.alcoholicStatus || "Non-Alcoholic";

      return (
        <div className="ti2-card animate-fade-in">
          <div className="ti2-card-hdr">
            <div>
              <h2>Review — {selectedPM.pointsmanName} ({selectedPM.hrmsId})</h2>
              <p style={{margin:"2px 0 0",fontSize:12,color:"#64748b"}}>
                {selectedPM.station} · Pointsman · Submitted by {selectedPM.assessingSM} on {selectedPM.submissionDate}
              </p>
            </div>
            <button className="ti2-link-btn" onClick={()=>setSelectedPmId(null)}>â† Back</button>
          </div>

          {/* Info meta — same ti2-review-meta grid as AOM */}
          <div className="ti2-review-meta">
            <div><label>Pointsman</label><strong>{selectedPM.pointsmanName}</strong></div>
            <div><label>HRMS ID</label><strong>{selectedPM.hrmsId}</strong></div>
            <div><label>Station</label><strong>{selectedPM.station}</strong></div>
            <div><label>PME Status</label><strong className={pme==="Fit"?"ti2-green":"ti2-red"}>{pme}</strong></div>
            <div><label>REF Status</label><strong className={ref==="Cleared"?"ti2-green":"ti2-amber"}>{ref}</strong></div>
            <div><label>Alcoholic Status</label><strong>{alc}</strong></div>
          </div>

          {/* Section-wise marks — same ti2-review-sections as AOM */}
          <h4 className="ti2-sec-title">Section-wise Assessment Marks</h4>
          <div className="ti2-review-sections">
            {secs.map((sec,idx)=>{
              const pct = Math.round((sec.score/sec.max)*100);
              return (
                <div key={sec.title} className="ti2-review-sec-row">
                  <span className="ti2-review-sec-name">{sec.title}</span>
                  <div className="ti2-review-bar-wrap">
                    <div className="ti2-review-bar" style={{width:`${pct}%`,background:pct>=80?"#16a34a":pct>=50?"#2563eb":"#dc2626"}}/>
                  </div>
                  {locked ? (
                    <span className="ti2-review-score-static">{sec.score}/{sec.max}</span>
                  ) : (
                    <div className="ti2-review-score-input">
                      <input type="number" min={0} max={sec.max} value={sec.score}
                        onChange={e=>updateSec(selectedPM.id,idx,e.target.value)}/>
                      <span className="ti2-sec-max">/ {sec.max}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live score — same ti2-live-score as AOM */}
          <div className="ti2-live-score">
            <div><label>Grand Total</label><strong style={{color:CAT_C[liveCat],fontSize:22}}>{liveTotal}/100</strong></div>
            <div><label>Category</label><span className="ti2-badge" style={{background:CAT_B[liveCat],color:CAT_C[liveCat],fontSize:13,padding:"4px 14px"}}>Category {liveCat}</span></div>
          </div>

          {/* TI remarks — mirrors AOM Remarks */}
          {!locked && (
            <div className="ti2-form-field">
              <label>TI Remarks</label>
              <textarea rows={3} value={tiRemarks[selectedPM.id]||""} onChange={e=>setTiRemarks(p=>({...p,[selectedPM.id]:e.target.value}))} placeholder="Add remarks…"/>
            </div>
          )}

          {/* Reject reason input */}
          {reject && !locked && (
            <div className="ti2-form-field" style={{marginTop:10}}>
              <label style={{color:"#dc2626"}}>Rejection Reason (mandatory)</label>
              <textarea rows={2} placeholder="Enter rejection reason…" id={`reject-${selectedPM.id}`}/>
            </div>
          )}

          {/* Audit trail */}
          {selectedPM.auditTrail?.length>0 && (
            <div>
              <button className="ti2-link-btn-sm" style={{marginTop:12}} onClick={()=>setShowAudit(p=>({...p,[selectedPM.id]:!p[selectedPM.id]}))}>
                {showAudit[selectedPM.id]?"Hide":"View"} Audit Trail
              </button>
              {showAudit[selectedPM.id] && (
                <div className="ti2-audit-trail">
                  {selectedPM.auditTrail.map((a,i)=>(
                    <div key={i} className="ti2-audit-row">
                      <strong>{a.action}</strong> · {a.by} · {a.date}
                      {a.remark && <div style={{fontSize:11,color:"#64748b",marginTop:2}}>"{a.remark}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Locked banner */}
          {locked && (
            <div className="ti2-locked-banner">
              {selectedPM.status==="Approved"?"✓ Assessment Approved and Locked":"✗ Assessment Rejected"}
              {selectedPM.tiRemarks && <div style={{marginTop:4,fontSize:12}}>Remarks: {selectedPM.tiRemarks}</div>}
            </div>
          )}

          {/* Action buttons — exact same as AOM: Reject / Approve as Submitted / Modify & Approve */}
          {!locked && !reject && (
            <div className="ti2-review-actions">
              <button className="ti2-danger-btn" onClick={()=>setRejectMode(p=>({...p,[selectedPM.id]:true}))}>
                <XCircle size={14}/> Reject
              </button>
              <button className="ti2-ghost-btn" onClick={()=>finalizePM(selectedPM.id,"approve")}>
                <CheckCircle2 size={14}/> Approve as Submitted
              </button>
              <button className="ti2-primary-btn" onClick={()=>finalizePM(selectedPM.id,"modify")}>
                <CheckCircle2 size={14}/> Modify &amp; Approve
              </button>
            </div>
          )}
          {reject && !locked && (
            <div className="ti2-review-actions">
              <button className="ti2-ghost-btn" onClick={()=>setRejectMode(p=>({...p,[selectedPM.id]:false}))}>Cancel</button>
              <button className="ti2-danger-btn" onClick={()=>{
                const note=document.getElementById(`reject-${selectedPM.id}`)?.value||"No reason provided";
                finalizePM(selectedPM.id,"reject",note);
              }}>Confirm Rejection</button>
            </div>
          )}
        </div>
      );
    }

    /* ─── LIST VIEW ─── */
    return (
      <div className="ti2-card animate-fade-in">
        <div className="ti2-card-hdr">
          <h2>Approvals — Pointsmen</h2>
        </div>
        <p className="ti2-subtitle">Review and approve Pointsman assessments submitted by Station Masters.</p>

        {/* Role switch — mirrors AOM's approvals style */}
        <div className="ti2-tabs" style={{marginBottom:4}}>
          <button className="ti2-tab active">
            Pointsmen
            <span className="ti2-tab-count">
              {pmList.filter(p => p.status === "Pending").length}
            </span>
          </button>
        </div>

        {/* Status tabs — same ti2-tabs as AOM */}
        <div className="ti2-tabs">
          {tabs.map(t => (
            <button key={t} className={`ti2-tab ${reviewTab === t ? "active" : ""}`} onClick={() => setReviewTab(t)}>
              {t} <span className="ti2-tab-count">
                {pmList.filter(p => p.status === t).length}
              </span>
            </button>
          ))}
        </div>

        {/* Filters — exact same as AOM */}
        <div className="ti2-filter-row">
          <div className="ti2-search-box">
            <Search size={13}/>
            <input placeholder="Search pointsman…"
              value={reviewSearch} onChange={e => setReviewSearch(e.target.value)}/>
          </div>
          <select className="ti2-select" value={reviewStation} onChange={e => setReviewStation(e.target.value)}>
            <option value="All">All Stations</option>
            {myStations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        {/* Table — exact same structure as AOM */}
        <div className="ti2-table-wrap">
          <div className="ti2-pm-head ti2-pm-row">
            {["Name","HRMS ID","Station","Submitted By","Date","Score","Status","Action"].map(h => <span key={h}>{h}</span>)}
          </div>
          {filteredPM.length === 0 && <p className="ti2-empty">No records in this category.</p>}
          {filteredPM.map(p => {
            const total = (p.finalSections||p.originalSections).reduce((s,x)=>s+x.score,0);
            const cat   = getCat(total);
            return (
              <div key={p.id} className="ti2-pm-row ti2-pm-data-row">
                <span><strong>{p.pointsmanName}</strong></span>
                <span>{p.hrmsId}</span>
                <span>{p.station}</span>
                <span>{p.assessingSM}</span>
                <span>{p.submissionDate}</span>
                <span><strong style={{color:CAT_C[cat]}}>{total}/100</strong></span>
                <span>
                  <span className={`ti2-status-pill ti2-status-${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </span>
                <span>
                  <button className="ti2-link-btn-sm" onClick={() => openPmReview(p.id)}>
                    {p.status === "Pending" ? <><ClipboardCheck size={12}/> Review</> : <><Eye size={12}/> View</>}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── ASSESSMENTS (unified: SM / SS / TM) ── */
  const renderAssessments = () => {
    const getStatusStyle = (status) => {
      if (status === "Exam Sent")  return { background: "#f3e8ff", color: "#6b21a8" };
      if (status === "Exam Taken") return { background: "#dcfce7", color: "#166534" };
      return {};
    };

    // ─── LEVEL 3: Form views (SM, SS, TM) ───
    if (assessRole === "SM" && activeSmId) {
      const sm     = smList.find(s => s.id === activeSmId);
      const f      = smForms[activeSmId] || defaultSMForm();
      const locked = !!smLocked[activeSmId];
      
      const mcqDataStr = localStorage.getItem(`sm_mcq_test_${sm?.hrmsId}`);
      const mcqData = mcqDataStr ? JSON.parse(mcqDataStr) : null;
      const isMcqCompleted = !!(mcqData && mcqData.completed);
      const isActivated = localStorage.getItem(`sm_test_activated_${sm?.hrmsId}`) === "true";
      
      const knowledge = isMcqCompleted ? (mcqData?.correctCount || 22) : (parseInt(f.knowledgeMarks) || 0);
      let ynScore = 0;
      TI_SM_CRITERIA.forEach(sec => {
        f[sec.key]?.forEach(v => { if (v === "Yes") ynScore += sec.weight; });
      });
      const total = knowledge + ynScore;
      const isAlcoholic = f.alcoholicStatus === "Alcoholic";
      const liveCat = isAlcoholic ? "D" : getCat(total);

      return (
        <section className="sm2-card animate-fade-in" style={{ padding: "24px" }}>
          <div className="sm2-card-hdr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Assessment — {sm?.name}
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                {sm?.hrmsId} · {sm?.lastDate || "20 May 2026"}
              </p>
            </div>
            <button 
              className="sm2-ghost-btn" 
              style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", color: "#475569" }} 
              onClick={() => setActiveSmId(null)}
            >
              ← Back
            </button>
          </div>

          {/* ── Section 1: Knowledge of Rules ── */}
          <div className="sm2-assess-section">
            <div className="sm2-assess-sec-hdr">
              <span className="sm2-assess-sec-num">01</span>
              <div>
                <strong>Knowledge of Rules (MCQ-based)</strong>
                <span className="sm2-assess-sec-meta">Auto-calculated from Station Master MCQ Test</span>
              </div>
              <span className="sm2-assess-live-marks">{knowledge} / 25</span>
            </div>
            
            <div className="sm2-mcq-card-container" style={{marginTop: 16}}>
              {isMcqCompleted ? (
                <div className="sm2-mcq-success-card">
                  <div className="sm2-mcq-card-header">
                    <div className="sm2-mcq-status">
                      <span className="sm2-status-dot green"></span>
                      <span className="sm2-status-text text-green font-semibold">MCQ Test Completed</span>
                    </div>
                    <div className="sm2-mcq-lock-badge">
                      <Lock size={12} />
                      <span>Read-Only (Synced)</span>
                    </div>
                  </div>
                  
                  <div className="sm2-mcq-card-body">
                    <div className="sm2-mcq-score-display">
                      <div className="sm2-mcq-large-score">
                        <strong>{mcqData?.correctCount || 22}</strong>
                        <span>/ 25</span>
                      </div>
                      <div className="sm2-mcq-percentage-badge">
                        {mcqData?.percentage || 88}% Score
                      </div>
                      <button 
                        type="button"
                        style={{ marginLeft: "auto", background: "#fee2e2", border: "none", color: "#dc2626", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        onClick={() => {
                          localStorage.removeItem(`sm_mcq_test_${sm?.hrmsId}`);
                          setSMField(activeSmId, "knowledgeMarks", "0");
                        }}
                      >
                        Reset Mock Exam
                      </button>
                    </div>
                    
                    <div className="sm2-mcq-progress-container">
                      <div className="sm2-mcq-progress-bar">
                        <div 
                          className="sm2-mcq-progress-fill" 
                          style={{ 
                            width: `${mcqData?.percentage || 88}%`,
                            background: (mcqData?.percentage || 88) >= 80 ? "#16a34a" : (mcqData?.percentage || 88) >= 50 ? "#2563eb" : "#dc2626"
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="sm2-mcq-meta-grid">
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Submitted On</span>
                        <strong className="sm2-mcq-meta-val">{mcqData?.submittedDate || "30 May 2026"}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessed Entity</span>
                        <strong className="sm2-mcq-meta-val">{sm?.name}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sm2-mcq-pending-card">
                  <div className="sm2-mcq-card-header">
                    <div className="sm2-mcq-status">
                      <span className={`sm2-status-dot ${isActivated ? "amber" : "red"}`}></span>
                      <span className={`sm2-status-text text-${isActivated ? "amber" : "red"} font-semibold`}>
                        {isActivated ? "MCQ Test Active" : "MCQ Test Locked"}
                      </span>
                    </div>
                    <div className="sm2-mcq-lock-badge">
                      <Lock size={12} />
                      <span>Read-Only</span>
                    </div>
                  </div>
                  
                  <div className="sm2-mcq-card-body pending" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="sm2-mcq-pending-message" style={{ display: "flex", gap: "12px", background: isActivated ? "#fffbeb" : "#fef2f2", border: isActivated ? "1px solid #fef3c7" : "1px solid #fee2e2", padding: "16px", borderRadius: "8px" }}>
                      <AlertTriangle size={24} color={isActivated ? "#d97706" : "#dc2626"} style={{marginTop: 2, flexShrink: 0}} />
                      <div>
                        <h4 style={{margin:"0 0 4px", fontSize:14, color: isActivated ? "#b45309" : "#991b1b"}}>{isActivated ? "Awaiting Station Master Attempt" : "Competency Exam Locked"}</h4>
                        <p style={{margin:0, fontSize:12.5, lineHeight:1.5, color: isActivated ? "#d97706" : "#dc2626"}}>
                          {isActivated ? (
                            <span>The Station Master safety competency trial is active. Request SM (<strong>{sm?.name}</strong>) to log into their portal and attempt the 25 safety questions to automatically sync scores.</span>
                          ) : (
                            <span>The Station Master MCQ exam is currently locked. You must click the <strong>Activate Safety Exam</strong> button below to enable the Station Master to log in and attempt the test.</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button 
                        type="button"
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer",
                          border: "none",
                          background: isActivated ? "#fef2f2" : "#2563eb",
                          color: isActivated ? "#dc2626" : "#ffffff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                        onClick={() => {
                          const nextVal = !isActivated;
                          localStorage.setItem(`sm_test_activated_${sm?.hrmsId}`, nextVal ? "true" : "false");
                          setSMField(activeSmId, "automaticTraining", f.automaticTraining);
                        }}
                      >
                        {isActivated ? "Deactivate Safety Competency Exam" : "Activate Safety Competency Exam"}
                      </button>


                    </div>

                    <div className="sm2-mcq-meta-grid">
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessment Status</span>
                        <strong className={`sm2-mcq-meta-val text-${isActivated ? "amber" : "red"}`}>{isActivated ? "Active & Awaiting Attempt" : "Locked (Awaiting Activation)"}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessed Entity</span>
                        <strong className="sm2-mcq-meta-val">{sm?.name}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Total Questions</span>
                        <strong className="sm2-mcq-meta-val">25 Questions (1 mark each)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sections 02-06: Yes/No blocks ── */}
          {TI_SM_CRITERIA.map((sec, si) => (
            <div key={sec.key} className="sm2-assess-section" style={{ opacity: 1 }}>
              <div className="sm2-assess-sec-hdr">
                <span className="sm2-assess-sec-num">{String(si+2).padStart(2,"0")}</span>
                <div><strong>{sec.label}</strong><span className="sm2-assess-sec-meta">{sec.count} criteria · {sec.weight} marks each · Total {sec.count*sec.weight}</span></div>
                <span className="sm2-assess-live-marks">{f[sec.key].filter(v=>v==="Yes").length*sec.weight} / {sec.count*sec.weight}</span>
              </div>
              <div className="sm2-yn-grid">
                {sec.criteria.map((cr, idx) => (
                  <div key={idx} className="sm2-yn-row">
                    <span className="sm2-yn-label">{idx+1}. {cr}</span>
                    <div className="sm2-yn-btns">
                      <button
                        type="button" disabled={locked}
                        className={f[sec.key][idx] === "Yes" ? "sm2-yn-btn sm2-yn-yes active" : "sm2-yn-btn sm2-yn-yes"}
                        style={{ cursor: locked ? "not-allowed" : "pointer" }}
                        onClick={() => toggleSMYN(activeSmId, sec.key, idx, "Yes")}>
                        Yes
                      </button>
                      <button
                        type="button" disabled={locked}
                        className={f[sec.key][idx] === "No" ? "sm2-yn-btn sm2-yn-no active" : "sm2-yn-btn sm2-yn-no"}
                        style={{ cursor: locked ? "not-allowed" : "pointer" }}
                        onClick={() => toggleSMYN(activeSmId, sec.key, idx, "No")}>
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Section 07: Additional Details ── */}
          <div className="sm2-assess-section" style={{ opacity: 1 }}>
            <div className="sm2-assess-sec-hdr">
              <span className="sm2-assess-sec-num">07</span>
              <div><strong>Additional Details</strong><span className="sm2-assess-sec-meta">Mandatory fields</span></div>
            </div>
            <div className="sm2-assess-form" style={{marginTop:12}}>
              <div className="sm2-form-field">
                <label>Knowledge Marks (MCQ Test)</label>
                <input type="number" min={0} max={25} disabled={locked} value={knowledge} onChange={e=>{
                  const val = e.target.value;
                  setSMField(activeSmId,"knowledgeMarks",val);
                }} placeholder="Synced MCQ marks" style={{ background: "#f1f5f9" }} readOnly/>
              </div>
              <div className="sm2-form-field">
                <label>Alcoholic Status <span style={{color:"#dc2626"}}>*</span></label>
                <select disabled={locked} value={f.alcoholicStatus} onChange={e=>setSMField(activeSmId,"alcoholicStatus",e.target.value)}>
                  <option value="">Select…</option>
                  <option>Non-Alcoholic</option>
                  <option>Alcoholic</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>PME Status</label>
                <select disabled={locked} value={f.pmeStatus} onChange={e=>setSMField(activeSmId,"pmeStatus",e.target.value)}>
                  <option>Fit</option><option>Unfit</option><option>Pending</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>REF Status</label>
                <select disabled={locked} value={f.refStatus} onChange={e=>setSMField(activeSmId,"refStatus",e.target.value)}>
                  <option>Cleared</option><option>Pending</option><option>Failed</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>Counselling</label>
                <select disabled={locked} value={f.counselling} onChange={e=>setSMField(activeSmId,"counselling",e.target.value)}>
                  <option>Not Required</option><option>Recommended</option><option>Mandatory</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>Automatic Training</label>
                <select disabled={locked} value={f.automaticTraining} onChange={e=>setSMField(activeSmId,"automaticTraining",e.target.value)}>
                  <option>Not Required</option><option>Recommended</option><option>Mandatory</option>
                </select>
              </div>
              <div className="sm2-form-field sm2-form-full" style={{gridColumn:"1/-1"}}>
                <label>Remarks for AOM</label>
                <textarea rows={3} disabled={locked} value={f.remarks} onChange={e=>setSMField(activeSmId,"remarks",e.target.value)} placeholder="Enter observations, recommendations…"/>
              </div>
            </div>
          </div>

          {/* ── Live Score Bar ── */}
          <div className="sm2-live-score" style={{ opacity: 1 }}>
            <div><label>Knowledge (MCQ)</label><strong>{knowledge}/25</strong></div>
            <div><label>Yes/No Score</label><strong>{ynScore}/75</strong></div>
            <div><label>Grand Total</label><strong style={{color:CAT_C[liveCat],fontSize:22}}>{total}/100</strong></div>
            <div><label>Category</label><span className="sm2-badge" style={{background:CAT_B[liveCat],color:CAT_C[liveCat],fontSize:13,padding:"4px 14px"}}>Category {liveCat}</span></div>
          </div>

          {locked && (
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"16px"}}>
              <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", textAlign: "center" }}>
                ✓ Assessment submitted. Pending AOM Approval.
              </div>
              <button type="button" className="sm2-ghost-btn" style={{border:"1px solid #7c3aed",color:"#7c3aed", padding: "10px", borderRadius: "8px", fontWeight: "700", background: "none", cursor: "pointer"}} onClick={() => setSmLocked(p => ({...p,[activeSmId]:false}))}>
                <Edit size={14} style={{marginRight:6}}/> Unlock & Edit Assessment
              </button>
            </div>
          )}
          {!locked && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button className="sm2-ghost-btn" style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "700", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }} onClick={() => {
                  setSmForms(prev => ({
                    ...prev,
                    [activeSmId]: {
                      ...f,
                      knowledgeMarks: String(knowledge)
                    }
                  }));
                  alert("Assessment saved as draft successfully!");
                }}>Save as Draft</button>
                <button className="sm2-primary-btn" style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "700", border: "none", background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }} onClick={() => {
                  setSMField(activeSmId, "knowledgeMarks", String(knowledge));
                  submitSMAssessment(activeSmId);
                }}>
                  <CheckCircle2 size={14}/> Submit for AOM Approval
                </button>
              </div>
            </div>
          )}
        </section>
      );
    }

    if (assessRole === "SS" && activeSsId) {
      const ss     = ssList.find(s => s.id === activeSsId);
      const f      = ssForms[activeSsId] || defaultSSForm();
      const locked = !!ssLocked[activeSsId];
      
      const mcqDataStr = localStorage.getItem(`ss_mcq_test_${ss?.hrmsId}`);
      const mcqData = mcqDataStr ? JSON.parse(mcqDataStr) : null;
      const isMcqCompleted = !!(mcqData && mcqData.completed);
      const isActivated = localStorage.getItem(`ss_test_activated_${ss?.hrmsId}`) === "true";
      
      const knowledge = isMcqCompleted ? (mcqData?.correctCount || 21) : (parseInt(f.knowledgeMarks) || 0);
      let ynScore = 0;
      TI_SS_CRITERIA.forEach(sec => {
        f[sec.key]?.forEach(v => { if (v === "Yes") ynScore += sec.weight; });
      });
      const total = knowledge + ynScore;
      const isAlcoholic = f.alcoholicStatus === "Alcoholic";
      const liveCat = isAlcoholic ? "D" : getCat(total);

      return (
        <section className="sm2-card animate-fade-in" style={{ padding: "24px" }}>
          <div className="sm2-card-hdr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Assessment — {ss?.name}
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                {ss?.hrmsId} · {ss?.station}
              </p>
            </div>
            <button 
              className="sm2-ghost-btn" 
              style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", color: "#475569" }} 
              onClick={() => setActiveSsId(null)}
            >
              ← Back
            </button>
          </div>

          {/* ── Section 1: Knowledge of Rules ── */}
          <div className="sm2-assess-section">
            <div className="sm2-assess-sec-hdr">
              <span className="sm2-assess-sec-num">01</span>
              <div>
                <strong>Knowledge of Rules (MCQ-based)</strong>
                <span className="sm2-assess-sec-meta">Auto-calculated from Station Superintendent MCQ Test</span>
              </div>
              <span className="sm2-assess-live-marks">{knowledge} / 25</span>
            </div>
            
            <div className="sm2-mcq-card-container" style={{marginTop: 16}}>
              {isMcqCompleted ? (
                <div className="sm2-mcq-success-card">
                  <div className="sm2-mcq-card-header">
                    <div className="sm2-mcq-status">
                      <span className="sm2-status-dot green"></span>
                      <span className="sm2-status-text text-green font-semibold">MCQ Test Completed</span>
                    </div>
                    <div className="sm2-mcq-lock-badge">
                      <Lock size={12} />
                      <span>Read-Only (Synced)</span>
                    </div>
                  </div>
                  
                  <div className="sm2-mcq-card-body">
                    <div className="sm2-mcq-score-display">
                      <div className="sm2-mcq-large-score">
                        <strong>{mcqData?.correctCount || 21}</strong>
                        <span>/ 25</span>
                      </div>
                      <div className="sm2-mcq-percentage-badge">
                        {mcqData?.percentage || 84}% Score
                      </div>
                      <button 
                        type="button"
                        style={{ marginLeft: "auto", background: "#fee2e2", border: "none", color: "#dc2626", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        onClick={() => {
                          localStorage.removeItem(`ss_mcq_test_${ss?.hrmsId}`);
                          setSSField(activeSsId, "knowledgeMarks", "0");
                        }}
                      >
                        Reset Mock Exam
                      </button>
                    </div>
                    
                    <div className="sm2-mcq-progress-container">
                      <div className="sm2-mcq-progress-bar">
                        <div 
                          className="sm2-mcq-progress-fill" 
                          style={{ 
                            width: `${mcqData?.percentage || 84}%`,
                            background: (mcqData?.percentage || 84) >= 80 ? "#16a34a" : (mcqData?.percentage || 84) >= 50 ? "#2563eb" : "#dc2626"
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="sm2-mcq-meta-grid">
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Submitted On</span>
                        <strong className="sm2-mcq-meta-val">{mcqData?.submittedDate || "30 May 2026"}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessed Entity</span>
                        <strong className="sm2-mcq-meta-val">{ss?.name}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sm2-mcq-pending-card">
                  <div className="sm2-mcq-card-header">
                    <div className="sm2-mcq-status">
                      <span className={`sm2-status-dot ${isActivated ? "amber" : "red"}`}></span>
                      <span className={`sm2-status-text text-${isActivated ? "amber" : "red"} font-semibold`}>
                        {isActivated ? "MCQ Test Active" : "MCQ Test Locked"}
                      </span>
                    </div>
                    <div className="sm2-mcq-lock-badge">
                      <Lock size={12} />
                      <span>Read-Only</span>
                    </div>
                  </div>
                  
                  <div className="sm2-mcq-card-body pending" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="sm2-mcq-pending-message" style={{ display: "flex", gap: "12px", background: isActivated ? "#fffbeb" : "#fef2f2", border: isActivated ? "1px solid #fef3c7" : "1px solid #fee2e2", padding: "16px", borderRadius: "8px" }}>
                      <AlertTriangle size={24} color={isActivated ? "#d97706" : "#dc2626"} style={{marginTop: 2, flexShrink: 0}} />
                      <div>
                        <h4 style={{margin:"0 0 4px", fontSize:14, color: isActivated ? "#b45309" : "#991b1b"}}>{isActivated ? "Awaiting Station Superintendent Attempt" : "Competency Exam Locked"}</h4>
                        <p style={{margin:0, fontSize:12.5, lineHeight:1.5, color: isActivated ? "#d97706" : "#dc2626"}}>
                          {isActivated ? (
                            <span>The Station Superintendent safety competency trial is active. Request SS (<strong>{ss?.name}</strong>) to log into their portal and attempt the 25 safety questions to automatically sync scores.</span>
                          ) : (
                            <span>The Station Superintendent MCQ exam is currently locked. You must click the <strong>Activate Safety Exam</strong> button below to enable the Station Superintendent to log in and attempt the test.</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button 
                        type="button"
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer",
                          border: "none",
                          background: isActivated ? "#fef2f2" : "#2563eb",
                          color: isActivated ? "#dc2626" : "#ffffff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                        onClick={() => {
                          const nextVal = !isActivated;
                          localStorage.setItem(`ss_test_activated_${ss?.hrmsId}`, nextVal ? "true" : "false");
                          setSSField(activeSsId, "automaticTraining", f.automaticTraining);
                        }}
                      >
                        {isActivated ? "Deactivate Safety Competency Exam" : "Activate Safety Competency Exam"}
                      </button>


                    </div>

                    <div className="sm2-mcq-meta-grid">
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessment Status</span>
                        <strong className={`sm2-mcq-meta-val text-${isActivated ? "amber" : "red"}`}>{isActivated ? "Active & Awaiting Attempt" : "Locked (Awaiting Activation)"}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessed Entity</span>
                        <strong className="sm2-mcq-meta-val">{ss?.name}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Total Questions</span>
                        <strong className="sm2-mcq-meta-val">25 Questions (1 mark each)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sections 02-06: Yes/No blocks ── */}
          {TI_SS_CRITERIA.map((sec, si) => (
            <div key={sec.key} className="sm2-assess-section" style={{ opacity: 1 }}>
              <div className="sm2-assess-sec-hdr">
                <span className="sm2-assess-sec-num">{String(si+2).padStart(2,"0")}</span>
                <div><strong>{sec.label}</strong><span className="sm2-assess-sec-meta">{sec.count} criteria · {sec.weight} marks each · Total {sec.count*sec.weight}</span></div>
                <span className="sm2-assess-live-marks">{f[sec.key]?.filter(v=>v==="Yes").length*sec.weight} / {sec.count*sec.weight}</span>
              </div>
              <div className="sm2-yn-grid">
                {sec.criteria.map((cr, idx) => (
                  <div key={idx} className="sm2-yn-row">
                    <span className="sm2-yn-label">{idx+1}. {cr}</span>
                    <div className="sm2-yn-btns">
                      <button
                        type="button" disabled={locked}
                        className={f[sec.key]?.[idx] === "Yes" ? "sm2-yn-btn sm2-yn-yes active" : "sm2-yn-btn sm2-yn-yes"}
                        style={{ cursor: locked ? "not-allowed" : "pointer" }}
                        onClick={() => toggleSSYN(activeSsId, sec.key, idx, "Yes")}>
                        Yes
                      </button>
                      <button
                        type="button" disabled={locked}
                        className={f[sec.key]?.[idx] === "No" ? "sm2-yn-btn sm2-yn-no active" : "sm2-yn-btn sm2-yn-no"}
                        style={{ cursor: locked ? "not-allowed" : "pointer" }}
                        onClick={() => toggleSSYN(activeSsId, sec.key, idx, "No")}>
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Section 07: Additional Details ── */}
          <div className="sm2-assess-section" style={{ opacity: 1 }}>
            <div className="sm2-assess-sec-hdr">
              <span className="sm2-assess-sec-num">07</span>
              <div><strong>Additional Details</strong><span className="sm2-assess-sec-meta">Mandatory fields</span></div>
            </div>
            <div className="sm2-assess-form" style={{marginTop:12}}>
              <div className="sm2-form-field">
                <label>Knowledge Marks (MCQ Test)</label>
                <input type="number" min={0} max={25} disabled={locked} value={knowledge} onChange={e=>{
                  const val = e.target.value;
                  setSSField(activeSsId,"knowledgeMarks",val);
                }} placeholder="Synced MCQ marks" style={{ background: "#f1f5f9" }} readOnly/>
              </div>
              <div className="sm2-form-field">
                <label>Alcoholic Status <span style={{color:"#dc2626"}}>*</span></label>
                <select disabled={locked} value={f.alcoholicStatus} onChange={e=>setSSField(activeSsId,"alcoholicStatus",e.target.value)}>
                  <option value="">Select…</option>
                  <option>Non-Alcoholic</option>
                  <option>Alcoholic</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>PME Status</label>
                <select disabled={locked} value={f.pmeStatus} onChange={e=>setSSField(activeSsId,"pmeStatus",e.target.value)}>
                  <option>Fit</option><option>Unfit</option><option>Pending</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>REF Status</label>
                <select disabled={locked} value={f.refStatus} onChange={e=>setSSField(activeSsId,"refStatus",e.target.value)}>
                  <option>Cleared</option><option>Pending</option><option>Failed</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>Counselling</label>
                <select disabled={locked} value={f.counselling} onChange={e=>setSSField(activeSsId,"counselling",e.target.value)}>
                  <option>Not Required</option><option>Recommended</option><option>Mandatory</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>Automatic Training</label>
                <select disabled={locked} value={f.automaticTraining} onChange={e=>setSSField(activeSsId,"automaticTraining",e.target.value)}>
                  <option>Not Required</option><option>Recommended</option><option>Mandatory</option>
                </select>
              </div>
              <div className="sm2-form-field sm2-form-full" style={{gridColumn:"1/-1"}}>
                <label>Remarks for AOM</label>
                <textarea rows={3} disabled={locked} value={f.remarks} onChange={e=>setSSField(activeSsId,"remarks",e.target.value)} placeholder="Enter observations, recommendations…"/>
              </div>
            </div>
          </div>

          {/* ── Live Score Bar ── */}
          <div className="sm2-live-score" style={{ opacity: 1 }}>
            <div><label>Knowledge (MCQ)</label><strong>{knowledge}/25</strong></div>
            <div><label>Yes/No Score</label><strong>{ynScore}/75</strong></div>
            <div><label>Grand Total</label><strong style={{color:CAT_C[liveCat],fontSize:22}}>{total}/100</strong></div>
            <div><label>Category</label><span className="sm2-badge" style={{background:CAT_B[liveCat],color:CAT_C[liveCat],fontSize:13,padding:"4px 14px"}}>Category {liveCat}</span></div>
          </div>

          {locked && (
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"16px"}}>
              <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", textAlign: "center" }}>
                ✓ Assessment submitted. Pending AOM Approval.
              </div>
              <button type="button" className="sm2-ghost-btn" style={{border:"1px solid #7c3aed",color:"#7c3aed", padding: "10px", borderRadius: "8px", fontWeight: "700", background: "none", cursor: "pointer"}} onClick={() => setSsLocked(p => ({...p,[activeSsId]:false}))}>
                <Edit size={14} style={{marginRight:6}}/> Unlock & Edit Assessment
              </button>
            </div>
          )}
          {!locked && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button className="sm2-ghost-btn" style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "700", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }} onClick={() => {
                  setSsForms(prev => ({
                    ...prev,
                    [activeSsId]: {
                      ...f,
                      knowledgeMarks: String(knowledge)
                    }
                  }));
                  alert("Assessment saved as draft successfully!");
                }}>Save as Draft</button>
                <button className="sm2-primary-btn" style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "700", border: "none", background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }} onClick={() => {
                  setSSField(activeSsId, "knowledgeMarks", String(knowledge));
                  submitSSAssessment(activeSsId);
                }}>
                  <CheckCircle2 size={14}/> Submit for AOM Approval
                </button>
              </div>
            </div>
          )}
        </section>
      );
    }

    if (assessRole === "TM" && activeTmId) {
      const tm     = tmList.find(t => t.id === activeTmId);
      const f      = tmForms[activeTmId] || defaultTMForm();
      const locked = !!tmLocked[activeTmId];
      
      const mcqDataStr = localStorage.getItem(`tm_mcq_test_${tm?.hrmsId}`);
      const mcqData = mcqDataStr ? JSON.parse(mcqDataStr) : null;
      const isMcqCompleted = !!(mcqData && mcqData.completed);
      const isActivated = localStorage.getItem(`tm_test_activated_${tm?.hrmsId}`) === "true";
      
      const knowledge = isMcqCompleted ? (mcqData?.correctCount || 23) : (parseInt(f.knowledgeMarks) || 0);
      let ynScore = 0;
      TI_TM_CRITERIA.forEach(sec => {
        f[sec.key]?.forEach(v => { if (v === "Yes") ynScore += sec.weight; });
      });
      const total = knowledge + ynScore;
      const isAlcoholic = f.alcoholicStatus === "Alcoholic";
      const liveCat = isAlcoholic ? "D" : getCat(total);

      return (
        <section className="sm2-card animate-fade-in" style={{ padding: "24px" }}>
          <div className="sm2-card-hdr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Assessment — {tm?.name}
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                {tm?.hrmsId} · Home Station: {tm?.station}
              </p>
            </div>
            <button 
              className="sm2-ghost-btn" 
              style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", color: "#475569" }} 
              onClick={() => setActiveTmId(null)}
            >
              ← Back
            </button>
          </div>

          {/* ── Section 1: Knowledge of Rules ── */}
          <div className="sm2-assess-section">
            <div className="sm2-assess-sec-hdr">
              <span className="sm2-assess-sec-num">01</span>
              <div>
                <strong>Knowledge of Rules (MCQ-based)</strong>
                <span className="sm2-assess-sec-meta">Auto-calculated from Train Manager MCQ Test</span>
              </div>
              <span className="sm2-assess-live-marks">{knowledge} / 25</span>
            </div>
            
            <div className="sm2-mcq-card-container" style={{marginTop: 16}}>
              {isMcqCompleted ? (
                <div className="sm2-mcq-success-card">
                  <div className="sm2-mcq-card-header">
                    <div className="sm2-mcq-status">
                      <span className="sm2-status-dot green"></span>
                      <span className="sm2-status-text text-green font-semibold">MCQ Test Completed</span>
                    </div>
                    <div className="sm2-mcq-lock-badge">
                      <Lock size={12} />
                      <span>Read-Only (Synced)</span>
                    </div>
                  </div>
                  
                  <div className="sm2-mcq-card-body">
                    <div className="sm2-mcq-score-display">
                      <div className="sm2-mcq-large-score">
                        <strong>{mcqData?.correctCount || 23}</strong>
                        <span>/ 25</span>
                      </div>
                      <div className="sm2-mcq-percentage-badge">
                        {mcqData?.percentage || 92}% Score
                      </div>
                      <button 
                        type="button"
                        style={{ marginLeft: "auto", background: "#fee2e2", border: "none", color: "#dc2626", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        onClick={() => {
                          localStorage.removeItem(`tm_mcq_test_${tm?.hrmsId}`);
                          setTMField(activeTmId, "knowledgeMarks", "0");
                        }}
                      >
                        Reset Mock Exam
                      </button>
                    </div>
                    
                    <div className="sm2-mcq-progress-container">
                      <div className="sm2-mcq-progress-bar">
                        <div 
                          className="sm2-mcq-progress-fill" 
                          style={{ 
                            width: `${mcqData?.percentage || 92}%`,
                            background: (mcqData?.percentage || 92) >= 80 ? "#16a34a" : (mcqData?.percentage || 92) >= 50 ? "#2563eb" : "#dc2626"
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="sm2-mcq-meta-grid">
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Submitted On</span>
                        <strong className="sm2-mcq-meta-val">{mcqData?.submittedDate || "30 May 2026"}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessed Entity</span>
                        <strong className="sm2-mcq-meta-val">{tm?.name}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sm2-mcq-pending-card">
                  <div className="sm2-mcq-card-header">
                    <div className="sm2-mcq-status">
                      <span className={`sm2-status-dot ${isActivated ? "amber" : "red"}`}></span>
                      <span className={`sm2-status-text text-${isActivated ? "amber" : "red"} font-semibold`}>
                        {isActivated ? "MCQ Test Active" : "MCQ Test Locked"}
                      </span>
                    </div>
                    <div className="sm2-mcq-lock-badge">
                      <Lock size={12} />
                      <span>Read-Only</span>
                    </div>
                  </div>
                  
                  <div className="sm2-mcq-card-body pending" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="sm2-mcq-pending-message" style={{ display: "flex", gap: "12px", background: isActivated ? "#fffbeb" : "#fef2f2", border: isActivated ? "1px solid #fef3c7" : "1px solid #fee2e2", padding: "16px", borderRadius: "8px" }}>
                      <AlertTriangle size={24} color={isActivated ? "#d97706" : "#dc2626"} style={{marginTop: 2, flexShrink: 0}} />
                      <div>
                        <h4 style={{margin:"0 0 4px", fontSize:14, color: isActivated ? "#b45309" : "#991b1b"}}>{isActivated ? "Awaiting Train Manager Attempt" : "Competency Exam Locked"}</h4>
                        <p style={{margin:0, fontSize:12.5, lineHeight:1.5, color: isActivated ? "#d97706" : "#dc2626"}}>
                          {isActivated ? (
                            <span>The Train Manager safety competency trial is active. Request TM (<strong>{tm?.name}</strong>) to log into their portal and attempt the 25 safety questions to automatically sync scores.</span>
                          ) : (
                            <span>The Train Manager MCQ exam is currently locked. You must click the <strong>Activate Safety Exam</strong> button below to enable the Train Manager to log in and attempt the test.</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button 
                        type="button"
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer",
                          border: "none",
                          background: isActivated ? "#fef2f2" : "#2563eb",
                          color: isActivated ? "#dc2626" : "#ffffff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                        onClick={() => {
                          const nextVal = !isActivated;
                          localStorage.setItem(`tm_test_activated_${tm?.hrmsId}`, nextVal ? "true" : "false");
                          setTMField(activeTmId, "automaticTraining", f.automaticTraining);
                        }}
                      >
                        {isActivated ? "Deactivate Safety Competency Exam" : "Activate Safety Competency Exam"}
                      </button>


                    </div>

                    <div className="sm2-mcq-meta-grid">
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessment Status</span>
                        <strong className={`sm2-mcq-meta-val text-${isActivated ? "amber" : "red"}`}>{isActivated ? "Active & Awaiting Attempt" : "Locked (Awaiting Activation)"}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Assessed Entity</span>
                        <strong className="sm2-mcq-meta-val">{tm?.name}</strong>
                      </div>
                      <div className="sm2-mcq-meta-item">
                        <span className="sm2-mcq-meta-label">Total Questions</span>
                        <strong className="sm2-mcq-meta-val">25 Questions (1 mark each)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sections 02-06: Yes/No blocks ── */}
          {TI_TM_CRITERIA.map((sec, si) => (
            <div key={sec.key} className="sm2-assess-section" style={{ opacity: 1 }}>
              <div className="sm2-assess-sec-hdr">
                <span className="sm2-assess-sec-num">{String(si+2).padStart(2,"0")}</span>
                <div><strong>{sec.label}</strong><span className="sm2-assess-sec-meta">{sec.count} criteria · {sec.weight} marks each · Total {sec.count*sec.weight}</span></div>
                <span className="sm2-assess-live-marks">{f[sec.key]?.filter(v=>v==="Yes").length*sec.weight} / {sec.count*sec.weight}</span>
              </div>
              <div className="sm2-yn-grid">
                {sec.criteria.map((cr, idx) => (
                  <div key={idx} className="sm2-yn-row">
                    <span className="sm2-yn-label">{idx+1}. {cr}</span>
                    <div className="sm2-yn-btns">
                      <button
                        type="button" disabled={locked}
                        className={f[sec.key]?.[idx] === "Yes" ? "sm2-yn-btn sm2-yn-yes active" : "sm2-yn-btn sm2-yn-yes"}
                        style={{ cursor: locked ? "not-allowed" : "pointer" }}
                        onClick={() => toggleTMYN(activeTmId, sec.key, idx, "Yes")}>
                        Yes
                      </button>
                      <button
                        type="button" disabled={locked}
                        className={f[sec.key]?.[idx] === "No" ? "sm2-yn-btn sm2-yn-no active" : "sm2-yn-btn sm2-yn-no"}
                        style={{ cursor: locked ? "not-allowed" : "pointer" }}
                        onClick={() => toggleTMYN(activeTmId, sec.key, idx, "No")}>
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Section 07: Additional Details ── */}
          <div className="sm2-assess-section" style={{ opacity: 1 }}>
            <div className="sm2-assess-sec-hdr">
              <span className="sm2-assess-sec-num">07</span>
              <div><strong>Additional Details</strong><span className="sm2-assess-sec-meta">Mandatory fields</span></div>
            </div>
            <div className="sm2-assess-form" style={{marginTop:12}}>
              <div className="sm2-form-field">
                <label>Knowledge Marks (MCQ Test)</label>
                <input type="number" min={0} max={25} disabled={locked} value={knowledge} onChange={e=>{
                  const val = e.target.value;
                  setTMField(activeTmId,"knowledgeMarks",val);
                }} placeholder="Synced MCQ marks" style={{ background: "#f1f5f9" }} readOnly/>
              </div>
              <div className="sm2-form-field">
                <label>Alcoholic Status <span style={{color:"#dc2626"}}>*</span></label>
                <select disabled={locked} value={f.alcoholicStatus} onChange={e=>setTMField(activeTmId,"alcoholicStatus",e.target.value)}>
                  <option value="">Select…</option>
                  <option>Non-Alcoholic</option>
                  <option>Alcoholic</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>PME Status</label>
                <select disabled={locked} value={f.pmeStatus} onChange={e=>setTMField(activeTmId,"pmeStatus",e.target.value)}>
                  <option>Fit</option><option>Unfit</option><option>Pending</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>REF Status</label>
                <select disabled={locked} value={f.refStatus} onChange={e=>setTMField(activeTmId,"refStatus",e.target.value)}>
                  <option>Cleared</option><option>Pending</option><option>Failed</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>Counselling</label>
                <select disabled={locked} value={f.counselling} onChange={e=>setTMField(activeTmId,"counselling",e.target.value)}>
                  <option>Not Required</option><option>Recommended</option><option>Mandatory</option>
                </select>
              </div>
              <div className="sm2-form-field">
                <label>Automatic Training</label>
                <select disabled={locked} value={f.automaticTraining} onChange={e=>setTMField(activeTmId,"automaticTraining",e.target.value)}>
                  <option>Not Required</option><option>Recommended</option><option>Mandatory</option>
                </select>
              </div>
              <div className="sm2-form-field sm2-form-full" style={{gridColumn:"1/-1"}}>
                <label>Remarks for AOM</label>
                <textarea rows={3} disabled={locked} value={f.remarks} onChange={e=>setTMField(activeTmId,"remarks",e.target.value)} placeholder="Enter observations, recommendations…"/>
              </div>
            </div>
          </div>

          {/* ── Live Score Bar ── */}
          <div className="sm2-live-score" style={{ opacity: 1 }}>
            <div><label>Knowledge (MCQ)</label><strong>{knowledge}/25</strong></div>
            <div><label>Yes/No Score</label><strong>{ynScore}/75</strong></div>
            <div><label>Grand Total</label><strong style={{color:CAT_C[liveCat],fontSize:22}}>{total}/100</strong></div>
            <div><label>Category</label><span className="sm2-badge" style={{background:CAT_B[liveCat],color:CAT_C[liveCat],fontSize:13,padding:"4px 14px"}}>Category {liveCat}</span></div>
          </div>

          {locked && (
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"16px"}}>
              <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", textAlign: "center" }}>
                ✓ Assessment submitted. Pending AOM Approval.
              </div>
              <button type="button" className="sm2-ghost-btn" style={{border:"1px solid #7c3aed",color:"#7c3aed", padding: "10px", borderRadius: "8px", fontWeight: "700", background: "none", cursor: "pointer"}} onClick={() => setTmLocked(p => ({...p,[activeTmId]:false}))}>
                <Edit size={14} style={{marginRight:6}}/> Unlock & Edit Assessment
              </button>
            </div>
          )}
          {!locked && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button className="sm2-ghost-btn" style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "700", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }} onClick={() => {
                  setTmForms(prev => ({
                    ...prev,
                    [activeTmId]: {
                      ...f,
                      knowledgeMarks: String(knowledge)
                    }
                  }));
                  alert("Assessment saved as draft successfully!");
                }}>Save as Draft</button>
                <button className="sm2-primary-btn" style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "700", border: "none", background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }} onClick={() => {
                  setTMField(activeTmId, "knowledgeMarks", String(knowledge));
                  submitTMAssessment(activeTmId);
                }}>
                  <CheckCircle2 size={14}/> Submit for AOM Approval
                </button>
              </div>
            </div>
          )}
        </section>
      );
    }

    // ─── LEVEL 2: Roster/List View Generic Render ───
    const renderRoleRoster = (roleKey) => {
      const config = {
        SM: {
          title: "Station Masters",
          searchLabel: "Search Station Master",
          colHeader: "STATION MASTER",
          list: smList,
          openForm: openSMForm,
          sendAccess: handleSendExamAccess,
          avatarBg: "#1e3a8a",
          roleName: "Station Master",
          rolePillBg: "#eff6ff",
          rolePillColor: "#2563eb",
        },
        SS: {
          title: "Station Superintendents",
          searchLabel: "Search Station Superintendent",
          colHeader: "STATION SUPERINTENDENT",
          list: ssList,
          openForm: openSSForm,
          sendAccess: handleSendSSExamAccess,
          avatarBg: "#1e3a8a",
          roleName: "Station Superintendent",
          rolePillBg: "#f5f3ff",
          rolePillColor: "#7c3aed",
        },
        TM: {
          title: "Train Managers",
          searchLabel: "Search Train Manager",
          colHeader: "TRAIN MANAGER",
          list: tmList,
          openForm: openTMForm,
          sendAccess: handleSendTMExamAccess,
          avatarBg: "#1e3a8a",
          roleName: "Train Manager",
          rolePillBg: "#f0fdf4",
          rolePillColor: "#16a34a",
        }
      }[roleKey];

      const totalStaff = config.list.length;
      const pendingCount = config.list.filter(x => x.status === "Pending" || x.status === "Exam Sent").length;
      const completedCount = config.list.filter(x => x.status === "Submitted" || x.status === "Exam Taken").length;
      const rejectedCount = config.list.filter(x => x.status === "Rejected").length;
      const lastUpdatedDate = "20 May 2026";

      const stations = ["All", ...new Set(config.list.map(x => x.station))];

      const filteredList = config.list.filter(item => {
        const matchesSearch = rosterSearch === "" || 
          item.name.toLowerCase().includes(rosterSearch.toLowerCase()) || 
          item.hrmsId.toLowerCase().includes(rosterSearch.toLowerCase());
        
        const matchesStation = rosterStation === "All" || item.station === rosterStation;
        const matchesStatus = rosterStatus === "All" || item.status === rosterStatus;
        const matchesDate = rosterDate === "" || item.lastDate === rosterDate;
        
        return matchesSearch && matchesStation && matchesStatus && matchesDate;
      });

      const stationCodeMap = {
        "Parbhani Junction": "PBN",
        "Amla Junction": "AMLA",
        "Badnera Junction": "BDN",
        "Akola Junction": "AK",
        "Nagpur Junction": "NGP",
        "Wardha Junction": "WR",
        "Betul Station": "BYT",
        "Itarsi Junction": "ET",
        "Chandrapur Station": "CD",
        "Gondia Junction": "G",
        "Dhamangaon Station": "DMN",
        "Pulgaon Junction": "PLO"
      };

      return (
        <div className="ti2-page-body animate-fade-in" style={{ padding: "24px", background: "#f8fafc", minHeight: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>
                Assessments — {config.title}
              </h1>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: "500" }}>
                {config.title} pending assessment are listed below. Open the form to conduct a structured evaluation.
              </p>
            </div>
            <button 
              onClick={() => { setAssessRole(null); setRosterSearch(""); setRosterStation("All"); setRosterStatus("All"); setRosterDate(""); }}
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                color: "#334155",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer"
              }}
            >
              ← Back to Roles
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: `Total ${config.title}`, value: totalStaff, subtitle: "In your jurisdiction", icon: Users, bg: "#f8fafc", color: "#475569", valColor: "#0f172a" },
              { label: "Pending Assessments", value: pendingCount, subtitle: "Awaiting completion", icon: ClipboardList, bg: "#f8fafc", color: "#d97706", valColor: "#d97706" },
              { label: "Completed This Month", value: completedCount, subtitle: "Assessments done", icon: Send, bg: "#f8fafc", color: "#16a34a", valColor: "#16a34a" },
              { label: "Rejected", value: rejectedCount, subtitle: "Needs review", icon: AlertTriangle, bg: "#f8fafc", color: "#dc2626", valColor: "#dc2626" },
              { label: "Last Updated", value: lastUpdatedDate, subtitle: "Recent activity", icon: Calendar, bg: "#f8fafc", color: "#64748b", valColor: "#0f172a" }
            ].map((stat, idx) => (
              <div 
                key={idx}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, flexShrink: 0 }}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ fontSize: "22px", fontWeight: "800", color: stat.valColor }}>{stat.value}</span>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginTop: "2px" }}>{stat.label}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", marginTop: "1px" }}>{stat.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          <div 
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto", gap: "16px", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  {config.searchLabel}
                </label>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input 
                    type="text"
                    placeholder="Name or HRMS ID..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#0f172a",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Station</label>
                <select 
                  value={rosterStation}
                  onChange={(e) => setRosterStation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#0f172a",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="All">All Stations</option>
                  {stations.filter(x => x !== "All").map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Exam Status</label>
                <select 
                  value={rosterStatus}
                  onChange={(e) => setRosterStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#0f172a",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Exam Sent">Exam Sent</option>
                  <option value="Exam Taken">Exam Taken</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Last Assessed</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input 
                    type="date"
                    value={rosterDate}
                    onChange={(e) => setRosterDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 36px 10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#0f172a",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  onClick={() => { setRosterSearch(""); setRosterStation("All"); setRosterStatus("All"); setRosterDate(""); }}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#475569",
                    cursor: "pointer"
                  }}
                >
                  Reset
                </button>
                <button 
                  style={{
                    background: "#0f172a",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer"
                  }}
                >
                  <Filter size={14} /> Apply Filters
                </button>
              </div>
            </div>
          </div>

          <div 
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #e2e8f0", background: "#f8fafc", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {config.colHeader}
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>HRMS ID</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>STATION</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>LAST ASSESSED</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>SCORE</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>EXAM STATUS</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item) => {
                    const grade = item.score ? getCat(item.score) : "—";
                    const isVingh = item.name.includes("Singh");
                    const scale = isVingh || item.name.includes("Verma") || item.name.includes("Dubey") ? "Junior Scale" : "Senior Scale";
                    
                    const stationCode = stationCodeMap[item.station] || "STN";

                    const examStatusBadgeStyle = (status) => {
                      if (status === "Exam Sent") return { bg: "#f3e8ff", color: "#6b21a8" };
                      if (status === "Exam Taken") return { bg: "#dcfce7", color: "#166534" };
                      if (status === "Submitted") return { bg: "#dbeafe", color: "#2563eb" };
                      if (status === "Rejected") return { bg: "#fee2e2", color: "#dc2626" };
                      return { bg: "#f1f5f9", color: "#475569" };
                    };

                    const statusColors = examStatusBadgeStyle(item.status);

                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: config.avatarBg, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" }}>
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>{item.name}</div>
                              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", marginTop: "2px" }}>{scale}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#475569", fontWeight: "600", fontSize: "13px", fontFamily: "monospace" }}>
                          {item.hrmsId}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ color: "#334155", fontSize: "13px", fontWeight: "500" }}>{item.station}</span>
                            <span style={{ background: "#eff6ff", color: "#2563eb", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>
                              {stationCode}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px", fontWeight: "500" }}>
                          {item.lastDate || "—"}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#0f172a", fontWeight: "800", fontSize: "14px" }}>
                          {item.score ? `${item.score}/100` : "—"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ background: statusColors.bg, color: statusColors.color, padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                              {item.status}
                            </span>
                            {item.status === "Exam Sent" && (
                              <span style={{ background: "#f3e8ff", color: "#6b21a8", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Clock size={12} /> Waiting for {roleKey} Response
                              </span>
                            )}
                            {item.status === "Rejected" && (
                              <span style={{ background: "#fee2e2", color: "#dc2626", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                                <AlertTriangle size={12} /> Needs Review
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContext: "flex-end" }}>
                            {item.status === "Pending" && (
                              <>
                                <button 
                                  onClick={() => config.sendAccess(item.id)}
                                  style={{
                                    background: "#7c3aed",
                                    border: "none",
                                    color: "#ffffff",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "700",
                                    fontSize: "12px"
                                  }}
                                >
                                  Send Access
                                </button>
                                <button 
                                  onClick={() => config.openForm(item.id)}
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid #cbd5e1",
                                    padding: "5px 12px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: "#475569",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    cursor: "pointer"
                                  }}
                                >
                                  Open Form <ExternalLink size={12} />
                                </button>
                              </>
                            )}
                            {item.status === "Exam Sent" && (
                              <button 
                                onClick={() => config.openForm(item.id)}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #cbd5e1",
                                  padding: "5px 12px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  color: "#475569",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  cursor: "pointer"
                                }}
                              >
                                Open Form <ExternalLink size={12} />
                              </button>
                            )}
                            {item.status === "Exam Taken" && (
                              <button 
                                onClick={() => config.openForm(item.id)}
                                style={{
                                  background: "#16a34a",
                                  border: "none",
                                  color: "#ffffff",
                                  padding: "6px 16px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "700",
                                  fontSize: "12px"
                                }}
                              >
                                Start Assessment
                              </button>
                            )}
                            {item.status === "Submitted" && (
                              <>
                                <button 
                                  onClick={() => config.openForm(item.id)}
                                  style={{
                                    background: "#2563eb",
                                    border: "none",
                                    color: "#ffffff",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "700",
                                    fontSize: "12px"
                                  }}
                                >
                                  View Form
                                </button>
                                <button 
                                  onClick={() => config.openForm(item.id, true)}
                                  style={{
                                    background: "#ea580c",
                                    border: "none",
                                    color: "#ffffff",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "700",
                                    fontSize: "12px"
                                  }}
                                >
                                  Edit
                                </button>
                              </>
                            )}
                            {item.status === "Rejected" && (
                              <button 
                                onClick={() => config.openForm(item.id)}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #cbd5e1",
                                  padding: "5px 12px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  color: "#475569",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  cursor: "pointer"
                                }}
                              >
                                Open Form <ExternalLink size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
                        No {config.title.toLowerCase()} match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>
                Showing 1 to {filteredList.length} of {filteredList.length} entries
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button 
                  disabled
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#cbd5e1",
                    cursor: "not-allowed"
                  }}
                >
                  &lt;
                </button>
                <button 
                  style={{
                    background: "#0f172a",
                    border: "none",
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "13px"
                  }}
                >
                  1
                </button>
                <button 
                  disabled
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#cbd5e1",
                    cursor: "not-allowed"
                  }}
                >
                  &gt;
                </button>
              </div>
            </div>

          </div>

        </div>
      );
    };

    if (assessRole === "SM") return renderRoleRoster("SM");
    if (assessRole === "SS") return renderRoleRoster("SS");
    if (assessRole === "TM") return renderRoleRoster("TM");

    // ─── LEVEL 1: Role picker Redesign ───
    const smPending = smList.filter(s => s.status === "Pending" || s.status === "Exam Sent").length;
    const ssPending = ssList.filter(s => s.status === "Pending" || s.status === "Exam Sent").length;
    const tmPending = tmList.filter(t => t.status === "Pending" || t.status === "Exam Sent").length;

    const smCompleted = smList.filter(s => s.status === "Submitted" || s.status === "Exam Taken").length;
    const ssCompleted = ssList.filter(s => s.status === "Submitted" || s.status === "Exam Taken").length;
    const tmCompleted = tmList.filter(t => t.status === "Submitted" || t.status === "Exam Taken").length;

    const roles = [
      {
        key: "SM",
        label: "Station Masters",
        icon: Building2,
        pending: smPending,
        completed: smCompleted,
        total: smList.length,
        desc: "Conduct structured field evaluations for Station Masters on safety compliance, rule knowledge, administrative duties, and operational practices."
      },
      {
        key: "SS",
        label: "Station Superintendents",
        icon: UserCheck,
        pending: ssPending,
        completed: ssCompleted,
        total: ssList.length,
        desc: "Evaluate Station Superintendents on operational supervision, staff management, safety compliance, and infrastructure upkeep."
      },
      {
        key: "TM",
        label: "Train Managers",
        icon: Train,
        pending: tmPending,
        completed: tmCompleted,
        total: tmList.length,
        desc: "Assess Train Managers on train safety, signaling compliance, shunting operations, documentation, and emergency protocols."
      }
    ];

    return (
      <div className="ti2-page-body animate-fade-in" style={{ padding: "24px", background: "#f8fafc", minHeight: "100%" }}>
        
        {/* Title and Subtitle */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Assessments</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Select a staff category to conduct structured competency assessments.</p>
        </div>

        {/* 3 Grid Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
          {roles.map(role => (
            <div 
              key={role.key}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                    <role.icon size={22} style={{ margin: "auto" }} />
                  </div>
                  {role.pending > 0 && (
                    <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: "999px", fontSize: "11px", fontWeight: "800", padding: "4px 12px" }}>
                      {role.pending} Pending
                    </span>
                  )}
                </div>

                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{role.label}</h3>
                <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "#475569", lineHeight: "1.5", minHeight: "60px" }}>{role.desc}</p>
              </div>

              <div>
                {/* Stats grid inside card */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginBottom: "16px", textAlign: "center" }}>
                  <div style={{ borderRight: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{role.total}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>Total Staff</div>
                  </div>
                  <div style={{ borderRight: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{role.completed}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>Completed</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{role.pending}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>Pending</div>
                  </div>
                </div>

                {/* Open button */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => setAssessRole(role.key)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px"
                    }}
                  >
                    Open <span style={{ transition: "transform 0.2s" }} className="open-arrow">→</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Quick Stats Strip (5 Columns) */}
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "16px",
            background: "#ffffff",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}
        >
          {[
            { label: "Total Personnel", value: smList.length + ssList.length + tmList.length, icon: Users, bg: "#f1f5f9", iconColor: "#475569", valColor: "#0f172a" },
            { label: "Pending Assessments", value: smPending + ssPending + tmPending, icon: ClipboardList, bg: "#fee2e2", iconColor: "#dc2626", valColor: "#dc2626" },
            { label: "Completed Assessments", value: smCompleted + ssCompleted + tmCompleted, icon: CheckCircle2, bg: "#dcfce7", iconColor: "#16a34a", valColor: "#16a34a" },
            { label: "Submitted This Month", value: 2, icon: Send, bg: "#dbeafe", iconColor: "#2563eb", valColor: "#2563eb" },
            { label: "Current Assessment Cycle", value: "May 2026", icon: Calendar, bg: "#f1f5f9", iconColor: "#475569", valColor: "#0f172a" }
          ].map((stat, idx) => (
            <div 
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                borderRight: idx < 4 ? "1px solid #e2e8f0" : "none",
                paddingRight: "16px"
              }}
            >
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.iconColor, flexShrink: 0 }}>
                <stat.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: stat.valColor, lineHeight: 1.1 }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.2px", lineHeight: "1.2" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Assessments Card */}
        <div 
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>Recent Assessments</h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Latest assessment activities across all categories</p>
            </div>
            <button 
              type="button"
              onClick={() => alert("Redirecting to full assessment ledger...")}
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700",
                color: "#334155",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer"
              }}
            >
              <ClipboardList size={14} /> View All Assessments
            </button>
          </div>

          {/* Table */}
          <div className="sdom-table-wrap" style={{ overflowX: "auto" }}>
            <table className="sdom-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #e2e8f0", background: "#f8fafc", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Staff Name</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Category</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Assessment Type</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Assessed By</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Date</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "R. Khan", role: "Station Master", type: "Field Evaluation", status: "Pending", by: "TI PAR", date: "09 May 2026" },
                  { name: "A. Kulkarni", role: "Station Superintendent", type: "Operational Review", status: "Pending", by: "TI AMLA", date: "08 May 2026" },
                  { name: "S. Verma", role: "Train Manager", type: "Safety & Compliance", status: "Completed", by: "TI NGP", date: "07 May 2026" },
                  { name: "P. Sharma", role: "Station Master", type: "Field Evaluation", status: "Pending", by: "TI PAR", date: "06 May 2026" },
                  { name: "M. Joshi", role: "Train Manager", type: "Documentation Audit", status: "Pending", by: "TI AMLA", date: "05 May 2026" }
                ].map((row, idx) => {
                  const roleColors = {
                    "Station Master": { bg: "#eff6ff", color: "#2563eb" },
                    "Station Superintendent": { bg: "#f5f3ff", color: "#7c3aed" },
                    "Train Manager": { bg: "#f0fdf4", color: "#16a34a" }
                  }[row.role] || { bg: "#f1f5f9", color: "#475569" };

                  const statusColors = {
                    "Completed": { bg: "#dcfce7", color: "#16a34a" },
                    "Pending": { bg: "#fee2e2", color: "#dc2626" }
                  }[row.status] || { bg: "#f1f5f9", color: "#475569" };

                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0f172a" }}>{row.name}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: roleColors.bg, color: roleColors.color, padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                          {row.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#334155", fontSize: "13px", fontWeight: "500" }}>{row.type}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: statusColors.bg, color: statusColors.color, padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569", fontSize: "13px", fontWeight: "600" }}>{row.by}</td>
                      <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px" }}>{row.date}</td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button 
                          type="button"
                          onClick={() => alert(`Viewing details of assessment for ${row.name}...`)}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            padding: "5px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#475569",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer"
                          }}
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };


  /* ── REPORTS ── */
  const renderReports = ()=>{
    const ROLE_MAP = { pointsmen: "Pointsman", sm: "Station Master", ss: "Station Superintendent", tm: "Train Manager", ti: "Traffic Inspector", Pointsman: "Pointsman", "Station Master": "Station Master", "Station Superintendent": "Station Superintendent", "Train Manager": "Train Manager", "Traffic Inspector": "Traffic Inspector" };
    
    if (selectedReportUserId) {
      const u = users.find(x => x.id === selectedReportUserId);
      if (!u) return null;

      const getCat = s => s >= 80 ? "A" : s >= 50 ? "B" : s >= 26 ? "C" : "D";
      const cat = u.cat || getCat(u.score || 0);
      
      const CAT_C  = { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#dc2626" };
      const CAT_B  = { A: "#dcfce7", B: "#dbeafe", C: "#fef3c7", D: "#fee2e2" };
      const RISK_C = { High: "#dc2626", Medium: "#d97706", Low: "#16a34a" };
      
      const isHighRisk = u.pmeStatus === "Overdue" || u.refStatus === "Expired" || (u.score || 0) < 50;
      const risk = isHighRisk ? "High" : (u.score || 0) >= 80 ? "Low" : "Medium";
      const pmeVal = u.pmeStatus === "Fit" ? "FIT" : u.pmeStatus === "Pending" ? "PENDING" : u.pmeStatus === "Overdue" ? "OVERDUE" : "UNFIT";
      const refVal = u.refStatus === "Cleared" ? "CLEARED" : "EXPIRED";

      const pmAssess = pmList.find(p => p.hrmsId === u.id);
      const smAssess = smList.find(s => s.hrmsId === u.id);
      const smForm = smForms[smAssess?.id];

      return (
        <div className="ti2-card animate-fade-in" style={{ padding: "24px", background: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
          {/* Header section with back button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #e2edf8", paddingBottom: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="ti2-pm-avatar" style={{ width: 48, height: 48, fontSize: 18, background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontWeight: "700" }}>{u.name.charAt(0)}</div>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>{u.name}</h2>
                <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b", fontWeight: "700" }}>{ROLE_MAP[u.role] || u.designation || u.role} Dossier · {u.station}</p>
              </div>
            </div>
            <button className="ti2-link-btn" onClick={() => setSelectedReportUserId(null)} style={{ fontSize: "13px", fontWeight: "800", color: "#2563eb", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
              â† Back to Reports
            </button>
          </div>

          {/* Quick Info Summary metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={{ background: "#f8fafc", border: "1px solid #e2edf8", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Grand Total Score</span>
              <strong style={{ display: "block", fontSize: "24px", color: CAT_C[cat] || "#2563eb", marginTop: "4px", fontWeight: "900" }}>{u.score}/100</strong>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2edf8", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Safety Grade</span>
              <div>
                <span className="ti2-badge" style={{ display: "inline-block", background: CAT_B[cat] || "#dbeafe", color: CAT_C[cat] || "#2563eb", fontSize: "13px", fontWeight: "800", padding: "4px 14px", borderRadius: "8px", marginTop: "8px" }}>
                  Category {cat}
                </span>
              </div>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2edf8", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>PME Clearance</span>
              <div>
                <span className="ti2-badge" style={{ display: "inline-block", background: pmeVal === "FIT" ? "#dcfce7" : "#fee2e2", color: pmeVal === "FIT" ? "#16a34a" : "#dc2626", fontSize: "13px", fontWeight: "800", padding: "4px 14px", borderRadius: "8px", marginTop: "8px" }}>
                  {pmeVal}
                </span>
              </div>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2edf8", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>REF Training</span>
              <div>
                <span className="ti2-badge" style={{ display: "inline-block", background: refVal === "CLEARED" ? "#dcfce7" : "#fee2e2", color: refVal === "CLEARED" ? "#16a34a" : "#dc2626", fontSize: "13px", fontWeight: "800", padding: "4px 14px", borderRadius: "8px", marginTop: "8px" }}>
                  {refVal}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "24px" }}>
            {/* Left side details card */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "18px" }}>
                <h3 style={{ margin: "0 0 14px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1.5px solid #e2edf8", paddingBottom: "8px" }}>Personnel Roster Details</h3>
                <dl style={{ display: "flex", flexDirection: "column", gap: "12px", margin: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><dt style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>Employee HRMS ID</dt><dd style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>{u.id}</dd></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><dt style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>Designation</dt><dd style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>{ROLE_MAP[u.role] || u.designation}</dd></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><dt style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>Jurisdiction Station</dt><dd style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>{u.station}</dd></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><dt style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>Contact Number</dt><dd style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>{u.contact || "+91 98765 11001"}</dd></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><dt style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>Date of Appointment</dt><dd style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>{u.joiningDate || "2018-02-12"}</dd></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><dt style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>Alcoholic Status</dt><dd style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: u.alcoholicStatus === "Alcoholic" ? "#dc2626" : "#16a34a" }}>{u.alcoholicStatus || "Non-Alcoholic"}</dd></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><dt style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>Assigned Division Risk</dt><dd style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: RISK_C[risk] }}>{risk} Risk</dd></div>
                </dl>
              </div>

              {/* Action button */}
              <button className="ti2-primary-btn" onClick={() => alert("Exporting Dossier PDF...")} style={{ width: "100%", height: "42px", justifyContent: "center", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "8px", fontWeight: "700", cursor: "pointer", border: "none", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={16}/> Export Assessment Dossier (PDF)
              </button>
            </div>

            {/* Right side Performance Breakdown */}
            <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "18px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1.5px solid #e2edf8", paddingBottom: "8px" }}>Sectional Competency Breakdown</h3>
              
              {u.role === "Pointsman" || u.role === "pointsmen" ? (
                /* Pointsman sections competency progress bars */
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {(() => {
                    const secs = pmAssess?.finalSections || pmAssess?.originalSections || [
                      { title: "Knowledge of Rules", score: Math.round(u.score * 0.23), max: 25 },
                      { title: "Alertness & Observation", score: Math.round(u.score * 0.22), max: 25 },
                      { title: "Safety Record", score: Math.round(u.score * 0.14), max: 15 },
                      { title: "Leadership & Management", score: Math.round(u.score * 0.13), max: 15 },
                      { title: "Discipline", score: Math.round(u.score * 0.09), max: 10 },
                      { title: "Appearance & Neatness", score: Math.round(u.score * 0.09), max: 10 },
                    ];
                    return secs.map(s => {
                      const pct = Math.round((s.score / s.max) * 100);
                      return (
                        <div key={s.title}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                            <span>{s.title}</span>
                            <strong>{s.score} / {s.max} ({pct}%)</strong>
                          </div>
                          <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#16a34a" : pct >= 50 ? "#2563eb" : "#dc2626", borderRadius: "999px" }}/>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                /* Station Master sections competency progress bars */
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {(() => {
                    let totalYes = smForm ? smForm.stationMgmt.filter(v => v === "Yes").length +
                                           smForm.safety.filter(v => v === "Yes").length +
                                           smForm.staffSupervision.filter(v => v === "Yes").length +
                                           smForm.documentation.filter(v => v === "Yes").length +
                                           smForm.emergency.filter(v => v === "Yes").length : 12;
                    let knowledgeMarks = smForm ? Math.min(parseInt(smForm.knowledgeMarks) || 0, 25) : Math.max(0, u.score - 60);

                    const secs = [
                      { title: "Station Management", score: smForm ? smForm.stationMgmt.filter(v => v === "Yes").length * 5 : Math.round(totalYes * 5 * 0.25), max: 25 },
                      { title: "Safety & Compliance", score: smForm ? smForm.safety.filter(v => v === "Yes").length * 4 : Math.round(totalYes * 4 * 0.25), max: 20 },
                      { title: "Staff Supervision", score: smForm ? smForm.staffSupervision.filter(v => v === "Yes").length * 3 : Math.round(totalYes * 3 * 0.20), max: 15 },
                      { title: "Documentation & Reporting", score: smForm ? smForm.documentation.filter(v => v === "Yes").length * 3 : Math.round(totalYes * 3 * 0.15), max: 15 },
                      { title: "Emergency Handling", score: smForm ? smForm.emergency.filter(v => v === "Yes").length * 5 : Math.round(totalYes * 5 * 0.25), max: 25 },
                      { title: "Knowledge (Safety Exam)", score: knowledgeMarks, max: 25 }
                    ];

                    return secs.map(s => {
                      const pct = Math.round((s.score / s.max) * 100);
                      return (
                        <div key={s.title}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                            <span>{s.title}</span>
                            <strong>{s.score} / {s.max} ({pct}%)</strong>
                          </div>
                          <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#16a34a" : pct >= 50 ? "#2563eb" : "#dc2626", borderRadius: "999px" }}/>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    const divSummary = [
      { label: "Average Division Score",  val: 87    },
      { label: "Safety Compliance %",     val: "91%" },
      { label: "High-Risk Staff",         val: 18    },
      { label: "Pending Approvals",       val: 246   },
      { label: "Total Reports Generated", val: 6245  },
    ];

    const STATION_OPTS = ["All", ...stations.map(s => s.name)];
    const TI_OPTS      = ["All","TI PAR","TI AMLA","TI NGP"];
    const ROLE_OPTS    = ["All","Pointsman","Station Master","Station Superintendent","Train Manager"];

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
    const getTiArea = (st) => stationTiMap[st] || "TI NGP";

    const getCat = s => s >= 80 ? "A" : s >= 50 ? "B" : s >= 26 ? "C" : "D";

    const repFiltered = users.filter(s => {
      const matchesSearch = !repF.search || 
        (s.name || "").toLowerCase().includes(repF.search.toLowerCase()) || 
        (s.id || "").toLowerCase().includes(repF.search.toLowerCase());
      const matchesRole = repF.role === "All" || (s.role || "").toLowerCase() === repF.role.toLowerCase() || (s.designation || "").toLowerCase().includes(repF.role.toLowerCase());
      const matchesStation = repF.station === "All" || s.station === repF.station;
      const matchesCat = repF.cat === "All" || (s.cat || getCat(s.score)) === repF.cat;
      const isHighRisk = s.pmeStatus === "Overdue" || s.refStatus === "Expired" || s.score < 50;
      const sRisk = isHighRisk ? "High" : s.score >= 80 ? "Low" : "Medium";
      const matchesRisk = repF.risk === "All" || sRisk === repF.risk;
      return matchesSearch && matchesRole && matchesStation && matchesCat && matchesRisk;
    });

    const catBadge = c => <span className="sdom-badge" style={{ background: { A: "#dcfce7", B: "#dbeafe", C: "#fef3c7", D: "#fee2e2" }[c] || "#f3f4f6", color: { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#dc2626" }[c] || "#6b7280" }}>{c ? `Cat. ${c}` : "—"}</span>;
    const riskBadge = r => <span className="sdom-badge" style={{ background: { Low: "#dcfce7", Medium: "#fef3c7", High: "#fee2e2" }[r] || "#f3f4f6", color: { Low: "#16a34a", Medium: "#d97706", High: "#dc2626" }[r] || "#6b7280" }}>{r}</span>;
    const statusBadge = s => <span className="sdom-badge" style={{ background: { Approved: "#dcfce7", Pending: "#fef3c7", Rejected: "#fee2e2", Completed: "#dcfce7", Fit: "#dcfce7" }[s] || "#f3f4f6", color: { Approved: "#16a34a", Pending: "#d97706", Rejected: "#dc2626", Completed: "#16a34a", Fit: "#16a34a" }[s] || "#6b7280" }}>{s}</span>;

    return (
      <div className="sdom-fade" style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px" }}>
        <h1 className="sdom-page-title" style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Reports &amp; Analytics</h1>
        <p className="sdom-page-subtitle" style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px" }}>Division-level reporting hub. Use filters below to generate specific staff reports.</p>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "16px", marginBottom: "24px" }}>
          {divSummary.map(c => (
            <div key={c.label} className="sdom-stat-card" style={{ background: "white", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="sdom-stat-value" style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{c.val}</div>
              <div className="sdom-stat-label" style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase" }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="sdom-filter-bar" style={{ display: "flex", gap: "16px", background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="sdom-filter-field" style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 2, minWidth: "200px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Search by Name/HRMS ID</label>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}/>
              <input 
                type="text" 
                placeholder="Type name or HRMS ID..." 
                value={repF.search || ""} 
                onChange={e => setRepF(p => ({ ...p, search: e.target.value }))} 
                style={{ width: "100%", height: "42px", padding: "0 12px 0 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600", outline: "none" }}
              />
            </div>
          </div>
          <div className="sdom-filter-field" style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "120px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Role</label>
            <select value={repF.role} onChange={e => setRepF(p => ({ ...p, role: e.target.value }))} style={{ height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600" }}>
              {ROLE_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="sdom-filter-field" style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "140px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Station</label>
            <select value={repF.station} onChange={e => setRepF(p => ({ ...p, station: e.target.value }))} style={{ height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600" }}>
              {STATION_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="sdom-filter-field" style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "100px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Category</label>
            <select value={repF.cat} onChange={e => setRepF(p => ({ ...p, cat: e.target.value }))} style={{ height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600" }}>
              <option>All</option><option>A</option><option>B</option><option>C</option><option>D</option>
            </select>
          </div>
          <div className="sdom-filter-field" style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "110px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Risk Level</label>
            <select value={repF.risk} onChange={e => setRepF(p => ({ ...p, risk: e.target.value }))} style={{ height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: "600" }}>
              <option>All</option><option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <button className="sdom-btn-primary" style={{ height: "42px", display: "flex", alignItems: "center", gap: "8px", background: "#2563eb", color: "white", padding: "0 20px", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
              <Search size={16}/> Search
            </button>
          </div>
        </div>

        <div className="sdom-chart-card" style={{ background: "white", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom: 14, fontWeight: 700, color: "#1e293b" }}>{repFiltered.length} staff in report</div>
          <div className="sdom-table-wrap" style={{ overflowX: "auto" }}>
            <table className="sdom-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #e2e8f0", background: "#f8fafc", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Name</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Role</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Station</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>TI Area</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Score</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Category</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Risk</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#475569", fontWeight: "700" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {repFiltered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No staff match the selected filters</td></tr>}
                {repFiltered.map(s => {
                  const sCat = s.cat || getCat(s.score);
                  const isHighRisk = s.pmeStatus === "Overdue" || s.refStatus === "Expired" || s.score < 50;
                  const sRisk = isHighRisk ? "High" : s.score >= 80 ? "Low" : "Medium";
                  return (
                    <tr key={s.id} style={{ cursor: "pointer", borderBottom: "1px solid #f1f5f9" }} onClick={() => setSelectedReportUserId(s.id)}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2563eb" }}>{s.name}</td>
                      <td style={{ padding: "12px 16px", color: "#334155", fontWeight: "500" }}>{ROLE_MAP[s.role] || s.role}</td>
                      <td style={{ padding: "12px 16px", color: "#334155", fontWeight: "500" }}>{s.station}</td>
                      <td style={{ padding: "12px 16px", color: "#334155", fontWeight: "500" }}>{getTiArea(s.station)}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>{s.score}</td>
                      <td style={{ padding: "12px 16px" }}>{catBadge(sCat)}</td>
                      <td style={{ padding: "12px 16px" }}>{riskBadge(sRisk)}</td>
                      <td style={{ padding: "12px 16px" }}>{statusBadge(s.pmeStatus === "Unfit" ? "Rejected" : s.refStatus === "Expired" ? "Pending" : "Approved")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     RENDER: CONTENT ROUTER
  ═══════════════════════════════════════════ */
  const renderContent = ()=>{
    switch(activePage){
      case "dashboard":    return renderDashboard();
      case "profile":      return renderProfile();
      case "stations":     return renderStations();
      case "pointsmen":              return renderRoleView("Pointsman", "Pointsman");
      case "stationMasters":         return renderRoleView("Station Master", "Station Master");
      case "stationSuperintendents": return renderRoleView("Station Superintendent", "Station Superintendent");
      case "trainManagers":          return renderRoleView("Train Manager", "Train Manager");
      case "approvals":    return renderApprovals();
      case "assessments":  return renderAssessments();
      case "myAssessment": return renderMyAssessment();
      case "pmePosition":  return renderPmePosition();
      case "refPosition":  return renderRefPosition();
      case "inspections":  return renderInspections();
      case "counselling":  return renderCounselling();
      case "reports":      return renderReports();
      default:             return renderDashboard();
    }
  };

  /* ═══════════════════════════════════════════
     SHELL LAYOUT
  ═══════════════════════════════════════════ */
  return (
    <div className="ti2-layout">
      <input type="checkbox" id="sdom-sidebar-toggle" className="sdom-sidebar-checkbox" style={{ display: "none" }} />
      {/* Top Navigation Header */}
      <header className="ti2-topbar">
        <label htmlFor="sdom-sidebar-toggle" className="sdom-sidebar-toggle-btn"></label>
        <div className="ti2-topbar-brand">
          <div className="ti2-topbar-logo">IR</div>
          <div>
            <h1>Indian Railway Evaluation Command</h1>
            <p>Operations Workspace: Traffic Inspector Module</p>
          </div>
        </div>

        <div className="ti2-user-strip">
          
          {/* Dynamic Real-Time Notifications Bell Dropdown */}
          <div style={{ position: "relative", marginRight: "6px" }}>
            <button
              onClick={() => setBellDropdownOpen(!bellDropdownOpen)}
              style={{ background: "none", border: "none", color: "#e2edf8", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", padding: "6px", borderRadius: "50%" }}
            >
              <Bell size={20}/>
              {notifications.filter(n=>!n.read).length > 0 && (
                <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "16px", height: "16px", borderRadius: "50%", background: "#dc2626", color: "#ffffff", fontSize: "9px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notifications.filter(n=>!n.read).length}
                </span>
              )}
            </button>

            {bellDropdownOpen && (
              <div style={{ position: "absolute", top: "36px", right: 0, width: "320px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "14px", boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)", zIndex: 1000, overflow: "hidden", color: "#0f172a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2edf8" }}>
                  <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800" }}>Operations Alerts</h4>
                  {notifications.filter(n=>!n.read).length > 0 && (
                    <button onClick={markAllNotificationsRead} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}>Mark all read</button>
                  )}
                </div>
                <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: n.read ? "#fff" : "#f0f6ff" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.type === "danger" ? "#dc2626" : n.type === "warning" ? "#ea580c" : "#16a34a", marginTop: "4px", flexShrink: 0 }}></div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "12px", lineHeight: "1.4", fontWeight: n.read ? "500" : "800", color: "#1e293b" }}>{n.message}</p>
                        <span style={{ fontSize: "10px", color: "#64748b" }}>{n.time}</span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="ti2-empty">No alerts in your inbox.</p>}
                </div>
              </div>
            )}
          </div>

          <div className="ti2-user-avatar">{tiName.charAt(0)}</div>
          <div>
            <strong>{tiName}</strong>
            <span>HRMS ID: {tiId}</span>
          </div>
          <button className="ti2-logout-btn" onClick={onLogout}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </header>

      {/* Main layout shell */}
      <div className="ti2-shell">
        <aside className="ti2-sidebar">
          {NAV.map(item=>{
            const Icon=item.icon;
            const active = activePage === item.key;
            return (
              <button key={item.key} className={`ti2-nav-item${active?" active":""}`}
                onClick={()=>goTo(item.key)}>
                <Icon size={16}/><span>{item.label}</span>
              </button>
            );
          })}
          

        </aside>

        <main className="ti2-main">
          {statusMsg && (
            <div className="ti2-status-banner">
              <CheckCircle2 size={13}/> {statusMsg}
              <button className="ti2-dismiss" onClick={()=>setStatusMsg("")}>×</button>
            </div>
          )}
          <div className="ti2-page-wrap">{renderContent()}</div>
        </main>
      </div>

      {/* ── Fullscreen Analytics Modal ── */}
      {fullscreenChart && (
        <div className="sm2-fullscreen-modal">
          {/* Header */}
          <div className="sm2-fullscreen-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="sm2-fullscreen-icon-wrap">
                {fullscreenChart === "station" && <Building2 size={18} color="#93c5fd" />}
                {fullscreenChart === "trend"   && <TrendingUp size={18} color="#a78bfa" />}
                {fullscreenChart === "grade"   && <BarChart3  size={18} color="#34d399" />}
              </div>
              <div>
                <h2>
                  {fullscreenChart === "station" && "Station-wise Safety & Performance — Deep Dive"}
                  {fullscreenChart === "trend"   && "Compliance & Assessment Trends — Deep Dive"}
                  {fullscreenChart === "grade"   && "Staff Grade Distribution (Pointsmen) — Deep Dive"}
                </h2>
                <p>Indian Railway Evaluation Command · Operations Workspace</p>
              </div>
            </div>
            <button className="sm2-fullscreen-close-btn" onClick={() => setFullscreenChart(null)}>
              ✕ Close
            </button>
          </div>

          {/* Filter Bar */}
          <div className="sm2-fullscreen-filter-bar">
            <span className="sm2-fs-filter-tag">FILTERS</span>
            <input
              type="text"
              placeholder={fullscreenChart === "station" ? "Search station name / code..." : "Search staff name / ID..."}
              value={fsSearch}
              onChange={e => setFsSearch(e.target.value)}
              className="sm2-fs-input"
            />
            {fullscreenChart !== "trend" && (
              <>
                <select value={fsCatFilter} onChange={e => setFsCatFilter(e.target.value)} className="sm2-fs-select">
                  <option value="All">All Grades (A-D)</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="D">Grade D</option>
                </select>
                <select value={fsRiskFilter} onChange={e => setFsRiskFilter(e.target.value)} className="sm2-fs-select">
                  <option value="All">All Risk Levels</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
              </>
            )}
            <button onClick={() => { setFsSearch(""); setFsCatFilter("All"); setFsRiskFilter("All"); }} className="sm2-fs-reset-btn">
              Reset
            </button>
            <div className="sm2-fs-counter">
              {fullscreenChart === "station" && (
                <>Showing <strong>{filteredFsStations.length}</strong> of {stationStats.length} stations</>
              )}
              {fullscreenChart === "grade" && (
                <>Showing <strong>{filteredFsUsers.length}</strong> of {users.filter(u=>u.role==="Pointsman").length} Pointsmen</>
              )}
              {fullscreenChart === "trend" && (
                <>Displaying all <strong>{MONTHLY.length}</strong> monthly cycles</>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="sm2-fullscreen-content">
            
            {/* KPI Cards Row */}
            <div className="sm2-fs-kpi-row">
              {fullscreenChart === "station" && (
                <>
                  {[
                    { label: "Avg Performance Score", value: filteredFsStations.length ? Math.round(filteredFsStations.reduce((s,x)=>s+x.avgScore,0)/filteredFsStations.length) + "%" : "—", color: "#2563eb", glowColor: "rgba(37,99,235,0.15)" },
                    { label: "Avg Safety Compliance", value: filteredFsStations.length ? Math.round(filteredFsStations.reduce((s,x)=>s+x.safetyPct,0)/filteredFsStations.length) + "%" : "—", color: "#7c3aed", glowColor: "rgba(124,58,237,0.15)" },
                    { label: "High-Risk Stations", value: filteredFsStations.filter(st => st.highRisk >= 2).length, color: "#dc2626", glowColor: "rgba(220,38,38,0.15)" },
                    { label: "Grade A Stations", value: filteredFsStations.filter(st => getCat(st.avgScore) === "A").length, color: "#16a34a", glowColor: "rgba(22,163,74,0.15)" },
                    { label: "Total Filtered Stations", value: filteredFsStations.length, color: "#0891b2", glowColor: "rgba(8,145,178,0.15)" },
                  ].map(k => (
                    <div key={k.label} className="sm2-fs-kpi-card" style={{ "--glow": k.glowColor }}>
                      <div className="sm2-fs-kpi-value" style={{ color: k.color }}>{k.value}</div>
                      <div className="sm2-fs-kpi-label">{k.label}</div>
                    </div>
                  ))}
                </>
              )}

              {fullscreenChart === "trend" && (
                <>
                  {[
                    { label: "Total Tests Taken", value: MONTHLY.reduce((s,x)=>s+x.assessments,0), color: "#2563eb", glowColor: "rgba(37,99,235,0.15)" },
                    { label: "Overall Score Average", value: Math.round(MONTHLY.reduce((s,x)=>s+x.avgScore,0)/MONTHLY.length) + "%", color: "#0891b2", glowColor: "rgba(8,145,178,0.15)" },
                    { label: "Overall Safety Average", value: Math.round(MONTHLY.reduce((s,x)=>s+x.safetyAvg,0)/MONTHLY.length) + "%", color: "#16a34a", glowColor: "rgba(22,163,74,0.15)" },
                    { label: "Safety Compliance Peak", value: Math.max(...MONTHLY.map(m=>m.safetyAvg)) + "%", color: "#7c3aed", glowColor: "rgba(124,58,237,0.15)" },
                    { label: "Evaluation Cycles Logged", value: MONTHLY.length, color: "#475569", glowColor: "rgba(71,85,105,0.15)" },
                  ].map(k => (
                    <div key={k.label} className="sm2-fs-kpi-card" style={{ "--glow": k.glowColor }}>
                      <div className="sm2-fs-kpi-value" style={{ color: k.color }}>{k.value}</div>
                      <div className="sm2-fs-kpi-label">{k.label}</div>
                    </div>
                  ))}
                </>
              )}

              {fullscreenChart === "grade" && (
                <>
                  {[
                    { label: "Avg Personnel Score", value: filteredFsUsers.length ? Math.round(filteredFsUsers.reduce((s,x)=>s+x.score,0)/filteredFsUsers.length) + "%" : "—", color: "#2563eb", glowColor: "rgba(37,99,235,0.15)" },
                    { label: "Fit (PME Status)", value: filteredFsUsers.filter(u => u.pmeStatus === "Fit").length, color: "#16a34a", glowColor: "rgba(22,163,74,0.15)" },
                    { label: "Cleared (REF Status)", value: filteredFsUsers.filter(u => u.refStatus === "Cleared").length, color: "#0891b2", glowColor: "rgba(8,145,178,0.15)" },
                    { label: "Grade A Personnel", value: filteredFsUsers.filter(u => getCat(u.score) === "A").length, color: "#7c3aed", glowColor: "rgba(124,58,237,0.15)" },
                    { label: "High Risk Staff Count", value: filteredFsUsers.filter(u => u.pmeStatus === "Overdue" || u.refStatus === "Expired" || u.score < 50).length, color: "#dc2626", glowColor: "rgba(220,38,38,0.15)" },
                  ].map(k => (
                    <div key={k.label} className="sm2-fs-kpi-card" style={{ "--glow": k.glowColor }}>
                      <div className="sm2-fs-kpi-value" style={{ color: k.color }}>{k.value}</div>
                      <div className="sm2-fs-kpi-label">{k.label}</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Scaled High-Fidelity Chart */}
            <div className="sm2-fs-chart-container" style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}>
                {fullscreenChart === "station" && "📊 Station-wise Safety Compliance & Performance Comparison"}
                {fullscreenChart === "trend"   && "📈 Monthly Safety Audits & Compliance Volumes"}
                {fullscreenChart === "grade"   && "ðŸ… Staff Grading Allocation Matrix"}
              </h3>
              <div className="sm2-fs-chart-wrapper" style={{ width: "100%", height: "380px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {fullscreenChart === "station" ? (
                    <BarChart data={fsStBarData} margin={{ top: 8, right: 10, left: -10, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 700 }}/>
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false}/>
                      <Tooltip content={<TiTooltip/>}/>
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }}/>
                      <Bar dataKey="avgScore" name="Avg Performance Score (%)" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={38}/>
                      <Bar dataKey="safetyPct" name="Safety Compliance Rate (%)" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={38}/>
                    </BarChart>
                  ) : fullscreenChart === "trend" ? (
                    <LineChart data={MONTHLY} margin={{ top: 8, right: 10, left: -24, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}/>
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false}/>
                      <Tooltip content={<TiTooltip/>}/>
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }}/>
                      <Line type="monotone" dataKey="assessments" name="Tests Taken" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="safetyAvg" name="Safety Compliance Avg" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie data={fsPieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} dataKey="value" paddingAngle={4}>
                        {fsPieData.map((e,i)=><Cell key={e.name} fill={PIE_C[i]}/>)}
                      </Pie>
                      <Tooltip formatter={(v,n,p)=>[`${v} Staff`,`Category ${p.payload.name}`]}/>
                      <Legend formatter={(v,e)=>`Grade ${e.payload.name} — ${e.payload.value} staff`} iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }}/>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Deep-Dive Grid/Table List */}
            <div className="sm2-fs-low-perf-section" style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                🔎 Detailed Evaluation Ledger
              </h3>
              
              {fullscreenChart === "station" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                  {filteredFsStations.map(st => {
                    const level = st.highRisk >= 2 ? "High" : st.highRisk > 0 ? "Medium" : "Low";
                    return (
                      <div key={st.id} className="ti2-highlight-card" style={{ borderTop: `4px solid ${RISK_C[level]}`, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "130px", background: "#f8fafc", padding: "16px", boxSizing: "border-box" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{st.name} ({st.code})</strong>
                            <span className="ti2-badge" style={{ background: RISK_B[level], color: RISK_C[level] }}>{level} Risk</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", display: "flex", gap: "10px", marginTop: "8px" }}>
                            <span>Avg Score: <strong>{st.avgScore}%</strong></span>
                            <span>Compliance: <strong>{st.safetyPct}%</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedStation(st); setActivePage("stations"); setFullscreenChart(null); }}
                          className="ti2-link-btn-sm"
                          style={{ width: "100%", justifyContent: "center", marginTop: "12px", background: "#ffffff" }}
                        >
                          View Station Analytics →
                        </button>
                      </div>
                    );
                  })}
                  {filteredFsStations.length === 0 && (
                    <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", gridColumn: "1/-1", padding: "20px 0" }}>No stations match your current filters.</p>
                  )}
                </div>
              )}

              {fullscreenChart === "trend" && (
                <div className="ti2-table-wrap">
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.5fr 2fr", padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "700", fontSize: "11px" }}>
                    <span>Evaluation Period</span>
                    <span>Assessments Volume</span>
                    <span>Performance Avg (%)</span>
                    <span>Safety Compliance Rating</span>
                  </div>
                  {MONTHLY.map(m => (
                    <div key={m.month} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.5fr 2fr", padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                      <strong>{m.month}</strong>
                      <span>{m.assessments} tests administered</span>
                      <span>{m.avgScore}% avg</span>
                      <strong style={{ color: m.safetyAvg >= 80 ? "#16a34a" : "#ea580c" }}>{m.safetyAvg}% compliance</strong>
                    </div>
                  ))}
                </div>
              )}

              {fullscreenChart === "grade" && (
                <div className="ti2-table-wrap">
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr 1fr 1fr", padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "700", fontSize: "11px" }}>
                    <span>Pointsman Name</span>
                    <span>Staff ID</span>
                    <span>Station Location</span>
                    <span>PME Status</span>
                    <span>REF Status</span>
                    <span>Evaluation Score</span>
                  </div>
                  {filteredFsUsers.map(u => {
                    const grade = getCat(u.score);
                    return (
                      <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr 1fr 1fr", padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "13px", alignItems: "center" }}>
                        <strong>{u.name}</strong>
                        <span style={{ fontFamily: "monospace" }}>{u.id}</span>
                        <span>{u.station}</span>
                        <span style={{ color: u.pmeStatus === "Fit" ? "#16a34a" : "#dc2626", fontWeight: "600" }}>{u.pmeStatus}</span>
                        <span style={{ color: u.refStatus === "Cleared" ? "#16a34a" : "#dc2626", fontWeight: "600" }}>{u.refStatus}</span>
                        <strong><span className="ti2-badge" style={{ background: CAT_B[grade], color: CAT_C[grade] }}>Grade {grade} ({u.score}%)</span></strong>
                      </div>
                    );
                  })}
                  {filteredFsUsers.length === 0 && (
                    <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>No personnel match your current filters.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      {renderChartZoomModal()}
    </div>
  );
}