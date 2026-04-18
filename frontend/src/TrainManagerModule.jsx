import { useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  FileWarning,
  Gauge,
  LogOut,
  PlayCircle,
  Search,
  ShieldCheck,
  UserCircle2,
  Train,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "profile", label: "Profile", icon: UserCircle2 },
  { key: "duties", label: "Assigned Duties", icon: Train },
  { key: "incidents", label: "Incident Reporting", icon: FileWarning },
  { key: "performance", label: "My Performance", icon: Gauge },
  { key: "history", label: "My Test History", icon: ClipboardList },
  { key: "current", label: "Current Test", icon: ShieldCheck }
];

const tmProfileSeed = {
  name: "A. Mehta",
  employeeId: "TM_1001",
  designation: "Train Manager",
  zoneDivision: "Central Railway - Nagpur Division",
  reportingOfficer: "TI_1001 - R. Khan"
};

const dutySeed = [
  { id: "DUTY_1", trainNo: "12140", route: "Nagpur - Mumbai", dutyDate: "2026-04-19", status: "Upcoming" },
  { id: "DUTY_2", trainNo: "12656", route: "Nagpur - Chennai", dutyDate: "2026-04-21", status: "Upcoming" },
  { id: "DUTY_3", trainNo: "11040", route: "Pune - Nagpur", dutyDate: "2026-04-15", status: "Completed" },
  { id: "DUTY_4", trainNo: "12105", route: "Nagpur - Gondia", dutyDate: "2026-04-12", status: "Completed" },
  { id: "DUTY_5", trainNo: "12859", route: "Mumbai - Howrah", dutyDate: "2026-04-23", status: "Upcoming" }
];

const incidentSeed = [
  {
    id: "INC_1",
    trainNo: "11040",
    date: "2026-04-15",
    type: "Delay",
    description: "15-minute departure delay due to signal congestion near Wardha.",
    createdAt: "2026-04-15"
  },
  {
    id: "INC_2",
    trainNo: "12105",
    date: "2026-04-12",
    type: "Equipment",
    description: "Coach communication panel was unresponsive during platform handover.",
    createdAt: "2026-04-12"
  }
];

const performanceSeed = [
  { id: "PERF_1", period: "March 2026", evaluator: "TI_1001", score: 86, category: "B" },
  { id: "PERF_2", period: "February 2026", evaluator: "TI_1001", score: 91, category: "A" },
  { id: "PERF_3", period: "January 2026", evaluator: "TI_1002", score: 79, category: "C" }
];

const testHistorySeed = [
  {
    id: "TST_1",
    testDate: "2026-03-14",
    testName: "Train Operations Safety Test",
    score: 84,
    assessmentPeriod: "Quarter 1 - 2026",
    sections: [
      { title: "Rule Compliance", marks: 17, outOf: 20 },
      { title: "Emergency Handling", marks: 16, outOf: 20 },
      { title: "Onboard Coordination", marks: 17, outOf: 20 },
      { title: "Passenger Safety", marks: 16, outOf: 20 },
      { title: "Incident Reporting", marks: 18, outOf: 20 }
    ]
  },
  {
    id: "TST_2",
    testDate: "2026-02-10",
    testName: "Rolling Stock Readiness Assessment",
    score: 78,
    assessmentPeriod: "Quarter 1 - 2026",
    sections: [
      { title: "Coach Inspection", marks: 15, outOf: 20 },
      { title: "Equipment Checks", marks: 16, outOf: 20 },
      { title: "Safety Awareness", marks: 15, outOf: 20 },
      { title: "Communication", marks: 16, outOf: 20 },
      { title: "Documentation", marks: 16, outOf: 20 }
    ]
  }
];

const currentTestsSeed = [
  { id: "CT_1", name: "Monthly TM Competency Test", period: "April 2026" },
  { id: "CT_2", name: "Incident Escalation Drill", period: "April 2026" }
];

const mcqQuestions = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  question: `Question ${index + 1}: Choose the most appropriate operational response for train duty scenario ${index + 1}.`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: index % 4
}));

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

