import React, { useState } from "react";
import { ArrowLeft, UploadCloud, Trash, Key, AlertCircle, FileText, Scale, Gavel, Briefcase } from "lucide-react";
import { mockScenarios } from "../data/mockScenarios";

const courtIcons = {
  "Civil Court": <Scale size={22} />,
  "Consumer Forum": <Briefcase size={22} />,
  "Labour Tribunal": <Gavel size={22} />,
};

export default function SetupPortal({
  mode,
  onBack,
  onStartHearing,
  apiKey,
  openSettings
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);

  const [courtType, setCourtType] = useState("Civil Court");
  const [petitioner, setPetitioner] = useState("Rahul Mehta");
  const [respondent, setRespondent] = useState("Big-Tech Logistics Corp.");
  const [userSide, setUserSide] = useState("petitioner");
  const [dispute, setDispute] = useState("");
  const [language, setLanguage] = useState("English");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) addMockFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) addMockFiles(e.target.files);
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
      acts: [{ section: "General Law", act: "Applicable Statutes", desc: "AI will cite relevant legal acts dynamically." }]
    };
    onStartHearing(customCaseDetails);
  };

  return (
    <div style={{ padding: "36px 0 60px" }} className="fade-in-up-class">
      <div className="container">
        {/* Back */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px" }}>
          <button className="btn btn-outline" style={{ padding: "8px 14px", gap: "6px" }} onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
          <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        {mode === "standard" ? (
          <>
            <div style={{ marginBottom: "36px" }}>
              <div className="hero-eyebrow" style={{ display: "inline-flex", marginBottom: "16px" }}>
                Standard Practice Mode
              </div>
              <h2 style={{ marginBottom: "10px", fontSize: "2rem" }}>Select a Case Scenario</h2>
              <p style={{ color: "var(--text-secondary)", maxWidth: "580px", lineHeight: "1.7", fontSize: "0.95rem" }}>
                Pre-configured scenarios developed against strict legal rubrics. Each includes fixed dialogue paths, custom objection windows, and graded benchmarks.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
              {mockScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`scenario-card ${selectedScenarioId === scenario.id ? "selected" : ""}`}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                >
                  {/* Top badges */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <span className="badge badge-brass">{scenario.courtType}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      {scenario.jurisdiction?.split(",")[0]}
                    </span>
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: "48px", height: "48px",
                    background: "rgba(201,152,30,0.08)",
                    border: "1px solid rgba(201,152,30,0.18)",
                    borderRadius: "var(--border-radius-md)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--brass-gold)", marginBottom: "16px"
                  }}>
                    {courtIcons[scenario.courtType] || <Scale size={22} />}
                  </div>

                  <h3 style={{ marginBottom: "8px", fontSize: "1.25rem" }}>{scenario.title}</h3>

                  <p style={{
                    fontSize: "0.84rem",
                    color: "var(--text-secondary)",
                    marginBottom: "20px",
                    lineHeight: "1.65",
                    height: "72px",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {scenario.dispute}
                  </p>

                  {/* Acts */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", marginBottom: "8px", fontFamily: "var(--display-font)" }}>
                      Key Statutes
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {scenario.acts.map((act, i) => (
                        <span key={i} style={{
                          fontSize: "0.68rem",
                          background: "rgba(201,152,30,0.08)",
                          border: "1px solid rgba(201,152,30,0.15)",
                          padding: "3px 9px",
                          borderRadius: "999px",
                          color: "var(--brass-light)"
                        }}>
                          {act.section}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Docs count */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <FileText size={13} />
                      <span>{scenario.documents.length} documents attached</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-brass"
                    style={{ width: "100%", padding: "13px" }}
                    onClick={(e) => { e.stopPropagation(); onStartHearing(scenario); }}
                  >
                    Convene Courtroom →
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "48px", alignItems: "flex-start" }}>
            {/* Form */}
            <div>
              <div className="hero-eyebrow" style={{ display: "inline-flex", marginBottom: "16px" }}>
                Generative AI Mode
              </div>
              <h2 style={{ marginBottom: "10px", fontSize: "2rem" }}>Setup Your Case Profile</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: "1.7", fontSize: "0.95rem" }}>
                Describe any legal dispute. The Judge AI and Opposing Counsel will dynamically generate adversarial arguments while the Feedback Engine performs a blind evaluation.
              </p>

              <form onSubmit={handleSubmitGenerative} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Petitioner / Claimant</label>
                    <input type="text" className="form-control" value={petitioner} onChange={e => setPetitioner(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Respondent / Defendant</label>
                    <input type="text" className="form-control" value={respondent} onChange={e => setRespondent(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Court / Tribunal</label>
                    <select className="form-control" value={courtType} onChange={e => setCourtType(e.target.value)}>
                      <option value="Civil Court">Civil Court</option>
                      <option value="Consumer Forum">Consumer Forum</option>
                      <option value="Labour Tribunal">Labour Tribunal</option>
                      <option value="Family Court">Family Court</option>
                      <option value="High Court">High Court</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hearing Language</label>
                    <select className="form-control" value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (Mixed)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Representing Side</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      className={`btn ${userSide === "petitioner" ? "btn-brass" : "btn-outline"}`}
                      style={{ flex: 1, padding: "11px" }}
                      onClick={() => setUserSide("petitioner")}
                    >
                      Petitioner (Claimant)
                    </button>
                    <button
                      type="button"
                      className={`btn ${userSide === "respondent" ? "btn-brass" : "btn-outline"}`}
                      style={{ flex: 1, padding: "11px" }}
                      onClick={() => setUserSide("respondent")}
                    >
                      Respondent (Defendant)
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Case Dispute & Key Facts</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Describe the legal issue in detail: what your client claims, what the opponent argues, and the key evidence available..."
                    value={dispute}
                    onChange={e => setDispute(e.target.value)}
                    required
                  />
                </div>

                {!apiKey && (
                  <div style={{
                    background: "rgba(90,19,24,0.2)",
                    border: "1px solid var(--velvet-bright)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px"
                  }}>
                    <AlertCircle size={18} style={{ color: "#f48a80", flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <h4 style={{ color: "#f48a80", fontSize: "0.88rem", marginBottom: "4px", fontFamily: "var(--sans-serif)" }}>API Key Required</h4>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                        Generative AI Mode requires a Gemini API key.{" "}
                        <span style={{ color: "var(--brass-gold)", cursor: "pointer", textDecoration: "underline" }} onClick={openSettings}>
                          Configure it here →
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-brass" style={{ width: "100%", padding: "16px", fontSize: "0.85rem" }}>
                  <Gavel size={16} /> Assemble Courtroom & Start Hearing
                </button>
              </form>
            </div>

            {/* Upload side */}
            <div style={{ position: "sticky", top: "20px" }}>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>Case Documents</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.65" }}>
                Attach pleadings, agreements, receipts, or notices to reference in court.
              </p>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload-input").click()}
                style={{
                  border: `2px dashed ${dragActive ? "var(--brass-gold)" : "rgba(255,255,255,0.1)"}`,
                  background: dragActive ? "rgba(201,152,30,0.04)" : "rgba(255,255,255,0.01)",
                  borderRadius: "var(--border-radius-lg)",
                  padding: "36px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  backdropFilter: "blur(4px)"
                }}
              >
                <UploadCloud size={32} style={{ color: dragActive ? "var(--brass-gold)" : "var(--text-muted)", marginBottom: "12px", transition: "color 0.2s" }} />
                <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Drag & drop files here
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>or click to browse from device</div>
                <input id="file-upload-input" type="file" multiple style={{ display: "none" }} onChange={handleFileChange} />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", marginBottom: "4px", fontFamily: "var(--display-font)" }}>
                    Attached Docket ({uploadedFiles.length})
                  </div>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="docket-card" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px" }}>
                      <FileText size={16} style={{ color: "var(--brass-gold)", flexShrink: 0 }} />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{file.size}</div>
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "4px 6px", border: "none", flexShrink: 0 }}
                        onClick={(e) => { e.stopPropagation(); deleteFile(index); }}
                      >
                        <Trash size={13} style={{ color: "var(--error-light)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
