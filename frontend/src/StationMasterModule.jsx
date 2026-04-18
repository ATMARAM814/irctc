import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarCheck2,
  ClipboardCheck,
  FileBarChart2,
  Filter,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  UserCircle2,
  Users
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "profile", label: "Profile", icon: UserCircle2 },
  { key: "pointsmen", label: "Pointsmen", icon: Users },
  { key: "assess", label: "Assess Pointsman", icon: ClipboardCheck },
  { key: "myAssessments", label: "My Assessment Details", icon: FileBarChart2 },
  { key: "testHistory", label: "My Test History", icon: CalendarCheck2 },
  { key: "reports", label: "Reports", icon: Filter },
  { key: "currentTest", label: "Current Test", icon: ShieldCheck }
];

const smProfile = {
  name: "S. Deshmukh",
  employeeId: "SM_1001",
  contact: "+91 98220 44556",
  designation: "Station Master",
  category: "Operations",
  currentStation: "Nagpur Junction",
  reportingOfficer: "TI_2001 - Traffic Inspector"
};

const initialPointsmen = [
  {
    id: 1,
    hrmsId: "PM_1101",
    name: "Ravi Kumar",
    category: "A",
    status: "Active",
    lastAssessmentScore: 92,
    lastAssessmentDate: "2026-03-28"
  },
  {
    id: 2,
    hrmsId: "PM_1102",
    name: "Sanjay Patil",
    category: "B",
    status: "Active",
    lastAssessmentScore: 78,
    lastAssessmentDate: "2026-03-10"
  },
  {
    id: 3,
    hrmsId: "PM_1103",
    name: "Deepak Nair",
    category: "C",
    status: "Inactive",
    lastAssessmentScore: 71,
    lastAssessmentDate: "2026-02-15"
  },
  {
    id: 4,
    hrmsId: "PM_1104",
    name: "Ajay Sharma",
    category: "A",
    status: "Active",
    lastAssessmentScore: 84,
    lastAssessmentDate: "2026-03-18"
  },
  {
    id: 5,
    hrmsId: "PM_1105",
    name: "Kunal Verma",
    category: "D",
    status: "Active",
    lastAssessmentScore: 66,
    lastAssessmentDate: "2026-01-20"
  }
];

const initialAssessmentRecords = [
  {
    id: 301,
    pointsmanId: 1,
    pointsmanName: "Ravi Kumar",
    employeeId: "PM_1101",
    category: "A",
    date: "2026-03-28",
    score: 92,
    period: "March 2026",
    sections: [
      { title: "Knowledge of Rules", marks: 42, outOf: 50 },
      { title: "Alertness & Observation", marks: 20, outOf: 25 },
      { title: "Safety Record", marks: 12, outOf: 15 },
      { title: "Leadership & Management", marks: 8, outOf: 15 },
      { title: "Discipline", marks: 6, outOf: 10 },
      { title: "Appearance & Neatness", marks: 4, outOf: 10 }
    ]
  },
  {
    id: 302,
    pointsmanId: 2,
    pointsmanName: "Sanjay Patil",
    employeeId: "PM_1102",
    category: "B",
    date: "2026-03-10",
    score: 78,
    period: "March 2026",
    sections: [
      { title: "Knowledge of Rules", marks: 34, outOf: 50 },
      { title: "Alertness & Observation", marks: 15, outOf: 25 },
      { title: "Safety Record", marks: 9, outOf: 15 },
      { title: "Leadership & Management", marks: 8, outOf: 15 },
      { title: "Discipline", marks: 7, outOf: 10 },
      { title: "Appearance & Neatness", marks: 5, outOf: 10 }
    ]
  }
];

