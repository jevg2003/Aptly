-- ==========================================
-- APTLY HIGH-QUALITY TEST DATA SEEDING SCRIPT
-- ==========================================
-- This script updates the placeholder candidate and company accounts
-- with rich, realistic, professional profiles, realistic work histories,
-- active applications, open chat rooms, and realistic conversation histories.
-- It also sets all passwords to 'Password123' for ease of testing.

-- 1. UPDATE PASSWORDS & BASIC AUTH METADATA IN auth.users
UPDATE auth.users
SET 
  encrypted_password = crypt('Password123', gen_salt('bf', 10)),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb
WHERE email LIKE '%@test.com';

-- 2. UPDATE CANDIDATES AUTH METADATA & PROFILE DATA
-- Candidate 1: Sofía Martínez (React Native Developer)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'candidate',
  'full_name', 'Sofía Martínez',
  'profession', 'Desarrollador React Native',
  'location', 'Bogotá, Colombia',
  'phone', '+57 312 456 7890',
  'candidate_tags', 'React Native, Expo, TypeScript, Redux, Node.js',
  'industry_interests', 'Tecnología, Desarrollo de Software, Mobile',
  'experience_level', 'Semi-Senior',
  'portfolio_url', 'https://sofiamartinez.dev',
  'linkedin_url', 'https://linkedin.com/in/sofiamartinez-dev',
  'birth_date', '1998-04-12'
)
WHERE id = '002dbcb0-c8d0-4b84-bdf7-5c22e420e031';

UPDATE public.profiles
SET 
  full_name = 'Sofía Martínez',
  role = 'candidate',
  professional_title = 'Desarrollador React Native',
  location = 'Bogotá, Colombia',
  phone = '+57 312 456 7890',
  bio = 'Desarrollador mobile apasionado por crear interfaces hermosas y fluidas usando React Native y Expo. Más de 3 años de experiencia liderando integraciones con Supabase y arquitecturas limpias.',
  candidate_tags = 'React Native, Expo, TypeScript, Redux, Node.js',
  industry_interests = 'Tecnología, Desarrollo de Software, Mobile',
  experience_level = 'Semi-Senior',
  portfolio_url = 'https://sofiamartinez.dev',
  linkedin_url = 'https://linkedin.com/in/sofiamartinez-dev',
  birth_date = '1998-04-12',
  avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
WHERE id = '002dbcb0-c8d0-4b84-bdf7-5c22e420e031';


-- Candidate 2: Carlos Gómez (B2B Sales Executive)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'candidate',
  'full_name', 'Carlos Gómez',
  'profession', 'Ejecutivo de Ventas B2B',
  'location', 'Medellín, Colombia',
  'phone', '+57 300 765 4321',
  'candidate_tags', 'Ventas B2B, Negociación, CRM, Prospección, Estrategia Comercial',
  'industry_interests', 'Tecnología, Ventas, Finanzas',
  'experience_level', 'Senior',
  'portfolio_url', '',
  'linkedin_url', 'https://linkedin.com/in/carlosgomez-sales',
  'birth_date', '1990-11-23'
)
WHERE id = '38327350-da9b-4ff5-af6f-25baf6037851';

UPDATE public.profiles
SET 
  full_name = 'Carlos Gómez',
  role = 'candidate',
  professional_title = 'Ejecutivo de Ventas B2B',
  location = 'Medellín, Colombia',
  phone = '+57 300 765 4321',
  bio = 'Profesional en ventas y desarrollo de negocios con enfoque en soluciones tecnológicas B2B. Experto en prospección, cierre de contratos de alto valor y gestión de cuentas corporativas.',
  candidate_tags = 'Ventas B2B, Negociación, CRM, Prospección, Estrategia Comercial',
  industry_interests = 'Tecnología, Ventas, Finanzas',
  experience_level = 'Senior',
  portfolio_url = '',
  linkedin_url = 'https://linkedin.com/in/carlosgomez-sales',
  birth_date = '1990-11-23',
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
WHERE id = '38327350-da9b-4ff5-af6f-25baf6037851';


