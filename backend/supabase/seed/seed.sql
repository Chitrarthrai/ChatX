-- ChatX Seed Data for Local Development

-- Sample Organization
INSERT INTO public.organizations (id, name, slug)
VALUES ('11111111-1111-1111-1111-111111111111', 'ChatX Global Corp', 'chatx-global')
ON CONFLICT DO NOTHING;

-- Sample Team
INSERT INTO public.teams (id, organization_id, name, description, is_private)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Engineering & Product',
    'Core platform development team',
    false
)
ON CONFLICT DO NOTHING;

-- Sample Channels
INSERT INTO public.channels (id, team_id, name, topic, type)
VALUES 
(
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'architecture-discussion',
    'High level system design and monorepo structure',
    'text'
),
(
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'frontend-design-system',
    'WCAG AA desaturated slate and indigo color system',
    'text'
)
ON CONFLICT DO NOTHING;
