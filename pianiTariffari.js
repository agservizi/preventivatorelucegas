const fs = require('fs');

// Carica i piani tariffari aggiornati dal file JSON
const pianiTariffari = JSON.parse(fs.readFileSync('pianiTariffari.json', 'utf-8'));

// Funzione per suggerire piani tariffari ottimali
function suggerisciPiani(consumoFuturoLuce, consumoFuturoGas) {
    const piani = pianiTariffari.map(piano => {
        const costoLuce = consumoFuturoLuce * piano.costoLuce;
        const costoGas = consumoFuturoGas * piano.costoGas;
        const costoTotale = costoLuce + costoGas;
        return {
            gestore: piano.gestore,
            pianoLuce: piano.pianoLuce,
            costoLuce: costoLuce.toFixed(2),
            pianoGas: piano.pianoGas,
            costoGas: costoGas.toFixed(2),
            costoTotale: costoTotale.toFixed(2)
        };
    });

    let html = '<div class="space-y-4 animate-fadeIn"><h3 class="text-lg font-bold">Piani Tariffari Ottimali:</h3>';
    piani.forEach(piano => {
        html += `
            <div class="p-4 bg-green-100 rounded-md">
                <strong>${piano.gestore}:</strong> 
                <br>Piano Luce: ${piano.pianoLuce} - Costo stimato Luce: €${piano.costoLuce}
                <br>Piano Gas: ${piano.pianoGas} - Costo stimato Gas: €${piano.costoGas}
                <br>Costo Totale: €${piano.costoTotale}
            </div>
        `;
    });
    html += '</div>';
    document.getElementById('pianiOttimali').innerHTML = html;
}

// Funzione per cercare offerte dai siti dei gestori
async function cercaOfferte() {
    try {
        const response = await fetch('http://localhost:3000/api/offerte');
        const offerte = await response.json();

        let html = '<div class="space-y-4 animate-fadeIn"><h3 class="text-lg font-bold">Offerte dai siti dei gestori:</h3>';
        offerte.forEach(offerta => {
            html += `
                <div class="p-4 bg-gray-100 rounded-md">
                    <strong>${offerta.gestore}:</strong>
                    ${offerta.pianoLuce ? `<br>Luce: Piano: ${offerta.pianoLuce}, Costo: €${offerta.costoLuce}` : ""}
                    ${offerta.pianoGas ? `<br>Gas: Piano: ${offerta.pianoGas}, Costo: €${offerta.costoGas}` : ""}
                </div>
            `;
        });
        html += '</div>';
        document.getElementById('dettagliPreventivo').insertAdjacentHTML('afterend', '<div id="offerteEsterno">' + html + '</div>');
    } catch (error) {
        console.error('Errore durante il recupero delle offerte:', error);
        alert('Si è verificato un errore durante il recupero delle offerte. Riprova più tardi.');
    }
}

module.exports = { suggerisciPiani, cercaOfferte };
