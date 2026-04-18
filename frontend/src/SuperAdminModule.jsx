import { useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  FileBarChart2,
  Filter,
  LogOut,
  Search,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard (Division Overview)", icon: BarChart3 },
  { key: "ti", label: "Traffic Inspectors", icon: ShieldCheck },
  { key: "stations", label: "Stations & Station Masters", icon: Building2 },
  { key: "pointsmen", label: "Pointsmen", icon: Users },
  { key: "records", label: "Assessment Records", icon: ClipboardList },
  { key: "reports", label: "Reports & Analytics", icon: FileBarChart2 }
];

const divisionMetrics = {
  totalTI: 9,
  totalStations: 96,
  totalSM: 184,
  totalPointsmen: 2016,
  pendingAssessments: 246,
  approvedAssessments: 4520,
  overdueAssessments: 33
};

const categoryBreakdown = [
  { category: "A", count: 426, pct: 21 },
  { category: "B", count: 734, pct: 36 },
  { category: "C", count: 633, pct: 31 },
  { category: "D", count: 223, pct: 11 }
];

const recentActivity = [
  "PM_1001 assessment submitted from Parbhani Junction.",
  "SM_2231 approved under TI PAR jurisdiction.",
  "New pointsman PM_1882 added at Wardha station.",
  "TI_1004 monthly inspection report published."
];

const trafficInspectors = [
  {
    id: "TI_1001",
    name: "R. Khan",
    jurisdiction: "TI PAR",
    category: "A",
    lastAssessmentDate: "2026-04-09",
    assignedStations: ["Parbhani Junction", "Purna", "Jintur"],
    assignedSMs: ["S. Deshmukh", "A. Patil", "V. Kale"]
  },
  {
    id: "TI_1002",
    name: "A. Kulkarni",
    jurisdiction: "TI AMLA",
    category: "A",
    lastAssessmentDate: "2026-04-08",
    assignedStations: ["Amla", "Multai", "Betul"],
    assignedSMs: ["M. Patil", "R. Sharma", "P. Singh"]
  },
  {
    id: "TI_1003",
    name: "S. Verma",
    jurisdiction: "TI NGP",
    category: "B",
    lastAssessmentDate: "2026-04-06",
    assignedStations: ["Nagpur Junction", "Ajni", "Kamptee"],
    assignedSMs: ["D. Nair", "K. Solanki", "L. Raut"]
  }
];

const stations = [
  {
    id: "ST_001",
    name: "Parbhani Junction",
    assignedTI: "TI PAR",
    smCount: 3,
    pointsmenCount: 58,
    sms: [
      { id: "SM_2101", name: "S. Deshmukh", designation: "Station Master", category: "A", contact: "+91 98888 11111" },
      { id: "SM_2102", name: "A. Patil", designation: "Station Master", category: "B", contact: "+91 98888 22222" },
      { id: "SM_2103", name: "V. Kale", designation: "Station Master", category: "A", contact: "+91 98888 33333" }
    ]
  },
  {
    id: "ST_002",
    name: "Amla",
    assignedTI: "TI AMLA",
    smCount: 2,
    pointsmenCount: 41,
    sms: [
      { id: "SM_2201", name: "M. Patil", designation: "Station Master", category: "A", contact: "+91 98888 44444" },
      { id: "SM_2202", name: "R. Sharma", designation: "Station Master", category: "C", contact: "+91 98888 55555" }
    ]
  },
  {
    id: "ST_003",
    name: "Nagpur Junction",
    assignedTI: "TI NGP",
    smCount: 4,
    pointsmenCount: 86,
    sms: [
      { id: "SM_2301", name: "D. Nair", designation: "Station Master", category: "A", contact: "+91 98888 66666" },
      { id: "SM_2302", name: "K. Solanki", designation: "Station Master", category: "A", contact: "+91 98888 77777" },
      { id: "SM_2303", name: "L. Raut", designation: "Station Master", category: "B", contact: "+91 98888 88888" },
      { id: "SM_2304", name: "N. Sheikh", designation: "Station Master", category: "C", contact: "+91 98888 99999" }
    ]
  }
];

