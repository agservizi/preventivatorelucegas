// Dati ARERA
const PUN_LUCE = 0.15304;  // €/kWh
const PSV_GAS = 0.5712;    // €/Smc

// Spread dei gestori
const spreadGestori = {
    "Enel Energia": { luce: 0.02, gas: 0.01 },
    "Windtre Luce e Gas": { luce: 0.015, gas: 0.012 },
    "Fastweb Energia": { luce: 0.018, gas: null },
    "A2A Energia": { luce: 0.017, gas: 0.013 },
    "Egea Energie": { luce: 0.019, gas: 0.015 }
};

// Mostra/nascondi campo consumo gas
document.getElementById('tipoServizio').addEventListener('change', function() {
    const consumoGasDiv = document.getElementById('consumoGasDiv');
    if (this.value === 'entrambi') {
        consumoGasDiv.classList.remove('hidden');
        document.getElementById('consumoGas').setAttribute('required', 'true');
    } else {
        consumoGasDiv.classList.add('hidden');
        document.getElementById('consumoGas').removeAttribute('required');
    }
});

// Tema scuro
document.getElementById('toggleDarkMode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    this.querySelector('i').classList.toggle('fa-moon');
    this.querySelector('i').classList.toggle('fa-sun');
});

// Calcolo prezzi
function calcolaPrezzi(tipoServizio, consumoLuce, consumoGas, costoPrecedente) {
    const risultati = [];
    for (const [gestore, spread] of Object.entries(spreadGestori)) {
        if (tipoServizio === "luce" || tipoServizio === "entrambi") {
            if (spread.luce !== null) {
                const costoBase = PUN_LUCE * consumoLuce;
                const costoSpread = spread.luce * consumoLuce;
                const prezzo = costoBase + costoSpread;
                risultati.push({
                    gestore,
                    prezzo: prezzo.toFixed(2),
                    tipoServizio: "luce",
                    costoBase: costoBase.toFixed(2),
                    costoSpread: costoSpread.toFixed(2),
                    risparmio: costoPrecedente ? (costoPrecedente - prezzo).toFixed(2) : null
                });
            }
        }
        if (tipoServizio === "gas" || tipoServizio === "entrambi") {
            if (spread.gas !== null) {
                const cons = tipoServizio === "gas" ? consumoLuce : consumoGas;
                const costoBase = PSV_GAS * cons;
                const costoSpread = spread.gas * cons;
                const prezzo = costoBase + costoSpread;
                risultati.push({
                    gestore,
                    prezzo: prezzo.toFixed(2),
                    tipoServizio: "gas",
                    costoBase: costoBase.toFixed(2),
                    costoSpread: costoSpread.toFixed(2),
                    risparmio: costoPrecedente ? (costoPrecedente - prezzo).toFixed(2) : null
                });
            }
        }
    }
    return risultati;
}

// Creazione grafico
function creaGrafico(risultati) {
    const ctx = document.getElementById('risultatoChart').getContext('2d');
    const labels = risultati.map(r => `${r.gestore} (${r.tipoServizio})`);
    const prezzi = risultati.map(r => r.prezzo);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Costo Annuo (€)',
                data: prezzi,
                backgroundColor: risultati.map(r => r.tipoServizio === "luce" ? 'rgba(54, 162, 235, 0.7)' : 'rgba(255, 99, 132, 0.7)'),
                borderColor: risultati.map(r => r.tipoServizio === "luce" ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } },
            animation: { duration: 1000, easing: 'easeInOutQuad' },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const r = risultati[context.dataIndex];
                            return `Costo: €${r.prezzo} (Base: €${r.costoBase}, Spread: €${r.costoSpread})`;
                        }
                    }
                }
            }
        }
    });
}

// Suggerimenti risparmio
function generaSuggerimenti(consumoLuce, consumoGas) {
    let suggerimenti = [];
    if (consumoLuce > 3000) suggerimenti.push("Considera lampadine LED per ridurre il consumo di luce.");
    if (consumoGas > 1000) suggerimenti.push("Valuta un termostato smart per ottimizzare il gas.");
    return suggerimenti.length > 0 ? suggerimenti.join(" ") : "I tuoi consumi sembrano già ottimizzati!";
}

// Offerte dai siti dei gestori (dati di esempio)
function cercaOfferte() {
    const offerte = {
        "Enel Energia": { luce: "E-Light a 0.15 €/kWh", gas: "Gas Flex a 0.58 €/Smc" },
        "Windtre Luce e Gas": { luce: "Eco Smart a 0.14 €/kWh", gas: "Eco Gas a 0.57 €/Smc" },
        "Fastweb Energia": { luce: "Energia Fix a 0.16 €/kWh", gas: null },
        "A2A Energia": { luce: "Prezzo Certo a 0.15 €/kWh", gas: "Gas Sicuro a 0.59 €/Smc" },
        "Egea Energie": { luce: "Luce Verde a 0.155 €/kWh", gas: "Gas Casa a 0.60 €/Smc" }
    };

    let html = '<div class="space-y-4 animate-fadeIn"><h3 class="text-lg font-bold">Offerte dai siti dei gestori:</h3>';
    for (const [gestore, offerteGestore] of Object.entries(offerte)) {
        html += `
            <div class="p-4 bg-gray-100 rounded-md">
                <strong>${gestore}:</strong>
                ${offerteGestore.luce ? `<br>Luce: ${offerteGestore.luce}` : ""}
                ${offerteGestore.gas ? `<br>Gas: ${offerteGestore.gas}` : ""}
            </div>
        `;
    }
    html += '</div>';
    document.getElementById('dettagliPreventivo').insertAdjacentHTML('afterend', '<div id="offerteEsterno">' + html + '</div>');
}

