# WaveLab Física

Laboratorio virtual de Física para el secundario: 21 simuladores interactivos, conceptos clave y desafíos organizados según los ejes de dos programas.
Es una web estática (HTML + CSS + JavaScript, sin dependencias ni servidor). Se abre con doble clic en `index.html` o se publica gratis en GitHub Pages.

## Programas y ejes

**Programa A · Energía, Sol y Termodinámica**
1. Fuentes de energía y sus transformaciones: conservación, uso y sustentabilidad
2. Energía solar
3. Fenómenos termodinámicos y sustentabilidad

**Programa B · Fenómenos físicos**
1. La energía en los fenómenos físicos
2. Fenómenos térmicos
3. Fenómenos electromagnéticos
4. Fenómenos mecánicos
5. El universo, su estructura y su dinámica

Para cambiar el nombre de los programas (por ejemplo "5.º año"), editá `name` y `title` en `js/programas.js`.

## Laboratorios

| Tema | Laboratorio |
|------|-------------|
| Energía | Conservación de la energía mecánica (pista de skate / montaña rusa, con rozamiento y otras gravedades) · Trabajo y potencia (grúa y "tu potencia" en la escalera) · Transformaciones y rendimiento (diagrama de flujo de energía) · Fuentes y matriz energética (juego de clasificación, matrices del mundo / Argentina / generación eléctrica, centrales de Córdoba) · Consumo en casa (artefactos, lectura del medidor, curva de demanda) |
| Solar | Leyes de Kepler · Movimiento aparente del Sol y estaciones (por latitud y fecha) · Energía solar en casa (termotanque y paneles, mes a mes) · Efecto invernadero |
| Térmica | Equilibrio térmico y calor específico · Cambios de estado (calor sensible y latente) · Primera ley y máquinas térmicas (Carnot) · Escalas termométricas y dilatación |
| Electromagnetismo | Ley de Coulomb y campo eléctrico · Circuitos serie/paralelo con amperímetro y voltímetro + instalación domiciliaria (térmica) · Electroimán |
| Fluidos | Hidrostática, Pascal y presión atmosférica · Flotación y Arquímedes · Continuidad, Bernoulli y capilaridad |
| Universo | Fuerzas fundamentales y ámbitos de Newton / Einstein / cuántica · Relatividad especial |

Cada laboratorio incluye controles, lecturas en vivo, fórmulas y preguntas "Para pensar".
Cada eje tiene conceptos clave, consignas para investigar y debatir, y un **desafío** de 8 preguntas (conceptuales y problemas con números al azar, con explicación).

## Para el aula
- Botón ⛶: modo proyector (letra más grande y pantalla completa).
- Botón ◐: tema claro / oscuro / automático.
- Cada laboratorio tiene su propio link (por ejemplo `#/lab/circuito/casa`) para compartir con los alumnos.

## Datos
- Matriz primaria Argentina 2023: Argendata (Fundar).
- Matriz primaria mundial 2023: Energy Institute, Statistical Review of World Energy 2024.
- Generación eléctrica Argentina 2025: CAMMESA, Informe Anual 2025.
- Radiación solar y temperatura del agua para Córdoba: valores aproximados con fines didácticos.

## Estructura
```
index.html
css/styles.css
js/core.js            utilidades: canvas, controles, gráficos
js/sims-*.js          simuladores por área
js/programas.js       programas, ejes, conceptos y consignas
js/quiz.js            banco de preguntas
js/app.js             navegación
```

---
WaveBit · 2026