function TrainManagerModule({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [screenMode, setScreenMode] = useState("default");
  const [statusText, setStatusText] = useState("");

  const [duties] = useState(dutySeed);
  const [incidents, setIncidents] = useState(incidentSeed);
  const [performance] = useState(performanceSeed);
  const [testHistory, setTestHistory] = useState(testHistorySeed);
  const [currentTests, setCurrentTests] = useState(currentTestsSeed);

  const [incidentForm, setIncidentForm] = useState({
    trainNo: "",
    date: "",
    type: "Delay",
    description: ""
  });

  const [historySearch, setHistorySearch] = useState("");
  const [selectedScorecard, setSelectedScorecard] = useState(null);

  const [activeTest, setActiveTest] = useState(null);
  const [responses, setResponses] = useState(Array(25).fill(null));
  const [savedResponses, setSavedResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const fullName = user?.name || tmProfileSeed.name;
  const employeeId = user?.hrmsId || tmProfileSeed.employeeId;

  const totalTrips = duties.length;
  const upcomingDuties = duties.filter((row) => row.status === "Upcoming").length;
  const completedDuties = duties.filter((row) => row.status === "Completed").length;
  const reportedIncidents = incidents.length;

  const filteredTestHistory = useMemo(() => {
    return testHistory.filter((row) => {
      const q = historySearch.trim().toLowerCase();
      if (!q) return true;
      return row.testDate.includes(q) || row.testName.toLowerCase().includes(q);
    });
  }, [testHistory, historySearch]);

  const averagePerformance = performance.length
    ? Math.round(performance.reduce((sum, row) => sum + row.score, 0) / performance.length)
    : 0;

  const answeredCount = responses.filter((row) => row !== null).length;

  const goToPage = (pageKey) => {
    setActivePage(pageKey);
    setScreenMode("default");
    setStatusText("");
    setSelectedScorecard(null);
  };

  const handleIncidentSubmit = (event) => {
    event.preventDefault();

    if (!incidentForm.trainNo.trim() || !incidentForm.date || !incidentForm.description.trim()) {
      setStatusText("Please fill Train Number, Date, and Description.");
      return;
    }

    setIncidents((prev) => [
      {
        id: `INC_${Date.now()}`,
        trainNo: incidentForm.trainNo.trim(),
        date: incidentForm.date,
        type: incidentForm.type,
        description: incidentForm.description.trim(),
        createdAt: new Date().toISOString().slice(0, 10)
      },
      ...prev
    ]);

    setIncidentForm({ trainNo: "", date: "", type: "Delay", description: "" });
    setStatusText("Incident report submitted successfully.");
  };

  const startTest = (test) => {
    setActiveTest(test);
    setResponses(Array(25).fill(null));
    setSavedResponses({});
    setCurrentQuestion(0);
    setScreenMode("attempt");
    setStatusText("");
  };

  const saveResponse = () => {
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
      if (ans === mcqQuestions[idx].answer) {
        correct += 1;
      }
    });

    const totalScore = correct * 4;

    const result = {
      id: `TST_${Date.now()}`,
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
    setCurrentTests((prev) => prev.filter((test) => test.id !== activeTest.id));
    setActiveTest(null);
    setScreenMode("default");
    setActivePage("history");
    setSelectedScorecard(normalizeScorecard(result));
    setStatusText(`Test submitted. Final score: ${totalScore}/100.`);
  };

  const renderScorecard = () => {
    if (!selectedScorecard) return null;

    return (
      <section className="tm-panel-card">
        <div className="tm-page-header">
          <h2>Scorecard</h2>
          <button type="button" className="tm-link-btn" onClick={() => setSelectedScorecard(null)}>
            Back
          </button>
        </div>

        <div className="tm-score-meta-grid">
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

        <div className="tm-score-table">
          <div className="tm-score-row tm-score-head">
            <div>Section</div>
            <div>Marks</div>
          </div>
          {selectedScorecard.sections.map((section) => (
            <div key={section.title} className="tm-score-row">
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

  const renderDashboard = () => (
    <>
      <div className="tm-page-header">
        <h2>Train Manager Dashboard</h2>
      </div>

      <div className="tm-stats-grid">
        <article className="tm-stat-card">
          <Train size={18} />
          <label>Total Assigned Trips</label>
          <strong>{totalTrips}</strong>
        </article>
        <article className="tm-stat-card">
          <ClipboardList size={18} />
          <label>Upcoming Duties</label>
          <strong>{upcomingDuties}</strong>
        </article>
        <article className="tm-stat-card">
          <Gauge size={18} />
          <label>Completed Duties</label>
          <strong>{completedDuties}</strong>
        </article>
        <article className="tm-stat-card">
          <FileWarning size={18} />
          <label>Reported Incidents</label>
          <strong>{reportedIncidents}</strong>
        </article>
      </div>
    </>
  );

  const renderProfile = () => (
    <section className="tm-panel-card">
      <div className="tm-page-header">
        <h2>Profile</h2>
        <span className="tm-view-only">View Only</span>
      </div>

      <div className="tm-profile-grid">
        <article>
          <label>Name</label>
          <strong>{fullName}</strong>
        </article>
        <article>
          <label>Employee ID</label>
          <strong>{employeeId}</strong>
        </article>
        <article>
          <label>Designation</label>
          <strong>{tmProfileSeed.designation}</strong>
        </article>
        <article>
          <label>Assigned Zone/Division</label>
          <strong>{tmProfileSeed.zoneDivision}</strong>
        </article>
        <article>
          <label>Reporting Officer</label>
          <strong>{tmProfileSeed.reportingOfficer}</strong>
        </article>
      </div>
    </section>
  );

  const renderDuties = () => (
    <>
      <div className="tm-page-header">
        <h2>Assigned Duties</h2>
      </div>

      <section className="tm-panel-card">
        <div className="tm-table tm-cols-5">
          <div className="tm-table-row tm-head">
            <div>Train Number</div>
            <div>Route</div>
            <div>Duty Date</div>
            <div>Status</div>
            <div>View</div>
          </div>
          {duties.map((row) => (
            <div key={row.id} className="tm-table-row">
              <div>{row.trainNo}</div>
              <div>{row.route}</div>
              <div>{row.dutyDate}</div>
              <div>
                <span className={`tm-pill ${row.status === "Completed" ? "ok" : "pending"}`}>{row.status}</span>
              </div>
              <div>Read-Only</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderIncidents = () => (
    <>
      <div className="tm-page-header">
        <h2>Incident Reporting</h2>
      </div>

      <section className="tm-panel-card">
        <form className="tm-form-grid" onSubmit={handleIncidentSubmit}>
          <div className="tm-form-field">
            <label>Train Number</label>
            <input
              value={incidentForm.trainNo}
              onChange={(e) => setIncidentForm((prev) => ({ ...prev, trainNo: e.target.value }))}
              placeholder="Enter train number"
            />
          </div>
          <div className="tm-form-field">
            <label>Date</label>
            <input
              type="date"
              value={incidentForm.date}
              onChange={(e) => setIncidentForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="tm-form-field">
            <label>Incident Type</label>
            <select
              value={incidentForm.type}
              onChange={(e) => setIncidentForm((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option>Delay</option>
              <option>Safety</option>
              <option>Equipment</option>
              <option>Other</option>
            </select>
          </div>
          <div className="tm-form-field tm-form-span-3">
            <label>Description</label>
            <textarea
              value={incidentForm.description}
              onChange={(e) => setIncidentForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe issue"
              rows={3}
            />
          </div>
          <div className="tm-form-action">
            <button type="submit" className="tm-primary-btn">
              Submit Incident
            </button>
          </div>
        </form>
      </section>

      <section className="tm-panel-card">
        <div className="tm-page-header">
          <h3>Reported Incidents</h3>
        </div>
        <div className="tm-table tm-cols-5">
          <div className="tm-table-row tm-head">
            <div>Train Number</div>
            <div>Date</div>
            <div>Type</div>
            <div>Description</div>
            <div>Logged On</div>
          </div>
          {incidents.map((row) => (
            <div key={row.id} className="tm-table-row">
              <div>{row.trainNo}</div>
              <div>{row.date}</div>
              <div>{row.type}</div>
              <div>{row.description}</div>
              <div>{row.createdAt}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderPerformance = () => (
    <>
      <div className="tm-page-header">
        <h2>My Performance</h2>
      </div>

      <div className="tm-stats-grid tm-three-col">
        <article className="tm-stat-card">
          <Gauge size={18} />
          <label>Average Score</label>
          <strong>{averagePerformance}</strong>
        </article>
        <article className="tm-stat-card">
          <BarChart3 size={18} />
          <label>Latest Score</label>
          <strong>{performance[0]?.score || 0}</strong>
        </article>
        <article className="tm-stat-card">
          <ShieldCheck size={18} />
          <label>Current Category</label>
          <strong>{performance[0]?.category || "-"}</strong>
        </article>
      </div>

      <section className="tm-panel-card">
        <div className="tm-table tm-cols-4">
          <div className="tm-table-row tm-head">
            <div>Evaluation Period</div>
            <div>Evaluator</div>
            <div>Score</div>
            <div>Category</div>
          </div>
          {performance.map((row) => (
            <div key={row.id} className="tm-table-row">
              <div>{row.period}</div>
              <div>{row.evaluator}</div>
              <div>{row.score}/100</div>
              <div>{row.category}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderHistory = () => {
    if (selectedScorecard) {
      return renderScorecard();
    }

    return (
      <>
        <div className="tm-page-header">
          <h2>My Test History</h2>
        </div>

        <section className="tm-panel-card">
          <div className="tm-toolbar-row">
            <div className="tm-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by date or test name"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="tm-table tm-cols-4">
            <div className="tm-table-row tm-head">
              <div>Test Date</div>
              <div>Test Name</div>
              <div>Score</div>
              <div>Scorecard</div>
            </div>
            {filteredTestHistory.map((row) => (
              <div key={row.id} className="tm-table-row">
                <div>{row.testDate}</div>
                <div>{row.testName}</div>
                <div>{row.score}/100</div>
                <div>
                  <button type="button" className="tm-link-btn" onClick={() => setSelectedScorecard(normalizeScorecard(row))}>
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
    if (screenMode === "attempt" && activeTest) {
      const question = mcqQuestions[currentQuestion];

      return (
        <>
          <div className="tm-page-header">
            <h2>Test Attempt - {activeTest.name}</h2>
            <span className="tm-view-only">
              Question {currentQuestion + 1}/25 | Answered {answeredCount}
            </span>
          </div>

          <section className="tm-panel-card">
            <article className="tm-question-card">
              <h3>{question.question}</h3>
              <div className="tm-option-grid">
                {question.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={responses[currentQuestion] === index ? "tm-option-btn active" : "tm-option-btn"}
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

            <div className="tm-attempt-actions">
              <button type="button" className="tm-secondary-btn" onClick={saveResponse}>
                Save Response
              </button>

              <div className="tm-inline-actions">
                <button
                  type="button"
                  className="tm-link-btn"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  type="button"
                  className="tm-link-btn"
                  disabled={currentQuestion === 24}
                  onClick={() => setCurrentQuestion((prev) => Math.min(24, prev + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>

              <button type="button" className="tm-primary-btn" onClick={submitTest}>
                Submit Test
              </button>
            </div>

            <p className="tm-note-text">Saved responses: {Object.keys(savedResponses).length}</p>
          </section>
        </>
      );
    }

    return (
      <>
        <div className="tm-page-header">
          <h2>Current Test</h2>
        </div>

        <section className="tm-panel-card">
          <div className="tm-table tm-cols-4">
            <div className="tm-table-row tm-head">
              <div>Test Name</div>
              <div>Assessment Period</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {currentTests.length === 0 ? (
              <div className="tm-empty-state">No tests available.</div>
            ) : (
              currentTests.map((test) => (
                <div key={test.id} className="tm-table-row">
                  <div>{test.name}</div>
                  <div>{test.period}</div>
                  <div>Available</div>
                  <div>
                    <button type="button" className="tm-primary-btn" onClick={() => startTest(test)}>
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
      case "duties":
        return renderDuties();
      case "incidents":
        return renderIncidents();
      case "performance":
        return renderPerformance();
      case "history":
        return renderHistory();
      case "current":
        return renderCurrentTest();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-shell tm-shell">
      <header className="topbar">
        <div className="brand-group">
          <div className="brand-mark">IR</div>
          <h1>Indian Railway Evaluation System</h1>
        </div>
        <div className="topbar-right">
          <div className="admin-badge">
            <div className="avatar">{employeeId.substring(0, 2)}</div>
            <div>
              <strong>Train Manager Console</strong>
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

        <main className="main-content tm-main-content">
          <section className="tm-hero-band">
            <div>
              <p className="tm-eyebrow">Train Manager Workspace</p>
              <h2>{navItems.find((item) => item.key === activePage)?.label || "Dashboard"}</h2>
              <span>Duty monitoring, incident reporting, performance tracking, and test operations.</span>
            </div>
            <div className="tm-kpi-strip">
              <article>
                <label>Duties</label>
                <strong>{totalTrips}</strong>
              </article>
              <article>
                <label>Upcoming</label>
                <strong>{upcomingDuties}</strong>
              </article>
              <article>
                <label>Incidents</label>
                <strong>{reportedIncidents}</strong>
              </article>
            </div>
          </section>

          {statusText && <div className="tm-status-banner">{statusText}</div>}
          {renderBody()}
        </main>
      </div>
    </div>
  );
}

export default TrainManagerModule;
