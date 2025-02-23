// Dati ARERA
const PUN_LUCE = 0.13832;  // €/kWh
const PSV_GAS = 0.52074;   // €/Smc

// Spread e costi di commercializzazione per gestore
const spreadGestori = {
    "Enel Energia": { luce: 0.02226, gas: 0.1100, costoCommLuce: 12.00, costoCommGas: 12.00 },
    "Windtre Luce e Gas": { luce: 0.02891, gas: 0.0951, costoCommLuce: 11.50, costoCommGas: 11.50 },
    "Fastweb Energia": { luce: 0.050, gas: null, costoCommLuce: 13.00, costoCommGas: null },
    "A2A Energia": { luce: 0.06328, gas: 0.13, costoCommLuce: 9.50, costoCommGas: 9.50 },
    "Egea Energie": { luce: 0.04960, gas: 0.11, costoCommLuce: 9.73, costoCommGas: 9.89 }
};

// Mostra/nascondi campi
document.getElementById('tipoServizio').addEventListener('change', function() {
    const consumoLuceDiv = document.getElementById('consumoLuceDiv');
    const consumoGasDiv = document.getElementById('consumoGasDiv');
    const consumoLuceInput = document.getElementById('consumoLuce');
    const consumoGasInput = document.getElementById('consumoGas');
    
    if (this.value === 'gas') {
        consumoLuceDiv.classList.add('hidden');
        consumoGasDiv.classList.remove('hidden');
        consumoGasInput.setAttribute('required', 'true');
        consumoLuceInput.removeAttribute('required');
    } else if (this.value === 'luce') {
        consumoLuceDiv.classList.remove('hidden');
        consumoGasDiv.classList.add('hidden');
        consumoLuceInput.setAttribute('required', 'true');
        consumoGasInput.removeAttribute('required');
    } else if (this.value === 'entrambi') {
        consumoLuceDiv.classList.remove('hidden');
        consumoGasDiv.classList.remove('hidden');
        consumoLuceInput.setAttribute('required', 'true');
        consumoGasInput.setAttribute('required', 'true');
    }
});

// Tema scuro
document.getElementById('toggleDarkMode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    this.querySelector('i').classList.toggle('fa-moon');
    this.querySelector('i').classList.toggle('fa-sun');
});

// Calcolo prezzi
function calcolaPrezzi(tipoServizio, consumoLuce, consumoGas, costoPrecedente, periodoLuce, periodoGas) {
    const risultati = [];
    const mesiLuce = periodoLuce === "mensile" ? 1 : 2;
    const mesiGas = periodoGas === "mensile" ? 1 : periodoGas === "bimestrale" ? 2 : 3;

    for (const [gestore, spread] of Object.entries(spreadGestori)) {
        if (tipoServizio === "luce" || tipoServizio === "entrambi") {
            if (spread.luce !== null) {
                const costoBase = PUN_LUCE * consumoLuce;
                const costoSpread = spread.luce * consumoLuce;
                const costoComm = spread.costoCommLuce * mesiLuce;
                const prezzoEnergia = costoBase + costoSpread;
                const prezzoTotale = prezzoEnergia + costoComm;
                const risparmioMensile = costoPrecedente ? ((costoPrecedente - prezzoTotale) / mesiLuce).toFixed(2) : null;
                const costoAnnuo = (prezzoTotale / mesiLuce) * (tipoServizio === "luce" ? 12 : 6); // 12 mesi per luce, 6 bimestri per entrambi
                risultati.push({
                    gestore,
                    prezzo: prezzoTotale.toFixed(2),
                    prezzoEnergia: prezzoEnergia.toFixed(2),
                    costoBase: costoBase.toFixed(2),
                    costoSpread: costoSpread.toFixed(2),
                    costoComm: costoComm.toFixed(2),
                    risparmio: costoPrecedente ? (costoPrecedente - prezzoTotale).toFixed(2) : null,
                    risparmioMensile: risparmioMensile,
                    costoAnnuo: costoAnnuo.toFixed(2),
                    periodo: periodoLuce,
                    mesi: mesiLuce,
                    tipoServizio: "luce"
                });
            }
        }
        if (tipoServizio === "gas" || tipoServizio === "entrambi") {
            if (spread.gas !== null) {
                const cons = tipoServizio === "gas" ? consumoLuce : consumoGas;
                const costoBase = PSV_GAS * cons;
                const costoSpread = spread.gas * cons;
                const costoComm = spread.costoCommGas * mesiGas;
                const prezzoEnergia = costoBase + costoSpread;
                const prezzoTotale = prezzoEnergia + costoComm;
                const risparmioMensile = costoPrecedente ? ((costoPrecedente - prezzoTotale) / mesiGas).toFixed(2) : null;
                const costoAnnuo = (prezzoTotale / mesiGas) * (tipoServizio === "gas" ? 12 : 6); // 12 mesi per gas, 6 bimestri per entrambi
                risultati.push({
                    gestore,
                    prezzo: prezzoTotale.toFixed(2),
                    prezzoEnergia: prezzoEnergia.toFixed(2),
                    costoBase: costoBase.toFixed(2),
                    costoSpread: costoSpread.toFixed(2),
                    costoComm: costoComm.toFixed(2),
                    risparmio: costoPrecedente ? (costoPrecedente - prezzoTotale).toFixed(2) : null,
                    risparmioMensile: risparmioMensile,
                    costoAnnuo: costoAnnuo.toFixed(2),
                    periodo: periodoGas,
                    mesi: mesiGas,
                    tipoServizio: "gas"
                });
            }
        }
    }
    return risultati;
}

