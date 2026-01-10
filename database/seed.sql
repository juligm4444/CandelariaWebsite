-- ===============================================
-- Candelaria Website Seed Data
-- ===============================================

-- Insert teams based on Figma design (7 teams)
INSERT INTO teams (name_key, name_es, description_es, display_order) VALUES
('Committee', 'Comité', 'Grupo directivo y de supervisión del proyecto Candelaria', 1),
('Logistics', 'Logística', 'Encargados de la planificación y coordinación de recursos', 2),
('Human_Resources', 'Recursos Humanos', 'Gestión del talento humano y desarrollo del equipo', 3),
('Design', 'Diseño', 'Diseño industrial y de experiencia de usuario', 4),
('Cells', 'Celdas', 'Desarrollo y optimización del sistema de celdas solares', 5),
('ComTrac', 'ComTrac', 'Comunicación y Tracción del vehículo solar', 6),
('Mechanics_Fairing', 'Mecánica y Carenado', 'Sistemas mecánicos y diseño aerodinámico', 7);

-- Insert sample members for Committee team
INSERT INTO members (team_id, name, role_es, charge_es, member_order) VALUES
(1, 'Guillermo Jiménez', 'Profesor Asesor', 'Director del Departamento de Ingeniería Eléctrica y Electrónica.', 1),
(1, 'Juan Pablo Casas', 'Profesor Asesor', 'Profesor Asociado del Departamento de Ingeniería Mecánica.', 2),
(1, 'Diego Rojas', 'Miembro del Comité', 'Estudiante de Maestría en Ingeniería Eléctrica.', 3);

-- Insert sample members for Logistics team
INSERT INTO members (team_id, name, role_es, charge_es, member_order) VALUES
(2, 'María González', 'Coordinadora de Logística', 'Responsable de la planificación y coordinación de recursos del proyecto.', 1),
(2, 'Carlos Rodríguez', 'Analista Logístico', 'Encargado del análisis y optimización de procesos logísticos.', 2);

-- Insert team objectives for Committee
INSERT INTO team_objectives (team_id, objective_key, title_es, description_es, objective_order) VALUES
(1, 'function1', 'Supervisar el progreso del proyecto', 'Asegurar que cada área avance conforme al cronograma y los estándares de calidad definidos.', 1),
(1, 'function2', 'Tomar decisiones estratégicas', 'Guiar la dirección general del proyecto mediante una gestión efectiva y colaborativa.', 2),
(1, 'function3', 'Representar al equipo', 'Actuar como enlace principal entre el proyecto, la universidad y entidades externas.', 3);

-- Insert team objectives for Logistics
INSERT INTO team_objectives (team_id, objective_key, title_es, description_es, objective_order) VALUES
(2, 'function1', 'Planificar recursos', 'Coordinar la adquisición y distribución eficiente de materiales y herramientas necesarias.', 1),
(2, 'function2', 'Gestionar cronogramas', 'Desarrollar y mantener cronogramas detallados para todas las fases del proyecto.', 2),
(2, 'function3', 'Optimizar procesos', 'Identificar y implementar mejoras en los procesos operativos del equipo.', 3);

-- Insert team objectives for Human Resources
INSERT INTO team_objectives (team_id, objective_key, title_es, description_es, objective_order) VALUES
(3, 'function1', 'Gestionar el talento humano', 'Reclutar, seleccionar y desarrollar a los miembros del equipo.', 1),
(3, 'function2', 'Fomentar el desarrollo profesional', 'Crear programas de capacitación y crecimiento para los integrantes.', 2),
(3, 'function3', 'Mantener el bienestar del equipo', 'Asegurar un ambiente de trabajo positivo y productivo.', 3);

-- Insert team objectives for Design
INSERT INTO team_objectives (team_id, objective_key, title_es, description_es, objective_order) VALUES
(4, 'function1', 'Diseñar la identidad visual', 'Crear y mantener la identidad gráfica del proyecto Candelaria.', 1),
(4, 'function2', 'Desarrollar interfaces de usuario', 'Diseñar experiencias digitales intuitivas y atractivas.', 2),
(4, 'function3', 'Documentar el proceso creativo', 'Registrar y compartir el proceso de diseño y sus resultados.', 3);

-- Insert team objectives for Cells
INSERT INTO team_objectives (team_id, objective_key, title_es, description_es, objective_order) VALUES
(5, 'function1', 'Optimizar eficiencia energética', 'Maximizar la conversión de energía solar en energía eléctrica utilizable.', 1),
(5, 'function2', 'Investigar nuevas tecnologías', 'Explorar e implementar tecnologías avanzadas en celdas solares.', 2),
(5, 'function3', 'Analizar rendimiento', 'Monitorear y evaluar el desempeño del sistema de celdas solares.', 3);

-- Insert team objectives for ComTrac
INSERT INTO team_objectives (team_id, objective_key, title_es, description_es, objective_order) VALUES
(6, 'function1', 'Desarrollar sistema de comunicaciones', 'Implementar sistemas de comunicación eficientes para el vehículo.', 1),
(6, 'function2', 'Optimizar tracción', 'Diseñar y perfeccionar el sistema de tracción del vehículo solar.', 2),
(6, 'function3', 'Integrar tecnologías', 'Coordinar la integración de sistemas de comunicación y tracción.', 3);

-- Insert team objectives for Mechanics & Fairing
INSERT INTO team_objectives (team_id, objective_key, title_es, description_es, objective_order) VALUES
(7, 'function1', 'Diseñar estructura mecánica', 'Desarrollar la estructura mecánica robusta y liviana del vehículo.', 1),
(7, 'function2', 'Optimizar aerodinámica', 'Diseñar el carenado para minimizar la resistencia al aire.', 2),
(7, 'function3', 'Asegurar seguridad', 'Implementar sistemas de seguridad y protección para el conductor.', 3);

-- Insert sample publications
INSERT INTO publications (title, description, url, publication_date, author, publication_type, is_featured) VALUES
('Optimización de Celdas Solares para Vehículos', 'Investigación sobre la eficiencia energética en vehículos solares de competición.', 'https://example.com/publication1', '2023-06-15', 'Equipo Candelaria', 'research', true),
('Diseño Aerodinámico en Vehículos Solares', 'Estudio sobre la reducción de resistencia al aire en vehículos de competición solar.', 'https://example.com/publication2', '2023-08-20', 'Equipo de Mecánica', 'conference', false);

-- Insert website configuration
INSERT INTO website_config (config_key, config_value, description) VALUES
('project_description', 'Un proyecto estudiantil de vehículo solar enfocado en un futuro sostenible.', 'Descripción principal del proyecto'),
('contact_email', 'info@candelaria.uniandes.edu.co', 'Email de contacto principal'),
('social_instagram', '@candelaria_uandes', 'Usuario de Instagram'),
('social_linkedin', 'candelaria-uandes', 'Usuario de LinkedIn'),
('social_youtube', 'candelaria-uandes', 'Canal de YouTube'),
('sponsor_text', 'En este momento, el proyecto Candelaria solo ha sido patrocinado por la Universidad de los Andes y el esfuerzo de sus miembros.', 'Texto de patrocinio');