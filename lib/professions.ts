export interface Profession {
  name: string;
  category: string;
}

export const PROFESSIONS: Profession[] = [
  // Tecnología y Sistemas
  { name: 'Desarrollador de Software', category: 'Tecnología y Sistemas' },
  { name: 'Frontend Developer', category: 'Tecnología y Sistemas' },
  { name: 'Backend Developer', category: 'Tecnología y Sistemas' },
  { name: 'Fullstack Developer', category: 'Tecnología y Sistemas' },
  { name: 'QA Tester / Ingeniero de Pruebas', category: 'Tecnología y Sistemas' },
  { name: 'Diseñador UX/UI', category: 'Tecnología y Sistemas' },
  { name: 'DevOps Engineer', category: 'Tecnología y Sistemas' },
  { name: 'Administrador de Sistemas', category: 'Tecnología y Sistemas' },
  { name: 'Diseñador Gráfico', category: 'Tecnología y Sistemas' },
  { name: 'Data Scientist / Científico de Datos', category: 'Tecnología y Sistemas' },
  { name: 'Administrador de Base de Datos', category: 'Tecnología y Sistemas' },
  { name: 'Especialista en Ciberseguridad', category: 'Tecnología y Sistemas' },
  { name: 'Scrum Master', category: 'Tecnología y Sistemas' },
  { name: 'Product Manager', category: 'Tecnología y Sistemas' },

  // Culinaria y Hostelería (Cocina)
  { name: 'Chef Ejecutivo / Jefe de Cocina', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Cocinero Principal', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Ayudante de Cocina', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Pastelero / Repostero', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Bartender / Barman', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Barista', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Mesero / Camarero', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Administrador de Restaurante', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Recepcionista de Hotel', category: 'Culinaria y Hostelería (Cocina)' },
  { name: 'Maitre / Jefe de Comedor', category: 'Culinaria y Hostelería (Cocina)' },

  // Leyes y Legal
  { name: 'Abogado Corporativo', category: 'Leyes y Legal' },
  { name: 'Abogado Penalista', category: 'Leyes y Legal' },
  { name: 'Abogado Laboral', category: 'Leyes y Legal' },
  { name: 'Abogado Civil', category: 'Leyes y Legal' },
  { name: 'Asesor Legal / Consultor Jurídico', category: 'Leyes y Legal' },
  { name: 'Paralegal / Asistente Legal', category: 'Leyes y Legal' },
  { name: 'Notario Público', category: 'Leyes y Legal' },
  { name: 'Gestor de Cumplimiento / Compliance', category: 'Leyes y Legal' },

  // Salud y Cuidado Médico
  { name: 'Médico General', category: 'Salud y Cuidado Médico' },
  { name: 'Enfermero/a Clínico/a', category: 'Salud y Cuidado Médico' },
  { name: 'Fisioterapeuta', category: 'Salud y Cuidado Médico' },
  { name: 'Psicólogo/a Clínico/a', category: 'Salud y Cuidado Médico' },
  { name: 'Odontólogo/a', category: 'Salud y Cuidado Médico' },
  { name: 'Nutricionista / Dietista', category: 'Salud y Cuidado Médico' },
  { name: 'Terapeuta Ocupacional', category: 'Salud y Cuidado Médico' },
  { name: 'Farmacéutico/a', category: 'Salud y Cuidado Médico' },
  { name: 'Paramédico / Socorrista', category: 'Salud y Cuidado Médico' },

  // Administración y Finanzas
  { name: 'Administrador de Empresas', category: 'Administración y Finanzas' },
  { name: 'Contador Público', category: 'Administración y Finanzas' },
  { name: 'Auxiliar Contable', category: 'Administración y Finanzas' },
  { name: 'Asistente Administrativo', category: 'Administración y Finanzas' },
  { name: 'Recepcionista', category: 'Administración y Finanzas' },
  { name: 'Especialista en Recursos Humanos (RRHH)', category: 'Administración y Finanzas' },
  { name: 'Analista Financiero', category: 'Administración y Finanzas' },
  { name: 'Asistente de Gerencia', category: 'Administración y Finanzas' },

  // Ventas y Marketing
  { name: 'Ejecutivo de Cuentas / Comercial', category: 'Ventas y Marketing' },
  { name: 'Especialista en Marketing Digital', category: 'Ventas y Marketing' },
  { name: 'Social Media Manager', category: 'Ventas y Marketing' },
  { name: 'Especialista SEO / SEM', category: 'Ventas y Marketing' },
  { name: 'Vendedor / Asesor Comercial', category: 'Ventas y Marketing' },
  { name: 'Cajero/a', category: 'Ventas y Marketing' },
  { name: 'Promotor de Ventas', category: 'Ventas y Marketing' },

  // Educación y Formación
  { name: 'Profesor/a de Primaria', category: 'Educación y Formación' },
  { name: 'Profesor/a de Secundaria', category: 'Educación y Formación' },
  { name: 'Profesor/a Universitario/a', category: 'Educación y Formación' },
  { name: 'Tutor / Instructor Académico', category: 'Educación y Formación' },
  { name: 'Psicopedagogo/a', category: 'Educación y Formación' },
  { name: 'Entrenador Personal / Coach Deportivo', category: 'Educación y Formación' },

  // Construcción, Oficios y Servicios
  { name: 'Electricista', category: 'Construcción, Oficios y Servicios' },
  { name: 'Plomero / Fontanero', category: 'Construcción, Oficios y Servicios' },
  { name: 'Carpintero/a', category: 'Construcción, Oficios y Servicios' },
  { name: 'Albañil / Oficial de Obra', category: 'Construcción, Oficios y Servicios' },
  { name: 'Pintor de Interiores', category: 'Construcción, Oficios y Servicios' },
  { name: 'Soldador Industrial', category: 'Construcción, Oficios y Servicios' },
  { name: 'Operador de Maquinaria Pesada', category: 'Construcción, Oficios y Servicios' },
  { name: 'Arquitecto/a', category: 'Construcción, Oficios y Servicios' },
  { name: 'Ingeniero/a Civil', category: 'Construcción, Oficios y Servicios' },
  { name: 'Conductor / Chofer Profesional', category: 'Construcción, Oficios y Servicios' },
  { name: 'Personal de Limpieza', category: 'Construcción, Oficios y Servicios' },
  { name: 'Guardia de Seguridad', category: 'Construcción, Oficios y Servicios' },
];
