import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initialize Gemini client
 */
const getGeminiClient = (apiKey) => {
  if (!apiKey) throw new Error("API Key is required to use Generative AI mode.");
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generates the response for the Judge AI
 */
export async function getJudgeResponse(apiKey, caseDetails, history) {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are Justice R. S. Pathak, a strict, adversarial, and highly formal Judge in the ${caseDetails.courtType || "Civil Court"}. 
      Your job is NOT to be nice or validating. Your job is to test the speaker's arguments to the absolute limit. Find every hole. Ask the hardest question possible. 
      Challenge evidence, point out missing details, demand legal authority (acts/sections), and maintain strict courtroom etiquette.
      Keep your response concise (under 120 words). Focus strictly on the hearing.
      Address the counsel as "Counsel" or "Mr./Ms. Advocate". If they use informal language, reprimand them for courtroom etiquette.
      Maintain a formal, authoritative, and cold judicial tone.`
    });

    const prompt = `Here are the case details:
    Dispute: ${caseDetails.dispute}
    Parties: ${caseDetails.petitioner} vs ${caseDetails.respondent}
    Role of user: ${caseDetails.userSide === "petitioner" ? "Petitioner's Counsel" : "Respondent's Counsel"}
    
    Here is the hearing transcript history so far:
    ${history.map(h => `${h.speaker.toUpperCase()}: ${h.text}`).join("\n")}
    
    Deliver the Judge's next turn. Speak as the Judge. Do not include any tags, metadata, or extra dialogue. Just output the Judge's words directly.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in getJudgeResponse:", error);
    throw error;
  }
}

/**
 * Generates the response for the Opposing Counsel AI
 */
export async function getOpposingCounselResponse(apiKey, caseDetails, history) {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are Advocate Amit Vyas, the opposing counsel in this case. You represent the other party.
      Your job is to argue aggressively against the user's client. Exploit every weakness, lack of proof, or contractual gap.
      CRITICAL INSTRUCTION: In your response, you must intentionally make ONE statement that represents a clear legal objection opportunity (either HEARSAY, IRRELEVANCE, or SPECULATION) and explicitly flag it in the text.
      For example, embed a tag like:
      - "[OBJECTION: Hearsay] My client's neighbor told me that the petitioner is lazy."
      - "[OBJECTION: Relevance] The petitioner's lawyer wears outdated suits, which shows his lack of legal skill."
      - "[OBJECTION: Speculation] The petitioner probably damaged the property because he looks like a reckless person."
      Make sure to embed only ONE such tag and keep the rest of your statement legally sound but highly aggressive.
      Keep your response concise (under 120 words). Speak in a sharp, combative, legal tone.`
    });

    const prompt = `Here are the case details:
    Dispute: ${caseDetails.dispute}
    Parties: ${caseDetails.petitioner} vs ${caseDetails.respondent}
    User represents: ${caseDetails.userSide === "petitioner" ? "Petitioner" : "Respondent"}
    Opposing Counsel represents: ${caseDetails.userSide === "petitioner" ? "Respondent" : "Petitioner"}
    
    Here is the hearing transcript history so far:
    ${history.map(h => `${h.speaker.toUpperCase()}: ${h.text}`).join("\n")}
    
    Deliver the Opposing Counsel's next statement, arguing against the user. Ensure you include the [OBJECTION: type] tag in one of your sentences.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in getOpposingCounselResponse:", error);
    throw error;
  }
}

/**
 * Generates a final observations/order (Verdict) by the Judge AI
 */
export async function getVerdictResponse(apiKey, caseDetails, history) {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are Justice R. S. Pathak. You have heard the arguments. Deliver an interim observation or final order based on the transcript.
      Be decisive. Do not be vague. State who wins or what interim directions are given.
      Summarize the legal reasoning, referring to the evidence and acts cited during the hearing.
      Keep it formal, structured like a short court order, and under 150 words. Finish with 'Case disposed.' or 'Matter adjourned.'`
    });

    const prompt = `Case details:
    Dispute: ${caseDetails.dispute}
    Parties: ${caseDetails.petitioner} vs ${caseDetails.respondent}
    
    Hearing transcript:
    ${history.map(h => `${h.speaker.toUpperCase()}: ${h.text}`).join("\n")}
    
    Deliver the final order/verdict.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in getVerdictResponse:", error);
    throw error;
  }
}

