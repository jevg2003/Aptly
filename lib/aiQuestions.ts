export interface AIQuestion {
  id: string;
  type: 'open' | 'scale';
  question: string;
  placeholder?: string;
  scaleLabels?: { min: string; max: string };
}

export interface IndustryAssessment {
  category: string;
  questions: AIQuestion[];
}

export const AI_QUESTION_BANK: Record<string, AIQuestion[]> = {
  'Tecnología y Sistemas': [
    {
      id: 'tech_q1',
      type: 'open',
      question:
        'Explica cómo optimizarías el rendimiento de una aplicación móvil o web que experimenta tiempos de carga lentos y bloqueos frecuentes en el hilo de la interfaz de usuario.',
      placeholder:
        'Describe tu estrategia técnica (ej. lazy loading, profiling, virtualización de listas, optimización de renderizado, manejo de memoria, etc.)...',
    },
    {
      id: 'tech_q2',
      type: 'open',
      question:
        'Describe una arquitectura o patrón de diseño de software que hayas implementado recientemente en producción. ¿Por qué lo elegiste y qué ventajas aportó?',
      placeholder:
        'Detalla el problema, el patrón elegido (ej. Clean Architecture, MVVM, MVC, Microservicios) y los resultados obtenidos...',
    },
    {
      id: 'tech_q3',
      type: 'scale',
      question:
        '¿Qué tan familiarizado estás con el diseño de APIs (REST, GraphQL), arquitecturas en la nube (AWS, GCP, Firebase) y pipelines de CI/CD?',
      scaleLabels: { min: 'Básico / Nulo', max: 'Experto / Dominio Total' },
    },
  ],
  'Culinaria y Hostelería (Cocina)': [
    {
      id: 'chef_q1',
      type: 'open',
      question:
        'Describe tu metodología para estructurar el control de costos de alimentos (food cost), control de inventarios y prevención de desperdicios en una cocina profesional de alto flujo.',
      placeholder:
        'Detalla cómo calculas el costo de recetas, manejas el almacenamiento de insumos y entrenas al personal en el uso eficiente de materias primas...',
    },
    {
      id: 'chef_q2',
      type: 'open',
      question:
        '¿Cómo resolverías una situación de crisis donde tu cocina está a máxima capacidad para un servicio importante y dos de tus cocineros clave no asisten a su turno sin previo aviso?',
      placeholder:
        'Explica tu estrategia de liderazgo, reorganización de la línea de preparación, comunicación con el salón y mantenimiento de los estándares de calidad...',
    },
    {
      id: 'chef_q3',
      type: 'scale',
      question:
        '¿Cuál es tu nivel de conocimiento técnico y aplicación de normativas internacionales de higiene y seguridad alimentaria (HACCP, ISO 22000)?',
      scaleLabels: { min: 'Básico / Familiarizado', max: 'Experto / Auditor Interno' },
    },
  ],
  'Leyes y Legal': [
    {
      id: 'legal_q1',
      type: 'open',
      question:
        'Describe tu enfoque para auditar, estructurar y mitigar riesgos legales de responsabilidad contractual en un contrato mercantil de gran escala o una fusión comercial.',
      placeholder:
        'Explica los elementos críticos que revisas (ej. cláusulas de indemnidad, penalidades, resolución de disputas, leyes aplicables, límites de responsabilidad)...',
    },
    {
      id: 'legal_q2',
      type: 'open',
      question:
        'Describe un caso práctico (real o hipotético) donde hayas tenido que formular una estrategia jurídica ante una laguna de la ley o una interpretación desfavorable de la autoridad.',
      placeholder:
        'Explica tu análisis de la jurisprudencia, el uso de la doctrina legal, recursos constitucionales y los argumentos persuasivos presentados...',
    },
    {
      id: 'legal_q3',
      type: 'scale',
      question:
        '¿Cuál es tu nivel de competencia en litigación (oral o escrita), redacción de recursos complejos y negociación/conciliación extrajudicial?',
      scaleLabels: { min: 'Básico', max: 'Experto / Litigante Líder' },
    },
  ],
  'Salud y Cuidado Médico': [
    {
      id: 'health_q1',
      type: 'open',
      question:
        'Describe tu protocolo clínico y de toma de decisiones éticas ante un paciente con un diagnóstico inicial confuso cuya sintomatología se deteriora rápidamente durante tu turno.',
      placeholder:
        'Detalla los pasos de reevaluación diagnóstica, interconsulta, priorización de soporte vital y la justificación clínica de tus decisiones...',
    },
    {
      id: 'health_q2',
      type: 'open',
      question:
        '¿Cómo manejas la comunicación asertiva y el soporte emocional al informar diagnósticos críticos o pronósticos complejos a los familiares de un paciente?',
      placeholder:
        'Describe las técnicas de empatía, lenguaje claro, manejo del duelo inmediato y resolución de dudas que aplicas...',
    },
    {
      id: 'health_q3',
      type: 'scale',
      question:
        '¿Qué tan amplia es tu experiencia práctica en el manejo de soporte vital avanzado (ACLS/BLS), farmacología de urgencias y procedimientos invasivos menores?',
      scaleLabels: { min: 'Teórico / Básico', max: 'Avanzado / Formador Técnico' },
    },
  ],
  'Administración y Finanzas': [
    {
      id: 'admin_q1',
      type: 'open',
      question:
        '¿Cómo diseñarías y auditarías un flujo de caja (cash flow) proyectado a 12 meses para garantizar la liquidez operativa frente a una demora de cobranza imprevista?',
      placeholder:
        'Explica tu análisis de cuentas por cobrar, cuentas por pagar, optimización de gastos operativos y fuentes de financiamiento de corto plazo...',
    },
    {
      id: 'admin_q2',
      type: 'open',
      question:
        'Describe tu experiencia optimizando un proceso administrativo ineficiente en una organización (ej. compras, archivo digital, facturación, conciliaciones). ¿Qué métricas mejoraron?',
      placeholder:
        'Detalla el diagnóstico del problema, las herramientas o softwares implementados y la reducción de tiempos o costos lograda...',
    },
    {
      id: 'admin_q3',
      type: 'scale',
      question:
        '¿Cuál es tu nivel de dominio técnico en el uso de plataformas ERP de gran escala (SAP, Oracle) y modelado avanzado en Excel/hojas de cálculo?',
      scaleLabels: { min: 'Básico', max: 'Avanzado / Desarrollador de Modelos' },
    },
  ],
  'Ventas y Marketing': [
    {
      id: 'sales_q1',
      type: 'open',
      question:
        'Describe la campaña de marketing digital o estrategia de ventas B2B/B2C más exitosa que hayas liderado. ¿Cómo mediste e interpretaste su Retorno de Inversión (ROI)?',
      placeholder:
        'Explica los canales utilizados (SEO, SEM, Redes, Venta Directa), tus métricas clave de rendimiento (CAC, LTV, conversiones) y el impacto final...',
    },
    {
      id: 'sales_q2',
      type: 'open',
      question:
        'Explica cuál es tu método paso a paso para abordar, calificar y convencer a un cliente corporativo de alto valor (High-Ticket) que se muestra escéptico o prefiere a la competencia.',
      placeholder:
        'Detalla tus técnicas de escucha activa, detección de puntos de dolor (pain points), manejo de objeciones duras y tácticas de cierre comercial...',
    },
    {
      id: 'sales_q3',
      type: 'scale',
      question:
        '¿Qué tan experimentado estás en el uso de sistemas CRM avanzados (Salesforce, HubSpot), embudos de conversión automatizados y análisis de datos web?',
      scaleLabels: { min: 'Básico / Usuario', max: 'Experto / Arquitecto de Embudos' },
    },
  ],
  'Educación y Formación': [
    {
      id: 'edu_q1',
      type: 'open',
      question:
        'Explica tu estrategia pedagógica y metodologías de inclusión para mantener la motivación y el orden en un aula virtual o presencial con ritmos de aprendizaje muy diversos.',
      placeholder:
        'Detalla tus métodos de diseño instruccional, evaluación formativa, actividades diferenciadas y el uso de tecnologías educativas activas...',
    },
    {
      id: 'edu_q2',
      type: 'open',
      question:
        'Describe un escenario donde hayas tenido que reestructurar o crear desde cero un currículo o plan de estudios educativo para adaptarlo a nuevas demandas de la industria o alumnos.',
      placeholder:
        'Detalla cómo identificaste las necesidades de formación, cómo seleccionaste los objetivos de aprendizaje y cómo validaste los resultados pedagógicos...',
    },
    {
      id: 'edu_q3',
      type: 'scale',
      question:
        '¿Qué tan competente eres en el uso y configuración de entornos de aprendizaje virtual (LMS como Moodle, Canvas), diseño instruccional y educación por competencias?',
      scaleLabels: { min: 'Básico', max: 'Experto / Diseñador Curricular' },
    },
  ],
  'Construcción, Oficios y Servicios': [
    {
      id: 'trade_q1',
      type: 'open',
      question:
        'Describe las principales medidas preventivas de seguridad ocupacional, control de riesgos y normativas técnicas que implementas antes de iniciar un trabajo de alta complejidad o riesgo físico.',
      placeholder:
        'Explica la planificación, el uso de equipos de protección (EPP), la identificación de puntos de peligro y los protocolos de respuesta a emergencias...',
    },
    {
      id: 'trade_q2',
      type: 'open',
      question:
        'Explica tu enfoque para diagnosticar y solucionar una avería o falla técnica crítica cuando la causa no es evidente y el tiempo de inactividad genera pérdidas financieras.',
      placeholder:
        'Detalla tu proceso lógico de descarte, lectura de planos/manuales, uso de herramientas de medición y la verificación de calidad de la reparación...',
    },
    {
      id: 'trade_q3',
      type: 'scale',
      question:
        '¿Qué tan competente eres interpretando planos técnicos complejos, presupuestando materiales de obra y gestionando cuadrillas de trabajo?',
      scaleLabels: { min: 'Básico', max: 'Experto / Maestro Supervisor' },
    },
  ],
  General: [
    {
      id: 'general_q1',
      type: 'open',
      question:
        'Describe el reto profesional más complejo al que te has enfrentado en tu carrera. ¿Cómo analizaste la situación, qué acciones tomaste y qué impacto obtuviste?',
      placeholder:
        'Describe a detalle el problema, tu plan de acción, cómo coordinaste con otros y el resultado cuantitativo o cualitativo del éxito...',
    },
    {
      id: 'general_q2',
      type: 'open',
      question:
        'Explica tu estrategia personal para gestionar múltiples plazos de entrega competitivos y priorizar tareas bajo alta presión de manera efectiva sin reducir la calidad.',
      placeholder:
        'Detalla tus herramientas de organización, cómo manejas la comunicación con supervisores o clientes ante retrasos y cómo cuidas los detalles...',
    },
    {
      id: 'general_q3',
      type: 'scale',
      question:
        '¿Qué tan desarrollado consideras tu nivel de liderazgo de proyectos, comunicación asertiva multicultural y resolución de conflictos interpersonales en el trabajo?',
      scaleLabels: { min: 'Básico / Colaborador', max: 'Excelente / Líder Directivo' },
    },
  ],
};

export const getQuestionsForProfession = (category: string | undefined): AIQuestion[] => {
  if (!category) return AI_QUESTION_BANK['General'];

  // Normalizar categorías para matching seguro
  const normalizedCategory = Object.keys(AI_QUESTION_BANK).find(
    (key) =>
      key.toLowerCase() === category.toLowerCase() ||
      category.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(category.toLowerCase())
  );

  return normalizedCategory ? AI_QUESTION_BANK[normalizedCategory] : AI_QUESTION_BANK['General'];
};
