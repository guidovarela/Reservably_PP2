-- Ejecutar después de que Sofía se registre con sofia@demo.com
-- Primero obtené su UUID:
SELECT id FROM usuario WHERE email = 'sofia@demo.com';

-- Luego:
UPDATE usuario SET rol = 'staff' WHERE email = 'sofia@demo.com';

INSERT INTO staff (id_usuario, id_negocio, comision_porcentaje, descripcion)
SELECT id, '10000000-0000-0000-0000-000000000001', 45.00, 'Barbera y estilista.'
FROM usuario WHERE email = 'sofia@demo.com';

INSERT INTO staff_servicio (id_usuario, id_servicio)
SELECT u.id, s.id FROM usuario u, servicio s
WHERE u.email = 'sofia@demo.com'
  AND s.id IN ('20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002');

INSERT INTO horario_staff (id_usuario, dia_semana, hora_inicio, hora_fin)
SELECT u.id, d, '09:00'::time, '18:00'::time
FROM usuario u, generate_series(1, 5) AS d
WHERE u.email = 'sofia@demo.com';