const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: 'sk-proj-808edMu01***********', // Replace with your actual OpenAI API key
});

// Route to handle GPT-4 requests
app.post('/api/gpt', async (req, res) => {
    try {
        const { text } = req.body;

        const prompt = `
        Please extract the following details from the given lease agreement text and return them in a structured JSON format:
        - tenantName: The name of the tenant.
        - landlordName: The name of the landlord.
        - propertyAddress: The address of the property being leased.
        - leaseDuration: The duration of the lease agreement (e.g., 12 months).
        - monthlyRent: The monthly rental amount.
        - startDate: The start date of the lease.
        - endDate: The end date of the lease.
        - securityDeposit: The security deposit amount.

        Text:
        ${text}
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a model designed to extract structured data from text.' },
                { role: 'user', content: prompt },
            ],
        });

        let messageContent = response.choices[0]?.message?.content;

        if (!messageContent) {
            throw new Error('Invalid response format from OpenAI');
        }

        // Remove Markdown backticks and trim extra spaces
        messageContent = messageContent.replace(/```json|```/g, '').trim();

        const parsedResponse = JSON.parse(messageContent); // Parse the cleaned JSON string
        res.json(parsedResponse);
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ error: 'Failed to process the lease agreement.' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
