// Funzione per inviare email
function inviaEmail(email, oggetto, messaggio) {
    // Simulazione invio email (da sostituire con un vero servizio di invio email)
    console.log(`Email inviata a: ${email}\nOggetto: ${oggetto}\nMessaggio: ${messaggio}`);
}

// Funzione per generare il contenuto dell'email
function generaContenutoEmail(risultati, suggerimenti) {
    let contenuto = "Ecco i tuoi risultati e suggerimenti personalizzati:\n\n";
    risultati.forEach(r => {
        contenuto += `${r.gestore}: €${r.prezzo} (${r.tipoServizio === "luce" ? "Luce" : "Gas"} - ${r.periodo})\n`;
        contenuto += `Energia: €${r.prezzoEnergia}, Comm: €${r.costoComm}${r.risparmio ? `, Risparmio: €${r.risparmio}` : ''}, Stima annuale: €${r.costoAnnuo}\n\n`;
    });
    contenuto += `Suggerimenti di risparmio:\n${suggerimenti}`;
    return contenuto;
}

// Funzione per inviare notifiche via email
function inviaNotifichePremium(email, risultati, suggerimenti) {
    const oggetto = "Aggiornamenti Preventivatore Luce e Gas";
    const messaggio = generaContenutoEmail(risultati, suggerimenti);
    inviaEmail(email, oggetto, messaggio);
}