-- Candidate 3: Elena Ruiz (Store Assistant)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'candidate',
  'full_name', 'Elena Ruiz',
  'profession', 'Auxiliar de Tienda',
  'location', 'Cali, Colombia',
  'phone', '+57 315 987 6543',
  'candidate_tags', 'Atención al cliente, Inventarios, Caja, Trabajo en equipo, Ventas al detalle',
  'industry_interests', 'Retail, Comercio, Tiendas',
  'experience_level', 'Junior',
  'portfolio_url', '',
  'linkedin_url', 'https://linkedin.com/in/elenaruiz-retail',
  'birth_date', '2001-08-19'
)
WHERE id = '95e9d514-99c9-43cb-a8db-eae2c178eb78';

UPDATE public.profiles
SET 
  full_name = 'Elena Ruiz',
  role = 'candidate',
  professional_title = 'Auxiliar de Tienda',
  location = 'Cali, Colombia',
  phone = '+57 315 987 6543',
  bio = 'Con más de 2 años de experiencia en atención al cliente, control de inventarios y caja. Responsable, proactiva y orientada a brindar una excelente experiencia de compra.',
  candidate_tags = 'Atención al cliente, Inventarios, Caja, Trabajo en equipo, Ventas al detalle',
  industry_interests = 'Retail, Comercio, Tiendas',
  experience_level = 'Junior',
  portfolio_url = '',
  linkedin_url = 'https://linkedin.com/in/elenaruiz-retail',
  birth_date = '2001-08-19',
  avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
WHERE id = '95e9d514-99c9-43cb-a8db-eae2c178eb78';


-- Candidate 4: Mateo Herrera (Senior Data Analyst)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'candidate',
  'full_name', 'Mateo Herrera',
  'profession', 'Analista de Datos SR',
  'location', 'Bogotá, Colombia',
  'phone', '+57 311 222 3344',
  'candidate_tags', 'Python, SQL, Tableau, Pandas, Machine Learning, PowerBI',
  'industry_interests', 'Tecnología, Finanzas, Consultoría',
  'experience_level', 'Senior',
  'portfolio_url', 'https://mateoherrera.github.io',
  'linkedin_url', 'https://linkedin.com/in/mateoherrera-data',
  'birth_date', '1993-02-28'
)
WHERE id = 'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec';

UPDATE public.profiles
SET 
  full_name = 'Mateo Herrera',
  role = 'candidate',
  professional_title = 'Analista de Datos SR',
  location = 'Bogotá, Colombia',
  phone = '+57 311 222 3344',
  bio = 'Científico de datos especializado en análisis estadístico, machine learning y visualización de datos complejos. Dominio avanzado de Python, SQL, Tableau y PowerBI.',
  candidate_tags = 'Python, SQL, Tableau, Pandas, Machine Learning, PowerBI',
  industry_interests = 'Tecnología, Finanzas, Consultoría',
  experience_level = 'Senior',
  portfolio_url = 'https://mateoherrera.github.io',
  linkedin_url = 'https://linkedin.com/in/mateoherrera-data',
  birth_date = '1993-02-28',
  avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
WHERE id = 'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec';


-- Candidate 5: Valentina Restrepo (UI/UX Designer)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'candidate',
  'full_name', 'Valentina Restrepo',
  'profession', 'Diseñador UI/UX',
  'location', 'Medellín, Colombia',
  'phone', '+57 318 555 4433',
  'candidate_tags', 'Figma, UI/UX, Prototipado, Design Systems, UX Research',
  'industry_interests', 'Tecnología, Creatividad, Diseño',
  'experience_level', 'Semi-Senior',
  'portfolio_url', 'https://behance.net/valentinarestrepo',
  'linkedin_url', 'https://linkedin.com/in/valentinarestrepo-uiux',
  'birth_date', '1996-07-07'
)
WHERE id = '2901a311-4e60-4b54-a09b-aadedd129472';

UPDATE public.profiles
SET 
  full_name = 'Valentina Restrepo',
  role = 'candidate',
  professional_title = 'Diseñador UI/UX',
  location = 'Medellín, Colombia',
  phone = '+57 318 555 4433',
  bio = 'Diseñadora visual apasionada por la investigación de usuarios y la creación de prototipos de alta fidelidad. Especializada en sistemas de diseño complejos y micro-interacciones.',
  candidate_tags = 'Figma, UI/UX, Prototipado, Design Systems, UX Research',
  industry_interests = 'Tecnología, Creatividad, Diseño',
  experience_level = 'Semi-Senior',
  portfolio_url = 'https://behance.net/valentinarestrepo',
  linkedin_url = 'https://linkedin.com/in/valentinarestrepo-uiux',
  birth_date = '1996-07-07',
  avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