// Creazione grafico
function creaGrafico(risultati, mostraMediaMensile = false) {
    const ctx = document.getElementById('risultatoChart').getContext('2d');
    const labels = risultati.map(r => `${r.gestore} (${r.tipoServizio} - ${r.periodo})`);
    const prezzi = mostraMediaMensile ?
        risultati.map(r => (parseFloat(r.prezzo) / r.mesi).toFixed(2)) :
        risultati.map(r => r.prezzo);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: mostraMediaMensile ? 'Costo Mensile Medio (€)' : 'Costo Totale (€)',
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
                            return mostraMediaMensile ?
                                `Costo mensile medio: €${(parseFloat(r.prezzo) / r.mesi).toFixed(2)} (${r.periodo})` :
                                `Costo totale: €${r.prezzo} (${r.periodo}) - Energia: €${r.prezzoEnergia}, Comm: €${r.costoComm}`;
                        }
                    }
                }
            }
        }
    });
}

// Suggerimenti risparmio
function generaSuggerimenti(consumoLuce, consumoGas, periodoLuce, periodoGas) {
    let suggerimenti = [];
    const sogliaLuceMensile = 250;
    const sogliaGasMensile = 80;
    const mesiLuce = periodoLuce === "mensile" ? 1 : 2;
    const mesiGas = periodoGas === "mensile" ? 1 : periodoGas === "bimestrale" ? 2 : 3;

    if (consumoLuce / mesiLuce > sogliaLuceMensile) {
        suggerimenti.push(`Considera lampadine LED per ridurre il consumo ${periodoLuce} di luce.`);
    }
    if (consumoGas / mesiGas > sogliaGasMensile) {
        suggerimenti.push(`Valuta un termostato smart per ottimizzare il gas ${periodoGas}.`);
    }
    return suggerimenti.length > 0 ? suggerimenti.join(" ") : `I tuoi consumi ${periodoLuce || periodoGas} sembrano già ottimizzati!`;
}

