import React, { useEffect, useState } from "react";
import { Gavel, Scale } from "lucide-react";

export default function GavelLoader({ message }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gavel-loader-container">
      {/* Spinning outer ring */}
      <div style={{
        position: "relative",
        width: "120px",
        height: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "32px"
      }}>
        {/* Outer slow ring */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "1px solid rgba(201, 152, 30, 0.15)",
          animation: "rotate-slow 8s linear infinite"
        }} />

        {/* Middle ring */}
        <div style={{
          position: "absolute",
          inset: "10px",
          borderRadius: "50%",
          border: "1px dashed rgba(201, 152, 30, 0.25)",
          animation: "rotate-slow 4s linear infinite reverse"
        }} />

        {/* Gavel icon with animation */}
        <div className="gavel-icon-wrapper gavel-anim" style={{ marginBottom: 0 }}>
          <Gavel size={44} style={{ color: "var(--brass-gold)", filter: "drop-shadow(0 0 12px rgba(201,152,30,0.4))" }} />
        </div>

        {/* Dot on ring */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "50%",
          marginLeft: "-3px",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "var(--brass-gold)",
          boxShadow: "0 0 10px var(--brass-gold)",
          animation: "rotate-slow 8s linear infinite",
          transformOrigin: "3px 60px"
        }} />
      </div>

      {/* Scales watermark */}
      <div style={{
        position: "absolute",
        opacity: 0.03,
        pointerEvents: "none",
      }}>
        <Scale size={300} />
      </div>

      <div className="gavel-loader-text">
        {message}{dots}
      </div>
      <div className="gavel-loader-subtext" style={{ marginTop: "10px" }}>
        Please stand by
      </div>

      {/* Bottom progress line */}
      <div style={{
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "180px",
        height: "1px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "1px",
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%",
          width: "40%",
          background: "linear-gradient(to right, transparent, var(--brass-gold), transparent)",
          animation: "shimmer 1.8s infinite",
          backgroundSize: "400px 1px"
        }} />
      </div>
    </div>
  );
}
