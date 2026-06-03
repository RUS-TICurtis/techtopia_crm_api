-- 1. Insert Organizations (with fixed reference UUIDs)
INSERT INTO organizations (tenant_id, name, subdomain) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Techtopia Technologies', 'techtopia'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Acme Manufacturing', 'acme'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Apex Logistics', 'apex')
ON CONFLICT DO NOTHING;

-- 2. Insert Users (all default passwords are bcrypt hashes of 'password123')
INSERT INTO users (id, tenant_id, email, name, role, role_label, avatar, department, client_company, password_hash, mfa_secret) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@techtopia.crm', 'Curtis Tungsten', 'super_admin', 'Super Admin', 'CT', 'Executive', NULL, '$2b$10$tMh4E8K0H5z72x/m0x9aOeR3z/qK9lZ1v1zV1Z.4nZq2q6p5F3wW.', 'verification_secret_key_placeholder'),
(2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'orgadmin@techtopia.crm', 'Alice Administrator', 'tenant_admin', 'Tenant Admin', 'AA', 'Operations', NULL, '$2b$10$tMh4E8K0H5z72x/m0x9aOeR3z/qK9lZ1v1zV1Z.4nZq2q6p5F3wW.', 'verification_secret_key_placeholder'),
(3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'finance@techtopia.crm', 'Faye Morgan', 'finance', 'Finance Manager', 'FM', 'Finance', NULL, '$2b$10$tMh4E8K0H5z72x/m0x9aOeR3z/qK9lZ1v1zV1Z.4nZq2q6p5F3wW.', 'verification_secret_key_placeholder'),
(4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sales@techtopia.crm', 'Sarah Jenkins', 'sales', 'Sales Manager', 'SJ', 'Sales', NULL, '$2b$10$tMh4E8K0H5z72x/m0x9aOeR3z/qK9lZ1v1zV1Z.4nZq2q6p5F3wW.', 'verification_secret_key_placeholder'),
(5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'support@techtopia.crm', 'Sam Porter', 'support', 'Support Agent', 'SP', 'Support', NULL, '$2b$10$tMh4E8K0H5z72x/m0x9aOeR3z/qK9lZ1v1zV1Z.4nZq2q6p5F3wW.', 'verification_secret_key_placeholder'),
(6, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'pm@techtopia.crm', 'Patrick Mills', 'project_manager', 'Project Manager', 'PM', 'Delivery', NULL, '$2b$10$tMh4E8K0H5z72x/m0x9aOeR3z/qK9lZ1v1zV1Z.4nZq2q6p5F3wW.', 'verification_secret_key_placeholder'),
(7, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'hr@techtopia.crm', 'Helen Reynolds', 'hr', 'HR Manager', 'HR', 'HR', NULL, '$2b$10$tMh4E8K0H5z72x/m0x9aOeR3z/qK9lZ1v1zV1Z.4nZq2q6p5F3wW.', 'verification_secret_key_placeholder'),
(8, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'client@acme.com', 'Alex Client', 'client', 'Client', 'AC', 'External', 'ACME Corp', '$2b$10$tMh4E8K0H5z72x/m0x9aOeR3z/qK9lZ1v1zV1Z.4nZq2q6p5F3wW.', 'verification_secret_key_placeholder')
ON CONFLICT DO NOTHING;

-- 3. CRM Pipelines & Stages
INSERT INTO pipelines (id, tenant_id, name) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Enterprise Sales Pipeline')
ON CONFLICT DO NOTHING;

INSERT INTO pipeline_stages (id, tenant_id, pipeline_id, name, position, probability) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Lead In', 0, 10.00),
(2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Contact Made', 1, 20.00),
(3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Proposal Sent', 2, 50.00),
(4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Negotiations', 3, 80.00),
(5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Won / Closed', 4, 100.00)
ON CONFLICT DO NOTHING;

-- 4. Budgets
INSERT INTO budgets (id, tenant_id, name, allocated, spent, period, category) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Operations', 250000, 80000, 'FY 2026', 'Operating'),
(2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Marketing', 120000, 45000, 'FY 2026', 'Marketing'),
(3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Payroll', 800000, 320000, 'FY 2026', 'Staffing'),
(4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Infrastructure', 150000, 65000, 'FY 2026', 'Technology'),
(5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Travel', 40000, 12000, 'FY 2026', 'Travel')
ON CONFLICT DO NOTHING;

-- 5. AI Agents
INSERT INTO ai_agents (id, tenant_id, name, role, system_prompt, status) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Finance Agent', 'financial advisory', 'You are an expert corporate financial analyst agent. Help users review overdue invoices, sales summaries, and balance forecasts.', 'active')
ON CONFLICT DO NOTHING;
