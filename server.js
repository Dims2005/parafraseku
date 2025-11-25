require('dotenv').config(); // <-- tambah ini di baris paling atas
const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

// simple request logger (letakkan sebelum static)
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Layani file statis dari folder public (non-aktifkan index.html default)
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// tambahan eksplisit (opsional)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// Redirect root ke /dashboard untuk menghindari pencarian index.html
app.get('/', (req, res) => {
  res.redirect('/dashboard');
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
            timeout: 30000
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

// Tambah debug route
app.get('/debug/public', (req, res) => {
    const fs = require('fs');
    const publicPath = path.join(__dirname, 'public');
    const files = fs.readdirSync(publicPath, { recursive: true });
    res.json({ files });
});

// Fallback route
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'dashboard.html'));
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT}`);
    });
}

module.exports = app;