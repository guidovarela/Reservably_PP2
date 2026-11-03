-- Permitir que cliente y staff vean los perfiles de su contraparte en turnos
DROP POLICY IF EXISTS usuario_select_contraparte ON usuario;
CREATE POLICY usuario_select_contraparte ON usuario FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM turno t
    WHERE (t.id_cliente = auth.uid() AND t.id_staff = usuario.id)
       OR (t.id_staff = auth.uid() AND t.id_cliente = usuario.id)
  )
);