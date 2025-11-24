const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PENTING: Serve static files (CSS, JS, Images)
// Ini agar style.css, dashboard.css, dll bisa terbaca
app.use(express.static(__dirname));

// === ROUTES HALAMAN ===
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/parafrase', (req, res) => {
    res.sendFile(path.join(__dirname, 'parafrase.html'));
});

// === API ROUTES ===
app.post('/api/parafrase', async (req, res) => {
    try {
        const { text, mode } = req.body;
        
        // Cek API Key (Pastikan sudah diset di Vercel Settings)
        if (!process.env.GROQ_API_KEY) {
            console.error("API Key Groq hilang!");
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: API Key missing.'
            });
        }

        console.log(`Memproses request parafrase mode: ${mode}`);

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system", 
                    content: `Kamu adalah asisten parafrase bahasa Indonesia yang ahli. Tugasmu adalah memparafrasekan teks yang diberikan pengguna dengan gaya: ${mode}.
                    
                    Aturan:
                    1. JANGAN memberikan penjelasan tambahan, pembuka, atau penutup.
                    2. Langsung berikan hasil parafrase.
                    3. Gunakan bahasa Indonesia yang baik dan sesuai konteks gaya.`
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
            timeout: 30000 // 30 detik timeout
        });

        // Kirim hasil ke frontend
        res.json({ 
            success: true,
            paraphrased: response.data.choices[0].message.content 
        });

    } catch (error) {
        console.error('Error Groq API:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false,
            error: 'Gagal memproses permintaan ke AI.' 
        });
    }
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});