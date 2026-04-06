export interface GasParams {
  name: 'Propano' | 'Isobutano';
  A: number;
  B: number;
  C_ant: number;
  chi: number;
  m_ratio: number;
}

export interface SimulationInput {
  temp_c: number;
  vacio_mbar: number;
  L_mm: number;
  log_D_base: number;
  alpha: number;
  C_0_pct: number;
}

export interface SimulationResult {
  tiempos_h: number[];
  ppm_promedio: number[];
  c_eq_ppm: number;
  gas: string;
}

const GAS_PROPANO: GasParams = {
  name: 'Propano',
  A: 3.92828, B: 803.997, C_ant: 247.04,
  chi: 0.5, m_ratio: 4.5,
};

const GAS_ISOBUTANO: GasParams = {
  name: 'Isobutano',
  A: 3.93747, B: 893.527, C_ant: 248.870,
  chi: 0.6, m_ratio: 5.2,
};

function calcularPsat(temp_c: number, gas: GasParams): number {
  const P_bar = 10 ** (gas.A - gas.B / (temp_c + gas.C_ant));
  return P_bar * 100;
}

function floryHugginsEq(phi1: number, a1: number, m_ratio: number, chi: number): number {
  const phi2 = 1 - phi1;
  if (phi1 <= 1e-10) return 1e9;
  return Math.log(phi1) + (1 - 1 / m_ratio) * phi2 + chi * phi2 * phi2 - Math.log(a1);
}

function fsolveSimple(
  fn: (x: number) => number,
  x0: number,
  tol = 1e-12,
  maxIter = 200,
): number {
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = fn(x);
    if (Math.abs(fx) < tol) return x;
    const h = Math.max(Math.abs(x) * 1e-8, 1e-14);
    const dfx = (fn(x + h) - fx) / h;
    if (Math.abs(dfx) < 1e-30) break;
    x = x - fx / dfx;
    if (x < 0) x = 1e-15;
    if (x > 1) x = 1 - 1e-15;
  }
  return x;
}

function simularGas(gas: GasParams, input: SimulationInput): SimulationResult {
  const { temp_c, vacio_mbar, log_D_base, alpha, C_0_pct } = input;
  const L = input.L_mm / 1000.0;

  const P_vac_kpa = vacio_mbar / 10.0;
  const P_sat = calcularPsat(temp_c, gas);
  const D_base = 10 ** log_D_base;
  const C_0 = C_0_pct / 100.0;

  let a1 = P_vac_kpa / P_sat;
  if (a1 >= 1) a1 = 0.9999;

  let C_eq: number;
  try {
    C_eq = fsolveSimple(
      (phi1: number) => floryHugginsEq(phi1, a1, gas.m_ratio, gas.chi),
      1e-5,
    );
  } catch {
    C_eq = 1e-6;
  }
  if (C_eq < 0) C_eq = 1e-7;

  const nx = 30;
  const dx = L / nx;
  const dx2 = dx * dx;
  const MAX_STEPS = 800000;
  const C_eq_ppm = C_eq * 1e6;
  const convergenceTarget = C_eq_ppm * 1.02;
  const RECALC_INTERVAL = 2000;

  const C = new Float64Array(nx).fill(C_0);
  const C_nueva = new Float64Array(nx);
  const D_local = new Float64Array(nx);

  let Cmax = C_0;
  let dt = dx2 / (3.0 * D_base * Math.exp(alpha * Cmax));
  let dt_over_dx = dt / dx;
  let simTime = 0;
  const tiempos_h: number[] = [];
  const ppm_promedio: number[] = [];
  const targetPoints = 200;
  let nextSaveTime = 0;

  for (let n = 0; n < MAX_STEPS; n++) {
    if (n % RECALC_INTERVAL === 0 && n > 0) {
      Cmax = 0;
      for (let i = 0; i < nx; i++) { if (C[i] > Cmax) Cmax = C[i]; }
      dt = dx2 / (3.0 * D_base * Math.exp(alpha * Cmax));
      dt_over_dx = dt / dx;
    }

    for (let i = 0; i < nx; i++) {
      D_local[i] = D_base * Math.exp(alpha * C[i]);
    }

    C_nueva[0] = C[0];
    C_nueva[nx - 1] = C_eq;
    for (let i = 1; i < nx - 1; i++) {
      const flujo_der = (D_local[i] + D_local[i + 1]) * 0.5 * (C[i + 1] - C[i]) / dx;
      const flujo_izq = (D_local[i] + D_local[i - 1]) * 0.5 * (C[i] - C[i - 1]) / dx;
      C_nueva[i] = C[i] + dt_over_dx * (flujo_der - flujo_izq);
    }
    C_nueva[0] = C_nueva[1];

    C.set(C_nueva);
    simTime += dt;

    if (simTime >= nextSaveTime || n === MAX_STEPS - 1) {
      const t_h = simTime / 3600;
      let sum = 0;
      for (let i = 0; i < nx; i++) sum += C[i];
      const meanPpm = (sum / nx) * 1e6;
      tiempos_h.push(t_h);
      ppm_promedio.push(meanPpm);

      if (tiempos_h.length > 10 && meanPpm <= convergenceTarget) break;

      const estimatedTotal = simTime * (MAX_STEPS / (n + 1));
      nextSaveTime = simTime + estimatedTotal / targetPoints;
    }
  }

  return { tiempos_h, ppm_promedio, c_eq_ppm: C_eq_ppm, gas: gas.name };
}

export function runSimulation(input: SimulationInput): [SimulationResult, SimulationResult] {
  return [simularGas(GAS_PROPANO, input), simularGas(GAS_ISOBUTANO, input)];
}
