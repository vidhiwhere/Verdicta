const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

function getModel(systemInstruction) {
    return genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction,
    });
}

async function generateCase({ prompt, jurisdiction }) {
    const model = getModel(
        `You are a legal case architect for a courtroom simulation platform. ` +
        `Generate a realistic, well-structured legal case brief based on the user's request. ` +
        `Respond ONLY with valid JSON matching this shape, no markdown fences, no preamble: ` +
        `{"title": string, "brief": string, "jurisdiction": string, "charges": string[], "keyFacts": string[]}`
    );

    const result = await model.generateContent(
        `Jurisdiction preference: ${jurisdiction || 'unspecified'}\nRequest: ${prompt}`
    );

    const text = result.response.text().trim();
    return safeParseJSON(text);
}

async function getCourtroomResponse({ caseBrief, jurisdiction, transcript, userArgument }) {
    const model = getModel(
        `You are simulating an adversarial courtroom for legal practice. You play THREE roles as needed: ` +
        `the Presiding Judge (procedural, measured, occasionally strict), Opposing Counsel (aggressive, ` +
        `looks for weaknesses, raises objections), and any Witnesses being questioned. ` +
        `Case brief: ${caseBrief}\nJurisdiction: ${jurisdiction || 'generic common law'}\n` +
        `Stay strictly in character, respond with realistic courtroom dialogue and procedure. ` +
        `Respond ONLY with valid JSON, no markdown fences: ` +
        `{"role": "judge"|"opposing_counsel"|"witness", "content": string}`
    );

    const history = transcript
        .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
        .join('\n');

    const result = await model.generateContent(
        `Transcript so far:\n${history}\n\nUSER (advocate): ${userArgument}\n\nRespond as the next courtroom voice.`
    );

    const text = result.response.text().trim();
    return safeParseJSON(text);
}

async function generateAudit({ caseBrief, transcript }) {
    const model = getModel(
        `You are a blind legal performance auditor. Evaluate the ADVOCATE's (role: "user") performance ` +
        `across the full transcript against this rubric: legal reasoning, statutory knowledge, ` +
        `persuasiveness, objection management, and courtroom decorum. Score each 0-100. ` +
        `Respond ONLY with valid JSON, no markdown fences: ` +
        `{"scores": {"legalReasoning": number, "statutoryKnowledge": number, "persuasiveness": number, ` +
        `"objectionManagement": number, "courtroomDecorum": number}, ` +
        `"strengths": string[], "weaknesses": string[], "recommendations": string[]}`
    );

    const history = transcript
        .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
        .join('\n');

    const result = await model.generateContent(
        `Case brief: ${caseBrief}\n\nFull transcript:\n${history}\n\nProduce the audit now.`
    );

    const text = result.response.text().trim();
    return safeParseJSON(text);
}

function safeParseJSON(text) {
    const cleaned = text.replace(/^```json\s*|^```\s*|```$/gm, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        throw new Error(`Gemini returned non-JSON response: ${cleaned.slice(0, 200)}`);
    }
}

module.exports = { generateCase, getCourtroomResponse, generateAudit };