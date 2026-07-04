import { firebaseConfig } from './config.js';
import { AuthManager } from './auth.js';
import { DataManager } from './data.js';
import { UIManager } from './ui.js';

/**
 * Classe principale dell'applicazione
 * Orchestra autenticazione, dati e UI
 */
class PortfolioApp {
  constructor() {
    // Controlla che Firebase sia caricato
    if (typeof firebase === 'undefined') {
      console.error('Firebase non è caricato');
      setTimeout(() => this.init(), 100);
      return;
    }

    // Inizializza Firebase
    const app = firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth();
    this.db = firebase.firestore();

    // Inizializza i manager
    this.authManager = new AuthManager(this.auth);
    this.dataManager = null;
    this.uiManager = new UIManager();

    this.init();
  }

  /**
   * Inizializza l'app
   */
  init() {
    console.log('Inizializzazione app...');

    // Setup login con Google
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
      this.authManager.setupGoogleLogin(googleLoginBtn);
    }

    // Monitora lo stato di autenticazione
    this.authManager.onAuthStateChanged((user) => {
      this.handleAuthStateChanged(user);
    });

    // Setup event listeners globali
    this.setupEventListeners();
  }

  /**
   * Gestisce i cambiamenti dello stato di autenticazione
   */
  async handleAuthStateChanged(user) {
    if (user) {
      console.log('Utente loggato:', user.email);
      this.uiManager.toggleLoginSection(true);

      // Inizializza il data manager con l'utente corrente
      this.dataManager = new DataManager(this.db, user);
      
      // Carica tutti i dati da Firebase
      await this.dataManager.loadAllFromFirebase();

      // Applica i patch
      await this.dataManager.applyAvgPricePatch();
      await this.dataManager.applyCategoryPatch();

      // Aggiungi il bottone logout
      this.uiManager.addLogoutButton(() => this.authManager.logout());

      // Render iniziale
      this.render();
    } else {
      console.log('Utente non loggato');
      this.uiManager.toggleLoginSection(false);

      // Pulisci i listeners se existono
      if (this.dataManager) {
        this.dataManager.cleanup();
        this.dataManager = null;
      }
    }
  }

  /**
   * Setup event listeners globali
   */
  setupEventListeners() {
    // Tema scuro/chiaro
    const themeDarkToggle = document.getElementById('themeDarkToggle');
    if (themeDarkToggle) {
      themeDarkToggle.addEventListener('change', (e) => {
        this.uiManager.setDarkMode(!e.target.checked);
      });
    }

    // Selezione valuta
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        this.uiManager.setCurrency(e.target.value);
        this.render();
      });
    }

    // Selezione lingua
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.uiManager.setLanguage(e.target.value);
        this.render();
      });
    }

    // Chiusura modal con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.snapshot-modal.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });
  }

  /**
   * Calcola le statistiche principali
   */
  computeStats() {
    if (!this.dataManager) return {
      totalInvested: 0,
      currentValue: 0,
      totalGain: 0,
      totalGainPercent: 0,
      totalCash: 0
    };

    const holdings = this.dataManager.getHoldings();
    const cashAccounts = this.dataManager.getCashAccounts();

    const totalInvested = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.currentValue || h.avgPrice * h.quantity), 0);
    const totalCash = cashAccounts.reduce((sum, c) => sum + c.amount, 0);
    const totalGain = currentValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue,
      totalGain,
      totalGainPercent,
      totalCash
    };
  }

  /**
   * Renderizza l'interfaccia
   */
  render() {
    if (!this.dataManager) return;

    console.log('Rendering app...');

    // Calcola le statistiche
    const stats = this.computeStats();

    // Renderizza le statistiche
    this.uiManager.renderStats(stats);

    // Renderizza la tabella di holdings
    const holdings = this.dataManager.getHoldings();
    this.uiManager.renderHoldingsTable(holdings);
  }

  /**
   * Aggiungi una nuova holding
   */
  async addHolding(holdingData) {
    if (!this.dataManager) return;
    
    try {
      await this.dataManager.addHolding(holdingData);
      this.render();
      this.uiManager.setStatus('Investimento aggiunto con successo');
    } catch (error) {
      console.error('Errore aggiunta holding:', error);
      this.uiManager.showError('Errore durante il salvataggio');
    }
  }

  /**
   * Modifica una holding
   */
  async updateHolding(id, updates) {
    if (!this.dataManager) return;
    
    try {
      await this.dataManager.updateHolding(id, updates);
      this.render();
      this.uiManager.setStatus('Investimento modificato con successo');
    } catch (error) {
      console.error('Errore modifica holding:', error);
      this.uiManager.showError('Errore durante il salvataggio');
    }
  }

  /**
   * Elimina una holding
   */
  async deleteHolding(id) {
    if (!this.dataManager) return;
    
    try {
      await this.dataManager.deleteHolding(id);
      this.render();
      this.uiManager.setStatus('Investimento eliminato con successo');
    } catch (error) {
      console.error('Errore eliminazione holding:', error);
      this.uiManager.showError('Errore durante l\'eliminazione');
    }
  }

  /**
   * Crea un nuovo snapshot
   */
  async createSnapshot() {
    if (!this.dataManager) return;
    
    try {
      const snapshot = this.dataManager.createSnapshot();
      this.dataManager.snapshots.push(snapshot);
      await this.dataManager.saveSnapshots();
      this.uiManager.setStatus('Snapshot creato con successo');
    } catch (error) {
      console.error('Errore creazione snapshot:', error);
      this.uiManager.showError('Errore durante la creazione dello snapshot');
    }
  }
}

/**
 * Inizializza l'app quando il DOM è pronto
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM caricato, avviando app...');
  window.app = new PortfolioApp();
});

// Esponi alcune funzioni globali per l'HTML inline
window.__app = {
  addHolding: (data) => window.app?.addHolding(data),
  updateHolding: (id, data) => window.app?.updateHolding(id, data),
  deleteHolding: (id) => window.app?.deleteHolding(id),
  createSnapshot: () => window.app?.createSnapshot()
};
