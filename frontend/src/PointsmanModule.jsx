import { useMemo, useState } from "react";
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
  ShieldCheck
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

/* ─── Navigation ─── */
const navItems = [
  { key: "profile", label: "Profile", icon: UserCircle2 },
  { key: "history", label: "Test History", icon: FileBarChart2 },
  { key: "current", label: "Current Test", icon: ClipboardList }
];

/* ─── Static profile data ─── */
const pointsmanProfile = {
  name: "Ravi Kumar",
  employeeId: "PM_1001",
  contact: "+91 98989 11223",
  designation: "Pointsman",
  department: "Operations",
  station: "Nagpur Junction",
  reportingOfficer: "S. Deshmukh",
  joiningDate: "2018-06-15"
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

/* ─── Seed history — ONE test type repeated ─── */
const TEST_NAME = "Pointsman Periodic Assessment";

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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

/* ─── Single active test for the current month ─── */
const currentTestSeed = {
  id: "CT-APR-2026",
  name: TEST_NAME,
  period: "April 2026"
};

/* ─── 25 MCQ questions ─── */
function buildQuestions() {
  const bank = [
    { text: "A signal shows double yellow. The driver should:", options: ["Proceed at full speed", "Prepare to stop at next signal", "Stop immediately", "Sound horn continuously"], answer: 1 },
    { text: "When a track circuit fails, the pointsman must:", options: ["Ignore it and proceed", "Immediately inform the station master", "Wait for someone else to act", "Close the station"], answer: 1 },
    { text: "The safe distance to stand from a moving train is:", options: ["0.5 metres", "1 metre", "2 metres", "5 metres"], answer: 2 },
    { text: "A 'Line Clear' token must be:", options: ["Carried by the guard", "Exchanged only at block stations", "Kept at the engine", "Kept at the signal box"], answer: 1 },
    { text: "Points must be clipped and padlocked when:", options: ["A train is expected", "Maintenance is not needed", "No train is expected for 8 hours", "During night only"], answer: 0 },
    { text: "Which colour indicates a 'Stop' signal?", options: ["Green", "Yellow", "Red", "White"], answer: 2 },
    { text: "An emergency brake application mid-section requires:", options: ["Driver to restart immediately", "Informing the guard and station master", "Reversing to the last station", "Disconnecting the coupling"], answer: 1 },
    { text: "A detonator placed on the track signals the driver to:", options: ["Increase speed", "Stop and proceed cautiously", "Reverse immediately", "Ignore it"], answer: 1 },
    { text: "Fixed signals are distinguished from working signals by:", options: ["Being painted blue", "Having no moving parts", "Being placed lower", "Flashing continuously"], answer: 1 },
    { text: "The whistle code for 'Stop' is:", options: ["One long", "Two short", "Three short", "One short"], answer: 0 },
    { text: "When shunting, the speed limit in station limits is:", options: ["15 km/h", "25 km/h", "30 km/h", "50 km/h"], answer: 0 },
    { text: "A fouling mark indicates:", options: ["The limit of safe track clearance", "A defective rail", "Speed restriction end", "Gradient change"], answer: 0 },
    { text: "Who authorises working on a live track?", options: ["The nearest pointsman", "The gang mate", "The station master with permit", "Any senior staff"], answer: 2 },
    { text: "Verbal communication during train operations must be:", options: ["Quick and informal", "Clear, loud, and repeated back", "Whispered to avoid panic", "Written only"], answer: 1 },
    { text: "A Point Indicator showing 'Normal' means:", options: ["Points are in reverse position", "Points are in normal position", "Points are defective", "No train is expected"], answer: 1 },
    { text: "In fog, the frequency of detonator placement is:", options: ["Every 500 metres", "Every 1 km", "Every signal", "At engine only"], answer: 2 },
    { text: "When a train passes, the pointsman should:", options: ["Walk along the track", "Stand at least 2 m away and observe", "Record speed", "Signal with a flag immediately"], answer: 1 },
    { text: "A green hand signal during shunting means:", options: ["Stop", "Proceed", "Caution", "Reverse"], answer: 1 },
    { text: "Interlocking ensures that:", options: ["Signals and points cannot be in conflicting positions", "Only one train can enter the yard", "Points are locked at all times", "Signals always show green"], answer: 0 },
    { text: "A 'Caution Order' issued to a driver must be:", options: ["Signed and returned to station master", "Kept by the driver until destination", "Torn after reading", "Radioed to control"], answer: 0 },
    { text: "The correct way to hold a flag when giving an 'All Right' signal is:", options: ["Waving it rapidly overhead", "Held steadily by the side", "Stretched horizontally at arm's length", "Pointing at the engine"], answer: 2 },
    { text: "Trap points are used to:", options: ["Increase train speed", "Prevent unauthorized entry into main line", "Derail a runaway vehicle away from the main line", "Signal an emergency stop"], answer: 2 },
    { text: "The SWR (Station Working Rules) must be revised:", options: ["Every 5 years", "As and when changes occur", "Only by the GM", "Never once issued"], answer: 1 },
    { text: "Before restoring points to normal after engineering work, the pointsman must:", options: ["Inform the driver", "Check that the track is clear and inform station master", "Replace detonators", "Wait for green signal"], answer: 1 },
    { text: "If a signal cannot be lowered, the driver should be given:", options: ["A red flag and stopped", "A 'T/369' caution memo and proceed at 15 km/h", "Permission to proceed at full speed", "A verbal confirmation only"], answer: 1 }
  ];
  return bank.map((q, i) => ({ id: i + 1, ...q }));
}

const testQuestions = buildQuestions();

/* ─── Pie chart custom label ─── */
const PIE_COLORS = { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#dc2626" };

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, payload: inner } = payload[0];
    return (
      <div className="pm-pie-tooltip">
        <strong>Category {name}</strong>
        <span>{value}% &nbsp;({inner.count} attempt{inner.count !== 1 ? "s" : ""})</span>
      </div>
    );
  }
  return null;
};

