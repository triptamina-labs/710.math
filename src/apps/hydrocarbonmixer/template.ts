export const mixerTemplate = `
<div class="app-layout">
  <aside class="controls-panel">
    <div class="card control-card">
      <div class="control-group">
        <label for="g-slider">
          <span class="label-text">Propano (%)</span>
          <span class="label-val" id="g-slider-val">70 %</span>
        </label>
        <input type="range" id="g-slider" min="0" max="100" value="70" step="1" />
        <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-dim); margin-top: 0.4rem;">
          <span>0% (i-C₄H₁₀)</span>
          <span>100% (C₃H₈)</span>
        </div>
      </div>

      <div class="control-group">
        <label for="tank-temp">
          <span class="label-text">Temp. Ambiente</span>
          <span class="label-val" id="tank-temp-val">25 °C</span>
        </label>
        <input type="range" id="tank-temp" min="-20" max="100" value="25" step="1" />
      </div>

      <div class="card-actions">
        <button id="btn-info" class="btn-info">Acerca del modelo</button>
        <button id="btn-settings" class="btn-nav" title="Configuración">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.85,9.48l2.03,1.58C4.84,11.36,4.81,11.69,4.81,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
        </button>
      </div>
    </div>
    
    <div class="card info-card vapor-stats-card">
      <div class="stat-group">
        <span class="label-text">Presión en tanque</span>
        <div class="reading-row">
          <span id="tank-psi" class="reading-val">—</span>
          <span id="tank-secondary" class="reading-secondary">—</span>
        </div>
        <span id="safety-badge" class="tank-safety-badge">—</span>
      </div>
      
      <div class="stat-group">
        <span class="label-text">Punto crítico mezcla (Kay)</span>
        <span id="crit-mix" class="stat-val">—</span>
      </div>

      <div class="stat-group">
        <span class="label-text" id="mix-dens-label">Densidad mezcla</span>
        <span id="mix-dens" class="stat-val-large">—</span>
      </div>
    </div>
  </aside>

  <main class="chart-area card">
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; background: var(--bg); padding: 4px; border-radius: 8px; width: fit-content;">
       <button class="tab-btn active" id="btn-tab-vapor">Presión Vapor</button>
       <button class="tab-btn" id="btn-tab-density">Densidad</button>
    </div>
    <div class="chart-container">
      <canvas id="chart"></canvas>
    </div>
  </main>
</div>

<style>
.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
}
.tab-btn.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
</style>

<div id="settings-overlay" class="overlay hidden">
  <div class="overlay-inner" style="max-width: 340px;">
    <div class="card" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
        <h2 style="margin: 0; font-size: 1rem;">Configuración</h2>
        <button id="btn-settings-close" class="btn-close">&times;</button>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.75rem;">Unidades</h3>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <label style="font-size: 0.8rem;">Presión</label>
          <select id="unit-pressure" style="background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px; padding: 0.25rem 0.5rem;">
            <option value="psi">psi</option>
            <option value="bar">bar</option>
            <option value="kPa">kPa</option>
            <option value="atm">atm</option>
          </select>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label style="font-size: 0.8rem;">Temperatura</label>
          <select id="unit-temp" style="background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px; padding: 0.25rem 0.5rem;">
            <option value="C">°C</option>
            <option value="F">°F</option>
            <option value="K">K</option>
          </select>
        </div>
      </div>

      <div>
        <h3 style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.75rem;">Zonas de seguridad</h3>
        <div style="margin-bottom: 0.75rem;">
          <label style="font-size: 0.75rem; display: block; margin-bottom: 0.25rem;">Precaución &ge; <span id="thresh-caution-val">150 psi</span></label>
          <input type="range" id="thresh-caution" min="50" max="400" value="150" step="10" />
        </div>
        <div>
          <label style="font-size: 0.75rem; display: block; margin-bottom: 0.25rem;">Peligro &ge; <span id="thresh-danger-val">250 psi</span></label>
          <input type="range" id="thresh-danger" min="50" max="400" value="250" step="10" />
        </div>
      </div>
    </div>
  </div>
</div>

<div id="info-overlay" class="overlay hidden">
  <div class="overlay-inner">
    <div class="overlay-header">
      <span class="page-indicator" id="page-indicator">1 / 6</span>
      <button class="btn-close" id="btn-close">&times;</button>
    </div>
    
    <div class="carousel" id="carousel">
      <div class="card active" data-slide>
        <h2>HydrocarbonMixer</h2>
        <p>Herramienta para modelar mezclas <strong>propano + isobutano</strong>: presión de vapor, densidad del líquido y diagrama de fases.</p>
      </div>
      <div class="card" data-slide>
        <h2>Contexto</h2>
        <p>En el procesamiento de extractos se usan mezclas para ajustar la presión de trabajo y la selectividad. Conocer la densidad ayuda a dosificar correctamente.</p>
      </div>
      <div class="card" data-slide>
        <h2>Composición</h2>
        <p>El slider define el % de propano. Más propano implica mayor presión de vapor a la misma temperatura.</p>
      </div>
      <div class="card" data-slide>
        <h2>Pestaña Presión</h2>
        <p>Muestra el diagrama P-T con curvas de saturación y el punto crítico. Se clasifica en zonas de seguridad configurables.</p>
      </div>
      <div class="card" data-slide>
        <h2>Pestaña Densidad</h2>
        <p>Muestra la densidad del líquido y el punto crítico mezcla. Útil para cálculos de masa a partir de volumen.</p>
      </div>
      <div class="card" data-slide>
        <h2>Ecuaciones</h2>
        <p>Raoult para presión (Antoine) y mezcla ideal de volúmenes para densidad (Rackett). Estimaciones según Kay para el punto crítico.</p>
      </div>
    </div>

    <div class="carousel-nav">
      <button id="btn-prev" class="btn-nav">&larr;</button>
      <div class="dots" id="dots"></div>
      <button id="btn-next" class="btn-nav">&rarr;</button>
    </div>
  </div>
</div>
`;
