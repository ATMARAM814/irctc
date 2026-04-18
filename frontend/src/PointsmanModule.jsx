import { useMemo, useState } from "react";
import {
  Award,
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
  UserCircle2
} from "lucide-react";

const navItems = [
  { key: "profile", label: "Profile", icon: UserCircle2 },
  { key: "history", label: "Test History", icon: FileBarChart2 },
  { key: "current", label: "Current Tests", icon: ClipboardList }
];

const pointsmanProfile = {
  name: "Ravi Kumar",
  employeeId: "PM_1001",
  contact: "+91 98989 11223",
  designation: "Pointsman",
  category: "Operations",
  station: "Nagpur Junction",
  reportingOfficer: "S. Deshmukh"
};

const initialHistory = [
  {
    id: 1,
    date: "2026-03-03",
    name: "Signal Safety Assessment",
    type: "Safety",
    totalScore: 84,
    assessmentPeriod: "Quarter 4 - 2025",
    sections: [
      { title: "Signal Rules", marks: 18, outOf: 20 },
      { title: "Emergency Handling", marks: 16, outOf: 20 },
      { title: "Track Procedures", marks: 17, outOf: 20 },
      { title: "Communication", marks: 15, outOf: 20 },
      { title: "Case Scenarios", marks: 18, outOf: 20 }
    ]
  },
  {
    id: 2,
    date: "2026-02-14",
    name: "Operations Protocol Drill",
    type: "Operations",
    totalScore: 76,
    assessmentPeriod: "Quarter 4 - 2025",
    sections: [
      { title: "Station Discipline", marks: 15, outOf: 20 },
      { title: "Signal Coordination", marks: 16, outOf: 20 },
      { title: "Rule Book", marks: 14, outOf: 20 },
      { title: "Incident Escalation", marks: 13, outOf: 20 },
      { title: "Field Judgment", marks: 18, outOf: 20 }
    ]
  },
  {
    id: 3,
    date: "2026-01-08",
    name: "Trackside Communication Test",
    type: "Communication",
    totalScore: 88,
    assessmentPeriod: "Quarter 3 - 2025",
    sections: [
      { title: "Verbal Protocol", marks: 17, outOf: 20 },
      { title: "Radio Commands", marks: 18, outOf: 20 },
      { title: "Response Timing", marks: 19, outOf: 20 },
      { title: "Coordination", marks: 17, outOf: 20 },
      { title: "Documentation", marks: 17, outOf: 20 }
    ]
  }
];

const currentTestsSeed = [
  {
    id: "CT-101",
    name: "Monthly Safety MCQ - April",
    type: "Safety",
    period: "April 2026"
  },
  {
    id: "CT-102",
    name: "Points Handling Refresher",
    type: "Operations",
    period: "April 2026"
  }
];

function buildQuestions() {
  const questions = [];
  for (let i = 1; i <= 25; i += 1) {
    questions.push({
      id: i,
      text: `Question ${i}: Choose the safest and most compliant action for this station scenario.`,
      options: [
        "Immediately proceed without confirmation",
        "Wait and re-verify with station control",
        "Delegate without documenting",
        "Skip communication and act directly"
      ],
      answer: 1
    });
  }
  return questions;
}

const testQuestions = buildQuestions();

function formatScore(scoreValue) {
  return `${scoreValue}/100`;
}

