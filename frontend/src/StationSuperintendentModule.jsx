import { useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Filter,
  Gauge,
  LogOut,
  PlayCircle,
  Search,
  ShieldCheck,
  Train,
  UserCircle2,
  Users,
  Clock
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import "./sdom.css";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "profile", label: "Profile", icon: UserCircle2 },
  { key: "overview", label: "Station Overview", icon: Building2 },
  { key: "stationMasters", label: "Station Masters", icon: Users },
  { key: "pointsmen", label: "Pointsmen Overview", icon: Train },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "history", label: "My Test History", icon: CalendarCheck2 },
  { key: "current", label: "Current Test", icon: ShieldCheck }
];

const ssProfileSeed = {
  name: "R. Kulkarni",
  employeeId: "SS_1001",
  designation: "Station Superintendent",
  station: "Nagpur Junction",
  zoneDivision: "Central Railway - Nagpur Division",
  reportingOfficer: "TI_1001 - Traffic Inspector"
};

const stationOverviewSeed = {
  stationCode: "NGP",
  stationClass: "A1",
  platforms: 8,
  dailyTrainsHandled: 142,
  punctualityIndex: "93.4%",
  safetyIncidentsThisMonth: 2,
  activeDutyStaff: 64
};

const recentActivitiesSeed = [
  "SM_1003 monthly review submitted for Platform Cluster B.",
  "Pointsman roster updated for night shift coverage.",
  "Minor equipment delay incident closed with corrective action.",
  "Safety briefing attendance reached 100% for this week.",
  "Upcoming audit checklist published for station teams."
];

const stationMastersSeed = [
  { id: "SM_1001", name: "S. Deshmukh", category: "A", lastAssessmentScore: 89, station: "Nagpur Junction", contact: "+91 98220 44556" },
  { id: "SM_1002", name: "K. Nandan", category: "B", lastAssessmentScore: 81, station: "Ajni", contact: "+91 98765 11002" },
  { id: "SM_1003", name: "A. Trivedi", category: "A", lastAssessmentScore: 92, station: "Itwari", contact: "+91 98012 22003" },
  { id: "SM_1004", name: "P. Jain", category: "C", lastAssessmentScore: 74, station: "Kalmeshwar", contact: "+91 98111 33004" }
];

const pointsmenSeed = [
  { id: "PM_1101", name: "Ravi Kumar", category: "A", score: 92, status: "Active" },
  { id: "PM_1102", name: "Sanjay Patil", category: "B", score: 78, status: "Active" },
  { id: "PM_1103", name: "Deepak Nair", category: "C", score: 71, status: "On Leave" },
  { id: "PM_1104", name: "Ajay Sharma", category: "A", score: 84, status: "Active" },
  { id: "PM_1105", name: "Kunal Verma", category: "D", score: 66, status: "Training" },
  { id: "PM_1106", name: "M. Shaikh", category: "B", score: 80, status: "Active" }
];

const reportRowsSeed = [
  { id: "REP_1", date: "2026-04-02", staffType: "Station Master", staffId: "SM_1002", staffName: "K. Nandan", category: "B", performance: "Good", score: 81 },
  { id: "REP_2", date: "2026-04-04", staffType: "Pointsman", staffId: "PM_1104", staffName: "Ajay Sharma", category: "A", performance: "Excellent", score: 84 },
  { id: "REP_3", date: "2026-04-08", staffType: "Pointsman", staffId: "PM_1105", staffName: "Kunal Verma", category: "D", performance: "Needs Improvement", score: 66 },
  { id: "REP_4", date: "2026-04-10", staffType: "Station Master", staffId: "SM_1003", staffName: "A. Trivedi", category: "A", performance: "Excellent", score: 92 },
  { id: "REP_5", date: "2026-04-12", staffType: "Pointsman", staffId: "PM_1102", staffName: "Sanjay Patil", category: "B", performance: "Good", score: 78 }
];

