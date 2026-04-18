import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileBarChart2,
  Filter,
  LogOut,
  PlayCircle,
  Search,
  ShieldCheck,
  UserCircle2,
  Users,
  Building2,
  Gauge,
  CalendarClock
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "profile", label: "Profile", icon: UserCircle2 },
  { key: "stations", label: "Stations & Station Masters", icon: Building2 },
  { key: "reviewPointsman", label: "Review Pointsman Assessments", icon: ClipboardCheck },
  { key: "assessSM", label: "Assess Station Masters", icon: Users },
  { key: "history", label: "My Test History", icon: CalendarClock },
  { key: "reports", label: "Reports", icon: FileBarChart2 },
  { key: "currentTest", label: "Current Test", icon: ShieldCheck }
];

const tiProfile = {
  name: "R. Khan",
  employeeId: "TI_1001",
  contact: "+91 98900 12211",
  designation: "Traffic Inspector",
  jurisdiction: "TI PAR / TI AMLA",
  reportingOfficer: "AOM/GM_1001"
};

const stationHierarchy = [
  {
    id: "ST01",
    stationName: "Parbhani Junction",
    stationCode: "PBN",
    stationMasters: [
      { id: "SM_2101", name: "S. Deshmukh", designation: "Station Master", category: "A" },
      { id: "SM_2102", name: "A. Kulkarni", designation: "Station Master", category: "B" }
    ]
  },
  {
    id: "ST02",
    stationName: "Amla Station",
    stationCode: "AMLA",
    stationMasters: [
      { id: "SM_2201", name: "M. Patil", designation: "Station Master", category: "A" },
      { id: "SM_2202", name: "R. Sharma", designation: "Station Master", category: "C" }
    ]
  },
  {
    id: "ST03",
    stationName: "Badnera Junction",
    stationCode: "BD",
    stationMasters: [
      { id: "SM_2301", name: "V. Singh", designation: "Station Master", category: "A" }
    ]
  }
];

const initialPointsmanAssessments = [
  {
    id: "PA_1001",
    pointsmanName: "K. Pawar",
    employeeId: "PM_1001",
    assessingSM: "S. Deshmukh",
    station: "Parbhani Junction",
    submissionDate: "2026-04-10",
    status: "Pending",
    mcqScore: 20,
    profileSummary: "Pointsman with 4 years of field experience in signal and track operations.",
    sections: [
      { title: "Knowledge of Rules", score: 22, max: 25 },
      { title: "Alertness & Observation", score: 21, max: 25 },
      { title: "Safety Record", score: 14, max: 15 },
      { title: "Leadership & Management", score: 13, max: 15 },
      { title: "Discipline", score: 8, max: 10 },
      { title: "Appearance & Neatness", score: 8, max: 10 }
    ]
  },
  {
    id: "PA_1002",
    pointsmanName: "R. Verma",
    employeeId: "PM_1002",
    assessingSM: "M. Patil",
    station: "Amla Station",
    submissionDate: "2026-04-09",
    status: "Pending",
    mcqScore: 18,
    profileSummary: "Pointsman handling night-shift route transitions and emergency communication.",
    sections: [
      { title: "Knowledge of Rules", score: 20, max: 25 },
      { title: "Alertness & Observation", score: 19, max: 25 },
      { title: "Safety Record", score: 12, max: 15 },
      { title: "Leadership & Management", score: 11, max: 15 },
      { title: "Discipline", score: 8, max: 10 },
      { title: "Appearance & Neatness", score: 8, max: 10 }
    ]
  },
  {
    id: "PA_1003",
    pointsmanName: "J. Shaikh",
    employeeId: "PM_1003",
    assessingSM: "V. Singh",
    station: "Badnera Junction",
    submissionDate: "2026-04-04",
    status: "Approved",
    mcqScore: 22,
    profileSummary: "Pointsman assigned to platform movement supervision and incident reporting.",
    sections: [
      { title: "Knowledge of Rules", score: 23, max: 25 },
      { title: "Alertness & Observation", score: 22, max: 25 },
      { title: "Safety Record", score: 15, max: 15 },
      { title: "Leadership & Management", score: 13, max: 15 },
      { title: "Discipline", score: 9, max: 10 },
      { title: "Appearance & Neatness", score: 9, max: 10 }
    ]
  }
];

const smAssessmentCriteria = [
  { key: "alertness", label: "Alertness & Observation", marksPerYes: 5, rows: 5 },
  { key: "safety", label: "Safety Record", marksPerYes: 3, rows: 5 },
  { key: "leadership", label: "Leadership & Management", marksPerYes: 3, rows: 5 },
  { key: "discipline", label: "Discipline", marksPerYes: 2, rows: 5 },
  { key: "appearance", label: "Appearance & Neatness", marksPerYes: 2, rows: 5 }
];

const defaultSmAssessmentForm = {
  alertness: Array(5).fill(null),
  safety: Array(5).fill(null),
  leadership: Array(5).fill(null),
  discipline: Array(5).fill(null),
  appearance: Array(5).fill(null),
  alcoholicStatus: ""
};

const initialSmAssessments = [
  {
    id: "SMA_5001",
    name: "S. Deshmukh",
    employeeId: "SM_2101",
    station: "Parbhani Junction",
    lastAssessmentDate: "2026-03-20",
    status: "Not Started"
  },
  {
    id: "SMA_5002",
    name: "M. Patil",
    employeeId: "SM_2201",
    station: "Amla Station",
    lastAssessmentDate: "2026-03-12",
    status: "Not Started"
  },
  {
    id: "SMA_5003",
    name: "V. Singh",
    employeeId: "SM_2301",
    station: "Badnera Junction",
    lastAssessmentDate: "2026-03-15",
    status: "Pending AOM Approval"
  }
];

