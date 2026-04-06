export const decarbTemplate = `
<div class="app-layout">
  <aside class="controls-panel card">
    <div class="control-group">
      <label for="temp_c">
        <span class="label-text">Temperatura</span>
        <span class="label-val" id="temp_c_val">120 °C</span>
      </label>
      <input type="range" id="temp_c" min="20" max="200" step="5" value="120" />
    </div>

    <div class="control-group">
      <label for="P_atm">
        <span class="label-text">Presión</span>
        <span class="label-val" id="P_atm_val">1 atm</span>
      </label>
      <input type="range" id="P_atm" min="0.1" max="15" step="0.1" value="1" />
    </div>

    <div class="control-group">
      <label for="O2_percent">
        <span class="label-text">% Oxígeno</span>
        <span class="label-val" id="O2_percent_val">21 %</span>
      </label>
      <input type="range" id="O2_percent" min="0" max="21" step="1" value="21" />
    </div>

    <div class="control-group">
      <label for="ratio_THC">
        <span class="label-text">Ratio</span>
        <span class="label-val" id="ratio_THC_val">50 % THC · 50 % CBD</span>
      </label>
      <div class="ratio-slider-wrap">
        <span class="ratio-end ratio-cbd">CBD</span>
        <input type="range" id="ratio_THC" min="0" max="100" step="10" value="50" />
        <span class="ratio-end ratio-thc">THC</span>
      </div>
    </div>

    <button id="btn-info" class="btn-info">Acerca del modelo</button>
  </aside>

  <main class="chart-area card">
    <div class="chart-container">
      <canvas id="chart"></canvas>
    </div>
    
    <div class="legend-bar legend-decarb">
      <div class="legend-stacks">
        <div class="legend-group">
          <div class="legend-stack">
            <div class="legend-stack-title">Ácido</div>
            <div class="legend-item"><span class="legend-line dashed" style="border-color: #2ecc71"></span> <span>THCA</span></div>
            <div class="legend-item"><span class="legend-line dashed" style="border-color: #3498db"></span> <span>CBDA</span></div>
          </div>
          <div class="legend-stack">
            <div class="legend-stack-title">Activo</div>
            <div class="legend-item"><span class="legend-line solid thick" style="border-color: #27ae60"></span> <span>THC</span></div>
            <div class="legend-item"><span class="legend-line solid thick" style="border-color: #2980b9"></span> <span>CBD</span></div>
          </div>
          <div class="legend-stack">
            <div class="legend-stack-title">Degradado</div>
            <div class="legend-item"><span class="legend-line dotted" style="border-color: #e74c3c"></span> <span>CBN</span></div>
            <div class="legend-item"><span class="legend-line dotted" style="border-color: #8e44ad"></span> <span>CBD deg.</span></div>
          </div>
        </div>
        
        <div class="legend-stack legend-stack-max">
           <div class="legend-stack-title">Pico (máx. activo)</div>
           <div class="legend-item" id="max-thc-label">
             <span class="legend-marker" style="background: #27ae60"></span>
             <span class="max-value" id="max-thc-value">—</span>
           </div>
           <div class="legend-item" id="max-cbd-label">
             <span class="legend-marker" style="background: #2980b9"></span>
             <span class="max-value" id="max-cbd-value">—</span>
           </div>
        </div>
      </div>
    </div>
  </main>
</div>

<div id="info-overlay" class="overlay hidden">
  <div class="overlay-inner">
    <div class="overlay-header">
      <span class="page-indicator" id="page-indicator">1 / 2</span>
      <button class="btn-close" id="btn-close">&times;</button>
    </div>
    
    <div class="carousel" id="carousel">
      <div class="card active" data-slide>
        <h2>Modelo cinético</h2>
        <p>Descarboxilación de ácidos cannabinoides (THCA→THC, CBDA→CBD) y degradación (THC→CBN, CBD→degradado) con cinética de Arrhenius:</p>
        <div style="background: #18181b; padding: 1rem; border-radius: 4px; margin: 1rem 0; font-family: monospace; text-align: center; color: var(--accent);">
          k = A · e<sup>−Ea/(R·T)</sup>
        </div>
        <p><strong>Vacío:</strong> facilita la salida del CO₂. <strong>Oxidación:</strong> la degradación depende de la presión parcial de O₂ (referencia 21% de 1000 mbar).</p>
      </div>
      <div class="card" data-slide>
        <h2>Limitaciones</h2>
        <p>Parámetros (Ea, A) son representativos. La herramienta es ilustrativa; resultados reales dependen del material y del equipo.</p>
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
