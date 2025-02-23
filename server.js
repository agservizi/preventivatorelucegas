const express = require('express');
const cors = require('cors');
const { ottieniOfferte } = require('./scrapeTariffe');

const app = express();
app.use(cors());

app.get('/api/offerte', async (req, res) => {
    try {
        const offerte = await ottieniOfferte();
        res.json(offerte);
    } catch (error) {
        console.error('Errore durante il recupero delle offerte:', error);
        res.status(500).json({ error: 'Errore durante il recupero delle offerte' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});
