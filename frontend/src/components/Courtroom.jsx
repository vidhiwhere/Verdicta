import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Gavel, Scale, AlertOctagon, FileText, ArrowRight, Volume2, VolumeX, Eye, Shield, ChevronRight } from "lucide-react";
import { getJudgeResponse, getOpposingCounselResponse, getVerdictResponse, evaluateHearing } from "../services/geminiService";

export default function Courtroom({ caseDetails, mode, apiKey, onFinishSimulation }) {
  const [history, setHistory] = useState([
    {
      speaker: "clerk",
      text: mode === "standard"
        ? caseDetails.dialogTree.APPEARANCE.text
        : `Calling Case: ${caseDetails.petitioner} vs ${caseDetails.respondent} before the Hon'ble ${caseDetails.courtType}. Counsel, state your appearance.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [currentStep, setCurrentStep] = useState("APPEARANCE");
  const [generativeTurn, setGenerativeTurn] = useState(1);
  const [activeSpeaker, setActiveSpeaker] = useState("clerk");
  const [judgePatience, setJudgePatience] = useState(100);
  const [objectionsCount, setObjectionsCount] = useState(0);
  const [successfulObjections, setSuccessfulObjections] = useState(0);

  const [scores, setScores] = useState({
    legalAccuracy: 5,
    evidenceStrength: 5,
    proceduralCompliance: 5,
    argumentationClarity: 5,
    responseToPressure: 5
  });

  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  const [showObjectionTrigger, setShowObjectionTrigger] = useState(false);
  const [pendingObjectionData, setPendingObjectionData] = useState(null);
  const [objectionFeedback, setObjectionFeedback] = useState(null);
  const [flashScreen, setFlashScreen] = useState(false);
  const [gavelStrike, setGavelStrike] = useState(false);

  const [activeDocument, setActiveDocument] = useState(null);

  const transcriptEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loadingAI]);

  useEffect(() => {
    if (!textToSpeechEnabled || history.length === 0) return;
    const lastMsg = history[history.length - 1];
    if (lastMsg.speaker !== "user") {
      speakText(lastMsg.text.replace(/\[OBJECTION:[^\]]+\]/g, ""));
    }
  }, [history, textToSpeechEnabled]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = caseDetails.language === "Hindi" ? "hi-IN" : "en-IN";
      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => (prev ? prev + " " + transcript : transcript));
      };
      rec.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setIsRecording(false);
      };
      recognitionRef.current = rec;
    }
  }, [caseDetails.language]);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes("IN") || v.lang.includes("GB"));
    if (indVoice) utterance.voice = indVoice;
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported. Please use Chrome or Edge.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis?.cancel();
      recognitionRef.current.start();
    }
  };

  const triggerGavelStrike = () => {
    setGavelStrike(true);
    setTimeout(() => setGavelStrike(false), 1200);
  };

  const handleObjectionClick = () => {
    if (activeSpeaker !== "opposing" || !pendingObjectionData) return;
    setShowObjectionTrigger(true);
  };

  const submitObjection = (selectedType) => {
    setShowObjectionTrigger(false);
    triggerGavelStrike();
    setObjectionsCount(prev => prev + 1);

    const isCorrect = selectedType.toLowerCase() === pendingObjectionData.correctObjectionType.toLowerCase();

    if (isCorrect) {
      setSuccessfulObjections(prev => prev + 1);
      setScores(prev => ({ ...prev, proceduralCompliance: Math.min(10, prev.proceduralCompliance + 2) }));
      setJudgePatience(prev => Math.min(100, prev + 10));
      setObjectionFeedback({ success: true, message: pendingObjectionData.successResponse });
      setHistory(prev => [
        ...prev,
        { speaker: "user", text: `OBJECTION, Your Honour! Under grounds of ${selectedType}.`, timestamp: new Date().toLocaleTimeString() },
        { speaker: "judge", text: pendingObjectionData.successResponse, timestamp: new Date().toLocaleTimeString() }
      ]);
      setActiveSpeaker("judge");
    } else {
      setScores(prev => ({ ...prev, proceduralCompliance: Math.max(0, prev.proceduralCompliance - 1) }));
      setJudgePatience(prev => Math.max(0, prev - 15));
      setObjectionFeedback({ success: false, message: `Overruled. That is not ${selectedType}.` });
      setHistory(prev => [
        ...prev,
        { speaker: "user", text: `OBJECTION, Your Honour! Under grounds of ${selectedType}.`, timestamp: new Date().toLocaleTimeString() },
        { speaker: "judge", text: `Overruled. Counsel, that is not ${selectedType}. Please proceed, Advocate Vyas.`, timestamp: new Date().toLocaleTimeString() }
      ]);
      setActiveSpeaker("opposing");
    }
    setPendingObjectionData(null);
  };

  const selectStandardOption = (option) => {
    const updatedHistory = [
      ...history,
      { speaker: "user", text: option.text, timestamp: new Date().toLocaleTimeString() }
    ];

    setScores(prev => {
      const nextScores = { ...prev };
      if (option.scoreImpact) {
        Object.keys(option.scoreImpact).forEach(k => {
          if (nextScores[k] !== undefined) {
            nextScores[k] = Math.min(10, Math.max(0, prev[k] + (option.scoreImpact[k] - 5)));
          }
        });
      }
      return nextScores;
    });

    if (option.judgePatienceImpact) {
      setJudgePatience(prev => Math.min(100, Math.max(0, prev + option.judgePatienceImpact)));
    }

    const nextStep = option.nextStep;
    setCurrentStep(nextStep);
    const nextDialog = caseDetails.dialogTree[nextStep];

    if (nextDialog.speaker === "opposing") {
      setActiveSpeaker("opposing");
      setPendingObjectionData(nextDialog.objectionOpportunity);
      setHistory([...updatedHistory, { speaker: "opposing", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }]);
      setFlashScreen(true);
      setTimeout(() => setFlashScreen(false), 800);

      setTimeout(() => {
        setPendingObjectionData(currentPending => {
          if (currentPending) {
            setHistory(prev => [...prev, { speaker: "judge", text: currentPending.failResponse, timestamp: new Date().toLocaleTimeString() }]);
            setCurrentStep("CROSS_EXAMINATION");
            setActiveSpeaker("judge");
            const crossDialog = caseDetails.dialogTree.CROSS_EXAMINATION;
            setHistory(prev => [...prev, { speaker: "judge", text: crossDialog.text, timestamp: new Date().toLocaleTimeString() }]);
            return null;
          }
          return null;
        });
      }, 7000);
    } else if (nextDialog.speaker === "judge") {
      setActiveSpeaker("judge");
      setHistory([...updatedHistory, { speaker: "judge", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }]);
    } else if (nextStep === "VERDICT") {
      triggerGavelStrike();
      setActiveSpeaker("judge");
      setHistory([...updatedHistory, { speaker: "judge", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }]);
      setTimeout(() => {
        compileFinalFeedback(updatedHistory.concat({ speaker: "judge", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }));
      }, 4000);
    }
  };

  const compileFinalFeedback = (finalHistory) => {
    const { legalAccuracy: legalAcc, evidenceStrength: evStrength, proceduralCompliance: procComp, argumentationClarity: argClarity, responseToPressure: pressHandling } = scores;
    const overallScore = Number(((legalAcc + evStrength + procComp + argClarity + pressHandling) / 5).toFixed(1));

    const auditLog = finalHistory.filter(h => h.speaker === "user").map(h => {
      const isWeak = h.text.includes("lying") || h.text.includes("scam") || h.text.includes("trash") || h.text.length < 50;
      return {
        speaker: "user",
        text: h.text,
        evaluation: isWeak ? "negative" : "positive",
        commentary: isWeak
          ? "Used subjective emotional language. Lacked citations and references to primary records."
          : "Articulated arguments clearly, citing clauses and utilizing photos as primary evidence."
      };
    });

    const report = {
      overallScore,
      rubrics: {
        legalAccuracy: {
          score: legalAcc,
          rationale: legalAcc >= 8 ? "Accurately applied relevant statutory sections and cited clauses." : "Under-utilized statutory definitions. Relied on factual explanations rather than legal codes.",
          checklist: [
            { item: "Cited specific statutory acts/sections", met: legalAcc >= 7 },
            { item: "Accurately applied the section to the facts", met: legalAcc >= 6 }
          ]
        },
        evidenceStrength: {
          score: evStrength,
          rationale: evStrength >= 8 ? "Successfully referenced primary documents and move-out photos as proof." : "Failed to anchor assertions in written documents. Assertions remained oral.",
          checklist: [
            { item: "Referenced primary documents (agreement, invoice, etc.)", met: evStrength >= 7 },
            { item: "Leveraged photographic or physical records", met: evStrength >= 8 }
          ]
        },
        proceduralCompliance: {
          score: procComp,
          rationale: procComp >= 8 ? "Followed courtroom greetings and flagged opposing counsel's hearsay." : "Missed objection opportunity or used informal honorifics.",
          checklist: [
            { item: "Followed formal courtroom greeting protocol", met: true },
            { item: "Maintained proper legal honorifics ('Your Honour')", met: procComp >= 6 },
            { item: "Objected to hearsay/speculation", met: successfulObjections > 0 }
          ]
        },
        argumentationClarity: {
          score: argClarity,
          rationale: argClarity >= 8 ? "Arguments were logically structured and directly answered the judge." : "Deviated into personal allegations and dodged direct questions.",
          checklist: [
            { item: "Structured argument with logical flow", met: argClarity >= 6 },
            { item: "Answered judge questions directly without dodging", met: argClarity >= 7 }
          ]
        },
        responseToPressure: {
          score: pressHandling,
          rationale: pressHandling >= 8 ? "Maintained calm composure despite adversarial questioning." : "Reacted emotionally to interruptions, decreasing judge patience.",
          checklist: [
            { item: "Maintained calm under judicial interruptions", met: pressHandling >= 7 },
            { item: "Countered opposing counsel assertions factually", met: pressHandling >= 6 }
          ]
        }
      },
      strengths: overallScore >= 7
        ? ["Excellent grounding of arguments in registered agreements", "Proactive objection to hearsay statements"]
        : ["Polite opening appearance statement", "Basic citation of contract clauses"],
      weaknesses: overallScore >= 7
        ? ["Slight delays in responding to judge's hypothetical questions"]
        : ["Did not object to opposing counsel's hearsay evidence", "Used emotional accusations instead of statute-backed arguments"],
      suggestions: [
        "Memorize exact statutory acts (e.g. Section 108 of Transfer of Property Act) to assert authority instantly.",
        "Always object to statements quoting external people as Hearsay.",
        "Refrain from calling the opponent a 'liar' — rather say 'the facts on record contradict their assertions'."
      ],
      auditLog
    };
    onFinishSimulation(report, finalHistory);
  };

  const handleGenerativeSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || loadingAI) return;

    window.speechSynthesis?.cancel();
    const textToSend = userInput.trim();
    setUserInput("");

    const userMsg = { speaker: "user", text: textToSend, timestamp: new Date().toLocaleTimeString() };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setLoadingAI(true);

    try {
      let patienceChange = 0;
      const lowerText = textToSend.toLowerCase();
      if (!lowerText.includes("lord") && !lowerText.includes("honour") && !lowerText.includes("honor")) {
        patienceChange -= 10;
      } else {
        patienceChange += 5;
      }
      if (lowerText.includes("lying") || lowerText.includes("greedy") || lowerText.includes("scam")) {
        patienceChange -= 15;
      }
      setJudgePatience(prev => Math.min(100, Math.max(0, prev + patienceChange)));

      const nextTurnNum = generativeTurn + 1;
      setGenerativeTurn(nextTurnNum);

      if (nextTurnNum === 2) {
        setActiveSpeaker("judge");
        const reply = await getJudgeResponse(apiKey, caseDetails, nextHistory);
        setHistory(prev => [...prev, { speaker: "judge", text: reply, timestamp: new Date().toLocaleTimeString() }]);
      } else if (nextTurnNum === 3) {
        setActiveSpeaker("opposing");
        const reply = await getOpposingCounselResponse(apiKey, caseDetails, nextHistory);
        const match = reply.match(/\[OBJECTION:\s*(Hearsay|Relevance|Speculation|Leading)\]\s*(.*)/i);

        if (match) {
          const objectionType = match[1];
          const cleanText = reply.replace(/\[OBJECTION:[^\]]+\]/g, "");
          setPendingObjectionData({
            correctObjectionType: objectionType,
            statementToObject: match[2],
            successResponse: `Objection sustained. Advocate Vyas, that is indeed ${objectionType}. Proceed without hearsay/speculation.`,
            failResponse: "Counsel, you did not object to that clearly inadmissible statement."
          });
          setHistory(prev => [...prev, { speaker: "opposing", text: cleanText, timestamp: new Date().toLocaleTimeString() }]);
          setFlashScreen(true);
          setTimeout(() => setFlashScreen(false), 800);
          setTimeout(() => {
            setPendingObjectionData(currentPending => {
              if (currentPending) {
                setHistory(prev => [...prev, { speaker: "judge", text: "Overruled. Counsel has failed to object, so the statement remains on record. Next question.", timestamp: new Date().toLocaleTimeString() }]);
                setActiveSpeaker("judge");
                return null;
              }
              return null;
            });
          }, 8000);
        } else {
          setHistory(prev => [...prev, { speaker: "opposing", text: reply, timestamp: new Date().toLocaleTimeString() }]);
        }
      } else if (nextTurnNum === 4) {
        setActiveSpeaker("judge");
        const reply = await getJudgeResponse(apiKey, caseDetails, nextHistory);
        setHistory(prev => [...prev, { speaker: "judge", text: reply, timestamp: new Date().toLocaleTimeString() }]);
      } else if (nextTurnNum === 5) {
        triggerGavelStrike();
        setActiveSpeaker("judge");
        const reply = await getVerdictResponse(apiKey, caseDetails, nextHistory);
        const finalHistory = [...nextHistory, { speaker: "judge", text: reply, timestamp: new Date().toLocaleTimeString() }];
        setHistory(finalHistory);
        setLoadingAI(true);
        const feedbackReport = await evaluateHearing(apiKey, caseDetails, finalHistory);
        onFinishSimulation(feedbackReport, finalHistory);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating AI response. Please check your Gemini API Key or try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  const triggerEarlyVerdict = async () => {
    window.speechSynthesis?.cancel();
    if (mode === "standard") {
      const nextDialog = caseDetails.dialogTree.VERDICT;
      setHistory(prev => [...prev, { speaker: "judge", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }]);
      compileFinalFeedback(history.concat({ speaker: "judge", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }));
    } else {
      setLoadingAI(true);
      try {
        triggerGavelStrike();
        setActiveSpeaker("judge");
        const reply = await getVerdictResponse(apiKey, caseDetails, history);
        const finalHistory = [...history, { speaker: "judge", text: reply, timestamp: new Date().toLocaleTimeString() }];
        setHistory(finalHistory);
        const feedbackReport = await evaluateHearing(apiKey, caseDetails, finalHistory);
        onFinishSimulation(feedbackReport, finalHistory);
      } catch (e) {
        alert("Failed to summarize verdict: " + e.message);
      } finally {
        setLoadingAI(false);
      }
    }
  };

  // Patience color
  const patienceColor = judgePatience > 60 ? "var(--success-light)" : judgePatience > 30 ? "var(--warning-light)" : "var(--error-light)";

  return (
    <div className={`courtroom-grid ${flashScreen ? "flash-active" : ""}`}>

      {/* ━━━ LEFT: Case Docket ━━━ */}
      <div className="court-left-bar">
        <div className="docket-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={16} style={{ color: "var(--brass-gold)" }} />
            <h3 style={{ fontSize: "0.95rem", fontFamily: "var(--display-font)", letterSpacing: "0.05em" }}>Case File</h3>
          </div>
          <span className="badge badge-brass" style={{ fontSize: "0.56rem" }}>{caseDetails.courtType}</span>
        </div>

        <div className="docket-body">
          {/* Parties */}
          <div>
            <div className="docket-section-title">Parties</div>
            <div className="docket-card">
              <p style={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "4px", fontSize: "0.85rem" }}>
                {caseDetails.petitioner}
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "8px" }}>Petitioner</p>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "6px 0" }} />
              <p style={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "4px", fontSize: "0.85rem" }}>
                {caseDetails.respondent}
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Respondent</p>
            </div>
          </div>

          {/* Dispute */}
          <div>
            <div className="docket-section-title">Dispute Summary</div>
            <div className="docket-card">
              <p style={{ fontSize: "0.8rem", lineHeight: "1.6" }}>{caseDetails.dispute}</p>
            </div>
          </div>

          {/* Documents */}
          <div>
            <div className="docket-section-title">Attached Docket</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {caseDetails.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="docket-card"
                  style={{
                    cursor: "pointer",
                    borderColor: activeDocument?.name === doc.name ? "rgba(201,152,30,0.5)" : "transparent",
                    background: activeDocument?.name === doc.name ? "rgba(201,152,30,0.05)" : undefined
                  }}
                  onClick={() => setActiveDocument(activeDocument?.name === doc.name ? null : doc)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "0.8rem", margin: 0 }}>{doc.name}</h4>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{doc.size}</span>
                  </div>
                  <p style={{ fontSize: "0.72rem", marginTop: "4px" }}>{doc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Acts */}
          <div>
            <div className="docket-section-title">Relevant Statutes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {caseDetails.acts.map((act, idx) => (
                <div key={idx} className="docket-card">
                  <h4 style={{ fontSize: "0.8rem", margin: 0 }}>{act.section}</h4>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "4px", marginTop: "2px" }}>{act.act}</div>
                  <p style={{ fontSize: "0.75rem" }}>{act.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ CENTER: Main Courtroom ━━━ */}
      <div className="court-center-bar">

        {/* Courtroom Stage */}
        <div className="courtroom-stage">

          {/* Objection Alert */}
          {pendingObjectionData && (
            <div className="objection-alert-overlay">
              <button
                className="btn btn-velvet shake-anim pulse-ring-element"
                style={{
                  borderRadius: "999px",
                  fontFamily: "var(--display-font)",
                  fontWeight: "900",
                  letterSpacing: "0.2em",
                  fontSize: "0.85rem",
                  padding: "10px 28px",
                  boxShadow: "0 0 30px rgba(124,34,38,0.5), 0 8px 24px rgba(0,0,0,0.5)"
                }}
                onClick={handleObjectionClick}
              >
                <AlertOctagon size={15} /> OBJECTION!
              </button>
            </div>
          )}

          {/* Judge Bench */}
          <div className="judge-bench-container">
            <div className="judge-bench-panel">
              <div className={`judge-avatar ${activeSpeaker === "judge" ? "pulse-ring-element" : ""}`}>
                <Scale size={28} style={{ color: "var(--brass-gold)" }} />
              </div>
              <div className="judge-name">{caseDetails.judge || "Justice R. S. Pathak"}</div>
              <div className="judge-status">Presiding Officer</div>

              <div className="judge-patience-wrapper">
                <div className="patience-label-container">
                  <span>Bench Patience</span>
                  <span style={{ color: patienceColor, fontWeight: "600" }}>{judgePatience}%</span>
                </div>
                <div className="patience-bar-bg">
                  <div className="patience-bar-fill" style={{ width: `${judgePatience}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Podiums */}
          <div className="podiums-container">
            <div className={`podium ${activeSpeaker === "user" ? "active-speaker" : ""}`}>
              <div className="podium-title">Petitioner's Counsel</div>
              <div className="podium-avatar">
                <Mic size={20} style={{ color: activeSpeaker === "user" ? "var(--brass-gold)" : "var(--text-muted)" }} />
              </div>
              <div className="podium-name">Adv. Rohan Sen</div>
              <div className="podium-desc">(You)</div>
            </div>

            <div className={`podium ${activeSpeaker === "opposing" ? "active-speaker" : ""}`}>
              <div className="podium-title">Respondent's Counsel</div>
              <div className="podium-avatar">
                <MicOff size={20} style={{ color: "var(--text-muted)" }} />
              </div>
              <div className="podium-name">{caseDetails.opponentCounsel || "Advocate Amit Vyas"}</div>
              <div className="podium-desc">Opposing Party</div>
            </div>
          </div>
        </div>

        {/* Transcript Feed */}
        <div className="transcript-area">
          {history.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.speaker}`}>
              <div className="bubble-meta">
                <span>{msg.speaker === "user" ? "You (Counsel)" : msg.speaker === "judge" ? `Justice ${caseDetails.judge?.split(" ").pop() || "Pathak"}` : msg.speaker === "opposing" ? caseDetails.opponentCounsel || "Advocate Vyas" : "Court Registrar"}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="bubble-content">{msg.text}</div>
            </div>
          ))}

          {loadingAI && (
            <div className="message-bubble judge" style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", width: "auto" }}>
              <div className="wave-container active">
                {[...Array(5)].map((_, i) => <div key={i} className="wave-bar" />)}
              </div>
              <span style={{ fontSize: "0.82rem", color: "var(--brass-light)", fontStyle: "italic" }}>The Court is deliberating…</span>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Input Console */}
        <div className="input-console-bar">
          {mode === "standard" ? (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text-muted)", fontFamily: "var(--display-font)", marginBottom: "2px" }}>
                Select your argument:
              </div>
              {caseDetails.dialogTree[currentStep] && caseDetails.dialogTree[currentStep].options ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {caseDetails.dialogTree[currentStep].options.map((opt, i) => (
                    <button
                      key={i}
                      className="btn btn-brass"
                      style={{
                        textAlign: "left",
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontSize: "0.87rem",
                        lineHeight: "1.5",
                        padding: "12px 16px",
                        letterSpacing: "0"
                      }}
                      onClick={() => selectStandardOption(opt)}
                    >
                      <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                      <span>{opt.text}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", textAlign: "center", padding: "8px", fontStyle: "italic" }}>
                  The bench is preparing a verdict…
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleGenerativeSubmit} className="input-console-form">
              <button
                type="button"
                className={`speak-btn-glow ${isRecording ? "recording" : ""}`}
                onClick={toggleRecording}
                title={isRecording ? "Stop recording" : "Speak your argument"}
              >
                <Mic size={18} />
              </button>

              <input
                type="text"
                className="form-control"
                placeholder={isRecording ? "Listening… speak your argument" : "Type your legal argument here…"}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                disabled={loadingAI}
                style={{ fontSize: "0.92rem" }}
              />

              <button
                type="submit"
                className="btn btn-brass"
                disabled={!userInput.trim() || loadingAI}
                style={{ flexShrink: 0, padding: "10px 20px" }}
              >
                Submit
              </button>
            </form>
          )}

          {/* Bottom controls */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              className={`btn ${textToSpeechEnabled ? "btn-brass" : "btn-outline"}`}
              style={{ padding: "8px 12px", fontSize: "0.68rem", gap: "6px" }}
              onClick={() => {
                setTextToSpeechEnabled(!textToSpeechEnabled);
                if (textToSpeechEnabled) window.speechSynthesis?.cancel();
              }}
              title={textToSpeechEnabled ? "Disable TTS" : "Enable TTS"}
            >
              {textToSpeechEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{textToSpeechEnabled ? "Voice On" : "Voice Off"}</span>
            </button>

            <button
              className="btn btn-velvet"
              style={{ padding: "8px 14px", fontSize: "0.68rem", gap: "6px" }}
              onClick={triggerEarlyVerdict}
              disabled={loadingAI}
            >
              <Gavel size={13} />
              <span>Request Verdict</span>
            </button>
          </div>
        </div>
      </div>

      {/* ━━━ RIGHT: Evidence Viewer ━━━ */}
      <div className="court-right-bar" style={{ padding: "18px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          paddingBottom: "14px", marginBottom: "18px"
        }}>
          <Eye size={16} style={{ color: "var(--brass-gold)" }} />
          <h3 style={{ fontSize: "0.9rem", fontFamily: "var(--display-font)", letterSpacing: "0.05em" }}>Evidence Viewer</h3>
        </div>

        {activeDocument ? (
          <div className="fade-in-up-class" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <span className="badge badge-brass" style={{ alignSelf: "flex-start", fontSize: "0.58rem" }}>EXHIBIT</span>

            <h4 style={{
              color: "var(--brass-light)",
              fontSize: "1.05rem",
              borderBottom: "1px dashed rgba(255,255,255,0.08)",
              paddingBottom: "10px",
              fontFamily: "var(--serif-title)"
            }}>
              {activeDocument.name}
            </h4>

            <div style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              lineHeight: "1.7",
              fontStyle: "italic",
              background: "rgba(201,152,30,0.03)",
              border: "1px solid rgba(201,152,30,0.08)",
              padding: "14px",
              borderRadius: "var(--border-radius-sm)"
            }}>
              "{activeDocument.desc}"
            </div>

            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: "12px",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}>
              <div>File Size: <span style={{ color: "var(--text-secondary)" }}>{activeDocument.size}</span></div>
              <div>Status: <span style={{ color: "var(--success-light)" }}>Entered as Primary Record</span></div>
            </div>

            <button
              className="btn btn-outline"
              style={{ fontSize: "0.7rem", padding: "8px" }}
              onClick={() => setActiveDocument(null)}
            >
              Close Document
            </button>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "55%",
            color: "var(--text-muted)",
            textAlign: "center",
            gap: "12px"
          }}>
            <div style={{
              width: "64px", height: "64px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <FileText size={28} style={{ opacity: 0.3 }} />
            </div>
            <div>
              <p style={{ fontSize: "0.82rem", marginBottom: "6px" }}>No document selected</p>
              <p style={{ fontSize: "0.72rem", lineHeight: "1.6", maxWidth: "200px" }}>
                Click on a document in the Attached Docket to inspect evidence.
              </p>
            </div>
          </div>
        )}

        {/* Hearing Stats */}
        <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="docket-section-title">Session Stats</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Objections Filed</span>
              <span style={{ color: "var(--brass-light)", fontWeight: "600" }}>{objectionsCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Sustained</span>
              <span style={{ color: "var(--success-light)", fontWeight: "600" }}>{successfulObjections}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Statements Made</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>{history.filter(h => h.speaker === "user").length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Objection Modal */}
      {showObjectionTrigger && (
        <div
          className="settings-panel-overlay"
          style={{ justifyContent: "center", alignItems: "center" }}
          onClick={() => setShowObjectionTrigger(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "420px",
              padding: "36px",
              textAlign: "center",
              background: "linear-gradient(160deg, #12171e, #0c1016)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "var(--border-radius-lg)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
              animation: "slide-up-modal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            <div className={`gavel-icon-wrapper ${gavelStrike ? "gavel-anim" : ""}`} style={{ marginBottom: "16px" }}>
              <Gavel size={42} style={{ color: "var(--brass-gold)", filter: "drop-shadow(0 0 16px rgba(201,152,30,0.4))" }} />
            </div>

            <h3 style={{ fontSize: "1.2rem", marginBottom: "6px", fontFamily: "var(--display-font)", letterSpacing: "0.05em" }}>
              Raise Objection
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
              Identify the procedural violation in Opposing Counsel's statement:
            </p>

            <div className="objection-list-container">
              {["Hearsay", "Relevance", "Speculation", "Leading"].map(type => (
                <button key={type} className="objection-option" onClick={() => submitObjection(type)}>
                  {type}
                </button>
              ))}
            </div>

            <button
              className="btn btn-outline"
              style={{ width: "100%", marginTop: "16px", fontSize: "0.72rem" }}
              onClick={() => setShowObjectionTrigger(false)}
            >
              Withdraw Objection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
