import { Chart, registerables } from 'chart.js';
import * as chem from './chemistry';
import { mixerTemplate } from './template';

Chart.register(...registerables);

const MIX_LINE = '#5b9bf5';
const PROPANE_COLOR = 'rgba(239, 68, 68, 0.4)';
const ISOBUTANE_COLOR = 'rgba(59, 130, 246, 0.4)';
const CHART_TICK = '#8b8d94';
const CHART_GRID = 'rgba(255, 255, 255, 0.06)';
const CHART_AXIS_BORDER = '#3f3f46';

export function mount(container: HTMLElement) {
  container.innerHTML = mixerTemplate;

  const canvas = container.querySelector('#chart') as HTMLCanvasElement;
  let currentTab: 'vapor' | 'density' = 'vapor';
  let pUnit: 'bar' | 'psi' | 'kPa' | 'atm' = 'psi';
  let tUnit: 'C' | 'F' | 'K' = 'C';
  let threshCaution = 150;
  let threshDanger = 250;

  const chart = new Chart(canvas, {
    type: 'scatter',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      scales: {
        x: { type: 'linear', grid: { color: CHART_GRID }, ticks: { color: CHART_TICK }, border: { color: CHART_AXIS_BORDER } },
        y: { type: 'linear', grid: { color: CHART_GRID }, ticks: { color: CHART_TICK }, border: { color: CHART_AXIS_BORDER } }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: CHART_TICK, font: { size: 10 }, boxWidth: 10, padding: 8, usePointStyle: true }
        }
      }
    }
  });

  const gSlider = container.querySelector('#g-slider') as HTMLInputElement;
  const tSlider = container.querySelector('#tank-temp') as HTMLInputElement;

  function convertP(bar: number): number {
    switch (pUnit) {
      case 'bar': return bar;
      case 'psi': return bar * 14.5038;
      case 'kPa': return bar * 100;
      case 'atm': return bar / 1.01325;
    }
  }

  function convertT(celsius: number): number {
    switch (tUnit) {
      case 'C': return celsius;
      case 'F': return celsius * 9 / 5 + 32;
      case 'K': return celsius + 273.15;
    }
  }

  function tLabel() { return tUnit === 'C' ? '°C' : tUnit === 'F' ? '°F' : 'K'; }

  function update() {
    const xProp = parseFloat(gSlider.value) / 100;
    const tempC = parseFloat(tSlider.value);
    
    container.querySelector('#g-slider-val')!.textContent = `${Math.round(xProp * 100)} %`;
    
    const pBar = xProp * chem.vaporPressureBar(chem.PROPANE_ANTOINE, tempC) + 
                  (1 - xProp) * chem.vaporPressureBar(chem.ISOBUTANE_ANTOINE, tempC);
    const dens = chem.mixLiquidDensity(xProp, tempC);
    const crit = chem.mixCritical(xProp);

    const pConverted = convertP(pBar);
    container.querySelector('#tank-psi')!.textContent = `${pConverted.toFixed(pUnit === 'psi' ? 1 : 2)} ${pUnit}`;
    container.querySelector('#tank-temp-val')!.textContent = `${convertT(tempC).toFixed(0)} ${tLabel()}`;
    
    const secondaryParts: string[] = [];
    if (pUnit !== 'bar') secondaryParts.push(`${pBar.toFixed(2)} bar`);
    if (pUnit !== 'psi') secondaryParts.push(`${(pBar * 14.5038).toFixed(1)} psi`);
    container.querySelector('#tank-secondary')!.textContent = secondaryParts[0] || '';

    container.querySelector('#mix-dens')!.textContent = dens ? `${dens.toFixed(4)} g/mL` : '—';
    container.querySelector('#crit-mix')!.textContent = `${convertT(crit.Tc - 273.15).toFixed(1)} ${tLabel()} · ${convertP(crit.Pc).toFixed(1)} ${pUnit}`;

    const badge = container.querySelector('#safety-badge') as HTMLElement;
    const pPsi = pBar * 14.5038;
    if (pPsi < threshCaution) {
      badge.textContent = 'SEGURO'; badge.style.backgroundColor = 'rgba(52, 211, 153, 0.1)'; badge.style.color = '#34d399';
    } else if (pPsi < threshDanger) {
      badge.textContent = 'PRECAUCIÓN'; badge.style.backgroundColor = 'rgba(240, 164, 93, 0.1)'; badge.style.color = '#f0a45d';
    } else {
      badge.textContent = 'PELIGRO'; badge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; badge.style.color = '#ef4444';
    }

    if (currentTab === 'vapor') {
      const ts = chem.linspace(-50, 150, 150);
      const propCurve = ts.filter(t => t <= chem.PROPANE_CRIT.Tc - 273.15).map(t => ({ x: convertT(t), y: convertP(chem.vaporPressureBar(chem.PROPANE_ANTOINE, t)) }));
      const isobCurve = ts.filter(t => t <= chem.ISOBUTANE_CRIT.Tc - 273.15).map(t => ({ x: convertT(t), y: convertP(chem.vaporPressureBar(chem.ISOBUTANE_ANTOINE, t)) }));
      const mixCurve = ts.filter(t => t <= crit.Tc - 273.15).map(t => ({ x: convertT(t), y: convertP(xProp * chem.vaporPressureBar(chem.PROPANE_ANTOINE, t) + (1 - xProp) * chem.vaporPressureBar(chem.ISOBUTANE_ANTOINE, t)) }));
      
      chart.data.datasets = [
        { label: 'Propano', data: propCurve, borderColor: PROPANE_COLOR, showLine: true, pointRadius: 0, borderDash: [4, 4], tension: 0.3 },
        { label: 'Isobutano', data: isobCurve, borderColor: ISOBUTANE_COLOR, showLine: true, pointRadius: 0, borderDash: [4, 4], tension: 0.3 },
        { label: 'Pc Gases', data: [
            { x: convertT(chem.PROPANE_CRIT.Tc - 273.15), y: convertP(chem.PROPANE_CRIT.Pc) },
            { x: convertT(chem.ISOBUTANE_CRIT.Tc - 273.15), y: convertP(chem.ISOBUTANE_CRIT.Pc) }
          ], backgroundColor: CHART_TICK, pointRadius: 5, pointStyle: 'rectRot' },
        { label: 'Mezcla', data: mixCurve, borderColor: MIX_LINE, showLine: true, pointRadius: 0, borderWidth: 3, tension: 0.3 },
        { label: 'Pc Mezcla', data: [{ x: convertT(crit.Tc - 273.15), y: convertP(crit.Pc) }], backgroundColor: MIX_LINE, pointRadius: 8, pointStyle: 'star' },
        { label: 'Actual', data: [{ x: convertT(tempC), y: pConverted }], backgroundColor: '#fff', pointRadius: 6, pointStyle: 'circle', order: -1 }
      ] as any;
      chart.options.scales!['y']!.title = { display: true, text: `Presión (${pUnit})`, color: CHART_TICK };
      chart.options.scales!['x']!.title = { display: true, text: `Temperatura (${tLabel()})`, color: CHART_TICK };
    } else {
      const ts = chem.linspace(-50, 100, 150);
      const propCurve = ts.map(t => ({ x: convertT(t), y: chem.liquidDensity(chem.PROPANE_CRIT, t) }));
      const isobCurve = ts.map(t => ({ x: convertT(t), y: chem.liquidDensity(chem.ISOBUTANE_CRIT, t) }));
      const mixCurve = ts.map(t => ({ x: convertT(t), y: chem.mixLiquidDensity(xProp, t) }));
      
      chart.data.datasets = [
        { label: 'Propano', data: propCurve, borderColor: PROPANE_COLOR, showLine: true, pointRadius: 0, borderDash: [4, 4], tension: 0.3 },
        { label: 'Isobutano', data: isobCurve, borderColor: ISOBUTANE_COLOR, showLine: true, pointRadius: 0, borderDash: [4, 4], tension: 0.3 },
        { label: 'Mezcla', data: mixCurve, borderColor: MIX_LINE, showLine: true, pointRadius: 0, borderWidth: 3, tension: 0.3 },
        { label: 'Actual', data: [{ x: convertT(tempC), y: dens || 0 }], backgroundColor: '#fff', pointRadius: 6, pointStyle: 'circle', order: -1 }
      ] as any;
      chart.options.scales!['y']!.title = { display: true, text: 'Densidad (g/mL)', color: CHART_TICK };
      chart.options.scales!['x']!.title = { display: true, text: `Temperatura (${tLabel()})`, color: CHART_TICK };
    }
    chart.update('none');
  }

  gSlider.oninput = update;
  tSlider.oninput = update;

  (container.querySelector('#btn-tab-vapor') as HTMLElement).onclick = (e) => {
    currentTab = 'vapor';
    (e.target as HTMLElement).classList.add('active');
    (container.querySelector('#btn-tab-density') as HTMLElement).classList.remove('active');
    update();
  };
  (container.querySelector('#btn-tab-density') as HTMLElement).onclick = (e) => {
    currentTab = 'density';
    (e.target as HTMLElement).classList.add('active');
    (container.querySelector('#btn-tab-vapor') as HTMLElement).classList.remove('active');
    update();
  };

  // --- Settings Modal Logic ---
  const btnSettings = container.querySelector('#btn-settings') as HTMLElement;
  const overlaySettings = container.querySelector('#settings-overlay') as HTMLElement;
  const btnSettingsClose = container.querySelector('#btn-settings-close') as HTMLElement;
  const unitPSelect = container.querySelector('#unit-pressure') as HTMLSelectElement;
  const unitTSelect = container.querySelector('#unit-temp') as HTMLSelectElement;
  const threshC = container.querySelector('#thresh-caution') as HTMLInputElement;
  const threshD = container.querySelector('#thresh-danger') as HTMLInputElement;

  btnSettings.onclick = () => overlaySettings.classList.remove('hidden');
  btnSettingsClose.onclick = () => overlaySettings.classList.add('hidden');
  overlaySettings.onclick = (e) => { if (e.target === overlaySettings) overlaySettings.classList.add('hidden'); };

  unitPSelect.onchange = () => { pUnit = unitPSelect.value as any; update(); };
  unitTSelect.onchange = () => { tUnit = unitTSelect.value as any; update(); };
  threshC.oninput = () => {
    threshCaution = parseInt(threshC.value);
    container.querySelector('#thresh-caution-val')!.textContent = `${threshCaution} psi`;
    update();
  };
  threshD.oninput = () => {
    threshDanger = parseInt(threshD.value);
    container.querySelector('#thresh-danger-val')!.textContent = `${threshDanger} psi`;
    update();
  };

  // --- Info Overlay & Carousel Logic ---
  const btnInfo = container.querySelector('#btn-info') as HTMLElement;
  const btnClose = container.querySelector('#btn-close') as HTMLElement;
  const overlayInfo = container.querySelector('#info-overlay')!;
  const slides = container.querySelectorAll<HTMLElement>('[data-slide]');
  const dotsContainer = container.querySelector('#dots')!;
  const pageIndicator = container.querySelector('#page-indicator')!;
  const btnPrev = container.querySelector('#btn-prev') as HTMLButtonElement;
  const btnNext = container.querySelector('#btn-next') as HTMLButtonElement;
  
  let currentSlide = 0;
  const totalSlides = slides.length;

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    if (i === 0) dot.className = 'active';
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }
  const dots = dotsContainer.querySelectorAll('span');

  function goToSlide(idx: number) {
    currentSlide = (idx + totalSlides) % totalSlides;
    slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    pageIndicator.textContent = `${currentSlide + 1} / ${totalSlides}`;
    btnPrev.disabled = currentSlide === 0;
    btnNext.disabled = currentSlide === totalSlides - 1;
  }

  btnInfo.onclick = () => { goToSlide(0); overlayInfo.classList.remove('hidden'); };
  btnClose.onclick = () => overlayInfo.classList.add('hidden');
  btnPrev.onclick = () => goToSlide(currentSlide - 1);
  btnNext.onclick = () => goToSlide(currentSlide + 1);

  update();

  return () => { chart.destroy(); };
}
