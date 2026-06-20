import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Gavel, Scale, AlertOctagon, HelpCircle, FileText, ArrowRight, Volume2, VolumeX, Eye } from "lucide-react";
import { getJudgeResponse, getOpposingCounselResponse, getVerdictResponse, evaluateHearing } from "../services/geminiService";

export default function Courtroom({ caseDetails, mode, apiKey, onFinishSimulation }) {
  // Transcript history
  // Each history item: { speaker: "clerk"|"judge"|"user"|"opposing", text: "...", timestamp: string }
  const [history, setHistory] = useState([
    { 
      speaker: "clerk", 
      text: mode === "standard" 
        ? caseDetails.dialogTree.APPEARANCE.text 
        : `Calling Case: ${caseDetails.petitioner} vs ${caseDetails.respondent} before the Hon'ble ${caseDetails.courtType}. Counsel, state your appearance.`,
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);

  // Simulation states
  const [currentStep, setCurrentStep] = useState("APPEARANCE"); // Standard mode step tracker
  const [generativeTurn, setGenerativeTurn] = useState(1); // Generative mode turn tracker (1: User Appearance, 2: Judge Statement, 3: User Statement, 4: Opposing Counsel, 5: User Response, 6: Judge Question, 7: User Response, 8: Verdict)
  const [activeSpeaker, setActiveSpeaker] = useState("clerk");
  const [judgePatience, setJudgePatience] = useState(100);
  const [objectionsCount, setObjectionsCount] = useState(0);
  const [successfulObjections, setSuccessfulObjections] = useState(0);
  
  // Scoring accumulation (for standard mode / fallback)
  const [scores, setScores] = useState({
    legalAccuracy: 5,
    evidenceStrength: 5,
    proceduralCompliance: 5,
    argumentationClarity: 5,
    responseToPressure: 5
  });

  // User input states
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Objection dialog state
  const [showObjectionTrigger, setShowObjectionTrigger] = useState(false);
  const [pendingObjectionData, setPendingObjectionData] = useState(null);
  const [objectionFeedback, setObjectionFeedback] = useState(null); // { success: boolean, message: string }
  const [flashScreen, setFlashScreen] = useState(false);
  const [gavelStrike, setGavelStrike] = useState(false);
  
  // Active document viewing sidebar state
  const [activeDocument, setActiveDocument] = useState(null);

  // References for layout scrolling
  const transcriptEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom when history updates
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loadingAI]);

  // Voice out the last message if TTS is enabled
  useEffect(() => {
    if (!textToSpeechEnabled || history.length === 0) return;
    const lastMsg = history[history.length - 1];
    
    // Don't speak user's own statements, and clean objection tags
    if (lastMsg.speaker !== "user") {
      speakText(lastMsg.text.replace(/\[OBJECTION:[^\]]+\]/g, ""));
    }
  }, [history, textToSpeechEnabled]);

  // Setup Web Speech Recognition
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

  // Clean speaking on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Text to speech helper
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice pacing / pitch for courtroom gravity
    utterance.rate = 0.9; 
    utterance.pitch = 0.95;
    
    // Select specific voice (Indian English if available)
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes("IN") || v.lang.includes("GB"));
    if (indVoice) utterance.voice = indVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone Speech-to-Text
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type your arguments.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis?.cancel(); // stop speaking when listening
      recognitionRef.current.start();
    }
  };

  // Play gavel animation and log sound trigger
  const triggerGavelStrike = () => {
    setGavelStrike(true);
    setTimeout(() => setGavelStrike(false), 1200);
  };

  // Object to Opposing counsel
  const handleObjectionClick = () => {
    if (activeSpeaker !== "opposing" || !pendingObjectionData) return;
    setShowObjectionTrigger(true);
  };

  // Submit Objection details
  const submitObjection = (selectedType) => {
    setShowObjectionTrigger(false);
    triggerGavelStrike();
    setObjectionsCount(prev => prev + 1);

    const isCorrect = selectedType.toLowerCase() === pendingObjectionData.correctObjectionType.toLowerCase();

    if (isCorrect) {
      setSuccessfulObjections(prev => prev + 1);
      setScores(prev => ({
        ...prev,
        proceduralCompliance: Math.min(10, prev.proceduralCompliance + 2)
      }));
      setJudgePatience(prev => Math.min(100, prev + 10));
      setObjectionFeedback({
        success: true,
        message: pendingObjectionData.successResponse
      });

      // Add to transcript
      setHistory(prev => [
        ...prev,
        { speaker: "user", text: `OBJECTION, Your Honour! Under grounds of ${selectedType}.`, timestamp: new Date().toLocaleTimeString() },
        { speaker: "judge", text: pendingObjectionData.successResponse, timestamp: new Date().toLocaleTimeString() }
      ]);
      setActiveSpeaker("judge");
    } else {
      setScores(prev => ({
        ...prev,
        proceduralCompliance: Math.max(0, prev.proceduralCompliance - 1)
      }));
      setJudgePatience(prev => Math.max(0, prev - 15));
      setObjectionFeedback({
        success: false,
        message: `Overruled. The statement does not constitute ${selectedType}. Counsel, do not interrupt.`
      });

      setHistory(prev => [
        ...prev,
        { speaker: "user", text: `OBJECTION, Your Honour! Under grounds of ${selectedType}.`, timestamp: new Date().toLocaleTimeString() },
        { speaker: "judge", text: `Overruled. Counsel, that is not ${selectedType}. Please proceed, Advocate Vyas.`, timestamp: new Date().toLocaleTimeString() }
      ]);
      setActiveSpeaker("opposing");
    }

    // Clear pending objection window
    setPendingObjectionData(null);
  };

  // Process standard branching option
  const selectStandardOption = (option) => {
    // Add user response to history
    const updatedHistory = [
      ...history,
      { speaker: "user", text: option.text, timestamp: new Date().toLocaleTimeString() }
    ];

    // Compute updated scores
    setScores(prev => {
      const nextScores = { ...prev };
      if (option.scoreImpact) {
        Object.keys(option.scoreImpact).forEach(k => {
          nextScores[k] = Math.min(10, Math.max(0, prev[k] + (option.scoreImpact[k] - 5)));
        });
      }
      return nextScores;
    });

    if (option.judgePatienceImpact) {
      setJudgePatience(prev => Math.min(100, Math.max(0, prev + option.judgePatienceImpact)));
    }

    const nextStep = option.nextStep;
    setCurrentStep(nextStep);
    
    // Fetch dialog details for next step
    const nextDialog = caseDetails.dialogTree[nextStep];

    if (nextDialog.speaker === "opposing") {
      setActiveSpeaker("opposing");
      setPendingObjectionData(nextDialog.objectionOpportunity);
      
      // Opposing statement triggers objection period
      setHistory([
        ...updatedHistory,
        { speaker: "opposing", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }
      ]);

      // If user does not object after 7 seconds, auto-resolve
      setTimeout(() => {
        setPendingObjectionData(currentPending => {
          if (currentPending) {
            // Did not object in time
            setHistory(prev => [
              ...prev,
              { speaker: "judge", text: currentPending.failResponse, timestamp: new Date().toLocaleTimeString() }
            ]);
            // Jump to cross examination directly
            setCurrentStep("CROSS_EXAMINATION");
            setActiveSpeaker("judge");
            const crossDialog = caseDetails.dialogTree.CROSS_EXAMINATION;
            setHistory(prev => [
              ...prev,
              { speaker: "judge", text: crossDialog.text, timestamp: new Date().toLocaleTimeString() }
            ]);
            return null;
          }
          return null;
        });
      }, 7000);

    } else if (nextDialog.speaker === "judge") {
      setActiveSpeaker("judge");
      setHistory([
        ...updatedHistory,
        { speaker: "judge", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }
      ]);
    } else if (nextStep === "VERDICT") {
      triggerGavelStrike();
      setActiveSpeaker("judge");
      setHistory([
        ...updatedHistory,
        { speaker: "judge", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }
      ]);
      // Trigger final evaluation compilation
      setTimeout(() => {
        compileFinalFeedback(updatedHistory.concat({ speaker: "judge", text: nextDialog.text, timestamp: new Date().toLocaleTimeString() }));
      }, 4000);
    }
  };

  // Compile final report (Standard mode helper)
  const compileFinalFeedback = (finalHistory) => {
    // Generate simulated rubric score details based on selections
    const legalAcc = scores.legalAccuracy;
    const evStrength = scores.evidenceStrength;
    const procComp = scores.proceduralCompliance;
    const argClarity = scores.argumentationClarity;
    const pressHandling = scores.responseToPressure;

    const overallScore = Number(((legalAcc + evStrength + procComp + argClarity + pressHandling) / 5).toFixed(1));

    // Map audit logs
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
          rationale: legalAcc >= 8 
            ? "Accurately applied Section 108 of the Transfer of Property Act and cited relevant clauses." 
            : "Under-utilized statutory definitions. Relied on factual explanations rather than legal codes.",
          checklist: [
            { item: "Cited specific statutory acts/sections", met: legalAcc >= 7 },
            { item: "Accurately applied the section to the facts", met: legalAcc >= 6 }
          ]
        },
        evidenceStrength: {
          score: evStrength,
          rationale: evStrength >= 8 
            ? "Successfully referenced the move-out photos and registration invoice as primary proof." 
            : "Failed to anchor assertions in written documents. Assertions remained oral.",
          checklist: [
            { item: "Referenced primary documents (agreement, invoice, etc.)", met: evStrength >= 7 },
            { item: "Leveraged photographic or physical records", met: evStrength >= 8 }
          ]
        },
        proceduralCompliance: {
          score: procComp,
          rationale: procComp >= 8 
            ? "Followed courtroom greetings and successfully flagged the opposing counsel's hearsay." 
            : "Missed the opposing counsel's hearsay objection opportunity, or used informal honorifics.",
          checklist: [
            { item: "Followed formal courtroom greeting protocol", met: true },
            { item: "Maintained proper legal honorifics ('Your Honour')", met: procComp >= 6 },
            { item: "Objected to hearsay/speculation", met: successfulObjections > 0 }
          ]
        },
        argumentationClarity: {
          score: argClarity,
          rationale: argClarity >= 8 
            ? "Arguments were logically structured and directly answered the judge's inquiries." 
            : "Deviated into personal allegations and dodged direct questions from the bench.",
          checklist: [
            { item: "Structured argument with logical flow", met: argClarity >= 6 },
            { item: "Answered judge questions directly without dodging", met: argClarity >= 7 }
          ]
        },
        responseToPressure: {
          score: pressHandling,
          rationale: pressHandling >= 8 
            ? "Maintained calm composure and professional tone despite adversarial questioning." 
            : "Reacted emotionally to interruptions and opponent challenges, decreasing judge patience.",
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
        : ["Did not object to opposing counsel's hearsay evidence", "Used emotional accusations ('lying', 'scam') instead of statute-backed arguments"],
      suggestions: [
        "Memorize exact statutory acts (e.g. Section 108 of Transfer of Property Act) to assert authority instantly.",
        "Always object to statements quoting external people ('My brother-in-law saw...', 'The neighbor said...') as Hearsay.",
        "Refrain from calling the opponent a 'liar' — rather say 'the facts on record contradict their assertions'."
      ],
      auditLog
    };

    onFinishSimulation(report, finalHistory);
  };

  // Submit Text/Speech argument in Generative AI Mode
  const handleGenerativeSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || loadingAI) return;

    window.speechSynthesis?.cancel(); // Cancel any ongoing TTS
    const textToSend = userInput.trim();
    setUserInput("");

    // Add user response to history
    const userMsg = { speaker: "user", text: textToSend, timestamp: new Date().toLocaleTimeString() };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setLoadingAI(true);

    try {
      // Evaluate user's grammar/etiquette for patience bar
      let patienceChange = 0;
      const lowerText = textToSend.toLowerCase();
      if (!lowerText.includes("lord") && !lowerText.includes("honour") && !lowerText.includes("honor")) {
        patienceChange -= 10; // Etiquette slip
      } else {
        patienceChange += 5;
      }
      if (lowerText.includes("lying") || lowerText.includes("greedy") || lowerText.includes("scam")) {
        patienceChange -= 15; // Emotional outbursts
      }
      setJudgePatience(prev => Math.min(100, Math.max(0, prev + patienceChange)));

      // Step Machine
      const nextTurnNum = generativeTurn + 1;
      setGenerativeTurn(nextTurnNum);

      if (nextTurnNum === 2) {
        // Judge's opening inquiry
        setActiveSpeaker("judge");
        const reply = await getJudgeResponse(apiKey, caseDetails, nextHistory);
        setHistory(prev => [...prev, { speaker: "judge", text: reply, timestamp: new Date().toLocaleTimeString() }]);
      } 
      else if (nextTurnNum === 3) {
        // Counsel's Opening & Objections
        setActiveSpeaker("opposing");
        const reply = await getOpposingCounselResponse(apiKey, caseDetails, nextHistory);
        
        // Parse custom objection tag from opposing counsel
        // e.g. "[OBJECTION: Hearsay] The client's neighbor told me..."
        const match = reply.match(/\[OBJECTION:\s*(Hearsay|Relevance|Speculation|Leading)\]\s*(.*)/i);
        
        if (match) {
          const objectionType = match[1];
          const statementText = match[2];
          const cleanText = reply.replace(/\[OBJECTION:[^\]]+\]/g, "");

          setPendingObjectionData({
            correctObjectionType: objectionType,
            statementToObject: statementText,
            successResponse: `Objection sustained. Advocate Vyas, that is indeed ${objectionType}. Proceed without hearsay/speculation.`,
            failResponse: "Counsel, you did not object to that clearly inadmissible statement."
          });

          setHistory(prev => [...prev, { speaker: "opposing", text: cleanText, timestamp: new Date().toLocaleTimeString() }]);
          
          // Flash red screen briefly for objection notification
          setFlashScreen(true);
          setTimeout(() => setFlashScreen(false), 800);

          // Give user 7 seconds to object before auto-proceeding
          setTimeout(() => {
            setPendingObjectionData(currentPending => {
              if (currentPending) {
                setHistory(prev => [
                  ...prev,
                  { speaker: "judge", text: "Overruled. Counsel has failed to object, so the statement remains on record. Next question.", timestamp: new Date().toLocaleTimeString() }
                ]);
                setActiveSpeaker("judge");
                return null;
              }
              return null;
            });
          }, 8000);
        } else {
          setHistory(prev => [...prev, { speaker: "opposing", text: reply, timestamp: new Date().toLocaleTimeString() }]);
        }
      } 
      else if (nextTurnNum === 4) {
        // Judge's critical cross-examination question
        setActiveSpeaker("judge");
        const reply = await getJudgeResponse(apiKey, caseDetails, nextHistory);
        setHistory(prev => [...prev, { speaker: "judge", text: reply, timestamp: new Date().toLocaleTimeString() }]);
      }
      else if (nextTurnNum === 5) {
        // Deliver Final Verdict Order
        triggerGavelStrike();
        setActiveSpeaker("judge");
        const reply = await getVerdictResponse(apiKey, caseDetails, nextHistory);
        const finalHistory = [...nextHistory, { speaker: "judge", text: reply, timestamp: new Date().toLocaleTimeString() }];
        setHistory(finalHistory);
        
        // Wait and run Blind feedback engine on the whole transcript
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

  // Skip / Conclude hearing early
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

  return (
    <div className={`courtroom-grid ${flashScreen ? "flash-active" : ""}`}>
      {/* 1. Case Docket Sidebar (Left) */}
      <div className="court-left-bar">
        <div className="docket-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={18} style={{ color: "var(--brass-gold)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>Case File</h3>
          </div>
          <span className="badge badge-wood">{caseDetails.courtType}</span>
        </div>

        <div className="docket-body">
          <div>
            <div className="docket-section-title">Dispute Summary</div>
            <div className="docket-card">
              <p style={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "4px" }}>
                {caseDetails.petitioner} vs {caseDetails.respondent}
              </p>
              <p>{caseDetails.dispute}</p>
            </div>
          </div>

          <div>
            <div className="docket-section-title">Attached Docket</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {caseDetails.documents.map((doc, idx) => (
                <div 
                  key={idx} 
                  className="docket-card" 
                  style={{ cursor: "pointer", border: activeDocument?.name === doc.name ? "1px solid var(--brass-gold)" : "1px solid transparent" }}
                  onClick={() => setActiveDocument(activeDocument?.name === doc.name ? null : doc)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, textDecoration: "underline" }}>{doc.name}</h4>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{doc.size}</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", marginTop: "4px" }}>{doc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="docket-section-title">Relevant Acts & Sections</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {caseDetails.acts.map((act, idx) => (
                <div key={idx} className="docket-card">
                  <h4 style={{ margin: 0 }}>{act.section}</h4>
                  <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px" }}>{act.act}</div>
                  <p style={{ fontSize: "0.75rem" }}>{act.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Courtroom Center Panel */}
      <div className="court-center-bar">
        {/* Courtroom Visual Layout Area */}
        <div className="courtroom-stage">
          
          {/* Objection Alert Overlay */}
          {pendingObjectionData && (
            <div className="objection-alert-overlay">
              <button 
                className="btn btn-velvet shake-anim pulse-ring-element"
                style={{ borderRadius: "20px", fontWeight: "800", letterSpacing: "0.15em", padding: "10px 24px" }}
                onClick={handleObjectionClick}
              >
                <AlertOctagon size={16} /> OBJECT!
              </button>
            </div>
          )}

          {/* Judge Bench */}
          <div className="judge-bench-container">
            <div className="wood-panel judge-bench-panel">
              <div className={`judge-avatar ${activeSpeaker === "judge" ? "pulse-ring-element" : ""}`}>
                <Scale size={32} style={{ color: "var(--brass-gold)" }} />
              </div>
              <div className="judge-name">{caseDetails.judge || "Justice R. S. Pathak"}</div>
              <div className="judge-status">Presiding Officer</div>

              <div className="judge-patience-wrapper">
                <div className="patience-label-container">
                  <span>Judge Patience</span>
                  <span>{judgePatience}%</span>
                </div>
                <div className="patience-bar-bg">
                  <div className="patience-bar-fill" style={{ width: `${judgePatience}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Podiums */}
          <div className="podiums-container">
            {/* User Podium */}
            <div className={`podium ${activeSpeaker === "user" ? "active-speaker" : ""}`}>
              <div className="podium-title">Petitioner Counsel</div>
              <div className="podium-avatar">
                <Mic size={24} style={{ color: activeSpeaker === "user" ? "var(--brass-gold)" : "var(--text-muted)" }} />
              </div>
              <div className="podium-name">Adv. Rohan Sen</div>
              <div className="podium-desc">(You)</div>
            </div>

            {/* Opposing Counsel Podium */}
            <div className={`podium ${activeSpeaker === "opposing" ? "active-speaker" : ""}`}>
              <div className="podium-title">Respondent Counsel</div>
              <div className="podium-avatar">
                <MicOff size={24} style={{ color: "var(--text-muted)" }} />
              </div>
              <div className="podium-name">{caseDetails.opponentCounsel || "Advocate Amit Vyas"}</div>
              <div className="podium-desc">Apex Technologies</div>
            </div>
          </div>
        </div>

        {/* Chronological Transcript Feed */}
        <div className="transcript-area">
          {history.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.speaker}`}>
              <div className="bubble-meta">
                <span>{msg.speaker === "user" ? "You" : msg.speaker}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="bubble-content">{msg.text}</div>
            </div>
          ))}

          {loadingAI && (
            <div className="message-bubble judge" style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px" }}>
              <div className="wave-container active">
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--brass-light)" }}>The Court is considering your argument...</span>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Input Control Deck */}
        <div className="input-console-bar">
          {mode === "standard" ? (
            /* Option Selector for Standard Mode */
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-label" style={{ marginBottom: "4px" }}>Select your argument:</div>
              {caseDetails.dialogTree[currentStep] && caseDetails.dialogTree[currentStep].options ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {caseDetails.dialogTree[currentStep].options.map((opt, i) => (
                    <button 
                      key={i} 
                      className="btn btn-brass" 
                      style={{ textAlign: "left", justifyContent: "flex-start", textTransform: "none", fontSize: "0.9rem", lineHeight: "1.4" }}
                      onClick={() => selectStandardOption(opt)}
                    >
                      <ArrowRight size={16} style={{ flexShrink: 0 }} />
                      <span>{opt.text}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center" }}>
                  The judge is preparing the verdict. Please wait.
                </div>
              )}
            </div>
          ) : (
            /* Text Area and Voice Input for Generative Mode */
            <form onSubmit={handleGenerativeSubmit} className="input-console-form">
              <button 
                type="button" 
                className={`speak-btn-glow ${isRecording ? "recording" : ""}`}
                onClick={toggleRecording}
                title="Speak your argument"
              >
                <Mic size={20} />
              </button>

              <input 
                type="text" 
                className="form-control" 
                placeholder={isRecording ? "Listening..." : "Type your argument here..."}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                disabled={loadingAI}
              />

              <button 
                type="submit" 
                className="btn btn-brass"
                disabled={!userInput.trim() || loadingAI}
              >
                Submit
              </button>
            </form>
          )}

          {/* Quick Voice / Synthesis Controls */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className={`btn ${textToSpeechEnabled ? "btn-brass" : "btn-outline"}`}
              style={{ padding: "10px" }}
              onClick={() => {
                setTextToSpeechEnabled(!textToSpeechEnabled);
                if (textToSpeechEnabled) window.speechSynthesis?.cancel();
              }}
              title={textToSpeechEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
            >
              {textToSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button 
              className="btn btn-velvet"
              style={{ padding: "10px 14px", fontSize: "0.75rem" }}
              onClick={triggerEarlyVerdict}
              disabled={loadingAI}
            >
              Request Verdict
            </button>
          </div>
        </div>
      </div>

      {/* 3. Document Viewer / Active Evidence (Right) */}
      <div className="court-right-bar" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--bg-tertiary)", paddingBottom: "15px", marginBottom: "20px" }}>
          <Eye size={18} style={{ color: "var(--brass-gold)" }} />
          <h3 style={{ fontSize: "1.1rem" }}>Evidence Viewer</h3>
        </div>

        {activeDocument ? (
          <div className="fade-in-up-class" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="badge badge-brass" style={{ alignSelf: "flex-start" }}>EXHIBIT EVIDENCE</div>
            <h4 style={{ color: "var(--brass-light)", fontSize: "1.2rem", borderBottom: "1px dashed var(--text-muted)", paddingBottom: "8px" }}>
              {activeDocument.name}
            </h4>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", fontStyle: "italic", backgroundColor: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "4px" }}>
              "{activeDocument.desc}"
            </div>
            <div style={{ borderTop: "1px solid var(--bg-tertiary)", paddingTop: "12px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              File Size: {activeDocument.size} <br />
              Status: Entered as Primary Record.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", color: "var(--text-muted)", textAlign: "center" }}>
            <FileText size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
            <p style={{ fontSize: "0.85rem" }}>No document selected.</p>
            <p style={{ fontSize: "0.75rem", marginTop: "4px" }}>Click on an item in the Attached Docket list on the left to inspect detailed exhibits.</p>
          </div>
        )}
      </div>

      {/* Objection Option Popup Overlay */}
      {showObjectionTrigger && (
        <div 
          className="settings-panel-overlay" 
          style={{ justifyContent: "center", alignItems: "center" }}
          onClick={() => setShowObjectionTrigger(false)}
        >
          <div 
            className="wood-panel"
            style={{ width: "400px", padding: "30px", textAlign: "center" }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`gavel-icon-wrapper ${gavelStrike ? "gavel-anim" : ""}`}>
              <Gavel size={40} style={{ color: "var(--brass-gold)" }} />
            </div>
            <h3 style={{ margin: "16px 0 8px", fontSize: "1.3rem" }}>Select Grounds for Objection</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Identify the procedural violation committed by Advocate Vyas:
            </p>

            <div className="objection-list-container">
              <button className="objection-option" onClick={() => submitObjection("Hearsay")}>Hearsay</button>
              <button className="objection-option" onClick={() => submitObjection("Relevance")}>Irrelevant</button>
              <button className="objection-option" onClick={() => submitObjection("Speculation")}>Speculation</button>
              <button className="objection-option" onClick={() => submitObjection("Leading")}>Leading Q</button>
            </div>

            <button 
              className="btn btn-outline" 
              style={{ width: "100%", marginTop: "16px" }}
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
