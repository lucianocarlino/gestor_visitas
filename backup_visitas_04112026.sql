--
-- PostgreSQL database dump
--

\restrict 3ye1HNTnbUj5g8AOBt1D9lsmL4cEg5vbIr2aUYRXWwrauhEIPjnmA4XTkT9C6wO

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.visitas DROP CONSTRAINT IF EXISTS fk_visitas_empaque_id_empaques;
ALTER TABLE IF EXISTS ONLY public.visita_tecnicos DROP CONSTRAINT IF EXISTS fk_visita_tecnicos_visita_id_visitas;
ALTER TABLE IF EXISTS ONLY public.visita_tecnicos DROP CONSTRAINT IF EXISTS fk_visita_tecnicos_tecnico_id_tecnicos;
ALTER TABLE IF EXISTS ONLY public.servicios DROP CONSTRAINT IF EXISTS fk_servicios_tecnico_id_tecnicos;
ALTER TABLE IF EXISTS ONLY public.servicio_consumibles DROP CONSTRAINT IF EXISTS fk_servicio_consumibles_servicio_id_servicios;
ALTER TABLE IF EXISTS ONLY public.servicio_consumibles DROP CONSTRAINT IF EXISTS fk_servicio_consumibles_consumible_id_consumibles;
ALTER TABLE IF EXISTS ONLY public.reportes_sinclair DROP CONSTRAINT IF EXISTS fk_reportes_sinclair_visita_id_visitas;
ALTER TABLE IF EXISTS ONLY public.reporte_items DROP CONSTRAINT IF EXISTS fk_reporte_items_reporte_id_reportes_sinclair;
ALTER TABLE IF EXISTS ONLY public.reemplazos DROP CONSTRAINT IF EXISTS fk_reemplazos_tecnico_id_tecnicos;
ALTER TABLE IF EXISTS ONLY public.reemplazos DROP CONSTRAINT IF EXISTS fk_reemplazos_empaque_id_empaques;
ALTER TABLE IF EXISTS ONLY public.movimientos DROP CONSTRAINT IF EXISTS fk_movimientos_tecnico_id_tecnicos;
ALTER TABLE IF EXISTS ONLY public.frenos DROP CONSTRAINT IF EXISTS fk_frenos_empaque_id_empaques;
ALTER TABLE IF EXISTS ONLY public.frenos DROP CONSTRAINT IF EXISTS fk_freno_cabezal;
ALTER TABLE IF EXISTS ONLY public.caseteras DROP CONSTRAINT IF EXISTS fk_caseteras_empaque_id_empaques;
ALTER TABLE IF EXISTS ONLY public.cambios DROP CONSTRAINT IF EXISTS fk_cambios_tecnico_id_tecnicos;
ALTER TABLE IF EXISTS ONLY public.cambios DROP CONSTRAINT IF EXISTS fk_cambios_retirado_freno_id_frenos;
ALTER TABLE IF EXISTS ONLY public.cambios DROP CONSTRAINT IF EXISTS fk_cambios_instalado_freno_id_frenos;
ALTER TABLE IF EXISTS ONLY public.cambios DROP CONSTRAINT IF EXISTS fk_cambios_cabezal_id_cabezales;
ALTER TABLE IF EXISTS ONLY public.cabezales DROP CONSTRAINT IF EXISTS fk_cabezales_empaque_id_empaques;
ALTER TABLE IF EXISTS ONLY public.cabezales DROP CONSTRAINT IF EXISTS fk_cabezal_freno_actual;
ALTER TABLE IF EXISTS ONLY public.bancos DROP CONSTRAINT IF EXISTS fk_bancos_empaque_id_empaques;
DROP INDEX IF EXISTS public.ix_visitas_fecha;
DROP INDEX IF EXISTS public.ix_visitas_estado_sincronizacion;
DROP INDEX IF EXISTS public.ix_visitas_empaque_id;
DROP INDEX IF EXISTS public.ix_visita_tecnicos_visita_id;
DROP INDEX IF EXISTS public.ix_visita_tecnicos_tecnico_id;
DROP INDEX IF EXISTS public.ix_tecnicos_nombre;
DROP INDEX IF EXISTS public.ix_tecnicos_email;
DROP INDEX IF EXISTS public.ix_servicios_tecnico_id;
DROP INDEX IF EXISTS public.ix_servicios_machine_type;
DROP INDEX IF EXISTS public.ix_servicios_machine_id;
DROP INDEX IF EXISTS public.ix_servicios_fecha;
DROP INDEX IF EXISTS public.ix_servicio_consumibles_servicio_id;
DROP INDEX IF EXISTS public.ix_servicio_consumibles_consumible_id;
DROP INDEX IF EXISTS public.ix_reportes_sinclair_visita_id;
DROP INDEX IF EXISTS public.ix_reportes_sinclair_numero;
DROP INDEX IF EXISTS public.ix_reporte_items_reporte_id;
DROP INDEX IF EXISTS public.ix_reemplazos_tecnico_id;
DROP INDEX IF EXISTS public.ix_reemplazos_retirado_id;
DROP INDEX IF EXISTS public.ix_reemplazos_instalado_id;
DROP INDEX IF EXISTS public.ix_reemplazos_fecha;
DROP INDEX IF EXISTS public.ix_reemplazos_empaque_id;
DROP INDEX IF EXISTS public.ix_movimientos_tecnico_id;
DROP INDEX IF EXISTS public.ix_movimientos_machine_type;
DROP INDEX IF EXISTS public.ix_movimientos_machine_id;
DROP INDEX IF EXISTS public.ix_movimientos_fecha;
DROP INDEX IF EXISTS public.ix_frenos_ubicacion;
DROP INDEX IF EXISTS public.ix_frenos_estado;
DROP INDEX IF EXISTS public.ix_frenos_empaque_id;
DROP INDEX IF EXISTS public.ix_frenos_cabezal_id;
DROP INDEX IF EXISTS public.ix_empaques_nombre;
DROP INDEX IF EXISTS public.ix_consumibles_nombre;
DROP INDEX IF EXISTS public.ix_consumibles_es_critico;
DROP INDEX IF EXISTS public.ix_caseteras_ubicacion;
DROP INDEX IF EXISTS public.ix_caseteras_estado;
DROP INDEX IF EXISTS public.ix_caseteras_empaque_id;
DROP INDEX IF EXISTS public.ix_cambios_tecnico_id;
DROP INDEX IF EXISTS public.ix_cambios_retirado_freno_id;
DROP INDEX IF EXISTS public.ix_cambios_instalado_freno_id;
DROP INDEX IF EXISTS public.ix_cambios_fecha;
DROP INDEX IF EXISTS public.ix_cambios_cabezal_id;
DROP INDEX IF EXISTS public.ix_cabezales_ubicacion;
DROP INDEX IF EXISTS public.ix_cabezales_estado;
DROP INDEX IF EXISTS public.ix_cabezales_empaque_id;
DROP INDEX IF EXISTS public.ix_bancos_empaque_id;
DROP INDEX IF EXISTS public.ix_audit_entries_user_id;
DROP INDEX IF EXISTS public.ix_audit_entries_timestamp;
DROP INDEX IF EXISTS public.ix_audit_entries_target_id;
DROP INDEX IF EXISTS public.ix_audit_entries_category;
DROP INDEX IF EXISTS public.ix_audit_entries_action;
ALTER TABLE IF EXISTS ONLY public.visita_tecnicos DROP CONSTRAINT IF EXISTS uq_visita_tecnicos_visita_id;
ALTER TABLE IF EXISTS ONLY public.servicio_consumibles DROP CONSTRAINT IF EXISTS uq_servicio_consumibles_servicio_id;
ALTER TABLE IF EXISTS ONLY public.reporte_items DROP CONSTRAINT IF EXISTS uq_reporte_items_reporte_id;
ALTER TABLE IF EXISTS ONLY public.visitas DROP CONSTRAINT IF EXISTS pk_visitas;
ALTER TABLE IF EXISTS ONLY public.visita_tecnicos DROP CONSTRAINT IF EXISTS pk_visita_tecnicos;
ALTER TABLE IF EXISTS ONLY public.tecnicos DROP CONSTRAINT IF EXISTS pk_tecnicos;
ALTER TABLE IF EXISTS ONLY public.servicios DROP CONSTRAINT IF EXISTS pk_servicios;
ALTER TABLE IF EXISTS ONLY public.servicio_consumibles DROP CONSTRAINT IF EXISTS pk_servicio_consumibles;
ALTER TABLE IF EXISTS ONLY public.reportes_sinclair DROP CONSTRAINT IF EXISTS pk_reportes_sinclair;
ALTER TABLE IF EXISTS ONLY public.reporte_items DROP CONSTRAINT IF EXISTS pk_reporte_items;
ALTER TABLE IF EXISTS ONLY public.reemplazos DROP CONSTRAINT IF EXISTS pk_reemplazos;
ALTER TABLE IF EXISTS ONLY public.movimientos DROP CONSTRAINT IF EXISTS pk_movimientos;
ALTER TABLE IF EXISTS ONLY public.frenos DROP CONSTRAINT IF EXISTS pk_frenos;
ALTER TABLE IF EXISTS ONLY public.empaques DROP CONSTRAINT IF EXISTS pk_empaques;
ALTER TABLE IF EXISTS ONLY public.consumibles DROP CONSTRAINT IF EXISTS pk_consumibles;
ALTER TABLE IF EXISTS ONLY public.caseteras DROP CONSTRAINT IF EXISTS pk_caseteras;
ALTER TABLE IF EXISTS ONLY public.cambios DROP CONSTRAINT IF EXISTS pk_cambios;
ALTER TABLE IF EXISTS ONLY public.cabezales DROP CONSTRAINT IF EXISTS pk_cabezales;
ALTER TABLE IF EXISTS ONLY public.bancos DROP CONSTRAINT IF EXISTS pk_bancos;
ALTER TABLE IF EXISTS ONLY public.audit_entries DROP CONSTRAINT IF EXISTS pk_audit_entries;
ALTER TABLE IF EXISTS ONLY public.alembic_version DROP CONSTRAINT IF EXISTS alembic_version_pkc;
ALTER TABLE IF EXISTS public.visita_tecnicos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.servicio_consumibles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reporte_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.caseteras ALTER COLUMN numero DROP DEFAULT;
DROP TABLE IF EXISTS public.visitas;
DROP SEQUENCE IF EXISTS public.visita_tecnicos_id_seq;
DROP TABLE IF EXISTS public.visita_tecnicos;
DROP TABLE IF EXISTS public.tecnicos;
DROP TABLE IF EXISTS public.servicios;
DROP SEQUENCE IF EXISTS public.servicio_consumibles_id_seq;
DROP TABLE IF EXISTS public.servicio_consumibles;
DROP TABLE IF EXISTS public.reportes_sinclair;
DROP SEQUENCE IF EXISTS public.reporte_items_id_seq;
DROP TABLE IF EXISTS public.reporte_items;
DROP TABLE IF EXISTS public.reemplazos;
DROP TABLE IF EXISTS public.movimientos;
DROP TABLE IF EXISTS public.frenos;
DROP TABLE IF EXISTS public.empaques;
DROP TABLE IF EXISTS public.consumibles;
DROP SEQUENCE IF EXISTS public.caseteras_numero_seq;
DROP TABLE IF EXISTS public.caseteras;
DROP TABLE IF EXISTS public.cambios;
DROP TABLE IF EXISTS public.cabezales;
DROP TABLE IF EXISTS public.bancos;
DROP TABLE IF EXISTS public.audit_entries;
DROP TABLE IF EXISTS public.alembic_version;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: audit_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_entries (
    id character varying(36) NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    user_id character varying(36) NOT NULL,
    user_name character varying(150) NOT NULL,
    user_role character varying(20),
    category character varying(30) NOT NULL,
    action character varying(30) NOT NULL,
    target_id character varying(80) NOT NULL,
    target_name character varying(150) NOT NULL,
    details text NOT NULL,
    previous_value text,
    new_value text,
    metadata_json json
);


