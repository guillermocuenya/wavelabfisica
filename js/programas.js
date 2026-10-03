/* ===== Programas, ejes y contenidos =====
   Para cambiar el nombre o el curso de un programa, editá "name" y "title". */
const PROGRAMS = [
  {
    id: 'a', name: 'Programa A', title: 'Energía, Sol y Termodinámica', color: '#2563eb',
    desc: 'Fuentes de energía y sus transformaciones, energía solar y fenómenos termodinámicos, con foco en la sustentabilidad.',
    ejes: [
      {
        id: '1', title: 'Fuentes de energía y sus transformaciones', sub: 'Conservación, uso y sustentabilidad',
        concepts: [
          'La <b>energía</b> es una magnitud escalar que se mide en joules (J). Se conserva, se transforma, se transfiere y se degrada.',
          '<b>Energía potencial gravitatoria</b>: Ep = m·g·h. Es una <b>función de estado</b>: depende de la posición, no del camino recorrido.',
          '<b>Energía cinética</b>: Ec = ½·m·v². <b>Energía mecánica</b>: Em = Ep + Ec.',
          'Las <b>fuerzas conservativas</b> (peso, fuerza elástica) conservan la energía mecánica; las <b>no conservativas</b> (rozamiento) la transforman en energía térmica.',
          'En toda transformación real parte de la energía se <b>degrada</b> en calor disperso: los fenómenos reales son <b>irreversibles</b>.',
          '<b>Potencia</b>: P = E / t, en watts (W). Se aplica a fenómenos mecánicos, térmicos y electromagnéticos.',
          '<b>Fuentes primarias</b> (están en la naturaleza) y <b>secundarias</b> (se obtienen transformando las primarias). <b>Renovables</b> y <b>no renovables</b>.',
          '<b>Rendimiento</b>: η = E útil / E consumida. La eficiencia energética y la medición del consumo son claves para la sustentabilidad.'
        ],
        sims: ['montana', 'potencia', 'sankey', 'matriz', 'consumo'],
        quiz: ['energia', 'potencia', 'rendimiento', 'fuentes'],
        debate: ['¿Por qué decimos que la energía se "degrada" si siempre se conserva?', '¿Qué fuentes de energía se usan cerca de Río Cuarto? ¿Cuáles son renovables?', 'Analizá el ciclo de vida de un panel solar o de un aerogenerador: fabricación, uso y descarte.', '¿Qué medidas de eficiencia energética se podrían aplicar en la escuela? Proponé un plan y estimá el ahorro.']
      },
      {
        id: '2', title: 'Energía solar', sub: 'Del Sol a nuestras casas',
        concepts: [
          '<b>Leyes de Kepler</b>: órbitas elípticas con el Sol en un foco; áreas iguales en tiempos iguales; T² ∝ a³.',
          'Las <b>estaciones</b> se deben a la inclinación del eje terrestre (23,44°), no a la distancia al Sol.',
          'El Sol genera energía por <b>fusión nuclear</b> (hidrógeno → helio) en su núcleo. Llega a la Tierra como radiación electromagnética: unos 1361 W/m² fuera de la atmósfera.',
          'La radiación que absorbe la superficie depende del ángulo de los rayos y de las horas de luz, e influye en el clima.',
          '<b>Aprovechamiento térmico</b>: colectores y termotanques solares con intercambiadores de calor calientan agua y ambientes.',
          '<b>Aprovechamiento fotovoltaico</b>: los paneles convierten la luz en electricidad (rendimiento ≈ 18–22 %).',
          '<b>Frío solar</b>: máquinas de absorción usan calor solar para producir frío en refrigeración y climatización.',
          '<b>Efecto invernadero</b>: la atmósfera absorbe parte del infrarrojo que emite la superficie y lo reemite. El aumento de CO₂ por actividades humanas provoca el calentamiento global.'
        ],
        sims: ['kepler', 'sol', 'solarcasa', 'invernadero'],
        quiz: ['kepler', 'estaciones', 'solar', 'invernadero'],
        debate: ['Si en enero la Tierra está más cerca del Sol, ¿por qué en el hemisferio norte es invierno?', '¿Conviene instalar un termotanque solar en tu casa? Calculá cuánto gas se ahorraría por año.', '¿Qué estrategias de mitigación del calentamiento global podrían aplicarse en Córdoba?', 'Investigá: ¿cómo funciona un sistema de "frío solar"?']
      },
      {
        id: '3', title: 'Fenómenos termodinámicos y sustentabilidad', sub: 'Calor, trabajo y energía interna',
        concepts: [
          '<b>Temperatura</b> no es lo mismo que <b>calor</b>: el calor es energía en tránsito por una diferencia de temperatura. Fluye hasta alcanzar el <b>equilibrio térmico</b>.',
          '<b>Transferencia de calor</b>: conducción, convección y radiación. El <b>aislamiento térmico</b> reduce las pérdidas y optimiza el uso de la energía.',
          'Sistemas <b>abiertos</b> (intercambian materia y energía), <b>cerrados</b> (solo energía) y <b>aislados</b>.',
          '<b>Calor sensible</b>: Q = m·c·ΔT. <b>Calor latente</b>: Q = m·L, en los cambios de estado a temperatura constante.',
          '<b>Primera ley de la termodinámica</b>: ΔU = Q − W (W: trabajo realizado por el sistema).',
          '<b>Máquinas térmicas</b>: transforman calor en trabajo y siempre ceden calor a una fuente fría. η máx (Carnot) = 1 − Tf/Tc.',
          '<b>Almacenamiento térmico</b>: agua, rocas o sales fundidas guardan calor para usarlo después (por ejemplo, en centrales solares térmicas).'
        ],
        sims: ['calorimetria', 'cambio', 'maquina', 'escalas'],
        quiz: ['calor', 'cambio', 'termo', 'escalas'],
        debate: ['¿Por qué las centrales térmicas y nucleares necesitan un río o un lago cerca?', '¿Cómo aislarías térmicamente un aula para gastar menos en calefacción?', '¿Por qué el agua es tan buena para almacenar energía térmica?', 'Investigá cómo funciona la central nuclear Embalse como máquina térmica.']
      }
    ]
  },
  {
    id: 'b', name: 'Programa B', title: 'Fenómenos físicos', color: '#e8803a',
    desc: 'Energía, fenómenos térmicos, electromagnéticos y mecánicos, y una introducción a la estructura y la dinámica del universo.',
    ejes: [
      {
        id: '1', title: 'La energía en los fenómenos físicos', sub: 'Producción, transporte y consumo',
        concepts: [
          '<b>Fuentes de energía en la historia</b>: fuerza humana y animal, leña, carbón y máquina de vapor, petróleo, electricidad, energía nuclear y renovables.',
          '<b>Generación, transporte y distribución</b>: la electricidad se transporta en alta tensión para reducir las pérdidas por efecto Joule en los cables.',
          'En Argentina las centrales están conectadas por el <b>SADI</b> (Sistema Argentino de Interconexión).',
          '<b>Centrales</b>: térmicas, hidroeléctricas, nucleares, eólicas y solares. Cada una transforma una fuente primaria en electricidad.',
          'El consumo varía a lo largo del <b>día</b> y de las <b>estaciones</b>: picos en verano a la tarde (aire acondicionado) y en invierno a la noche.',
          'Requerimientos energéticos domésticos, industriales y globales: <b>electricidad, gas y otros combustibles</b>.',
          'La energía eléctrica se factura en <b>kWh</b>: E = P · t. Medir el consumo es el primer paso para ahorrar.'
        ],
        sims: ['matriz', 'sankey', 'consumo'],
        quiz: ['fuentes', 'rendimiento', 'consumo'],
        debate: ['¿Cómo cambió la vida de las personas con cada nueva fuente de energía?', 'Medí el consumo energético mensual de tu casa con el medidor. ¿Qué artefactos consumen más?', '¿Por qué la demanda de energía es mayor en verano y en invierno?', '¿Cuál es la problemática actual de la producción y el consumo de energía? ¿Qué alternativas hay?']
      },
      {
        id: '2', title: 'Fenómenos térmicos', sub: 'Temperatura, calor y primera ley',
        concepts: [
          '<b>Temperatura</b>: medida de la agitación de las partículas. <b>Escalas termométricas</b>: Celsius, Fahrenheit y Kelvin.',
          '<b>Dilatación</b>: al calentarse, los cuerpos aumentan de tamaño. ΔL = α·L₀·ΔT.',
          '<b>Calor específico</b>: energía necesaria para elevar 1 °C la temperatura de 1 kg. Q = m·c·ΔT.',
          '<b>Equilibrio térmico</b>: el calor pasa del cuerpo más caliente al más frío hasta igualar temperaturas.',
          '<b>Transferencia de energía</b>: conducción, convección y radiación.',
          '<b>Primera ley</b>: ΔU = Q − W. La energía interna cambia por calor y por trabajo.',
          '<b>Degradación de la energía utilizable</b>: en cada transformación, parte de la energía termina como calor de baja temperatura que ya no puede aprovecharse.'
        ],
        sims: ['escalas', 'calorimetria', 'cambio', 'maquina'],
        quiz: ['escalas', 'dilatacion', 'calor', 'cambio', 'termo'],
        debate: ['¿Por qué un metal se siente más frío que una madera a la misma temperatura?', '¿Por qué los puentes y las vías tienen juntas de dilatación?', '¿Qué significa que la energía se "degrada"?', 'Diseñá un esquema que explique cómo funciona un termo.']
      },
      {
        id: '3', title: 'Fenómenos electromagnéticos', sub: 'Electrostática, circuitos y magnetismo',
        concepts: [
          '<b>Electrostática</b>: cargas positivas y negativas; las iguales se repelen y las distintas se atraen. <b>Ley de Coulomb</b>: F = k·q₁·q₂ / r².',
          '<b>Campo eléctrico</b>, <b>energía potencial eléctrica</b> y <b>capacidad eléctrica</b> (capacitores que almacenan carga).',
          '<b>Conductores</b> (metales), aislantes, <b>semiconductores</b> (silicio: base de chips, LED y paneles solares) y <b>superconductores</b> (resistencia nula a muy baja temperatura).',
          '<b>Corriente eléctrica</b>: I = q / t, en amperes. <b>Ley de Ohm</b>: V = I·R. La <b>fuerza electromotriz</b> de una pila impulsa la corriente.',
          '<b>Potencia eléctrica</b>: P = V·I. <b>Efecto Joule</b>: la corriente calienta los conductores.',
          '<b>Amperímetro</b> (en serie) y <b>voltímetro</b> (en paralelo).',
          '<b>Magnetismo</b>: toda corriente genera un campo magnético. <b>Electroimán</b>: bobina con núcleo de hierro.',
          '<b>Instalación domiciliaria</b>: 220 V, 50 Hz, artefactos en paralelo, interruptor termomagnético, disyuntor diferencial y puesta a tierra.'
        ],
        sims: ['coulomb', 'circuito', 'electroiman'],
        quiz: ['electro', 'circuitos', 'magnet'],
        debate: ['¿Por qué saltan las térmicas cuando se enchufan muchos artefactos a la vez?', '¿Para qué sirve el disyuntor diferencial? ¿Y la puesta a tierra?', '¿Qué aparatos de tu casa tienen electroimanes o motores?', '¿Por qué los superconductores podrían revolucionar el transporte de energía?']
      },
      {
        id: '4', title: 'Fenómenos mecánicos', sub: 'Energía mecánica y fluidos',
        concepts: [
          '<b>Energía mecánica</b> = potencial + cinética. <b>Trabajo</b>: W = F·d. El trabajo es energía transferida por una fuerza.',
          '<b>Presión</b>: p = F / A. <b>Densidad</b>: ρ = m / V. <b>Peso específico</b>: Pe = ρ·g.',
          '<b>Teorema fundamental de la hidrostática</b>: p = p₀ + ρ·g·h.',
          '<b>Presión atmosférica</b>: al nivel del mar, 1 atm = 101 325 Pa = 760 mmHg (experimento de Torricelli).',
          '<b>Principio de Pascal</b>: la presión se transmite a todo el fluido. <b>Prensa hidráulica</b>: F₂ / A₂ = F₁ / A₁.',
          '<b>Principio de Arquímedes</b>: el empuje es igual al peso del fluido desalojado. <b>Flotación</b>.',
          '<b>Fluidos en movimiento</b>: caudal Q = A·v; <b>continuidad</b> A₁v₁ = A₂v₂; <b>teorema de Bernoulli</b>.',
          '<b>Viscosidad</b>, <b>tensión superficial</b> y <b>capilaridad</b>.'
        ],
        sims: ['montana', 'potencia', 'hidrostatica', 'arquimedes', 'bernoulli'],
        quiz: ['energia', 'potencia', 'hidro', 'arquimedes', 'bernoulli'],
        debate: ['¿Por qué un barco de acero flota?', '¿Cómo funcionan los frenos hidráulicos de un auto?', '¿Por qué al tapar la manguera el agua sale más rápido?', '¿Por qué los insectos pueden caminar sobre el agua?']
      },
      {
        id: '5', title: 'El universo, su estructura y su dinámica', sub: 'Fuerzas fundamentales y teorías físicas',
        concepts: [
          'Cuatro <b>interacciones fundamentales</b>: gravitatoria, electromagnética, nuclear fuerte y nuclear débil.',
          'La gravitatoria es la más débil, pero domina a gran escala porque siempre atrae y tiene alcance infinito.',
          '<b>Postulados de la relatividad especial</b>: las leyes de la física son iguales para todos los observadores inerciales y la velocidad de la luz es la misma para todos.',
          'Consecuencias: <b>dilatación del tiempo</b>, <b>contracción de la longitud</b> y E = m·c².',
          '<b>Campos de aplicación</b>: Newton para lo cotidiano, Einstein para velocidades cercanas a la luz y campos gravitatorios intensos, la <b>física cuántica</b> para átomos y partículas.'
        ],
        sims: ['fuerzas', 'relatividad', 'kepler'],
        quiz: ['fuerzas', 'relatividad', 'kepler'],
        debate: ['¿Cuál de las cuatro fuerzas actúa cuando empujás una puerta?', 'Investigá la paradoja de los gemelos y explicala con un esquema.', '¿Qué tecnologías actuales usan la física cuántica? (pista: celulares, LED, láser)', 'Mirá un documental sobre el universo y anotá tres preguntas que te surjan.']
      }
    ]
  }
];
const progById = id => PROGRAMS.find(p => p.id === id);