WHERE id = '2901a311-4e60-4b54-a09b-aadedd129472';


-- Candidate 6: Juan Sebastian Diaz (DevOps Engineer)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'candidate',
  'full_name', 'Juan Sebastian Diaz',
  'profession', 'DevOps Engineer',
  'location', 'Bogotá, Colombia',
  'phone', '+57 320 888 9900',
  'candidate_tags', 'AWS, Docker, Kubernetes, CI/CD, Terraform, Linux',
  'industry_interests', 'Tecnología, Telecomunicaciones, Infraestructura',
  'experience_level', 'Senior',
  'portfolio_url', 'https://jsdiaz.dev',
  'linkedin_url', 'https://linkedin.com/in/jsdiaz-devops',
  'birth_date', '1992-09-15'
)
WHERE id = '7b676155-1193-4c1e-8982-4562910bea66';

UPDATE public.profiles
SET 
  full_name = 'Juan Sebastian Diaz',
  role = 'candidate',
  professional_title = 'DevOps Engineer',
  location = 'Bogotá, Colombia',
  phone = '+57 320 888 9900',
  bio = 'Especialista en automatización, CI/CD e infraestructura en la nube (AWS/GCP). Apasionado por la cultura DevOps, la escalabilidad y la infraestructura como código (Terraform).',
  candidate_tags = 'AWS, Docker, Kubernetes, CI/CD, Terraform, Linux',
  industry_interests = 'Tecnología, Telecomunicaciones, Infraestructura',
  experience_level = 'Senior',
  portfolio_url = 'https://jsdiaz.dev',
  linkedin_url = 'https://linkedin.com/in/jsdiaz-devops',
  birth_date = '1992-09-15',
  avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
WHERE id = '7b676155-1193-4c1e-8982-4562910bea66';


-- Candidate 7: Camila Castro (Store Manager / Gerente de Tienda)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'candidate',
  'full_name', 'Camila Castro',
  'profession', 'Gerente de Tienda',
  'location', 'Cali, Colombia',
  'phone', '+57 314 666 7788',
  'candidate_tags', 'Liderazgo, Ventas retail, Inventarios, KPI, Auditoría, Gestión de Equipos',
  'industry_interests', 'Retail, Moda, Supermercados',
  'experience_level', 'Senior',
  'portfolio_url', '',
  'linkedin_url', 'https://linkedin.com/in/camilacastro-manager',
  'birth_date', '1988-12-05'
)
WHERE id = '6f6200d2-8b70-4835-8464-d6912ad0e5d1';

UPDATE public.profiles
SET 
  full_name = 'Camila Castro',
  role = 'candidate',
  professional_title = 'Gerente de Tienda',
  location = 'Cali, Colombia',
  phone = '+57 314 666 7788',
  bio = 'Profesional con 5 años de experiencia liderando equipos en el sector retail. Experta en cumplimiento de metas de ventas, control de mermas y auditorías operacionales.',
  candidate_tags = 'Liderazgo, Ventas retail, Inventarios, KPI, Auditoría, Gestión de Equipos',
  industry_interests = 'Retail, Moda, Supermercados',
  experience_level = 'Senior',
  portfolio_url = '',
  linkedin_url = 'https://linkedin.com/in/camilacastro-manager',
  birth_date = '1988-12-05',
  avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
WHERE id = '6f6200d2-8b70-4835-8464-d6912ad0e5d1';


-- Candidate 8: Andrés Felipe Lasso (Marketing Specialist)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'candidate',
  'full_name', 'Andrés Felipe Lasso',
  'profession', 'Especialista en Marketing',
  'location', 'Bogotá, Colombia',
  'phone', '+57 321 444 8899',
  'candidate_tags', 'Google Ads, Facebook Ads, SEO, Analytics, Email Marketing',
  'industry_interests', 'Marketing, E-commerce, Agencia',
  'experience_level', 'Semi-Senior',
  'portfolio_url', 'https://felipe-marketing.dev',
  'linkedin_url', 'https://linkedin.com/in/felipelasso-marketing',
  'birth_date', '1995-05-30'
)
WHERE id = 'fdbc25bb-7716-4663-a9de-1cc37e7fe66b';