const initialTestHistory = [
  {
    id: 401,
    date: "2026-03-14",
    testName: "Station Safety Compliance Test",
    testType: "Safety",
    score: 86,
    period: "Quarter 1 - 2026",
    sections: [
      { title: "Signal Protocol", marks: 18, outOf: 20 },
      { title: "Emergency Response", marks: 17, outOf: 20 },
      { title: "Rule Application", marks: 16, outOf: 20 },
      { title: "Decision Analysis", marks: 18, outOf: 20 },
      { title: "Documentation", marks: 17, outOf: 20 }
    ]
  },
  {
    id: 402,
    date: "2026-02-08",
    testName: "Operations Refresher",
    testType: "Operations",
    score: 81,
    period: "Quarter 1 - 2026",
    sections: [
      { title: "Coordination", marks: 16, outOf: 20 },
      { title: "Route Management", marks: 15, outOf: 20 },
      { title: "Rule Recall", marks: 16, outOf: 20 },
      { title: "Alertness", marks: 17, outOf: 20 },
      { title: "Compliance", marks: 17, outOf: 20 }
    ]
  }
];

const currentTests = [
  { id: "SM-T1", name: "Monthly Station Master Assessment" },
  { id: "SM-T2", name: "Safety Situational Drill" }
];

const mcqQuestions = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  question: `Rule Knowledge MCQ ${index + 1}`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: index % 4
}));

const yesNoSet = [
  "Question 1",
  "Question 2",
  "Question 3",
  "Question 4",
  "Question 5"
];

const defaultAssessmentForm = {
  mcq: Array(25).fill(null),
  alertness: Array(5).fill(null),
  safety: Array(5).fill(null),
  leadership: Array(5).fill(null),
  discipline: Array(5).fill(null),
  appearance: Array(5).fill(null),
  alcoholicStatus: "",
  pmeStatus: "Fit",
  refStatus: "Cleared",
  automaticTraining: "Recommended",
  counselling: "Not Required",
  dateOfAppointment: "",
  workingSince: ""
};

function sectionYesNoScore(values, weight) {
  return values.reduce((score, item) => (item === "Yes" ? score + weight : score), 0);
}

function getPerformanceLevel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Average";
  return "Needs Improvement";
}

