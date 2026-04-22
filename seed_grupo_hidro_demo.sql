-- ==========================================
-- GRUPO HIDRO - DATABASE MODEL & SEED DATA
-- ==========================================
-- Este script crea la arquitectura solicitada y la puebla con datos realistas.
-- Puede ejecutarse en el SQL Editor de Supabase.

-- 1. CLEANUP Y EXTENSIONES
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS report_photos CASCADE;
DROP TABLE IF EXISTS project_reports CASCADE;
DROP TABLE IF EXISTS material_requests CASCADE;
DROP TABLE IF EXISTS weekly_plans CASCADE;
DROP TABLE IF EXISTS project_stages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('residente', 'supervisor', 'jefe_residentes', 'gerencia_general', 'gerencia_tecnica', 'cliente');

DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM ('planning', 'executing', 'completed', 'paused');

DROP TYPE IF EXISTS report_status CASCADE;
CREATE TYPE report_status AS ENUM ('pending', 'approved', 'rejected');

-- 3. SCHEMA CREATION

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_email TEXT,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT,
    status project_status DEFAULT 'executing',
    progress INTEGER DEFAULT 0,
    client_id UUID REFERENCES clients(id),
    residente_id UUID REFERENCES users(id),
    supervisor_id UUID REFERENCES users(id),
    aprobador_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE weekly_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    goals TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE material_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id),
    items JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    status report_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE report_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES project_reports(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. SEED DATA
-- ==========================================

-- Companies
INSERT INTO companies (id, name, type) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Grupo Hidro', 'holding'),
('c0000000-0000-0000-0000-000000000002', 'HidroSolución', 'construction'),
('c0000000-0000-0000-0000-000000000003', 'Promotora Aires', 'real_estate');

-- Clients
INSERT INTO clients (id, name, contact_email, company_id) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Constructora Arkitrust', 'contacto@arkitrust.com', 'c0000000-0000-0000-0000-000000000003'),
('c1000000-0000-0000-0000-000000000002', 'Promotora Midtown', 'proyectos@midtown.ec', 'c0000000-0000-0000-0000-000000000003'),
('c1000000-0000-0000-0000-000000000003', 'Grupo Numa', 'gerencia@numazentra.com', 'c0000000-0000-0000-0000-000000000003');

-- Users
INSERT INTO users (id, full_name, email, role, company_id) VALUES 
-- Residentes
('aa000000-0000-0000-0000-000000000001', 'Juan Residente', 'juan@hidro.com', 'residente', 'c0000000-0000-0000-0000-000000000002'),
('aa000000-0000-0000-0000-000000000002', 'Luis Residente', 'luis@hidro.com', 'residente', 'c0000000-0000-0000-0000-000000000002'),
-- Supervisores
('aa000000-0000-0000-0000-000000000003', 'Carlos Supervisor', 'carlos@hidro.com', 'supervisor', 'c0000000-0000-0000-0000-000000000002'),
('aa000000-0000-0000-0000-000000000004', 'Maria Supervisor', 'maria@hidro.com', 'supervisor', 'c0000000-0000-0000-0000-000000000002'),
-- Aprobadores / Jefes / Gerencia
('aa000000-0000-0000-0000-000000000005', 'Ana Jefe', 'ana@hidro.com', 'jefe_residentes', 'c0000000-0000-0000-0000-000000000001'),
('aa000000-0000-0000-0000-000000000006', 'Roberto Gerencia', 'roberto@hidro.com', 'gerencia_general', 'c0000000-0000-0000-0000-000000000001');

-- Projects
INSERT INTO projects (id, name, location, status, progress, client_id, residente_id, supervisor_id, aprobador_id, company_id) VALUES 
('bb000000-0000-0000-0000-000000000001', 'Sistema Contra Incendios Midtown', 'Samborondón, km 1.5', 'executing', 65, 'c1000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002'),
('bb000000-0000-0000-0000-000000000002', 'Planta de Tratamiento Aires Este', 'Samborondón, km 5', 'executing', 30, 'c1000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002'),
('bb000000-0000-0000-0000-000000000003', 'Red Hidrosanitaria Numa-Zentra', 'Guayaquil, Vía a la Costa', 'planning', 10, 'c1000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002'),
('bb000000-0000-0000-0000-000000000004', 'Aguas Lluvia Santiago Nuevo Sambo', 'Samborondón, km 10', 'completed', 100, 'c1000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002');

-- Project Stages
INSERT INTO project_stages (project_id, name, status, progress, start_date, end_date) VALUES 
-- Midtown
('bb000000-0000-0000-0000-000000000001', 'Instalación Tubería Principal', 'completed', 100, '2026-01-10', '2026-02-15'),
('bb000000-0000-0000-0000-000000000001', 'Cuarto de Bombas', 'executing', 40, '2026-02-20', '2026-04-30'),
('bb000000-0000-0000-0000-000000000001', 'Pruebas de Presión', 'pending', 0, '2026-05-01', '2026-05-15'),
-- Aires Este
('bb000000-0000-0000-0000-000000000002', 'Movimiento de Tierras', 'completed', 100, '2026-03-01', '2026-03-15'),
('bb000000-0000-0000-0000-000000000002', 'Fundición de Base', 'executing', 50, '2026-03-20', '2026-04-25');

-- Weekly Plans
INSERT INTO weekly_plans (project_id, week_start, week_end, goals, created_by) VALUES 
('bb000000-0000-0000-0000-000000000001', '2026-04-20', '2026-04-26', 'Completar el ensamblaje del manifold principal en el cuarto de bombas.', 'aa000000-0000-0000-0000-000000000001'),
('bb000000-0000-0000-0000-000000000002', '2026-04-20', '2026-04-26', 'Terminar encofrado y fundir primera sección de la losa inferior.', 'aa000000-0000-0000-0000-000000000002');

-- Material Requests
INSERT INTO material_requests (id, project_id, requested_by, items, status) VALUES 
('dd000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', '[{"item": "Tubo Acero Carbono 6 pulg", "qty": 20, "unit": "metros"}, {"item": "Codos 90 grados", "qty": 15, "unit": "unidades"}]', 'approved'),
('dd000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002', '[{"item": "Cemento Portland", "qty": 50, "unit": "sacos"}, {"item": "Varilla 12mm", "qty": 100, "unit": "varillas"}]', 'pending');

-- Project Reports (The timeline where Residente and Supervisor publish)
INSERT INTO project_reports (id, project_id, author_id, content, status, created_at) VALUES 
-- Midtown Reports
('ee000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Se completó la instalación del 80% de la tubería aérea en el sótano 2.', 'approved', '2026-04-18 16:30:00'),
('ee000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'Supervisión de soldadura en manifold. Todo conforme a la norma NFPA 13.', 'approved', '2026-04-19 10:00:00'),
('ee000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Llegada de bombas principales. Iniciamos posicionamiento sobre pedestales.', 'pending', '2026-04-21 15:45:00'),
-- Aires Este Reports
('ee000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002', 'Excavación profunda terminada. Terreno listo para replantillo.', 'approved', '2026-04-15 17:00:00');

-- Report Photos
INSERT INTO report_photos (report_id, photo_url) VALUES 
('ee000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1541888941259-7b9f9227fe95?q=80&w=800&auto=format&fit=crop'),
('ee000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1503387762-592dee58c460?q=80&w=800&auto=format&fit=crop'),
('ee000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop'),
('ee000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?q=80&w=800&auto=format&fit=crop');

-- Notifications
INSERT INTO notifications (user_id, title, message) VALUES 
('aa000000-0000-0000-0000-000000000001', 'Materiales Aprobados', 'Gerencia aprobó tu pedido de Tubo Acero Carbono.'),
('aa000000-0000-0000-0000-000000000005', 'Nuevo Reporte Pendiente', 'Juan Residente subió un reporte en Midtown Samborondon. Requiere tu validación.'),
('aa000000-0000-0000-0000-000000000002', 'Pedido Rechazado', 'Revisa el pedido de materiales en Aires Este. Falta justificación.');