UPDATE public.profiles
SET 
  full_name = 'Andrés Felipe Lasso',
  role = 'candidate',
  professional_title = 'Especialista en Marketing',
  location = 'Bogotá, Colombia',
  phone = '+57 321 444 8899',
  bio = 'Estratega de marketing digital enfocado en campañas de adquisición (Paid Media), SEO y automatización de embudos de ventas. Orientado al crecimiento basado en datos.',
  candidate_tags = 'Google Ads, Facebook Ads, SEO, Analytics, Email Marketing',
  industry_interests = 'Marketing, E-commerce, Agencia',
  experience_level = 'Semi-Senior',
  portfolio_url = 'https://felipe-marketing.dev',
  linkedin_url = 'https://linkedin.com/in/felipelasso-marketing',
  birth_date = '1995-05-30',
  avatar_url = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
WHERE id = 'fdbc25bb-7716-4663-a9de-1cc37e7fe66b';


-- 3. UPDATE COMPANIES AUTH METADATA & PROFILE DATA
-- Company 1: Globant
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'company',
  'full_name', 'Globant',
  'location', 'Bogotá, Colombia',
  'phone', '+57 601 555 1234',
  'industry', 'Tecnología y Software',
  'business_area', 'Desarrollo de Software',
  'company_tags', 'Digital, IA, Global, Innovación'
)
WHERE id = 'e2e15ada-7c85-48af-a19d-b509cd498e23';

UPDATE public.profiles
SET 
  full_name = 'Globant',
  role = 'company',
  professional_title = 'Hiring Team',
  location = 'Bogotá, Colombia',
  phone = '+57 601 555 1234',
  bio = 'Somos una compañía nativa digital que ayuda a las organizaciones a reinventarse y desatar su potencial. Combinamos la innovación, el diseño y la ingeniería a escala.',
  industry = 'Tecnología y Software',
  business_area = 'Desarrollo de Software',
  company_tags = 'Digital, IA, Global, Innovación',
  avatar_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150'
WHERE id = 'e2e15ada-7c85-48af-a19d-b509cd498e23';


-- Company 2: MercadoLibre
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'company',
  'full_name', 'MercadoLibre',
  'location', 'Bogotá, Colombia',
  'phone', '+57 601 777 9876',
  'industry', 'E-commerce y Fintech',
  'business_area', 'Comercio Electrónico',
  'company_tags', 'E-commerce, Fintech, Logística, Envío rápido'
)
WHERE id = 'abfa05a6-d559-4601-ba24-6648235b3345';

UPDATE public.profiles
SET 
  full_name = 'MercadoLibre',
  role = 'company',
  professional_title = 'Hiring Team',
  location = 'Bogotá, Colombia',
  phone = '+57 601 777 9876',
  bio = 'La plataforma de comercio electrónico y servicios financieros líder en América Latina. Democratizando el comercio y el dinero en la región.',
  industry = 'E-commerce y Fintech',
  business_area = 'Comercio Electrónico',
  company_tags = 'E-commerce, Fintech, Logística, Envío rápido',
  avatar_url = 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=150'
WHERE id = 'abfa05a6-d559-4601-ba24-6648235b3345';


-- Company 3: Rappi
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'company',
  'full_name', 'Rappi',
  'location', 'Medellín, Colombia',
  'phone', '+57 604 333 4455',
  'industry', 'Super App y Logística',
  'business_area', 'Servicio a Domicilio',
  'company_tags', 'Delivery, Super App, Fast Growth, Startup'
)
WHERE id = 'd28a67d4-6b0d-44eb-9d05-ebf86a5cb82c';

UPDATE public.profiles
SET 
  full_name = 'Rappi',
  role = 'company',
  professional_title = 'Hiring Team',
  location = 'Medellín, Colombia',
  phone = '+57 604 333 4455',
  bio = 'La super-app de América Latina que conecta a los usuarios con comercios, restaurantes, supermercados y servicios financieros en minutos.',
  industry = 'Super App y Logística',
  business_area = 'Servicio a Domicilio',
  company_tags = 'Delivery, Super App, Fast Growth, Startup',
  avatar_url = 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=150'
WHERE id = 'd28a67d4-6b0d-44eb-9d05-ebf86a5cb82c';


-- Company 7: D1 S.A.S.
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'company',
  'full_name', 'D1 S.A.S.',
  'location', 'Cali, Colombia',
  'phone', '+57 602 888 1122',
  'industry', 'Supermercados y Retail',
  'business_area', 'Comercio al por menor',
  'company_tags', 'Hard Discount, Retail, Consumo Masivo, Crecimiento'
)
WHERE id = 'eba2d4e7-7eaf-4c64-9345-140bb72ea6d6';