const initialTestHistory = [
  {
    id: "TIH_1",
    testDate: "2026-03-14",
    testName: "Multi-Station Operations Test",
    testType: "Operations",
    score: 86,
    assessmentPeriod: "Quarter 1 - 2026",
    sections: [
      { title: "Rule Application", marks: 18, outOf: 20 },
      { title: "Field Monitoring", marks: 17, outOf: 20 },
      { title: "Safety Protocol", marks: 18, outOf: 20 },
      { title: "Coordination", marks: 16, outOf: 20 },
      { title: "Reporting", marks: 17, outOf: 20 }
    ]
  },
  {
    id: "TIH_2",
    testDate: "2026-02-11",
    testName: "Assessment Governance Drill",
    testType: "Governance",
    score: 79,
    assessmentPeriod: "Quarter 1 - 2026",
    sections: [
      { title: "Rules", marks: 15, outOf: 20 },
      { title: "Quality Review", marks: 16, outOf: 20 },
      { title: "Documentation", marks: 17, outOf: 20 },
      { title: "Scoring", marks: 14, outOf: 20 },
      { title: "Escalation", marks: 17, outOf: 20 }
    ]
  }
];

const currentTestsSeed = [
  { id: "TIC_101", testName: "Current Safety Control Test", category: "Safety", period: "April 2026" },
  { id: "TIC_102", testName: "Station Coordination Live Test", category: "Operations", period: "April 2026" }
];

const reportSeed = [
  { id: "R1", role: "Pointsman", name: "K. Pawar", station: "Parbhani Junction", stationMaster: "S. Deshmukh", category: "A", score: 86, date: "2026-04-10", status: "Approved" },
  { id: "R2", role: "Station Master", name: "M. Patil", station: "Amla Station", stationMaster: "M. Patil", category: "A", score: 82, date: "2026-04-08", status: "Pending AOM" },
  { id: "R3", role: "Pointsman", name: "R. Verma", station: "Amla Station", stationMaster: "M. Patil", category: "B", score: 78, date: "2026-04-09", status: "Approved" },
  { id: "R4", role: "Station Master", name: "V. Singh", station: "Badnera Junction", stationMaster: "V. Singh", category: "A", score: 88, date: "2026-04-07", status: "Pending AOM" }
];

const testQuestions = Array.from({ length: 25 }, (_, idx) => ({
  id: idx + 1,
  question: `Question ${idx + 1}: Select the best operational response for the given rail-safety scenario.`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: (idx + 1) % 4
}));

function calculateSmScore(form) {
  const sectionScore = (values, weight) => values.reduce((sum, item) => (item === "Yes" ? sum + weight : sum), 0);
  return (
    sectionScore(form.alertness, 5) +
    sectionScore(form.safety, 3) +
    sectionScore(form.leadership, 3) +
    sectionScore(form.discipline, 2) +
    sectionScore(form.appearance, 2)
  );
}

function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  return "D";
}

function normalizeScorecard(record) {
  if (!record) return null;
  if (record.sections && record.assessmentPeriod) {
    return {
      title: record.testName || record.name || "Scorecard",
      subtitle: record.employeeId || record.station || "",
      total: record.score,
      outOf: 100,
      assessmentPeriod: record.assessmentPeriod,
      sections: record.sections
    };
  }
  return null;
}