function StationMasterModule({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pageMode, setPageMode] = useState("default");
  const [statusMessage, setStatusMessage] = useState("");

  const [pointsmen, setPointsmen] = useState(initialPointsmen);
  const [showAddPointsmanModal, setShowAddPointsmanModal] = useState(false);
  const [newPointsman, setNewPointsman] = useState({ hrmsId: "", name: "", category: "A" });
  const [pointsmanDetail, setPointsmanDetail] = useState(null);

  const [pendingAssessments, setPendingAssessments] = useState([
    { pointsmanId: 4, name: "Ajay Sharma", employeeId: "PM_1104", lastDate: "2026-03-18", category: "A" },
    { pointsmanId: 5, name: "Kunal Verma", employeeId: "PM_1105", lastDate: "2026-01-20", category: "D" }
  ]);
  const [assessmentTarget, setAssessmentTarget] = useState(null);
  const [assessmentForm, setAssessmentForm] = useState(defaultAssessmentForm);
  const [assessmentLocked, setAssessmentLocked] = useState(false);

  const [assessmentRecords, setAssessmentRecords] = useState(initialAssessmentRecords);
  const [selectedAssessmentRecord, setSelectedAssessmentRecord] = useState(null);

  const [testHistory, setTestHistory] = useState(initialTestHistory);
  const [testSearch, setTestSearch] = useState("");
  const [testFilter, setTestFilter] = useState("All");
  const [selectedScorecard, setSelectedScorecard] = useState(null);

  const [reportFilters, setReportFilters] = useState({
    pointsmanName: "",
    startDate: "",
    endDate: "",
    category: "All",
    performance: "All"
  });

  const smName = user?.name || smProfile.name;
  const smId = user?.hrmsId || smProfile.employeeId;

  const dashboardStats = useMemo(() => {
    const total = pointsmen.length;
    const active = pointsmen.filter((p) => p.status === "Active").length;
    const pending = pendingAssessments.length;
    const completed = assessmentRecords.length;

    return {
      stationName: smProfile.currentStation,
      total,
      active,
      pending,
      completed
    };
  }, [pointsmen, pendingAssessments.length, assessmentRecords.length]);

  const testTypeOptions = useMemo(() => {
    return ["All", ...Array.from(new Set(testHistory.map((item) => item.testType)))];
  }, [testHistory]);

  const filteredTestHistory = useMemo(() => {
    const q = testSearch.trim().toLowerCase();
    return testHistory.filter((test) => {
      const searchMatch =
        q.length === 0 ||
        test.testName.toLowerCase().includes(q) ||
        test.date.includes(q);
      const filterMatch = testFilter === "All" || test.testType === testFilter;
      return searchMatch && filterMatch;
    });
  }, [testHistory, testSearch, testFilter]);

  const assessmentLiveScores = useMemo(() => {
    const knowledge = assessmentForm.mcq.reduce((score, answer, idx) => {
      return answer === mcqQuestions[idx].answer ? score + 2 : score;
    }, 0);

    const alertness = sectionYesNoScore(assessmentForm.alertness, 5);
    const safety = sectionYesNoScore(assessmentForm.safety, 3);
    const leadership = sectionYesNoScore(assessmentForm.leadership, 3);
    const discipline = sectionYesNoScore(assessmentForm.discipline, 2);
    const appearance = sectionYesNoScore(assessmentForm.appearance, 2);

    const total = knowledge + alertness + safety + leadership + discipline + appearance;

    return {
      knowledge,
      alertness,
      safety,
      leadership,
      discipline,
      appearance,
      total
    };
  }, [assessmentForm]);

  const filteredReports = useMemo(() => {
    return assessmentRecords.filter((record) => {
      const nameMatch =
        reportFilters.pointsmanName.trim().length === 0 ||
        record.pointsmanName.toLowerCase().includes(reportFilters.pointsmanName.trim().toLowerCase());

      const categoryMatch = reportFilters.category === "All" || record.category === reportFilters.category;

      const performance = getPerformanceLevel(record.score);
      const performanceMatch = reportFilters.performance === "All" || performance === reportFilters.performance;

      const startMatch = reportFilters.startDate === "" || record.date >= reportFilters.startDate;
      const endMatch = reportFilters.endDate === "" || record.date <= reportFilters.endDate;

      return nameMatch && categoryMatch && performanceMatch && startMatch && endMatch;
    });
  }, [assessmentRecords, reportFilters]);

  const reportSummary = useMemo(() => {
    const count = filteredReports.length;
    const average = count
      ? Math.round(filteredReports.reduce((sum, item) => sum + item.score, 0) / count)
      : 0;

    const categoryA = filteredReports.filter((item) => item.category === "A").length;
    const categoryB = filteredReports.filter((item) => item.category === "B").length;
    const categoryC = filteredReports.filter((item) => item.category === "C").length;
    const categoryD = filteredReports.filter((item) => item.category === "D").length;

    return {
      count,
      average,
      distribution: `A:${categoryA}  B:${categoryB}  C:${categoryC}  D:${categoryD}`
    };
  }, [filteredReports]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setPageMode("default");
    setStatusMessage("");
  };

  const handleAddPointsman = (event) => {
    event.preventDefault();
    if (!newPointsman.hrmsId.trim() || !newPointsman.name.trim()) {
      setStatusMessage("Enter HRMS ID and Name before creating a pointsman account.");
      return;
    }

    setPointsmen((prev) => [
      {
        id: Date.now(),
        hrmsId: newPointsman.hrmsId.trim().toUpperCase(),
        name: newPointsman.name.trim(),
        category: newPointsman.category,
        status: "Active",
        lastAssessmentScore: 0,
        lastAssessmentDate: "Not Assessed"
      },
      ...prev
    ]);

    setNewPointsman({ hrmsId: "", name: "", category: "A" });
    setShowAddPointsmanModal(false);
    setStatusMessage("Pointsman account created successfully (dummy action).");
  };

  const handleRemovePointsman = (id) => {
    setPointsmen((prev) => prev.filter((row) => row.id !== id));
    setPendingAssessments((prev) => prev.filter((row) => row.pointsmanId !== id));
    if (pointsmanDetail?.id === id) {
      setPageMode("default");
      setPointsmanDetail(null);
    }
  };

  const openPointsmanDetails = (row) => {
    setPointsmanDetail(row);
    setPageMode("pointsmanDetail");
  };

  const openAssessmentForm = (target) => {
    setAssessmentTarget(target);
    setAssessmentForm(defaultAssessmentForm);
    setAssessmentLocked(false);
    setPageMode("assessmentForm");
  };

  const updateMcqAnswer = (qIndex, answerIndex) => {
    if (assessmentLocked) return;
    setAssessmentForm((prev) => {
      const next = [...prev.mcq];
      next[qIndex] = answerIndex;
      return { ...prev, mcq: next };
    });
  };

  const updateYesNo = (sectionKey, index, value) => {
    if (assessmentLocked) return;
    setAssessmentForm((prev) => {
      const nextSection = [...prev[sectionKey]];
      nextSection[index] = value;
      return { ...prev, [sectionKey]: nextSection };
    });
  };

  const updateAssessmentMeta = (event) => {
    if (assessmentLocked) return;
    const { name, value } = event.target;
    setAssessmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitAssessment = () => {
    if (!assessmentTarget) {
      return;
    }

    if (!assessmentForm.alcoholicStatus) {
      setStatusMessage("Alcoholic / Non-Alcoholic status is mandatory before submit.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const record = {
      id: Date.now(),
      pointsmanId: assessmentTarget.pointsmanId,
      pointsmanName: assessmentTarget.name,
      employeeId: assessmentTarget.employeeId,
      category: assessmentTarget.category,
      date: today,
      score: assessmentLiveScores.total,
      period: "April 2026",
      sections: [
        { title: "Knowledge of Rules", marks: assessmentLiveScores.knowledge, outOf: 50 },
        { title: "Alertness & Observation", marks: assessmentLiveScores.alertness, outOf: 25 },
        { title: "Safety Record", marks: assessmentLiveScores.safety, outOf: 15 },
        { title: "Leadership & Management", marks: assessmentLiveScores.leadership, outOf: 15 },
        { title: "Discipline", marks: assessmentLiveScores.discipline, outOf: 10 },
        { title: "Appearance & Neatness", marks: assessmentLiveScores.appearance, outOf: 10 }
      ]
    };

    setAssessmentRecords((prev) => [record, ...prev]);

    setPointsmen((prev) =>
      prev.map((row) =>
        row.id === assessmentTarget.pointsmanId
          ? {
              ...row,
              lastAssessmentScore: assessmentLiveScores.total,
              lastAssessmentDate: today
            }
          : row
      )
    );

    setPendingAssessments((prev) => prev.filter((row) => row.pointsmanId !== assessmentTarget.pointsmanId));
    setAssessmentLocked(true);
    setStatusMessage("Assessment submitted successfully. Form is now locked.");
  };

  const openAssessmentDetail = (record) => {
    setSelectedAssessmentRecord(record);
    setActiveTab("myAssessments");
    setPageMode("assessmentScorecard");
  };

  const openTestScorecard = (test) => {
    setSelectedScorecard(test);
    setActiveTab("testHistory");
    setPageMode("testScorecard");
  };

  const renderScoreTable = (record, title, backAction) => {
    if (!record) return null;
    const totalOutOf = record.totalMax || record.sections.reduce((sum, section) => sum + section.outOf, 0);
    return (
      <section className="sm-panel-card">
        <div className="sm-page-header">
          <h2>{title}</h2>
          <button type="button" className="sm-link-btn" onClick={backAction}>
            Back
          </button>
        </div>

        <div className="sm-score-meta-grid">
          <div>
            <label>Name</label>
            <p>{record.pointsmanName || record.testName}</p>
          </div>
          <div>
            <label>Date / Period</label>
            <p>{record.date} | {record.period}</p>
          </div>
          <div>
            <label>Total Score</label>
            <p>{record.score}/{totalOutOf}</p>
          </div>
        </div>

        <div className="sm-score-table">
          <div className="sm-score-row sm-score-head">
            <span>Section</span>
            <span>Marks</span>
          </div>
          {record.sections.map((section) => (
            <div key={section.title} className="sm-score-row">
              <span>{section.title}</span>
              <span>{section.marks}/{section.outOf}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderDashboard = () => {
    const cards = [
      { label: "Station", value: dashboardStats.stationName },
      { label: "Total Pointsmen", value: dashboardStats.total },
      { label: "Active Pointsmen", value: dashboardStats.active },
      { label: "Pending Assessments", value: dashboardStats.pending },
      { label: "Completed Assessments", value: dashboardStats.completed }
    ];

    return (
      <>
        <div className="sm-page-header">
          <h2>Station Overview</h2>
        </div>

        <div className="sm-stats-grid">
          {cards.map((card) => (
            <article key={card.label} className="sm-stat-card">
              <label>{card.label}</label>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>

        <section className="sm-panel-card">
          <h3>Recent Activity</h3>
          <ul className="sm-activity-list">
            <li>Assessment submitted for Ajay Sharma - score updated.</li>
            <li>Safety compliance test scheduled for this week.</li>
            <li>Traffic Inspector review due on 2026-04-20.</li>
          </ul>
        </section>
      </>
    );
  };

  const renderProfile = () => {
    return (
      <section className="sm-panel-card">
        <div className="sm-page-header">
          <h2>Profile</h2>
          <span className="sm-view-only">View Only</span>
        </div>

        <div className="sm-profile-grid">
          <article><label>Name</label><p>{smName}</p></article>
          <article><label>Employee ID</label><p>{smId}</p></article>
          <article><label>Contact Info</label><p>{smProfile.contact}</p></article>
          <article><label>Designation</label><p>{smProfile.designation}</p></article>
          <article><label>Category</label><p>{smProfile.category}</p></article>
          <article><label>Current Station</label><p>{smProfile.currentStation}</p></article>
          <article className="full"><label>Reporting Officer</label><p>{smProfile.reportingOfficer}</p></article>
        </div>
      </section>
    );
  };

  const renderPointsmen = () => {
    if (pageMode === "pointsmanDetail" && pointsmanDetail) {
      return (
        <section className="sm-panel-card">
          <div className="sm-page-header">
            <h2>Pointsman Details</h2>
            <button type="button" className="sm-link-btn" onClick={() => setPageMode("default")}>Back</button>
          </div>
          <div className="sm-profile-grid">
            <article><label>Name</label><p>{pointsmanDetail.name}</p></article>
            <article><label>Employee ID</label><p>{pointsmanDetail.hrmsId}</p></article>
            <article><label>Category</label><p>{pointsmanDetail.category}</p></article>
            <article><label>Status</label><p>{pointsmanDetail.status}</p></article>
            <article><label>Latest Assessment</label><p>{pointsmanDetail.lastAssessmentScore}/125</p></article>
            <article><label>Last Assessment Date</label><p>{pointsmanDetail.lastAssessmentDate}</p></article>
          </div>
        </section>
      );
    }

    return (
      <>
        <div className="sm-page-header">
          <h2>Pointsmen Management</h2>
          <button type="button" className="sm-primary-btn" onClick={() => setShowAddPointsmanModal(true)}>
            <Plus size={16} /> Add Pointsman
          </button>
        </div>

        <section className="sm-panel-card">
          <div className="sm-table table-pointsmen">
            <div className="sm-table-row sm-table-head">
              <div>Name</div>
              <div>Employee ID</div>
              <div>Category</div>
              <div>Status</div>
              <div>Last Assessment Score</div>
              <div>Actions</div>
            </div>
            {pointsmen.map((row) => (
              <div key={row.id} className="sm-table-row">
                <div>
                  <button type="button" className="sm-link-btn" onClick={() => openPointsmanDetails(row)}>
                    {row.name}
                  </button>
                </div>
                <div>{row.hrmsId}</div>
                <div>{row.category}</div>
                <div>
                  <span className={row.status === "Active" ? "sm-pill-active" : "sm-pill-inactive"}>
                    {row.status}
                  </span>
                </div>
                <div>{row.lastAssessmentScore}/125</div>
                <div>
                  <button type="button" className="sm-danger-btn" onClick={() => handleRemovePointsman(row.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showAddPointsmanModal && (
          <div className="sm-modal-overlay">
            <div className="sm-modal-card">
              <h3>Add Pointsman Account</h3>
              <form onSubmit={handleAddPointsman} className="sm-form-grid">
                <div className="sm-form-field">
                  <label>HRMS ID</label>
                  <input
                    value={newPointsman.hrmsId}
                    onChange={(event) => setNewPointsman((prev) => ({ ...prev, hrmsId: event.target.value }))}
                    placeholder="PM_XXXX"
                  />
                </div>
                <div className="sm-form-field">
                  <label>Name</label>
                  <input
                    value={newPointsman.name}
                    onChange={(event) => setNewPointsman((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
                <div className="sm-form-field">
                  <label>Category</label>
                  <select
                    value={newPointsman.category}
                    onChange={(event) => setNewPointsman((prev) => ({ ...prev, category: event.target.value }))}
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                    <option>Halt</option>
                  </select>
                </div>
                <div className="sm-modal-actions">
                  <button type="button" className="sm-secondary-btn" onClick={() => setShowAddPointsmanModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="sm-primary-btn">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderAssessPointsman = () => {
    if (pageMode === "assessmentForm" && assessmentTarget) {
      const sectionBlock = (title, keyName, rows, outOf, weight) => (
        <article className="sm-panel-card" key={title}>
          <h3>{title}</h3>
          <p className="sm-section-meta">{rows} questions | {weight} marks each | Total {outOf}</p>
          <div className="sm-yn-grid">
            {yesNoSet.map((label, index) => (
              <div className="sm-yn-row" key={`${title}-${index}`}>
                <span>{label}</span>
                <div>
                  <button
                    type="button"
                    className={assessmentForm[keyName][index] === "Yes" ? "sm-chip-active" : "sm-chip"}
                    onClick={() => updateYesNo(keyName, index, "Yes")}
                    disabled={assessmentLocked}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={assessmentForm[keyName][index] === "No" ? "sm-chip-active" : "sm-chip"}
                    onClick={() => updateYesNo(keyName, index, "No")}
                    disabled={assessmentLocked}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      );

      return (
        <>
          <div className="sm-page-header">
            <h2>Assessment Form - {assessmentTarget.name}</h2>
            <button type="button" className="sm-link-btn" onClick={() => setPageMode("default")}>Back</button>
          </div>

          <section className="sm-panel-card">
            <h3>Knowledge of Rules (25 MCQs)</h3>
            <p className="sm-section-meta">Auto scoring enabled</p>
            <div className="sm-mcq-list">
              {mcqQuestions.map((q, idx) => (
                <div key={q.id} className="sm-mcq-item">
                  <label>{q.question}</label>
                  <div className="sm-option-wrap">
                    {q.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        type="button"
                        className={assessmentForm.mcq[idx] === optionIndex ? "sm-chip-active" : "sm-chip"}
                        onClick={() => updateMcqAnswer(idx, optionIndex)}
                        disabled={assessmentLocked}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {sectionBlock("Alertness & Observation", "alertness", 5, 25, 5)}
          {sectionBlock("Safety Record", "safety", 5, 15, 3)}
          {sectionBlock("Leadership & Management", "leadership", 5, 15, 3)}
          {sectionBlock("Discipline", "discipline", 5, 10, 2)}
          {sectionBlock("Appearance & Neatness", "appearance", 5, 10, 2)}

          <section className="sm-panel-card">
            <h3>Additional Details</h3>
            <div className="sm-form-grid two-col">
              <div className="sm-form-field">
                <label>Alcoholic / Non-Alcoholic (Mandatory)</label>
                <select
                  name="alcoholicStatus"
                  value={assessmentForm.alcoholicStatus}
                  onChange={updateAssessmentMeta}
                  disabled={assessmentLocked}
                >
                  <option value="">Select</option>
                  <option>Alcoholic</option>
                  <option>Non-Alcoholic</option>
                </select>
              </div>
              <div className="sm-form-field">
                <label>PME Status</label>
                <input name="pmeStatus" value={assessmentForm.pmeStatus} onChange={updateAssessmentMeta} disabled={assessmentLocked} />
              </div>
              <div className="sm-form-field">
                <label>REF Status</label>
                <input name="refStatus" value={assessmentForm.refStatus} onChange={updateAssessmentMeta} disabled={assessmentLocked} />
              </div>
              <div className="sm-form-field">
                <label>Automatic Training</label>
                <input name="automaticTraining" value={assessmentForm.automaticTraining} onChange={updateAssessmentMeta} disabled={assessmentLocked} />
              </div>
              <div className="sm-form-field">
                <label>Counselling</label>
                <input name="counselling" value={assessmentForm.counselling} onChange={updateAssessmentMeta} disabled={assessmentLocked} />
              </div>
              <div className="sm-form-field">
                <label>Date of Appointment</label>
                <input type="date" name="dateOfAppointment" value={assessmentForm.dateOfAppointment} onChange={updateAssessmentMeta} disabled={assessmentLocked} />
              </div>
              <div className="sm-form-field">
                <label>Working Since</label>
                <input type="date" name="workingSince" value={assessmentForm.workingSince} onChange={updateAssessmentMeta} disabled={assessmentLocked} />
              </div>
            </div>
          </section>

          <section className="sm-live-score-bar">
            <div>
              <label>Live Total Score</label>
              <strong>{assessmentLiveScores.total} / 125</strong>
            </div>
            <button type="button" className="sm-primary-btn" onClick={submitAssessment} disabled={assessmentLocked}>
              Submit Assessment
            </button>
          </section>
        </>
      );
    }

    return (
      <>
        <div className="sm-page-header">
          <h2>Assess Pointsman</h2>
        </div>

        <section className="sm-panel-card">
          <h3>Pending Assessments</h3>
          <div className="sm-table table-pending">
            <div className="sm-table-row sm-table-head">
              <div>Name</div>
              <div>Employee ID</div>
              <div>Last Assessment Date</div>
              <div>Action</div>
            </div>
            {pendingAssessments.length === 0 ? (
              <div className="sm-empty">No pending assessments.</div>
            ) : (
              pendingAssessments.map((row) => (
                <div key={row.pointsmanId} className="sm-table-row">
                  <div>{row.name}</div>
                  <div>{row.employeeId}</div>
                  <div>{row.lastDate}</div>
                  <div>
                    <button type="button" className="sm-primary-btn" onClick={() => openAssessmentForm(row)}>
                      Open Form
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

  const renderMyAssessments = () => {
    if (pageMode === "assessmentScorecard") {
      return renderScoreTable(selectedAssessmentRecord, "Assessment Report", () => setPageMode("default"));
    }

    return (
      <>
        <div className="sm-page-header">
          <h2>My Assessment Details</h2>
        </div>

        <section className="sm-panel-card">
          <div className="sm-table table-my-assessments">
            <div className="sm-table-row sm-table-head">
              <div>Pointsman Name</div>
              <div>Date</div>
              <div>Score</div>
              <div>Category</div>
              <div>Action</div>
            </div>
            {assessmentRecords.map((record) => (
              <div key={record.id} className="sm-table-row">
                <div>{record.pointsmanName}</div>
                <div>{record.date}</div>
                <div>{record.score}/125</div>
                <div>{record.category}</div>
                <div>
                  <button type="button" className="sm-link-btn" onClick={() => openAssessmentDetail(record)}>
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderTestHistory = () => {
    if (pageMode === "testScorecard") {
      const normalized = selectedScorecard
        ? {
            ...selectedScorecard,
            pointsmanName: selectedScorecard.testName,
            score: selectedScorecard.score,
            totalMax: 100
          }
        : null;

      return renderScoreTable(normalized, "Test Scorecard", () => setPageMode("default"));
    }

    return (
      <>
        <div className="sm-page-header">
          <h2>My Test History</h2>
        </div>

        <section className="sm-panel-card">
          <div className="sm-toolbar-row">
            <div className="sm-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by date or test name"
                value={testSearch}
                onChange={(event) => setTestSearch(event.target.value)}
              />
            </div>
            <select value={testFilter} onChange={(event) => setTestFilter(event.target.value)}>
              {testTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="sm-table table-tests">
            <div className="sm-table-row sm-table-head">
              <div>Test Date</div>
              <div>Test Name</div>
              <div>Score</div>
              <div>Action</div>
            </div>
            {filteredTestHistory.map((row) => (
              <div key={row.id} className="sm-table-row">
                <div>{row.date}</div>
                <div>{row.testName}</div>
                <div>{row.score}/100</div>
                <div>
                  <button type="button" className="sm-link-btn" onClick={() => openTestScorecard(row)}>
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
        <div className="sm-page-header">
          <h2>Reports & Analytics</h2>
          <button type="button" className="sm-secondary-btn" onClick={() => setStatusMessage("Export triggered (UI only).")}>Export</button>
        </div>

        <section className="sm-panel-card">
          <div className="sm-form-grid report-grid">
            <div className="sm-form-field">
              <label>Pointsman Name</label>
              <input
                value={reportFilters.pointsmanName}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, pointsmanName: event.target.value }))}
                placeholder="Search pointsman"
              />
            </div>
            <div className="sm-form-field">
              <label>Date Range Start</label>
              <input
                type="date"
                value={reportFilters.startDate}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </div>
            <div className="sm-form-field">
              <label>Date Range End</label>
              <input
                type="date"
                value={reportFilters.endDate}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </div>
            <div className="sm-form-field">
              <label>Category</label>
              <select
                value={reportFilters.category}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, category: event.target.value }))}
              >
                <option>All</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>
            <div className="sm-form-field">
              <label>Performance Level</label>
              <select
                value={reportFilters.performance}
                onChange={(event) => setReportFilters((prev) => ({ ...prev, performance: event.target.value }))}
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

        <div className="sm-stats-grid report-summary-grid">
          <article className="sm-stat-card"><label>Average Score</label><strong>{reportSummary.average}</strong></article>
          <article className="sm-stat-card"><label>Total Assessments</label><strong>{reportSummary.count}</strong></article>
          <article className="sm-stat-card"><label>Category Distribution</label><strong>{reportSummary.distribution}</strong></article>
        </div>

        <section className="sm-panel-card">
          <div className="sm-table table-reports">
            <div className="sm-table-row sm-table-head">
              <div>Pointsman</div>
              <div>Date</div>
              <div>Category</div>
              <div>Score</div>
              <div>Performance</div>
              <div>Action</div>
            </div>
            {filteredReports.map((report) => (
              <div key={report.id} className="sm-table-row">
                <div>{report.pointsmanName}</div>
                <div>{report.date}</div>
                <div>{report.category}</div>
                <div>{report.score}/125</div>
                <div>{getPerformanceLevel(report.score)}</div>
                <div>
                  <button type="button" className="sm-link-btn" onClick={() => openAssessmentDetail(report)}>
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
    return (
      <>
        <div className="sm-page-header">
          <h2>Current Test</h2>
        </div>

        <section className="sm-panel-card">
          <div className="sm-current-tests">
            {currentTests.map((test) => (
              <article key={test.id} className="sm-current-test-card">
                <div>
                  <strong>{test.name}</strong>
                  <p>Pending and available for attempt.</p>
                </div>
                <button
                  type="button"
                  className="sm-primary-btn"
                  onClick={() => setStatusMessage(`Starting ${test.name} (UI only).`)}
                >
                  Start Test
                </button>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderContent = () => {
    if (activeTab === "dashboard") return renderDashboard();
    if (activeTab === "profile") return renderProfile();
    if (activeTab === "pointsmen") return renderPointsmen();
    if (activeTab === "assess") return renderAssessPointsman();
    if (activeTab === "myAssessments") return renderMyAssessments();
    if (activeTab === "testHistory") return renderTestHistory();
    if (activeTab === "reports") return renderReports();
    return renderCurrentTest();
  };

  return (
    <div className="sm-shell">
      <header className="sm-topbar">
        <div>
          <h1>Indian Railway Evaluation System</h1>
          <p>Station Master Module</p>
        </div>
        <div className="sm-topbar-right">
          <div>
            <strong>{smName}</strong>
            <span>{smId}</span>
          </div>
          <button type="button" className="sm-logout-btn" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="sm-layout">
        <aside className="sm-sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={`sm-side-item ${activeTab === item.key ? "active" : ""}`}
                onClick={() => switchTab(item.key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="sm-main">
          {statusMessage && <div className="sm-status-banner">{statusMessage}</div>}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default StationMasterModule;
