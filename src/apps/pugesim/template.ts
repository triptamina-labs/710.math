export const pugesimTemplate = `
<div class="app-layout">
  <aside class="controls-panel card">
    <div class="control-group">
      <label for="temp_c">
        <span class="label-text">Temperatura</span>
        <span class="label-val" id="temp_c_val">35 °C</span>
      </label>
      <input type="range" id="temp_c" min="20" max="80" step="1" value="35" />
    </div>

    <div class="control-group">
      <label for="vacio_mbar">
        <span class="label-text">Vacío</span>
        <span class="label-val" id="vacio_mbar_val">10 mbar</span>
      </label>
      <input type="range" id="vacio_mbar" min="0.1" max="20" step="0.5" value="10" />
    </div>

    <div class="control-group">
      <label for="L_mm">
        <span class="label-text">Espesor de capa</span>
        <span class="label-val" id="L_mm_val">5 mm</span>
      </label>
      <input type="range" id="L_mm" min="1" max="25" step="1" value="5" />
    </div>

    <div class="control-group">
      <label for="C_0_pct">
        <span class="label-text">Gas inicial</span>
        <span class="label-val" id="C_0_pct_val">1 %</span>
      </label>
      <input type="range" id="C_0_pct" min="1" max="50" step="1" value="1" />
    </div>

    <input type="hidden" id="log_D_base" value="-8.5" />
    <input type="hidden" id="alpha" value="20" />

    <button id="btn-info" class="btn-info">Acerca del modelo</button>
  </aside>

  <main class="chart-area card">
    <div class="chart-container">
      <canvas id="chart"></canvas>
    </div>
    
    <div class="legend-bar">
      <div class="legend-item">
        <span class="legend-marker" style="background: #5b9bf5; border: none;"></span>
        <span>Propano — <span id="eq_propano">…</span> · <span id="cross_propano" class="max-value">…</span></span>
      </div>
      <div class="legend-item">
        <span class="legend-marker" style="background: #f0a45d; border: none;"></span>
        <span>Isobutano — <span id="eq_butano">…</span> · <span id="cross_butano" class="max-value">…</span></span>
      </div>
      <div class="legend-item">
        <span class="legend-marker" style="background: rgba(52, 211, 153, 0.25); border: none;"></span>
        <span>Zona segura (&lt; 500 ppm)</span>
      </div>
      <div class="legend-item">
        <span class="legend-marker" style="background: rgba(52, 211, 153, 0.55); border: none;"></span>
        <span>Zona ideal (&lt; 200 ppm)</span>
      </div>
    </div>
  </main>
</div>

<div id="info-overlay" class="overlay hidden">
  <div class="overlay-inner">
    <div class="overlay-header">
      <span class="page-indicator" id="page-indicator">1 / 8</span>
      <button class="btn-close" id="btn-close">&times;</button>
    </div>
    
    <div class="carousel" id="carousel">
      <div class="card active" data-slide>
        <h2>Contexto</h2>
        <p>La purga elimina el hidrocarburo atrapado en el concentrado mediante vacío y temperatura elevada. El objetivo regulatorio suele ser &lt; 500 ppm.</p>
      </div>
      <div class="card" data-slide>
        <h2>Equilibrio termodinámico</h2>
        <p>Se usa la teoría de <strong>Flory-Huggins</strong> para calcular el límite termodinámico. Si el equilibrio está por encima de 500 ppm, ningún tiempo será suficiente.</p>
      </div>
      <div class="card" data-slide>
        <h2>Transporte de masa</h2>
        <p>Se resuelve la 2ª ley de Fick con difusividad variable: conforme el solvente sale, el extracto se endurece y la difusión se ralentiza.</p>
      </div>
      <div class="card" data-slide>
        <h2>Condiciones de frontera</h2>
        <p>Superficie: fija al equilibrio. Fondo: flujo nulo contra la bandeja.</p>
      </div>
      <div class="card" data-slide>
        <h2>Método numérico</h2>
        <p>Diferencias finitas explícitas con paso de tiempo adaptativo para acelerar las etapas finales.</p>
      </div>
      <div class="card" data-slide>
        <h2>Parámetros</h2>
        <p>Espesores de capa finos (2-5 mm) purgan exponencialmente más rápido que capas gruesas.</p>
      </div>
      <div class="card card-warning" data-slide>
        <h2>Nota importante</h2>
        <p>Los parámetros son ilustrativos. Cada extracto tiene comportamientos de difusión distintos.</p>
      </div>
      <div class="card card-warning" data-slide>
        <h2>Limitaciones</h2>
        <ul>
          <li>Geometría 1D plana</li>
          <li>Sin nucleación de burbujas</li>
          <li>Temperatura constante</li>
        </ul>
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
