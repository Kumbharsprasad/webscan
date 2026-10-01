const currentScript = document.currentScript as HTMLScriptElement;
const apiUrl = currentScript?.getAttribute('data-api') || 'https://example.com/api/scan';

class WebscanWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 320px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background: #ffffff;
          overflow: hidden;
        }
        .header {
          background: #2563eb;
          color: white;
          padding: 1rem;
          font-weight: bold;
          text-align: center;
        }
        .body {
          padding: 1rem;
        }
        input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }
        button {
          width: 100%;
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        button:hover {
          background: #1d4ed8;
        }
        button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .result {
          margin-top: 1rem;
          text-align: center;
          display: none;
        }
        .score {
          font-size: 2.5rem;
          font-weight: bold;
          color: #2563eb;
        }
        .link {
          display: block;
          margin-top: 0.5rem;
          color: #2563eb;
          text-decoration: none;
          font-size: 0.875rem;
        }
        .link:hover {
          text-decoration: underline;
        }
        .error {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: none;
        }
      </style>
      <div class="header">
        Free Website Audit
      </div>
      <div class="body">
        <form id="scan-form">
          <input type="url" id="url-input" placeholder="https://example.com" required />
          <button type="submit" id="scan-btn">Scan My Site</button>
        </form>
        <div id="error" class="error"></div>
        <div id="result" class="result">
          <div style="color: #6b7280; font-size: 0.875rem;">Overall Score</div>
          <div class="score" id="score-val">--</div>
          <a href="#" id="full-report-link" class="link" target="_blank">View Full Report</a>
        </div>
      </div>
    `;

    const form = this.shadowRoot.getElementById('scan-form') as HTMLFormElement;
    const urlInput = this.shadowRoot.getElementById('url-input') as HTMLInputElement;
    const scanBtn = this.shadowRoot.getElementById('scan-btn') as HTMLButtonElement;
    const errorDiv = this.shadowRoot.getElementById('error') as HTMLDivElement;
    const resultDiv = this.shadowRoot.getElementById('result') as HTMLDivElement;
    const scoreVal = this.shadowRoot.getElementById('score-val') as HTMLDivElement;
    const fullReportLink = this.shadowRoot.getElementById('full-report-link') as HTMLAnchorElement;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = urlInput.value;
      if (!url) return;

      scanBtn.disabled = true;
      scanBtn.textContent = 'Scanning...';
      errorDiv.style.display = 'none';
      resultDiv.style.display = 'none';

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Scan failed');
        }

        scoreVal.textContent = data.originalReport.scores.overall.toString();
        
        // Link to the main app dashboard (using the origin of the API endpoint)
        const apiOrigin = new URL(apiUrl).origin;
        fullReportLink.href = `${apiOrigin}?url=${encodeURIComponent(url)}`;
        
        resultDiv.style.display = 'block';
      } catch (err: any) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
      } finally {
        scanBtn.disabled = false;
        scanBtn.textContent = 'Scan My Site';
      }
    });
  }
}

customElements.define('webscan-widget', WebscanWidget);

// Auto-inject the element where the script tag was placed
if (currentScript && currentScript.parentNode) {
  const widget = document.createElement('webscan-widget');
  currentScript.parentNode.insertBefore(widget, currentScript);
}
