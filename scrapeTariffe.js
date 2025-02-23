const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL dei siti web dei gestori
const urls = {
    "Enel Energia": "https://www.enel.it/it/offerte",
    "Fastweb Energia": "https://www.fastweb.it/energia/",
    "A2A Energia": "https://www.a2a.it/",
    "Egea Energie": "https://www.egea.it/egea-energie/offerte-luce-e-gas"
};

// Funzione per eseguire il web scraping
async function scrapeTariffe() {
    const pianiTariffari = [];

    for (const [gestore, url] of Object.entries(urls)) {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            // Esempio di selezione dei dati (da adattare in base alla struttura del sito web)
            const pianoLuce = $('selector-per-piano-luce').text().trim();
            const costoLuce = parseFloat($('selector-per-costo-luce').text().trim().replace('€', '').replace(',', '.'));
            const pianoGas = $('selector-per-piano-gas').text().trim();
            const costoGas = parseFloat($('selector-per-costo-gas').text().trim().replace('€', '').replace(',', '.'));

            pianiTariffari.push({
                gestore,
                pianoLuce,
                costoLuce,
                pianoGas,
                costoGas
            });
        } catch (error) {
            console.error(`Errore durante il web scraping per ${gestore}:`, error);
        }
    }

    // Salva i piani tariffari in un file JSON
    fs.writeFileSync('pianiTariffari.json', JSON.stringify(pianiTariffari, null, 2));
    console.log('Piani tariffari aggiornati salvati in pianiTariffari.json');
}

// Funzione per ottenere le offerte
async function ottieniOfferte() {
    await scrapeTariffe();
    const pianiTariffari = JSON.parse(fs.readFileSync('pianiTariffari.json', 'utf-8'));
    return pianiTariffari;
}

module.exports = { ottieniOfferte };