ALTER TABLE public.audit_entries OWNER TO postgres;

--
-- Name: bancos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bancos (
    id character varying(36) NOT NULL,
    empaque_id character varying(36) NOT NULL,
    fecha_instalacion date NOT NULL,
    lineas integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bancos OWNER TO postgres;

--
-- Name: cabezales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cabezales (
    id character varying(80) NOT NULL,
    estado character varying(30) NOT NULL,
    ubicacion character varying(255) NOT NULL,
    empaque_id character varying(36),
    freno_actual_id character varying(80),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cabezales OWNER TO postgres;

--
-- Name: cambios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cambios (
    id character varying(36) NOT NULL,
    fecha timestamp with time zone NOT NULL,
    motivo character varying(500) NOT NULL,
    lugar character varying(255) NOT NULL,
    retirado_freno_id character varying(80),
    instalado_freno_id character varying(80) NOT NULL,
    cabezal_id character varying(80) NOT NULL,
    tecnico_id character varying(36),
    tecnico_nombre character varying(150),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cambios OWNER TO postgres;

--
-- Name: caseteras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caseteras (
    numero integer NOT NULL,
    estado character varying(30) NOT NULL,
    ubicacion character varying(255) NOT NULL,
    empaque_id character varying(36),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.caseteras OWNER TO postgres;

--
-- Name: caseteras_numero_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caseteras_numero_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caseteras_numero_seq OWNER TO postgres;

--
-- Name: caseteras_numero_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caseteras_numero_seq OWNED BY public.caseteras.numero;


--
-- Name: consumibles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumibles (
    id character varying(36) NOT NULL,
    nombre character varying(150) NOT NULL,
    stock integer NOT NULL,
    es_critico boolean NOT NULL,
    stock_minimo integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_consumibles_minimum_stock_non_negative CHECK ((stock_minimo >= 0)),
    CONSTRAINT ck_consumibles_stock_non_negative CHECK ((stock >= 0))
);


ALTER TABLE public.consumibles OWNER TO postgres;

--
-- Name: empaques; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empaques (
    id character varying(36) NOT NULL,
    nombre character varying(150) NOT NULL,
    ubicacion character varying(255) NOT NULL,
    latitud double precision NOT NULL,
    longitud double precision NOT NULL,
    servicio boolean NOT NULL,
    distancia double precision NOT NULL,
    ultima_visita timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.empaques OWNER TO postgres;

--
-- Name: frenos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frenos (
    id character varying(80) NOT NULL,
    fecha_inicio date NOT NULL,
    estado character varying(30) NOT NULL,
    cabezal_id character varying(80),
    ubicacion character varying(255) NOT NULL,
    empaque_id character varying(36),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.frenos OWNER TO postgres;

--
-- Name: movimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos (
    id character varying(36) NOT NULL,
    machine_id character varying(80) NOT NULL,
    machine_type character varying(20) NOT NULL,
    fecha timestamp with time zone NOT NULL,
    tecnico_id character varying(36),
    tecnico_nombre character varying(150) NOT NULL,
    motivo character varying(500) NOT NULL,
    origen character varying(255) NOT NULL,
    destino character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.movimientos OWNER TO postgres;

--
-- Name: reemplazos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reemplazos (
    id character varying(36) NOT NULL,
    fecha timestamp with time zone NOT NULL,
    motivo character varying(500) NOT NULL,
    retirado_id character varying(80),
    retirado_tipo character varying(20),
    instalado_id character varying(80) NOT NULL,
    instalado_tipo character varying(20) NOT NULL,
    empaque_id character varying(36) NOT NULL,
    empaque_nombre character varying(150) NOT NULL,
    tecnico_id character varying(36),
    tecnico_nombre character varying(150),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reemplazos OWNER TO postgres;

--
-- Name: reporte_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reporte_items (
    id integer NOT NULL,
    reporte_id character varying(36) NOT NULL,
    orden integer NOT NULL,
    codigo_res character varying(50) NOT NULL,
    numero_partes character varying(100) NOT NULL,
    cantidad character varying(100) NOT NULL,
    otras_acciones text NOT NULL,
    pct_etiquetado_esperado double precision NOT NULL,
    pct_etiquetado_real double precision NOT NULL,
    tiempo_servicio double precision NOT NULL,
    numero_de_serie character varying(50) NOT NULL,
    codigo_motivo character varying(50) NOT NULL,
    codigo_origen character varying(50) NOT NULL
);


ALTER TABLE public.reporte_items OWNER TO postgres;

--
-- Name: reporte_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reporte_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reporte_items_id_seq OWNER TO postgres;

--
-- Name: reporte_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reporte_items_id_seq OWNED BY public.reporte_items.id;


--
-- Name: reportes_sinclair; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reportes_sinclair (
    id character varying(36) NOT NULL,
    visita_id character varying(36) NOT NULL,
    numero character varying(30) NOT NULL,
    codigo_motivo character varying(50) NOT NULL,
    codigo_origen character varying(50) NOT NULL,
    codigo_tipo_servicio character varying(50) NOT NULL,
    hora_inicio timestamp with time zone NOT NULL,
    hora_fin timestamp with time zone NOT NULL,
    fuera_de_hora boolean NOT NULL,
    comentarios text NOT NULL,
    firma_cliente text,
    nombre_cliente character varying(150) NOT NULL,
    hora_llamada timestamp with time zone NOT NULL,
    produccion_etiquetada character varying(255),
    condicion_fruta character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reportes_sinclair OWNER TO postgres;

--
-- Name: servicio_consumibles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio_consumibles (
    id integer NOT NULL,
    servicio_id character varying(36) NOT NULL,
    consumible_id character varying(36) NOT NULL,
    nombre character varying(150) NOT NULL,
    cantidad integer NOT NULL
);


ALTER TABLE public.servicio_consumibles OWNER TO postgres;

--
-- Name: servicio_consumibles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servicio_consumibles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servicio_consumibles_id_seq OWNER TO postgres;

--
-- Name: servicio_consumibles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servicio_consumibles_id_seq OWNED BY public.servicio_consumibles.id;


--
-- Name: servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicios (
    id character varying(36) NOT NULL,
    machine_id character varying(80) NOT NULL,
    machine_type character varying(20) NOT NULL,
    fecha timestamp with time zone NOT NULL,
    resumen character varying(500) NOT NULL,
    trabajo_hecho text NOT NULL,
    tecnico_id character varying(36),
    tecnico_nombre character varying(150),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.servicios OWNER TO postgres;

--
-- Name: tecnicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tecnicos (
    id character varying(36) NOT NULL,
    nombre character varying(150) NOT NULL,
    ultima_conexion timestamp with time zone,
    estado character varying(30) NOT NULL,
    cumpleanos date,
    rol character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tecnicos OWNER TO postgres;

--
-- Name: visita_tecnicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visita_tecnicos (
    id integer NOT NULL,
    visita_id character varying(36) NOT NULL,
    tecnico_id character varying(36) NOT NULL
);


ALTER TABLE public.visita_tecnicos OWNER TO postgres;

--
-- Name: visita_tecnicos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visita_tecnicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visita_tecnicos_id_seq OWNER TO postgres;

--
-- Name: visita_tecnicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visita_tecnicos_id_seq OWNED BY public.visita_tecnicos.id;


--
-- Name: visitas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitas (
    id character varying(36) NOT NULL,
    fecha timestamp with time zone NOT NULL,
    motivo character varying(500) NOT NULL,
    solicitado_por character varying(150) NOT NULL,
    vehiculo character varying(30) NOT NULL,
    empaque_id character varying(36) NOT NULL,
    estado_sincronizacion character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.visitas OWNER TO postgres;

--
-- Name: caseteras numero; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caseteras ALTER COLUMN numero SET DEFAULT nextval('public.caseteras_numero_seq'::regclass);


--
-- Name: reporte_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_items ALTER COLUMN id SET DEFAULT nextval('public.reporte_items_id_seq'::regclass);


--
-- Name: servicio_consumibles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_consumibles ALTER COLUMN id SET DEFAULT nextval('public.servicio_consumibles_id_seq'::regclass);


--
-- Name: visita_tecnicos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnicos ALTER COLUMN id SET DEFAULT nextval('public.visita_tecnicos_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
513fb6b5d360
\.


--
-- Data for Name: audit_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_entries (id, "timestamp", user_id, user_name, user_role, category, action, target_id, target_name, details, previous_value, new_value, metadata_json) FROM stdin;
\.


--
-- Data for Name: bancos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bancos (id, empaque_id, fecha_instalacion, lineas, created_at, updated_at) FROM stdin;
W6558	d8f0559c-368a-4708-88e7-641f9f2d6a9b	2026-09-04	6	2026-09-04 15:11:10.101791+00	2026-09-04 15:11:10.101791+00
W6214	42fb66e5-18ee-4050-9367-601ec04f106c	2026-09-07	4	2026-09-08 15:15:42.548808+00	2026-09-08 15:15:42.548808+00
W6215	42fb66e5-18ee-4050-9367-601ec04f106c	2026-09-08	4	2026-09-08 15:15:42.548808+00	2026-09-08 15:15:42.548808+00
W6216	42fb66e5-18ee-4050-9367-601ec04f106c	2026-09-08	4	2026-09-08 15:15:42.548808+00	2026-09-08 15:15:42.548808+00
W6217	42fb66e5-18ee-4050-9367-601ec04f106c	2026-09-08	4	2026-09-08 15:15:42.548808+00	2026-09-08 15:15:42.548808+00
W5191	07e719bc-c35b-44a1-83e6-f05dcd3945ef	2026-09-07	4	2026-09-08 15:15:58.793047+00	2026-09-08 15:15:58.793047+00
W6556	986568df-d15d-4088-99d1-afe35fc96781	2026-09-07	4	2026-09-08 15:16:39.377202+00	2026-09-08 15:16:39.377202+00
W6557	986568df-d15d-4088-99d1-afe35fc96781	2026-09-08	4	2026-09-08 15:16:39.377202+00	2026-09-08 15:16:39.377202+00
W6866	0b1a067a-089a-4d77-9b0f-645f0abc558d	2026-09-08	4	2026-09-08 15:19:01.486357+00	2026-09-08 15:19:01.486357+00
W6857	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-09-07	4	2026-09-08 15:19:14.691297+00	2026-09-08 15:19:14.691297+00
W6035	f29c6868-1ae5-4c87-a989-71a8622cea7f	2026-09-04	6	2026-09-04 15:08:56.874771+00	2026-09-08 15:19:44.400185+00
Prueba	16a5e97a-f241-4ca8-ac67-1c51f8494a77	2026-09-04	1	2026-09-04 15:32:13.292821+00	2026-09-07 14:07:02.440937+00
W6743	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-09-07	4	2026-09-08 13:54:58.881674+00	2026-09-08 13:54:58.881674+00
W6744	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-09-08	4	2026-09-08 13:54:58.881674+00	2026-09-08 13:54:58.881674+00
W6858	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-09-08	4	2026-09-08 13:54:58.881674+00	2026-09-08 13:54:58.881674+00
W6859	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-09-08	4	2026-09-08 13:54:58.881674+00	2026-09-08 13:54:58.881674+00
W6823	ff7ac394-9910-43d9-8e25-bbd6c8e4564e	2026-09-07	4	2026-09-08 13:55:32.876705+00	2026-09-08 13:55:32.876705+00
W6040	ff7ac394-9910-43d9-8e25-bbd6c8e4564e	2026-09-08	4	2026-09-08 13:55:32.876705+00	2026-09-08 13:55:32.876705+00
W6384	bab5af71-a776-42e4-ba2a-a51651df4eb1	2026-09-07	4	2026-09-08 13:55:57.453201+00	2026-09-08 13:55:57.453201+00
W6385	bab5af71-a776-42e4-ba2a-a51651df4eb1	2026-09-08	4	2026-09-08 13:55:57.453201+00	2026-09-08 13:55:57.453201+00
W6864	7d97df2c-55da-4945-b9b8-b91f9f49228d	2026-09-07	4	2026-09-08 13:56:20.272289+00	2026-09-08 13:56:28.385342+00
W6865	7d97df2c-55da-4945-b9b8-b91f9f49228d	2026-09-08	4	2026-09-08 13:56:28.385342+00	2026-09-08 13:56:28.385342+00
W6742	d0530be7-f3db-45fd-931e-c450089df5e6	2026-09-07	4	2026-09-08 13:57:02.586777+00	2026-09-08 13:57:02.586777+00
W6257	7cdd90f5-4970-4675-ab23-64d4975e5856	2026-09-07	4	2026-09-08 13:58:41.526233+00	2026-09-08 13:58:41.526233+00
W6258	7cdd90f5-4970-4675-ab23-64d4975e5856	2026-09-08	4	2026-09-08 13:58:41.526233+00	2026-09-08 13:58:41.526233+00
W6546	2b2372ce-06a8-4007-bc3b-11308ba65ad6	2026-09-07	4	2026-09-08 13:59:03.537117+00	2026-09-08 13:59:03.537117+00
W6867	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-09-07	4	2026-09-08 13:59:42.134011+00	2026-09-08 13:59:42.134011+00
W6868	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-09-08	4	2026-09-08 13:59:42.134011+00	2026-09-08 13:59:42.134011+00
W6812	118366b0-c7ca-43dd-9cec-b819737852e5	2026-09-07	4	2026-09-08 15:09:45.184316+00	2026-09-08 15:09:45.184316+00
W6054	47da4749-cfe4-495a-a397-72a70f3422de	2026-09-07	2	2026-09-08 15:10:15.443801+00	2026-09-08 15:10:15.443801+00
W6055	47da4749-cfe4-495a-a397-72a70f3422de	2026-09-08	2	2026-09-08 15:10:15.443801+00	2026-09-08 15:10:15.443801+00
W6815	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-09-07	4	2026-09-08 15:10:34.819445+00	2026-09-08 15:10:34.819445+00
W6816	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-09-08	4	2026-09-08 15:10:34.819445+00	2026-09-08 15:10:34.819445+00
W6745	f2e426b6-22eb-4eac-9617-18767a747566	2026-09-08	4	2026-09-08 15:12:00.860346+00	2026-09-08 15:12:00.860346+00
W6211	28425ea3-0c86-4033-aa74-50d8b87a1381	2026-09-08	4	2026-09-08 15:13:18.982885+00	2026-09-08 15:13:18.982885+00
W6212	28425ea3-0c86-4033-aa74-50d8b87a1381	2026-09-08	4	2026-09-08 15:13:18.982885+00	2026-09-08 15:13:18.982885+00
W6723	c2d54c37-eac3-44a4-8ba5-a0343f938f8e	2026-09-07	4	2026-09-08 15:13:46.220232+00	2026-09-08 15:14:26.236855+00
W6724	c2d54c37-eac3-44a4-8ba5-a0343f938f8e	2026-09-08	4	2026-09-08 15:14:26.236855+00	2026-09-08 15:14:26.236855+00
W6198	c2d54c37-eac3-44a4-8ba5-a0343f938f8e	2026-09-08	4	2026-09-08 15:14:26.236855+00	2026-09-08 15:14:26.236855+00
W6199	c2d54c37-eac3-44a4-8ba5-a0343f938f8e	2026-09-08	4	2026-09-08 15:14:26.236855+00	2026-09-08 15:14:26.236855+00
W6039	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-09-07	4	2026-09-08 15:19:58.94358+00	2026-09-08 15:20:47.615994+00
W6718	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-09-08	4	2026-09-08 15:20:47.615994+00	2026-09-08 15:20:47.615994+00
\.


--
-- Data for Name: cabezales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cabezales (id, estado, ubicacion, empaque_id, freno_actual_id, created_at, updated_at) FROM stdin;
14044	En uso	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	\N	2026-10-02 11:09:14.701834+00	2026-10-02 11:09:14.701834+00
20685	En uso	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	\N	2026-10-02 11:09:30.206044+00	2026-10-02 11:09:30.206044+00
3961	En uso	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	\N	2026-10-02 11:09:43.69528+00	2026-10-02 11:09:43.69528+00
22155	En uso	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	\N	2026-10-02 11:09:59.916581+00	2026-10-02 11:09:59.916581+00
24658	En uso	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	\N	2026-10-02 11:10:22.652491+00	2026-10-02 11:10:22.652491+00
23120	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	100818	2026-09-08 16:17:03.432423+00	2026-10-02 15:50:21.325997+00
6791	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	\N	2026-09-09 12:28:43.091777+00	2026-10-02 15:50:43.436651+00
15859	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	\N	2026-09-09 12:28:19.807189+00	2026-10-02 15:51:02.210981+00
23083	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	\N	2026-09-08 16:43:29.553069+00	2026-10-02 15:51:11.202741+00
22121	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	22296	2026-09-08 16:30:02.696703+00	2026-10-02 15:51:18.62597+00
22112	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	\N	2026-09-08 16:43:51.318762+00	2026-10-02 15:51:25.769782+00
12989	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	\N	2026-09-08 16:43:06.191433+00	2026-10-02 15:51:32.726108+00
15899	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	\N	2026-09-09 12:27:38.34331+00	2026-10-02 15:51:46.164133+00
Rfo152	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	\N	2026-09-08 16:42:27.377611+00	2026-10-02 15:51:51.851162+00
9315	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	\N	2026-09-09 11:51:51.532171+00	2026-10-02 15:51:58.859336+00
6631	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	\N	2026-09-09 12:27:53.146599+00	2026-10-02 15:52:04.794947+00
20687	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	101117	2026-09-08 16:28:08.05073+00	2026-10-02 15:52:16.220703+00
9230	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	9497	2026-09-08 16:24:43.546964+00	2026-10-02 15:52:22.507724+00
13336	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	\N	2026-09-09 11:52:29.356865+00	2026-10-02 15:52:27.525426+00
8974	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	121818	2026-09-08 16:39:47.015075+00	2026-10-02 15:52:32.291866+00
19841	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	\N	2026-10-21 10:23:12.924629+00	2026-10-21 10:23:12.924629+00
23434	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	\N	2026-10-21 10:23:53.653305+00	2026-10-21 10:23:53.653305+00
2173	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	\N	2026-10-21 10:24:05.090915+00	2026-10-21 10:24:05.090915+00
11609	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	\N	2026-10-21 10:24:16.439647+00	2026-10-21 10:24:16.439647+00
22084	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	\N	2026-10-21 10:24:25.56225+00	2026-10-21 10:24:25.56225+00
21390	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	\N	2026-10-21 10:24:34.517233+00	2026-10-21 10:24:34.517233+00
22629	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	\N	2026-10-21 10:24:45.577352+00	2026-10-21 10:24:45.577352+00
20692	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	\N	2026-10-21 10:24:56.709108+00	2026-10-21 10:24:56.709108+00
21350	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:28:57.627382+00	2026-10-21 10:28:57.627382+00
22666	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:29:12.828272+00	2026-10-21 10:29:12.828272+00
31345	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:29:24.101594+00	2026-10-21 10:29:24.101594+00
20747	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:29:42.168497+00	2026-10-21 10:29:42.168497+00
10972	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:29:57.345378+00	2026-10-21 10:29:57.345378+00
21348	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:30:09.959257+00	2026-10-21 10:30:09.959257+00
15840	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:30:23.629958+00	2026-10-21 10:30:23.629958+00
23629	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:30:40.078279+00	2026-10-21 10:30:40.078279+00
21105	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	\N	2026-10-22 10:49:42.134127+00	2026-10-22 10:49:42.134127+00
12945	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	\N	2026-10-22 10:55:08.550688+00	2026-10-22 10:55:08.550688+00
3212	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	\N	2026-10-22 10:55:30.174793+00	2026-10-22 10:55:30.174793+00
13937	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	\N	2026-10-22 10:55:46.526258+00	2026-10-22 10:55:46.526258+00
20889	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	\N	2026-10-22 10:56:06.433119+00	2026-10-22 10:56:06.433119+00
6031	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:50:32.203157+00	2026-10-22 12:50:32.203157+00
6070	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:50:54.330815+00	2026-10-22 12:50:54.330815+00
3733	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:51:08.000797+00	2026-10-22 12:51:08.000797+00
22688	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:51:21.155388+00	2026-10-22 12:51:21.155388+00
0834	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:51:31.901418+00	2026-10-22 12:51:31.901418+00
23261	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:51:46.835252+00	2026-10-22 12:51:46.835252+00
3201	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:51:56.703335+00	2026-10-22 12:51:56.703335+00
21397	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:52:18.984303+00	2026-10-22 12:52:18.984303+00
22618	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:52:30.101831+00	2026-10-22 12:52:30.101831+00
20936	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:52:44.372748+00	2026-10-22 12:52:44.372748+00
19824	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:52:57.180372+00	2026-10-22 12:52:57.180372+00
9054	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:53:09.387555+00	2026-10-22 12:53:09.387555+00
12110	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:53:58.589736+00	2026-10-22 12:53:58.589736+00
7824	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:54:12.00595+00	2026-10-22 12:54:12.00595+00
24739	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:54:25.863102+00	2026-10-22 12:54:25.863102+00
23407	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:54:38.013751+00	2026-10-22 12:54:38.013751+00
11314	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:54:49.948516+00	2026-10-22 12:54:49.948516+00
20739	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	\N	2026-10-22 12:55:02.363084+00	2026-10-22 12:55:02.363084+00
2455	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	\N	2026-10-21 10:28:42.740424+00	2026-10-26 16:10:10.614495+00
20148	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:35:15.578759+00	2026-11-04 10:35:15.578759+00
9360	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	\N	2026-10-02 14:01:41.420836+00	2026-10-22 13:11:32.494168+00
21339	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:32:51.127081+00	2026-11-04 10:32:51.127081+00
21389	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:33:16.350674+00	2026-11-04 10:33:16.350674+00
22136	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:33:32.78968+00	2026-11-04 10:33:32.78968+00
19847	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:33:48.177899+00	2026-11-04 10:33:48.177899+00
24618	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:34:08.432338+00	2026-11-04 10:34:08.432338+00
23013	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:34:27.0921+00	2026-11-04 10:34:27.0921+00
21398	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:34:48.292807+00	2026-11-04 10:34:48.292807+00
20300	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:35:00.790765+00	2026-11-04 10:35:00.790765+00
22681	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	\N	2026-11-04 10:35:31.775324+00	2026-11-04 10:35:31.775324+00
\.


--
-- Data for Name: cambios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cambios (id, fecha, motivo, lugar, retirado_freno_id, instalado_freno_id, cabezal_id, tecnico_id, tecnico_nombre, created_at, updated_at) FROM stdin;
3d2b659e-8509-440e-a5b0-5d3bada44292	2026-09-08 00:00:00+00	Postemporada	Taller	\N	100818	23120	c3505342-0c03-47ee-ae7a-b316b10d477a	Emmanuel Claudio	2026-09-08 16:23:21.100256+00	2026-09-08 16:23:21.100256+00
c5c10561-c4c1-449a-a029-2e7811476d1f	2026-09-08 00:00:00+00	Postemporada 	Taller	\N	9497	9230	c3505342-0c03-47ee-ae7a-b316b10d477a	Emmanuel Claudio	2026-09-08 16:27:08.82272+00	2026-09-08 16:27:08.82272+00
c5b4c406-37df-44bf-b1ff-45fe0b82bcf3	2026-09-08 00:00:00+00	Postemporada 	Taller	\N	101117	20687	c3505342-0c03-47ee-ae7a-b316b10d477a	Emmanuel Claudio	2026-09-08 16:29:32.054842+00	2026-09-08 16:29:32.054842+00
27571a8a-0ad6-4751-bc56-43a365c54ec6	2026-09-08 00:00:00+00	Postemporada 	Taller	\N	22296	22121	c3505342-0c03-47ee-ae7a-b316b10d477a	Emmanuel Claudio	2026-09-08 16:30:57.747713+00	2026-09-08 16:30:57.747713+00
f61232ac-ef66-41ed-8adb-6b0b6f122856	2026-09-08 00:00:00+00	Postemporada 	Taller	\N	121818	8974	c3505342-0c03-47ee-ae7a-b316b10d477a	Emmanuel Claudio	2026-09-08 16:41:35.527629+00	2026-09-08 16:41:35.527629+00
\.


--
-- Data for Name: caseteras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caseteras (numero, estado, ubicacion, empaque_id, created_at, updated_at) FROM stdin;
8	Listo	Taller	16a5e97a-f241-4ca8-ac67-1c51f8494a77	2026-09-09 14:00:31.573007+00	2026-09-09 14:00:31.573007+00
16	Listo	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	2026-10-02 11:11:00.2759+00	2026-10-02 11:11:00.2759+00
170	Listo	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	2026-10-02 11:11:10.89219+00	2026-10-02 11:11:10.89219+00
3	Listo	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	2026-10-02 11:11:18.635622+00	2026-10-02 11:11:18.635622+00
238	Listo	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	2026-10-02 11:11:27.581189+00	2026-10-02 11:11:27.581189+00
50	Listo	Biotuc	2b2372ce-06a8-4007-bc3b-11308ba65ad6	2026-10-02 11:11:36.924458+00	2026-10-02 11:11:36.924458+00
58	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	2026-10-02 16:01:01.307897+00	2026-10-02 16:01:01.307897+00
49	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	2026-10-02 16:01:09.668271+00	2026-10-02 16:01:09.668271+00
14	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	2026-10-02 16:01:15.179096+00	2026-10-02 16:01:15.179096+00
31	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	2026-10-02 16:01:19.540727+00	2026-10-02 16:01:19.540727+00
7	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	2026-10-02 16:01:23.470541+00	2026-10-02 16:01:23.470541+00
125	En uso	Albor	d8f0559c-368a-4708-88e7-641f9f2d6a9b	2026-10-02 16:04:02.723111+00	2026-10-02 16:04:02.723111+00
179	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-10-02 16:15:30.511563+00	2026-10-02 16:15:30.511563+00
256	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-10-02 16:15:35.390834+00	2026-10-02 16:15:35.390834+00
168	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-10-02 16:15:41.230741+00	2026-10-02 16:15:41.230741+00
53	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-10-02 16:15:45.486872+00	2026-10-02 16:15:45.486872+00
222	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-10-02 16:15:49.049336+00	2026-10-02 16:15:49.049336+00
40	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-10-02 16:15:53.012643+00	2026-10-02 16:15:53.012643+00
193	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-10-02 16:15:57.770701+00	2026-10-02 16:15:57.770701+00
171	En uso	Ledesma	50ed0ae7-2e04-4605-a450-1447404eaaf0	2026-10-02 16:16:01.635792+00	2026-10-02 16:16:01.635792+00
241	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:32:37.221522+00	2026-10-21 10:32:37.221522+00
83	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:32:46.780373+00	2026-10-21 10:32:46.780373+00
147	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:32:55.542886+00	2026-10-21 10:32:55.542886+00
121	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:33:03.988255+00	2026-10-21 10:33:03.988255+00
145	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:33:12.759038+00	2026-10-21 10:33:12.759038+00
67	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:33:28.358579+00	2026-10-21 10:33:28.358579+00
15	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:33:36.593395+00	2026-10-21 10:33:36.593395+00
257	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:33:47.167684+00	2026-10-21 10:33:47.167684+00
85	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:33:56.614337+00	2026-10-21 10:33:56.614337+00
1000	En uso	Citrusfranco	84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	2026-10-21 10:34:18.476012+00	2026-10-21 10:34:18.476012+00
34	En uso	Citrusfranco	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:34:43.986926+00	2026-10-21 10:34:43.986926+00
47	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:34:51.595631+00	2026-10-21 10:34:51.595631+00
51	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:35:17.153378+00	2026-10-21 10:35:17.153378+00
44	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:35:24.789944+00	2026-10-21 10:35:24.789944+00
68	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:35:36.36143+00	2026-10-21 10:35:36.36143+00
120	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:35:43.115986+00	2026-10-21 10:35:43.115986+00
123	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:35:53.821271+00	2026-10-21 10:35:53.821271+00
166	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:36:01.958315+00	2026-10-21 10:36:01.958315+00
43	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:36:14.059321+00	2026-10-21 10:36:14.059321+00
146	En uso	Vicente trapani	d7b0b703-f1cf-4339-9744-d1961db8963d	2026-10-21 10:36:21.195577+00	2026-10-21 10:36:21.195577+00
82	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	2026-10-22 10:56:46.512011+00	2026-10-22 10:56:46.512011+00
73	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	2026-10-22 10:57:10.245398+00	2026-10-22 10:57:10.245398+00
37	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	2026-10-22 10:57:24.276884+00	2026-10-22 10:57:24.276884+00
79	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	2026-10-22 10:57:42.625065+00	2026-10-22 10:57:42.625065+00
84	En uso	La toma	0b1a067a-089a-4d77-9b0f-645f0abc558d	2026-10-22 10:57:53.644517+00	2026-10-22 10:57:53.644517+00
66	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:18:20.278797+00	2026-10-22 15:18:20.278797+00
64	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:18:39.301637+00	2026-10-22 15:18:39.301637+00
36	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:18:50.129308+00	2026-10-22 15:18:50.129308+00
226	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:18:57.62944+00	2026-10-22 15:18:57.62944+00
118	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:19:04.487924+00	2026-10-22 15:19:04.487924+00
140	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:19:13.842944+00	2026-10-22 15:19:13.842944+00
152	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:19:24.176303+00	2026-10-22 15:19:24.176303+00
52	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:19:32.18142+00	2026-10-22 15:19:32.18142+00
62	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:19:41.828026+00	2026-10-22 15:19:41.828026+00
144	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:19:47.30517+00	2026-10-22 15:19:47.30517+00
89	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:20:09.368445+00	2026-10-22 15:20:09.368445+00
167	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:28:31.120848+00	2026-10-22 15:28:31.120848+00
88	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:28:37.646213+00	2026-10-22 15:28:37.646213+00
169	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:28:44.667679+00	2026-10-22 15:28:44.667679+00
69	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:28:52.541764+00	2026-10-22 15:28:52.541764+00
252	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:29:01.43294+00	2026-10-22 15:29:01.43294+00
141	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:29:09.259722+00	2026-10-22 15:29:09.259722+00
151	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:29:15.15873+00	2026-10-22 15:29:15.15873+00
232	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:29:21.245012+00	2026-10-22 15:29:21.245012+00
249	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:29:28.552593+00	2026-10-22 15:29:28.552593+00
9	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:29:34.787837+00	2026-10-22 15:29:34.787837+00
21	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:29:41.854528+00	2026-10-22 15:29:41.854528+00
254	En uso	Citromax	256f3e7f-3f1a-42e3-a411-20c5747ad3f4	2026-10-22 15:29:49.028604+00	2026-10-22 15:29:49.028604+00
87	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:36:13.887267+00	2026-11-04 10:36:13.887267+00
253	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:36:26.383105+00	2026-11-04 10:36:26.383105+00
77	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:40:24.977935+00	2026-11-04 10:40:24.977935+00
70	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:40:49.645829+00	2026-11-04 10:40:49.645829+00
12	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:38:22.500265+00	2026-11-04 10:38:22.500265+00
259	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:38:54.848313+00	2026-11-04 10:38:54.848313+00
251	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:40:33.232392+00	2026-11-04 10:40:33.232392+00
81	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:41:00.506813+00	2026-11-04 10:41:00.506813+00
150	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:38:47.033729+00	2026-11-04 10:38:47.033729+00
258	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:39:16.991874+00	2026-11-04 10:39:16.991874+00
76	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:40:42.191965+00	2026-11-04 10:40:42.191965+00
98	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:39:07.811534+00	2026-11-04 10:39:07.811534+00
92	En uso	Arbolar	1996d037-cd79-410b-bdc0-c5b4ff8c52db	2026-11-04 10:38:37.971876+00	2026-11-04 10:38:37.971876+00
\.


--
-- Data for Name: consumibles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consumibles (id, nombre, stock, es_critico, stock_minimo, created_at, updated_at) FROM stdin;
Kit	Kit	186000	f	10	2026-10-02 11:48:41.296392+00	2026-10-02 14:07:00.302789+00
\.


--
-- Data for Name: empaques; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empaques (id, nombre, ubicacion, latitud, longitud, servicio, distancia, ultima_visita, created_at, updated_at) FROM stdin;
f29c6868-1ae5-4c87-a989-71a8622cea7f	Sucesores de Franzini y Fleming	Jujuy	-24.28	-64.67	t	346	\N	2026-09-04 15:08:56.874771+00	2026-09-04 15:08:56.874771+00
d8f0559c-368a-4708-88e7-641f9f2d6a9b	Albor	Salta	-25.5	-64.98	t	275	\N	2026-09-04 15:11:10.101791+00	2026-09-04 15:11:10.101791+00
16a5e97a-f241-4ca8-ac67-1c51f8494a77	Taller	Tucuman	-26.81	-65.26	t	0	\N	2026-09-04 15:32:13.292821+00	2026-09-07 11:08:45.691941+00
118366b0-c7ca-43dd-9cec-b819737852e5	El sauce	Tucumán 	-26.87	-65.17	t	15	\N	2026-09-07 13:12:09.201467+00	2026-09-07 13:12:09.201467+00
7cdd90f5-4970-4675-ab23-64d4975e5856	Argenti Lemon	Tucumán 	-26.84	-65.13	t	16	\N	2026-09-07 13:13:04.245925+00	2026-09-07 13:13:04.245925+00
84e98a6a-b20e-45e9-b9f5-680cb9f2f6e1	Citrusfranco	Tucumán 	-26.81	-65.1	t	22	\N	2026-09-07 13:14:00.432927+00	2026-09-07 13:14:00.432927+00
d0530be7-f3db-45fd-931e-c450089df5e6	FGF Trapani	Tucuman 	-26.75	-65.13	t	14	\N	2026-09-07 13:25:02.147292+00	2026-09-07 13:25:09.175373+00
d7b0b703-f1cf-4339-9744-d1961db8963d	Vicente trapani	Tucuman 	-26.69	-65.23	t	20	\N	2026-09-07 13:26:34.165552+00	2026-09-07 13:26:53.724333+00
7d97df2c-55da-4945-b9b8-b91f9f49228d	Acequiones	Tucumán 	-26.92	-65.33	t	16	\N	2026-09-07 13:31:11.724997+00	2026-09-07 13:31:11.724997+00
42fb66e5-18ee-4050-9367-601ec04f106c	Latin lemon	Tucuman 	-27.01	-65.29	t	29	\N	2026-09-07 13:27:59.892807+00	2026-09-07 13:31:17.930896+00
07e719bc-c35b-44a1-83e6-f05dcd3945ef	Veracruz	Tucumán 	-26.91	-65.33	t	15	\N	2026-09-07 13:28:49.640876+00	2026-09-07 13:31:24.019658+00
50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	Jujuy 	-23.83	-64.8	t	380	\N	2026-09-07 13:18:36.450789+00	2026-09-07 13:31:31.519425+00
1996d037-cd79-410b-bdc0-c5b4ff8c52db	Arbolar	Tucumán 	-27.1	-65.51	t	52	\N	2026-09-07 13:33:28.794377+00	2026-09-07 13:33:36.190448+00
bab5af71-a776-42e4-ba2a-a51651df4eb1	Lapacho amarillo	Tucuman 	-26.94	-65.29	t	21	\N	2026-09-07 13:32:41.406754+00	2026-09-07 13:33:44.233578+00
256f3e7f-3f1a-42e3-a411-20c5747ad3f4	Citromax	Tucuman 	-37.75	-65.48	t	50	\N	2026-09-07 13:50:31.401281+00	2026-09-07 13:50:31.401281+00
47da4749-cfe4-495a-a397-72a70f3422de	La limonera	Tucuman	-27.18	-65.63	t	74	\N	2026-09-07 13:51:25.088566+00	2026-09-07 13:57:10.269703+00
2b2372ce-06a8-4007-bc3b-11308ba65ad6	Biotuc	Tucumán	-27.69	-65.59	t	120	\N	2026-09-07 13:52:12.760014+00	2026-09-07 13:57:14.19009+00
986568df-d15d-4088-99d1-afe35fc96781	Greenpack	Tucuman	-27	-65.4	t	39	\N	2026-09-07 13:53:21.821909+00	2026-09-07 13:57:22.477558+00
c2d54c37-eac3-44a4-8ba5-a0343f938f8e	Agro Alianza	Tucumán	-26.74	-65.27	t	10	\N	2026-09-07 13:55:42.718129+00	2026-09-07 13:57:28.486528+00
ff7ac394-9910-43d9-8e25-bbd6c8e4564e	Diagonal Citrus	Tucuman	-26.75	-65.25	t	11	\N	2026-09-07 13:56:58.385+00	2026-09-07 13:57:32.509966+00
f2e426b6-22eb-4eac-9617-18767a747566	Calcerano	Tucuman	-26.78	-65.18	t	12	\N	2026-09-08 15:12:00.860346+00	2026-09-08 15:12:00.860346+00
28425ea3-0c86-4033-aa74-50d8b87a1381	Sagitario	Tucuman	-26.76	-65.22	t	12	\N	2026-09-08 15:13:18.982885+00	2026-09-08 15:13:18.982885+00
0b1a067a-089a-4d77-9b0f-645f0abc558d	La toma	Salta	-38.95	-68	t	20	\N	2026-09-08 15:19:01.486357+00	2026-09-08 15:19:01.486357+00
\.


--
-- Data for Name: frenos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.frenos (id, fecha_inicio, estado, cabezal_id, ubicacion, empaque_id, created_at, updated_at) FROM stdin;
100818	2026-09-08	En uso	23120	Taller	16a5e97a-f241-4ca8-ac67-1c51f8494a77	2026-09-08 16:22:25.106459+00	2026-09-08 16:23:21.100256+00
9497	2026-09-08	En uso	9230	Taller	16a5e97a-f241-4ca8-ac67-1c51f8494a77	2026-09-08 16:26:11.26674+00	2026-09-08 16:27:08.82272+00
101117	2026-09-08	En uso	20687	Taller	16a5e97a-f241-4ca8-ac67-1c51f8494a77	2026-09-08 16:28:40.751093+00	2026-09-08 16:29:32.054842+00
22296	2026-09-08	En uso	22121	Taller	16a5e97a-f241-4ca8-ac67-1c51f8494a77	2026-09-08 16:30:26.011506+00	2026-09-08 16:30:57.747713+00
121818	2026-09-08	En uso	8974	Taller	16a5e97a-f241-4ca8-ac67-1c51f8494a77	2026-09-08 16:40:36.871274+00	2026-09-08 16:41:35.527629+00
\.


--
-- Data for Name: movimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos (id, machine_id, machine_type, fecha, tecnico_id, tecnico_nombre, motivo, origen, destino, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reemplazos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reemplazos (id, fecha, motivo, retirado_id, retirado_tipo, instalado_id, instalado_tipo, empaque_id, empaque_nombre, tecnico_id, tecnico_nombre, created_at, updated_at) FROM stdin;
17b13ca9-9c98-4c4a-a5ff-312517389fdc	2026-10-02 15:50:21.343995+00	[W6558] Pretemporada	\N	\N	23120	Cabezal	d8f0559c-368a-4708-88e7-641f9f2d6a9b	Albor	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:50:21.325997+00	2026-10-02 15:50:21.325997+00
69c4f574-bf25-4b97-b93d-684f90ebe784	2026-10-02 15:50:43.451645+00	[W6558] Pretemporada	\N	\N	6791	Cabezal	d8f0559c-368a-4708-88e7-641f9f2d6a9b	Albor	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:50:43.436651+00	2026-10-02 15:50:43.436651+00
c0d1393e-e8b0-42e0-8811-1a57dcb3771a	2026-10-02 15:51:02.220419+00	[W6558] Pretemporada	\N	\N	15859	Cabezal	d8f0559c-368a-4708-88e7-641f9f2d6a9b	Albor	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:51:02.210981+00	2026-10-02 15:51:02.210981+00
bee85611-8f15-4ed0-b2c1-712655aa3761	2026-10-02 15:51:11.212418+00	[W6558] Pretemporada	\N	\N	23083	Cabezal	d8f0559c-368a-4708-88e7-641f9f2d6a9b	Albor	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:51:11.202741+00	2026-10-02 15:51:11.202741+00
8893b674-4de7-4c34-91a2-09033b2dddbd	2026-10-02 15:51:18.631048+00	[W6558] Pretemporada	\N	\N	22121	Cabezal	d8f0559c-368a-4708-88e7-641f9f2d6a9b	Albor	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:51:18.62597+00	2026-10-02 15:51:18.62597+00
279b1e53-ca9b-47dc-afb8-a4d57a9855a3	2026-10-02 15:51:25.77939+00	[W6558] Pretemporada	\N	\N	22112	Cabezal	d8f0559c-368a-4708-88e7-641f9f2d6a9b	Albor	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:51:25.769782+00	2026-10-02 15:51:25.769782+00
08a7a560-3800-4f33-b0b3-9a26804118c2	2026-10-02 15:51:32.731659+00	[W6558] Pretemporada	\N	\N	12989	Cabezal	d8f0559c-368a-4708-88e7-641f9f2d6a9b	Albor	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:51:32.726108+00	2026-10-02 15:51:32.726108+00
0df9c0bf-9c27-4d16-9408-0cebd311383f	2026-10-02 15:51:46.171849+00	[W6857] Pretemporada	\N	\N	15899	Cabezal	50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:51:46.164133+00	2026-10-02 15:51:46.164133+00
2e8dd0a3-cff9-4f86-beb7-37bd66edde68	2026-10-02 15:51:51.858739+00	[W6857] Pretemporada	\N	\N	Rfo152	Cabezal	50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:51:51.851162+00	2026-10-02 15:51:51.851162+00
637469d0-3454-4ef8-804d-3fa204f1633a	2026-10-02 15:51:58.86692+00	[W6857] Pretemporada	\N	\N	9315	Cabezal	50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:51:58.859336+00	2026-10-02 15:51:58.859336+00
babc9e42-d9e1-483d-ba27-34b953250101	2026-10-02 15:52:04.80252+00	[W6857] Pretemporada	\N	\N	6631	Cabezal	50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:52:04.794947+00	2026-10-02 15:52:04.794947+00
f8638c92-c015-425a-b0a0-cd69e5552f78	2026-10-02 15:52:16.225798+00	[W6857] Pretemporada	\N	\N	20687	Cabezal	50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:52:16.220703+00	2026-10-02 15:52:16.220703+00
b4413bfb-9daf-4976-9f7b-242acc8d057a	2026-10-02 15:52:22.515364+00	[W6857] Pretemporada	\N	\N	9230	Cabezal	50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:52:22.507724+00	2026-10-02 15:52:22.507724+00
4c6bf3dc-0f97-4c2f-874f-fa27eb505ed2	2026-10-02 15:52:27.532898+00	[W6857] Pretemporada	\N	\N	13336	Cabezal	50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:52:27.525426+00	2026-10-02 15:52:27.525426+00
99ea8c8d-a580-49e4-8e4d-3893f2fcd7db	2026-10-02 15:52:32.298759+00	[W6857] Pretemporada	\N	\N	8974	Cabezal	50ed0ae7-2e04-4605-a450-1447404eaaf0	Ledesma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-02 15:52:32.291866+00	2026-10-02 15:52:32.291866+00
7451cbf8-2e84-4877-9a95-51f3a9d76939	2026-10-22 13:11:32.501858+00	[W6866] Pre temporada	\N	\N	9360	Cabezal	0b1a067a-089a-4d77-9b0f-645f0abc558d	La toma	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-22 13:11:32.494168+00	2026-10-22 13:11:32.494168+00
\.


--
-- Data for Name: reporte_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reporte_items (id, reporte_id, orden, codigo_res, numero_partes, cantidad, otras_acciones, pct_etiquetado_esperado, pct_etiquetado_real, tiempo_servicio, numero_de_serie, codigo_motivo, codigo_origen) FROM stdin;
\.


--
-- Data for Name: reportes_sinclair; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reportes_sinclair (id, visita_id, numero, codigo_motivo, codigo_origen, codigo_tipo_servicio, hora_inicio, hora_fin, fuera_de_hora, comentarios, firma_cliente, nombre_cliente, hora_llamada, produccion_etiquetada, condicion_fruta, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: servicio_consumibles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicio_consumibles (id, servicio_id, consumible_id, nombre, cantidad) FROM stdin;
\.


--
-- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicios (id, machine_id, machine_type, fecha, resumen, trabajo_hecho, tecnico_id, tecnico_nombre, created_at, updated_at) FROM stdin;
26b2ea20-7ce0-4f40-ac92-f92dfc9cf521	9360	Cabezal	2026-10-22 00:00:00+00	Mantenimiento	Mantenimiento	1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	2026-10-22 13:11:03.651122+00	2026-10-22 13:11:03.651122+00
\.


--
-- Data for Name: tecnicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tecnicos (id, nombre, ultima_conexion, estado, cumpleanos, rol, email, password_hash, created_at, updated_at) FROM stdin;
9d1558ff-a840-4074-b980-a6f26710d3c0	admin	\N	Disponible	2000-01-01	admin	admin@admin.com	5421	2026-09-02 14:35:53.969921+00	2026-09-02 14:35:53.969921+00
c3505342-0c03-47ee-ae7a-b316b10d477a	Emmanuel Claudio	\N	Disponible	1993-07-07	tecnico	emmanuelclaudio@carlino.com	37476058	2026-09-02 15:03:50.794778+00	2026-09-02 15:03:50.794778+00
8122cef9-9741-47fe-9f40-d2ad235fed6f	Antonio Carlino	\N	Disponible	1971-02-04	admin	antoniocarlino@carlino.com	217458602	2026-09-02 15:13:48.213632+00	2026-09-02 15:13:48.213632+00
1c979299-6f44-4bee-a973-7ca1a8ea4c27	Luciano Carlino	\N	Disponible	2002-02-06	admin	lucianocarlino@carlino.com	43708688	2026-09-02 15:14:13.598536+00	2026-09-02 15:14:13.598536+00
5cbff33e-8147-47b3-9ca2-0a25e18d5f17	Santiago Quile	\N	Disponible	2000-07-20	tecnico	santiagoquile@carlino.com	42797008	2026-09-08 15:42:15.869013+00	2026-09-08 15:42:15.869013+00
\.


--
-- Data for Name: visita_tecnicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visita_tecnicos (id, visita_id, tecnico_id) FROM stdin;
\.


--
-- Data for Name: visitas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitas (id, fecha, motivo, solicitado_por, vehiculo, empaque_id, estado_sincronizacion, created_at, updated_at) FROM stdin;
\.


--
-- Name: caseteras_numero_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caseteras_numero_seq', 6, true);


--
-- Name: reporte_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reporte_items_id_seq', 1, false);


--
-- Name: servicio_consumibles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicio_consumibles_id_seq', 1, false);


--
-- Name: visita_tecnicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visita_tecnicos_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: audit_entries pk_audit_entries; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_entries
    ADD CONSTRAINT pk_audit_entries PRIMARY KEY (id);


--
-- Name: bancos pk_bancos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos
    ADD CONSTRAINT pk_bancos PRIMARY KEY (id);


--
-- Name: cabezales pk_cabezales; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabezales
    ADD CONSTRAINT pk_cabezales PRIMARY KEY (id);


--
-- Name: cambios pk_cambios; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cambios
    ADD CONSTRAINT pk_cambios PRIMARY KEY (id);


--
-- Name: caseteras pk_caseteras; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caseteras
    ADD CONSTRAINT pk_caseteras PRIMARY KEY (numero);


--
-- Name: consumibles pk_consumibles; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumibles
    ADD CONSTRAINT pk_consumibles PRIMARY KEY (id);


--
-- Name: empaques pk_empaques; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empaques
    ADD CONSTRAINT pk_empaques PRIMARY KEY (id);


--
-- Name: frenos pk_frenos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frenos
    ADD CONSTRAINT pk_frenos PRIMARY KEY (id);


--
-- Name: movimientos pk_movimientos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT pk_movimientos PRIMARY KEY (id);


--
-- Name: reemplazos pk_reemplazos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reemplazos
    ADD CONSTRAINT pk_reemplazos PRIMARY KEY (id);


--
-- Name: reporte_items pk_reporte_items; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_items
    ADD CONSTRAINT pk_reporte_items PRIMARY KEY (id);


--
-- Name: reportes_sinclair pk_reportes_sinclair; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_sinclair
    ADD CONSTRAINT pk_reportes_sinclair PRIMARY KEY (id);


--
-- Name: servicio_consumibles pk_servicio_consumibles; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_consumibles
    ADD CONSTRAINT pk_servicio_consumibles PRIMARY KEY (id);


--
-- Name: servicios pk_servicios; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT pk_servicios PRIMARY KEY (id);


--
-- Name: tecnicos pk_tecnicos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tecnicos
    ADD CONSTRAINT pk_tecnicos PRIMARY KEY (id);


--
-- Name: visita_tecnicos pk_visita_tecnicos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnicos
    ADD CONSTRAINT pk_visita_tecnicos PRIMARY KEY (id);


--
-- Name: visitas pk_visitas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas
    ADD CONSTRAINT pk_visitas PRIMARY KEY (id);


--
-- Name: reporte_items uq_reporte_items_reporte_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_items
    ADD CONSTRAINT uq_reporte_items_reporte_id UNIQUE (reporte_id, orden);


--
-- Name: servicio_consumibles uq_servicio_consumibles_servicio_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_consumibles
    ADD CONSTRAINT uq_servicio_consumibles_servicio_id UNIQUE (servicio_id, consumible_id);


--
-- Name: visita_tecnicos uq_visita_tecnicos_visita_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnicos
    ADD CONSTRAINT uq_visita_tecnicos_visita_id UNIQUE (visita_id, tecnico_id);


--
-- Name: ix_audit_entries_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_entries_action ON public.audit_entries USING btree (action);


--
-- Name: ix_audit_entries_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_entries_category ON public.audit_entries USING btree (category);


--
-- Name: ix_audit_entries_target_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_entries_target_id ON public.audit_entries USING btree (target_id);


--
-- Name: ix_audit_entries_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_entries_timestamp ON public.audit_entries USING btree ("timestamp");


--
-- Name: ix_audit_entries_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_entries_user_id ON public.audit_entries USING btree (user_id);


--
-- Name: ix_bancos_empaque_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_bancos_empaque_id ON public.bancos USING btree (empaque_id);


--
-- Name: ix_cabezales_empaque_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cabezales_empaque_id ON public.cabezales USING btree (empaque_id);


--
-- Name: ix_cabezales_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cabezales_estado ON public.cabezales USING btree (estado);


--
-- Name: ix_cabezales_ubicacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cabezales_ubicacion ON public.cabezales USING btree (ubicacion);


--
-- Name: ix_cambios_cabezal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cambios_cabezal_id ON public.cambios USING btree (cabezal_id);


--
-- Name: ix_cambios_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cambios_fecha ON public.cambios USING btree (fecha);


--
-- Name: ix_cambios_instalado_freno_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cambios_instalado_freno_id ON public.cambios USING btree (instalado_freno_id);


--
-- Name: ix_cambios_retirado_freno_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cambios_retirado_freno_id ON public.cambios USING btree (retirado_freno_id);


--
-- Name: ix_cambios_tecnico_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cambios_tecnico_id ON public.cambios USING btree (tecnico_id);


--
-- Name: ix_caseteras_empaque_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_caseteras_empaque_id ON public.caseteras USING btree (empaque_id);


--
-- Name: ix_caseteras_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_caseteras_estado ON public.caseteras USING btree (estado);


--
-- Name: ix_caseteras_ubicacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_caseteras_ubicacion ON public.caseteras USING btree (ubicacion);


--
-- Name: ix_consumibles_es_critico; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_consumibles_es_critico ON public.consumibles USING btree (es_critico);


--
-- Name: ix_consumibles_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_consumibles_nombre ON public.consumibles USING btree (nombre);


--
-- Name: ix_empaques_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_empaques_nombre ON public.empaques USING btree (nombre);


--
-- Name: ix_frenos_cabezal_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_frenos_cabezal_id ON public.frenos USING btree (cabezal_id);


--
-- Name: ix_frenos_empaque_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_frenos_empaque_id ON public.frenos USING btree (empaque_id);


--
-- Name: ix_frenos_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_frenos_estado ON public.frenos USING btree (estado);


--
-- Name: ix_frenos_ubicacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_frenos_ubicacion ON public.frenos USING btree (ubicacion);


--
-- Name: ix_movimientos_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_movimientos_fecha ON public.movimientos USING btree (fecha);


--
-- Name: ix_movimientos_machine_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_movimientos_machine_id ON public.movimientos USING btree (machine_id);


--
-- Name: ix_movimientos_machine_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_movimientos_machine_type ON public.movimientos USING btree (machine_type);


--
-- Name: ix_movimientos_tecnico_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_movimientos_tecnico_id ON public.movimientos USING btree (tecnico_id);


--
-- Name: ix_reemplazos_empaque_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reemplazos_empaque_id ON public.reemplazos USING btree (empaque_id);


--
-- Name: ix_reemplazos_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reemplazos_fecha ON public.reemplazos USING btree (fecha);


--
-- Name: ix_reemplazos_instalado_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reemplazos_instalado_id ON public.reemplazos USING btree (instalado_id);


--
-- Name: ix_reemplazos_retirado_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reemplazos_retirado_id ON public.reemplazos USING btree (retirado_id);


--
-- Name: ix_reemplazos_tecnico_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reemplazos_tecnico_id ON public.reemplazos USING btree (tecnico_id);


--
-- Name: ix_reporte_items_reporte_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reporte_items_reporte_id ON public.reporte_items USING btree (reporte_id);


--
-- Name: ix_reportes_sinclair_numero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_reportes_sinclair_numero ON public.reportes_sinclair USING btree (numero);


--
-- Name: ix_reportes_sinclair_visita_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_reportes_sinclair_visita_id ON public.reportes_sinclair USING btree (visita_id);


--
-- Name: ix_servicio_consumibles_consumible_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_servicio_consumibles_consumible_id ON public.servicio_consumibles USING btree (consumible_id);


--
-- Name: ix_servicio_consumibles_servicio_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_servicio_consumibles_servicio_id ON public.servicio_consumibles USING btree (servicio_id);


--
-- Name: ix_servicios_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_servicios_fecha ON public.servicios USING btree (fecha);


--
-- Name: ix_servicios_machine_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_servicios_machine_id ON public.servicios USING btree (machine_id);


--
-- Name: ix_servicios_machine_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_servicios_machine_type ON public.servicios USING btree (machine_type);


--
-- Name: ix_servicios_tecnico_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_servicios_tecnico_id ON public.servicios USING btree (tecnico_id);


--
-- Name: ix_tecnicos_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_tecnicos_email ON public.tecnicos USING btree (email);


--
-- Name: ix_tecnicos_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tecnicos_nombre ON public.tecnicos USING btree (nombre);


--
-- Name: ix_visita_tecnicos_tecnico_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_visita_tecnicos_tecnico_id ON public.visita_tecnicos USING btree (tecnico_id);


--
-- Name: ix_visita_tecnicos_visita_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_visita_tecnicos_visita_id ON public.visita_tecnicos USING btree (visita_id);


--
-- Name: ix_visitas_empaque_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_visitas_empaque_id ON public.visitas USING btree (empaque_id);


--
-- Name: ix_visitas_estado_sincronizacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_visitas_estado_sincronizacion ON public.visitas USING btree (estado_sincronizacion);


--
-- Name: ix_visitas_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_visitas_fecha ON public.visitas USING btree (fecha);


--
-- Name: bancos fk_bancos_empaque_id_empaques; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos
    ADD CONSTRAINT fk_bancos_empaque_id_empaques FOREIGN KEY (empaque_id) REFERENCES public.empaques(id) ON DELETE CASCADE;


--
-- Name: cabezales fk_cabezal_freno_actual; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabezales
    ADD CONSTRAINT fk_cabezal_freno_actual FOREIGN KEY (freno_actual_id) REFERENCES public.frenos(id);


--
-- Name: cabezales fk_cabezales_empaque_id_empaques; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabezales
    ADD CONSTRAINT fk_cabezales_empaque_id_empaques FOREIGN KEY (empaque_id) REFERENCES public.empaques(id);


--
-- Name: cambios fk_cambios_cabezal_id_cabezales; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cambios
    ADD CONSTRAINT fk_cambios_cabezal_id_cabezales FOREIGN KEY (cabezal_id) REFERENCES public.cabezales(id);


--
-- Name: cambios fk_cambios_instalado_freno_id_frenos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cambios
    ADD CONSTRAINT fk_cambios_instalado_freno_id_frenos FOREIGN KEY (instalado_freno_id) REFERENCES public.frenos(id);


--
-- Name: cambios fk_cambios_retirado_freno_id_frenos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cambios
    ADD CONSTRAINT fk_cambios_retirado_freno_id_frenos FOREIGN KEY (retirado_freno_id) REFERENCES public.frenos(id);


--
-- Name: cambios fk_cambios_tecnico_id_tecnicos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cambios
    ADD CONSTRAINT fk_cambios_tecnico_id_tecnicos FOREIGN KEY (tecnico_id) REFERENCES public.tecnicos(id);


--
-- Name: caseteras fk_caseteras_empaque_id_empaques; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caseteras
    ADD CONSTRAINT fk_caseteras_empaque_id_empaques FOREIGN KEY (empaque_id) REFERENCES public.empaques(id);


--
-- Name: frenos fk_freno_cabezal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frenos
    ADD CONSTRAINT fk_freno_cabezal FOREIGN KEY (cabezal_id) REFERENCES public.cabezales(id);


--
-- Name: frenos fk_frenos_empaque_id_empaques; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frenos
    ADD CONSTRAINT fk_frenos_empaque_id_empaques FOREIGN KEY (empaque_id) REFERENCES public.empaques(id);


--
-- Name: movimientos fk_movimientos_tecnico_id_tecnicos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos
    ADD CONSTRAINT fk_movimientos_tecnico_id_tecnicos FOREIGN KEY (tecnico_id) REFERENCES public.tecnicos(id);


--
-- Name: reemplazos fk_reemplazos_empaque_id_empaques; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reemplazos
    ADD CONSTRAINT fk_reemplazos_empaque_id_empaques FOREIGN KEY (empaque_id) REFERENCES public.empaques(id);


--
-- Name: reemplazos fk_reemplazos_tecnico_id_tecnicos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reemplazos
    ADD CONSTRAINT fk_reemplazos_tecnico_id_tecnicos FOREIGN KEY (tecnico_id) REFERENCES public.tecnicos(id);


--
-- Name: reporte_items fk_reporte_items_reporte_id_reportes_sinclair; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_items
    ADD CONSTRAINT fk_reporte_items_reporte_id_reportes_sinclair FOREIGN KEY (reporte_id) REFERENCES public.reportes_sinclair(id) ON DELETE CASCADE;


--
-- Name: reportes_sinclair fk_reportes_sinclair_visita_id_visitas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_sinclair
    ADD CONSTRAINT fk_reportes_sinclair_visita_id_visitas FOREIGN KEY (visita_id) REFERENCES public.visitas(id) ON DELETE CASCADE;


--
-- Name: servicio_consumibles fk_servicio_consumibles_consumible_id_consumibles; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_consumibles
    ADD CONSTRAINT fk_servicio_consumibles_consumible_id_consumibles FOREIGN KEY (consumible_id) REFERENCES public.consumibles(id);


--
-- Name: servicio_consumibles fk_servicio_consumibles_servicio_id_servicios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_consumibles
    ADD CONSTRAINT fk_servicio_consumibles_servicio_id_servicios FOREIGN KEY (servicio_id) REFERENCES public.servicios(id) ON DELETE CASCADE;


--
-- Name: servicios fk_servicios_tecnico_id_tecnicos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT fk_servicios_tecnico_id_tecnicos FOREIGN KEY (tecnico_id) REFERENCES public.tecnicos(id);


--
-- Name: visita_tecnicos fk_visita_tecnicos_tecnico_id_tecnicos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnicos
    ADD CONSTRAINT fk_visita_tecnicos_tecnico_id_tecnicos FOREIGN KEY (tecnico_id) REFERENCES public.tecnicos(id);


--
-- Name: visita_tecnicos fk_visita_tecnicos_visita_id_visitas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnicos
    ADD CONSTRAINT fk_visita_tecnicos_visita_id_visitas FOREIGN KEY (visita_id) REFERENCES public.visitas(id) ON DELETE CASCADE;


--
-- Name: visitas fk_visitas_empaque_id_empaques; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas
    ADD CONSTRAINT fk_visitas_empaque_id_empaques FOREIGN KEY (empaque_id) REFERENCES public.empaques(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 3ye1HNTnbUj5g8AOBt1D9lsmL4cEg5vbIr2aUYRXWwrauhEIPjnmA4XTkT9C6wO

