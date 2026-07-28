import React from "react";
import { Award, CheckCircle, XCircle, AlertTriangle, RefreshCw, Home, Scale, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

export default function FeedbackReport({ report, transcript, onRetry, onHome }) {
  if (!report) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>No feedback report available. Please complete a simulation first.</p>
        <button className="btn btn-brass" onClick={onHome} style={{ marginTop: "20px" }}>
          Go to Home
        </button>
      </div>
    );
  }

  const { overallScore, rubrics, strengths, weaknesses, suggestions, auditLog } = report;
  const isPassing = overallScore >= 7.0;
  const isFailed = overallScore < 5.0;

  let sealColor = "#8a6c1c";
  let sealBg = "rgba(138,108,28,0.08)";
  if (isFailed) { sealColor = "#b71c1c"; sealBg = "rgba(183,28,28,0.08)"; }
  else if (isPassing) { sealColor = "#2e7d32"; sealBg = "rgba(46,125,50,0.08)"; }

  const rubricLabels = {
    legalAccuracy: "Legal Accuracy",
    evidenceStrength: "Evidence Strength",
    proceduralCompliance: "Procedural Compliance",
    argumentationClarity: "Argumentation Clarity",
    responseToPressure: "Pressure Handling"
  };

  return (
    <div className="container feedback-container fade-in-up-class">

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="hero-eyebrow" style={{ display: "inline-flex", marginBottom: "12px" }}>
            <Scale size={12} style={{ marginRight: "4px" }} /> Blind Evaluation Engine
          </div>
          <h2 style={{ fontSize: "2rem" }}>Silent Audit Report</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "4px" }}>
            Independent analysis of courtroom performance against strict legal rubrics
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={onHome} style={{ gap: "6px" }}>
            <Home size={14} /> Home
          </button>
          <button className="btn btn-brass" onClick={onRetry} style={{ gap: "6px" }}>
            <RefreshCw size={14} /> Retry Scenario
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="feedback-layout">

        {/* LEFT: Parchment Verdict */}
        <div>
          <div className="verdict-paper">
            <div className="verdict-header">
              <div className="verdict-title">Court of Verdicta AI</div>
              <div className="verdict-subtitle">Interim Observation & Evaluation Report</div>
            </div>

            <div
              className="verdict-score-seal"
              style={{ borderColor: sealColor, color: sealColor, backgroundColor: sealBg }}
            >
              <div className="seal-title">Audit Grade</div>
              <div className="seal-score">{overallScore}</div>
              <div className="seal-total">/ 10</div>
            </div>

            <div className="verdict-content">
              <p>
                <strong>UPON</strong> hearing the arguments presented by Petitioner Counsel and Respondent Counsel, this independent AI Audit Layer has carefully evaluated the proceedings against established legal rubrics.
              </p>
              <p>
                The counsel presented their case with an overall competence grade of <strong>{overallScore}/10</strong>.{" "}
                {overallScore >= 7.5
                  ? "The argument demonstrated advanced legal clarity, structured reasoning, and adequate factual handling. Composure was maintained under adversarial interruptions from the bench."
                  : overallScore >= 5.5
                  ? "While the presentation established a basic cause of action, it remained vulnerable to legal challenges due to insufficient statutory backing and an inability to effectively counter opposing arguments."
                  : "The submission collapsed under judicial pressure. Counsel engaged in emotional assertions, failed to leverage documentary evidence, and missed multiple critical objection opportunities."}
              </p>
              <p>
                The specific findings, identified weaknesses, and remedial recommendations are detailed in the accompanying schedule hereto.
              </p>
            </div>

            <div className="verdict-signature">
              <div className="verdict-signature-block">
                Presiding Registrar
                <br />
                <span style={{ fontSize: "0.7rem", fontStyle: "normal", color: "#7a5f42" }}>Verdicta Audit Layer</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Rubric Scores */}
        <div className="score-details-panel">
          <h3 style={{ fontSize: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
            Scoring Rubric Breakdown
          </h3>

          {Object.entries(rubrics).map(([key, rubric]) => {
            const barColor = rubric.score >= 7.5
              ? "linear-gradient(90deg, var(--brass-dark) 0%, var(--success-light) 100%)"
              : rubric.score < 5.5
              ? "linear-gradient(90deg, var(--wood-grain) 0%, var(--error-light) 100%)"
              : "linear-gradient(90deg, var(--brass-dark) 0%, var(--brass-gold) 100%)";

            return (
              <div key={key} className="score-row">
                <div className="score-row-header">
                  <span className="score-label">{rubricLabels[key]}</span>
                  <span className="score-number">{rubric.score}<span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "400" }}>/10</span></span>
                </div>

                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${rubric.score * 10}%`, background: barColor }} />
                </div>

                <div className="score-rationale">{rubric.rationale}</div>

                <ul className="feedback-checklist">
                  {rubric.checklist.map((item, idx) => (
                    <li key={idx} className={item.met ? "met" : "unmet"}>
                      {item.met
                        ? <CheckCircle size={11} style={{ flexShrink: 0 }} />
                        : <XCircle size={11} style={{ flexShrink: 0 }} />
                      }
                      <span>{item.item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="strengths-weaknesses-grid" style={{ marginTop: "36px" }}>
        <div className="sw-column">
          <div className="sw-header" style={{ color: "var(--success-light)" }}>
            <TrendingUp size={16} />
            <h4 style={{ margin: 0, color: "var(--success-light)", fontSize: "0.95rem", fontFamily: "var(--sans-serif)" }}>Key Strengths</h4>
          </div>
          <ul className="sw-list">
            {strengths.map((str, idx) => (
              <li key={idx} className="sw-item">
                <span style={{ color: "var(--success-light)", fontWeight: "700", flexShrink: 0 }}>+</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sw-column">
          <div className="sw-header" style={{ color: "var(--error-light)" }}>
            <TrendingDown size={16} />
            <h4 style={{ margin: 0, color: "var(--error-light)", fontSize: "0.95rem", fontFamily: "var(--sans-serif)" }}>Critical Weaknesses</h4>
          </div>
          <ul className="sw-list">
            {weaknesses.map((weak, idx) => (
              <li key={idx} className="sw-item">
                <span style={{ color: "var(--error-light)", fontWeight: "700", flexShrink: 0 }}>–</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div style={{
        background: "linear-gradient(145deg, rgba(26,32,48,0.8), rgba(15,18,24,0.8))",
        border: "1px solid rgba(201,152,30,0.15)",
        borderLeft: "3px solid var(--brass-gold)",
        borderRadius: "var(--border-radius-md)",
        padding: "24px 28px",
        marginTop: "8px"
      }}>
        <h4 style={{
          color: "var(--brass-light)",
          fontSize: "1rem",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--sans-serif)"
        }}>
          <Lightbulb size={16} style={{ color: "var(--brass-gold)" }} />
          Actionable Suggestions for the Real Courtroom
        </h4>
        <ul style={{ paddingLeft: "0", display: "flex", flexDirection: "column", gap: "10px", listStyle: "none" }}>
          {suggestions.map((sug, idx) => (
            <li key={idx} style={{ display: "flex", gap: "10px", fontSize: "0.88rem", color: "var(--text-secondary)", alignItems: "flex-start" }}>
              <span style={{ color: "var(--brass-gold)", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>{idx + 1}.</span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Audit Log */}
      <div className="audit-container">
        <h3 style={{ fontSize: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "18px" }}>
          Granular Transcript Audit
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "22px", lineHeight: "1.65" }}>
          The AI evaluator has annotated each statement in the hearing transcript with specific legal insights and etiquette observations.
        </p>

        <div>
          {auditLog && auditLog.length > 0 ? (
            auditLog.map((log, idx) => (
              <div key={idx} className="audit-item">
                <div className={`audit-speaker ${log.speaker}`}>
                  {log.speaker === "user" ? "Advocate (You)" : log.speaker}
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontStyle: "italic", marginBottom: "8px", lineHeight: "1.65" }}>
                    "{log.text}"
                  </div>
                  {log.commentary && (
                    <div className={`audit-commentary ${log.evaluation}`}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        {log.evaluation === "positive"
                          ? <CheckCircle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
                          : log.evaluation === "negative"
                          ? <XCircle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
                          : <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
                        }
                        <span>{log.commentary}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            transcript.filter(h => h.speaker === "user").map((msg, idx) => (
              <div key={idx} className="audit-item">
                <div className="audit-speaker user">Advocate (You)</div>
                <div>
                  <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontStyle: "italic", marginBottom: "8px" }}>
                    "{msg.text}"
                  </div>
                  <div className="audit-commentary neutral">
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
                      <span>Statement recorded. Focus on citing specific sections and primary documents to score higher.</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginTop: "40px" }}>
        <button className="btn btn-brass" onClick={onRetry} style={{ padding: "14px 32px", gap: "8px" }}>
          <RefreshCw size={15} /> Re-argue This Case
        </button>
        <button className="btn btn-outline" onClick={onHome} style={{ padding: "14px 32px", gap: "8px" }}>
          <Home size={15} /> Back to Home
        </button>
      </div>

    </div>
  );
}
