import { Chart, registerables } from 'chart.js';
import { pugesimTemplate } from './template';

Chart.register(...registerables);

const PROPANO_COLOR = '#5b9bf5';
const BUTANO_COLOR = '#f0a45d';
const DANGER_COLOR = 'rgba(239, 68, 68, 0.07)';
const SAFE_COLOR = 'rgba(52, 211, 153, 0.08)';
const IDEAL_COLOR = 'rgba(52, 211, 153, 0.18)';
const GRID_COLOR = 'rgba(255, 255, 255, 0.06)';
const TICK_COLOR = '#8b8d94';

export function mount(container: HTMLElement) {
  container.innerHTML = pugesimTemplate;

  const sliderIds = ['temp_c', 'vacio_mbar', 'L_mm', 'C_0_pct'] as const;
  type SliderId = (typeof sliderIds)[number];

  const units: Record<SliderId, string> = {
    temp_c: ' °C',
    vacio_mbar: ' mbar',
    L_mm: ' mm',
    C_0_pct: ' %',
  };

  let crossingPoints: { x: number; y: number; color: string; label: string }[] = [];
  let eqLevels: { y: number; color: string; label: string }[] = [];

  const canvas = container.querySelector('#chart') as HTMLCanvasElement;
  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        { label: 'Propano', data: [], borderColor: PROPANO_COLOR, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: 0.3 },
        { label: 'Isobutano', data: [], borderColor: BUTANO_COLOR, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: 0.3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 150 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e2027',
          titleColor: '#e4e5e7',
          bodyColor: '#8b8d94',
          borderColor: '#2a2d35',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title(items) {
              const h = items[0]?.parsed?.x ?? 0;
              const hrs = Math.floor(h);
              const min = Math.round((h - hrs) * 60);
              return `${hrs}h ${min}m`;
            },
            label(ctx) {
              return `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)} ppm`;
            }
          }
        },
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Tiempo (h)', color: TICK_COLOR, font: { size: 11, weight: 400 } },
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, font: { size: 10 } },
        },
        y: {
          type: 'logarithmic',
          title: { display: true, text: 'Concentración (ppm)', color: TICK_COLOR, font: { size: 11, weight: 400 } },
          grid: { color: GRID_COLOR },
          ticks: {
            color: TICK_COLOR,
            font: { size: 10 },
            callback(tickValue) {
              const v = Number(tickValue);
              if ([1, 10, 100, 500, 1000, 10000, 100000].includes(v)) return v.toLocaleString();
              return '';
            }
          },
          min: 1,
        }
      }
    },
    plugins: [{
      id: 'pugesimExtras',
      beforeDraw(chart) {
        const { ctx, scales } = chart;
        const yScale = scales['y'];
        const xScale = scales['x'];
        const y500 = yScale.getPixelForValue(500);
        const y200 = yScale.getPixelForValue(200);
        const yBottom = yScale.getPixelForValue(yScale.min ?? 1);

        ctx.save();
        // Colored background zones
        ctx.fillStyle = DANGER_COLOR;
        ctx.fillRect(xScale.left, yScale.top, xScale.width, y500 - yScale.top);
        ctx.fillStyle = SAFE_COLOR;
        ctx.fillRect(xScale.left, y500, xScale.width, yBottom - y500);
        ctx.fillStyle = IDEAL_COLOR;
        ctx.fillRect(xScale.left, y200, xScale.width, yBottom - y200);
        ctx.restore();
      },
      afterDraw(chart) {
        const { ctx, scales } = chart;
        const yScale = scales['y'];
        const xScale = scales['x'];

        ctx.save();
        
        // Draw Equilibrium dashed lines to the right
        eqLevels.forEach(eq => {
          const py = yScale.getPixelForValue(eq.y);
          if (py < yScale.top || py > yScale.bottom) return;

          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = eq.color;
          ctx.lineWidth = 1;
          ctx.moveTo(xScale.left, py);
          ctx.lineTo(xScale.right, py);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.fillStyle = eq.color;
          ctx.font = 'bold 9px Inter';
          ctx.textAlign = 'right';
          ctx.fillText(eq.label, xScale.right - 5, py - 5);
        });

        // Draw Crossing points and vertical lines
        crossingPoints.forEach(pt => {
          const px = xScale.getPixelForValue(pt.x);
          const py = yScale.getPixelForValue(pt.y);
          if (px < xScale.left || px > xScale.right) return;

          // Vertical line
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 1;
          ctx.moveTo(px, yScale.bottom);
          ctx.lineTo(px, yScale.top);
          ctx.stroke();

          // Bubble/Dot
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Label
          ctx.font = 'bold 10px Inter';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'right';
          ctx.fillText(pt.label, px - 8, py + 4);
        });

        ctx.restore();
      }
    }]
  });

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  function findCrossing(times: number[], ppm: number[], threshold: number): number | null {
    for (let i = 1; i < ppm.length; i++) {
      if (ppm[i - 1] >= threshold && ppm[i] < threshold) {
        const logPrev = Math.log10(ppm[i - 1]);
        const logCurr = Math.log10(ppm[i]);
        const logThr = Math.log10(threshold);
        const frac = (logPrev - logThr) / (logPrev - logCurr);
        return times[i - 1] + frac * (times[i] - times[i - 1]);
      }
    }
    return null;
  }

  let requestId = 0;
  function update() {
    requestId++;
    const get = (id: string) => parseFloat((container.querySelector('#' + id) as HTMLInputElement).value);
    const msg = {
      id: requestId,
      input: {
        temp_c: get('temp_c'),
        vacio_mbar: get('vacio_mbar'),
        L_mm: get('L_mm'),
        log_D_base: get('log_D_base'),
        alpha: get('alpha'),
        C_0_pct: get('C_0_pct'),
      }
    };
    worker.postMessage(msg);
  }

  worker.onmessage = (e) => {
    const { id, results } = e.data;
    if (id !== requestId) return;

    const [propano, butano] = results;
    const toChartData = (t: number[], v: number[]) => t.map((x, i) => ({ x, y: v[i] }));
    
    (chart.data.datasets[0] as any).data = toChartData(propano.tiempos_h, propano.ppm_promedio);
    (chart.data.datasets[1] as any).data = toChartData(butano.tiempos_h, butano.ppm_promedio);

    const tProp = findCrossing(propano.tiempos_h, propano.ppm_promedio, 500);
    const tBut = findCrossing(butano.tiempos_h, butano.ppm_promedio, 500);

    // Update crossing details for the plugin
    crossingPoints = [];
    if (tProp !== null) crossingPoints.push({ x: tProp, y: 500, color: PROPANO_COLOR, label: `${tProp.toFixed(1)} h` });
    if (tBut !== null) crossingPoints.push({ x: tBut, y: 500, color: BUTANO_COLOR, label: `${tBut.toFixed(1)} h` });

    eqLevels = [
      { y: propano.c_eq_ppm, color: PROPANO_COLOR, label: `${propano.c_eq_ppm.toFixed(0)} ppm` },
      { y: butano.c_eq_ppm, color: BUTANO_COLOR, label: `${butano.c_eq_ppm.toFixed(0)} ppm` }
    ];

    const xMaxInitial = Math.max(24, (tProp ?? 0) * 1.5, (tBut ?? 0) * 1.5);
    chart.options.scales!['x']!.max = Math.ceil(xMaxInitial / 6) * 6; // Snap to nice grid
    chart.update('none');

    container.querySelector('#eq_propano')!.textContent = `Eq: ${propano.c_eq_ppm.toFixed(1)} ppm`;
    container.querySelector('#eq_butano')!.textContent = `Eq: ${butano.c_eq_ppm.toFixed(1)} ppm`;
    
    const crossProp = container.querySelector('#cross_propano') as HTMLElement;
    const crossBut = container.querySelector('#cross_butano') as HTMLElement;
    
    if (tProp !== null) {
      crossProp.textContent = `500 ppm @ ${tProp.toFixed(1)} h`;
      crossProp.style.color = '#34d399';
    } else {
      crossProp.textContent = '> 500 ppm';
      crossProp.style.color = '#ef4444';
    }

    if (tBut !== null) {
      crossBut.textContent = `500 ppm @ ${tBut.toFixed(1)} h`;
      crossBut.style.color = '#34d399';
    } else {
      crossBut.textContent = '> 500 ppm';
      crossBut.style.color = '#ef4444';
    }
  };

  let debounceTimer: any = null;
  sliderIds.forEach(id => {
    const slider = container.querySelector('#' + id) as HTMLInputElement;
    const valueSpan = container.querySelector('#' + id + '_val')!;
    slider.oninput = () => {
      const v = parseFloat(slider.value);
      valueSpan.textContent = (id === 'vacio_mbar' && v < 1 ? v.toFixed(1) : Math.round(v)) + units[id];
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(update, 80);
    };
  });

  update();

  // --- Info Overlay & Carousel Logic ---
  const btnInfo = container.querySelector('#btn-info') as HTMLElement;
  const btnClose = container.querySelector('#btn-close') as HTMLElement;
  const overlay = container.querySelector('#info-overlay')!;
  
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

  btnInfo.onclick = () => { goToSlide(0); overlay.classList.remove('hidden'); };
  btnClose.onclick = () => overlay.classList.add('hidden');
  btnPrev.onclick = () => goToSlide(currentSlide - 1);
  btnNext.onclick = () => goToSlide(currentSlide + 1);

  return () => {
    chart.destroy();
    worker.terminate();
  };
}