/* ─── Main component ─── */
function PointsmanModule({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState("profile");
  const [screenMode, setScreenMode] = useState("default");
  const [history, setHistory] = useState(initialHistory);
  const [historyDateSearch, setHistoryDateSearch] = useState("");
  const [historySortOrder, setHistorySortOrder] = useState("date-desc");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentTest, setCurrentTest] = useState(currentTestSeed);
  const [activeTest, setActiveTest] = useState(null);
  const [responses, setResponses] = useState(Array(25).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [savedResponses, setSavedResponses] = useState({});
  const [statusText, setStatusText] = useState("");

  const fullName = user?.name || pointsmanProfile.name;
  const employeeId = user?.hrmsId || pointsmanProfile.employeeId;

  /* ─── Derived metrics ─── */
  const latestScore = history.length ? history[0].totalScore : null;
  const latestCategory = latestScore !== null ? getCategory(latestScore) : "—";
  const averageScore = history.length
    ? Math.round(history.reduce((s, i) => s + i.totalScore, 0) / history.length)
    : 0;
  const answeredCount = responses.filter(v => v !== null).length;
  const completionRate = Math.round((answeredCount / 25) * 100);

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
    // default: date-desc (already ordered newest first)
    return list;
  }, [history, historyDateSearch, historySortOrder]);

  /* ─── View label ─── */
  const currentViewLabel =
    screenMode === "scorecard" ? "Detailed Scorecard"
      : screenMode === "attempt" ? "Test Attempt"
      : navItems.find(i => i.key === activeNav)?.label || "Profile";

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

  /* ─── Test actions ─── */
  const startTest = () => {
    setActiveTest(currentTest);
    setResponses(Array(25).fill(null));
    setSavedResponses({});
    setCurrentQuestion(0);
    setStatusText("");
    setActiveNav("current");
    setScreenMode("attempt");
  };

  const handleSelectOption = (idx) => {
    setResponses(prev => { const n = [...prev]; n[currentQuestion] = idx; return n; });
  };

  const saveCurrentResponse = () => {
    if (responses[currentQuestion] === null) {
      setStatusText("Select an option before saving.");
      return;
    }
    setSavedResponses(prev => ({ ...prev, [currentQuestion]: true }));
    setStatusText(`Response for Q${currentQuestion + 1} saved.`);
  };

  const evaluateTest = () => {
    let correct = 0;
    const sec = [0, 0, 0, 0, 0];
    responses.forEach((r, i) => {
      const si = Math.floor(i / 5);
      if (r === testQuestions[i].answer) { correct++; sec[si] += 4; }
    });
    const sections = ["Signal Rules", "Track Handling", "Communication", "Safety Response", "Operational Judgement"]
      .map((title, i) => ({ title, marks: sec[i], outOf: 20 }));
    return { totalScore: correct * 4, sections };
  };

  const submitTest = () => {
    if (!activeTest) return;
    const { totalScore, sections } = evaluateTest();
    const today = new Date().toISOString().slice(0, 10);
    const record = {
      id: Date.now(),
      date: today,
      name: activeTest.name,
      assessmentPeriod: activeTest.period,
      totalScore,
      sections
    };
    setHistory(prev => [record, ...prev]);
    setCurrentTest(null);
    setSelectedRecord(record);
    setActiveTest(null);
    setActiveNav("history");
    setScreenMode("scorecard");
    setStatusText("Test submitted! Your scorecard is ready.");
  };

  /* ═══════════════════════════════════════
     RENDER: PROFILE + DASHBOARD
  ═══════════════════════════════════════ */
  const renderProfilePage = () => (
    <div className="pm-dashboard-layout">

      {/* ── Row 1: Summary cards ── */}
      <div className="pm-summary-cards">
        <article className="pm-sum-card">
          <div className="pm-sum-icon" style={{ background: "#eff6ff" }}>
            <Target size={20} color="#2563eb" />
          </div>
          <div>
            <label>Latest Score</label>
            <strong>{latestScore !== null ? `${latestScore}/100` : "—"}</strong>
          </div>
        </article>

        <article className="pm-sum-card">
          <div className="pm-sum-icon" style={{ background: "#f0fdf4" }}>
            <Gauge size={20} color="#16a34a" />
          </div>
          <div>
            <label>Average Score</label>
            <strong>{averageScore}/100</strong>
          </div>
        </article>

        <article className="pm-sum-card">
          <div className="pm-sum-icon" style={{ background: getCategoryBg(latestCategory) }}>
            <ShieldCheck size={20} color={getCategoryColor(latestCategory)} />
          </div>
          <div>
            <label>Current Category</label>
            <strong style={{ color: getCategoryColor(latestCategory) }}>
              {latestCategory !== "—"
                ? `Category ${latestCategory}`
                : "—"}
            </strong>
          </div>
        </article>

        <article className="pm-sum-card">
          <div className="pm-sum-icon" style={{ background: "#fdf4ff" }}>
            <Award size={20} color="#9333ea" />
          </div>
          <div>
            <label>Total Attempts</label>
            <strong>{history.length}</strong>
          </div>
        </article>
      </div>

      {/* ── Row 2: Charts ── */}
      <div className="pm-charts-row">
        {/* Line chart */}
        <div className="pm-chart-card pm-chart-line">
          <div className="pm-chart-header">
            <TrendingUp size={16} />
            <h3>Performance Trend</h3>
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

        {/* Pie chart */}
        <div className="pm-chart-card pm-chart-pie">
          <div className="pm-chart-header">
            <BarChart2 size={16} />
            <h3>Category Distribution</h3>
          </div>
          <p className="pm-chart-hint">Hover slices to see count</p>
          {pieData.length === 0 ? (
            <p className="pm-empty-state">No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value, entry) => `Cat. ${value}  ${entry.payload.value}%`}
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row 3: Profile detail + Recent activity ── */}
      <div className="pm-bottom-row">
        {/* Profile card */}
        <div className="pm-profile-detail-card">
          <div className="pm-chart-header" style={{ marginBottom: 16 }}>
            <UserCircle2 size={16} />
            <h3>Personal Details</h3>
            <span className="pm-badge-view-only" style={{ marginLeft: "auto" }}>View Only</span>
          </div>
          <dl className="pm-dl-grid">
            <div><dt>Full Name</dt><dd>{fullName}</dd></div>
            <div><dt>Employee ID</dt><dd>{employeeId}</dd></div>
            <div><dt>Designation</dt><dd>{pointsmanProfile.designation}</dd></div>
            <div><dt>Department</dt><dd>{pointsmanProfile.department}</dd></div>
            <div><dt>Station</dt><dd>{pointsmanProfile.station}</dd></div>
            <div><dt>Contact</dt><dd>{pointsmanProfile.contact}</dd></div>
            <div><dt>Reporting Officer</dt><dd>{pointsmanProfile.reportingOfficer}</dd></div>
            <div><dt>Joining Date</dt><dd>{pointsmanProfile.joiningDate}</dd></div>
          </dl>
        </div>

        {/* Recent activity */}
        <div className="pm-recent-card">
          <div className="pm-chart-header" style={{ marginBottom: 16 }}>
            <CalendarDays size={16} />
            <h3>Recent Assessments</h3>
          </div>
          <div className="pm-recent-list">
            {history.slice(0, 5).map(r => {
              const cat = getCategory(r.totalScore);
              return (
                <button key={r.id} className="pm-recent-item" onClick={() => openScorecard(r)}>
                  <div className="pm-recent-left">
                    <span className="pm-cat-badge" style={{ background: getCategoryBg(cat), color: getCategoryColor(cat) }}>
                      {cat}
                    </span>
                    <span className="pm-recent-period">{r.assessmentPeriod}</span>
                  </div>
                  <div className="pm-recent-right">
                    <strong>{r.totalScore}/100</strong>
                    <span>{r.date}</span>
                  </div>
                </button>
              );
            })}
            {history.length === 0 && <p className="pm-empty-state">No assessments yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     RENDER: TEST HISTORY
  ═══════════════════════════════════════ */
  const renderHistoryPage = () => (
    <section className="pm-page-card">
      <div className="pm-page-header">
        <h2>Test History</h2>
      </div>
      <p className="pm-subtitle">All attempts of the Pointsman Periodic Assessment.</p>

      <div className="pm-filters-row">
        <div className="pm-search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Filter by date  (YYYY-MM)"
            value={historyDateSearch}
            onChange={e => setHistoryDateSearch(e.target.value)}
          />
        </div>
        <div className="pm-sort-select-wrap">
          <ArrowUpDown size={14} />
          <select value={historySortOrder} onChange={e => setHistorySortOrder(e.target.value)}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
          </select>
        </div>
      </div>

      <div className="pm-history-cards">
        {filteredHistory.length === 0 && (
          <p className="pm-empty-state">No records match your filter.</p>
        )}
        {filteredHistory.map((record, idx) => {
          const cat = getCategory(record.totalScore);
          return (
            <button key={record.id} className="pm-history-card-item" onClick={() => openScorecard(record)}>
              <div className="pm-hc-left">
                <span className="pm-attempt-number">Attempt #{filteredHistory.length - idx}</span>
                <span className="pm-hc-period">{record.assessmentPeriod}</span>
                <span className="pm-hc-date">{record.date}</span>
              </div>
              <div className="pm-hc-right">
                <div className="pm-hc-score">{record.totalScore}<span>/100</span></div>
                <span
                  className="pm-cat-badge"
                  style={{ background: getCategoryBg(cat), color: getCategoryColor(cat) }}
                >
                  Cat. {cat}
                </span>
              </div>
              <span className="pm-hc-arrow">View →</span>
            </button>
          );
        })}
      </div>
    </section>
  );

  /* ═══════════════════════════════════════
     RENDER: SCORECARD
  ═══════════════════════════════════════ */
  const renderScorecardPage = () => {
    if (!selectedRecord) return (
      <section className="pm-page-card">
        <p className="pm-empty-state">Select a test from Test History.</p>
      </section>
    );

    const cat = getCategory(selectedRecord.totalScore);
    const pct = selectedRecord.totalScore;

    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Detailed Scorecard</h2>
          <button className="pm-link-btn" onClick={() => setScreenMode("default")}>← Back to History</button>
        </div>

        <div className="pm-scorecard-hero">
          <div className="pm-sc-score-circle" style={{ borderColor: getCategoryColor(cat) }}>
            <strong style={{ color: getCategoryColor(cat) }}>{selectedRecord.totalScore}</strong>
            <span>/100</span>
          </div>
          <div>
            <span className="pm-cat-badge-lg"
              style={{ background: getCategoryBg(cat), color: getCategoryColor(cat) }}>
              Category {cat}
            </span>
            <p className="pm-sc-period">{selectedRecord.assessmentPeriod}</p>
            <p className="pm-sc-date">Attempted: {selectedRecord.date}</p>
          </div>
        </div>

        <div className="pm-sc-sections">
          {selectedRecord.sections.map(s => {
            const spc = Math.round((s.marks / s.outOf) * 100);
            return (
              <div key={s.title} className="pm-sc-section-row">
                <span className="pm-sc-section-name">{s.title}</span>
                <div className="pm-sc-bar-wrap">
                  <div className="pm-sc-bar-fill"
                    style={{ width: `${spc}%`, background: getCategoryColor(getCategory(spc)) }} />
                </div>
                <span className="pm-sc-section-marks">{s.marks}/{s.outOf}</span>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  /* ═══════════════════════════════════════
     RENDER: CURRENT TEST
  ═══════════════════════════════════════ */
  const renderCurrentTestsPage = () => (
    <section className="pm-page-card">
      <div className="pm-page-header">
        <h2>Current Test</h2>
      </div>
      <p className="pm-subtitle">Your scheduled periodic assessment for this month.</p>

      <div className="pm-current-tests">
        {!currentTest ? (
          <div className="pm-no-test-banner">
            <CheckCircle2 size={40} color="#16a34a" />
            <h3>All caught up!</h3>
            <p>You have completed this month's assessment. Check back next month.</p>
          </div>
        ) : (
          <article className="pm-test-card-premium">
            <div className="pm-tc-header">
              <ClipboardList size={22} color="#2563eb" />
              <div>
                <h3>{currentTest.name}</h3>
                <p>Assessment Period: <strong>{currentTest.period}</strong></p>
              </div>
            </div>
            <div className="pm-tc-meta-row">
              <span className="pm-mini-pill">📝 25 Questions</span>
              <span className="pm-mini-pill">⏱ ~30 Minutes</span>
              <span className="pm-mini-pill">🎯 MCQ Format</span>
              <span className="pm-mini-pill">⚡ 4 Marks Each</span>
            </div>
            <div className="pm-tc-sections-preview">
              {["Signal Rules", "Track Handling", "Communication", "Safety Response", "Operational Judgement"].map(s => (
                <span key={s} className="pm-tc-section-chip">{s}</span>
              ))}
            </div>
            <button className="pm-start-btn" onClick={startTest}>
              <PlayCircle size={18} /> Start Assessment
            </button>
          </article>
        )}
      </div>
    </section>
  );

  /* ═══════════════════════════════════════
     RENDER: TEST ATTEMPT
  ═══════════════════════════════════════ */
  const renderAttemptPage = () => {
    if (!activeTest) return renderCurrentTestsPage();
    const question = testQuestions[currentQuestion];

    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Test Attempt</h2>
          <button className="pm-link-btn" onClick={() => setScreenMode("default")}>← Exit</button>
        </div>

        <div className="pm-attempt-meta">
          <strong>{activeTest.name} — {activeTest.period}</strong>
          <span>Q {currentQuestion + 1} of 25 &nbsp;|&nbsp; {answeredCount} Answered</span>
        </div>

        <div className="pm-progress-track" aria-label="progress">
          <div className="pm-progress-fill" style={{ width: `${completionRate}%` }} />
        </div>

        <div className="pm-question-card">
          <p className="pm-q-number">Question {currentQuestion + 1}</p>
          <h3>{question.text}</h3>
          <div className="pm-options-list">
            {question.options.map((opt, oi) => {
              const checked = responses[currentQuestion] === oi;
              return (
                <label key={oi} className={`pm-option ${checked ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={checked}
                    onChange={() => handleSelectOption(oi)}
                  />
                  <span className="pm-opt-letter">{["A", "B", "C", "D"][oi]}</span>
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Question navigator */}
        <div className="pm-question-panel">
          {testQuestions.map((item, index) => {
            const isCurrent = index === currentQuestion;
            const isAnswered = responses[index] !== null;
            return (
              <button
                key={item.id}
                className={`pm-question-pill ${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {item.id}
              </button>
            );
          })}
        </div>

        <div className="pm-attempt-actions">
          <button
            className="pm-secondary-btn"
            onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={15} /> Prev
          </button>
          <button className="pm-secondary-btn" onClick={saveCurrentResponse}>
            <CheckCircle2 size={15} /> Save
          </button>
          <button
            className="pm-secondary-btn"
            onClick={() => setCurrentQuestion(p => Math.min(24, p + 1))}
            disabled={currentQuestion === 24}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>

        <div className="pm-submit-row">
          <button className="pm-primary-btn" onClick={submitTest}>
            Submit Assessment
          </button>
          <p className="pm-submit-note">
            {25 - answeredCount > 0 ? `${25 - answeredCount} question(s) unanswered — unanswered = 0 marks.` : "All questions answered. Ready to submit!"}
          </p>
        </div>
      </section>
    );
  };

  /* ─── Content dispatcher ─── */
  const renderBodyContent = () => {
    if (screenMode === "scorecard") return renderScorecardPage();
    if (screenMode === "attempt") return renderAttemptPage();
    if (activeNav === "profile") return renderProfilePage();
    if (activeNav === "history") return renderHistoryPage();
    return renderCurrentTestsPage();
  };

  /* ═══════════════════════════════════════
     SHELL LAYOUT
  ═══════════════════════════════════════ */
  return (
    <div className="pm-layout">
      <header className="pm-topbar">
        <div className="pm-topbar-brand">
          <div className="pm-topbar-logo">IR</div>
          <div>
            <h1>Indian Railway Evaluation System</h1>
            <p>Pointsman Module</p>
          </div>
        </div>
        <div className="pm-user-strip">
          <div className="pm-user-avatar">{fullName.charAt(0)}</div>
          <div>
            <strong>{fullName}</strong>
            <span>{employeeId}</span>
          </div>
          <button className="pm-logout-btn" onClick={onLogout}>
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
                onClick={() => goToNavPage(item.key)}
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
              <p className="pm-hero-eyebrow">Pointsman Workspace</p>
              <h2 className="pm-main-title">{currentViewLabel}</h2>
            </div>
            <div className="pm-header-kpis">
              <div className="pm-hkpi">
                <Award size={14} />
                <span>{history.length} Tests</span>
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
    </div>
  );
}

export default PointsmanModule;
