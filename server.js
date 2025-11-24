const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files dari root directory
app.use(express.static(__dirname));

// Routes untuk halaman
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/parafrase', (req, res) => {
    res.sendFile(path.join(__dirname, 'parafrase.html'));
});

// API Route untuk Groq
app.post('/api/parafrase', async (req, res) => {
    try {
        const { text, mode } = req.body;
        
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'API key tidak ditemukan.'
            });
        }

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system", 
                    content: `Kamu adalah asisten parafrase bahasa Indonesia. Parafrase teks berikut dalam gaya ${mode}. Hanya kembalikan teks yang sudah diparafrase tanpa penjelasan tambahan.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            temperature: 0.7,
            max_tokens: 2048
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        res.json({ 
            success: true,
            paraphrased: response.data.choices[0].message.content 
        });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false,
            error: error.response?.data?.error?.message || 'Terjadi kesalahan server'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});