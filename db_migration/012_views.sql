-- 1. v_revenue_dashboard
CREATE OR REPLACE VIEW v_revenue_dashboard AS
SELECT 
    tenant_id,
    COALESCE(SUM(amount), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS collected_revenue,
    COUNT(id) AS transaction_count
FROM payments
GROUP BY tenant_id;

-- 2. v_sales_dashboard
CREATE OR REPLACE VIEW v_sales_dashboard AS
SELECT 
    tenant_id,
    COUNT(id) AS total_opportunities,
    COALESCE(SUM(amount), 0) AS total_value,
    COALESCE(SUM(CASE WHEN stage = 'Closed Won' THEN amount ELSE 0 END), 0) AS won_value,
    COUNT(CASE WHEN stage = 'Closed Won' THEN 1 END) AS won_count
FROM opportunities
GROUP BY tenant_id;

-- 3. v_finance_dashboard
CREATE OR REPLACE VIEW v_finance_dashboard AS
SELECT 
    tenant_id,
    COALESCE(SUM(amount), 0) AS total_invoiced,
    COALESCE(SUM(paid), 0) AS total_paid,
    COALESCE(SUM(amount - paid), 0) AS total_outstanding,
    COUNT(CASE WHEN status = 'Overdue' THEN 1 END) AS overdue_count
FROM invoices
GROUP BY tenant_id;

-- 4. v_customer_health
CREATE OR REPLACE VIEW v_customer_health AS
SELECT 
    tenant_id,
    client_company,
    COUNT(id) AS active_subscriptions,
    COALESCE(SUM(usage_current), 0) AS current_usage,
    COALESCE(SUM(usage_limit), 0) AS total_limit,
    CASE 
        WHEN COALESCE(SUM(usage_limit), 0) = 0 THEN 100
        ELSE ROUND((COALESCE(SUM(usage_current), 0)::numeric / COALESCE(SUM(usage_limit), 0)::numeric) * 100, 2)
    END AS usage_percentage
FROM subscriptions
GROUP BY tenant_id, client_company;

-- 5. v_kpi_velocity
CREATE OR REPLACE VIEW v_kpi_velocity AS
SELECT 
    tenant_id,
    AVG(close_date - created_at::date) AS avg_close_days,
    COUNT(id) AS closed_count
FROM opportunities
WHERE stage IN ('Closed Won', 'Closed Lost')
GROUP BY tenant_id;

-- 6. v_organization_health
CREATE OR REPLACE VIEW v_organization_health AS
SELECT 
    tenant_id,
    COUNT(id) AS employee_count,
    ROUND(AVG(salary), 2) AS average_salary
FROM employees
GROUP BY tenant_id;

-- 7. v_executive_dashboard
CREATE OR REPLACE VIEW v_executive_dashboard AS
SELECT 
    o.tenant_id,
    o.name AS organization_name,
    (SELECT COALESCE(SUM(amount), 0) FROM payments p WHERE p.tenant_id = o.tenant_id AND p.status = 'completed') AS total_revenue_collected,
    (SELECT COUNT(u.id) FROM users u WHERE u.tenant_id = o.tenant_id) AS user_count,
    (SELECT COUNT(p.id) FROM projects p WHERE p.tenant_id = o.tenant_id) AS active_projects
FROM organizations o;