UPDATE public.profiles
SET 
  full_name = 'D1 S.A.S.',
  role = 'company',
  professional_title = 'Hiring Team',
  location = 'Cali, Colombia',
  phone = '+57 602 888 1122',
  bio = 'Tiendas D1 ofrece productos de alta calidad al precio más bajo del mercado, con un modelo de descuento duro que revoluciona el consumo en Colombia.',
  industry = 'Supermercados y Retail',
  business_area = 'Comercio al por menor',
  company_tags = 'Hard Discount, Retail, Consumo Masivo, Crecimiento',
  avatar_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150'
WHERE id = 'eba2d4e7-7eaf-4c64-9345-140bb72ea6d6';


-- Company 8: Tiendas ARA
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role', 'company',
  'full_name', 'Tiendas ARA',
  'location', 'Bogotá, Colombia',
  'phone', '+57 601 444 3322',
  'industry', 'Supermercados y Retail',
  'business_area', 'Comercio al por menor',
  'company_tags', 'Retail, Vecindad, Descuento, Frescura'
)
WHERE id = '88acadf6-b86e-4b11-a733-f59b30f07de0';

UPDATE public.profiles
SET 
  full_name = 'Tiendas ARA',
  role = 'company',
  professional_title = 'Hiring Team',
  location = 'Bogotá, Colombia',
  phone = '+57 601 444 3322',
  bio = 'Llevamos alegría y economía a todos los hogares colombianos con tiendas cercanas que ofrecen productos de excelente calidad a los mejores precios.',
  industry = 'Supermercados y Retail',
  business_area = 'Comercio al por menor',
  company_tags = 'Retail, Vecindad, Descuento, Frescura',
  avatar_url = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=150'
WHERE id = '88acadf6-b86e-4b11-a733-f59b30f07de0';


-- 4. INSERT REALISTIC CANDIDATE EXPERIENCES
-- Clear old seeding data to prevent duplicates
DELETE FROM public.experiences WHERE profile_id IN (
  '002dbcb0-c8d0-4b84-bdf7-5c22e420e031',
  '38327350-da9b-4ff5-af6f-25baf6037851',
  '95e9d514-99c9-43cb-a8db-eae2c178eb78',
  'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec',
  '2901a311-4e60-4b54-a09b-aadedd129472',
  '7b676155-1193-4c1e-8982-4562910bea66',
  '6f6200d2-8b70-4835-8464-d6912ad0e5d1',
  'fdbc25bb-7716-4663-a9de-1cc37e7fe66b'
);

-- Sofía Martínez (React Native Candidate)
INSERT INTO public.experiences (id, profile_id, title, company, location, employment_type, start_date, end_date, is_current, description)
VALUES 
  (gen_random_uuid(), '002dbcb0-c8d0-4b84-bdf7-5c22e420e031', 'Desarrollador Mobile', 'Weknow', 'Bogotá, Colombia', 'Jornada completa', '2023-01-15', NULL, true, 'Liderazgo en el desarrollo de 3 aplicaciones híbridas usando React Native, Redux y Expo Router. Integración nativa de notificaciones push, mapas y pasarelas de pago.'),
  (gen_random_uuid(), '002dbcb0-c8d0-4b84-bdf7-5c22e420e031', 'Desarrollador Frontend', 'Intergrupo', 'Bogotá, Colombia', 'Jornada completa', '2021-03-01', '2022-12-15', false, 'Mantenimiento de portales web construidos en React y TypeScript. Optimización de performance logrando un 25% de reducción en los tiempos de carga inicial.');

-- Carlos Gómez (Sales Candidate)
INSERT INTO public.experiences (id, profile_id, title, company, location, employment_type, start_date, end_date, is_current, description)
VALUES 
  (gen_random_uuid(), '38327350-da9b-4ff5-af6f-25baf6037851', 'Ejecutivo de Cuentas Enterprise', 'Salesforce', 'Medellín, Colombia', 'Jornada completa', '2022-06-01', NULL, true, 'Encargado del ciclo completo de ventas para cuentas corporativas en la región andina. Cumplimiento sostenido del 115% de la cuota anual.'),
  (gen_random_uuid(), '38327350-da9b-4ff5-af6f-25baf6037851', 'Especialista de Ventas B2B', 'Claro Colombia', 'Medellín, Colombia', 'Jornada completa', '2019-02-15', '2022-05-30', false, 'Venta consultiva de planes corporativos, infraestructura en la nube y enlaces de fibra óptica. Cierre de más de 40 contratos empresariales nuevos.');

