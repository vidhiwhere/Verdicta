const mockScenarios = require('../data/mockScenarios');
const { generateCase } = require('../services/geminiService');
const { asyncHandler } = require('../middleware/errorHandler');

const listScenarios = asyncHandler(async (req, res) => {
    const summaries = mockScenarios.map(({ id, title, category, jurisdiction }) => ({
        id,
        title,
        category,
        jurisdiction,
    }));
    res.json({ scenarios: summaries });
});

const getScenario = asyncHandler(async (req, res) => {
    const scenario = mockScenarios.find((s) => s.id === req.params.id);
    if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
    }
    res.json({ scenario });
});

const generateCustomCase = asyncHandler(async (req, res) => {
    const { prompt, jurisdiction } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    const caseData = await generateCase({ prompt, jurisdiction });
    res.json({ case: caseData });
});

module.exports = { listScenarios, getScenario, generateCustomCase };