let ultimiRisultati = []; // Variabile globale per salvare i risultati

// Gestione del form
document.getElementById('preventivatoreForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const tipoServizio = document.getElementById('tipoServizio').value;
    const consumoLuce = parseFloat(document.getElementById('consumoLuce').value);
    const consumoGas = parseFloat(document.getElementById('consumoGas').value) || 0;
    const costoPrecedente = parseFloat(document.getElementById('costoPrecedente').value) || 0;

    if (isNaN(consumoLuce) || consumoLuce <= 0 || (tipoServizio === "entrambi" && (isNaN(consumoGas) || consumoGas <= 0))) {
        alert("Inserisci consumi validi.");
        return;
    }

    document.getElementById('spinner').classList.remove('hidden');
    setTimeout(() => {
        const risultati = calcolaPrezzi(tipoServizio, consumoLuce, consumoGas, costoPrecedente);
        ultimiRisultati = risultati; // Salva i risultati per il PDF
        const risultatoDiv = document.getElementById('risultato');
        const dettagliPreventivo = document.getElementById('dettagliPreventivo');
        const suggerimentiDiv = document.getElementById('suggerimenti');

        if (risultati.length > 0) {
            let html = '<div class="space-y-4 animate-fadeIn">';
            risultati.forEach(r => {
                html += `
                    <div class="p-4 ${r.tipoServizio === 'luce' ? 'bg-blue-50' : 'bg-red-50'} rounded-md">
                        <strong>${r.gestore}:</strong> €${r.prezzo} (${r.tipoServizio === "luce" ? "Luce" : "Gas"}) 
                        <br><span class="text-sm">Base: €${r.costoBase}, Spread: €${r.costoSpread}${r.risparmio ? `, Risparmio: €${r.risparmio}` : ''}</span>
                        <button class="preferitoBtn ml-2 text-yellow-500" data-gestore="${r.gestore}"><i class="far fa-heart"></i></button>
                    </div>
                `;
            });
            html += '</div>';
            dettagliPreventivo.innerHTML = html;
            suggerimentiDiv.innerHTML = generaSuggerimenti(consumoLuce, consumoGas);
            risultatoDiv.classList.remove('hidden');
            creaGrafico(risultati);

            // Gestione preferiti
            document.querySelectorAll('.preferitoBtn').forEach(btn => {
                btn.addEventListener('click', function() {
                    this.querySelector('i').classList.toggle('far');
                    this.querySelector('i').classList.toggle('fas');
                    const gestore = this.dataset.gestore;
                    let preferiti = JSON.parse(localStorage.getItem('preferiti') || '[]');
                    if (preferiti.includes(gestore)) {
                        preferiti = preferiti.filter(p => p !== gestore);
                    } else {
                        preferiti.push(gestore);
                    }
                    localStorage.setItem('preferiti', JSON.stringify(preferiti));
                });
            });
        }
        document.getElementById('spinner').classList.add('hidden');
    }, 500);
});

// Salva risultati
document.getElementById('salvaRisultati').addEventListener('click', function() {
    const risultati = document.getElementById('dettagliPreventivo').innerHTML;
    localStorage.setItem('ultimiRisultati', risultati);
    alert('Risultati salvati!');
});

// Esporta PDF
document.getElementById('esportaPDF').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Preventivatore Luce e Gas - Risultati", 10, 10);
    doc.setFontSize(12);

    let y = 20;
    ultimiRisultati.forEach(r => {
        const testo = `${r.gestore}: €${r.prezzo} (${r.tipoServizio === "luce" ? "Luce" : "Gas"}) - Base: €${r.costoBase}, Spread: €${r.costoSpread}${r.risparmio ? `, Risparmio: €${r.risparmio}` : ''}`;
        doc.text(testo, 10, y);
        y += 10;
    });

    doc.save('preventivo_luce_gas.pdf');
});

// Cerca offerte
document.getElementById('cercaOfferte').addEventListener('click', function() {
    document.getElementById('offerteEsterno')?.remove();
    cercaOfferte();
});

// Reset
document.getElementById('resetBtn').addEventListener('click', function() {
    document.getElementById('preventivatoreForm').reset();
    document.getElementById('risultato').classList.add('hidden');
    document.getElementById('dettagliPreventivo').innerHTML = '';
    document.getElementById('suggerimenti').innerHTML = '';
    document.getElementById('offerteEsterno')?.remove();
    const canvas = document.getElementById('risultatoChart');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('consumoGasDiv').classList.add('hidden');
    document.getElementById('consumoGas').removeAttribute('required');
    ultimiRisultati = [];
});
​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​