// Offerte dai siti dei gestori
function cercaOfferte() {
    const offerte = {
        "Enel Energia": { luce: "Spread 0.02226 €/kWh", gas: "Spread 0.1100 €/Smc" },
        "Windtre Luce e Gas": { luce: "Spread 0.02891 €/kWh", gas: "Spread 0.0951 €/Smc" },
        "Fastweb Energia": { luce: "Spread 0.050 €/kWh", gas: null },
        "A2A Energia": { luce: "Spread 0.06328 €/kWh", gas: "Spread 0.13 €/Smc" },
        "Egea Energie": { luce: "Spread 0.04960 €/kWh", gas: "Spread 0.11 €/Smc" }
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

let ultimiRisultati = [];
let mostraMediaMensile = false;

document.getElementById('preventivatoreForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const tipoServizio = document.getElementById('tipoServizio').value;
    const consumoLuce = parseFloat(document.getElementById('consumoLuce').value) || 0;
    const consumoGas = parseFloat(document.getElementById('consumoGas').value) || 0;
    const costoPrecedente = parseFloat(document.getElementById('costoPrecedente').value) || 0;
    const periodoLuce = document.querySelector('input[name="periodoLuce"]:checked')?.value || "mensile";
    const periodoGas = document.querySelector('input[name="periodoGas"]:checked')?.value || "bimestrale";

    if ((tipoServizio === "luce" && (isNaN(consumoLuce) || consumoLuce <= 0)) ||
        (tipoServizio === "gas" && (isNaN(consumoGas) || consumoGas <= 0)) ||
        (tipoServizio === "entrambi" && (isNaN(consumoLuce) || consumoLuce <= 0 || isNaN(consumoGas) || consumoGas <= 0))) {
        alert("Inserisci consumi validi per il periodo selezionato.");
        return;
    }

    document.getElementById('spinner').classList.remove('hidden');
    setTimeout(() => {
        const risultati = calcolaPrezzi(tipoServizio, consumoLuce, consumoGas, costoPrecedente, periodoLuce, periodoGas);
        ultimiRisultati = risultati;
        const risultatoDiv = document.getElementById('risultato');
        const dettagliPreventivo = document.getElementById('dettagliPreventivo');
        const suggerimentiDiv = document.getElementById('suggerimenti');

        if (risultati.length > 0) {
            let html = '<div class="space-y-4 animate-fadeIn">';
            html += '<div class="flex space-x-4 mb-4">';
            html += '<label><input type="radio" name="visualizzaCosto" value="totale" checked onclick="toggleCosto(false)"> Costo Totale</label>';
            html += '<label><input type="radio" name="visualizzaCosto" value="mensile" onclick="toggleCosto(true)"> Costo Mensile Medio</label>';
            html += '</div>';
            risultati.forEach(r => {
                html += `
                    <div class="p-4 ${r.tipoServizio === 'luce' ? 'bg-blue-50' : 'bg-red-50'} rounded-md">
                        <strong>${r.gestore}:</strong> €${mostraMediaMensile ? (parseFloat(r.prezzo) / r.mesi).toFixed(2) : r.prezzo} (${r.tipoServizio === "luce" ? "Luce" : "Gas"} - ${r.periodo}) 
                        <br><span class="text-sm">Energia: €${mostraMediaMensile ? (parseFloat(r.prezzoEnergia) / r.mesi).toFixed(2) : r.prezzoEnergia}, Comm: €${mostraMediaMensile ? (parseFloat(r.costoComm) / r.mesi).toFixed(2) : r.costoComm}${r.risparmio ? `, Risparmio: €${mostraMediaMensile ? r.risparmioMensile : r.risparmio}` : ''}, Stima annuale: €${r.costoAnnuo}</span>
                        <button class="preferitoBtn ml-2 text-yellow-500" data-gestore="${r.gestore}"><i class="far fa-heart"></i></button>
                    </div>
                `;
            });
            html += '<p class="text-sm text-gray-600 mt-4">Nota: I costi mostrati sono orientativi e possono variare in base a fattori come oneri di sistema, IVA e promozioni temporanee dei gestori.</p>';
            html += '</div>';
            dettagliPreventivo.innerHTML = html;
            suggerimentiDiv.innerHTML = generaSuggerimenti(consumoLuce, consumoGas, periodoLuce, periodoGas);
            risultatoDiv.classList.remove('hidden');
            creaGrafico(risultati, mostraMediaMensile);

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

// Toggle tra costo totale e mensile medio
function toggleCosto(mediaMensile) {
    mostraMediaMensile = mediaMensile;
    if (ultimiRisultati.length > 0) {
        const risultatoDiv = document.getElementById('risultato');
        const dettagliPreventivo = document.getElementById('dettagliPreventivo');
        const suggerimentiDiv = document.getElementById('suggerimenti');
        
        let html = '<div class="space-y-4 animate-fadeIn">';
        html += '<div class="flex space-x-4 mb-4">';
        html += `<label><input type="radio" name="visualizzaCosto" value="totale" ${!mostraMediaMensile ? 'checked' : ''} onclick="toggleCosto(false)"> Costo Totale</label>`;
        html += `<label><input type="radio" name="visualizzaCosto" value="mensile" ${mostraMediaMensile ? 'checked' : ''} onclick="toggleCosto(true)"> Costo Mensile Medio</label>`;
        html += '</div>';
        ultimiRisultati.forEach(r => {
            html += `
                <div class="p-4 ${r.tipoServizio === 'luce' ? 'bg-blue-50' : 'bg-red-50'} rounded-md">
                    <strong>${r.gestore}:</strong> €${mostraMediaMensile ? (parseFloat(r.prezzo) / r.mesi).toFixed(2) : r.prezzo} (${r.tipoServizio === "luce" ? "Luce" : "Gas"} - ${r.periodo}) 
                    <br><span class="text-sm">Energia: €${mostraMediaMensile ? (parseFloat(r.prezzoEnergia) / r.mesi).toFixed(2) : r.prezzoEnergia}, Comm: €${mostraMediaMensile ? (parseFloat(r.costoComm) / r.mesi).toFixed(2) : r.costoComm}${r.risparmio ? `, Risparmio: €${mostraMediaMensile ? r.risparmioMensile : r.risparmio}` : ''}, Stima annuale: €${r.costoAnnuo}</span>
                    <button class="preferitoBtn ml-2 text-yellow-500" data-gestore="${r.gestore}"><i class="far fa-heart"></i></button>
                </div>
            `;
        });
        html += '<p class="text-sm text-gray-600 mt-4">Nota: I costi mostrati sono orientativi e possono variare in base a fattori come oneri di sistema, IVA e promozioni temporanee dei gestori.</p>';
        html += '</div>';
        dettagliPreventivo.innerHTML = html;
        creaGrafico(ultimiRisultati, mostraMediaMensile);
    }
}

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
        const testo = `${r.gestore}: €${mostraMediaMensile ? (parseFloat(r.prezzo) / r.mesi).toFixed(2) : r.prezzo} (${r.tipoServizio === "luce" ? "Luce" : "Gas"} - ${r.periodo}) - Energia: €${mostraMediaMensile ? (parseFloat(r.prezzoEnergia) / r.mesi).toFixed(2) : r.prezzoEnergia}, Comm: €${mostraMediaMensile ? (parseFloat(r.costoComm) / r.mesi).toFixed(2) : r.costoComm}${r.risparmio ? `, Risparmio: €${mostraMediaMensile ? r.risparmioMensile : r.risparmio}` : ''}, Stima annuale: €${r.costoAnnuo}`;
        doc.text(testo, 10, y);
        y += 10;
    });
    doc.text("Nota: I costi mostrati sono orientativi e possono variare.", 10, y + 10);
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
    document.getElementById('consumoLuceDiv').classList.remove('hidden');
    document.getElementById('consumoGasDiv').classList.add('hidden');
    document.getElementById('consumoLuce').setAttribute('required', 'true');
    document.getElementById('consumoGas').removeAttribute('required');
    document.querySelector('input[name="periodoLuce"][value="mensile"]').checked = true;
    document.querySelector('input[name="periodoGas"][value="bimestrale"]').checked = true;
    ultimiRisultati = [];
    mostraMediaMensile = false;
});