const pointsmen = [
  {
    id: "PM_1001",
    name: "K. Pawar",
    station: "Parbhani Junction",
    tiArea: "TI PAR",
    category: "A",
    assessingSM: "S. Deshmukh",
    approvingTI: "R. Khan",
    scorecard: {
      total: 86,
      period: "April 2026",
      sections: [
        { title: "Knowledge of Rules", marks: 22, outOf: 25 },
        { title: "Alertness & Observation", marks: 21, outOf: 25 },
        { title: "Safety Record", marks: 13, outOf: 15 },
        { title: "Leadership & Management", marks: 12, outOf: 15 },
        { title: "Discipline", marks: 9, outOf: 10 },
        { title: "Appearance & Neatness", marks: 9, outOf: 10 }
      ]
    }
  },
  {
    id: "PM_1002",
    name: "R. Verma",
    station: "Amla",
    tiArea: "TI AMLA",
    category: "B",
    assessingSM: "M. Patil",
    approvingTI: "A. Kulkarni",
    scorecard: {
      total: 78,
      period: "April 2026",
      sections: [
        { title: "Knowledge of Rules", marks: 20, outOf: 25 },
        { title: "Alertness & Observation", marks: 18, outOf: 25 },
        { title: "Safety Record", marks: 11, outOf: 15 },
        { title: "Leadership & Management", marks: 11, outOf: 15 },
        { title: "Discipline", marks: 9, outOf: 10 },
        { title: "Appearance & Neatness", marks: 9, outOf: 10 }
      ]
    }
  },
  {
    id: "PM_1003",
    name: "J. Shaikh",
    station: "Nagpur Junction",
    tiArea: "TI NGP",
    category: "A",
    assessingSM: "D. Nair",
    approvingTI: "S. Verma",
    scorecard: {
      total: 91,
      period: "April 2026",
      sections: [
        { title: "Knowledge of Rules", marks: 24, outOf: 25 },
        { title: "Alertness & Observation", marks: 23, outOf: 25 },
        { title: "Safety Record", marks: 14, outOf: 15 },
        { title: "Leadership & Management", marks: 13, outOf: 15 },
        { title: "Discipline", marks: 9, outOf: 10 },
        { title: "Appearance & Neatness", marks: 8, outOf: 10 }
      ]
    }
  }
];

const assessmentRecords = [
  { id: "AR_1", name: "K. Pawar", role: "Pointsman", station: "Parbhani Junction", tiArea: "TI PAR", tiName: "R. Khan", date: "2026-04-10", score: 86, category: "A", status: "Approved", assessmentPeriod: "April 2026" },
  { id: "AR_2", name: "M. Patil", role: "Station Master", station: "Amla", tiArea: "TI AMLA", tiName: "A. Kulkarni", date: "2026-04-09", score: 82, category: "A", status: "Pending", assessmentPeriod: "April 2026" },
  { id: "AR_3", name: "R. Khan", role: "Traffic Inspector", station: "Parbhani Junction", tiArea: "TI PAR", tiName: "R. Khan", date: "2026-04-08", score: 88, category: "A", status: "Approved", assessmentPeriod: "April 2026" },
  { id: "AR_4", name: "R. Verma", role: "Pointsman", station: "Amla", tiArea: "TI AMLA", tiName: "A. Kulkarni", date: "2026-04-07", score: 78, category: "B", status: "Pending", assessmentPeriod: "April 2026" }
];

const analyticsRows = [
  { id: "AN_1", name: "K. Pawar", role: "Pointsman", station: "Parbhani Junction", tiArea: "TI PAR", score: 86, category: "A", pmeStatus: "Fit", refStatus: "Cleared", training: "Recommended", inspectionType: "Routine", date: "2026-04-10" },
  { id: "AN_2", name: "M. Patil", role: "Station Master", station: "Amla", tiArea: "TI AMLA", score: 82, category: "A", pmeStatus: "Fit", refStatus: "Cleared", training: "Not Required", inspectionType: "Special", date: "2026-04-09" },
  { id: "AN_3", name: "R. Verma", role: "Pointsman", station: "Amla", tiArea: "TI AMLA", score: 78, category: "B", pmeStatus: "Fit", refStatus: "Cleared", training: "Counselling", inspectionType: "Routine", date: "2026-04-08" },
  { id: "AN_4", name: "D. Nair", role: "Station Master", station: "Nagpur Junction", tiArea: "TI NGP", score: 90, category: "A", pmeStatus: "Fit", refStatus: "Cleared", training: "Recommended", inspectionType: "Joint", date: "2026-04-07" },
  { id: "AN_5", name: "S. Verma", role: "Traffic Inspector", station: "Nagpur Junction", tiArea: "TI NGP", score: 84, category: "B", pmeStatus: "Fit", refStatus: "Cleared", training: "Not Required", inspectionType: "Special", date: "2026-04-06" }
];

