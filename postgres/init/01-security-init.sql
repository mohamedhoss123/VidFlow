-- PostgreSQL Security Initialization Script for VidFlow
-- This script sets up additional security configurations

-- Create a read-only user for monitoring/reporting
CREATE ROLE vidflow_readonly WITH LOGIN PASSWORD 'VidFlow_R3ad0nly_M0n1t0r_2025!';
GRANT CONNECT ON DATABASE vidflow TO vidflow_readonly;
GRANT USAGE ON SCHEMA public TO vidflow_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO vidflow_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO vidflow_readonly;

-- Create application-specific schema
CREATE SCHEMA IF NOT EXISTS vidflow_app AUTHORIZATION vidflow_user;

-- Grant necessary permissions to main user
GRANT ALL PRIVILEGES ON SCHEMA vidflow_app TO vidflow_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA vidflow_app TO vidflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA vidflow_app TO vidflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA vidflow_app GRANT ALL ON TABLES TO vidflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA vidflow_app GRANT ALL ON SEQUENCES TO vidflow_user;

-- Security: Enable row level security by default for new tables
ALTER DATABASE vidflow SET row_security = on;

-- Note: Database-level logging parameters removed as they cannot be set after connection start
-- These should be configured in postgresql.conf instead:
-- log_statement = 'mod'
-- log_min_duration_statement = 1000  
-- log_checkpoints = on
-- log_lock_waits = on
-- log_connections = on
-- log_disconnections = on

-- Create audit table for security monitoring
CREATE TABLE IF NOT EXISTS vidflow_app.audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB
);

-- Grant audit permissions
GRANT INSERT ON vidflow_app.audit_log TO vidflow_user;
GRANT SELECT ON vidflow_app.audit_log TO vidflow_readonly;

-- Create function for audit logging
CREATE OR REPLACE FUNCTION vidflow_app.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO vidflow_app.audit_log (table_name, operation, user_name, old_values)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO vidflow_app.audit_log (table_name, operation, user_name, old_values, new_values)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO vidflow_app.audit_log (table_name, operation, user_name, new_values)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
