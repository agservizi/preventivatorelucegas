document.getElementById('preventivatoreForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const tipoServizio = document.getElementById('tipoServizio').value;
    const consumo = parseFloat(document.getElementById('consumo').value);

    // Simula il recupero dei dati ARERA e degli spread (dovresti sostituire con una chiamata API reale)
    const datiARERA = {
        luce: { PUN: 0.12, PSV: 0.05 }, // Esempio di dati
        gas: { PUN: 0.08, PSV: 0.03 }   // Esempio di dati
    };

    const spreadGestori = {
        "Enel Energia": { luce: 0.02, gas: 0.01 },
        "Windtre Luce e Gas": { luce: 0.015, gas: 0.012 },
        "Fastweb Energia": { luce: 0.018, gas: 0.014 },
        "A2A Energia": { luce: 0.017, gas: 0.013 },
        "Egea Energie": { luce: 0.019, gas: 0.015 }
    };

    const datiCorrenti = datiARERA[tipoServizio];
    const risultati = [];

    for (const [gestore, spread] of Object.entries(spreadGestori)) {
        const costo = consumo * (datiCorrenti.PUN + spread[tipoServizio]);
        risultati.push({ gestore, costo });
    }

    // Mostra i risultati
    const risultatoDiv = document.getElementById('risultato');
    const dettagliPreventivo = document.getElementById('dettagliPreventivo');
    dettagliPreventivo.innerHTML = risultati.map(r => `
        <div class="mb-2">
            <strong>${r.gestore}:</strong> €${r.costo.toFixed(2)}
        </div>
    `).join('');
    risultatoDiv.classList.remove('hidden');
});