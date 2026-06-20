import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import SetupPortal from "./components/SetupPortal";
import Courtroom from "./components/Courtroom";
import FeedbackReport from "./components/FeedbackReport";
import GavelLoader from "./components/Common/GavelLoader";
import { Settings, Scale, HelpCircle, X, ShieldAlert, Key } from "lucide-react";

export default function App() {
  // Screen Router: 'landing' | 'setup' | 'courtroom' | 'feedback'
  const [screen, setScreen] = useState("landing");
  const [mode, setMode] = useState("standard"); // 'standard' | 'generative'
  const [caseDetails, setCaseDetails] = useState(null);
  
  // API Key persistent configuration
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  // Post-Hearing Report details
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [sessionTranscript, setSessionTranscript] = useState([]);

  // Transition Load screen state
  const [loaderMessage, setLoaderMessage] = useState(null);

  // Load API Key from localStorage
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

  // Nav actions
  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    setScreen("setup");
  };

  const handleStartHearing = (selectedCase) => {
    setCaseDetails(selectedCase);
    
    // Trigger procedural setup delay loading screen
    setLoaderMessage("Convening Court and Seating Judge...");
    setTimeout(() => {
      setLoaderMessage(null);
      setScreen("courtroom");
    }, 2500);
  };

  const handleFinishSimulation = (report, transcript) => {
    setFeedbackReport(report);
    setSessionTranscript(transcript);
    
    // Trigger report compilation loading screen
    setLoaderMessage("Submitting Transcript to Blind Evaluator...");
    setTimeout(() => {
      setLoaderMessage(null);
      setScreen("feedback");
    }, 3000);
  };

  const handleRetry = () => {
    setLoaderMessage("Re-assembling Docket and Refreshing Bench...");
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
      {/* Dynamic Load Screen */}
      {loaderMessage && <GavelLoader message={loaderMessage} />}

      {/* Modern Authority Header bar */}
      <header 
        style={{ 
          height: "64px", 
          backgroundColor: "var(--bg-secondary)", 
          borderBottom: "1px solid var(--bg-tertiary)", 
          padding: "0 24px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexShrink: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={handleHome}>
          <Scale size={22} style={{ color: "var(--brass-gold)" }} />
          <span style={{ fontFamily: "var(--serif-title)", fontSize: "1.3rem", fontWeight: "bold", letterSpacing: "0.05em" }}>
            VERDICTA
          </span>
          <span className="badge badge-wood" style={{ fontSize: "0.6rem", padding: "1px 5px" }}>v1.0</span>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {apiKey ? (
            <span className="badge badge-brass" style={{ fontSize: "0.7rem" }}>
              Generative Mode Active
            </span>
          ) : (
            <span 
              className="badge badge-wood" 
              style={{ fontSize: "0.7rem", cursor: "pointer" }}
              onClick={() => setShowSettings(true)}
            >
              Offline Mode Only
            </span>
          )}
          
          <button 
            className="btn btn-outline" 
            style={{ padding: "8px" }}
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Screen Content Body */}
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {screen === "landing" && (
          <LandingPage 
            onSelectMode={handleSelectMode} 
            openSettings={() => setShowSettings(true)} 
          />
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

      {/* API Key Configuration Drawer */}
      {showSettings && (
        <div className="settings-panel-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Settings size={20} style={{ color: "var(--brass-gold)" }} />
                Simulator Settings
              </h3>
              <button 
                className="btn btn-outline" 
                style={{ padding: "4px", border: "none" }}
                onClick={() => setShowSettings(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveApiKey} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Key size={14} /> Gemini API Key
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter AIzaSy..."
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                />
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Your API key is saved locally in your browser. It is sent directly to the Google Gemini API to run dynamic, free-form simulation turns and grades.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" className="btn btn-brass" style={{ flexGrow: 1 }}>
                  Save Configuration
                </button>
                {apiKey && (
                  <button 
                    type="button" 
                    className="btn btn-velvet" 
                    onClick={clearApiKey}
                    style={{ flexShrink: 0 }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="docket-card" style={{ marginTop: "auto", borderLeft: "3px solid var(--brass-gold)" }}>
              <h4 style={{ fontSize: "0.85rem", marginBottom: "6px" }}>How to obtain a key?</h4>
              <p style={{ fontSize: "0.72rem" }}>
                Visit the Google AI Studio (aistudio.google.com), create a free Gemini API Key, and paste it here. Verdicta uses the lightweight, fast "gemini-1.5-flash" model.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
