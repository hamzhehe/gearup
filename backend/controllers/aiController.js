const dialogflow = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');

// Send message to Dialogflow
// POST /api/ai/chat
// Public
exports.chatWithAI = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Please provide a message' });
        }

        const projectId = process.env.DIALOGFLOW_PROJECT_ID;
        const sessionId = uuidv4();

        // Check if configuration exists
        if (!projectId || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Mock response if Dialogflow is not configured
            return res.status(200).json({
                success: true,
                data: {
                    reply: `[MOCK] You said: "${message}". Connect Dialogflow in .env to get real AI responses.`,
                    intent: 'Mock Intent'
                }
            });
        }

        const sessionClient = new dialogflow.SessionsClient();
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message,
                    languageCode: 'en-US',
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        res.status(200).json({
            success: true,
            data: {
                reply: result.fulfillmentText,
                intent: result.intent.displayName,
                confidence: result.intentDetectionConfidence
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
