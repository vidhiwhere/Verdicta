import React from "react";
import { Scale, Gavel, Award, ShieldAlert, BookOpen, Compass, Zap, ChevronRight } from "lucide-react";

export default function LandingPage({ onSelectMode, openSettings }) {
  return (
    <div className="hero-section fade-in-up-class">
      {/* Subtle background glow */}
      <div className="scales-bg">
        <Scale size={600} />
      </div>

      <div className="container">
        {/* Eyebrow */}
        <div className="hero-eyebrow">
          India's Premier Legal Simulation Platform
        </div>

        <h1 className="hero-title">Practice Before<br/>You Plead</h1>

        <p className="hero-desc">
          Step into a high-fidelity courtroom simulator. Argue before an adversarial AI Judge,
          counter an aggressive opposing counsel, and receive a cold, objective performance audit
          graded against strict Indian legal rubrics.
        </p>

        {/* Mode Cards */}
        <div className="mode-cards">
          {/* Standard Practice */}
          <div
            className="mode-card"
            onClick={() => onSelectMode("standard")}
          >
            <div className="card-icon">
              <Compass size={28} />
            </div>
            <h3>Standard Practice</h3>
            <p>
              High-fidelity, branch-mapped simulations across three pre-built legal disputes.
              Fully offline — no API key required. Pick your argument, handle objections, and
              face the bench.
            </p>
            <span className="badge badge-brass" style={{ alignSelf: "flex-start", marginBottom: "20px" }}>
              No API Key Required
            </span>
            <button className="btn btn-brass" style={{ width: "100%", padding: "14px" }}>
              <Compass size={16} /> Launch Case Studies <ChevronRight size={14} />
            </button>
          </div>

          {/* Generative AI */}
          <div
            className="mode-card"
            onClick={() => onSelectMode("generative")}
          >
            <div className="card-icon">
              <Zap size={28} />
            </div>
            <h3>Generative AI Mode</h3>
            <p>
              Input any legal dispute, upload documents, and select your jurisdiction. Free-form,
              infinite-turn dialogue with a live Gemini AI Judge and Opposing Counsel — fully
              dynamic and unpredictable.
            </p>
            <span className="badge badge-velvet" style={{ alignSelf: "flex-start", marginBottom: "20px" }}>
              Requires Gemini API Key
            </span>
            <button className="btn btn-velvet" style={{ width: "100%", padding: "14px" }}>
              <Zap size={16} /> Configure Custom Case <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="hero-divider">
          <div className="hero-divider-line" />
          <div className="hero-divider-icon"><Scale size={16} /></div>
          <div className="hero-divider-line" />
        </div>

        {/* Feature Grid */}
        <div>
          <h2 style={{ textAlign: "center", marginBottom: "32px", fontSize: "1.6rem", opacity: 0.9 }}>
            Engineered for Objective Preparation
          </h2>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-card-icon">
                <ShieldAlert size={20} />
                <h4>Adversarial Judge AI</h4>
              </div>
              <p>
                Instructed never to validate — only to challenge every assertion, find every gap,
                and ask the hardest questions possible from the bench.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <Scale size={20} />
                <h4>Blind Evaluation Engine</h4>
              </div>
              <p>
                A separate AI evaluator analyzes the transcript without knowing which side you
                represent — ensuring fully unbiased legal auditing.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <Award size={20} />
                <h4>Strict Legal Rubrics</h4>
              </div>
              <p>
                Scores across Legal Accuracy, Evidence Strength, Procedural Compliance, and Pressure
                Handling — with hard-blocked ceilings unless statute citations are made.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon">
                <BookOpen size={20} />
                <h4>Objection Training</h4>
              </div>
              <p>
                Opposing counsel plants objectionable statements. Identify hearsay, speculation,
                and irrelevance in real time before the window closes.
              </p>
            </div>
          </div>
        </div>

        {/* API Key shortcut */}
        <div style={{ marginTop: "40px", fontSize: "0.82rem", color: "var(--text-muted)", textAlign: "center" }}>
          Already have a Gemini API Key?{" "}
          <span
            onClick={openSettings}
            style={{ color: "var(--brass-gold)", cursor: "pointer", textDecoration: "underline" }}
          >
            Configure it in Settings
          </span>{" "}
          to enable Generative AI Mode.
        </div>
      </div>
    </div>
  );
}