function PointsmanModule({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState("profile");
  const [screenMode, setScreenMode] = useState("default");
  const [history, setHistory] = useState(initialHistory);
  const [historyDateSearch, setHistoryDateSearch] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentTests, setCurrentTests] = useState(currentTestsSeed);
  const [activeTest, setActiveTest] = useState(null);
  const [responses, setResponses] = useState(Array(25).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [savedResponses, setSavedResponses] = useState({});
  const [statusText, setStatusText] = useState("");

  const fullName = user?.name || pointsmanProfile.name;
  const employeeId = user?.hrmsId || pointsmanProfile.employeeId;

  const testTypeOptions = useMemo(() => {
    const allTypes = history.map((item) => item.type);
    return ["All", ...Array.from(new Set(allTypes))];
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchDate = historyDateSearch.trim().length === 0 || item.date.includes(historyDateSearch.trim());
      const matchType = historyTypeFilter === "All" || item.type === historyTypeFilter;
      return matchDate && matchType;
    });
  }, [history, historyDateSearch, historyTypeFilter]);

  const answeredCount = responses.filter((value) => value !== null).length;
  const averageScore = history.length
    ? Math.round(history.reduce((sum, item) => sum + item.totalScore, 0) / history.length)
    : 0;
  const completionRate = Math.round((answeredCount / 25) * 100);

  const currentViewLabel =
    screenMode === "scorecard"
      ? "Detailed Scorecard"
      : screenMode === "attempt"
      ? "Test Attempt"
      : navItems.find((item) => item.key === activeNav)?.label || "Profile";

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

  const startTest = (testItem) => {
    setActiveTest(testItem);
    setResponses(Array(25).fill(null));
    setSavedResponses({});
    setCurrentQuestion(0);
    setStatusText("");
    setActiveNav("current");
    setScreenMode("attempt");
  };

  const handleSelectOption = (optionIndex) => {
    setResponses((prev) => {
      const next = [...prev];
      next[currentQuestion] = optionIndex;
      return next;
    });
  };

  const saveCurrentResponse = () => {
    if (responses[currentQuestion] === null) {
      setStatusText("Select an option before saving this response.");
      return;
    }

    setSavedResponses((prev) => ({
      ...prev,
      [currentQuestion]: true
    }));
    setStatusText(`Response for Question ${currentQuestion + 1} saved.`);
  };

  const evaluateTest = () => {
    let totalCorrect = 0;
    const sectionScores = [0, 0, 0, 0, 0];

    responses.forEach((response, index) => {
      const sectionIndex = Math.floor(index / 5);
      if (response === testQuestions[index].answer) {
        totalCorrect += 1;
        sectionScores[sectionIndex] += 4;
      }
    });

    const sections = [
      "Signal Rules",
      "Track Handling",
      "Communication",
      "Safety Response",
      "Operational Judgement"
    ].map((title, index) => ({
      title,
      marks: sectionScores[index],
      outOf: 20
    }));

    return {
      totalScore: totalCorrect * 4,
      sections
    };
  };

  const submitTest = () => {
    if (!activeTest) {
      return;
    }

    const { totalScore, sections } = evaluateTest();
    const today = new Date().toISOString().slice(0, 10);

    const completedRecord = {
      id: Date.now(),
      date: today,
      name: activeTest.name,
      type: activeTest.type,
      totalScore,
      assessmentPeriod: activeTest.period,
      sections
    };

    setHistory((prev) => [completedRecord, ...prev]);
    setCurrentTests((prev) => prev.filter((testItem) => testItem.id !== activeTest.id));
    setSelectedRecord(completedRecord);
    setActiveTest(null);
    setActiveNav("history");
    setScreenMode("scorecard");
    setStatusText("Test submitted successfully. Evaluation completed and added to test history.");
  };

  const renderProfilePage = () => {
    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Pointsman Profile</h2>
          <span className="pm-badge-view-only">View Only</span>
        </div>
        <p className="pm-subtitle">
          Personal and professional details are displayed for transparency and data integrity.
        </p>

        <div className="pm-profile-grid">
          <div className="pm-field">
            <label>Name</label>
            <p>{fullName}</p>
          </div>
          <div className="pm-field">
            <label>Employee ID</label>
            <p>{employeeId}</p>
          </div>
          <div className="pm-field">
            <label>Contact Information</label>
            <p>{pointsmanProfile.contact}</p>
          </div>
          <div className="pm-field">
            <label>Designation</label>
            <p>{pointsmanProfile.designation}</p>
          </div>
          <div className="pm-field">
            <label>Category</label>
            <p>{pointsmanProfile.category}</p>
          </div>
          <div className="pm-field">
            <label>Current Working Station</label>
            <p>{pointsmanProfile.station}</p>
          </div>
          <div className="pm-field pm-field-wide">
            <label>Reporting Officer</label>
            <p>{pointsmanProfile.reportingOfficer}</p>
          </div>
        </div>

        <div className="pm-insight-strip">
          <article className="pm-insight-card">
            <Target size={16} />
            <div>
              <label>Last Score</label>
              <p>{history[0] ? formatScore(history[0].totalScore) : "-"}</p>
            </div>
          </article>
          <article className="pm-insight-card">
            <Gauge size={16} />
            <div>
              <label>Average Score</label>
              <p>{formatScore(averageScore)}</p>
            </div>
          </article>
          <article className="pm-insight-card">
            <CalendarDays size={16} />
            <div>
              <label>Last Assessment</label>
              <p>{history[0]?.date || "No Record"}</p>
            </div>
          </article>
        </div>
      </section>
    );
  };

  const renderHistoryPage = () => {
    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Test History</h2>
        </div>
        <p className="pm-subtitle">Review all attempted tests and open a detailed scorecard for any record.</p>

        <div className="pm-filters-row">
          <div className="pm-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD)"
              value={historyDateSearch}
              onChange={(event) => setHistoryDateSearch(event.target.value)}
            />
          </div>
          <select
            value={historyTypeFilter}
            onChange={(event) => setHistoryTypeFilter(event.target.value)}
          >
            {testTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="pm-history-list" role="list">
          {filteredHistory.length === 0 && <p className="pm-empty-state">No tests match the selected search and filter.</p>}
          {filteredHistory.map((record) => (
            <button
              key={record.id}
              className="pm-history-item"
              onClick={() => openScorecard(record)}
            >
              <div>
                <strong>{record.name}</strong>
                <span>{record.type}</span>
              </div>
              <div>
                <strong>{record.date}</strong>
                <span>{formatScore(record.totalScore)}</span>
              </div>
              <div className="pm-history-arrow">Open</div>
            </button>
          ))}
        </div>
      </section>
    );
  };

  const renderScorecardPage = () => {
    if (!selectedRecord) {
      return (
        <section className="pm-page-card">
          <p className="pm-empty-state">Select a test from Test History to view a detailed scorecard.</p>
        </section>
      );
    }

    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Detailed Scorecard</h2>
          <button className="pm-link-btn" onClick={() => setScreenMode("default")}>Back to History</button>
        </div>

        <div className="pm-scorecard-meta">
          <div>
            <label>Test Name</label>
            <p>{selectedRecord.name}</p>
          </div>
          <div>
            <label>Assessment Period</label>
            <p>{selectedRecord.assessmentPeriod}</p>
          </div>
          <div>
            <label>Total Score</label>
            <p>{formatScore(selectedRecord.totalScore)}</p>
          </div>
        </div>

        <div className="pm-section-table">
          <div className="pm-section-head">
            <span>Section</span>
            <span>Marks</span>
          </div>
          {selectedRecord.sections.map((item) => (
            <div key={item.title} className="pm-section-row">
              <span>{item.title}</span>
              <span>
                {item.marks}/{item.outOf}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCurrentTestsPage = () => {
    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Current Tests</h2>
        </div>
        <p className="pm-subtitle">Start any available assessment from the list below.</p>

        <div className="pm-current-tests">
          {currentTests.length === 0 && (
            <p className="pm-empty-state">No pending tests are available at the moment.</p>
          )}

          {currentTests.map((testItem) => (
            <article key={testItem.id} className="pm-test-card">
              <div>
                <h3>{testItem.name}</h3>
                <p>
                  Type: {testItem.type} | Period: {testItem.period}
                </p>
                <div className="pm-pill-row">
                  <span className="pm-mini-pill">25 Questions</span>
                  <span className="pm-mini-pill">MCQ</span>
                </div>
              </div>
              <button className="pm-primary-btn" onClick={() => startTest(testItem)}>
                <PlayCircle size={16} /> Start Test
              </button>
            </article>
          ))}
        </div>
      </section>
    );
  };

  const renderAttemptPage = () => {
    if (!activeTest) {
      return renderCurrentTestsPage();
    }

    const question = testQuestions[currentQuestion];

    return (
      <section className="pm-page-card">
        <div className="pm-page-header">
          <h2>Test Attempt</h2>
          <button className="pm-link-btn" onClick={() => setScreenMode("default")}>Back to Current Tests</button>
        </div>

        <div className="pm-attempt-meta">
          <strong>{activeTest.name}</strong>
          <span>
            Answered: {answeredCount}/25 | Question {currentQuestion + 1} of 25
          </span>
        </div>

        <div className="pm-progress-track" aria-label="test progress">
          <div className="pm-progress-fill" style={{ width: `${completionRate}%` }} />
        </div>

        <div className="pm-question-card">
          <h3>{question.text}</h3>
          <div className="pm-options-list">
            {question.options.map((option, optionIndex) => {
              const checked = responses[currentQuestion] === optionIndex;
              return (
                <label key={option} className={`pm-option ${checked ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={checked}
                    onChange={() => handleSelectOption(optionIndex)}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </div>

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
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <button className="pm-secondary-btn" onClick={saveCurrentResponse}>
            <CheckCircle2 size={16} /> Save Response
          </button>

          <button
            className="pm-secondary-btn"
            onClick={() => setCurrentQuestion((prev) => Math.min(24, prev + 1))}
            disabled={currentQuestion === 24}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        <div className="pm-submit-row">
          <button className="pm-primary-btn" onClick={submitTest}>Submit Test</button>
        </div>
      </section>
    );
  };

  const renderBodyContent = () => {
    if (screenMode === "scorecard") {
      return renderScorecardPage();
    }

    if (screenMode === "attempt") {
      return renderAttemptPage();
    }

    if (activeNav === "profile") {
      return renderProfilePage();
    }

    if (activeNav === "history") {
      return renderHistoryPage();
    }

    return renderCurrentTestsPage();
  };

  return (
    <div className="pm-layout">
      <header className="pm-topbar">
        <div>
          <h1>Indian Railway Evaluation System</h1>
          <p>Pointsman Module</p>
        </div>
        <div className="pm-user-strip">
          <div>
            <strong>{fullName}</strong>
            <span>{employeeId}</span>
          </div>
          <button className="pm-logout-btn" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="pm-content-shell">
        <aside className="pm-sidebar">
          {navItems.map((item) => {
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
          <section className="pm-hero-band">
            <div className="pm-hero-main">
              <p className="pm-hero-eyebrow">Pointsman Workspace</p>
              <h2>{currentViewLabel}</h2>
              <span>
                Structured access to profile, assessments, and active test participation.
              </span>
            </div>
            <div className="pm-kpi-grid">
              <article className="pm-kpi-card">
                <Award size={16} />
                <label>Completed</label>
                <strong>{history.length}</strong>
              </article>
              <article className="pm-kpi-card">
                <Gauge size={16} />
                <label>Average</label>
                <strong>{averageScore}</strong>
              </article>
              <article className="pm-kpi-card">
                <ClipboardList size={16} />
                <label>Pending</label>
                <strong>{currentTests.length}</strong>
              </article>
            </div>
          </section>

          {statusText && <div className="pm-status-banner">{statusText}</div>}
          {renderBodyContent()}
        </main>
      </div>
    </div>
  );
}

export default PointsmanModule;