const testHistorySeed = [
  {
    id: "SST_1",
    testDate: "2026-03-16",
    testName: "Station Supervision Compliance Test",
    score: 88,
    assessmentPeriod: "Quarter 1 - 2026",
    sections: [
      { title: "Station Operations", marks: 18, outOf: 20 },
      { title: "People Supervision", marks: 17, outOf: 20 },
      { title: "Safety Oversight", marks: 18, outOf: 20 },
      { title: "Reporting Accuracy", marks: 17, outOf: 20 },
      { title: "Escalation Protocol", marks: 18, outOf: 20 }
    ]
  },
  {
    id: "SST_2",
    testDate: "2026-02-09",
    testName: "Operational Monitoring Drill",
    score: 82,
    assessmentPeriod: "Quarter 1 - 2026",
    sections: [
      { title: "Duty Audits", marks: 16, outOf: 20 },
      { title: "Incident Tracking", marks: 17, outOf: 20 },
      { title: "Staff Guidance", marks: 16, outOf: 20 },
      { title: "Compliance Records", marks: 17, outOf: 20 },
      { title: "Action Closure", marks: 16, outOf: 20 }
    ]
  }
];

const currentTestsSeed = [
  { id: "SSC_1", name: "Monthly Superintendent Review Test", period: "April 2026" },
  { id: "SSC_2", name: "Station Supervision Scenario Test", period: "April 2026" }
];

const mcqQuestions = Array.from({ length: 25 }, (_, idx) => ({
  id: idx + 1,
  question: `Question ${idx + 1}: Choose the best supervisory action for station condition scenario ${idx + 1}.`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: idx % 4
}));

function performanceBand(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Average";
  return "Needs Improvement";
}

function normalizeScorecard(record) {
  if (!record) return null;
  return {
    title: record.testName,
    subtitle: `Test Date: ${record.testDate}`,
    total: record.score,
    outOf: 100,
    period: record.assessmentPeriod,
    sections: record.sections
  };
}

