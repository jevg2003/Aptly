export const COLORS = {
  background: '#050505',
  card: '#121214',
  candidate: '#00A3FF',
  company: '#FF005C',
  text: '#FFFFFF',
  textSecondary: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.05)',
};

export const SECTORS = [
  'Tecnología',
  'Salud',
  'Finanzas',
  'Construcción',
  'Comercio',
  'Manufactura',
  'Servicios',
  'Marketing',
  'Educación',
  'Otro',
];

export const TAG_CATEGORIES = {
  Modalidad: ['Remoto', 'Híbrido', 'Presencial', 'Horario Flexible'],
  Horarios: ['Tiempo Completo', 'Medio Tiempo', 'Fines de Semana'],
  Beneficios: ['Seguro Médico', 'Bonos', 'Crecimiento', 'Snacks', 'Gimnasio'],
  Valores: ['Innovación', 'Diversidad', 'Sostenibilidad', 'Trabajo en Equipo'],
  Tamaño: ['Startup', 'Pequeña (1-50)', 'Mediana (51-200)', 'Corporativo (200+)'],
};

export const MONTH_MAP = {
  Enero: '01',
  Febrero: '02',
  Marzo: '03',
  Abril: '04',
  Mayo: '05',
  Junio: '06',
  Julio: '07',
  Agosto: '08',
  Septiembre: '09',
  Octubre: '10',
  Noviembre: '11',
  Diciembre: '12',
};

export const DAYS_OPTIONS = Array.from({ length: 31 }, (_, i) =>
  (i + 1).toString().padStart(2, '0')
);
export const MONTHS_OPTIONS = Object.keys(MONTH_MAP);

const currentYearNum = new Date().getFullYear();
export const CANDIDATE_YEARS_OPTIONS = Array.from({ length: currentYearNum - 1920 + 1 }, (_, i) =>
  (currentYearNum - i).toString()
);

export const COMPANY_YEARS_OPTIONS = Array.from({ length: currentYearNum - 1800 + 1 }, (_, i) =>
  (currentYearNum - i).toString()
);
