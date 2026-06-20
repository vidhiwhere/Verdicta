import React from "react";
import { Scale, Gavel, Award, ShieldAlert, HelpCircle, Compass } from "lucide-react";

export default function LandingPage({ onSelectMode, openSettings }) {
  return (
    <div className="hero-section fade-in-up-class">
      {/* Interactive visual elements */}
      <div className="scales-bg">
        <Scale size={500} />
      </div>

      <div className="container">
        <div className="hero-subtitle">Courtroom Flight Simulator</div>
        <h1 className="hero-title">Practice Before You Plead</h1>
        <p className="hero-desc">
          Prepare for actual court proceedings by simulating hearings end-to-end. Arguing before an adversarial AI Judge and aggressive Opposing Counsel, you will receive a cold, objective performance audit graded against strict legal rubrics.
        </p>

        <div className="mode-cards">
          {/* Card 1: Standard Practice */}
          <div 
            className="mode-card"
            onClick={() => onSelectMode("standard")}
          >
            <div className="card-icon">
              <Compass size={32} />
            </div>
            <h3>Standard Practice</h3>
            <p>
              Run high-fidelity, interactive, branch-mapped simulations for three standard legal disputes. This mode is 100% offline-friendly, instantly playable, and requires no API keys.
            </p>
            <span className="badge badge-brass" style={{ alignSelf: "flex-start" }}>No API Key Required</span>
            <button className="btn btn-brass" style={{ marginTop: "24px", width: "100%" }}>
              Launch Case Studies
            </button>
          </div>

          {/* Card 2: Generative AI Practice */}
          <div 
            className="mode-card"
            onClick={() => onSelectMode("generative")}
          >
            <div className="card-icon">
              <Gavel size={32} />
            </div>
            <h3>Generative AI Mode</h3>
            <p>
              Input custom facts, upload documents, and select your jurisdiction (Indian district, High Court, tribunals). Simulates free-form, infinite-turn dialogue using client-side Gemini AI.
            </p>
            <span className="badge badge-velvet" style={{ alignSelf: "flex-start" }}>Requires Gemini API Key</span>
            <button className="btn btn-velvet" style={{ marginTop: "24px", width: "100%" }}>
              Configure Custom Case
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ marginTop: "80px", borderTop: "1px solid var(--bg-tertiary)", paddingTop: "50px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "40px", fontSize: "1.8rem" }}>Designed For Objective Preparation</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px", textAlign: "left" }}>
            <div className="docket-card" style={{ padding: "20px" }}>
              <div style={{ color: "var(--brass-gold)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <ShieldAlert size={20} />
                <h4 style={{ margin: 0 }}>Adversarial Prompts</h4>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                The AI Judge is instructed not to validate, but to challenge every assertion, interrupt, and ask the hardest questions possible.
              </p>
            </div>

            <div className="docket-card" style={{ padding: "20px" }}>
              <div style={{ color: "var(--brass-gold)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <Scale size={20} />
                <h4 style={{ margin: 0 }}>Blind Evaluations</h4>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                A separate evaluator AI analyzes the final transcript without knowing which side the user is representing, ensuring unbiased legal auditing.
              </p>
            </div>

            <div className="docket-card" style={{ padding: "20px" }}>
              <div style={{ color: "var(--brass-gold)", display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <Award size={20} />
                <h4 style={{ margin: 0 }}>Strict Rubrics</h4>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Earn points across Legal Accuracy, Evidence, Composure, Etiquette, and Objection handling. Scores are hard-blocked unless specific criteria (like statute citations) are met.
              </p>
            </div>
          </div>
        </div>

        {/* Setup API key shortcut */}
        <div style={{ marginTop: "40px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Already have a Gemini API Key? Configure it in{" "}
          <span 
            onClick={openSettings} 
            style={{ color: "var(--brass-gold)", cursor: "pointer", textDecoration: "underline" }}
          >
            Settings
          </span>{" "}
          to enable Generative AI Mode immediately.
        </div>
      </div>
    </div>
  );
}
