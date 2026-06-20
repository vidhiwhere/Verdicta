import React from "react";
import { Award, CheckCircle, XCircle, AlertTriangle, RefreshCw, Home, FileText, Compass, HeartCrack } from "lucide-react";

export default function FeedbackReport({ report, transcript, onRetry, onHome }) {
  if (!report) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <p>No feedback report is available. Please complete a simulation first.</p>
        <button className="btn btn-brass" onClick={onHome} style={{ marginTop: "20px" }}>
          Go to Home
        </button>
      </div>
    );
  }

  const { overallScore, rubrics, strengths, weaknesses, suggestions, auditLog } = report;

  // Determine judgment seal stamp color based on score
  const isPassing = overallScore >= 7.0;
  const isFailed = overallScore < 5.0;
  let sealColor = "var(--brass-dark)";
  if (isFailed) sealColor = "var(--error)";
  else if (isPassing) sealColor = "var(--success)";

  return (
    <div className="container feedback-container fade-in-up-class">
      
      {/* 1. Header Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <span className="hero-subtitle">Performance Evaluation</span>
          <h2>Silent Audit Report</h2>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-outline" onClick={onHome}>
            <Home size={16} /> Home
          </button>
          <button className="btn btn-brass" onClick={onRetry}>
            <RefreshCw size={16} /> Retry Scenario
          </button>
        </div>
      </div>

      {/* 2. Double-Column Layout */}
      <div className="feedback-layout">
        
        {/* Column Left: Parchment Judgment Order */}
        <div>
          <div className="verdict-paper">
            <div className="verdict-header">
              <div className="verdict-title">Court of Verdicta AI</div>
              <div className="verdict-subtitle">INTERIM OBSERVATION & REPORT</div>
            </div>

            <div 
              className="verdict-score-seal" 
              style={{ 
                borderColor: sealColor, 
                color: sealColor, 
                backgroundColor: isFailed ? "rgba(198,40,40,0.03)" : "rgba(46,125,50,0.03)" 
              }}
            >
              <div className="seal-title">AUDIT GRADE</div>
              <div className="seal-score">{overallScore}</div>
              <div className="seal-total">OUT OF 10</div>
            </div>

            <div className="verdict-content">
              <p>
                <strong>UPON</strong> hearing the arguments presented by Petitioner Counsel and Respondent Counsel, this independent AI Audit Layer has evaluated the proceedings.
              </p>
              <p>
                The speaker presented their case with an overall competence score of {overallScore}/10. 
                {overallScore >= 7.5 ? (
                  " The argument showed advanced legal clarity, structured reasoning, and adequate handling of facts. Composure was maintained under adversarial interruptions."
                ) : overallScore >= 5.5 ? (
                  " While the presentation established a basic cause of action, it was heavily vulnerable to legal challenges due to lacking statutory backing and an inability to counter the opponent's counterarguments effectively."
                ) : (
                  " The submission collapsed under pressure. Counsel engaged in emotional assertions, failed to leverage documentary evidence, and missed multiple opportunities to object to invalid claims."
                )}
              </p>
              <p>
                Accordingly, the specific findings, weaknesses in pleading structure, and remedial recommendations are attached in the accompanying schedule hereto.
              </p>
            </div>

            <div className="verdict-signature">
              <div className="verdict-signature-block">
                Presiding Registrar<br />
                <span style={{ fontSize: "0.75rem", fontStyle: "normal", color: "#6e5e4f" }}>Verdicta Audit Layer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column Right: Strict Scoring Rubrics */}
        <div className="score-details-panel">
          <h3 style={{ fontSize: "1.3rem", borderBottom: "1px solid var(--bg-tertiary)", paddingBottom: "10px" }}>
            Scoring Rubric Breakdown
          </h3>

          {Object.entries(rubrics).map(([key, rubric]) => {
            // Human readable label mappings
            const labels = {
              legalAccuracy: "Legal Accuracy",
              evidenceStrength: "Evidence Strength",
              proceduralCompliance: "Procedural Compliance",
              argumentationClarity: "Argumentation Clarity",
              responseToPressure: "Pressure Handling"
            };

            return (
              <div key={key} className="score-row">
                <div className="score-row-header">
                  <span className="score-label">{labels[key]}</span>
                  <span className="score-number">{rubric.score} / 10</span>
                </div>

                <div className="score-bar-bg">
                  <div 
                    className="score-bar-fill" 
                    style={{ 
                      width: `${rubric.score * 10}%`,
                      background: rubric.score >= 7.5 
                        ? "linear-gradient(90deg, var(--brass-dark) 0%, var(--success) 100%)"
                        : rubric.score < 5.5
                        ? "linear-gradient(90deg, var(--wood-grain) 0%, var(--error) 100%)"
                        : "linear-gradient(90deg, var(--brass-dark) 0%, var(--brass-gold) 100%)"
                    }}
                  ></div>
                </div>

                <div className="score-rationale">{rubric.rationale}</div>

                {/* Rubric Checklist (Hard Rules validation) */}
                <ul className="feedback-checklist">
                  {rubric.checklist.map((item, idx) => (
                    <li key={idx} className={item.met ? "met" : "unmet"}>
                      {item.met ? (
                        <CheckCircle size={12} style={{ flexShrink: 0 }} />
                      ) : (
                        <XCircle size={12} style={{ flexShrink: 0 }} />
                      )}
                      <span>{item.item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Strengths and Weaknesses Grid */}
      <div className="strengths-weaknesses-grid" style={{ marginTop: "40px" }}>
        
        {/* Column Strengths */}
        <div className="sw-column">
          <div className="sw-header" style={{ color: "var(--success)" }}>
            <CheckCircle size={18} />
            <h4 style={{ margin: 0, color: "var(--success)" }}>Key Strengths</h4>
          </div>
          <ul className="sw-list">
            {strengths.map((str, idx) => (
              <li key={idx} className="sw-item">
                <span style={{ color: "var(--success)", fontWeight: "bold" }}>+</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column Weaknesses */}
        <div className="sw-column">
          <div className="sw-header" style={{ color: "#ff8a80" }}>
            <HeartCrack size={18} style={{ color: "var(--error)" }} />
            <h4 style={{ margin: 0, color: "var(--error)" }}>Critical Weaknesses</h4>
          </div>
          <ul className="sw-list">
            {weaknesses.map((weak, idx) => (
              <li key={idx} className="sw-item">
                <span style={{ color: "var(--error)", fontWeight: "bold" }}>-</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Actionable Suggestions */}
      <div className="docket-card" style={{ padding: "24px", marginTop: "30px", borderLeft: "4px solid var(--brass-gold)" }}>
        <h4 style={{ color: "var(--brass-light)", fontSize: "1.1rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={18} style={{ color: "var(--brass-gold)" }} />
          Actionable Suggestions for the Real Courtroom
        </h4>
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          {suggestions.map((sug, idx) => (
            <li key={idx}>{sug}</li>
          ))}
        </ul>
      </div>

      {/* 5. Transcript Audit Feed (Granular Breakdown) */}
      <div className="audit-container">
        <h3 style={{ fontSize: "1.3rem", borderBottom: "1px solid var(--bg-tertiary)", paddingBottom: "12px", marginBottom: "20px" }}>
          Granular Transcript Audit
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
          Review the hearing line-by-line. The AI evaluator has analyzed your statements and annotated them with specific legal insights and mistakes.
        </p>

        <div>
          {auditLog && auditLog.length > 0 ? (
            auditLog.map((log, idx) => (
              <div key={idx} className="audit-item">
                <div className={`audit-speaker ${log.speaker}`}>
                  {log.speaker === "user" ? "Advocate (You)" : log.speaker}
                </div>
                <div>
                  <div style={{ fontSize: "0.92rem", color: "var(--text-primary)", fontStyle: "italic", marginBottom: "8px" }}>
                    "{log.text}"
                  </div>
                  {log.commentary && (
                    <div className={`audit-commentary ${log.evaluation}`}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        {log.evaluation === "positive" ? (
                          <CheckCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                        ) : log.evaluation === "negative" ? (
                          <XCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                        ) : (
                          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                        )}
                        <span>{log.commentary}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Fallback for standard mode if audit log was not mapped
            transcript.filter(h => h.speaker === "user").map((msg, idx) => (
              <div key={idx} className="audit-item">
                <div className="audit-speaker user">Advocate (You)</div>
                <div>
                  <div style={{ fontSize: "0.92rem", color: "var(--text-primary)", fontStyle: "italic", marginBottom: "8px" }}>
                    "{msg.text}"
                  </div>
                  <div className="audit-commentary warning">
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>Speech was accepted. Focus on citing sections and primary files to score higher.</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "40px" }}>
        <button className="btn btn-brass" onClick={onRetry} style={{ padding: "14px 28px" }}>
          <RefreshCw size={16} /> Re-argue This Case
        </button>
        <button className="btn btn-outline" onClick={onHome} style={{ padding: "14px 28px" }}>
          <Home size={16} /> Back to Landing Page
        </button>
      </div>

    </div>
  );
}
