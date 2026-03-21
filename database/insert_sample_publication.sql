-- Insert one bilingual publication using existing member/team values.
-- Safe behavior: inserts only if at least one member exists.

WITH picked_author AS (
  SELECT m.id AS author_id, m.team_id
  FROM members m
  ORDER BY m.id
  LIMIT 1
)
INSERT INTO publications (
  title_en,
  title_es,
  content_en,
  content_es,
  publication_date,
  image_url,
  author_id,
  team_id,
  created_at,
  updated_at
)
SELECT
  'Telemetry Validation Run Completed',
  'Prueba de validacion de telemetria completada',
  'This sample publication validates that the frontend Publications page is reading data directly from PostgreSQL through the Django API.',
  'Esta publicacion de ejemplo valida que la pagina de Publicaciones del frontend lee datos directamente desde PostgreSQL a traves de la API de Django.',
  CURRENT_DATE,
  NULL,
  pa.author_id,
  pa.team_id,
  NOW(),
  NOW()
FROM picked_author pa;