function buildScorecardFromRow(row) {
  return {
    title: `${row.role} Scorecard`,
    subtitle: `${row.name} | ${row.station}`,
    total: row.score,
    period: row.assessmentPeriod || "April 2026",
    sections: [
      { title: "Knowledge of Rules", marks: Math.round(row.score * 0.25), outOf: 25 },
      { title: "Alertness & Observation", marks: Math.round(row.score * 0.25), outOf: 25 },
      { title: "Safety Record", marks: Math.round(row.score * 0.15), outOf: 15 },
      { title: "Leadership & Management", marks: Math.round(row.score * 0.15), outOf: 15 },
      { title: "Discipline", marks: Math.round(row.score * 0.1), outOf: 10 },
      { title: "Appearance & Neatness", marks: Math.round(row.score * 0.1), outOf: 10 }
    ]
  };
}

function SuperAdminModule({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [statusMessage, setStatusMessage] = useState("");

  const [selectedTI, setSelectedTI] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedSM, setSelectedSM] = useState(null);
  const [selectedPointsman, setSelectedPointsman] = useState(null);
  const [selectedScorecard, setSelectedScorecard] = useState(null);

  const [pointsmanFilters, setPointsmanFilters] = useState({ station: "All", tiArea: "All", category: "All", name: "" });
  const [recordFilters, setRecordFilters] = useState({ role: "All", station: "All", tiArea: "All", status: "All", startDate: "", endDate: "" });
  const [reportFilters, setReportFilters] = useState({
    tiArea: "All",
    designation: "All",
    station: "All",
    pmeStatus: "All",
    refStatus: "All",
    training: "All",
    inspectionType: "All",
    startDate: "",
    endDate: "",
    category: "All"
  });

  const stationOptions = useMemo(() => ["All", ...Array.from(new Set(stations.map((s) => s.name)))], []);
  const tiAreaOptions = useMemo(() => ["All", ...Array.from(new Set(analyticsRows.map((r) => r.tiArea)))], []);

  const filteredPointsmen = useMemo(() => {
    return pointsmen.filter((row) => {
      const matchStation = pointsmanFilters.station === "All" || row.station === pointsmanFilters.station;
      const matchTi = pointsmanFilters.tiArea === "All" || row.tiArea === pointsmanFilters.tiArea;
      const matchCategory = pointsmanFilters.category === "All" || row.category === pointsmanFilters.category;
      const matchName = pointsmanFilters.name.trim().length === 0 || row.name.toLowerCase().includes(pointsmanFilters.name.trim().toLowerCase());
      return matchStation && matchTi && matchCategory && matchName;
    });
  }, [pointsmanFilters]);

  const filteredRecords = useMemo(() => {
    return assessmentRecords.filter((row) => {
      const matchRole = recordFilters.role === "All" || row.role === recordFilters.role;
      const matchStation = recordFilters.station === "All" || row.station === recordFilters.station;
      const matchTI = recordFilters.tiArea === "All" || row.tiArea === recordFilters.tiArea;
      const matchStatus = recordFilters.status === "All" || row.status === recordFilters.status;
      const matchStart = recordFilters.startDate === "" || row.date >= recordFilters.startDate;
      const matchEnd = recordFilters.endDate === "" || row.date <= recordFilters.endDate;
      return matchRole && matchStation && matchTI && matchStatus && matchStart && matchEnd;
    });
  }, [recordFilters]);

  const filteredAnalytics = useMemo(() => {
    return analyticsRows.filter((row) => {
      const matchTI = reportFilters.tiArea === "All" || row.tiArea === reportFilters.tiArea;
      const matchRole = reportFilters.designation === "All" || row.role === reportFilters.designation;
      const matchStation = reportFilters.station === "All" || row.station === reportFilters.station;
      const matchPme = reportFilters.pmeStatus === "All" || row.pmeStatus === reportFilters.pmeStatus;
      const matchRef = reportFilters.refStatus === "All" || row.refStatus === reportFilters.refStatus;
      const matchTraining = reportFilters.training === "All" || row.training === reportFilters.training;
      const matchInspection = reportFilters.inspectionType === "All" || row.inspectionType === reportFilters.inspectionType;
      const matchStart = reportFilters.startDate === "" || row.date >= reportFilters.startDate;
      const matchEnd = reportFilters.endDate === "" || row.date <= reportFilters.endDate;
      const matchCategory = reportFilters.category === "All" || row.category === reportFilters.category;
      return matchTI && matchRole && matchStation && matchPme && matchRef && matchTraining && matchInspection && matchStart && matchEnd && matchCategory;
    });
  }, [reportFilters]);

  const analyticsSummary = useMemo(() => {
    const count = filteredAnalytics.length;
    const avgScore = count === 0 ? 0 : Math.round(filteredAnalytics.reduce((sum, row) => sum + row.score, 0) / count);
    const passCount = filteredAnalytics.filter((row) => row.score >= 60).length;
    const passRate = count === 0 ? 0 : Math.round((passCount / count) * 100);
    const categoryMap = filteredAnalytics.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {});
    return { avgScore, passRate, categoryMap };
  }, [filteredAnalytics]);

  const renderScorecard = () => {
    if (!selectedScorecard) return null;
    return (
      <section className="sdom-panel-card">
        <div className="sdom-page-header">
          <h2>Scorecard View</h2>
          <button type="button" className="sdom-link-btn" onClick={() => setSelectedScorecard(null)}>
            Back
          </button>
        </div>

        <div className="sdom-score-meta-grid">
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
            <strong>{selectedScorecard.total}/100</strong>
          </article>
        </div>

        <div className="sdom-score-table">
          <div className="sdom-score-row sdom-score-head">
            <div>Section</div>
            <div>Marks</div>
          </div>
          {selectedScorecard.sections.map((section) => (
            <div key={section.title} className="sdom-score-row">
              <div>{section.title}</div>
              <div>{section.marks}/{section.outOf}</div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderDashboard = () => (
    <>
      <div className="sdom-page-header">
        <h2>Nagpur Division Command Center</h2>
      </div>

      <div className="sdom-stats-grid">
        <article className="sdom-stat-card"><ShieldCheck size={18} /><label>Total Traffic Inspectors</label><strong>{divisionMetrics.totalTI}</strong></article>
        <article className="sdom-stat-card"><Building2 size={18} /><label>Total Stations</label><strong>{divisionMetrics.totalStations}</strong></article>
        <article className="sdom-stat-card"><UserRound size={18} /><label>Total Station Masters</label><strong>{divisionMetrics.totalSM}</strong></article>
        <article className="sdom-stat-card"><Users size={18} /><label>Total Pointsmen</label><strong>{divisionMetrics.totalPointsmen}</strong></article>
      </div>

      <div className="sdom-stats-grid sdom-two-col">
        <section className="sdom-panel-card">
          <div className="sdom-page-header"><h3>Category Distribution</h3></div>
          <div className="sdom-category-grid">
            {categoryBreakdown.map((item) => (
              <article key={item.category} className="sdom-category-card">
                <label>Category {item.category}</label>
                <strong>{item.count}</strong>
                <span>{item.pct}% of division</span>
              </article>
            ))}
          </div>
        </section>

        <section className="sdom-panel-card">
          <div className="sdom-page-header"><h3>Assessment Pipeline</h3></div>
          <div className="sdom-category-grid">
            <article className="sdom-category-card"><label>Total Pending</label><strong>{divisionMetrics.pendingAssessments}</strong><span>Awaiting completion</span></article>
            <article className="sdom-category-card"><label>Approved</label><strong>{divisionMetrics.approvedAssessments}</strong><span>Finalized records</span></article>
            <article className="sdom-category-card"><label>Overdue</label><strong>{divisionMetrics.overdueAssessments}</strong><span>Require attention</span></article>
          </div>
        </section>
      </div>

      <section className="sdom-panel-card">
        <div className="sdom-page-header"><h3>Recent Activity Feed</h3></div>
        <ul className="sdom-activity-list">
          {recentActivity.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );

  const renderTI = () => (
    <>
      <div className="sdom-page-header"><h2>Traffic Inspectors (Read-Only)</h2></div>
      <section className="sdom-panel-card">
        <div className="sdom-table sdom-cols-6">
          <div className="sdom-table-row sdom-head">
            <div>Name</div><div>Employee ID</div><div>Jurisdiction</div><div>Category</div><div>Last Assessment Date</div><div>Profile</div>
          </div>
          {trafficInspectors.map((row) => (
            <div key={row.id} className="sdom-table-row">
              <div>{row.name}</div><div>{row.id}</div><div>{row.jurisdiction}</div><div>{row.category}</div><div>{row.lastAssessmentDate}</div>
              <div><button type="button" className="sdom-link-btn" onClick={() => setSelectedTI(row)}>Open</button></div>
            </div>
          ))}
        </div>
      </section>

      {selectedTI && (
        <section className="sdom-panel-card">
          <div className="sdom-page-header">
            <h3>TI Profile - {selectedTI.name}</h3>
            <button type="button" className="sdom-link-btn" onClick={() => setSelectedTI(null)}>Close</button>
          </div>
          <div className="sdom-profile-grid">
            <article><label>Employee ID</label><strong>{selectedTI.id}</strong></article>
            <article><label>Jurisdiction</label><strong>{selectedTI.jurisdiction}</strong></article>
            <article><label>Category</label><strong>{selectedTI.category}</strong></article>
            <article><label>Last Assessment</label><strong>{selectedTI.lastAssessmentDate}</strong></article>
          </div>
          <div className="sdom-two-list">
            <div><h4>Assigned Stations</h4><ul>{selectedTI.assignedStations.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h4>Assigned Station Masters</h4><ul>{selectedTI.assignedSMs.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </section>
      )}
    </>
  );

  const renderStations = () => (
    <>
      <div className="sdom-page-header"><h2>Stations & Station Masters (Read-Only)</h2></div>
      <section className="sdom-panel-card">
        <div className="sdom-table sdom-cols-6">
          <div className="sdom-table-row sdom-head">
            <div>Station Name</div><div>Assigned TI</div><div>No. of SMs</div><div>No. of Pointsmen</div><div>View SMs</div><div>Info</div>
          </div>
          {stations.map((row) => (
            <div key={row.id} className="sdom-table-row">
              <div>{row.name}</div><div>{row.assignedTI}</div><div>{row.smCount}</div><div>{row.pointsmenCount}</div>
              <div><button type="button" className="sdom-link-btn" onClick={() => setSelectedStation(row)}>Open</button></div>
              <div>Read-Only</div>
            </div>
          ))}
        </div>
      </section>

      {selectedStation && (
        <section className="sdom-panel-card">
          <div className="sdom-page-header">
            <h3>{selectedStation.name} - Station Masters</h3>
            <button type="button" className="sdom-link-btn" onClick={() => setSelectedStation(null)}>Close</button>
          </div>
          <div className="sdom-table sdom-cols-5">
            <div className="sdom-table-row sdom-head"><div>Name</div><div>Employee ID</div><div>Designation</div><div>Category</div><div>Profile</div></div>
            {selectedStation.sms.map((sm) => (
              <div key={sm.id} className="sdom-table-row">
                <div>{sm.name}</div><div>{sm.id}</div><div>{sm.designation}</div><div>{sm.category}</div>
                <div><button type="button" className="sdom-link-btn" onClick={() => setSelectedSM({ ...sm, station: selectedStation.name })}>Open</button></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedSM && (
        <section className="sdom-panel-card">
          <div className="sdom-page-header">
            <h3>SM Profile - {selectedSM.name}</h3>
            <button type="button" className="sdom-link-btn" onClick={() => setSelectedSM(null)}>Close</button>
          </div>
          <div className="sdom-profile-grid">
            <article><label>Name</label><strong>{selectedSM.name}</strong></article>
            <article><label>Employee ID</label><strong>{selectedSM.id}</strong></article>
            <article><label>Designation</label><strong>{selectedSM.designation}</strong></article>
            <article><label>Category</label><strong>{selectedSM.category}</strong></article>
            <article><label>Station</label><strong>{selectedSM.station}</strong></article>
            <article><label>Contact</label><strong>{selectedSM.contact}</strong></article>
          </div>
        </section>
      )}
    </>
  );

  const renderPointsmen = () => (
    <>
      <div className="sdom-page-header"><h2>Pointsmen (Read-Only)</h2></div>
      <section className="sdom-panel-card">
        <div className="sdom-filter-grid">
          <div className="sdom-form-field"><label>Station</label><select value={pointsmanFilters.station} onChange={(e) => setPointsmanFilters((p) => ({ ...p, station: e.target.value }))}>{stationOptions.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="sdom-form-field"><label>TI Area</label><select value={pointsmanFilters.tiArea} onChange={(e) => setPointsmanFilters((p) => ({ ...p, tiArea: e.target.value }))}>{tiAreaOptions.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="sdom-form-field"><label>Category</label><select value={pointsmanFilters.category} onChange={(e) => setPointsmanFilters((p) => ({ ...p, category: e.target.value }))}><option>All</option><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
          <div className="sdom-form-field"><label>Name</label><input value={pointsmanFilters.name} onChange={(e) => setPointsmanFilters((p) => ({ ...p, name: e.target.value }))} placeholder="Search name" /></div>
        </div>

        <div className="sdom-table sdom-cols-8">
          <div className="sdom-table-row sdom-head"><div>Name</div><div>Employee ID</div><div>Station</div><div>Category</div><div>Assessing SM</div><div>Approving TI</div><div>TI Area</div><div>Profile</div></div>
          {filteredPointsmen.map((row) => (
            <div key={row.id} className="sdom-table-row">
              <div>{row.name}</div><div>{row.id}</div><div>{row.station}</div><div>{row.category}</div><div>{row.assessingSM}</div><div>{row.approvingTI}</div><div>{row.tiArea}</div>
              <div><button type="button" className="sdom-link-btn" onClick={() => setSelectedPointsman(row)}>Open</button></div>
            </div>
          ))}
        </div>
      </section>

      {selectedPointsman && (
        <section className="sdom-panel-card">
          <div className="sdom-page-header">
            <h3>Pointsman Profile - {selectedPointsman.name}</h3>
            <div className="sdom-inline-actions">
              <button type="button" className="sdom-link-btn" onClick={() => setSelectedScorecard({ title: "Pointsman Scorecard", subtitle: `${selectedPointsman.name} | ${selectedPointsman.station}`, total: selectedPointsman.scorecard.total, period: selectedPointsman.scorecard.period, sections: selectedPointsman.scorecard.sections })}>View Scorecard</button>
              <button type="button" className="sdom-link-btn" onClick={() => setSelectedPointsman(null)}>Close</button>
            </div>
          </div>
          <div className="sdom-profile-grid">
            <article><label>Name</label><strong>{selectedPointsman.name}</strong></article>
            <article><label>Employee ID</label><strong>{selectedPointsman.id}</strong></article>
            <article><label>Station</label><strong>{selectedPointsman.station}</strong></article>
            <article><label>Category</label><strong>{selectedPointsman.category}</strong></article>
            <article><label>Assessing SM</label><strong>{selectedPointsman.assessingSM}</strong></article>
            <article><label>Approving TI</label><strong>{selectedPointsman.approvingTI}</strong></article>
          </div>
        </section>
      )}
    </>
  );

  const renderRecords = () => (
    <>
      <div className="sdom-page-header"><h2>Assessment Records (Unified Read-Only)</h2></div>
      <section className="sdom-panel-card">
        <div className="sdom-filter-grid sdom-record-filter-grid">
          <div className="sdom-form-field"><label>Role</label><select value={recordFilters.role} onChange={(e) => setRecordFilters((p) => ({ ...p, role: e.target.value }))}><option>All</option><option>Pointsman</option><option>Station Master</option><option>Traffic Inspector</option></select></div>
          <div className="sdom-form-field"><label>Station</label><select value={recordFilters.station} onChange={(e) => setRecordFilters((p) => ({ ...p, station: e.target.value }))}>{stationOptions.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="sdom-form-field"><label>TI Area</label><select value={recordFilters.tiArea} onChange={(e) => setRecordFilters((p) => ({ ...p, tiArea: e.target.value }))}>{tiAreaOptions.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="sdom-form-field"><label>Status</label><select value={recordFilters.status} onChange={(e) => setRecordFilters((p) => ({ ...p, status: e.target.value }))}><option>All</option><option>Pending</option><option>Approved</option></select></div>
          <div className="sdom-form-field"><label>Date Start</label><input type="date" value={recordFilters.startDate} onChange={(e) => setRecordFilters((p) => ({ ...p, startDate: e.target.value }))} /></div>
          <div className="sdom-form-field"><label>Date End</label><input type="date" value={recordFilters.endDate} onChange={(e) => setRecordFilters((p) => ({ ...p, endDate: e.target.value }))} /></div>
        </div>

        <div className="sdom-table sdom-cols-9">
          <div className="sdom-table-row sdom-head"><div>Name</div><div>Role</div><div>Station</div><div>TI Area</div><div>TI</div><div>Date</div><div>Score</div><div>Category</div><div>Scorecard</div></div>
          {filteredRecords.map((row) => (
            <div key={row.id} className="sdom-table-row">
              <div>{row.name}</div><div>{row.role}</div><div>{row.station}</div><div>{row.tiArea}</div><div>{row.tiName}</div><div>{row.date}</div><div>{row.score}</div><div>{row.category}</div>
              <div><button type="button" className="sdom-link-btn" onClick={() => setSelectedScorecard(buildScorecardFromRow(row))}>Open</button></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderReports = () => (
    <>
      <div className="sdom-page-header">
        <h2>Reports & Analytics</h2>
        <button type="button" className="sdom-secondary-btn" onClick={() => setStatusMessage("Export option triggered (UI only).")}>Export</button>
      </div>

      <section className="sdom-panel-card">
        <div className="sdom-filter-grid sdom-report-filter-grid">
          <div className="sdom-form-field"><label>TI Jurisdiction</label><select value={reportFilters.tiArea} onChange={(e) => setReportFilters((p) => ({ ...p, tiArea: e.target.value }))}>{tiAreaOptions.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="sdom-form-field"><label>Designation</label><select value={reportFilters.designation} onChange={(e) => setReportFilters((p) => ({ ...p, designation: e.target.value }))}><option>All</option><option>Pointsman</option><option>Station Master</option><option>Traffic Inspector</option></select></div>
          <div className="sdom-form-field"><label>Station</label><select value={reportFilters.station} onChange={(e) => setReportFilters((p) => ({ ...p, station: e.target.value }))}>{stationOptions.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="sdom-form-field"><label>PME Status</label><select value={reportFilters.pmeStatus} onChange={(e) => setReportFilters((p) => ({ ...p, pmeStatus: e.target.value }))}><option>All</option><option>Fit</option><option>Unfit</option></select></div>
          <div className="sdom-form-field"><label>REF Status</label><select value={reportFilters.refStatus} onChange={(e) => setReportFilters((p) => ({ ...p, refStatus: e.target.value }))}><option>All</option><option>Cleared</option><option>Pending</option></select></div>
          <div className="sdom-form-field"><label>Training/Counselling</label><select value={reportFilters.training} onChange={(e) => setReportFilters((p) => ({ ...p, training: e.target.value }))}><option>All</option><option>Recommended</option><option>Not Required</option><option>Counselling</option></select></div>
          <div className="sdom-form-field"><label>Inspection Type</label><select value={reportFilters.inspectionType} onChange={(e) => setReportFilters((p) => ({ ...p, inspectionType: e.target.value }))}><option>All</option><option>Routine</option><option>Special</option><option>Joint</option></select></div>
          <div className="sdom-form-field"><label>Date Start</label><input type="date" value={reportFilters.startDate} onChange={(e) => setReportFilters((p) => ({ ...p, startDate: e.target.value }))} /></div>
          <div className="sdom-form-field"><label>Date End</label><input type="date" value={reportFilters.endDate} onChange={(e) => setReportFilters((p) => ({ ...p, endDate: e.target.value }))} /></div>
          <div className="sdom-form-field"><label>Category</label><select value={reportFilters.category} onChange={(e) => setReportFilters((p) => ({ ...p, category: e.target.value }))}><option>All</option><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
        </div>
      </section>

      <div className="sdom-stats-grid sdom-three-col">
        <article className="sdom-stat-card"><TrendingUp size={18} /><label>Average Score</label><strong>{analyticsSummary.avgScore}</strong></article>
        <article className="sdom-stat-card"><ShieldCheck size={18} /><label>Pass Rate</label><strong>{analyticsSummary.passRate}%</strong></article>
        <article className="sdom-stat-card"><Filter size={18} /><label>Category Distribution</label><strong>{Object.entries(analyticsSummary.categoryMap).map(([k, v]) => `${k}:${v}`).join(" | ") || "-"}</strong></article>
      </div>

      <section className="sdom-panel-card">
        <div className="sdom-page-header"><h3>Performance Data</h3></div>
        <div className="sdom-table sdom-cols-8">
          <div className="sdom-table-row sdom-head"><div>Name</div><div>Role</div><div>Station</div><div>TI Area</div><div>Score</div><div>Category</div><div>Date</div><div>Detailed</div></div>
          {filteredAnalytics.map((row) => (
            <div key={row.id} className="sdom-table-row">
              <div>{row.name}</div><div>{row.role}</div><div>{row.station}</div><div>{row.tiArea}</div><div>{row.score}</div><div>{row.category}</div><div>{row.date}</div>
              <div><button type="button" className="sdom-link-btn" onClick={() => setSelectedScorecard(buildScorecardFromRow({ ...row, assessmentPeriod: "April 2026" }))}>View</button></div>
            </div>
          ))}
        </div>
      </section>

      <section className="sdom-panel-card">
        <div className="sdom-page-header"><h3>Performance Trends (Sample)</h3></div>
        <div className="sdom-trend-grid">
          {[
            { label: "By Station", value: "Nagpur Junction: 88" },
            { label: "By TI", value: "TI PAR: 84" },
            { label: "By Category", value: "Category A: 87" }
          ].map((item) => (
            <article key={item.label} className="sdom-trend-card">
              <label>{item.label}</label>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>
    </>
  );

  const renderBody = () => {
    if (selectedScorecard) {
      return renderScorecard();
    }

    switch (activePage) {
      case "dashboard":
        return renderDashboard();
      case "ti":
        return renderTI();
      case "stations":
        return renderStations();
      case "pointsmen":
        return renderPointsmen();
      case "records":
        return renderRecords();
      case "reports":
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-shell sdom-shell">
      <header className="topbar">
        <div className="brand-group">
          <div className="brand-mark">IR</div>
          <h1>Indian Railway Evaluation System</h1>
        </div>
        <div className="topbar-right">
          <div className="admin-badge">
            <div className="avatar">{(user?.hrmsId || "SA").slice(0, 2)}</div>
            <div>
              <strong>Sr. DOM Console</strong>
              <span>Nagpur Division</span>
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
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item.key);
                  setStatusMessage("");
                  setSelectedScorecard(null);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="main-content sdom-main-content">
          <section className="sdom-hero-band">
            <div>
              <p className="sdom-eyebrow">Sr. DOM Monitoring Workspace</p>
              <h2>{navItems.find((n) => n.key === activePage)?.label || "Dashboard"}</h2>
              <span>Read-only division visibility, hierarchy monitoring, and analytics-first oversight.</span>
            </div>
            <div className="sdom-kpi-strip">
              <article><label>TI</label><strong>{divisionMetrics.totalTI}</strong></article>
              <article><label>Stations</label><strong>{divisionMetrics.totalStations}</strong></article>
              <article><label>Pointsmen</label><strong>{divisionMetrics.totalPointsmen}</strong></article>
            </div>
          </section>

          {statusMessage && <div className="sdom-status-banner">{statusMessage}</div>}
          {renderBody()}
        </main>
      </div>
    </div>
  );
}

export default SuperAdminModule;
