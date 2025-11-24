const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes untuk halaman
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

app.get('/parafrase', (req, res) => {
    res.sendFile(__dirname + '/parafrase.html');
});

// API Route untuk Groq - DENGAN MODEL BARU
app.post('/api/parafrase', async (req, res) => {
    try {
        const { text, mode } = req.body; // Ganti 'style' jadi 'mode'
        
        // Cek API key
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'API key tidak ditemukan. Pastikan file .env sudah dibuat.'
            });
        }

        console.log('Processing request:', { 
            text: text?.substring(0, 50) + '...', 
            mode: mode 
        });

        // Model yang tersedia di Groq (pilih salah satu):
        const availableModels = [
            "llama-3.1-8b-instant",      // Cepat, untuk tugas sederhana
            "llama-3.3-70b-versatile",   // Seimbang, recommended
            "mixtral-8x7b-32768",        // Legacy (tidak bekerja)
            "gemma2-9b-it"               // Alternatif Google
        ];

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant", // ✅ MODEL BARU
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
            max_tokens: 2048,
            top_p: 0.9
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('Groq API success');
        
        res.json({ 
            success: true,
            paraphrased: response.data.choices[0].message.content 
        });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        
        let errorMessage = 'Terjadi kesalahan server';
        if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            success: false,
            error: errorMessage
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API bekerja!', timestamp: new Date() });
});

// Test Groq connection
app.get('/api/test-groq', async (req, res) => {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: "Halo, balas dengan 'Groq API berhasil!'"
                }
            ],
            max_tokens: 20
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ 
            success: true,
            message: 'Groq connection successful',
            response: response.data.choices[0].message.content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.response?.data?.error?.message || error.message
        });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✓ Loaded' : '✗ Missing');
    console.log('Available test endpoints:');
    console.log('  - http://localhost:3000/api/test');
    console.log('  - http://localhost:3000/api/test-groq');
});