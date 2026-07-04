# Portafoglio - Architettura Modulare

Questo è il refactor automatico del tuo portfolio app da un monolite di 4500+ linee in una struttura modulare e scalabile.

## 📁 Struttura dei File

```
progetto/
├── index.html              # HTML minimalista (entry point)
├── README.md               # Questo file
├── css/
│   └── styles.css          # Tutti gli stili CSS
└── js/
    ├── app.js              # Entry point principale (orchestrazione)
    ├── config.js           # Costanti e configurazione Firebase
    ├── auth.js             # Gestione autenticazione Google
    ├── data.js             # Gestione dati (holdings, cash, snapshots)
    └── ui.js               # Renderizzazione UI e formattazione
```

## 🚀 Come Funziona

### 1. **index.html** (Entry Point)
- HTML minimalista con soli elementi strutturali
- Carica Firebase SDK
- Carica l'app.js come modulo ES6
- Contiene l'adapter localStorage per compatibility

### 2. **config.js** (Costanti)
```javascript
- Firebase configuration
- Storage keys
- Default data (brokers, patch)
- Category patches
- Colors e labels (IT/EN)
```

### 3. **auth.js** (Autenticazione)
```javascript
- Classe AuthManager
- setupGoogleLogin(button)
- onAuthStateChanged(callback)
- logout()
- getCurrentUser()
```

### 4. **data.js** (Gestione Dati)
```javascript
- Classe DataManager
- loadAllFromFirebase()
- saveHoldings(), saveCash(), saveBrokers()
- addHolding(), updateHolding(), deleteHolding()
- createSnapshot()
- applyCategoryPatch(), applyAvgPricePatch()
- cleanup() - Pulisci listeners
```

### 5. **ui.js** (Interfaccia)
```javascript
- Classe UIManager
- toggleLoginSection(isLoggedIn)
- formatCurrency(), formatQuantity()
- showModal(), hideModal()
- renderHoldingsTable(), renderStats()
- setLanguage(), setCurrency()
- setDarkMode()
```

### 6. **app.js** (Orchestrazione)
```javascript
- Classe PortfolioApp
- Inizializza tutti i manager
- Gestisce i cambiamenti di autenticazione
- Setup event listeners
- Coordina render e salvataggi
- Espone funzioni globali window.__app
```

### 7. **styles.css** (Styling)
- Tutti i CSS del progetto
- CSS variables per tema scuro/chiaro
- Responsive design
- Mobile-first approach

## 🔄 Flusso Dati

```
User Click
    ↓
app.js (orchestrazione)
    ↓
ui.js (gestisce input)
    ↓
data.js (logica business)
    ↓
Firebase/localStorage (persistenza)
    ↓
ui.js (renderizza)
    ↓
HTML aggiornato
```

## 💡 Vantaggi del Refactor

| Aspetto | Prima | Dopo |
|---------|-------|------|
| Righe per file | 4547 | 600-700 max |
| Debuggabilità | 😫 Impossibile | ✅ Per-modulo |
| Testabilità | ❌ No | ✅ Sì (easy) |
| Riusabilità | ❌ No | ✅ Import ovunque |
| Maintenance | 💀 Difficile | 🚀 Facile |

## 🛠️ Come Usare

### Setup

```bash
# Assicurati che Firebase SDK sia nel <head>
# Apri index.html in un browser moderno (ES6 modules required)
```

### Aggiungere una nuova feature

**Esempio: Aggiungere una funzione di export PDF**

1. Crea `js/export.js`:
```javascript
export class ExportManager {
  async exportPDF(holdings) {
    // logica export
  }
}
```

2. Importa in `js/app.js`:
```javascript
import { ExportManager } from './export.js';
// ...
this.exportManager = new ExportManager();
```

3. Usa dove serve:
```javascript
await this.exportManager.exportPDF(this.dataManager.getHoldings());
```

### Modificare il rendering

Tutto il rendering è in `js/ui.js`. Puoi:
- Aggiungere nuovi metodi render*()
- Modificare formatCurrency()
- Cambiare i colori (in styles.css)

## 🧪 Testing (Facile ora!)

Prima (monolite):
```javascript
// Impossibile testare singole funzioni
```

Dopo (modulare):
```javascript
// test/auth.test.js
import { AuthManager } from '../js/auth.js';

test('login works', async () => {
  const auth = new AuthManager(mockFirebase);
  // ... test isolated
});
```

## 🔐 Sicurezza

1. **API Keys**: In config.js (esposto, ma Firebase ha regole di sicurezza)
2. **Firestore Rules**: Implementa security rules nel console Firebase
3. **Validazione**: Aggiungi in data.js prima di saveHoldings()

## 📱 Responsive Design

- Mobile first (breakpoint 768px)
- Touch targets 44px+
- Input font-size 16px (previene zoom)
- Overflow-x:hidden su tutto

## 🌍 Multi-linguaggio

```javascript
// In ui.js
this.setLanguage('EN'); // o 'IT'

// Poi i componenti si adattano
```

## 💾 Persistenza

- **Con Login**: Firebase Firestore (real-time sync)
- **Senza Login**: localStorage (fallback)
- **Adapter**: Entrambi gestiti da window.storage

## 🚢 Deployment

```bash
# Basta uploadare questi file su un server:
- index.html
- css/styles.css
- js/*.js

# Tutto funziona lato client
# No build step richiesto (ES6 modules nel browser)
```

## 📈 Prossimi Passi Consigliati

1. **Aggiungere test**: Jest + testing-library
2. **Validazione input**: JOI schema validation
3. **Error boundaries**: Try-catch in app.js
4. **Caching offline**: Service worker
5. **Bundle optimization**: Webpack/Vite

## 🤝 Contribuire

Aggiungere una feature:
1. Crea un nuovo file in `js/`
2. Esporta una classe
3. Importa in `app.js`
4. Integra nel flusso

---

**Versione**: 0.2 (Refactored)  
**Data**: Luglio 2026  
**Refactor**: Semplificato da 4547 → ~2000 righe di codice organizzato
