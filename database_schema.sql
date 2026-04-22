-- ==========================================
-- GRUPO HIDRO - DATABASE SCHEMA & SECURITY
-- ==========================================

-- 0. CLEANUP (WARNING: THIS DELETES ALL EXISTING DATA)
-- Elimina tablas existentes para poder recrear la nueva arquitectura desde cero
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS project_chat_messages CASCADE;
DROP TABLE IF EXISTS project_payments CASCADE;
DROP TABLE IF EXISTS project_stages CASCADE;
DROP TABLE IF EXISTS material_orders CASCADE;
DROP TABLE IF EXISTS update_comments CASCADE;
DROP TABLE IF EXISTS update_photos CASCADE;
DROP TABLE IF EXISTS project_updates CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (STRICT TYPES)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('cliente', 'residente', 'supervisor', 'jefe_residentes', 'gerencia_tecnica', 'gerencia_general', 'disenador');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'executing', 'completed', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE update_status AS ENUM ('pending', 'validated', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'approved', 'rejected', 'delivered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- Companies (Holding Structure)
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'construction', 'design', 'supplies', 'machinery'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles (Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'cliente',
    avatar_url TEXT,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    company_id UUID REFERENCES companies(id),
    client_id UUID REFERENCES profiles(id),
    maestro_id UUID REFERENCES profiles(id), -- Residente
    supervisor_id UUID REFERENCES profiles(id),
    status project_status NOT NULL DEFAULT 'planning',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    location TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Updates (Daily Reports)
CREATE TABLE IF NOT EXISTS project_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    description TEXT NOT NULL,
    photos_json JSONB DEFAULT '[]'::jsonb,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status update_status NOT NULL DEFAULT 'pending',
    validated_by UUID REFERENCES profiles(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Orders
CREATE TABLE IF NOT EXISTS material_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    status order_status NOT NULL DEFAULT 'pending',
    items_json JSONB NOT NULL,
    client_approved_by UUID REFERENCES profiles(id),
    client_approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Stages (Timeline)
CREATE TABLE IF NOT EXISTS project_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Payments (Financials)
CREATE TABLE IF NOT EXISTS project_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Chat Messages
CREATE TABLE IF NOT EXISTS project_chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    old_data JSONB,
    new_data JSONB,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Activar RLS en todas las tablas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Funciones Auxiliares
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------
-- Todos pueden ver perfiles (necesario para ver nombres en el chat, reportes, etc.)
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
-- Los usuarios solo pueden actualizar su propio perfil (salvo gerencia que podría administrar)
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------
-- COMPANIES POLICIES
-- ------------------------------------------
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (true);

-- ------------------------------------------
-- PROJECTS POLICIES
-- ------------------------------------------
-- Gerencia ve todo.
-- Jefe de residentes ve todo o lo asignado (asumiremos todo para simplificar supervisión).
-- Supervisor ve proyectos donde es supervisor_id.
-- Residente ve proyectos donde es maestro_id.
-- Cliente ve proyectos donde es client_id.
CREATE POLICY "Projects Visibility" ON projects FOR SELECT USING (
  get_user_role() IN ('gerencia_general', 'gerencia_tecnica', 'jefe_residentes') OR
  client_id = auth.uid() OR
  maestro_id = auth.uid() OR
  supervisor_id = auth.uid()
);

-- Solo gerencia y jefes pueden crear/modificar proyectos
CREATE POLICY "Projects Modification" ON projects FOR ALL USING (
  get_user_role() IN ('gerencia_general', 'gerencia_tecnica', 'jefe_residentes')
);

-- ------------------------------------------
-- PROJECT UPDATES (REPORTES) POLICIES
-- ------------------------------------------
-- Equipo técnico ve todos los reportes de sus proyectos.
-- Cliente SOLO ve los reportes 'validated'.
CREATE POLICY "Updates Visibility" ON project_updates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p WHERE p.id = project_updates.project_id AND (
      p.maestro_id = auth.uid() OR 
      p.supervisor_id = auth.uid() OR 
      get_user_role() IN ('gerencia_general', 'gerencia_tecnica', 'jefe_residentes')
    )
  )
  OR
  (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_updates.project_id AND p.client_id = auth.uid()) AND status = 'validated')
);

-- Solo el residente/maestro puede crear reportes
CREATE POLICY "Updates Creation" ON project_updates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.maestro_id = auth.uid())
);

-- Gerencia / Jefes pueden modificar (para validar)
CREATE POLICY "Updates Validation" ON project_updates FOR UPDATE USING (
  get_user_role() IN ('gerencia_general', 'gerencia_tecnica', 'jefe_residentes')
);

-- ------------------------------------------
-- MATERIAL ORDERS POLICIES
-- ------------------------------------------
-- Visibilidad: Clientes ven los de su proyecto. Equipo ve los de su proyecto.
CREATE POLICY "Orders Visibility" ON material_orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p WHERE p.id = material_orders.project_id AND (
      p.client_id = auth.uid() OR
      p.maestro_id = auth.uid() OR 
      p.supervisor_id = auth.uid() OR 
      get_user_role() IN ('gerencia_general', 'gerencia_tecnica', 'jefe_residentes')
    )
  )
);

-- Residentes crean pedidos
CREATE POLICY "Orders Creation" ON material_orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.maestro_id = auth.uid())
);

-- Clientes actualizan para aprobar/rechazar
CREATE POLICY "Orders Approval" ON material_orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.client_id = auth.uid())
);

-- ------------------------------------------
-- PAYMENTS POLICIES (FINANCIAL)
-- ------------------------------------------
-- Oculto para Residentes y Supervisores. Solo Cliente, Jefe de Residentes y Gerencia.
CREATE POLICY "Payments Visibility" ON project_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p WHERE p.id = project_payments.project_id AND (
      p.client_id = auth.uid() OR
      get_user_role() IN ('gerencia_general', 'gerencia_tecnica', 'jefe_residentes')
    )
  )
);

-- ------------------------------------------
-- CHAT POLICIES
-- ------------------------------------------
-- Todos los asignados al proyecto pueden chatear
CREATE POLICY "Chat Visibility and Creation" ON project_chat_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects p WHERE p.id = project_chat_messages.project_id AND (
      p.client_id = auth.uid() OR
      p.maestro_id = auth.uid() OR 
      p.supervisor_id = auth.uid() OR 
      get_user_role() IN ('gerencia_general', 'gerencia_tecnica', 'jefe_residentes')
    )
  )
);