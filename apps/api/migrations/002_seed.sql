INSERT INTO initiatives (id, name, description)
SELECT '11111111-1111-1111-1111-111111111111',
       'Platform foundation',
       'Starter initiative for Goldiran workspace delivery.'
WHERE NOT EXISTS (SELECT 1 FROM initiatives);

INSERT INTO projects (id, initiative_id, name, description)
SELECT '22222222-2222-2222-2222-222222222222',
       '11111111-1111-1111-1111-111111111111',
       'Workspace starter',
       'Initial project used to verify local setup.'
WHERE NOT EXISTS (SELECT 1 FROM projects);

INSERT INTO issues (id, project_id, title, description, status)
SELECT '33333333-3333-3333-3333-333333333333',
       '22222222-2222-2222-2222-222222222222',
       'Confirm local development',
       'Open the dashboard after docker compose up and confirm seed data loads.',
       'open'
WHERE NOT EXISTS (SELECT 1 FROM issues);
