import pandas as pd
from datetime import datetime

# Dati ARERA (aggiornati manualmente)
PUN_LUCE = 0.15304  # €/kWh
PSV_GAS = 0.5712    # €/Smc

# Spread dei gestori (aggiornati con i valori forniti)
SPREAD_GESTORI = {
    "Fastweb Energia": {"luce": 0.050, "gas": None},  # Solo luce
    "Enel Energia": {"luce": 0.0222, "gas": 0.0222},  # Esempio, aggiorna con i valori corretti
    "A2A Energia": {"luce": 0.028996, "gas": 0.13},
    "Windtre Luce e Gas": {"luce": 0.02891, "gas": 0.0951}
}

# Funzione per calcolare i prezzi finali
def calcola_prezzi(pun_luce, psv_gas, spread_gestori):
    risultati = []
    for gestore, spread in spread_gestori.items():
        # Calcola il prezzo della luce
        prezzo_luce = pun_luce + spread["luce"] if spread["luce"] else None

        # Calcola il prezzo del gas (se applicabile)
        prezzo_gas = psv_gas + spread["gas"] if spread["gas"] else None

        # Aggiungi i risultati
        risultati.append({
            "Gestore": gestore,
            "Prezzo Luce (€/kWh)": round(prezzo_luce, 5) if prezzo_luce else "N/A",
            "Prezzo Gas (€/Smc)": round(prezzo_gas, 5) if prezzo_gas else "N/A",
            "Spread Luce (€/kWh)": spread["luce"] if spread["luce"] else "N/A",
            "Spread Gas (€/Smc)": spread["gas"] if spread["gas"] else "N/A",
            "Data": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    return risultati

# Calcola i prezzi finali
risultati = calcola_prezzi(PUN_LUCE, PSV_GAS, SPREAD_GESTORI)

# Salva i risultati in un file CSV
df = pd.DataFrame(risultati)
df.to_csv("prezzi_energia.csv", index=False)
print("Dati salvati in prezzi_energia.csv")
print(df)