-- Reemplazá el UUID por el id real que te devuelve Supabase Auth (profiles.usuario)
INSERT INTO negocio (id, id_dueno, nombre, slug, descripcion, direccion, telefono) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'PEGAR_UUID_DEL_DUENO',
   'Barbería & Estética El Estilo', 'el-estilo',
   'Cortes clásicos y modernos, uñas y maquillaje profesional.',
   'Av. Corrientes 1234, CABA', '1145551000');

INSERT INTO configuracion (clave, valor) VALUES
  ('nombre_sistema','Barbería El Estilo'), ('tour_version','1'),
  ('email_contacto','hola@elestilo.com'), ('whatsapp','541100000000');

INSERT INTO servicio (id, id_negocio, nombre, categoria, precio, duracion_minutos, descripcion) VALUES
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Corte clásico','barberia', 8000, 30,'Corte tradicional.'),
  ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Corte + barba','barberia',12000, 45,'Corte + barba.'),
  ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','Uñas esculpidas','unas',   15000, 90,'Uñas en acrílico.'),
  ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Maquillaje social','maquillaje',18000, 60,'Para eventos.');