-- Elena Ruiz (Store Assistant Candidate)
INSERT INTO public.experiences (id, profile_id, title, company, location, employment_type, start_date, end_date, is_current, description)
VALUES 
  (gen_random_uuid(), '95e9d514-99c9-43cb-a8db-eae2c178eb78', 'Auxiliar de Tienda', 'Éxito', 'Cali, Colombia', 'Medio tiempo', '2024-02-01', NULL, true, 'Atención al cliente en sala de ventas, cuadre diario de caja, reposición de mercancía según rotación y control de inventarios periódicos.'),
  (gen_random_uuid(), '95e9d514-99c9-43cb-a8db-eae2c178eb78', 'Cajera Registradora', 'Olímpica', 'Cali, Colombia', 'Jornada completa', '2022-09-01', '2024-01-15', false, 'Registro rápido y eficiente de compras, facturación electrónica y manejo de múltiples formas de pago.');

-- Mateo Herrera (Data Analyst Candidate)
INSERT INTO public.experiences (id, profile_id, title, company, location, employment_type, start_date, end_date, is_current, description)
VALUES 
  (gen_random_uuid(), 'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec', 'Analista de Inteligencia de Negocios', 'Bancolombia', 'Bogotá, Colombia', 'Jornada completa', '2021-08-01', NULL, true, 'Diseño de tableros analíticos interactivos y automatizados en PowerBI que redujeron el tiempo de reportería en un 40%. Consultas SQL complejas.'),
  (gen_random_uuid(), 'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec', 'Data Analyst', 'Accenture', 'Bogotá, Colombia', 'Jornada completa', '2018-05-10', '2021-07-25', false, 'Limpieza y transformación de bases de datos masivas usando Python (Pandas/NumPy) para clientes del sector retail en LatAm.');

-- Valentina Restrepo (Designer Candidate)
INSERT INTO public.experiences (id, profile_id, title, company, location, employment_type, start_date, end_date, is_current, description)
VALUES 
  (gen_random_uuid(), '2901a311-4e60-4b54-a09b-aadedd129472', 'Diseñadora UI/UX Senior', 'Rappi', 'Medellín, Colombia', 'Jornada completa', '2023-05-01', NULL, true, 'Diseño de flujos y pantallas para la vertical de RappiPay. Creación y mantenimiento del sistema de diseño compartido por múltiples células de desarrollo.'),
  (gen_random_uuid(), '2901a311-4e60-4b54-a09b-aadedd129472', 'UI Designer', 'Havas', 'Medellín, Colombia', 'Jornada completa', '2020-01-15', '2023-04-30', false, 'Conceptualización visual y diseño de interfaces web responsivas para marcas globales de moda y consumo.');


-- 5. ENSURE CHATS AND APPLICATIONS COHESION FOR e2e15ada-7c85-48af-a19d-b509cd498e23 (Globant) AND abfa05a6-d559-4601-ba24-6648235b3345 (MercadoLibre)
-- We will delete old applications and chat rooms between these seeded candidates and companies to clean up and re-establish a perfect story.
DELETE FROM public.messages WHERE room_id IN (
  SELECT id FROM public.chat_rooms WHERE company_id IN ('e2e15ada-7c85-48af-a19d-b509cd498e23', 'abfa05a6-d559-4601-ba24-6648235b3345', 'eba2d4e7-7eaf-4c64-9345-140bb72ea6d6')
);
DELETE FROM public.chat_rooms WHERE company_id IN ('e2e15ada-7c85-48af-a19d-b509cd498e23', 'abfa05a6-d559-4601-ba24-6648235b3345', 'eba2d4e7-7eaf-4c64-9345-140bb72ea6d6');
DELETE FROM public.applications WHERE candidate_id IN (
  '002dbcb0-c8d0-4b84-bdf7-5c22e420e031',
  '38327350-da9b-4ff5-af6f-25baf6037851',
  '95e9d514-99c9-43cb-a8db-eae2c178eb78',
  'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec',
  '2901a311-4e60-4b54-a09b-aadedd129472',
  '6f6200d2-8b70-4835-8464-d6912ad0e5d1'
) AND job_id IN (
  'b0841681-5362-4f8f-8245-193fbe0c45a1',
  '1405ed92-3727-4d00-b244-ba8c875ab222',
  'de03f767-e0da-415c-bd18-cc86267cdca6',
  '18cb8e8f-2fb2-4f19-b0e5-3fe1cc357053',
  '2eb1a9c3-e4e0-448c-8d8e-0dc5100f20c7'
);

