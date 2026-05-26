import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpDown, Award, BarChart3, Building2,
  CheckCircle2, ChevronDown, ChevronRight, ClipboardCheck,
  FileBarChart2, Filter, LogOut, Search, ShieldCheck,
  TrendingUp, TrendingDown, UserCircle2, Users, XCircle, Eye
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
const NAV = [
  { key:"dashboard",      label:"Dashboard",                    icon: BarChart3 },
  { key:"profile",        label:"My Profile",                   icon: UserCircle2 },
  { key:"stations",       label:"Stations & Station Masters",   icon: Building2 },
  { key:"reviewPM",       label:"Review PM Assessments",        icon: ClipboardCheck },
  { key:"assessSM",       label:"Assess Station Masters",       icon: Users },
  { key:"myAssessment",   label:"My Assessment (by AOM)",       icon: FileBarChart2 },
  { key:"reports",        label:"Reports",                      icon: Filter },
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const getCat = s => s >= 80 ? "A" : s >= 50 ? "B" : s >= 26 ? "C" : "D";
const CAT_C  = { A:"#16a34a", B:"#2563eb", C:"#d97706", D:"#dc2626" };
const CAT_B  = { A:"#dcfce7", B:"#dbeafe", C:"#fef3c7", D:"#fee2e2" };
const PIE_C  = ["#16a34a","#2563eb","#d97706","#dc2626"];
const riskOf = st => st.highRisk > 2 ? "High" : st.highRisk > 0 ? "Medium" : "Low";
const RISK_C = { High:"#dc2626", Medium:"#d97706", Low:"#16a34a" };
const RISK_B = { High:"#fee2e2", Medium:"#fef3c7", Low:"#dcfce7" };

/* ═══════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════ */
const TI_PROFILE = {
  name:"R. Khan", hrmsId:"TI_1001", contact:"+91 98900 12211",
  designation:"Traffic Inspector", jurisdiction:"Parbhani-Amla Division",
  stationsManaged:3, totalSMs:6, totalPointsmen:24,
  lastAssessmentScore:88, lastAssessmentCat:"A",
  lastAssessmentDate:"2026-03-20", reportingOfficer:"AOM_GM_1001 — P. Joshi"
};

const STATIONS = [
  {
    id:"ST01", name:"Parbhani Junction", code:"PBN",
    avgScore:82, safetyPct:88, highRisk:1,
    trend:[78,80,81,82], pointsmenCount:10,
    sms:[
      { id:"SM_2101", name:"S. Deshmukh", cat:"A", lastAssessDate:"2026-03-20", score:86, station:"Parbhani Junction" },
      { id:"SM_2102", name:"A. Kulkarni",  cat:"B", lastAssessDate:"2026-02-14", score:72, station:"Parbhani Junction" },
    ]
  },
  {
    id:"ST02", name:"Amla Station", code:"AMLA",
    avgScore:68, safetyPct:74, highRisk:3,
    trend:[72,70,67,68], pointsmenCount:8,
    sms:[
      { id:"SM_2201", name:"M. Patil",   cat:"A", lastAssessDate:"2026-03-12", score:84, station:"Amla Station" },
      { id:"SM_2202", name:"R. Sharma",  cat:"C", lastAssessDate:"2026-01-30", score:54, station:"Amla Station" },
    ]
  },
  {
    id:"ST03", name:"Badnera Junction", code:"BD",
    avgScore:76, safetyPct:83, highRisk:1,
    trend:[70,73,74,76], pointsmenCount:6,
    sms:[
      { id:"SM_2301", name:"V. Singh",   cat:"A", lastAssessDate:"2026-03-15", score:88, station:"Badnera Junction" },
      { id:"SM_2302", name:"T. Mehta",   cat:"B", lastAssessDate:"2026-02-20", score:71, station:"Badnera Junction" },
    ]
  },
];

// Monthly trend
const MONTHLY = [
  { month:"Nov 25", assessments:14, avgScore:72, safetyAvg:74 },
  { month:"Dec 25", assessments:12, avgScore:74, safetyAvg:76 },
  { month:"Jan 26", assessments:18, avgScore:71, safetyAvg:73 },
  { month:"Feb 26", assessments:20, avgScore:77, safetyAvg:79 },
  { month:"Mar 26", assessments:22, avgScore:80, safetyAvg:82 },
];

// Pending + approved PM assessment records
const INIT_PM_ASSESSMENTS = [
  {
    id:"PA_1001", pointsmanName:"K. Pawar", hrmsId:"PM_1001",
    station:"Parbhani Junction", assessingSM:"S. Deshmukh",
    submissionDate:"2026-04-10", status:"Pending",
    originalSections:[
      { title:"Knowledge of Rules",      score:20, max:25 },
      { title:"Alertness & Observation", score:18, max:25 },
      { title:"Safety Record",           score:12, max:15 },
      { title:"Leadership & Management", score:11, max:15 },
      { title:"Discipline",              score:8,  max:10 },
      { title:"Appearance & Neatness",   score:7,  max:10 },
    ],
    meta:{ pmeStatus:"Fit", refStatus:"Cleared", alcoholicStatus:"Non-Alcoholic" },
    tiRemarks:"", tiModified:false, auditTrail:[]
  },
  {
    id:"PA_1002", pointsmanName:"R. Verma", hrmsId:"PM_1002",
    station:"Amla Station", assessingSM:"M. Patil",
    submissionDate:"2026-04-09", status:"Pending",
    originalSections:[
      { title:"Knowledge of Rules",      score:17, max:25 },
      { title:"Alertness & Observation", score:16, max:25 },
      { title:"Safety Record",           score:10, max:15 },
      { title:"Leadership & Management", score:9,  max:15 },
      { title:"Discipline",              score:6,  max:10 },
      { title:"Appearance & Neatness",   score:6,  max:10 },
    ],
    meta:{ pmeStatus:"Fit", refStatus:"Pending", alcoholicStatus:"Non-Alcoholic" },
    tiRemarks:"", tiModified:false, auditTrail:[]
  },
  {
    id:"PA_1003", pointsmanName:"D. Rane", hrmsId:"PM_1003",
    station:"Amla Station", assessingSM:"M. Patil",
    submissionDate:"2026-04-08", status:"Pending",
    originalSections:[
      { title:"Knowledge of Rules",      score:14, max:25 },
      { title:"Alertness & Observation", score:13, max:25 },
      { title:"Safety Record",           score:8,  max:15 },
      { title:"Leadership & Management", score:7,  max:15 },
      { title:"Discipline",              score:4,  max:10 },
      { title:"Appearance & Neatness",   score:4,  max:10 },
    ],
    meta:{ pmeStatus:"Unfit", refStatus:"Pending", alcoholicStatus:"Alcoholic" },
    tiRemarks:"", tiModified:false, auditTrail:[]
  },
  {
    id:"PA_1004", pointsmanName:"J. Shaikh", hrmsId:"PM_1004",
    station:"Badnera Junction", assessingSM:"V. Singh",
    submissionDate:"2026-04-04", status:"Approved",
    originalSections:[
      { title:"Knowledge of Rules",      score:23, max:25 },
      { title:"Alertness & Observation", score:22, max:25 },
      { title:"Safety Record",           score:15, max:15 },
      { title:"Leadership & Management", score:13, max:15 },
      { title:"Discipline",              score:9,  max:10 },
      { title:"Appearance & Neatness",   score:9,  max:10 },
    ],
    finalSections:[
      { title:"Knowledge of Rules",      score:23, max:25 },
      { title:"Alertness & Observation", score:22, max:25 },
      { title:"Safety Record",           score:15, max:15 },
      { title:"Leadership & Management", score:13, max:15 },
      { title:"Discipline",              score:9,  max:10 },
      { title:"Appearance & Neatness",   score:9,  max:10 },
    ],
    meta:{ pmeStatus:"Fit", refStatus:"Cleared", alcoholicStatus:"Non-Alcoholic" },
    tiRemarks:"Excellent field performance. Approved as submitted.",
    tiModified:false, approvalDate:"2026-04-05",
    auditTrail:[{ action:"Approved without modification", by:"TI R. Khan", date:"2026-04-05" }]
  },
];

// SMs pending assessment by TI
const TI_SM_CRITERIA = [
  { key:"stationMgmt",  label:"Station Management",          weight:5, count:5,
    criteria:["Efficient train handling","Accurate scheduling","Staff deployment","Complaint resolution","Log maintenance"] },
  { key:"safety",       label:"Safety & Compliance",         weight:4, count:5,
    criteria:["Safety protocols followed","Incident reporting timely","Emergency drill conducted","Hazard identification","PPE enforced"] },
  { key:"staffSupervision", label:"Staff Supervision",       weight:3, count:5,
    criteria:["Regular briefings conducted","Feedback provided to staff","Leave management","Timekeeping enforced","Staff morale maintained"] },
  { key:"documentation",label:"Documentation & Reporting",   weight:3, count:5,
    criteria:["Daily log accurate","Monthly report submitted","Incident records maintained","Assessment documents filed","Handover notes complete"] },
  { key:"emergency",    label:"Emergency Handling",          weight:5, count:5,
    criteria:["Responded to emergencies promptly","Coordinated with control office","Passenger management during disruption","Track clear protocol followed","Post-incident review done"] },
];

const defaultSMForm = () => ({
  stationMgmt:      Array(5).fill(null),
  safety:           Array(5).fill(null),
  staffSupervision: Array(5).fill(null),
  documentation:    Array(5).fill(null),
  emergency:        Array(5).fill(null),
  knowledgeMarks:"", alcoholicStatus:"", pmeStatus:"Fit",
  refStatus:"Cleared", counselling:"Not Required",
  automaticTraining:"Not Required", remarks:""
});

const computeSMScore = form => {
  let total = 0;
  TI_SM_CRITERIA.forEach(c => {
    form[c.key].forEach(v => { if (v==="Yes") total += c.weight; });
  });
  const km = Math.min(parseInt(form.knowledgeMarks)||0, 25);
  // Total is out of 100: 25 (knowledge) + sections yield 75
  // Sections: 5×5+5×4+5×3+5×3+5×5 = 25+20+15+15+25 = 100 — too much, let's cap to 75
  return { ynScore: Math.min(total, 75), knowledge: km, total: Math.min(total, 75) + km };
};

const INIT_SM_LIST = [
  { id:"SMA_5001", name:"S. Deshmukh", hrmsId:"SM_2101", station:"Parbhani Junction", lastDate:"2026-03-20", status:"Pending" },
  { id:"SMA_5002", name:"M. Patil",    hrmsId:"SM_2201", station:"Amla Station",       lastDate:"2026-03-12", status:"Pending" },
  { id:"SMA_5003", name:"V. Singh",    hrmsId:"SM_2301", station:"Badnera Junction",   lastDate:"2026-03-15", status:"Submitted" },
  { id:"SMA_5004", name:"A. Kulkarni", hrmsId:"SM_2102", station:"Parbhani Junction",  lastDate:"2026-02-14", status:"Pending" },
];

// TI self-assessment history (done by AOM)
const TI_SELF_HISTORY = [
  {
    id:1, date:"2026-03-20", period:"Q1 2026", assessedBy:"AOM_GM_1001 — P. Joshi",
    totalScore:88, category:"A", approvalStatus:"Approved",
    aomRemarks:"Outstanding supervisory performance. Excellent cross-station coordination.",
    sections:[
      { title:"Multi-Station Oversight",    marks:18, outOf:20 },
      { title:"Assessment Quality",         marks:17, outOf:20 },
      { title:"Safety Governance",          marks:18, outOf:20 },
      { title:"Staff Development",          marks:17, outOf:20 },
      { title:"Reporting & Documentation",  marks:18, outOf:20 },
    ]
  },
  {
    id:2, date:"2025-12-15", period:"Q4 2025", assessedBy:"AOM_GM_1001 — P. Joshi",
    totalScore:81, category:"A", approvalStatus:"Approved",
    aomRemarks:"Good performance. Minor issues in documentation speed.",
    sections:[
      { title:"Multi-Station Oversight",    marks:16, outOf:20 },
      { title:"Assessment Quality",         marks:16, outOf:20 },
      { title:"Safety Governance",          marks:17, outOf:20 },
      { title:"Staff Development",          marks:15, outOf:20 },
      { title:"Reporting & Documentation",  marks:17, outOf:20 },
    ]
  },
  {
    id:3, date:"2025-09-10", period:"Q3 2025", assessedBy:"AOM_GM_1001 — P. Joshi",
    totalScore:93, category:"A", approvalStatus:"Approved",
    aomRemarks:"Exemplary. Best performing TI in the division this quarter.",
    sections:[
      { title:"Multi-Station Oversight",    marks:19, outOf:20 },
      { title:"Assessment Quality",         marks:18, outOf:20 },
      { title:"Safety Governance",          marks:19, outOf:20 },
      { title:"Staff Development",          marks:18, outOf:20 },
      { title:"Reporting & Documentation",  marks:19, outOf:20 },
    ]
  },
  {
    id:4, date:"2025-06-05", period:"Q2 2025", assessedBy:"AOM_GM_1001 — P. Joshi",
    totalScore:76, category:"B", approvalStatus:"Approved",
    aomRemarks:"Satisfactory. Improvement noted in safety compliance tracking.",
    sections:[
      { title:"Multi-Station Oversight",    marks:15, outOf:20 },
      { title:"Assessment Quality",         marks:15, outOf:20 },
      { title:"Safety Governance",          marks:16, outOf:20 },
      { title:"Staff Development",          marks:14, outOf:20 },
      { title:"Reporting & Documentation",  marks:16, outOf:20 },
    ]
  },
];

/* ═══════════════════════════════════════════
   CUSTOM TOOLTIP
═══════════════════════════════════════════ */
const TiTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ti2-tooltip">
      <strong>{label}</strong>
      {payload.map(p => <div key={p.name} style={{color:p.color}}>{p.name}: {p.value}</div>)}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function TrafficInspectorModule({ user, onLogout }) {
  const [activePage, setActivePage]       = useState("dashboard");
  const [statusMsg, setStatusMsg]         = useState("");

  // Stations
  const [expandedSt, setExpandedSt]       = useState({});
  const [selectedSM, setSelectedSM]       = useState(null);
  const [stSearch, setStSearch]           = useState("");
  const [stCatFilter, setStCatFilter]     = useState("All");

  // PM Review
  const [pmList, setPmList]               = useState(INIT_PM_ASSESSMENTS);
  const [reviewTab, setReviewTab]         = useState("Pending");
  const [reviewSearch, setReviewSearch]   = useState("");
  const [reviewStation, setReviewStation] = useState("All");
  const [selectedPmId, setSelectedPmId]   = useState(null);
  const [editSections, setEditSections]   = useState({});
  const [tiRemarks, setTiRemarks]         = useState({});
  const [showAudit, setShowAudit]         = useState({});
  const [rejectMode, setRejectMode]       = useState({});

  // SM Assess
  const [smList, setSmList]               = useState(INIT_SM_LIST);
  const [activeSmId, setActiveSmId]       = useState(null);
  const [smForms, setSmForms]             = useState({});
  const [smLocked, setSmLocked]           = useState({});

  // My Assessment
  const [selfSelected, setSelfSelected]   = useState(null);

  // Reports
  const [rpStation, setRpStation]         = useState("All");
  const [rpCat, setRpCat]                 = useState("All");
  const [rpRisk, setRpRisk]               = useState("All");
  const [rpSearch, setRpSearch]           = useState("");
  const [rpSort, setRpSort]               = useState("date-desc");

  const tiName = user?.name  || TI_PROFILE.name;
  const tiId   = user?.hrmsId || TI_PROFILE.hrmsId;

  /* ── Derived stats ── */
  const totalPM     = STATIONS.reduce((s,st)=>s+st.pointsmenCount,0);
  const totalSMs    = STATIONS.reduce((s,st)=>s+st.sms.length,0);
  const pending     = pmList.filter(p=>p.status==="Pending").length;
  const highRiskAll = STATIONS.reduce((s,st)=>s+st.highRisk,0);
  const avgScoreAll = Math.round(STATIONS.reduce((s,st)=>s+st.avgScore,0)/STATIONS.length);

  const bestSt  = [...STATIONS].sort((a,b)=>b.avgScore-a.avgScore)[0];
  const worstSt = [...STATIONS].sort((a,b)=>a.avgScore-b.avgScore)[0];
  const mostImp = [...STATIONS].sort((a,b)=>{
    const ga = b.trend[b.trend.length-1]-b.trend[0];
    const gb = a.trend[a.trend.length-1]-a.trend[0];
    return ga-gb;
  })[0];
  const highRiskSt = [...STATIONS].sort((a,b)=>b.highRisk-a.highRisk)[0];

  // pie for category distribution across all pointsmen
  const pieData = useMemo(()=>{
    const c={A:6,B:10,C:5,D:3};
    return Object.entries(c).map(([name,value])=>({name,value}));
  },[]);

  // Bar for station avg scores
  const stBarData = STATIONS.map(st=>({ name:st.code, avgScore:st.avgScore, safetyPct:st.safetyPct, highRisk:st.highRisk }));

  /* ── Filtered PM assessments ── */
  const filteredPM = useMemo(()=>{
    return pmList.filter(p=>{
      const st = p.status === reviewTab;
      const s  = !reviewSearch || p.pointsmanName.toLowerCase().includes(reviewSearch.toLowerCase()) || p.hrmsId.toLowerCase().includes(reviewSearch.toLowerCase());
      const r  = reviewStation==="All" || p.station===reviewStation;
      return st && s && r;
    });
  },[pmList,reviewTab,reviewSearch,reviewStation]);

  const selectedPM = pmList.find(p=>p.id===selectedPmId)||null;

  /* ── Report rows ── */
  const allPmForReport = STATIONS.flatMap(st=>
    st.sms.flatMap(sm=>[
      { name:"K. Pawar", hrmsId:"PM_1001", station:st.name, sm:sm.name, score:76, date:"2026-04-10", risk:"Low" },
      { name:"R. Verma", hrmsId:"PM_1002", station:st.name, sm:sm.name, score:64, date:"2026-04-09", risk:"Medium" },
    ])
  ).slice(0,12);

  const filteredReport = useMemo(()=>{
    let list = allPmForReport.filter(r=>{
      const q = rpSearch.toLowerCase();
      const srch = !q||r.name.toLowerCase().includes(q)||r.station.toLowerCase().includes(q);
      const st   = rpStation==="All"||r.station===rpStation;
      const cat  = rpCat==="All"||getCat(r.score)===rpCat;
      const risk = rpRisk==="All"||r.risk===rpRisk;
      return srch&&st&&cat&&risk;
    });
    if (rpSort==="score-desc") list=[...list].sort((a,b)=>b.score-a.score);
    if (rpSort==="score-asc")  list=[...list].sort((a,b)=>a.score-b.score);
    return list;
  },[rpSearch,rpStation,rpCat,rpRisk,rpSort]);

  /* ── Nav ── */
  const goTo = pg => { setActivePage(pg); setStatusMsg(""); setSelectedPmId(null); setActiveSmId(null); };

  /* ── PM Review actions ── */
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
    setSelectedPmId(null);
    setStatusMsg(mode==="reject"?"Assessment rejected. SM has been notified.":`Assessment ${mode==="approve"?"approved":"modified & approved"} successfully.`);
    setReviewTab(mode==="reject"?"Rejected":"Approved");
  };

  /* ── SM Form ── */
  const openSMForm = id=>{ setActiveSmId(id); if(!smForms[id]) setSmForms(p=>({...p,[id]:defaultSMForm()})); };

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
    setSmList(prev=>prev.map(s=>s.id===id?{...s,status:"Submitted",score:total}:s));
    setSmLocked(p=>({...p,[id]:true}));
    setStatusMsg("SM assessment submitted. Pending AOM approval.");
    setActiveSmId(null);
  };

  /* ═══════════════════════════════════════════
     RENDERERS
  ═══════════════════════════════════════════ */

  /* ── DASHBOARD ── */
  const renderDashboard = ()=>(
    <div className="ti2-dashboard">

      {/* ── Summary Cards ── */}
      <div className="ti2-sum-cards">
        {[
          { label:"Total Stations",      v:STATIONS.length,      icon:<Building2 size={20} color="#2563eb"/>,     bg:"#eff6ff" },
          { label:"Station Masters",     v:totalSMs,             icon:<Users size={20} color="#7c3aed"/>,         bg:"#f5f3ff" },
          { label:"Total Pointsmen",     v:totalPM,              icon:<Users size={20} color="#0891b2"/>,         bg:"#ecfeff" },
          { label:"Pending Approvals",   v:pending,              icon:<ClipboardCheck size={20} color="#d97706"/>, bg:"#fef3c7" },
          { label:"Avg Score",           v:`${avgScoreAll}/100`, icon:<Activity size={20} color="#16a34a"/>,      bg:"#dcfce7" },
          { label:"High-Risk Staff",     v:highRiskAll,          icon:<AlertTriangle size={20} color="#dc2626"/>, bg:"#fee2e2" },
        ].map(c=>(
          <article key={c.label} className="ti2-sum-card">
            <div className="ti2-sum-icon" style={{background:c.bg}}>{c.icon}</div>
            <div>
              <label>{c.label}</label>
              <strong>{c.v}</strong>
            </div>
          </article>
        ))}
      </div>

      {/* ── Station Highlights ── */}
      <div className="ti2-highlights">
        {[
          { label:"Best Performing Station", st:bestSt,     icon:<TrendingUp size={15} color="#16a34a"/>,   accent:"#16a34a", bg:"#f0fdf4" },
          { label:"Worst Performing Station",st:worstSt,    icon:<TrendingDown size={15} color="#dc2626"/>, accent:"#dc2626", bg:"#fff1f2" },
          { label:"Most Improved Station",   st:mostImp,    icon:<TrendingUp size={15} color="#2563eb"/>,   accent:"#2563eb", bg:"#eff6ff" },
          { label:"Highest Risk Station",    st:highRiskSt, icon:<AlertTriangle size={15} color="#d97706"/>,accent:"#d97706", bg:"#fffbeb" },
        ].map(h=>(
          <div key={h.label} className="ti2-highlight-card" style={{borderTop:`3px solid ${h.accent}`, background:h.bg}}>
            <div className="ti2-hl-label" style={{color:h.accent}}>{h.icon}{h.label}</div>
            <div className="ti2-hl-station">{h.st.name}</div>
            <div className="ti2-hl-meta">Avg {h.st.avgScore}/100 &nbsp;·&nbsp; {h.st.highRisk} high-risk staff</div>
          </div>
        ))}
      </div>

      {/* ── Chart 1: Station Performance (full width) ── */}
      <div className="ti2-chart-card">
        <div className="ti2-chart-hdr"><BarChart3 size={15}/><h3>Station-wise Average Performance Score</h3></div>
        <p className="ti2-chart-sub">Comparison of average assessment scores across all stations under this TI.</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stBarData} margin={{top:8,right:24,left:0,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:12,fill:"#64748b",fontWeight:500}}/>
            <YAxis domain={[0,100]} tick={{fontSize:12,fill:"#64748b"}} tickLine={false} axisLine={false}/>
            <Tooltip content={<TiTooltip/>}/>
            <Bar dataKey="avgScore" name="Avg Score" fill="#2563eb" radius={[6,6,0,0]} maxBarSize={64}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Chart 2+3: Trend + Pie (side by side) ── */}
      <div className="ti2-chart-row-2col">
        <div className="ti2-chart-card">
          <div className="ti2-chart-hdr"><TrendingUp size={15}/><h3>Monthly Assessment Trend</h3></div>
          <p className="ti2-chart-sub">Assessments conducted and average score per month.</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MONTHLY} margin={{top:8,right:24,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:12,fill:"#64748b",fontWeight:500}}/>
              <YAxis tick={{fontSize:12,fill:"#64748b"}} tickLine={false} axisLine={false}/>
              <Tooltip content={<TiTooltip/>}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12,paddingTop:8}}/>
              <Line type="monotone" dataKey="assessments" name="Assessments" stroke="#2563eb" strokeWidth={2.5} dot={{r:4}} activeDot={{r:6}}/>
              <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#16a34a" strokeWidth={2} dot={{r:3}} strokeDasharray="5 4"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="ti2-chart-card">
          <div className="ti2-chart-hdr"><BarChart3 size={15}/><h3>Pointsmen Category Distribution</h3></div>
          <p className="ti2-chart-sub">Distribution of A/B/C/D categories across all Pointsmen.</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="46%" innerRadius={62} outerRadius={96} dataKey="value" paddingAngle={4}>
                {pieData.map((e,i)=><Cell key={e.name} fill={PIE_C[i]}/>)}
              </Pie>
              <Tooltip formatter={(v,n,p)=>[`${v} staff`,`Category ${p.payload.name}`]}/>
              <Legend formatter={(v,e)=>`Category ${e.payload.name} — ${e.payload.value} staff`} iconType="circle" iconSize={9} wrapperStyle={{fontSize:12,lineHeight:"24px"}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Chart 4+5: Safety + High Risk (side by side) ── */}
      <div className="ti2-chart-row-2col">
        <div className="ti2-chart-card">
          <div className="ti2-chart-hdr"><ShieldCheck size={15}/><h3>Safety Compliance by Station</h3></div>
          <p className="ti2-chart-sub">Safety compliance percentage for each station.</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stBarData} margin={{top:8,right:24,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:12,fill:"#64748b",fontWeight:500}}/>
              <YAxis domain={[0,100]} tick={{fontSize:12,fill:"#64748b"}} tickLine={false} axisLine={false}/>
              <Tooltip content={<TiTooltip/>}/>
              <Bar dataKey="safetyPct" name="Safety %" fill="#7c3aed" radius={[6,6,0,0]} maxBarSize={64}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ti2-chart-card">
          <div className="ti2-chart-hdr"><AlertTriangle size={15} color="#dc2626"/><h3>High-Risk Staff Distribution</h3></div>
          <p className="ti2-chart-sub">Number of high-risk Pointsmen per station.</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stBarData} margin={{top:8,right:24,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:12,fill:"#64748b",fontWeight:500}}/>
              <YAxis allowDecimals={false} tick={{fontSize:12,fill:"#64748b"}} tickLine={false} axisLine={false}/>
              <Tooltip content={<TiTooltip/>}/>
              <Bar dataKey="highRisk" name="High Risk Staff" fill="#f87171" radius={[6,6,0,0]} maxBarSize={64}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  /* ── PROFILE ── */
  const renderProfile = ()=>(
    <div className="ti2-page-body">

      {/* Hero card */}
      <div className="ti2-card">
        <div className="ti2-card-hdr" style={{marginBottom:20}}>
          <h2>My Profile</h2>
          <span className="ti2-pill-grey">View Only</span>
        </div>
        <div className="ti2-profile-hero">
          <div className="ti2-profile-avatar">{tiName.charAt(0)}</div>
          <div style={{flex:1}}>
            <div className="ti2-profile-name">{tiName}</div>
            <div className="ti2-profile-role">{TI_PROFILE.designation} &nbsp;·&nbsp; {TI_PROFILE.jurisdiction}</div>
            <div className="ti2-pm-badges" style={{marginTop:12}}>
              <span className="ti2-badge" style={{background:CAT_B["A"],color:CAT_C["A"],fontSize:12,padding:"4px 12px"}}>Category A</span>
              <span className="ti2-pill-grey" style={{fontSize:12}}>{tiId}</span>
            </div>
          </div>
          <div className="ti2-profile-snaps">
            <div><label>Last Score</label><strong style={{color:CAT_C["A"],fontSize:22}}>{TI_PROFILE.lastAssessmentScore}<span style={{fontSize:13,color:"#64748b"}}>/100</span></strong></div>
            <div><label>Category</label><strong style={{color:CAT_C[TI_PROFILE.lastAssessmentCat],fontSize:22}}>Cat. {TI_PROFILE.lastAssessmentCat}</strong></div>
            <div><label>Last Assessed</label><strong style={{fontSize:15}}>{TI_PROFILE.lastAssessmentDate}</strong></div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="ti2-card">
        <div className="ti2-profile-sec-title">Personal Information</div>
        <div className="ti2-profile-fields">
          <div className="ti2-profile-field"><span>Full Name</span><strong>{tiName}</strong></div>
          <div className="ti2-profile-field"><span>HRMS ID</span><strong>{tiId}</strong></div>
          <div className="ti2-profile-field"><span>Contact</span><strong>{TI_PROFILE.contact}</strong></div>
          <div className="ti2-profile-field"><span>Reporting Officer</span><strong>{TI_PROFILE.reportingOfficer}</strong></div>
        </div>
      </div>

      {/* Jurisdiction */}
      <div className="ti2-card">
        <div className="ti2-profile-sec-title">Jurisdiction &amp; Responsibilities</div>
        <div className="ti2-profile-fields">
          <div className="ti2-profile-field"><span>Designation</span><strong>{TI_PROFILE.designation}</strong></div>
          <div className="ti2-profile-field"><span>Jurisdiction Area</span><strong>{TI_PROFILE.jurisdiction}</strong></div>
          <div className="ti2-profile-field"><span>Stations Managed</span><strong>{TI_PROFILE.stationsManaged}</strong></div>
          <div className="ti2-profile-field"><span>Station Masters</span><strong>{TI_PROFILE.totalSMs}</strong></div>
          <div className="ti2-profile-field"><span>Total Pointsmen</span><strong>{TI_PROFILE.totalPointsmen}</strong></div>
        </div>
      </div>

      {/* Performance snapshot */}
      <div className="ti2-card">
        <div className="ti2-profile-sec-title">Performance Snapshot (Last Assessment by AOM)</div>
        <div className="ti2-profile-fields">
          <div className="ti2-profile-field"><span>Assessment Score</span><strong style={{color:CAT_C["A"]}}>{TI_PROFILE.lastAssessmentScore}/100</strong></div>
          <div className="ti2-profile-field"><span>Category</span><strong style={{color:CAT_C[TI_PROFILE.lastAssessmentCat]}}>Category {TI_PROFILE.lastAssessmentCat}</strong></div>
          <div className="ti2-profile-field"><span>Assessment Date</span><strong>{TI_PROFILE.lastAssessmentDate}</strong></div>
          <div className="ti2-profile-field"><span>Assessed By</span><strong>{TI_PROFILE.reportingOfficer}</strong></div>
        </div>
      </div>

    </div>
  );

  /* ── STATIONS ── */
  const renderStations = ()=>{
    if (selectedSM) return (
      <div className="ti2-card">
        <div className="ti2-card-hdr" style={{marginBottom:20}}>
          <h2>Station Master Profile</h2>
          <button className="ti2-link-btn" onClick={()=>setSelectedSM(null)}>← Back</button>
        </div>

        {/* Hero */}
        <div className="ti2-sm-profile-hero">
          <div className="ti2-pm-avatar">{selectedSM.name.charAt(0)}</div>
          <div style={{flex:1}}>
            <div className="ti2-profile-name">{selectedSM.name}</div>
            <div className="ti2-profile-role">Station Master &nbsp;·&nbsp; {selectedSM.station}</div>
            <div className="ti2-pm-badges" style={{marginTop:10}}>
              <span className="ti2-badge" style={{background:CAT_B[selectedSM.cat],color:CAT_C[selectedSM.cat],fontSize:12,padding:"4px 12px"}}>
                Category {selectedSM.cat}
              </span>
              <span className="ti2-pill-grey" style={{fontSize:12}}>{selectedSM.id}</span>
            </div>
          </div>
          <div className="ti2-profile-snaps">
            <div>
              <label>Last Score</label>
              <strong style={{fontSize:22,letterSpacing:"-0.5px"}}>
                {selectedSM.score}<span style={{fontSize:13,fontWeight:400,color:"#9ca3af"}}>/100</span>
              </strong>
            </div>
            <div>
              <label>Category</label>
              <strong style={{fontSize:20,color:CAT_C[selectedSM.cat]}}>Cat. {selectedSM.cat}</strong>
            </div>
            <div>
              <label>Last Assessed</label>
              <strong style={{fontSize:14}}>{selectedSM.lastAssessDate}</strong>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="ti2-profile-sec-title" style={{marginTop:24}}>Profile Details</div>
        <div className="ti2-profile-fields">
          <div className="ti2-profile-field"><span>HRMS ID</span><strong>{selectedSM.id}</strong></div>
          <div className="ti2-profile-field"><span>Station</span><strong>{selectedSM.station}</strong></div>
          <div className="ti2-profile-field"><span>Designation</span><strong>Station Master</strong></div>
          <div className="ti2-profile-field"><span>Performance Category</span><strong style={{color:CAT_C[selectedSM.cat]}}>Category {selectedSM.cat}</strong></div>
          <div className="ti2-profile-field"><span>Last Assessment Score</span><strong>{selectedSM.score}/100</strong></div>
          <div className="ti2-profile-field"><span>Last Assessment Date</span><strong>{selectedSM.lastAssessDate}</strong></div>
        </div>
      </div>
    );

    const allSMs = STATIONS.flatMap(st=>st.sms);
    const filteredSMs = allSMs.filter(sm=>{
      const q = stSearch.toLowerCase();
      const s = !q||sm.name.toLowerCase().includes(q)||sm.id.toLowerCase().includes(q);
      const c = stCatFilter==="All"||sm.cat===stCatFilter;
      return s&&c;
    });

    return (
      <div className="ti2-page-body">
        <div className="ti2-card">
          <div className="ti2-card-hdr"><h2>Stations & Station Masters</h2></div>

          {/* Filter */}
          <div className="ti2-filter-row">
            <div className="ti2-search-box">
              <Search size={13}/><input placeholder="Search SM name / HRMS ID…" value={stSearch} onChange={e=>setStSearch(e.target.value)}/>
            </div>
            <select className="ti2-select" value={stCatFilter} onChange={e=>setStCatFilter(e.target.value)}>
              {["All","A","B","C","D"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Station cards — click header row to expand */}
          {STATIONS.map(st=>{
            const exp = !!expandedSt[st.id];
            const risk = riskOf(st);
            return (
              <div key={st.id} className="ti2-station-block">
                <div
                  className="ti2-station-hdr ti2-station-hdr-clickable"
                  onClick={()=>setExpandedSt(p=>({...p,[st.id]:!p[st.id]}))}
                >
                  <div className="ti2-station-info">
                    <div className="ti2-station-code">{st.code}</div>
                    <div>
                      <div className="ti2-station-name">{st.name}</div>
                      <div className="ti2-station-meta">
                        {st.sms.length} Station Master{st.sms.length>1?"s":""} &nbsp;·&nbsp; {st.pointsmenCount} Pointsmen &nbsp;·&nbsp; Avg {st.avgScore}/100 &nbsp;·&nbsp; Safety {st.safetyPct}%
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span className="ti2-badge" style={{background:RISK_B[risk],color:RISK_C[risk]}}>{risk} Risk</span>
                    <div className={`ti2-chevron${exp?" open":""}`}>
                      <ChevronRight size={16}/>
                    </div>
                  </div>
                </div>
                {exp && (
                  <div className="ti2-sm-table-wrap">
                    <div className="ti2-sm-head ti2-sm-row">
                      {["Name","HRMS ID","Category","Last Assessed","Score",""].map(h=><span key={h}>{h}</span>)}
                    </div>
                    {st.sms.filter(sm=>{
                      const q=stSearch.toLowerCase(); const c=stCatFilter==="All"||sm.cat===stCatFilter;
                      return (!q||sm.name.toLowerCase().includes(q)||sm.id.toLowerCase().includes(q))&&c;
                    }).map(sm=>(
                      <div key={sm.id} className="ti2-sm-row ti2-sm-data-row">
                        <span className="ti2-sm-name-col">{sm.name}</span>
                        <span className="ti2-sm-sub">{sm.id}</span>
                        <span><span className="ti2-badge" style={{background:CAT_B[sm.cat],color:CAT_C[sm.cat]}}>Cat. {sm.cat}</span></span>
                        <span className="ti2-sm-sub">{sm.lastAssessDate}</span>
                        <span className="ti2-sm-score">{sm.score}<span style={{color:"#94a3b8",fontWeight:400}}>/100</span></span>
                        <span><button className="ti2-view-profile-btn" onClick={e=>{e.stopPropagation();setSelectedSM(sm);}}><Eye size={12}/> View</button></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── PM REVIEW ── */
  const renderPmReview = ()=>{
    /* Detail view */
    if (selectedPM) {
      const secs = editSections[selectedPM.id]||selectedPM.originalSections;
      const liveTotal = secs.reduce((s,x)=>s+x.score,0);
      const liveCat   = getCat(liveTotal);
      const locked    = selectedPM.status!=="Pending";
      const reject    = rejectMode[selectedPM.id]||false;

      return (
        <div className="ti2-card">
          <div className="ti2-card-hdr">
            <div>
              <h2>Review — {selectedPM.pointsmanName} ({selectedPM.hrmsId})</h2>
              <p style={{margin:"2px 0 0",fontSize:12,color:"#64748b"}}>{selectedPM.station} · Submitted by {selectedPM.assessingSM} on {selectedPM.submissionDate}</p>
            </div>
            <button className="ti2-link-btn" onClick={()=>setSelectedPmId(null)}>← Back</button>
          </div>

          {/* Pointsman info */}
          <div className="ti2-review-meta">
            <div><label>Pointsman</label><strong>{selectedPM.pointsmanName}</strong></div>
            <div><label>HRMS ID</label><strong>{selectedPM.hrmsId}</strong></div>
            <div><label>Station</label><strong>{selectedPM.station}</strong></div>
            <div><label>PME Status</label><strong className={selectedPM.meta.pmeStatus==="Fit"?"ti2-green":"ti2-red"}>{selectedPM.meta.pmeStatus}</strong></div>
            <div><label>REF Status</label><strong className={selectedPM.meta.refStatus==="Cleared"?"ti2-green":"ti2-amber"}>{selectedPM.meta.refStatus}</strong></div>
            <div><label>Alcoholic Status</label><strong>{selectedPM.meta.alcoholicStatus}</strong></div>
          </div>

          {/* Section-wise edit */}
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

          {/* Live score */}
          <div className="ti2-live-score">
            <div><label>Grand Total</label><strong style={{color:CAT_C[liveCat],fontSize:22}}>{liveTotal}/100</strong></div>
            <div><label>Category</label><span className="ti2-badge" style={{background:CAT_B[liveCat],color:CAT_C[liveCat],fontSize:13,padding:"4px 14px"}}>Category {liveCat}</span></div>
          </div>

          {/* TI remarks */}
          {!locked && (
            <div className="ti2-form-field">
              <label>TI Remarks</label>
              <textarea rows={3} value={tiRemarks[selectedPM.id]||""} onChange={e=>setTiRemarks(p=>({...p,[selectedPM.id]:e.target.value}))} placeholder="Add remarks…"/>
            </div>
          )}

          {/* Reject input */}
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

          {locked && (
            <div className="ti2-locked-banner">
              {selectedPM.status==="Approved"?"✓ Assessment Approved and Locked":"✗ Assessment Rejected"}
              {selectedPM.tiRemarks && <div style={{marginTop:4,fontSize:12}}>Remarks: {selectedPM.tiRemarks}</div>}
            </div>
          )}

          {!locked && !reject && (
            <div className="ti2-review-actions">
              <button className="ti2-danger-btn" onClick={()=>setRejectMode(p=>({...p,[selectedPM.id]:true}))}>
                <XCircle size={14}/> Reject
              </button>
              <button className="ti2-ghost-btn" onClick={()=>finalizePM(selectedPM.id,"approve")}>
                <CheckCircle2 size={14}/> Approve as Submitted
              </button>
              <button className="ti2-primary-btn" onClick={()=>finalizePM(selectedPM.id,"modify")}>
                <CheckCircle2 size={14}/> Modify & Approve
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

    /* List view */
    const tabs=["Pending","Approved","Rejected"];
    return (
      <div className="ti2-card">
        <div className="ti2-card-hdr"><h2>Review Pointsman Assessments</h2></div>
        <p className="ti2-subtitle">Review, edit, and approve Pointsman assessments submitted by Station Masters.</p>

        {/* Tabs */}
        <div className="ti2-tabs">
          {tabs.map(t=>(
            <button key={t} className={`ti2-tab ${reviewTab===t?"active":""}`} onClick={()=>setReviewTab(t)}>
              {t} <span className="ti2-tab-count">{pmList.filter(p=>p.status===t).length}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="ti2-filter-row">
          <div className="ti2-search-box">
            <Search size={13}/><input placeholder="Search pointsman…" value={reviewSearch} onChange={e=>setReviewSearch(e.target.value)}/>
          </div>
          <select className="ti2-select" value={reviewStation} onChange={e=>setReviewStation(e.target.value)}>
            <option>All</option>
            {STATIONS.map(s=><option key={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="ti2-table-wrap">
          <div className="ti2-pm-head ti2-pm-row">
            {["Pointsman","HRMS ID","Station","Assessing SM","Date","Score","Status","Action"].map(h=><span key={h}>{h}</span>)}
          </div>
          {filteredPM.length===0&&<p className="ti2-empty">No records in this category.</p>}
          {filteredPM.map(p=>{
            const total = (p.finalSections||p.originalSections).reduce((s,x)=>s+x.score,0);
            const cat   = getCat(total);
            return (
              <div key={p.id} className="ti2-pm-row ti2-pm-data-row">
                <span><strong>{p.pointsmanName}</strong></span>
                <span>{p.hrmsId}</span>
                <span>{p.station}</span>
                <span>{p.assessingSM}</span>
                <span>{p.submissionDate}</span>
                <span><strong>{total}/100</strong></span>
                <span>
                  <span className={`ti2-status-pill ti2-status-${p.status.toLowerCase()}`}>{p.status}</span>
                </span>
                <span>
                  <button className="ti2-link-btn-sm" onClick={()=>openPmReview(p.id)}>
                    {p.status==="Pending"?<><ClipboardCheck size={12}/> Review</>:<><Eye size={12}/> View</>}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── ASSESS SM ── */
  const renderAssessSM = ()=>{
    if (activeSmId) {
      const sm  = smList.find(s=>s.id===activeSmId);
      const f   = smForms[activeSmId]||defaultSMForm();
      const locked = !!smLocked[activeSmId];
      const {ynScore,knowledge,total} = computeSMScore(f);
      const liveCat = getCat(total);

      return (
        <div className="ti2-card">
          <div className="ti2-card-hdr">
            <div><h2>Assess SM — {sm?.name}</h2><p style={{margin:"2px 0 0",fontSize:12,color:"#64748b"}}>{sm?.hrmsId} · {sm?.station}</p></div>
            <button className="ti2-link-btn" onClick={()=>setActiveSmId(null)}>← Back</button>
          </div>

          {TI_SM_CRITERIA.map((sec,si)=>(
            <div key={sec.key} className="ti2-assess-section">
              <div className="ti2-assess-sec-hdr">
                <span className="ti2-assess-sec-num">{String(si+1).padStart(2,"0")}</span>
                <div><strong>{sec.label}</strong><span className="ti2-assess-sec-meta">{sec.count} criteria · {sec.weight} marks each · Total {sec.count*sec.weight}</span></div>
                <span className="ti2-assess-live-marks">
                  {f[sec.key].filter(v=>v==="Yes").length*sec.weight} / {sec.count*sec.weight}
                </span>
              </div>
              <div className="ti2-yn-grid">
                {sec.criteria.map((cr,idx)=>(
                  <div key={idx} className="ti2-yn-row">
                    <span className="ti2-yn-label">{idx+1}. {cr}</span>
                    <div className="ti2-yn-btns">
                      {["Yes","No"].map(v=>(
                        <button key={v} disabled={locked} type="button"
                          className={`ti2-yn-btn ti2-yn-${v.toLowerCase()}${f[sec.key][idx]===v?" active":""}`}
                          onClick={()=>toggleSMYN(activeSmId,sec.key,idx,v)}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Knowledge + additional fields */}
          <div className="ti2-assess-section">
            <div className="ti2-assess-sec-hdr">
              <span className="ti2-assess-sec-num">06</span>
              <div><strong>Knowledge & Administrative Details</strong><span className="ti2-assess-sec-meta">Manual entry</span></div>
              <span className="ti2-assess-live-marks">{knowledge}/25</span>
            </div>
            <div className="ti2-assess-form" style={{marginTop:12}}>
              <div className="ti2-form-field"><label>Knowledge Marks (0–25)</label>
                <input type="number" min={0} max={25} disabled={locked} value={f.knowledgeMarks} onChange={e=>setSMField(activeSmId,"knowledgeMarks",e.target.value)} placeholder="Enter MCQ marks"/></div>
              <div className="ti2-form-field"><label>Alcoholic Status <span style={{color:"#dc2626"}}>*</span></label>
                <select disabled={locked} value={f.alcoholicStatus} onChange={e=>setSMField(activeSmId,"alcoholicStatus",e.target.value)}>
                  <option value="">Select…</option><option>Non-Alcoholic</option><option>Alcoholic</option>
                </select></div>
              <div className="ti2-form-field"><label>PME Status</label>
                <select disabled={locked} value={f.pmeStatus} onChange={e=>setSMField(activeSmId,"pmeStatus",e.target.value)}>
                  <option>Fit</option><option>Unfit</option><option>Pending</option>
                </select></div>
              <div className="ti2-form-field"><label>REF Status</label>
                <select disabled={locked} value={f.refStatus} onChange={e=>setSMField(activeSmId,"refStatus",e.target.value)}>
                  <option>Cleared</option><option>Pending</option><option>Failed</option>
                </select></div>
              <div className="ti2-form-field"><label>Counselling</label>
                <select disabled={locked} value={f.counselling} onChange={e=>setSMField(activeSmId,"counselling",e.target.value)}>
                  <option>Not Required</option><option>Recommended</option><option>Mandatory</option>
                </select></div>
              <div className="ti2-form-field"><label>Automatic Training</label>
                <select disabled={locked} value={f.automaticTraining} onChange={e=>setSMField(activeSmId,"automaticTraining",e.target.value)}>
                  <option>Not Required</option><option>Recommended</option><option>Mandatory</option>
                </select></div>
              <div className="ti2-form-field" style={{gridColumn:"1/-1"}}>
                <label>Remarks for AOM</label>
                <textarea rows={3} disabled={locked} value={f.remarks} onChange={e=>setSMField(activeSmId,"remarks",e.target.value)} placeholder="Enter observations…"/>
              </div>
            </div>
          </div>

          <div className="ti2-live-score">
            <div><label>Yes/No Score</label><strong>{ynScore}/75</strong></div>
            <div><label>Knowledge</label><strong>{knowledge}/25</strong></div>
            <div><label>Grand Total</label><strong style={{color:CAT_C[liveCat],fontSize:22}}>{total}/100</strong></div>
            <div><label>Category</label><span className="ti2-badge" style={{background:CAT_B[liveCat],color:CAT_C[liveCat],fontSize:13,padding:"4px 14px"}}>Category {liveCat}</span></div>
          </div>

          {locked && <div className="ti2-locked-banner">✓ Assessment submitted. Pending AOM Approval.</div>}
          {!locked && (
            <div className="ti2-review-actions">
              <button className="ti2-primary-btn" onClick={()=>submitSMAssessment(activeSmId)}>
                <CheckCircle2 size={14}/> Submit for AOM Approval
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="ti2-card">
        <div className="ti2-card-hdr"><h2>Assess Station Masters</h2></div>
        <p className="ti2-subtitle">Station Masters pending assessment are listed below. Open the form to conduct a structured evaluation.</p>
        <div className="ti2-sm-assess-list">
          {smList.map(s=>(
            <div key={s.id} className="ti2-sm-assess-row">
              <div className="ti2-sm-assess-info">
                <div className="ti2-pm-avatar" style={{width:36,height:36,fontSize:15}}>{s.name.charAt(0)}</div>
                <div><strong>{s.name}</strong><span>{s.hrmsId} · {s.station}</span></div>
              </div>
              <span className="ti2-muted">Last: {s.lastDate}</span>
              {s.score && <span><strong>{s.score}/100</strong></span>}
              <span className={`ti2-status-pill ti2-status-${s.status.toLowerCase().replace(/\s+/g,"-")}`}>{s.status}</span>
              <button className="ti2-primary-btn-sm" onClick={()=>openSMForm(s.id)}>
                {s.status==="Submitted"?"View Form":"Open Form"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── MY ASSESSMENT ── */
  const renderMyAssessment = ()=>{
    if (selfSelected) {
      const sc=selfSelected; const cat=sc.category;
      return (
        <div className="ti2-card">
          <div className="ti2-card-hdr"><h2>Assessment Scorecard</h2><button className="ti2-link-btn" onClick={()=>setSelfSelected(null)}>← Back</button></div>
          <p className="ti2-subtitle">Period: {sc.period} · Assessed by: {sc.assessedBy}</p>
          <div className="ti2-sc-hero">
            <div className="ti2-sc-circle" style={{borderColor:CAT_C[cat]}}>
              <strong style={{color:CAT_C[cat]}}>{sc.totalScore}</strong><span>/100</span>
            </div>
            <div>
              <span className="ti2-cat-badge-lg" style={{background:CAT_B[cat],color:CAT_C[cat]}}>Category {cat}</span>
              <p className="ti2-sc-period">{sc.period}</p>
              <p className="ti2-sc-date">Date: {sc.date}</p>
              <p className="ti2-sc-by">By: {sc.assessedBy}</p>
            </div>
            <div style={{marginLeft:"auto"}}>
              <span className={`ti2-status-pill ti2-status-${sc.approvalStatus.toLowerCase()}`} style={{fontSize:13,padding:"6px 16px"}}>{sc.approvalStatus}</span>
            </div>
          </div>
          <h4 className="ti2-sec-title">Section-wise Breakdown</h4>
          <div className="ti2-sc-sections">
            {sc.sections.map(s=>{
              const pct=Math.round((s.marks/s.outOf)*100);
              return (
                <div key={s.title} className="ti2-sc-row">
                  <span className="ti2-sc-name">{s.title}</span>
                  <div className="ti2-sc-bar-wrap"><div className="ti2-sc-bar-fill" style={{width:`${pct}%`,background:pct>=80?"#16a34a":pct>=50?"#2563eb":"#dc2626"}}/></div>
                  <span className="ti2-sc-marks">{s.marks}/{s.outOf}</span>
                </div>
              );
            })}
          </div>
          <div className="ti2-aom-remarks">
            <div className="ti2-aom-rmk-hdr"><Award size={14} color="#7c3aed"/> <strong>AOM Remarks</strong></div>
            <p>"{sc.aomRemarks}"</p>
          </div>
        </div>
      );
    }

    const avgScore = Math.round(TI_SELF_HISTORY.reduce((s,a)=>s+a.totalScore,0)/TI_SELF_HISTORY.length);
    return (
      <div className="ti2-card">
        <div className="ti2-card-hdr"><h2>My Assessment History (by AOM)</h2></div>
        <p className="ti2-subtitle">All performance evaluations conducted by the Area Officer/Divisional Manager. Click any row for the full scorecard.</p>

        <div className="ti2-myassess-summary">
          {[
            { label:"Total Assessments", v: TI_SELF_HISTORY.length },
            { label:"Latest Score",      v: `${TI_SELF_HISTORY[0].totalScore}/100` },
            { label:"Average Score",     v: `${avgScore}/100` },
            { label:"Latest Category",   v: TI_SELF_HISTORY[0].category },
          ].map(c=>(
            <div key={c.label} className="ti2-report-mini">
              <label>{c.label}</label>
              <strong style={c.label==="Latest Category"?{color:CAT_C[c.v]}:{}}>{c.v}</strong>
            </div>
          ))}
        </div>

        <div className="ti2-myassess-list">
          <div className="ti2-myassess-head">
            {["Period","Date","Total Score","Category","Assessed By","Status",""].map(h=><span key={h}>{h}</span>)}
          </div>
          {TI_SELF_HISTORY.map(sc=>{
            const cat=sc.category;
            return (
              <button key={sc.id} className="ti2-myassess-row" onClick={()=>setSelfSelected(sc)}>
                <span><strong>{sc.period}</strong></span>
                <span>{sc.date}</span>
                <span><strong>{sc.totalScore}/100</strong></span>
                <span><span className="ti2-badge" style={{background:CAT_B[cat],color:CAT_C[cat]}}>Cat. {cat}</span></span>
                <span style={{fontSize:11,color:"#64748b"}}>{sc.assessedBy}</span>
                <span><span className={`ti2-status-pill ti2-status-${sc.approvalStatus.toLowerCase()}`}>{sc.approvalStatus}</span></span>
                <span style={{color:"#2563eb",fontSize:12,fontWeight:600}}>View →</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── REPORTS ── */
  const renderReports = ()=>{
    const cats={A:0,B:0,C:0,D:0};
    filteredReport.forEach(r=>cats[getCat(r.score)]++);
    const riskCnt={Low:0,Medium:0,High:0};
    filteredReport.forEach(r=>riskCnt[r.risk]++);

    return (
      <div className="ti2-card">
        <div className="ti2-card-hdr"><h2>Reports & Analytics</h2></div>
        <p className="ti2-subtitle">Cross-station performance data. Use filters to narrow down results.</p>

        {/* Filters */}
        <div className="ti2-filter-row">
          <div className="ti2-search-box">
            <Search size={13}/><input placeholder="Search staff…" value={rpSearch} onChange={e=>setRpSearch(e.target.value)}/>
          </div>
          <select className="ti2-select" value={rpStation} onChange={e=>setRpStation(e.target.value)}>
            <option>All</option>{STATIONS.map(s=><option key={s.id}>{s.name}</option>)}
          </select>
          <select className="ti2-select" value={rpCat} onChange={e=>setRpCat(e.target.value)}>
            {["All","A","B","C","D"].map(o=><option key={o}>{o}</option>)}
          </select>
          <select className="ti2-select" value={rpRisk} onChange={e=>setRpRisk(e.target.value)}>
            {["All","Low","Medium","High"].map(o=><option key={o}>{o}</option>)}
          </select>
          <div className="ti2-sort-wrap"><ArrowUpDown size={12}/>
            <select value={rpSort} onChange={e=>setRpSort(e.target.value)}>
              <option value="date-desc">Default</option>
              <option value="score-desc">High Score</option>
              <option value="score-asc">Low Score</option>
            </select>
          </div>
        </div>

        {/* Summary mini-cards */}
        <div className="ti2-report-summary">
          {[
            { label:"Filtered Staff",   v: filteredReport.length },
            { label:"Avg Score",        v: filteredReport.length? Math.round(filteredReport.reduce((s,r)=>s+r.score,0)/filteredReport.length) : "—" },
            { label:"High Risk",        v: riskCnt.High },
            { label:"Cat. A",           v: cats.A },
          ].map(c=>(
            <div key={c.label} className="ti2-report-mini"><label>{c.label}</label><strong>{c.v}</strong></div>
          ))}
        </div>

        {/* Table */}
        <div className="ti2-table-wrap" style={{marginTop:16}}>
          <div className="ti2-rp-head ti2-rp-row">
            {["Name","HRMS ID","Station","Score","Grade","Risk","Date"].map(h=><span key={h}>{h}</span>)}
          </div>
          {filteredReport.map((r,i)=>{
            const cat=getCat(r.score);
            return (
              <div key={i} className="ti2-rp-row ti2-rp-data-row">
                <span><strong>{r.name}</strong></span>
                <span>{r.hrmsId}</span>
                <span>{r.station}</span>
                <span><strong>{r.score}/100</strong></span>
                <span><span className="ti2-badge" style={{background:CAT_B[cat],color:CAT_C[cat]}}>Cat. {cat}</span></span>
                <span><span className="ti2-badge" style={{background:RISK_B[r.risk],color:RISK_C[r.risk]}}>{r.risk}</span></span>
                <span>{r.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = ()=>{
    switch(activePage){
      case "dashboard":    return renderDashboard();
      case "profile":      return renderProfile();
      case "stations":     return renderStations();
      case "reviewPM":     return renderPmReview();
      case "assessSM":     return renderAssessSM();
      case "myAssessment": return renderMyAssessment();
      case "reports":      return renderReports();
      default: return renderDashboard();
    }
  };

  /* ═══ SHELL ═══ */
  return (
    <div className="ti2-layout">
      <header className="ti2-topbar">
        <div className="ti2-topbar-brand">
          <div className="ti2-topbar-logo">IR</div>
          <div><h1>Indian Railway Evaluation System</h1><p>Traffic Inspector Module</p></div>
        </div>
        <div className="ti2-user-strip">
          <div className="ti2-user-avatar">{tiName.charAt(0)}</div>
          <div><strong>{tiName}</strong><span>{tiId}</span></div>
          <button className="ti2-logout-btn" onClick={onLogout}><LogOut size={14}/> Logout</button>
        </div>
      </header>

      <div className="ti2-shell">
        <aside className="ti2-sidebar">
          {NAV.map(item=>{
            const Icon=item.icon;
            return (
              <button key={item.key} className={`ti2-nav-item${activePage===item.key?" active":""}`}
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
    </div>
  );
}