function TrafficInspectorModule({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [statusMessage, setStatusMessage] = useState("");

  const [expandedStations, setExpandedStations] = useState({});
  const [selectedSmProfile, setSelectedSmProfile] = useState(null);

  const [pointsmanAssessments, setPointsmanAssessments] = useState(initialPointsmanAssessments);
  const [reviewTab, setReviewTab] = useState("Pending");
  const [reviewFilters, setReviewFilters] = useState({ station: "All", smName: "All", status: "All", date: "" });
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [editingSectionScores, setEditingSectionScores] = useState({});

  const [smAssessments, setSmAssessments] = useState(initialSmAssessments);
  const [activeSmAssessmentId, setActiveSmAssessmentId] = useState(null);
  const [smAssessmentForms, setSmAssessmentForms] = useState({});
  const [lockedSmAssessments, setLockedSmAssessments] = useState({});

  const [testHistory, setTestHistory] = useState(initialTestHistory);
  const [testHistorySearch, setTestHistorySearch] = useState("");
  const [testHistoryFilter, setTestHistoryFilter] = useState("All");

  const [reportFilters, setReportFilters] = useState({
    station: "All",
    stationMaster: "All",
    pointsman: "",
    startDate: "",
    endDate: "",
    category: "All"
  });

  const [currentTests, setCurrentTests] = useState(currentTestsSeed);
  const [activeTest, setActiveTest] = useState(null);
  const [testResponses, setTestResponses] = useState(Array(25).fill(null));
  const [savedResponses, setSavedResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [scorecardRecord, setScorecardRecord] = useState(null);

  const fullName = user?.name || tiProfile.name;
  const employeeId = user?.hrmsId || tiProfile.employeeId;

  const totalStations = stationHierarchy.length;
  const totalStationMasters = stationHierarchy.reduce((sum, station) => sum + station.stationMasters.length, 0);
  const totalPointsmen = pointsmanAssessments.length + 5;
  const pendingPointsmanApprovals = pointsmanAssessments.filter((item) => item.status === "Pending").length;
  const pendingSmAssessments = smAssessments.filter((item) => item.status !== "Pending AOM Approval").length;

  const stationOptions = useMemo(() => ["All", ...Array.from(new Set(stationHierarchy.map((row) => row.stationName)))], []);
  const smOptions = useMemo(
    () => ["All", ...Array.from(new Set(stationHierarchy.flatMap((station) => station.stationMasters.map((sm) => sm.name))))],
    []
  );

  const filteredPointsmanAssessments = useMemo(() => {
    return pointsmanAssessments.filter((row) => {
      const matchesTab = row.status === reviewTab;
      const matchStation = reviewFilters.station === "All" || row.station === reviewFilters.station;
      const matchSm = reviewFilters.smName === "All" || row.assessingSM === reviewFilters.smName;
      const matchStatus = reviewFilters.status === "All" || row.status === reviewFilters.status;
      const matchDate = reviewFilters.date.trim().length === 0 || row.submissionDate.includes(reviewFilters.date.trim());
      return matchesTab && matchStation && matchSm && matchStatus && matchDate;
    });
  }, [pointsmanAssessments, reviewTab, reviewFilters]);

  const selectedAssessment = useMemo(
    () => pointsmanAssessments.find((row) => row.id === selectedAssessmentId) || null,
    [pointsmanAssessments, selectedAssessmentId]
  );

  const editableSections = selectedAssessment
    ? editingSectionScores[selectedAssessment.id] || selectedAssessment.sections
    : [];

  const smAssessmentTarget = smAssessments.find((row) => row.id === activeSmAssessmentId) || null;
  const smForm = smAssessmentTarget
    ? smAssessmentForms[smAssessmentTarget.id] || { ...defaultSmAssessmentForm }
    : { ...defaultSmAssessmentForm };
  const smLiveScore = calculateSmScore(smForm);

  const testTypeOptions = useMemo(() => ["All", ...Array.from(new Set(testHistory.map((row) => row.testType)))], [testHistory]);

  const filteredTestHistory = useMemo(() => {
    return testHistory.filter((row) => {
      const matchSearch =
        testHistorySearch.trim().length === 0 ||
        row.testDate.includes(testHistorySearch.trim()) ||
        row.testName.toLowerCase().includes(testHistorySearch.trim().toLowerCase());
      const matchFilter = testHistoryFilter === "All" || row.testType === testHistoryFilter;
      return matchSearch && matchFilter;
    });
  }, [testHistory, testHistorySearch, testHistoryFilter]);

  const filteredReportRows = useMemo(() => {
    return reportSeed.filter((row) => {
      const matchStation = reportFilters.station === "All" || row.station === reportFilters.station;
      const matchSm = reportFilters.stationMaster === "All" || row.stationMaster === reportFilters.stationMaster;
      const matchPointsman =
        reportFilters.pointsman.trim().length === 0 || row.name.toLowerCase().includes(reportFilters.pointsman.trim().toLowerCase());
      const matchCategory = reportFilters.category === "All" || row.category === reportFilters.category;
      const matchStart = reportFilters.startDate === "" || row.date >= reportFilters.startDate;
      const matchEnd = reportFilters.endDate === "" || row.date <= reportFilters.endDate;
      return matchStation && matchSm && matchPointsman && matchCategory && matchStart && matchEnd;
    });
  }, [reportFilters]);

  const reportSummary = useMemo(() => {
    const count = filteredReportRows.length;
    const avgScore = count === 0 ? 0 : Math.round(filteredReportRows.reduce((sum, row) => sum + row.score, 0) / count);
    const approved = filteredReportRows.filter((row) => row.status === "Approved").length;
    const approvalRate = count === 0 ? 0 : Math.round((approved / count) * 100);
    return { avgScore, count, approvalRate };
  }, [filteredReportRows]);

  const currentQuestion = activeTest ? testQuestions[currentQuestionIndex] : null;

  const goToPage = (key) => {
    setActivePage(key);
    setStatusMessage("");
    if (key !== "reviewPointsman") {
      setSelectedAssessmentId(null);
    }
    if (key !== "assessSM") {
      setActiveSmAssessmentId(null);
    }
    if (key !== "currentTest") {
      setActiveTest(null);
      setCurrentQuestionIndex(0);
      setTestResponses(Array(25).fill(null));
      setSavedResponses({});
    }
  };

  const toggleStation = (stationId) => {
    setExpandedStations((prev) => ({
      ...prev,
      [stationId]: !prev[stationId]
    }));
  };

  const openSmProfile = (sm, stationName) => {
    setSelectedSmProfile({ ...sm, stationName });
  };

  const openAssessmentReview = (assessmentId) => {
    const record = pointsmanAssessments.find((item) => item.id === assessmentId);
    if (!record) return;
    setSelectedAssessmentId(assessmentId);
    setEditingSectionScores((prev) => ({
      ...prev,
      [assessmentId]: record.sections.map((section) => ({ ...section }))
    }));
  };

  const updateSectionScore = (assessmentId, sectionIndex, value) => {
    setEditingSectionScores((prev) => {
      const sections = prev[assessmentId] ? [...prev[assessmentId]] : [];
      if (!sections[sectionIndex]) return prev;
      const numeric = Number(value);
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        score: Number.isNaN(numeric)
          ? sections[sectionIndex].score
          : Math.max(0, Math.min(sections[sectionIndex].max, numeric))
      };
      return { ...prev, [assessmentId]: sections };
    });
  };

  const finalizeAssessment = (assessmentId, mode) => {
    setPointsmanAssessments((prev) =>
      prev.map((row) => {
        if (row.id !== assessmentId) return row;
        const sections = editingSectionScores[assessmentId] || row.sections;
        const total = sections.reduce((sum, section) => sum + section.score, 0);
        const normalized = Math.round((total / 100) * 100);
        return {
          ...row,
          sections,
          status: "Approved",
          finalScore: normalized,
          approvalMode: mode
        };
      })
    );

    setStatusMessage(
      mode === "approve"
        ? "Assessment approved with SM marks as final."
        : "Assessment modified and saved as final official marks."
    );
    setReviewTab("Approved");
    setSelectedAssessmentId(null);
  };

  const openSmAssessmentForm = (smId) => {
    setActiveSmAssessmentId(smId);
    setSmAssessmentForms((prev) => ({
      ...prev,
      [smId]: prev[smId] || { ...defaultSmAssessmentForm }
    }));
  };

  const updateSmYesNo = (smId, keyName, index, value) => {
    if (lockedSmAssessments[smId]) return;
    setSmAssessmentForms((prev) => {
      const current = prev[smId] || { ...defaultSmAssessmentForm };
      const nextSection = [...(current[keyName] || Array(5).fill(null))];
      nextSection[index] = value;
      return {
        ...prev,
        [smId]: {
          ...current,
          [keyName]: nextSection
        }
      };
    });
  };

  const updateSmAlcoholicStatus = (smId, value) => {
    if (lockedSmAssessments[smId]) return;
    setSmAssessmentForms((prev) => ({
      ...prev,
      [smId]: {
        ...(prev[smId] || { ...defaultSmAssessmentForm }),
        alcoholicStatus: value
      }
    }));
  };

  const submitSmAssessment = (smId) => {
    const form = smAssessmentForms[smId] || { ...defaultSmAssessmentForm };
    if (!form.alcoholicStatus) {
      setStatusMessage("Alcoholic / Non-Alcoholic is mandatory.");
      return;
    }

    setLockedSmAssessments((prev) => ({ ...prev, [smId]: true }));
    setSmAssessments((prev) =>
      prev.map((row) =>
        row.id === smId
          ? {
              ...row,
              status: "Pending AOM Approval",
              lastAssessmentDate: new Date().toISOString().slice(0, 10)
            }
          : row
      )
    );
    setStatusMessage("SM assessment submitted and locked. Status set to Pending AOM Approval.");
  };

  const openHistoryScorecard = (record) => {
    setScorecardRecord(normalizeScorecard(record));
  };

  const openReportScorecard = (record) => {
    setScorecardRecord({
      title: `${record.role} Performance Report`,
      subtitle: `${record.name} | ${record.station}`,
      total: record.score,
      outOf: 100,
      assessmentPeriod: "April 2026",
      sections: [
        { title: "Knowledge of Rules", marks: Math.round(record.score * 0.25), outOf: 25 },
        { title: "Alertness & Observation", marks: Math.round(record.score * 0.25), outOf: 25 },
        { title: "Safety Record", marks: Math.round(record.score * 0.15), outOf: 15 },
        { title: "Leadership & Management", marks: Math.round(record.score * 0.15), outOf: 15 },
        { title: "Discipline", marks: Math.round(record.score * 0.1), outOf: 10 },
        { title: "Appearance & Neatness", marks: Math.round(record.score * 0.1), outOf: 10 }
      ]
    });
  };

  const startCurrentTest = (testItem) => {
    setActiveTest(testItem);
    setCurrentQuestionIndex(0);
    setTestResponses(Array(25).fill(null));
    setSavedResponses({});
    setStatusMessage("");
  };

  const saveResponse = () => {
    if (!activeTest) return;
    if (testResponses[currentQuestionIndex] === null) {
      setStatusMessage("Select an option first, then save response.");
      return;
    }
    setSavedResponses((prev) => ({ ...prev, [currentQuestionIndex]: true }));
    setStatusMessage(`Response for Question ${currentQuestionIndex + 1} saved.`);
  };

  const submitCurrentTest = () => {
    if (!activeTest) return;

    let correct = 0;
    testResponses.forEach((ans, index) => {
      if (ans === testQuestions[index].answer) {
        correct += 1;
      }
    });

    const totalScore = correct * 4;
    const resultRecord = {
      id: `TIH_${Date.now()}`,
      testDate: new Date().toISOString().slice(0, 10),
      testName: activeTest.testName,
      testType: activeTest.category,
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

    setTestHistory((prev) => [resultRecord, ...prev]);
    setCurrentTests((prev) => prev.filter((test) => test.id !== activeTest.id));
    setStatusMessage(`Test submitted. Final score: ${totalScore}/100.`);
    setActiveTest(null);
    setActivePage("history");
    setScorecardRecord(normalizeScorecard(resultRecord));
  };

  const renderScorecard = () => {
    if (!scorecardRecord) return null;

    return (
      <section className="tim-panel-card">
        <div className="tim-page-header">
          <h2>Scorecard</h2>
          <button type="button" className="tim-link-btn" onClick={() => setScorecardRecord(null)}>
            Back
          </button>
        </div>

        <div className="tim-score-meta-grid">
          <article>
            <label>Title</label>
            <strong>{scorecardRecord.title}</strong>
          </article>
          <article>
            <label>Context</label>
            <strong>{scorecardRecord.subtitle || "N/A"}</strong>
          </article>
          <article>
            <label>Assessment Period</label>
            <strong>{scorecardRecord.assessmentPeriod}</strong>
          </article>
          <article>
            <label>Total Score</label>
            <strong>
              {scorecardRecord.total}/{scorecardRecord.outOf}
            </strong>
          </article>
        </div>

        <div className="tim-score-table">
          <div className="tim-score-row tim-score-head">
            <div>Section</div>
            <div>Marks</div>
          </div>
          {scorecardRecord.sections.map((section) => (
            <div key={section.title} className="tim-score-row">
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

  const renderDashboard = () => {
    return (
      <>
        <div className="tim-page-header">
          <h2>Traffic Inspector Dashboard</h2>
          <span className="tim-view-only">Supervisory Overview</span>
        </div>

        <div className="tim-stats-grid">
          <article className="tim-stat-card">
            <Building2 size={18} />
            <label>Total Stations</label>
            <strong>{totalStations}</strong>
          </article>
          <article className="tim-stat-card">
            <Users size={18} />
            <label>Total Station Masters</label>
            <strong>{totalStationMasters}</strong>
          </article>
          <article className="tim-stat-card">
            <Gauge size={18} />
            <label>Total Pointsmen</label>
            <strong>{totalPointsmen}</strong>
          </article>
          <article className="tim-stat-card">
            <ClipboardCheck size={18} />
            <label>Pending Pointsman Approvals</label>
            <strong>{pendingPointsmanApprovals}</strong>
          </article>
          <article className="tim-stat-card">
            <CalendarClock size={18} />
            <label>Pending SM Assessments</label>
            <strong>{pendingSmAssessments}</strong>
          </article>
        </div>

        <section className="tim-panel-card">
          <div className="tim-page-header">
            <h3>Recent Activity</h3>
          </div>
          <ul className="tim-activity-list">
            <li>Assessment PM_1001 submitted by SM_2101 and pending TI approval.</li>
            <li>SM_2301 assessment moved to Pending AOM Approval.</li>
            <li>Current test window open for April 2026 batch.</li>
          </ul>
        </section>
      </>
    );
  };

  const renderProfile = () => {
    return (
      <section className="tim-panel-card">
        <div className="tim-page-header">
          <h2>Profile</h2>
          <span className="tim-view-only">View Only</span>
        </div>

        <div className="tim-profile-grid">
          <article>
            <label>Name</label>
            <strong>{fullName}</strong>
          </article>
          <article>
            <label>Employee ID (HRMS ID)</label>
            <strong>{employeeId}</strong>
          </article>
          <article>
            <label>Contact Info</label>
            <strong>{tiProfile.contact}</strong>
          </article>
          <article>
            <label>Designation</label>
            <strong>{tiProfile.designation}</strong>
          </article>
          <article>
            <label>Jurisdiction / Area</label>
            <strong>{tiProfile.jurisdiction}</strong>
          </article>
          <article>
            <label>Reporting Officer</label>
            <strong>{tiProfile.reportingOfficer}</strong>
          </article>
        </div>
      </section>
    );
  };

  const renderStations = () => {
    return (
      <>
        <div className="tim-page-header">
          <h2>Stations & Station Masters</h2>
        </div>

        <div className="tim-station-grid">
          {stationHierarchy.map((station) => {
            const expanded = !!expandedStations[station.id];
            return (
              <section key={station.id} className="tim-panel-card tim-station-card">
                <div className="tim-station-head">
                  <div>
                    <h3>
                      {station.stationName} ({station.stationCode})
                    </h3>
                    <p>Station Masters: {station.stationMasters.length}</p>
                  </div>
                  <button type="button" className="tim-link-btn" onClick={() => toggleStation(station.id)}>
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />} {expanded ? "Hide" : "View"}
                  </button>
                </div>

                {expanded && (
                  <div className="tim-table">
                    <div className="tim-table-row tim-table-head">
                      <div>Name</div>
                      <div>Employee ID</div>
                      <div>Designation</div>
                      <div>Category</div>
                      <div>Action</div>
                    </div>
                    {station.stationMasters.map((sm) => (
                      <div key={sm.id} className="tim-table-row">
                        <div>{sm.name}</div>
                        <div>{sm.id}</div>
                        <div>{sm.designation}</div>
                        <div>{sm.category}</div>
                        <div>
                          <button type="button" className="tim-link-btn" onClick={() => openSmProfile(sm, station.stationName)}>
                            Open Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {selectedSmProfile && (
          <div className="tim-modal-overlay" onClick={() => setSelectedSmProfile(null)}>
            <div className="tim-modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="tim-page-header">
                <h3>Station Master Profile</h3>
                <button type="button" className="tim-link-btn" onClick={() => setSelectedSmProfile(null)}>
                  Close
                </button>
              </div>
              <div className="tim-profile-grid">
                <article>
                  <label>Name</label>
                  <strong>{selectedSmProfile.name}</strong>
                </article>
                <article>
                  <label>Employee ID</label>
                  <strong>{selectedSmProfile.id}</strong>
                </article>
                <article>
                  <label>Designation</label>
                  <strong>{selectedSmProfile.designation}</strong>
                </article>
                <article>
                  <label>Category</label>
                  <strong>{selectedSmProfile.category}</strong>
                </article>
                <article>
                  <label>Station</label>
                  <strong>{selectedSmProfile.stationName}</strong>
                </article>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderReviewPointsman = () => {
    if (selectedAssessment) {
      const isReviewLocked = selectedAssessment.status === "Approved";
      const totalSectionScore = editableSections.reduce((sum, section) => sum + Number(section.score || 0), 0);
      const totalScore = totalSectionScore + selectedAssessment.mcqScore;

      return (
        <>
          <div className="tim-page-header">
            <h2>Assessment Review - {selectedAssessment.pointsmanName}</h2>
            <button type="button" className="tim-link-btn" onClick={() => setSelectedAssessmentId(null)}>
              Back
            </button>
          </div>

          <section className="tim-panel-card">
            <div className="tim-profile-grid">
              <article>
                <label>Pointsman</label>
                <strong>{selectedAssessment.pointsmanName}</strong>
              </article>
              <article>
                <label>Employee ID</label>
                <strong>{selectedAssessment.employeeId}</strong>
              </article>
              <article>
                <label>Assessing SM</label>
                <strong>{selectedAssessment.assessingSM}</strong>
              </article>
              <article>
                <label>Station</label>
                <strong>{selectedAssessment.station}</strong>
              </article>
              <article>
                <label>Submission Date</label>
                <strong>{selectedAssessment.submissionDate}</strong>
              </article>
              <article>
                <label>Status</label>
                <strong>{selectedAssessment.status}</strong>
              </article>
            </div>
            <p className="tim-note-text">{selectedAssessment.profileSummary}</p>
          </section>

          <section className="tim-panel-card">
            <div className="tim-page-header">
              <h3>Section Scores</h3>
              <span className="tim-view-only">MCQ Score: {selectedAssessment.mcqScore}/25</span>
            </div>

            <div className="tim-table">
              <div className="tim-table-row tim-table-head">
                <div>Section</div>
                <div>Score</div>
                <div>Max</div>
                <div>Edit</div>
              </div>
              {editableSections.map((section, index) => (
                <div key={section.title} className="tim-table-row">
                  <div>{section.title}</div>
                  <div>{section.score}</div>
                  <div>{section.max}</div>
                  <div>
                    <input
                      className="tim-mini-input"
                      type="number"
                      min="0"
                      max={section.max}
                      value={section.score}
                      disabled={isReviewLocked}
                      onChange={(event) => updateSectionScore(selectedAssessment.id, index, event.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <section className="tim-live-score-bar">
              <div>
                <label>Live Total (including MCQ)</label>
                <strong>{totalScore}/100</strong>
              </div>
              {isReviewLocked ? (
                <span className="tim-view-only">Locked after approval</span>
              ) : (
                <div className="tim-inline-actions">
                  <button type="button" className="tim-primary-btn" onClick={() => finalizeAssessment(selectedAssessment.id, "approve")}>
                    Approve
                  </button>
                  <button type="button" className="tim-secondary-btn" onClick={() => finalizeAssessment(selectedAssessment.id, "modify")}>
                    Modify & Save
                  </button>
                </div>
              )}
            </section>
          </section>
        </>
      );
    }

    return (
      <>
        <div className="tim-page-header">
          <h2>Review Pointsman Assessments</h2>
        </div>

        <section className="tim-panel-card">
          <div className="tim-tab-row">
            <button
              type="button"
              className={`tim-tab-btn ${reviewTab === "Pending" ? "active" : ""}`}
              onClick={() => setReviewTab("Pending")}
            >
              Pending
            </button>
            <button
              type="button"
              className={`tim-tab-btn ${reviewTab === "Approved" ? "active" : ""}`}
              onClick={() => setReviewTab("Approved")}
            >
              Approved
            </button>
          </div>

          <div className="tim-form-grid">
            <div className="tim-form-field">
              <label>Station</label>
              <select
                value={reviewFilters.station}
                onChange={(event) => setReviewFilters((prev) => ({ ...prev, station: event.target.value }))}
              >
                {stationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="tim-form-field">
              <label>SM Name</label>
              <select
                value={reviewFilters.smName}
                onChange={(event) => setReviewFilters((prev) => ({ ...prev, smName: event.target.value }))}
              >
                {smOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="tim-form-field">
              <label>Status</label>
              <select
                value={reviewFilters.status}
                onChange={(event) => setReviewFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option>All</option>
                <option>Pending</option>
                <option>Approved</option>
              </select>
            </div>
            <div className="tim-form-field">
              <label>Date</label>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={reviewFilters.date}
                onChange={(event) => setReviewFilters((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>
          </div>

          <div className="tim-table">
            <div className="tim-table-row tim-table-head">
              <div>Pointsman Name</div>
              <div>Employee ID</div>
              <div>Assessing SM</div>
              <div>Station</div>
              <div>Submission Date</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {filteredPointsmanAssessments.length === 0 ? (
              <div className="tim-empty-state">No records found.</div>
            ) : (
              filteredPointsmanAssessments.map((row) => (
                <div key={row.id} className="tim-table-row">
                  <div>{row.pointsmanName}</div>
                  <div>{row.employeeId}</div>
                  <div>{row.assessingSM}</div>
                  <div>{row.station}</div>
                  <div>{row.submissionDate}</div>
                  <div>
                    <span className={`tim-pill ${row.status === "Approved" ? "ok" : "pending"}`}>{row.status}</span>
                  </div>
                  <div>
                    <button type="button" className="tim-link-btn" onClick={() => openAssessmentReview(row.id)}>
                      Review
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

  const renderAssessSm = () => {
    if (smAssessmentTarget) {
      const locked = !!lockedSmAssessments[smAssessmentTarget.id];

      return (
        <>
          <div className="tim-page-header">
            <h2>Assess Station Master - {smAssessmentTarget.name}</h2>
            <button type="button" className="tim-link-btn" onClick={() => setActiveSmAssessmentId(null)}>
              Back
            </button>
          </div>

          <section className="tim-panel-card">
            <p className="tim-note-text">Evaluate and submit. After submission, form gets locked and status becomes Pending AOM Approval.</p>

            {smAssessmentCriteria.map((section) => (
              <article key={section.key} className="tim-yn-card">
                <h3>{section.label}</h3>
                <p>
                  {section.rows} questions | {section.marksPerYes} marks each
                </p>
                <div className="tim-yn-grid">
                  {Array.from({ length: section.rows }, (_, index) => (
                    <div key={`${section.key}-${index}`} className="tim-yn-row">
                      <span>Question {index + 1}</span>
                      <div>
                        <button
                          type="button"
                          className={smForm[section.key][index] === "Yes" ? "tim-chip-active" : "tim-chip"}
                          disabled={locked}
                          onClick={() => updateSmYesNo(smAssessmentTarget.id, section.key, index, "Yes")}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={smForm[section.key][index] === "No" ? "tim-chip-active" : "tim-chip"}
                          disabled={locked}
                          onClick={() => updateSmYesNo(smAssessmentTarget.id, section.key, index, "No")}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}

            <div className="tim-form-grid">
              <div className="tim-form-field">
                <label>Alcoholic / Non-Alcoholic (Mandatory)</label>
                <select
                  value={smForm.alcoholicStatus}
                  disabled={locked}
                  onChange={(event) => updateSmAlcoholicStatus(smAssessmentTarget.id, event.target.value)}
                >
                  <option value="">Select</option>
                  <option>Alcoholic</option>
                  <option>Non-Alcoholic</option>
                </select>
              </div>
            </div>

            <section className="tim-live-score-bar">
              <div>
                <label>Live Total Score</label>
                <strong>{smLiveScore}/75</strong>
              </div>
              <button type="button" className="tim-primary-btn" disabled={locked} onClick={() => submitSmAssessment(smAssessmentTarget.id)}>
                Submit
              </button>
            </section>
          </section>
        </>
      );
    }

    return (
      <>
        <div className="tim-page-header">
          <h2>Assess Station Masters</h2>
        </div>

        <section className="tim-panel-card">
          <div className="tim-table">
            <div className="tim-table-row tim-table-head">
              <div>Name</div>
              <div>Employee ID</div>
              <div>Station</div>
              <div>Last Assessment Date</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {smAssessments.map((row) => (
              <div key={row.id} className="tim-table-row">
                <div>{row.name}</div>
                <div>{row.employeeId}</div>
                <div>{row.station}</div>
                <div>{row.lastAssessmentDate}</div>
                <div>{row.status}</div>
                <div>
                  <button type="button" className="tim-link-btn" onClick={() => openSmAssessmentForm(row.id)}>
                    Open Form
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderHistory = () => {
    return (
      <>
        <div className="tim-page-header">
          <h2>My Test History</h2>
        </div>

        <section className="tim-panel-card">
          <div className="tim-toolbar-row">
            <div className="tim-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by date or test name"
                value={testHistorySearch}
                onChange={(event) => setTestHistorySearch(event.target.value)}
              />
            </div>
            <select value={testHistoryFilter} onChange={(event) => setTestHistoryFilter(event.target.value)}>
              {testTypeOptions.map((row) => (
                <option key={row} value={row}>
                  {row}
                </option>
              ))}
            </select>
          </div>

          <div className="tim-table">
            <div className="tim-table-row tim-table-head">
              <div>Test Date</div>
              <div>Test Name</div>
              <div>Score</div>
              <div>Action</div>
            </div>
            {filteredTestHistory.map((row) => (
              <div key={row.id} className="tim-table-row">
                <div>{row.testDate}</div>
                <div>{row.testName}</div>
                <div>{row.score}/100</div>
                <div>
                  <button type="button" className="tim-link-btn" onClick={() => openHistoryScorecard(row)}>
                    Open Scorecard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderReports = () => {
    return (
      <>
        <div className="tim-page-header">
          <h2>Reports</h2>
          <button type="button" className="tim-secondary-btn" onClick={() => setStatusMessage("Export generated (UI only).") }>
            Export
          </button>
        </div>

        <section className="tim-panel-card">
          <div className="tim-form-grid report-grid">
            <div className="tim-form-field">
              <label>Station</label>
              <select value={reportFilters.station} onChange={(event) => setReportFilters((prev) => ({ ...prev, station: event.target.value }))}>
                {stationOptions.map((row) => (
                  <option key={row} value={row}>
                    {row}
                  </option>
                ))}
              </select>
            </div>
            <div className="tim-form-field">
              <label>Station Master</label>
              <select
                value={reportFilters.stationMaster}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, stationMaster: event.target.value }))}
              >
                {smOptions.map((row) => (
                  <option key={row} value={row}>
                    {row}
                  </option>
                ))}
              </select>
            </div>
            <div className="tim-form-field">
              <label>Pointsman</label>
              <input
                value={reportFilters.pointsman}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, pointsman: event.target.value }))}
                placeholder="Search pointsman"
              />
            </div>
            <div className="tim-form-field">
              <label>Date Range Start</label>
              <input
                type="date"
                value={reportFilters.startDate}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </div>
            <div className="tim-form-field">
              <label>Date Range End</label>
              <input
                type="date"
                value={reportFilters.endDate}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </div>
            <div className="tim-form-field">
              <label>Category</label>
              <select value={reportFilters.category} onChange={(event) => setReportFilters((prev) => ({ ...prev, category: event.target.value }))}>
                <option>All</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>
          </div>
        </section>

        <div className="tim-stats-grid">
          <article className="tim-stat-card">
            <Gauge size={18} />
            <label>Avg Score</label>
            <strong>{reportSummary.avgScore}</strong>
          </article>
          <article className="tim-stat-card">
            <ClipboardList size={18} />
            <label>Total Assessments</label>
            <strong>{reportSummary.count}</strong>
          </article>
          <article className="tim-stat-card">
            <CheckCircle2 size={18} />
            <label>Approval Rate</label>
            <strong>{reportSummary.approvalRate}%</strong>
          </article>
        </div>

        <section className="tim-panel-card">
          <div className="tim-table">
            <div className="tim-table-row tim-table-head">
              <div>Role</div>
              <div>Name</div>
              <div>Station</div>
              <div>SM</div>
              <div>Score</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {filteredReportRows.map((row) => (
              <div key={row.id} className="tim-table-row">
                <div>{row.role}</div>
                <div>{row.name}</div>
                <div>{row.station}</div>
                <div>{row.stationMaster}</div>
                <div>{row.score}/100</div>
                <div>{row.status}</div>
                <div>
                  <button type="button" className="tim-link-btn" onClick={() => openReportScorecard(row)}>
                    View Detailed Report
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
    if (!activeTest) {
      return (
        <>
          <div className="tim-page-header">
            <h2>Current Tests</h2>
          </div>

          <section className="tim-panel-card">
            <div className="tim-table">
              <div className="tim-table-row tim-table-head">
                <div>Test Name</div>
                <div>Category</div>
                <div>Period</div>
                <div>Action</div>
              </div>
              {currentTests.length === 0 ? (
                <div className="tim-empty-state">No current tests available.</div>
              ) : (
                currentTests.map((row) => (
                  <div key={row.id} className="tim-table-row">
                    <div>{row.testName}</div>
                    <div>{row.category}</div>
                    <div>{row.period}</div>
                    <div>
                      <button type="button" className="tim-primary-btn" onClick={() => startCurrentTest(row)}>
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
    }

    const answeredCount = testResponses.filter((row) => row !== null).length;

    return (
      <>
        <div className="tim-page-header">
          <h2>Test Attempt - {activeTest.testName}</h2>
          <span className="tim-view-only">
            Question {currentQuestionIndex + 1}/25 | Answered {answeredCount}
          </span>
        </div>

        <section className="tim-panel-card">
          <div className="tim-question-card">
            <h3>{currentQuestion?.question}</h3>
            <div className="tim-option-grid">
              {currentQuestion?.options.map((option, optionIndex) => (
                <button
                  key={option}
                  type="button"
                  className={testResponses[currentQuestionIndex] === optionIndex ? "tim-option-btn active" : "tim-option-btn"}
                  onClick={() =>
                    setTestResponses((prev) => {
                      const next = [...prev];
                      next[currentQuestionIndex] = optionIndex;
                      return next;
                    })
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="tim-attempt-actions">
            <button type="button" className="tim-secondary-btn" onClick={saveResponse}>
              Save Response
            </button>
            <div className="tim-inline-actions">
              <button
                type="button"
                className="tim-link-btn"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="tim-link-btn"
                disabled={currentQuestionIndex === 24}
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(24, prev + 1))}
              >
                Next
              </button>
            </div>
            <button type="button" className="tim-primary-btn" onClick={submitCurrentTest}>
              Submit Test
            </button>
          </div>

          <p className="tim-note-text">Saved responses: {Object.keys(savedResponses).length}</p>
        </section>
      </>
    );
  };

  const renderBody = () => {
    if (scorecardRecord) {
      return renderScorecard();
    }

    switch (activePage) {
      case "dashboard":
        return renderDashboard();
      case "profile":
        return renderProfile();
      case "stations":
        return renderStations();
      case "reviewPointsman":
        return renderReviewPointsman();
      case "assessSM":
        return renderAssessSm();
      case "history":
        return renderHistory();
      case "reports":
        return renderReports();
      case "currentTest":
        return renderCurrentTest();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-shell tim-module-shell">
      <header className="topbar">
        <div className="brand-group">
          <div className="brand-mark">IR</div>
          <h1>Indian Railway Evaluation System</h1>
        </div>
        <div className="topbar-right">
          <div className="admin-badge">
            <div className="avatar">{employeeId.substring(0, 2)}</div>
            <div>
              <strong>Traffic Inspector Console</strong>
              <span>{fullName}</span>
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
            const active = activePage === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-item ${active ? "active" : ""}`}
                onClick={() => goToPage(item.key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="main-content tim-main-content">
          <section className="tim-hero-band">
            <div>
              <p className="tim-eyebrow">Traffic Inspector Workspace</p>
              <h2>{navItems.find((row) => row.key === activePage)?.label || "Dashboard"}</h2>
              <span>Multi-station monitoring, approvals, assessments, analytics, and test operations.</span>
            </div>
            <div className="tim-kpi-chip-row">
              <article>
                <label>Stations</label>
                <strong>{totalStations}</strong>
              </article>
              <article>
                <label>Pending PM</label>
                <strong>{pendingPointsmanApprovals}</strong>
              </article>
              <article>
                <label>SM Pending</label>
                <strong>{pendingSmAssessments}</strong>
              </article>
            </div>
          </section>

          {statusMessage && <div className="tim-status-banner">{statusMessage}</div>}
          {renderBody()}
        </main>
      </div>
    </div>
  );
}

export default TrafficInspectorModule;
