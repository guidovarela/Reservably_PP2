flowchart TD
    %% Estilos para la notación Chen
    classDef entidad fill:#ffffff,stroke:#000000,stroke-width:2px;
    classDef relacion fill:#ffffff,stroke:#000000,stroke-width:2px;
    classDef atributo fill:#ffffff,stroke:#000000,stroke-width:1px;

    %% ================= ENTIDADES (Rectángulos) =================
    CLIENTE[Cliente]:::entidad
    BARBER[Staff / Barbero]:::entidad
    TURNO[Turno]:::entidad
    SERVICIO[Servicio]:::entidad
    NOTIF[Notificación]:::entidad

    %% ================= RELACIONES (Rombos) =================
    REL_REALIZA{Realiza}:::relacion
    REL_ATIENDE{Atiende}:::relacion
    REL_INCLUYE{Incluye}:::relacion
    REL_GENERA{Genera}:::relacion

    %% ================= ATRIBUTOS (Óvalos) =================
    %% Atributos de Cliente
    A_cli_id(["<u>id_cliente</u>"]):::atributo
    A_cli_nom([Nombre]):::atributo
    A_cli_ape([Apellido]):::atributo
    A_cli_tel([Teléfono]):::atributo
    A_cli_ema([Email]):::atributo
    
    CLIENTE --- A_cli_id
    CLIENTE --- A_cli_nom
    CLIENTE --- A_cli_ape
    CLIENTE --- A_cli_tel
    CLIENTE --- A_cli_ema

    %% Atributos de Staff / Barbero
    A_bar_id(["<u>id_barber</u>"]):::atributo
    A_bar_nom([Nombre]):::atributo
    A_bar_ape([Apellido]):::atributo
    A_bar_tel([Teléfono]):::atributo
    A_bar_com([Porc_Comisión]):::atributo
    
    BARBER --- A_bar_id
    BARBER --- A_bar_nom
    BARBER --- A_bar_ape
    BARBER --- A_bar_tel
    BARBER --- A_bar_com

    %% Atributos de Turno
    A_tur_id(["<u>id_turno</u>"]):::atributo
    A_tur_fec_ini([Fecha_Hora_Inicio]):::atributo
    A_tur_fec_fin([Fecha_Hora_Fin]):::atributo
    A_tur_est([Estado]):::atributo
    A_tur_mon([Monto_Total]):::atributo
    
    TURNO --- A_tur_id
    TURNO --- A_tur_fec_ini
    TURNO --- A_tur_fec_fin
    TURNO --- A_tur_est
    TURNO --- A_tur_mon

    %% Atributos de Servicio
    A_ser_id(["<u>id_servicio</u>"]):::atributo
    A_ser_nom([Nombre]):::atributo
    A_ser_des([Descripción]):::atributo
    A_ser_dur([Duración_Minutos]):::atributo
    A_ser_pre([Precio]):::atributo
    
    SERVICIO --- A_ser_id
    SERVICIO --- A_ser_nom
    SERVICIO --- A_ser_des
    SERVICIO --- A_ser_dur
    SERVICIO --- A_ser_pre

    %% Atributos de Notificación
    A_not_id(["<u>id_notificacion</u>"]):::atributo
    A_not_can([Tipo_Canal]):::atributo
    A_not_fec([Fecha_Envío]):::atributo
    A_not_est([Estado_Envío]):::atributo
    
    NOTIF --- A_not_id
    NOTIF --- A_not_can
    NOTIF --- A_not_fec
    NOTIF --- A_not_est

    %% ================= CONEXIONES Y CARDINALIDADES =================
    CLIENTE ---|1| REL_REALIZA
    REL_REALIZA ---|N| TURNO

    BARBER ---|1| REL_ATIENDE
    REL_ATIENDE ---|N| TURNO

    TURNO ---|M| REL_INCLUYE
    REL_INCLUYE ---|N| SERVICIO

    TURNO ---|1| REL_GENERA
    REL_GENERA ---|N| NOTIF
    