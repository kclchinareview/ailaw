import express from 'express';
const app = express();
app.use(express.json());
app.use(express.static('.')); // serves your index.html

app.post('/api/chat', async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'No question' });

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) return res.status(500).json({ error: 'Missing API key' });

    const systemPrompt = `You are a knowledgeable consultant specialising in Hong Kong-UK transnational law. 
You understand the interplay between common law in both jurisdictions, the Hong Kong Basic Law, 
UK post-Brexit legal framework, and cross-border issues. Provide accurate, educational information. 
Always suggest consulting a qualified lawyer for specific cases. Be clear and concise.`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ],
                temperature: 0.3,
                max_tokens: 800
            })
        });
        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content || 'Could not answer.';
        res.json({ answer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
