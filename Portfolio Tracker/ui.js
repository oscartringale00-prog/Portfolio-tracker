export class UIManager {
  constructor() {
    this.currentLanguage = 'IT';
    this.currentCurrency = 'EUR';
  }

  /**
   * Mostra/nasconde le sezioni di login e app
   */
  toggleLoginSection(isLoggedIn) {
    const loginSection = document.getElementById('loginSection');
    const appSection = document.getElementById('appSection');
    
    if (isLoggedIn) {
      if (loginSection) loginSection.style.display = 'none';
      if (appSection) appSection.style.display = 'block';
    } else {
      if (loginSection) loginSection.style.display = 'flex';
      if (appSection) appSection.style.display = 'none';
    }
  }

  /**
   * Formatta un numero come valuta
   */
  formatCurrency(value, decimals = 2) {
    const num = Number(value || 0);
    
    if (this.currentCurrency !== 'EUR') {
      const locales = { EUR: 'it-IT', USD: 'en-US', GBP: 'en-GB' };
      return num.toLocaleString(locales[this.currentCurrency] || 'it-IT', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }
    
    // Custom EUR: punto per migliaia, virgola per decimali
    const parts = num.toFixed(decimals).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    if (decimals === 0) return intPart;
    
    const decPart = parts[1] || '0'.repeat(decimals);
    return intPart + ',' + decPart;
  }

  /**
   * Formatta un numero come valuta con simbolo
   */
  formatCurrencyWithSymbol(value, decimals = 2) {
    const symbols = { EUR: '€', USD: '$', GBP: '£' };
    const symbol = symbols[this.currentCurrency] || '€';
    return symbol + this.formatCurrency(value, decimals);
  }

  /**
   * Formatta una quantità
   */
  formatQuantity(value) {
    const num = Number(value || 0);
    if (Number.isInteger(num)) return num.toString();
    return num.toLocaleString('it-IT', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    });
  }

  /**
   * Mostra un modal
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  /**
   * Nascondi un modal
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Mostra un messaggio di stato
   */
  setStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = message;
      setTimeout(() => {
        statusEl.textContent = '';
      }, 3000);
    }
  }

  /**
   * Mostra un errore
   */
  showError(message) {
    const formError = document.getElementById('formError');
    if (formError) {
      formError.textContent = message;
      formError.style.display = 'block';
      setTimeout(() => {
        formError.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Aggiungi il bottone logout alle impostazioni
   */
  addLogoutButton(authLogoutCallback) {
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) return;
    
    let logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) {
      const modalContent = settingsModal.querySelector('.snapshot-modal-content');
      if (modalContent) {
        logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'btn';
        logoutBtn.style.background = 'var(--loss, #B8563F)';
        logoutBtn.style.color = '#fff';
        logoutBtn.style.marginTop = '20px';
        logoutBtn.style.width = '100%';
        logoutBtn.textContent = this.currentLanguage === 'EN' ? 'Logout' : 'Esci';
        logoutBtn.addEventListener('click', () => {
          const confirmMsg = this.currentLanguage === 'EN' ? 'Are you sure?' : 'Sei sicuro?';
          if (confirm(confirmMsg)) {
            authLogoutCallback();
            this.hideModal('settingsModal');
          }
        });
        modalContent.appendChild(logoutBtn);
      }
    }
  }

  /**
   * Abilita/disabilita dark mode
   */
  setDarkMode(isDark) {
    if (isDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }

  /**
   * Imposta la lingua
   */
  setLanguage(lang) {
    this.currentLanguage = lang;
  }

  /**
   * Imposta la valuta
   */
  setCurrency(currency) {
    this.currentCurrency = currency;
  }

  /**
   * Ottieni la lingua corrente
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Ottieni la valuta corrente
   */
  getCurrency() {
    return this.currentCurrency;
  }

  /**
   * Renderizza una tabella di holdings
   */
  renderHoldingsTable(holdings) {
    const tableBody = document.querySelector('tbody');
    if (!tableBody) return;

    tableBody.innerHTML = holdings.map(holding => `
      <tr>
        <td class="name-cell">
          <span class="n">${holding.name}</span>
          <span class="s">${holding.symbol}</span>
        </td>
        <td class="num">${this.formatQuantity(holding.quantity)}</td>
        <td class="num">${this.formatCurrencyWithSymbol(holding.currentValue)}</td>
        <td class="num">${this.formatCurrencyWithSymbol(holding.gain)}</td>
        <td class="num">
          <span class="gain-txt">${((holding.gain / (holding.quantity * holding.avgPrice)) * 100).toFixed(2)}%</span>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Renderizza le statistiche
   */
  renderStats(stats) {
    const statsContainer = document.querySelector('.stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Totale Investito</div>
        <div class="stat-value">${this.formatCurrencyWithSymbol(stats.totalInvested)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Valore Attuale</div>
        <div class="stat-value">${this.formatCurrencyWithSymbol(stats.currentValue)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Guadagno Totale</div>
        <div class="stat-value ${stats.totalGain >= 0 ? 'gain' : 'loss'}">
          ${this.formatCurrencyWithSymbol(stats.totalGain)}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">% Rendimento</div>
        <div class="stat-value ${stats.totalGainPercent >= 0 ? 'gain' : 'loss'}">
          ${stats.totalGainPercent.toFixed(2)}%
        </div>
      </div>
    `;
  }
}