/**
 * Evaluates the entire transcript using the Feedback Engine (Blind Evaluator)
 */
export async function evaluateHearing(apiKey, caseDetails, history) {
  try {
    const genAI = getGeminiClient(apiKey);
    // Use gemini-1.5-flash with structured JSON response
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: `You are a cold, honest, and blind legal evaluator. 
      You do not know which side the user is on (evaluate the argument solely on its own legal merit and factual clarity).
      Your goal is to test the argument and provide strict, actionable feedback. Do not sugarcoat. If the user was weak, score them low.
      
      You must grade 5 rubrics from 0 to 10. Do not give a 10 unless the following HARD conditions are met:
      1. Legal Accuracy: Cannot exceed 6/10 unless they cited a specific valid statute, section, or case law.
      2. Evidence Strength: Cannot exceed 6/10 unless they explicitly referenced primary files, photographs, invoices, or records in the case files.
      3. Procedural Compliance: Cannot exceed 7/10 unless they maintained strict etiquette (e.g. addressed the judge as 'My Lord' or 'Your Honour') and successfully called out objections to opposing counsel hearsay/speculation.
      4. Argumentation Clarity: Requires logical, structured flow, directly answering questions without dodging.
      5. Response to Pressure: Requires maintaining calm and formal composure under judicial questioning and interruptions.
      
      You must respond in valid JSON matching this schema:
      {
        "overallScore": number (0 to 10),
        "rubrics": {
          "legalAccuracy": {
            "score": number,
            "rationale": "detailed reason for the score",
            "checklist": [
              { "item": "Cited specific statutory acts/sections", "met": boolean },
              { "item": "Accurately applied the section to the facts", "met": boolean }
            ]
          },
          "evidenceStrength": {
            "score": number,
            "rationale": "detailed reason",
            "checklist": [
              { "item": "Referenced primary documents (agreement, invoice, etc.)", "met": boolean },
              { "item": "Leveraged photographic or physical records", "met": boolean }
            ]
          },
          "proceduralCompliance": {
            "score": number,
            "rationale": "detailed reason",
            "checklist": [
              { "item": "Followed formal courtroom greeting protocol", "met": boolean },
              { "item": "Maintained proper legal honorifics ('Your Honour')", "met": boolean },
              { "item": "Objected to hearsay/speculation", "met": boolean }
            ]
          },
          "argumentationClarity": {
            "score": number,
            "rationale": "detailed reason",
            "checklist": [
              { "item": "Structured argument with logical flow", "met": boolean },
              { "item": "Answered judge questions directly without dodging", "met": boolean }
            ]
          },
          "responseToPressure": {
            "score": number,
            "rationale": "detailed reason",
            "checklist": [
              { "item": "Maintained calm under judicial interruptions", "met": boolean },
              { "item": "Countered opposing counsel assertions factually", "met": boolean }
            ]
          }
        },
        "strengths": ["string", "string"],
        "weaknesses": ["string", "string"],
        "suggestions": ["string", "string"],
        "auditLog": [
          {
            "speaker": "user" | "judge" | "opposing",
            "text": "original text snippet",
            "evaluation": "positive" | "negative" | "neutral",
            "commentary": "Short explanation of legal merits, mistakes, or etiquette violations in this specific sentence."
          }
        ]
      }`
    });

    const prompt = `Case details:
    Dispute: ${caseDetails.dispute}
    Parties: ${caseDetails.petitioner} vs ${caseDetails.respondent}
    User represents: ${caseDetails.userSide === "petitioner" ? "Petitioner" : "Respondent"}
    
    Hearing transcript to evaluate:
    ${history.map(h => `${h.speaker.toUpperCase()}: ${h.text}`).join("\n")}
    
    Analyze the transcript and output the strict evaluation JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Parse the JSON output
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in evaluateHearing:", error);
    throw error;
  }
}
