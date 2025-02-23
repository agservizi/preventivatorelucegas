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

            // Esempio di selezione dei dati per Enel Energia (da adattare in base alla struttura del sito web)
            let pianoLuce = null;
            let costoLuce = null;
            let pianoGas = null;
            let costoGas = null;

            if (gestore === "Enel Energia") {
                pianoLuce = $('.offer-card__title').first().text().trim();
                costoLuce = parseFloat($('.offer-card__price').first().text().trim().replace('€', '').replace(',', '.'));
                pianoGas = $('.offer-card__title').eq(1).text().trim();
                costoGas = parseFloat($('.offer-card__price').eq(1).text().trim().replace('€', '').replace(',', '.'));
            } else if (gestore === "Fastweb Energia") {
                // Aggiorna i selettori per Fastweb Energia
                pianoLuce = $('.energy-offer__title').first().text().trim();
                costoLuce = parseFloat($('.energy-offer__price').first().text().trim().replace('€', '').replace(',', '.'));
                // Fastweb Energia potrebbe non avere offerte gas
            } else if (gestore === "A2A Energia") {
                // Aggiorna i selettori per A2A Energia
                pianoLuce = $('.tariff-card__title').first().text().trim();
                costoLuce = parseFloat($('.tariff-card__price').first().text().trim().replace('€', '').replace(',', '.'));
                pianoGas = $('.tariff-card__title').eq(1).text().trim();
                costoGas = parseFloat($('.tariff-card__price').eq(1).text().trim().replace('€', '').replace(',', '.'));
            } else if (gestore === "Egea Energie") {
                // Aggiorna i selettori per Egea Energie
                pianoLuce = $('.offer-title').first().text().trim();
                costoLuce = parseFloat($('.offer-price').first().text().trim().replace('€', '').replace(',', '.'));
                pianoGas = $('.offer-title').eq(1).text().trim();
                costoGas = parseFloat($('.offer-price').eq(1).text().trim().replace('€', '').replace(',', '.'));
            }

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