-- DECLARE ROOM UUIDS TO INSERT
DO $$
DECLARE
  app_globant_sofia uuid := gen_random_uuid();
  app_meli_mateo uuid := gen_random_uuid();
  app_d1_camila uuid := gen_random_uuid();
  app_meli_valentina uuid := gen_random_uuid();
  
  room_globant_sofia uuid := gen_random_uuid();
  room_meli_mateo uuid := gen_random_uuid();
  room_d1_camila uuid := gen_random_uuid();
  room_meli_valentina uuid := gen_random_uuid();
  
  msg_id1 uuid := gen_random_uuid();
  msg_id2 uuid := gen_random_uuid();
  msg_id3 uuid := gen_random_uuid();
  msg_id4 uuid := gen_random_uuid();
  msg_id5 uuid := gen_random_uuid();
BEGIN
  -- Insert applications
  -- Sofia Martínez (React Native) -> Globant Job (Desarrollador React Native)
  INSERT INTO public.applications (id, candidate_id, job_id, status, current_stage, is_rejected, created_at, updated_at)
  VALUES (app_globant_sofia, '002dbcb0-c8d0-4b84-bdf7-5c22e420e031', 'b0841681-5362-4f8f-8245-193fbe0c45a1', 'interview', 'Entrevista', false, now() - interval '3 days', now());
  
  -- Mateo Herrera (Data Analyst) -> MercadoLibre Job (Analista de Datos SR)
  INSERT INTO public.applications (id, candidate_id, job_id, status, current_stage, is_rejected, created_at, updated_at)
  VALUES (app_meli_mateo, 'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec', 'de03f767-e0da-415c-bd18-cc86267cdca6', 'interview', 'Prueba Técnica', false, now() - interval '5 days', now());

  -- Valentina Restrepo (Designer) -> MercadoLibre Job (Diseñador UI/UX)
  INSERT INTO public.applications (id, candidate_id, job_id, status, current_stage, is_rejected, created_at, updated_at)
  VALUES (app_meli_valentina, '2901a311-4e60-4b54-a09b-aadedd129472', '18cb8e8f-2fb2-4f19-b0e5-3fe1cc357053', 'interview', 'Diseño de Portafolio', false, now() - interval '2 days', now());

  -- Camila Castro (Store Manager) -> D1 Job (Gerente de Tienda)
  INSERT INTO public.applications (id, candidate_id, job_id, status, current_stage, is_rejected, created_at, updated_at)
  VALUES (app_d1_camila, '6f6200d2-8b70-4835-8464-d6912ad0e5d1', '2eb1a9c3-e4e0-448c-8d8e-0dc5100f20c7', 'interview', 'Entrevista de Zona', false, now() - interval '4 days', now());

  -- Insert chat rooms
  -- Sofia Martínez & Globant
  INSERT INTO public.chat_rooms (id, application_id, company_id, candidate_id, created_at)
  VALUES (room_globant_sofia, app_globant_sofia, 'e2e15ada-7c85-48af-a19d-b509cd498e23', '002dbcb0-c8d0-4b84-bdf7-5c22e420e031', now() - interval '3 days');

  -- Mateo Herrera & MercadoLibre
  INSERT INTO public.chat_rooms (id, application_id, company_id, candidate_id, created_at)
  VALUES (room_meli_mateo, app_meli_mateo, 'abfa05a6-d559-4601-ba24-6648235b3345', 'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec', now() - interval '5 days');

  -- Valentina Restrepo & MercadoLibre
  INSERT INTO public.chat_rooms (id, application_id, company_id, candidate_id, created_at)
  VALUES (room_meli_valentina, app_meli_valentina, 'abfa05a6-d559-4601-ba24-6648235b3345', '2901a311-4e60-4b54-a09b-aadedd129472', now() - interval '2 days');

  -- Camila Castro & D1
  INSERT INTO public.chat_rooms (id, application_id, company_id, candidate_id, created_at)
  VALUES (room_d1_camila, app_d1_camila, 'eba2d4e7-7eaf-4c64-9345-140bb72ea6d6', '6f6200d2-8b70-4835-8464-d6912ad0e5d1', now() - interval '4 days');

  -- Insert chat messages
  -- Globant Chat with Sofia (using reply_to_id for a reply structure)
  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (msg_id1, room_globant_sofia, '002dbcb0-c8d0-4b84-bdf7-5c22e420e031', '¡Hola! Estoy muy entusiasmada por la oportunidad de Desarrollador React Native en Globant.', 'text', false, true, now() - interval '2 days 5 hours');
  
  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (msg_id2, room_globant_sofia, 'e2e15ada-7c85-48af-a19d-b509cd498e23', '¡Hola Sofía! Qué gusto saludarte. Vimos tu perfil y nos encantó tu experiencia en Expo y Supabase.', 'text', false, true, now() - interval '2 days 4 hours');
  
  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (msg_id3, room_globant_sofia, 'e2e15ada-7c85-48af-a19d-b509cd498e23', '¿Tendrías disponibilidad para una llamada breve mañana en la tarde?', 'text', false, true, now() - interval '2 days 3 hours');
  
  INSERT INTO public.messages (id, room_id, sender_id, content, type, reply_to_id, is_system, is_read, created_at)
  VALUES (msg_id4, room_globant_sofia, '002dbcb0-c8d0-4b84-bdf7-5c22e420e031', '¡Claro que sí! Mañana después de las 2:00 PM me queda excelente. Quedo atenta.', 'text', false, msg_id3, false, true, now() - interval '2 days 2 hours');

  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (msg_id5, room_globant_sofia, 'e2e15ada-7c85-48af-a19d-b509cd498e23', '¡Perfecto! Te agendé para las 3:00 PM. Nos escuchamos mañana. 👍', 'text', false, true, now() - interval '2 days 1 hour');

  -- MercadoLibre Chat with Mateo
  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_meli_mateo, 'abfa05a6-d559-4601-ba24-6648235b3345', 'Hola Mateo, un gusto. Queremos invitarte a realizar la prueba técnica de Analista de Datos SR en MercadoLibre.', 'text', false, true, now() - interval '4 days 2 hours');

  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_meli_mateo, 'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec', 'Hola, excelente día. Muchas gracias por la oportunidad. ¿Me podrían enviar las especificaciones de la prueba?', 'text', false, true, now() - interval '4 days 1 hour');

  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_meli_mateo, 'abfa05a6-d559-4601-ba24-6648235b3345', '¡Sí! Te acabo de enviar las credenciales por correo electrónico. Tienes 48 horas para enviarnos el repositorio.', 'text', false, true, now() - interval '3 days 23 hours');

  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_meli_mateo, 'd0a9e689-5e05-47fd-b3e7-0688ed4a80ec', 'Entendido. Ya la recibí, estaré enviando la solución lo antes posible. Saludos.', 'text', false, true, now() - interval '3 days 22 hours');

  -- MercadoLibre Chat with Valentina
  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_meli_valentina, 'abfa05a6-d559-4601-ba24-6648235b3345', 'Hola Valentina. Nos encanta tu portafolio en Behance. Queremos agendar una entrevista de diseño.', 'text', false, true, now() - interval '1 day 5 hours');

  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_meli_valentina, '2901a311-4e60-4b54-a09b-aadedd129472', '¡Wow, qué alegría! Muchas gracias por el feedback. Estoy súper disponible esta semana.', 'text', false, true, now() - interval '1 day 4 hours');

  -- D1 Chat with Camila
  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_d1_camila, 'eba2d4e7-7eaf-4c64-9345-140bb72ea6d6', 'Hola Camila, bienvenida a la etapa de selección para Gerente de Tienda en D1.', 'text', false, true, now() - interval '3 days 6 hours');

  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_d1_camila, '6f6200d2-8b70-4835-8464-d6912ad0e5d1', 'Muchas gracias. Estoy muy interesada en liderar la operación de la nueva sucursal en Cali.', 'text', false, true, now() - interval '3 days 5 hours');

  INSERT INTO public.messages (id, room_id, sender_id, content, type, is_system, is_read, created_at)
  VALUES (gen_random_uuid(), room_d1_camila, 'eba2d4e7-7eaf-4c64-9345-140bb72ea6d6', 'Excelente. Agendemos la entrevista presencial con nuestro director de zona en la oficina de Cali.', 'text', false, true, now() - interval '3 days 4 hours');

END $$;
