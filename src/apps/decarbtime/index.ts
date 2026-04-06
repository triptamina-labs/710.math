import { Chart, registerables } from 'chart.js';
import { runDecarb } from './engine';
import { decarbTemplate } from './template';

Chart.register(...registerables);

const COLORS = {
  THCA: '#2ecc71',
  THC: '#27ae60',
  CBN: '#e74c3c',
  CBDA: '#3498db',
  CBD: '#2980b9',
  CBD_DEG: '#8e44ad',
};

const GRID_COLOR = 'rgba(255, 255, 255, 0.06)';
const TICK_COLOR = '#8b8d94';

export function mount(container: HTMLElement) {
  container.innerHTML = decarbTemplate;

  const sliderIds = ['temp_c', 'P_atm', 'O2_percent', 'ratio_THC'] as const;
  type SliderId = (typeof sliderIds)[number];

  const units: Record<SliderId, string> = {
    temp_c: ' °C',
    P_atm: ' atm',
    O2_percent: ' %',
    ratio_THC: ' %',
  };

  const canvas = container.querySelector('#chart') as HTMLCanvasElement;
  let maxPoints: { THC: { x: number; y: number } | null; CBD: { x: number; y: number } | null } = {
    THC: null,
    CBD: null,
  };

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        { label: 'THCA', data: [], borderColor: COLORS.THCA, backgroundColor: 'transparent', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, tension: 0.3 },
        { label: 'THC', data: [], borderColor: COLORS.THC, backgroundColor: 'transparent', borderWidth: 3, pointRadius: 0, tension: 0.3 },
        { label: 'CBN', data: [], borderColor: COLORS.CBN, backgroundColor: 'transparent', borderWidth: 2, borderDash: [2, 4], pointRadius: 0, tension: 0.3 },
        { label: 'CBDA', data: [], borderColor: COLORS.CBDA, backgroundColor: 'transparent', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, tension: 0.3 },
        { label: 'CBD', data: [], borderColor: COLORS.CBD, backgroundColor: 'transparent', borderWidth: 3, pointRadius: 0, tension: 0.3 },
        { label: 'CBD deg.', data: [], borderColor: COLORS.CBD_DEG, backgroundColor: 'transparent', borderWidth: 2, borderDash: [2, 4], pointRadius: 0, tension: 0.3 },
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
              const m = items[0]?.parsed?.x ?? 0;
              return `${Math.round(m)} min`;
            },
            label(ctx) {
              return `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)} %`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Tiempo (minutos)', color: TICK_COLOR, font: { size: 11, weight: 400 } },
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, font: { size: 10 } },
          min: 0,
          max: 150,
        },
        y: {
          type: 'linear',
          title: { display: true, text: 'Concentración relativa (%)', color: TICK_COLOR, font: { size: 11, weight: 400 } },
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, font: { size: 10 } },
          min: 0,
          max: 105,
        },
      },
    },
    plugins: [
      {
        id: 'maxPoints',
        afterDraw(chart) {
          if (!maxPoints.THC && !maxPoints.CBD) return;
          const { ctx, scales } = chart;
          const xScale = scales['x'];
          const yScale = scales['y'];
          for (const [key, pt] of Object.entries(maxPoints)) {
            if (!pt) continue;
            const xPx = xScale.getPixelForValue(pt.x);
            const yPx = yScale.getPixelForValue(pt.y);
            if (xPx < xScale.left || xPx > xScale.right || yPx < yScale.top || yPx > yScale.bottom) continue;
            ctx.save();
            ctx.fillStyle = key === 'THC' ? COLORS.THC : COLORS.CBD;
            ctx.beginPath();
            ctx.arc(xPx, yPx, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#18181b';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }
        },
      },
    ],
  });

  function formatValue(id: SliderId, val: number): string {
    if (id === 'ratio_THC') {
      const thc = Math.round(val);
      const cbd = 100 - thc;
      return `${thc} % THC · ${cbd} % CBD`;
    }
    const str = id === 'P_atm' ? val.toFixed(1) : (Number.isInteger(val) ? val.toString() : val.toFixed(1));
    return str + units[id];
  }

  function readInputs() {
    const get = (id: string) => parseFloat((container.querySelector('#' + id) as HTMLInputElement).value);
    return {
      T_celsius: get('temp_c'),
      P_atm: get('P_atm'),
      O2_percent: get('O2_percent'),
      ratio_THC_percent: get('ratio_THC'),
    };
  }

  function update() {
    const input = readInputs();
    const result = runDecarb(input);
    const ratioTHC = input.ratio_THC_percent;

    const toChartData = (t: number[], y: number[]) => t.map((x, i) => ({ x, y: y[i] }));

    (chart.data.datasets[0] as any).data = toChartData(result.t_min, result.THCA);
    (chart.data.datasets[1] as any).data = toChartData(result.t_min, result.THC);
    (chart.data.datasets[2] as any).data = toChartData(result.t_min, result.CBN);
    (chart.data.datasets[3] as any).data = toChartData(result.t_min, result.CBDA);
    (chart.data.datasets[4] as any).data = toChartData(result.t_min, result.CBD);
    (chart.data.datasets[5] as any).data = toChartData(result.t_min, result.CBD_DEG);

    const showTHC = ratioTHC > 1;
    const showCBD = ratioTHC < 99;
    chart.data.datasets[0].hidden = !showTHC;
    chart.data.datasets[1].hidden = !showTHC;
    chart.data.datasets[2].hidden = !showTHC;
    chart.data.datasets[3].hidden = !showCBD;
    chart.data.datasets[4].hidden = !showCBD;
    chart.data.datasets[5].hidden = !showCBD;

    maxPoints = {
      THC: result.maxTHC ? { x: result.maxTHC.t_min, y: result.maxTHC.value } : null,
      CBD: result.maxCBD ? { x: result.maxCBD.t_min, y: result.maxCBD.value } : null,
    };

    chart.update();

    const maxThcValue = container.querySelector('#max-thc-value')!;
    const maxCbdValue = container.querySelector('#max-cbd-value')!;
    const maxThcLabel = container.querySelector('#max-thc-label') as HTMLElement;
    const maxCbdLabel = container.querySelector('#max-cbd-label') as HTMLElement;

    if (result.maxTHC && showTHC) {
      maxThcValue.textContent = `${result.maxTHC.t_min.toFixed(0)} min → ${result.maxTHC.value.toFixed(1)} %`;
      maxThcLabel.style.display = 'flex';
    } else {
      maxThcLabel.style.display = 'none';
    }

    if (result.maxCBD && showCBD) {
      maxCbdValue.textContent = `${result.maxCBD.t_min.toFixed(0)} min → ${result.maxCBD.value.toFixed(1)} %`;
      maxCbdLabel.style.display = 'flex';
    } else {
      maxCbdLabel.style.display = 'none';
    }
  }

  let debounceTimer: any = null;
  sliderIds.forEach(id => {
    const slider = container.querySelector('#' + id) as HTMLInputElement;
    const valueSpan = container.querySelector('#' + id + '_val')!;
    slider.oninput = () => {
      valueSpan.textContent = formatValue(id, parseFloat(slider.value));
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(update, 50);
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
  };
}