function StationSuperintendentModule({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [statusText, setStatusText] = useState("");

  const [selectedSM, setSelectedSM] = useState(null);
  const [pointsCategoryFilter, setPointsCategoryFilter] = useState("All");
  const [pointsPerformanceFilter, setPointsPerformanceFilter] = useState("All");

  const [reportFilters, setReportFilters] = useState({
    startDate: "",
    endDate: "",
    category: "All",
    performance: "All"
  });

  const [testHistory, setTestHistory] = useState(testHistorySeed);
  const [historySearch, setHistorySearch] = useState("");
  const [selectedScorecard, setSelectedScorecard] = useState(null);

  const [currentTests, setCurrentTests] = useState(currentTestsSeed);
  const [activeTest, setActiveTest] = useState(null);
  const [responses, setResponses] = useState(Array(25).fill(null));
  const [savedResponses, setSavedResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const ssName = user?.name || ssProfileSeed.name;
  const ssId = user?.hrmsId || ssProfileSeed.employeeId;

  const stationName = ssProfileSeed.station;
  const totalSMs = stationMastersSeed.length;
  const totalPointsmen = pointsmenSeed.length;
  const pendingAssessments = reportRowsSeed.filter((row) => row.performance === "Needs Improvement").length;

  const filteredPointsmen = useMemo(() => {
    return pointsmenSeed.filter((row) => {
      const byCategory = pointsCategoryFilter === "All" || row.category === pointsCategoryFilter;
      const rowPerformance = performanceBand(row.score);
      const byPerformance = pointsPerformanceFilter === "All" || rowPerformance === pointsPerformanceFilter;
      return byCategory && byPerformance;
    });
  }, [pointsCategoryFilter, pointsPerformanceFilter]);

  const filteredReports = useMemo(() => {
    return reportRowsSeed.filter((row) => {
      const categoryMatch = reportFilters.category === "All" || row.category === reportFilters.category;
      const performanceMatch = reportFilters.performance === "All" || row.performance === reportFilters.performance;

      const startMatch = !reportFilters.startDate || row.date >= reportFilters.startDate;
      const endMatch = !reportFilters.endDate || row.date <= reportFilters.endDate;

      return categoryMatch && performanceMatch && startMatch && endMatch;
    });
  }, [reportFilters]);

  const reportSummary = useMemo(() => {
    const total = filteredReports.length;
    const averageScore = total ? Math.round(filteredReports.reduce((sum, row) => sum + row.score, 0) / total) : 0;
    const excellentCount = filteredReports.filter((row) => row.performance === "Excellent").length;
    return { total, averageScore, excellentCount };
  }, [filteredReports]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return testHistory.filter((row) => {
      if (!q) return true;
      return row.testDate.includes(q) || row.testName.toLowerCase().includes(q);
    });
  }, [testHistory, historySearch]);

  const answeredCount = responses.filter((item) => item !== null).length;

  const goToPage = (page) => {
    setActivePage(page);
    setStatusText("");
    setSelectedSM(null);
    setSelectedScorecard(null);
  };

  const startTest = (test) => {
    setActiveTest(test);
    setCurrentQuestion(0);
    setResponses(Array(25).fill(null));
    setSavedResponses({});
    setStatusText("");
  };

  const saveResponse = () => {
    if (!activeTest) return;

    if (responses[currentQuestion] === null) {
      setStatusText("Select an option before saving response.");
      return;
    }

    setSavedResponses((prev) => ({ ...prev, [currentQuestion]: true }));
    setStatusText(`Response for Question ${currentQuestion + 1} saved.`);
  };

  const submitTest = () => {
    if (!activeTest) return;

    let correct = 0;
    responses.forEach((ans, idx) => {
      if (ans === mcqQuestions[idx].answer) correct += 1;
    });

    const totalScore = correct * 4;

    const result = {
      id: `SST_${Date.now()}`,
      testDate: new Date().toISOString().slice(0, 10),
      testName: activeTest.name,
      score: totalScore,
      assessmentPeriod: activeTest.period,
      sections: [
        { title: "Section 1", marks: Math.round(totalScore * 0.2), outOf: 20 },
        { title: "Section 2", marks: Math.round(totalScore * 0.2), outOf: 20 },
        { title: "Section 3", marks: Math.round(totalScore * 0.2), outOf: 20 },
        { title: "Section 4", marks: Math.round(totalScore * 0.2), outOf: 20 },
        { title: "Section 5", marks: Math.round(totalScore * 0.2), outOf: 20 }
      ]
    };

    setTestHistory((prev) => [result, ...prev]);
    setCurrentTests((prev) => prev.filter((row) => row.id !== activeTest.id));
    setSelectedScorecard(normalizeScorecard(result));
    setActivePage("history");
    setActiveTest(null);
    setStatusText(`Test submitted. Final score: ${totalScore}/100.`);
  };

  const renderDashboard = () => (
    <>
      <div className="ss-page-header">
        <h2>Station Superintendent Dashboard</h2>
        <span className="ss-view-only">Supervision Only</span>
      </div>

      <div className="ss-stats-grid">
        <article className="ss-stat-card">
          <Building2 size={18} />
          <label>Station Name</label>
          <strong>{stationName}</strong>
        </article>
        <article className="ss-stat-card">
          <Users size={18} />
          <label>Total SMs</label>
          <strong>{totalSMs}</strong>
        </article>
        <article className="ss-stat-card">
          <Train size={18} />
          <label>Total Pointsmen</label>
          <strong>{totalPointsmen}</strong>
        </article>
        <article className="ss-stat-card">
          <Gauge size={18} />
          <label>Pending Assessments</label>
          <strong>{pendingAssessments}</strong>
        </article>
      </div>

      <section className="ss-panel-card">
        <div className="ss-page-header">
          <h3>Recent Activity</h3>
        </div>
        <ul className="ss-activity-list">
          {recentActivitiesSeed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );

  const renderProfile = () => {
    const personalScoreData = testHistory.map(h => ({
      month: h.testDate.substring(5, 7) === "03" ? "Mar'26" : h.testDate.substring(5, 7) === "02" ? "Feb'26" : "Jan'26",
      score: h.score
    })).reverse();

    const latestScore = testHistory[0]?.score || "—";
    const lastDate = testHistory[0]?.testDate || "—";

    return (
      <div className="sdom-fade">
        {/* Hero header */}
        <div className="sdom-station-header" style={{ marginBottom: 24 }}>
          <div className="sdom-station-header-meta">
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Staff Profile</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4 }}>{ssName}</div>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>{ssProfileSeed.designation} &bull; {ssProfileSeed.station} &bull; Central Railway</div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <span className="sdom-badge sdom-badge-success">Category A</span>
              <span className="sdom-badge sdom-badge-success">Low Risk</span>
              <span className="sdom-badge sdom-badge-success">Active</span>
            </div>
          </div>
          <div className="sdom-station-header-stats">
            <div className="sdom-station-header-stat">
              <span className="val">{latestScore}</span>
              <span className="lbl">Latest Score</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }}/>
            <div className="sdom-station-header-stat">
              <span className="val">+91 98220 55001</span>
              <span className="lbl">Contact</span>
            </div>
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.15)" }}/>
            <div className="sdom-station-header-stat">
              <span className="val">{lastDate}</span>
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
                ["Employee ID / HRMS ID", ssId],
                ["Designation", ssProfileSeed.designation],
                ["Mobile Number", "+91 98220 55001"],
                ["Email ID", `${ssId.toLowerCase()}@rail.in`],
                ["Account Status", "Active"],
                ["Current Zone", "Central Railway"],
                ["Current Division", "Nagpur"],
                ["Current Station Placement", ssProfileSeed.station],
                ["Reporting Officer", ssProfileSeed.reportingOfficer]
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
                <div><strong>PME Done Date:</strong><div style={{fontWeight: 700, color: "#065f46", marginTop: 4}}>2025-05-15</div></div>
                <div><strong>PME Due Date:</strong><div style={{fontWeight: 700, color: "#991b1b", marginTop: 4}}>2029-05-14</div></div>
                <div><strong>Isolator Certificate Issued:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>2025-11-20</div></div>
                <div><strong>Automatic Training Date:</strong><div style={{fontWeight: 700, color: "#0d2c4d", marginTop: 4}}>2026-01-10</div></div>
                <div style={{ gridColumn: "span 2" }}><strong>Refresher Counselling Date:</strong><div style={{fontWeight: 700, color: "#d97706", marginTop: 4}}>2026-05-01</div></div>
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

  const renderOverview = () => (
    <>
      <div className="ss-page-header">
        <h2>Station Overview</h2>
      </div>

      <section className="ss-panel-card">
        <div className="ss-two-col">
          <article className="ss-card-lite">
            <h3>Station Details</h3>
            <div className="ss-kv-grid">
              <div><label>Station Code</label><strong>{stationOverviewSeed.stationCode}</strong></div>
              <div><label>Station Class</label><strong>{stationOverviewSeed.stationClass}</strong></div>
              <div><label>Platforms</label><strong>{stationOverviewSeed.platforms}</strong></div>
              <div><label>Zone/Division</label><strong>{ssProfileSeed.zoneDivision}</strong></div>
            </div>
          </article>

          <article className="ss-card-lite">
            <h3>Operational Summary</h3>
            <div className="ss-kv-grid">
              <div><label>Daily Trains Handled</label><strong>{stationOverviewSeed.dailyTrainsHandled}</strong></div>
              <div><label>Punctuality Index</label><strong>{stationOverviewSeed.punctualityIndex}</strong></div>
              <div><label>Safety Incidents (Month)</label><strong>{stationOverviewSeed.safetyIncidentsThisMonth}</strong></div>
              <div><label>Active Duty Staff</label><strong>{stationOverviewSeed.activeDutyStaff}</strong></div>
            </div>
          </article>
        </div>
      </section>

      <section className="ss-panel-card">
        <div className="ss-page-header">
          <h3>Staff Distribution</h3>
        </div>
        <div className="ss-distribution-grid">
          <article><label>Station Masters</label><strong>{stationMastersSeed.length}</strong></article>
          <article><label>Pointsmen</label><strong>{pointsmenSeed.length}</strong></article>
          <article><label>Total Supervisory Span</label><strong>{stationMastersSeed.length + pointsmenSeed.length}</strong></article>
        </div>
      </section>
    </>
  );

  const renderStationMasters = () => (
    <>
      <div className="ss-page-header">
        <h2>Station Masters</h2>
      </div>

      <section className="ss-panel-card">
        <div className="ss-table ss-cols-5">
          <div className="ss-table-row ss-head">
            <div>Name</div>
            <div>Employee ID</div>
            <div>Category</div>
            <div>Last Assessment Score</div>
            <div>Action</div>
          </div>
          {stationMastersSeed.map((row) => (
            <div key={row.id} className="ss-table-row">
              <div>{row.name}</div>
              <div>{row.id}</div>
              <div>{row.category}</div>
              <div>{row.lastAssessmentScore}/100</div>
              <div>
                <button type="button" className="ss-link-btn" onClick={() => setSelectedSM(row)}>
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedSM && (
        <section className="ss-panel-card">
          <div className="ss-page-header">
            <h3>Station Master Profile</h3>
            <button type="button" className="ss-link-btn" onClick={() => setSelectedSM(null)}>
              Close
            </button>
          </div>
          <div className="ss-profile-grid">
            <article><label>Name</label><strong>{selectedSM.name}</strong></article>
            <article><label>Employee ID</label><strong>{selectedSM.id}</strong></article>
            <article><label>Category</label><strong>{selectedSM.category}</strong></article>
            <article><label>Station</label><strong>{selectedSM.station}</strong></article>
            <article><label>Contact</label><strong>{selectedSM.contact}</strong></article>
            <article><label>Last Assessment</label><strong>{selectedSM.lastAssessmentScore}/100</strong></article>
          </div>
        </section>
      )}
    </>
  );

  const renderPointsmen = () => (
    <>
      <div className="ss-page-header">
        <h2>Pointsmen Overview</h2>
      </div>

      <section className="ss-panel-card">
        <div className="ss-filter-row">
          <div className="ss-form-field">
            <label>Category</label>
            <select value={pointsCategoryFilter} onChange={(e) => setPointsCategoryFilter(e.target.value)}>
              <option>All</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </div>
          <div className="ss-form-field">
            <label>Performance</label>
            <select value={pointsPerformanceFilter} onChange={(e) => setPointsPerformanceFilter(e.target.value)}>
              <option>All</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Average</option>
              <option>Needs Improvement</option>
            </select>
          </div>
        </div>

        <div className="ss-table ss-cols-5">
          <div className="ss-table-row ss-head">
            <div>Name</div>
            <div>Employee ID</div>
            <div>Category</div>
            <div>Current Status</div>
            <div>Performance</div>
          </div>
          {filteredPointsmen.map((row) => (
            <div key={row.id} className="ss-table-row">
              <div>{row.name}</div>
              <div>{row.id}</div>
              <div>{row.category}</div>
              <div>{row.status}</div>
              <div>{performanceBand(row.score)}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderReports = () => (
    <>
      <div className="ss-page-header">
        <h2>Reports</h2>
        <span className="ss-view-only">Filter Based View</span>
      </div>

      <section className="ss-panel-card">
        <div className="ss-filter-row ss-four-col">
          <div className="ss-form-field">
            <label>Date Range - Start</label>
            <input
              type="date"
              value={reportFilters.startDate}
              onChange={(e) => setReportFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="ss-form-field">
            <label>Date Range - End</label>
            <input
              type="date"
              value={reportFilters.endDate}
              onChange={(e) => setReportFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div className="ss-form-field">
            <label>Category</label>
            <select
              value={reportFilters.category}
              onChange={(e) => setReportFilters((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option>All</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </div>
          <div className="ss-form-field">
            <label>Performance</label>
            <select
              value={reportFilters.performance}
              onChange={(e) => setReportFilters((prev) => ({ ...prev, performance: e.target.value }))}
            >
              <option>All</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Average</option>
              <option>Needs Improvement</option>
            </select>
          </div>
        </div>
      </section>

      <div className="ss-stats-grid ss-three-col">
        <article className="ss-stat-card">
          <ClipboardList size={18} />
          <label>Assessment Summaries</label>
          <strong>{reportSummary.total}</strong>
        </article>
        <article className="ss-stat-card">
          <BarChart3 size={18} />
          <label>Average Score</label>
          <strong>{reportSummary.averageScore}</strong>
        </article>
        <article className="ss-stat-card">
          <Gauge size={18} />
          <label>Excellent Performance</label>
          <strong>{reportSummary.excellentCount}</strong>
        </article>
      </div>

      <section className="ss-panel-card">
        <div className="ss-page-header">
          <h3>Staff Performance Report</h3>
        </div>

        <div className="ss-table ss-cols-7">
          <div className="ss-table-row ss-head">
            <div>Date</div>
            <div>Staff Type</div>
            <div>Staff ID</div>
            <div>Name</div>
            <div>Category</div>
            <div>Performance</div>
            <div>Score</div>
          </div>
          {filteredReports.map((row) => (
            <div key={row.id} className="ss-table-row">
              <div>{row.date}</div>
              <div>{row.staffType}</div>
              <div>{row.staffId}</div>
              <div>{row.staffName}</div>
              <div>{row.category}</div>
              <div>{row.performance}</div>
              <div>{row.score}/100</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderScorecard = () => {
    if (!selectedScorecard) return null;

    return (
      <section className="ss-panel-card">
        <div className="ss-page-header">
          <h2>Scorecard</h2>
          <button type="button" className="ss-link-btn" onClick={() => setSelectedScorecard(null)}>
            Back
          </button>
        </div>

        <div className="ss-score-meta-grid">
          <article>
            <label>Title</label>
            <strong>{selectedScorecard.title}</strong>
          </article>
          <article>
            <label>Context</label>
            <strong>{selectedScorecard.subtitle}</strong>
          </article>
          <article>
            <label>Assessment Period</label>
            <strong>{selectedScorecard.period}</strong>
          </article>
          <article>
            <label>Total Score</label>
            <strong>
              {selectedScorecard.total}/{selectedScorecard.outOf}
            </strong>
          </article>
        </div>

        <div className="ss-score-table">
          <div className="ss-score-row ss-score-head">
            <div>Section</div>
            <div>Marks</div>
          </div>
          {selectedScorecard.sections.map((section) => (
            <div key={section.title} className="ss-score-row">
              <div>{section.title}</div>
              <div>
                {section.marks}/{section.outOf}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderHistory = () => {
    if (selectedScorecard) return renderScorecard();

    return (
      <>
        <div className="ss-page-header">
          <h2>My Test History</h2>
        </div>

        <section className="ss-panel-card">
          <div className="ss-toolbar-row">
            <div className="ss-search-box">
              <Search size={16} />
              <input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by date or test name"
              />
            </div>
          </div>

          <div className="ss-table ss-cols-4">
            <div className="ss-table-row ss-head">
              <div>Test Date</div>
              <div>Test Name</div>
              <div>Score</div>
              <div>Scorecard</div>
            </div>
            {filteredHistory.map((row) => (
              <div key={row.id} className="ss-table-row">
                <div>{row.testDate}</div>
                <div>{row.testName}</div>
                <div>{row.score}/100</div>
                <div>
                  <button type="button" className="ss-link-btn" onClick={() => setSelectedScorecard(normalizeScorecard(row))}>
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderCurrentTest = () => {
    if (activeTest) {
      const question = mcqQuestions[currentQuestion];

      return (
        <>
          <div className="ss-page-header">
            <h2>Test Attempt - {activeTest.name}</h2>
            <span className="ss-view-only">
              Question {currentQuestion + 1}/25 | Answered {answeredCount}
            </span>
          </div>

          <section className="ss-panel-card">
            <article className="ss-question-card">
              <h3>{question.question}</h3>
              <div className="ss-option-grid">
                {question.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={responses[currentQuestion] === index ? "ss-option-btn active" : "ss-option-btn"}
                    onClick={() => {
                      setResponses((prev) => {
                        const next = [...prev];
                        next[currentQuestion] = index;
                        return next;
                      });
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>

            <div className="ss-attempt-actions">
              <button type="button" className="ss-secondary-btn" onClick={saveResponse}>
                Save Response
              </button>

              <div className="ss-inline-actions">
                <button
                  type="button"
                  className="ss-link-btn"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  type="button"
                  className="ss-link-btn"
                  disabled={currentQuestion === 24}
                  onClick={() => setCurrentQuestion((prev) => Math.min(24, prev + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>

              <button type="button" className="ss-primary-btn" onClick={submitTest}>
                Submit Test
              </button>
            </div>

            <p className="ss-note-text">Saved responses: {Object.keys(savedResponses).length}</p>
          </section>
        </>
      );
    }

    return (
      <>
        <div className="ss-page-header">
          <h2>Current Test</h2>
        </div>

        <section className="ss-panel-card">
          <div className="ss-table ss-cols-4">
            <div className="ss-table-row ss-head">
              <div>Test Name</div>
              <div>Assessment Period</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {currentTests.length === 0 ? (
              <div className="ss-empty-state">No tests available.</div>
            ) : (
              currentTests.map((test) => (
                <div key={test.id} className="ss-table-row">
                  <div>{test.name}</div>
                  <div>{test.period}</div>
                  <div>Available</div>
                  <div>
                    <button type="button" className="ss-primary-btn" onClick={() => startTest(test)}>
                      <PlayCircle size={16} /> Start Test
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </>
    );
  };

  const renderBody = () => {
    switch (activePage) {
      case "dashboard":
        return renderDashboard();
      case "profile":
        return renderProfile();
      case "overview":
        return renderOverview();
      case "stationMasters":
        return renderStationMasters();
      case "pointsmen":
        return renderPointsmen();
      case "reports":
        return renderReports();
      case "history":
        return renderHistory();
      case "current":
        return renderCurrentTest();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-shell ss-shell">
      <header className="topbar">
        <div className="brand-group">
          <div className="brand-mark">IR</div>
          <h1>Indian Railway Evaluation System</h1>
        </div>
        <div className="topbar-right">
          <div className="admin-badge">
            <div className="avatar">{ssId.substring(0, 2)}</div>
            <div>
              <strong>Station Superintendent Console</strong>
              <span>{ssName}</span>
            </div>
          </div>
          <button className="logout-btn" type="button" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="layout-grid">
        <aside className="sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-item ${activePage === item.key ? "active" : ""}`}
                onClick={() => goToPage(item.key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="main-content ss-main-content">
          <section className="ss-hero-band">
            <div>
              <p className="ss-eyebrow">Station Superintendent Workspace</p>
              <h2>{navItems.find((item) => item.key === activePage)?.label || "Dashboard"}</h2>
              <span>Station-level supervision dashboard for monitoring staff and performance without direct assessment authority.</span>
            </div>
            <div className="ss-kpi-strip">
              <article>
                <label>Station</label>
                <strong>{stationOverviewSeed.stationCode}</strong>
              </article>
              <article>
                <label>SMs</label>
                <strong>{totalSMs}</strong>
              </article>
              <article>
                <label>Pointsmen</label>
                <strong>{totalPointsmen}</strong>
              </article>
            </div>
          </section>

          {statusText && <div className="ss-status-banner">{statusText}</div>}
          {renderBody()}
        </main>
      </div>
    </div>
  );
}

export default StationSuperintendentModule;
