# 710.math — Suite Unificada de Simulación Termoquímica

710.math es un ecosistema digital de alta precisión diseñado para la industria del procesamiento de cannabis. Esta suite consolida tres herramientas computacionales avanzadas, cada una enfocada en un pilar crítico del post-procesamiento de extractos: la cinética de descarboxilación, la dinámica de purga de solventes y la termodinámica de mezclas de hidrocarburos.

**Demo online:** [710math.triptalabs.com.co](https://710math.triptalabs.com.co)

---

El objetivo primordial de este proyecto es dotar a los profesionales de la industria de un entorno de simulación riguroso, eliminando la incertidumbre en procesos de laboratorio mediante modelos matemáticos validados.

---

## Módulos de Simulación

### DecarbTime: Cinética de Reacción y Degradación
Este módulo modela la transformación de los ácidos cannabinoides en sus formas neutras mediante la aplicación de la cinética de primer orden y la ecuación de Arrhenius. El simulador permite predecir con exactitud el tiempo necesario para alcanzar la máxima concentración de THC o CBD antes de que comience el proceso de degradación hacia compuestos como el CBN o metabolitos secundarios.

La herramienta considera variables críticas como la energía de activación, el factor pre-exponencial, la temperatura del sistema y la influencia de la presión parcial de oxígeno en el entorno de reacción.

### DabPurge: Dinámica de Transporte de Masa
DabPurge es un simulador de purga de solventes residuales que utiliza la segunda ley de Fick para modelar la difusión de propano e isobutano a través de matrices de extracto de espesor variable. La precisión del modelo se incrementa mediante el uso de la teoría de Flory-Huggins, permitiendo calcular la actividad del solvente y su concentración de equilibrio en función de la temperatura y el nivel de vacío aplicado.

El sistema identifica automáticamente los hitos de seguridad, como el tiempo requerido para descender por debajo de las 500 partes por millón (ppm), garantizando el cumplimiento de los estándares de pureza.

### HydrocarbonMixer: Termodinámica de Mezclas Binarias
Esta herramienta permite el modelado de mezclas de solventes de hidrocarburos ligeros. Utiliza las ecuaciones de Antoine para determinar las presiones de vapor de componentes puros y la regla de mezcla de Kay para estimar las constantes críticas de la composición binaria resultante. Para el cálculo de densidades líquidas, se integra la ecuación de Rackett, proporcionando datos precisos para procesos de dosificación y transferencia de masa.

Incluye una visualización interactiva del diagrama de fases P-T (Presión-Temperatura) y zonas de seguridad operativa configurables por el usuario.

---

## Arquitectura Técnica y Diseño

El desarrollo de 710.math se fundamenta en tres pilares arquitectónicos:

1.  **Orquestación Single Page Application (SPA):** La plataforma utiliza un sistema de montaje y desmontaje dinámico de módulos, garantizando una navegación fluida y una gestión eficiente de la memoria y el estado global.
2.  **Computación en Segundo Plano:** Dada la intensidad matemática de las simulaciones (especialmente en procesos iterativos y cinéticos), se emplean Web Workers. Esto permite que el hilo principal de la interfaz permanezca libre para la interacción del usuario sin latencia.
3.  **Visualización de Datos de Alta Definición:** La integración con Chart.js se ha personalizado mediante plugins propietarios para superponer zonas de seguridad, marcadores de eventos cinéticos y curvas de referencia termodinámica directamente sobre el lienzo del gráfico.

---

## Configuración y Despliegue

El proyecto ha sido construido utilizando Vite y TypeScript para asegurar un entorno de desarrollo robusto y una compilación optimizada para producción.

### Requisitos Previos
Es necesario contar con Node.js y un gestor de paquetes moderno, preferiblemente pnpm.

### Instrucciones de Instalación
1. Clonar el repositorio en el entorno local.
2. Ejecutar el comando para la instalación de dependencias:
   ```bash
   pnpm install
   ```
3. Iniciar el entorno de desarrollo local con hot-reload:
   ```bash
   pnpm dev
   ```
4. Para la generación del paquete de distribución optimizado:
   ```bash
   pnpm build
   ```

---

710.math es un proyecto desarrollado por **Tripta Labs Co.**
