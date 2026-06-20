import React, { useState, useEffect } from "react";
import { Gavel } from "lucide-react";

const LEGAL_QUOTES = [
  "Assembling the courtroom records and filings...",
  "Briefing Advocate Amit Vyas for the defense...",
  "Reviewing lease agreements and evidentiary records...",
  "Justice R. S. Pathak is reviewing the docket details...",
  "Precedents indicate: 'Ignorantia juris non excusat' (Ignorance of the law excuses no one).",
  "Remember: Address the Bench as 'My Lord' or 'Your Honour' to maintain etiquette.",
  "Hint: Keep objections focused. Check if the opponent quotes statements made outside of court (Hearsay).",
  "Compiling the silent evaluation audit report. Stand by...",
  "Analyzing legal statutes and contractual liability clauses..."
];

export default function GavelLoader({ message }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % LEGAL_QUOTES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gavel-loader-container fade-in-up-class">
      <div className="gavel-icon-wrapper gavel-anim" style={{ fontSize: "72px" }}>
        <Gavel size={72} style={{ color: "var(--brass-gold)" }} />
      </div>
      
      <div className="gavel-loader-text">
        {message || "Assembling Courtroom"}
      </div>
      
      <div className="gavel-loader-subtext" style={{ maxWidth: "450px", textAlign: "center", marginTop: "12px", color: "var(--text-secondary)", textTransform: "none", fontSize: "0.85rem", height: "40px" }}>
        {LEGAL_QUOTES[quoteIndex]}
      </div>
      
      {/* Visual glowing bar */}
      <div style={{ width: "200px", height: "3px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "1.5px", marginTop: "30px", overflow: "hidden" }}>
        <div style={{
          width: "60%",
          height: "100%",
          backgroundColor: "var(--brass-gold)",
          borderRadius: "1.5px",
          animation: "loading-bar-sweep 1.5s infinite ease-in-out"
        }}></div>
      </div>

      <style>{`
        @keyframes loading-bar-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
