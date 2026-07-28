import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import SetupPortal from "./components/SetupPortal";
import Courtroom from "./components/Courtroom";
import FeedbackReport from "./components/FeedbackReport";
import GavelLoader from "./components/Common/GavelLoader";
import { Settings, Scale, X, Key } from "lucide-react";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [mode, setMode] = useState("standard");
  const [caseDetails, setCaseDetails] = useState(null);

  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  const [feedbackReport, setFeedbackReport] = useState(null);
  const [sessionTranscript, setSessionTranscript] = useState([]);

  const [loaderMessage, setLoaderMessage] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("VERDICTA_GEMINI_KEY");
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }
  }, []);

  const saveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem("VERDICTA_GEMINI_KEY", tempApiKey.trim());
    setApiKey(tempApiKey.trim());
    setShowSettings(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem("VERDICTA_GEMINI_KEY");
    setApiKey("");
    setTempApiKey("");
  };

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    setScreen("setup");
  };

  const handleStartHearing = (selectedCase) => {
    setCaseDetails(selectedCase);
    setLoaderMessage("Convening Court and Seating the Bench...");
    setTimeout(() => {
      setLoaderMessage(null);
      setScreen("courtroom");
    }, 2500);
  };

  const handleFinishSimulation = (report, transcript) => {
    setFeedbackReport(report);
    setSessionTranscript(transcript);
    setLoaderMessage("Transmitting Transcript to Blind Evaluator...");
    setTimeout(() => {
      setLoaderMessage(null);
      setScreen("feedback");
    }, 3000);
  };

  const handleRetry = () => {
    setLoaderMessage("Re-assembling Docket...");
    setTimeout(() => {
      setLoaderMessage(null);
      setScreen("courtroom");
    }, 2000);
  };

  const handleHome = () => {
    setCaseDetails(null);
    setFeedbackReport(null);
    setSessionTranscript([]);
    setScreen("landing");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {loaderMessage && <GavelLoader message={loaderMessage} />}

      {/* Header */}
      <header style={{
        height: "64px",
        background: "linear-gradient(to right, var(--bg-secondary), #0d1018)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "0 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 10
      }}>
        {/* Bottom gold line accent */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "1px",
          background: "linear-gradient(to right, transparent 0%, rgba(201,152,30,0.4) 30%, rgba(201,152,30,0.4) 70%, transparent 100%)"
        }} />

        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={handleHome}
        >
          <div style={{
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, rgba(201,152,30,0.15), rgba(201,152,30,0.05))",
            border: "1px solid rgba(201,152,30,0.3)",
            borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Scale size={16} style={{ color: "var(--brass-gold)" }} />
          </div>
          <span style={{
            fontFamily: "var(--display-font)",
            fontSize: "1.2rem",
            fontWeight: "700",
            letterSpacing: "0.12em",
            color: "var(--brass-light)"
          }}>
            VERDICTA
          </span>
          <span className="badge badge-wood" style={{ fontSize: "0.55rem", padding: "2px 6px" }}>v1.0</span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {apiKey ? (
            <span className="badge badge-brass" style={{ fontSize: "0.62rem" }}>
              ● Generative Mode Active
            </span>
          ) : (
            <span
              className="badge badge-wood"
              style={{ fontSize: "0.62rem", cursor: "pointer" }}
              onClick={() => setShowSettings(true)}
            >
              ○ Offline Mode
            </span>
          )}

          <button
            className="btn btn-outline"
            style={{ padding: "7px 10px", gap: "6px", fontSize: "0.72rem" }}
            onClick={() => setShowSettings(true)}
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {screen === "landing" && (
          <LandingPage onSelectMode={handleSelectMode} openSettings={() => setShowSettings(true)} />
        )}
        {screen === "setup" && (
          <SetupPortal
            mode={mode}
            apiKey={apiKey}
            onBack={handleHome}
            onStartHearing={handleStartHearing}
            openSettings={() => setShowSettings(true)}
          />
        )}
        {screen === "courtroom" && (
          <Courtroom
            caseDetails={caseDetails}
            mode={mode}
            apiKey={apiKey}
            onFinishSimulation={handleFinishSimulation}
          />
        )}
        {screen === "feedback" && (
          <FeedbackReport
            report={feedbackReport}
            transcript={sessionTranscript}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        )}
      </main>

      {/* Settings Drawer */}
      {showSettings && (
        <div className="settings-panel-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--serif-title)" }}>
                <Settings size={18} style={{ color: "var(--brass-gold)" }} />
                Simulator Settings
              </h3>
              <button
                className="btn btn-outline"
                style={{ padding: "5px", border: "none" }}
                onClick={() => setShowSettings(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveApiKey} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Key size={12} /> Gemini API Key
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                />
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
                  Your key is stored locally in your browser and sent directly to the Google Gemini API.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="btn btn-brass" style={{ flexGrow: 1 }}>
                  Save Configuration
                </button>
                {apiKey && (
                  <button type="button" className="btn btn-velvet" onClick={clearApiKey} style={{ flexShrink: 0 }}>
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="docket-card" style={{ marginTop: "auto", borderLeft: "2px solid var(--brass-gold)", padding: "14px" }}>
              <h4 style={{ fontSize: "0.82rem", marginBottom: "6px" }}>How to get a key?</h4>
              <p style={{ fontSize: "0.72rem", lineHeight: "1.65" }}>
                Visit <span style={{ color: "var(--brass-light)" }}>aistudio.google.com</span>, create a free API key, and paste it above. Verdicta uses the <strong>gemini-1.5-flash</strong> model.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
