import './style.css';
import { mount as mountDecarb } from './apps/decarbtime';
import { mount as mountPugesim } from './apps/pugesim';
import { mount as mountMixer } from './apps/hydrocarbonmixer';

interface AppDef {
  id: string;
  title: string;
  subtitle: string;
  mount: (container: HTMLElement) => () => void;
}

const apps: AppDef[] = [
  {
    id: 'decarbtime',
    title: 'DecarbTime',
    subtitle: 'Simulador de Descarboxilación (THCA→THC, CBDA→CBD)',
    mount: mountDecarb,
  },
  {
    id: 'dabpurge',
    title: 'DabPurge',
    subtitle: 'Simulador de Purga de Solvente Residual',
    mount: mountPugesim,
  },
  {
    id: 'mixer',
    title: 'HydrocarbonMixer',
    subtitle: 'Modelado de Solventes: Presión y Densidad',
    mount: mountMixer,
  },
];

let currentIndex = 0;
let unmountCurrent: (() => void) | null = null;

const appTitle = document.getElementById('app-title')!;
const appSubtitle = document.getElementById('app-subtitle')!;
const appContainer = document.getElementById('app-container')!;
const appDots = document.getElementById('app-dots')!;

function renderDots() {
  appDots.innerHTML = '';
  apps.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === currentIndex ? ' active' : '');
    dot.onclick = () => switchApp(i);
    appDots.appendChild(dot);
  });
}

function switchApp(index: number) {
  if (unmountCurrent) {
    unmountCurrent();
  }

  currentIndex = (index + apps.length) % apps.length;
  const app = apps[currentIndex];

  appTitle.textContent = app.title;
  appSubtitle.textContent = app.subtitle;
  
  // Update browser title
  document.title = `${app.title} — 710.math`;

  renderDots();
  unmountCurrent = app.mount(appContainer);
}

document.getElementById('btn-prev-app')!.onclick = () => switchApp(currentIndex - 1);
document.getElementById('btn-next-app')!.onclick = () => switchApp(currentIndex + 1);

// Initialize with the first app
switchApp(0);

// Keyboard navigation (Arrow keys)
window.onkeydown = (e) => {
  if (e.key === 'ArrowLeft') switchApp(currentIndex - 1);
  if (e.key === 'ArrowRight') switchApp(currentIndex + 1);
};
