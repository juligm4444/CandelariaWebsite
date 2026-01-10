-- ===============================================
-- Candelaria Website Database Schema
-- ===============================================

-- Create database (run this first in a separate connection)
-- CREATE DATABASE candelaria_db;

-- Connect to candelaria_db and run the rest

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'Committee', 'Logistics'
    name_es VARCHAR(200) NOT NULL,
    description_es TEXT,
    icon_url VARCHAR(500), -- URL to team icon/logo
    display_order INTEGER DEFAULT 1, -- for ordering teams on the website
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    role_es VARCHAR(200) NOT NULL,
    charge_es TEXT, -- detailed description/charge
    image_url VARCHAR(500), -- member photo URL
    member_order INTEGER DEFAULT 1, -- for ordering within team
    is_active BOOLEAN DEFAULT true, -- for managing active/inactive members
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team objectives/functions table
CREATE TABLE team_objectives (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    objective_key VARCHAR(50) NOT NULL, -- e.g., 'objective1', 'function1'
    title_es VARCHAR(500) NOT NULL,
    description_es TEXT NOT NULL,
    objective_order INTEGER DEFAULT 1, -- for ordering objectives within team
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publications table (for future use)
CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    publication_date DATE,
    author VARCHAR(200),
    publication_type VARCHAR(50), -- 'research', 'article', 'conference', etc.
    is_featured BOOLEAN DEFAULT false, -- for highlighting important publications
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact form submissions table
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'read', 'responded'
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL
);

-- Website configuration table (for global settings)
CREATE TABLE website_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_members_team_id ON members(team_id);
CREATE INDEX idx_members_active ON members(is_active);
CREATE INDEX idx_team_objectives_team_id ON team_objectives(team_id);
CREATE INDEX idx_publications_featured ON publications(is_featured);
CREATE INDEX idx_contact_status ON contact_submissions(status);

-- Add update trigger for teams table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();