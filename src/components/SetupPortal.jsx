import React, { useState } from "react";
import { ArrowLeft, UploadCloud, Trash, Key, AlertCircle, FileText } from "lucide-react";
import { mockScenarios } from "../data/mockScenarios";

export default function SetupPortal({ 
  mode, 
  onBack, 
  onStartHearing, 
  apiKey, 
  openSettings 
}) {
  // Standard Mode State
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);

  // Generative Mode States
  const [courtType, setCourtType] = useState("Civil Court");
  const [petitioner, setPetitioner] = useState("Rahul Mehta");
  const [respondent, setRespondent] = useState("Big-Tech Logistics Corp.");
  const [userSide, setUserSide] = useState("petitioner");
  const [dispute, setDispute] = useState("");
  const [language, setLanguage] = useState("English");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Drag and drop mock file upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addMockFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      addMockFiles(e.target.files);
    }
  };

  const addMockFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      desc: "Uploaded legal document scan."
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const deleteFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitGenerative = (e) => {
    e.preventDefault();
    if (!apiKey) {
      alert("Please configure your Gemini API Key in Settings (bottom right) before starting Generative Mode.");
      openSettings();
      return;
    }
    if (!dispute.trim()) {
      alert("Please describe the dispute facts first.");
      return;
    }

    const customCaseDetails = {
      id: "custom-generative",
      title: `${courtType} Hearing: ${petitioner} vs ${respondent}`,
      courtType,
      petitioner,
      respondent,
      userSide,
      dispute,
      language,
      documents: uploadedFiles,
      acts: [
        { section: "General Law", act: "Applicable Statutes", desc: "AI will cite relevant legal acts dynamically." }
      ]
    };
    onStartHearing(customCaseDetails);
  };

  const handleStartStandard = (scenario) => {
    onStartHearing(scenario);
  };

  return (
    <div className="container fade-in-up-class" style={{ padding: "40px 24px" }}>
      {/* Back Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <button className="btn btn-outline" style={{ padding: "8px 12px" }} onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Go Back
        </span>
      </div>

      {mode === "standard" ? (
        <div>
          <h2 style={{ marginBottom: "12px" }}>Select a Case Scenario</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "600px" }}>
            Choose one of our pre-configured mock scenarios developed in consultation with legal experts. Each scenario includes fixed dialogue paths, custom objections, and pre-defined grading benchmarks.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
            {mockScenarios.map((scenario) => (
              <div 
                key={scenario.id} 
                className={`wood-panel`} 
                style={{ 
                  padding: "30px", 
                  textAlign: "left", 
                  cursor: "pointer", 
                  border: selectedScenarioId === scenario.id ? "2px solid var(--brass-gold)" : "2px solid var(--brass-dark)",
                  boxShadow: selectedScenarioId === scenario.id ? "0 0 15px rgba(207, 161, 47, 0.3)" : "none"
                }}
                onClick={() => setSelectedScenarioId(scenario.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <span className="badge badge-brass">{scenario.courtType}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{scenario.jurisdiction}</span>
                </div>
                
                <h3 style={{ marginBottom: "12px", color: "var(--text-primary)" }}>{scenario.title}</h3>
                
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px", height: "70px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {scenario.dispute}
                </p>

                <div style={{ borderTop: "1px dashed var(--text-muted)", paddingTop: "12px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Key Citations:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {scenario.acts.map((act, i) => (
                      <span key={i} style={{ fontSize: "0.72rem", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "3px", color: "var(--brass-light)" }}>
                        {act.section}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  className="btn btn-brass" 
                  style={{ width: "100%" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartStandard(scenario);
                  }}
                >
                  Start Hearing
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px" }}>
          {/* Form Side */}
          <div>
            <h2 style={{ marginBottom: "12px" }}>Setup Generative Case Profile</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
              Input any dispute or legal scenario. The Judge AI and Opposing Counsel will generate responses dynamically, while the Feedback engine performs a blind assessment.
            </p>

            <form onSubmit={handleSubmitGenerative} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Petitioner Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={petitioner} 
                    onChange={e => setPetitioner(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Respondent Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={respondent} 
                    onChange={e => setRespondent(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Court / Tribunal Type</label>
                  <select 
                    className="form-control" 
                    value={courtType} 
                    onChange={e => setCourtType(e.target.value)}
                  >
                    <option value="Civil Court">Civil Court</option>
                    <option value="Consumer Forum">Consumer Forum</option>
                    <option value="Labour Tribunal">Labour Tribunal</option>
                    <option value="Family Court">Family Court</option>
                    <option value="High Court">High Court</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hearing Language</label>
                  <select 
                    className="form-control" 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (Mock/Mixed)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Representing Side</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    type="button" 
                    className={`btn ${userSide === "petitioner" ? "btn-brass" : "btn-outline"}`}
                    style={{ flex: 1 }}
                    onClick={() => setUserSide("petitioner")}
                  >
                    Petitioner (Claimant)
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${userSide === "respondent" ? "btn-brass" : "btn-outline"}`}
                    style={{ flex: 1 }}
                    onClick={() => setUserSide("respondent")}
                  >
                    Respondent (Defendant)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Case Dispute & Facts</label>
                <textarea 
                  className="form-control" 
                  rows="5"
                  placeholder="Describe the legal issue in detail. State what your client claims, what the opponent argues, and what the key evidence is. (e.g. My client is suing for refund of advance payment, opponent claims work was completed...)"
                  value={dispute}
                  onChange={e => setDispute(e.target.value)}
                  required
                ></textarea>
              </div>

              {!apiKey && (
                <div className="velvet-felt" style={{ padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px", border: "1px solid var(--velvet-bright)" }}>
                  <AlertCircle style={{ color: "#ff8a80", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ color: "#ff8a80", fontSize: "0.9rem", marginBottom: "4px" }}>API Key Needed</h4>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      Generative AI mode requires a Gemini API Key to run. Enter your key in settings at the bottom right of the screen before clicking Start.
                    </p>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-brass" 
                style={{ width: "100%", padding: "16px" }}
              >
                Assemble Courtroom & Start
              </button>
            </form>
          </div>

          {/* Upload Side */}
          <div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Upload Case Files</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Attach pleadings, lease agreements, receipts, photos, or notices to reference in court.
            </p>

            {/* Drag & Drop Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? "2px dashed var(--brass-gold)" : "2px dashed var(--bg-tertiary)",
                backgroundColor: dragActive ? "rgba(207, 161, 47, 0.03)" : "rgba(255,255,255,0.01)",
                borderRadius: "var(--border-radius-md)",
                padding: "30px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all var(--transition-fast)"
              }}
              onClick={() => document.getElementById("file-upload-input").click()}
            >
              <UploadCloud size={36} style={{ color: "var(--text-secondary)", marginBottom: "12px" }} />
              <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Drag & drop files here</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>or click to browse from device</div>
              <input 
                id="file-upload-input" 
                type="file" 
                multiple 
                style={{ display: "none" }} 
                onChange={handleFileChange}
              />
            </div>

            {/* Uploaded File List */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div className="form-label" style={{ marginBottom: "10px" }}>Attached Docket ({uploadedFiles.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="docket-card"
                      style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                      <FileText size={18} style={{ color: "var(--brass-gold)" }} />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{file.size}</div>
                      </div>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: "4px 8px", border: "none" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(index);
                        }}
                      >
                        <Trash size={14} style={{ color: "var(--error)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
