--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

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

ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.addresses DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_archives_updated_at ON public.archives;
DROP INDEX IF EXISTS public.idx_stats_cache_type_date;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_order_number;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_favorites_user_id;
DROP INDEX IF EXISTS public.idx_favorites_product_id;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.stats_cache DROP CONSTRAINT IF EXISTS stats_cache_stat_type_stat_date_key;
ALTER TABLE IF EXISTS ONLY public.stats_cache DROP CONSTRAINT IF EXISTS stats_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_number_unique;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_name_key;
ALTER TABLE IF EXISTS ONLY public.archives DROP CONSTRAINT IF EXISTS archives_pkey;
ALTER TABLE IF EXISTS ONLY public.addresses DROP CONSTRAINT IF EXISTS addresses_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stats_cache ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.favorites ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.brands ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.archives ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.addresses ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.stats_cache_id_seq;
DROP TABLE IF EXISTS public.stats_cache;
DROP SEQUENCE IF EXISTS public.settings_id_seq;
DROP TABLE IF EXISTS public.settings;
DROP SEQUENCE IF EXISTS public.reviews_id_seq;
DROP TABLE IF EXISTS public.reviews;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.favorites_id_seq;
DROP TABLE IF EXISTS public.favorites;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.brands_id_seq;
DROP TABLE IF EXISTS public.brands;
DROP SEQUENCE IF EXISTS public.archives_id_seq;
DROP TABLE IF EXISTS public.archives;
DROP SEQUENCE IF EXISTS public.addresses_id_seq;
DROP TABLE IF EXISTS public.addresses;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_orders_updated_at();
DROP FUNCTION IF EXISTS public.random_stock();
DROP FUNCTION IF EXISTS public.random_price();
--
-- Name: random_price(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.random_price() RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN round((random() * 950 + 50)::numeric, 2);
END;
$$;


--
-- Name: random_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.random_stock() RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN floor(random() * 100)::integer;
END;
$$;


--
-- Name: update_orders_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_orders_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    id integer NOT NULL,
    user_id integer,
    street text NOT NULL,
    city text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: archives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.archives (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    image_path character varying(255) NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    CONSTRAINT archives_category_check CHECK (((category)::text = ANY ((ARRAY['store'::character varying, 'shooting'::character varying, 'event'::character varying])::text[])))
);


--
-- Name: archives_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.archives_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: archives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.archives_id_seq OWNED BY public.archives.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    logo_light character varying(255),
    logo_dark character varying(255),
    image character varying(255)
);


--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    variant_info jsonb
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    shipping_info jsonb,
    order_number character varying(50) NOT NULL,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    category_id integer,
    image_url text,
    brand character varying(255),
    images text[],
    variants jsonb,
    tags text[],
    reviews jsonb,
    questions jsonb,
    faqs jsonb,
    size_chart jsonb,
    store_type character varying(50),
    featured boolean DEFAULT false,
    colors text[],
    CONSTRAINT products_store_type_check CHECK (((store_type)::text = ANY ((ARRAY['adult'::character varying, 'kids'::character varying, 'sneakers'::character varying, 'cpcompany'::character varying])::text[])))
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer,
    product_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    site_name character varying(255) NOT NULL,
    site_description text,
    contact_email character varying(255),
    enable_registration boolean DEFAULT true,
    enable_checkout boolean DEFAULT true,
    maintenance_mode boolean DEFAULT false,
    currency character varying(10) DEFAULT 'EUR'::character varying,
    tax_rate numeric(5,2) DEFAULT 20.00,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: stats_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stats_cache (
    id integer NOT NULL,
    stat_type character varying(50) NOT NULL,
    stat_date date NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: stats_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stats_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stats_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stats_cache_id_seq OWNED BY public.stats_cache.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(100) NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notification_settings jsonb DEFAULT '{"push": false, "email": true, "security": true, "marketing": false}'::jsonb
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: archives id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archives ALTER COLUMN id SET DEFAULT nextval('public.archives_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: stats_cache id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stats_cache ALTER COLUMN id SET DEFAULT nextval('public.stats_cache_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.addresses (id, user_id, street, city, postal_code, country, created_at, updated_at) FROM stdin;
2	1	14 rue de zimski	Belgrade	381000	France	2025-02-18 21:33:09.165166+01	2025-02-18 21:33:09.165166+01
\.


--
-- Data for Name: archives; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.archives (id, title, description, category, image_path, date, created_at, updated_at, active, display_order) FROM stdin;
1	SHOOT CARHART	SHOOT CARHARTWIP REBOUL UTILITY SANARY	shooting	/archives/shooting/1740058555372-A32A7060.jpg	2025-02-20	2025-02-20 14:35:11.434432+01	2025-02-20 14:35:55.384907+01	t	0
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (id, name, logo_light, logo_dark, image) FROM stdin;
18	ARTE	/brands/ARTE/ARTE_b.png	/brands/ARTE/ARTE_w.png	/placeholder.png
30	ASPESIE	/brands/ASPESI/aspesi_b.png	/brands/ASPESI/aspesi_w.png	/placeholder.png
11	AUTRY	/brands/AUTRY/AUTRY_b.png	/brands/AUTRY/AUTRY_w.png	/AUTRY_b.png
25	BISOUS SKATEBOARDS	/brands/BISOUS SKATEBOARDS/bisous_b.png	/brands/BISOUS SKATEBOARDS/bisous_w.png	/placeholder.png
1	C.P.COMPANY	/brands/CP COMPANY/CP_2_b.png	/brands/CP COMPANY/CP_2_w.png	/placeholder.png
17	CARHART	/brands/CARHARTT/carhartt_b.png	/brands/CARHARTT/carhartt_w.png	/placeholder.png
21	CHLOE	/brands/CHLOE/CHLOE_b.png	/brands/CHLOE/CHLOE_w.png	/placeholder.png
23	GIVENCHY	/brands/GIVENCHY/GIVENCHY_b.png	/brands/GIVENCHY/GIVENCHY_w.png	/placeholder.png
20	GOLDEN GOOSE	/brands/GOLDEN GOOSE/GOLDEN_b.png	/brands/GOLDEN GOOSE/GOLDEN_w.png	/placeholder.png
7	HERNO	/brands/HERNO/HERNO_b.png	/brands/HERNO/HERNO_w.png	/placeholder.png
13	JACOB COHEN	/brands/JACOBCOHEN/jacob_b.png	/brands/JACOBCOHEN/jacob_w.png	/placeholder.png
28	K-WAY	/brands/K-WAY/KWAY_b.png	/brands/K-WAY/KWAY_w.png	/placeholder.png
27	LANVIN	/brands/LANVIN/LANVIN_b.png	/brands/LANVIN/LANVIN_w.png	/placeholder.png
24	MARGIELA	/brands/MARGIELA/MARGIELA_b.png	/brands/MARGIELA/MARGIELA_w.png	/placeholder.png
8	LES DEUX	/brands/LESDEUX/lesdeux_b.png	/brands/LESDEUX/lesdeux_w.png	/placeholder.png
36	MANUEL RITZ	/brands/MANUELRITZ/manuel_b.png	/brands/MANUELRITZ/manuel_w.png	/placeholder.png
31	AFTER LABEL	/brands/AFTER LABEL/after_b.png	/brands/AFTER LABEL/after_w.png	/placeholder.png
5	APC	/brands/APC/apc_b.png	/brands/APC/apc_w.png	/placeholder.png
6	AXEL ARIGATO	/brands/AXEL ARIGATO/axel_b.png	/brands/AXEL ARIGATO/axel_w.png	/placeholder.png
14	MARNI	/brands/MARNI/MARNI_b.png	/brands/MARNI/MARNI_w.png	/placeholder.png
9	OFF-WHITE	/brands/OFF-WHITE/OFF-WHITE_b.png	/brands/OFF-WHITE/OFF-WHITE_w.png	/placeholder.png
10	PALM ANGELS	/brands/PALM ANGELS/PALMANGELS_b.png	/brands/PALM ANGELS/PALMANGELS_w.png	/placeholder.png
29	PYRENEX	/brands/PYRENEX/PYRENEX_b.png	/brands/PYRENEX/PYRENEX_w.png	/placeholder.png
35	RAINS	/brands/RAINS/rains_b.png	/brands/RAINS/rains_w.png	/placeholder.png
4	RRD	/brands/RRD/rrd_b.png	/brands/RRD/rrd_w.png	/placeholder.png
12	SALOMON	/brands/SALOMON/SALOMON_2_b.png	/brands/SALOMON/SALOMON_2_w.png	/placeholder.png
2	STONE ISLAND	/brands/STONE ISLAND/STONE_ISLAND_2_b.png	/brands/STONE ISLAND/STONE_ISLAND_2_w.png	/STONE_ISLAND_2_b.png
16	TOPOLOGIE	/brands/TOPOLOGIE/topo_b.png	/brands/TOPOLOGIE/topo_w.png	/placeholder.png
22	MONCLERC	/brands/MONCLER/MONCLER_b.png	/brands/MONCLER/MONCLER_w.png	/placeholder.png
19	DOUCAL'S	/brands/DOUCALS/doucals_b.png	/brands/DOUCALS/doucals_w.png	/placeholder.png
32	MERCER	/brands/MERCER/mercer_b.png	/brands/MERCER/mercer_w.png	/placeholder.png
33	PARAJUMPERS	/brands/PARAJUMPERS/parajumpers_b.png	/brands/PARAJUMPERS/parajumpers_w.png	/placeholder.png
15	PATAGONIA	/brands/PATAGONIA/patagonia_b.png	/brands/PATAGONIA/patagonia_w.png	/placeholder.png
26	NUMERO 21	/brands/NUMERO21/N21_b.png	/brands/NUMERO21/N21_w 2.png	/placeholder.png
34	WHITE SAND	/brands/WHITE%20SAND/white_b.png	/brands/WHITE%20SAND/white_w.png	/placeholder.png
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description) FROM stdin;
6	Vestes	Description à ajouter
8	outerwear	Description à ajouter
2	Tee Shirts	Accessoires de mode
11	pantalon	\N
12	accesoires	\N
10	PULL	\N
13	Test Category	Description de la catégorie test
18	Vêtements	Collection de vêtements
19	Accessoires	Collection d'accessoires
20	Chaussures	Collection de chaussures
21	Sport	Équipement sportif
22	Vêtements	Collection de vêtements
23	Accessoires	Collection d'accessoires
24	Chaussures	Collection de chaussures
25	Sport	Équipement sportif
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorites (id, user_id, product_id, created_at) FROM stdin;
1	1	33	2025-02-19 03:57:42.85504
2	1	35	2025-02-19 03:57:45.719038
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, price, created_at, variant_info) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, user_id, total_amount, status, created_at, updated_at, shipping_info, order_number, payment_status) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, price, stock, category_id, image_url, brand, images, variants, tags, reviews, questions, faqs, size_chart, store_type, featured, colors) FROM stdin;
36	Nouveau T-shirt	Un t-shirt confortable et élégant	29.99	100	2	/placeholder.png	APC	{}	[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}]	{t-shirt,coton}	\N	\N	\N	\N	adult	f	{rouge,bleu}
34	Nouveau T-shirt	Un t-shirt confortable et élégant	29.99	100	2	http://localhost:5001/api/uploads/placeholder.png		{}	[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}]	{t-shirt,coton}	\N	\N	\N	[]	adult	t	{rouge,bleu}
44	Produit Test	Description test	99.99	5	13	\N	STONE ISLAND	\N	[{"size": "M", "color": "Noir", "stock": 3}, {"size": "L", "color": "Noir", "stock": 2}]	\N	\N	\N	\N	\N	adult	f	\N
32	Nouveau T-shirt	Un t-shirt confortable et élégant	29.99	96	8	\N	C.P.COMPANY	{}	[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}, {"size": "S", "color": "Noir", "stock": 10}, {"size": "XS", "color": "Vert", "stock": 15}]	{t-shirt,coton}	[]	[]	[]	[]	cpcompany	f	{rouge,bleu}
42	Produit	ssss	300.00	0	2	\N	C.P.COMPANY	{}	[{"size": "L", "color": "Noir", "stock": 2}]	\N	[]	[]	[]	[]	cpcompany	t	{}
41	Produit cp	ssss	150.00	0	6	\N	C.P.COMPANY	{}	[]	\N	[]	[]	[]	[]	cpcompany	t	{}
33	Nouveau T-shirt	Un t-shirt confortable et élégant	29.99	100	2	http://localhost:5001/api/uploads/placeholder.png		{http://localhost:5001/api/uploads/1736782462670-s-l1200.jpg}	[{"size": "M", "color": "rouge", "stock": 50}, {"size": "L", "color": "bleu", "stock": 50}, {"size": "S", "color": "Noir", "stock": 50}]	{t-shirt,coton}	\N	\N	\N	[]	adult	t	{rouge,bleu}
35	SALOMON XT SLATE	Un t-shirt confortable et élégant	200.00	92	12	http://localhost:5001/api/uploads/placeholder.png		{http://localhost:5001/api/uploads/1738939722021-L47460500_1_800x.png}	[{"size": "40", "color": "Noir", "stock": 10}]	{t-shirt,coton}	\N	\N	\N	[]	sneakers	t	{rouge,bleu}
50	Produit Test 1	Description détaillée du produit test 1	668.32	64	2	https://picsum.photos/400/600?random=1	Adidas	{https://picsum.photos/400/600?random=1,https://picsum.photos/400/600?random=2}	[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 43}]	{sport,tendance,nouveau}	[{"user": "User1", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
51	Produit Test 2	Description détaillée du produit test 2	420.22	84	2	https://picsum.photos/400/600?random=2	Puma	{https://picsum.photos/400/600?random=2,https://picsum.photos/400/600?random=3}	[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 37}]	{sport,tendance,nouveau}	[{"user": "User2", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
52	Produit Test 3	Description détaillée du produit test 3	947.89	36	2	https://picsum.photos/400/600?random=3	Under Armour	{https://picsum.photos/400/600?random=3,https://picsum.photos/400/600?random=4}	[{"size": "M", "color": "Noir", "stock": 48}, {"size": "L", "color": "Blanc", "stock": 44}]	{sport,tendance,nouveau}	[{"user": "User3", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
53	Produit Test 4	Description détaillée du produit test 4	472.07	44	2	https://picsum.photos/400/600?random=4	Nike	{https://picsum.photos/400/600?random=4,https://picsum.photos/400/600?random=5}	[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 1}]	{sport,tendance,nouveau}	[{"user": "User4", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
54	Produit Test 5	Description détaillée du produit test 5	261.05	0	2	https://picsum.photos/400/600?random=5	Adidas	{https://picsum.photos/400/600?random=5,https://picsum.photos/400/600?random=6}	[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 6}]	{sport,tendance,nouveau}	[{"user": "User5", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
55	Produit Test 6	Description détaillée du produit test 6	918.35	35	2	https://picsum.photos/400/600?random=6	Puma	{https://picsum.photos/400/600?random=6,https://picsum.photos/400/600?random=7}	[{"size": "M", "color": "Noir", "stock": 4}, {"size": "L", "color": "Blanc", "stock": 49}]	{sport,tendance,nouveau}	[{"user": "User6", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
56	Produit Test 7	Description détaillée du produit test 7	54.11	37	2	https://picsum.photos/400/600?random=7	Under Armour	{https://picsum.photos/400/600?random=7,https://picsum.photos/400/600?random=8}	[{"size": "M", "color": "Noir", "stock": 38}, {"size": "L", "color": "Blanc", "stock": 47}]	{sport,tendance,nouveau}	[{"user": "User7", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
57	Produit Test 8	Description détaillée du produit test 8	786.72	44	2	https://picsum.photos/400/600?random=8	Nike	{https://picsum.photos/400/600?random=8,https://picsum.photos/400/600?random=9}	[{"size": "M", "color": "Noir", "stock": 9}, {"size": "L", "color": "Blanc", "stock": 4}]	{sport,tendance,nouveau}	[{"user": "User8", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
58	Produit Test 9	Description détaillée du produit test 9	703.32	30	2	https://picsum.photos/400/600?random=9	Adidas	{https://picsum.photos/400/600?random=9,https://picsum.photos/400/600?random=10}	[{"size": "M", "color": "Noir", "stock": 39}, {"size": "L", "color": "Blanc", "stock": 14}]	{sport,tendance,nouveau}	[{"user": "User9", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
59	Produit Test 10	Description détaillée du produit test 10	850.10	99	2	https://picsum.photos/400/600?random=10	Puma	{https://picsum.photos/400/600?random=10,https://picsum.photos/400/600?random=11}	[{"size": "M", "color": "Noir", "stock": 35}, {"size": "L", "color": "Blanc", "stock": 41}]	{sport,tendance,nouveau}	[{"user": "User10", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
60	Produit Test 11	Description détaillée du produit test 11	949.86	7	2	https://picsum.photos/400/600?random=11	Under Armour	{https://picsum.photos/400/600?random=11,https://picsum.photos/400/600?random=12}	[{"size": "M", "color": "Noir", "stock": 2}, {"size": "L", "color": "Blanc", "stock": 6}]	{sport,tendance,nouveau}	[{"user": "User11", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
61	Produit Test 12	Description détaillée du produit test 12	749.81	74	2	https://picsum.photos/400/600?random=12	Nike	{https://picsum.photos/400/600?random=12,https://picsum.photos/400/600?random=13}	[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 12}]	{sport,tendance,nouveau}	[{"user": "User12", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
62	Produit Test 13	Description détaillée du produit test 13	783.92	50	2	https://picsum.photos/400/600?random=13	Adidas	{https://picsum.photos/400/600?random=13,https://picsum.photos/400/600?random=14}	[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 36}]	{sport,tendance,nouveau}	[{"user": "User13", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
63	Produit Test 14	Description détaillée du produit test 14	852.42	35	2	https://picsum.photos/400/600?random=14	Puma	{https://picsum.photos/400/600?random=14,https://picsum.photos/400/600?random=15}	[{"size": "M", "color": "Noir", "stock": 41}, {"size": "L", "color": "Blanc", "stock": 38}]	{sport,tendance,nouveau}	[{"user": "User14", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
64	Produit Test 15	Description détaillée du produit test 15	883.12	79	2	https://picsum.photos/400/600?random=15	Under Armour	{https://picsum.photos/400/600?random=15,https://picsum.photos/400/600?random=16}	[{"size": "M", "color": "Noir", "stock": 12}, {"size": "L", "color": "Blanc", "stock": 24}]	{sport,tendance,nouveau}	[{"user": "User15", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
65	Produit Test 16	Description détaillée du produit test 16	207.48	10	2	https://picsum.photos/400/600?random=16	Nike	{https://picsum.photos/400/600?random=16,https://picsum.photos/400/600?random=17}	[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 9}]	{sport,tendance,nouveau}	[{"user": "User16", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
66	Produit Test 17	Description détaillée du produit test 17	326.97	16	2	https://picsum.photos/400/600?random=17	Adidas	{https://picsum.photos/400/600?random=17,https://picsum.photos/400/600?random=18}	[{"size": "M", "color": "Noir", "stock": 33}, {"size": "L", "color": "Blanc", "stock": 1}]	{sport,tendance,nouveau}	[{"user": "User17", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
67	Produit Test 18	Description détaillée du produit test 18	571.54	17	2	https://picsum.photos/400/600?random=18	Puma	{https://picsum.photos/400/600?random=18,https://picsum.photos/400/600?random=19}	[{"size": "M", "color": "Noir", "stock": 15}, {"size": "L", "color": "Blanc", "stock": 41}]	{sport,tendance,nouveau}	[{"user": "User18", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
68	Produit Test 19	Description détaillée du produit test 19	999.17	25	2	https://picsum.photos/400/600?random=19	Under Armour	{https://picsum.photos/400/600?random=19,https://picsum.photos/400/600?random=20}	[{"size": "M", "color": "Noir", "stock": 22}, {"size": "L", "color": "Blanc", "stock": 46}]	{sport,tendance,nouveau}	[{"user": "User19", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
69	Produit Test 20	Description détaillée du produit test 20	513.61	8	2	https://picsum.photos/400/600?random=20	Nike	{https://picsum.photos/400/600?random=20,https://picsum.photos/400/600?random=21}	[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 40}]	{sport,tendance,nouveau}	[{"user": "User20", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
70	Produit Test 21	Description détaillée du produit test 21	127.24	47	2	https://picsum.photos/400/600?random=21	Adidas	{https://picsum.photos/400/600?random=21,https://picsum.photos/400/600?random=22}	[{"size": "M", "color": "Noir", "stock": 43}, {"size": "L", "color": "Blanc", "stock": 11}]	{sport,tendance,nouveau}	[{"user": "User21", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
71	Produit Test 22	Description détaillée du produit test 22	244.42	94	2	https://picsum.photos/400/600?random=22	Puma	{https://picsum.photos/400/600?random=22,https://picsum.photos/400/600?random=23}	[{"size": "M", "color": "Noir", "stock": 48}, {"size": "L", "color": "Blanc", "stock": 24}]	{sport,tendance,nouveau}	[{"user": "User22", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
72	Produit Test 23	Description détaillée du produit test 23	739.70	57	2	https://picsum.photos/400/600?random=23	Under Armour	{https://picsum.photos/400/600?random=23,https://picsum.photos/400/600?random=24}	[{"size": "M", "color": "Noir", "stock": 40}, {"size": "L", "color": "Blanc", "stock": 42}]	{sport,tendance,nouveau}	[{"user": "User23", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
73	Produit Test 24	Description détaillée du produit test 24	382.50	96	2	https://picsum.photos/400/600?random=24	Nike	{https://picsum.photos/400/600?random=24,https://picsum.photos/400/600?random=25}	[{"size": "M", "color": "Noir", "stock": 25}, {"size": "L", "color": "Blanc", "stock": 20}]	{sport,tendance,nouveau}	[{"user": "User24", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
74	Produit Test 25	Description détaillée du produit test 25	298.11	31	2	https://picsum.photos/400/600?random=25	Adidas	{https://picsum.photos/400/600?random=25,https://picsum.photos/400/600?random=26}	[{"size": "M", "color": "Noir", "stock": 4}, {"size": "L", "color": "Blanc", "stock": 49}]	{sport,tendance,nouveau}	[{"user": "User25", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
75	Produit Test 26	Description détaillée du produit test 26	294.89	79	2	https://picsum.photos/400/600?random=26	Puma	{https://picsum.photos/400/600?random=26,https://picsum.photos/400/600?random=27}	[{"size": "M", "color": "Noir", "stock": 34}, {"size": "L", "color": "Blanc", "stock": 12}]	{sport,tendance,nouveau}	[{"user": "User26", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
76	Produit Test 27	Description détaillée du produit test 27	502.06	35	2	https://picsum.photos/400/600?random=27	Under Armour	{https://picsum.photos/400/600?random=27,https://picsum.photos/400/600?random=28}	[{"size": "M", "color": "Noir", "stock": 42}, {"size": "L", "color": "Blanc", "stock": 21}]	{sport,tendance,nouveau}	[{"user": "User27", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
77	Produit Test 28	Description détaillée du produit test 28	148.21	44	2	https://picsum.photos/400/600?random=28	Nike	{https://picsum.photos/400/600?random=28,https://picsum.photos/400/600?random=29}	[{"size": "M", "color": "Noir", "stock": 37}, {"size": "L", "color": "Blanc", "stock": 31}]	{sport,tendance,nouveau}	[{"user": "User28", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
78	Produit Test 29	Description détaillée du produit test 29	932.20	37	2	https://picsum.photos/400/600?random=29	Adidas	{https://picsum.photos/400/600?random=29,https://picsum.photos/400/600?random=30}	[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 33}]	{sport,tendance,nouveau}	[{"user": "User29", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
79	Produit Test 30	Description détaillée du produit test 30	386.38	90	2	https://picsum.photos/400/600?random=30	Puma	{https://picsum.photos/400/600?random=30,https://picsum.photos/400/600?random=31}	[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 20}]	{sport,tendance,nouveau}	[{"user": "User30", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
80	Produit Test 31	Description détaillée du produit test 31	205.67	30	2	https://picsum.photos/400/600?random=31	Under Armour	{https://picsum.photos/400/600?random=31,https://picsum.photos/400/600?random=32}	[{"size": "M", "color": "Noir", "stock": 41}, {"size": "L", "color": "Blanc", "stock": 44}]	{sport,tendance,nouveau}	[{"user": "User31", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
81	Produit Test 32	Description détaillée du produit test 32	487.89	62	2	https://picsum.photos/400/600?random=32	Nike	{https://picsum.photos/400/600?random=32,https://picsum.photos/400/600?random=33}	[{"size": "M", "color": "Noir", "stock": 37}, {"size": "L", "color": "Blanc", "stock": 41}]	{sport,tendance,nouveau}	[{"user": "User32", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
82	Produit Test 33	Description détaillée du produit test 33	323.36	67	2	https://picsum.photos/400/600?random=33	Adidas	{https://picsum.photos/400/600?random=33,https://picsum.photos/400/600?random=34}	[{"size": "M", "color": "Noir", "stock": 26}, {"size": "L", "color": "Blanc", "stock": 20}]	{sport,tendance,nouveau}	[{"user": "User33", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
83	Produit Test 34	Description détaillée du produit test 34	696.16	93	2	https://picsum.photos/400/600?random=34	Puma	{https://picsum.photos/400/600?random=34,https://picsum.photos/400/600?random=35}	[{"size": "M", "color": "Noir", "stock": 6}, {"size": "L", "color": "Blanc", "stock": 35}]	{sport,tendance,nouveau}	[{"user": "User34", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
84	Produit Test 35	Description détaillée du produit test 35	800.16	12	2	https://picsum.photos/400/600?random=35	Under Armour	{https://picsum.photos/400/600?random=35,https://picsum.photos/400/600?random=36}	[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 45}]	{sport,tendance,nouveau}	[{"user": "User35", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
85	Produit Test 36	Description détaillée du produit test 36	224.87	30	2	https://picsum.photos/400/600?random=36	Nike	{https://picsum.photos/400/600?random=36,https://picsum.photos/400/600?random=37}	[{"size": "M", "color": "Noir", "stock": 22}, {"size": "L", "color": "Blanc", "stock": 13}]	{sport,tendance,nouveau}	[{"user": "User36", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
86	Produit Test 37	Description détaillée du produit test 37	797.49	42	2	https://picsum.photos/400/600?random=37	Adidas	{https://picsum.photos/400/600?random=37,https://picsum.photos/400/600?random=38}	[{"size": "M", "color": "Noir", "stock": 10}, {"size": "L", "color": "Blanc", "stock": 8}]	{sport,tendance,nouveau}	[{"user": "User37", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
87	Produit Test 38	Description détaillée du produit test 38	923.13	38	2	https://picsum.photos/400/600?random=38	Puma	{https://picsum.photos/400/600?random=38,https://picsum.photos/400/600?random=39}	[{"size": "M", "color": "Noir", "stock": 41}, {"size": "L", "color": "Blanc", "stock": 31}]	{sport,tendance,nouveau}	[{"user": "User38", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
88	Produit Test 39	Description détaillée du produit test 39	262.85	6	2	https://picsum.photos/400/600?random=39	Under Armour	{https://picsum.photos/400/600?random=39,https://picsum.photos/400/600?random=40}	[{"size": "M", "color": "Noir", "stock": 34}, {"size": "L", "color": "Blanc", "stock": 46}]	{sport,tendance,nouveau}	[{"user": "User39", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
89	Produit Test 40	Description détaillée du produit test 40	953.45	70	2	https://picsum.photos/400/600?random=40	Nike	{https://picsum.photos/400/600?random=40,https://picsum.photos/400/600?random=41}	[{"size": "M", "color": "Noir", "stock": 28}, {"size": "L", "color": "Blanc", "stock": 2}]	{sport,tendance,nouveau}	[{"user": "User40", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
90	Produit Test 41	Description détaillée du produit test 41	538.11	78	2	https://picsum.photos/400/600?random=41	Adidas	{https://picsum.photos/400/600?random=41,https://picsum.photos/400/600?random=42}	[{"size": "M", "color": "Noir", "stock": 41}, {"size": "L", "color": "Blanc", "stock": 33}]	{sport,tendance,nouveau}	[{"user": "User41", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
91	Produit Test 42	Description détaillée du produit test 42	365.20	41	2	https://picsum.photos/400/600?random=42	Puma	{https://picsum.photos/400/600?random=42,https://picsum.photos/400/600?random=43}	[{"size": "M", "color": "Noir", "stock": 9}, {"size": "L", "color": "Blanc", "stock": 12}]	{sport,tendance,nouveau}	[{"user": "User42", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
92	Produit Test 43	Description détaillée du produit test 43	194.45	50	2	https://picsum.photos/400/600?random=43	Under Armour	{https://picsum.photos/400/600?random=43,https://picsum.photos/400/600?random=44}	[{"size": "M", "color": "Noir", "stock": 23}, {"size": "L", "color": "Blanc", "stock": 15}]	{sport,tendance,nouveau}	[{"user": "User43", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
93	Produit Test 44	Description détaillée du produit test 44	355.00	7	2	https://picsum.photos/400/600?random=44	Nike	{https://picsum.photos/400/600?random=44,https://picsum.photos/400/600?random=45}	[{"size": "M", "color": "Noir", "stock": 12}, {"size": "L", "color": "Blanc", "stock": 2}]	{sport,tendance,nouveau}	[{"user": "User44", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
94	Produit Test 45	Description détaillée du produit test 45	782.09	56	2	https://picsum.photos/400/600?random=45	Adidas	{https://picsum.photos/400/600?random=45,https://picsum.photos/400/600?random=46}	[{"size": "M", "color": "Noir", "stock": 25}, {"size": "L", "color": "Blanc", "stock": 10}]	{sport,tendance,nouveau}	[{"user": "User45", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
95	Produit Test 46	Description détaillée du produit test 46	702.52	55	2	https://picsum.photos/400/600?random=46	Puma	{https://picsum.photos/400/600?random=46,https://picsum.photos/400/600?random=47}	[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 3}]	{sport,tendance,nouveau}	[{"user": "User46", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
96	Produit Test 47	Description détaillée du produit test 47	422.57	91	2	https://picsum.photos/400/600?random=47	Under Armour	{https://picsum.photos/400/600?random=47,https://picsum.photos/400/600?random=48}	[{"size": "M", "color": "Noir", "stock": 9}, {"size": "L", "color": "Blanc", "stock": 44}]	{sport,tendance,nouveau}	[{"user": "User47", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
97	Produit Test 48	Description détaillée du produit test 48	525.19	33	2	https://picsum.photos/400/600?random=48	Nike	{https://picsum.photos/400/600?random=48,https://picsum.photos/400/600?random=49}	[{"size": "M", "color": "Noir", "stock": 46}, {"size": "L", "color": "Blanc", "stock": 49}]	{sport,tendance,nouveau}	[{"user": "User48", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
98	Produit Test 49	Description détaillée du produit test 49	846.96	95	2	https://picsum.photos/400/600?random=49	Adidas	{https://picsum.photos/400/600?random=49,https://picsum.photos/400/600?random=50}	[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 14}]	{sport,tendance,nouveau}	[{"user": "User49", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
99	Produit Test 50	Description détaillée du produit test 50	525.47	80	2	https://picsum.photos/400/600?random=50	Puma	{https://picsum.photos/400/600?random=50,https://picsum.photos/400/600?random=51}	[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 24}]	{sport,tendance,nouveau}	[{"user": "User50", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
100	Produit Test 51	Description détaillée du produit test 51	413.93	81	2	https://picsum.photos/400/600?random=51	Under Armour	{https://picsum.photos/400/600?random=51,https://picsum.photos/400/600?random=52}	[{"size": "M", "color": "Noir", "stock": 27}, {"size": "L", "color": "Blanc", "stock": 5}]	{sport,tendance,nouveau}	[{"user": "User51", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
101	Produit Test 52	Description détaillée du produit test 52	98.73	79	2	https://picsum.photos/400/600?random=52	Nike	{https://picsum.photos/400/600?random=52,https://picsum.photos/400/600?random=53}	[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 31}]	{sport,tendance,nouveau}	[{"user": "User52", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
102	Produit Test 53	Description détaillée du produit test 53	661.11	58	2	https://picsum.photos/400/600?random=53	Adidas	{https://picsum.photos/400/600?random=53,https://picsum.photos/400/600?random=54}	[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 39}]	{sport,tendance,nouveau}	[{"user": "User53", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
103	Produit Test 54	Description détaillée du produit test 54	598.15	61	2	https://picsum.photos/400/600?random=54	Puma	{https://picsum.photos/400/600?random=54,https://picsum.photos/400/600?random=55}	[{"size": "M", "color": "Noir", "stock": 47}, {"size": "L", "color": "Blanc", "stock": 18}]	{sport,tendance,nouveau}	[{"user": "User54", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
104	Produit Test 55	Description détaillée du produit test 55	324.41	81	2	https://picsum.photos/400/600?random=55	Under Armour	{https://picsum.photos/400/600?random=55,https://picsum.photos/400/600?random=56}	[{"size": "M", "color": "Noir", "stock": 4}, {"size": "L", "color": "Blanc", "stock": 21}]	{sport,tendance,nouveau}	[{"user": "User55", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
105	Produit Test 56	Description détaillée du produit test 56	747.67	25	2	https://picsum.photos/400/600?random=56	Nike	{https://picsum.photos/400/600?random=56,https://picsum.photos/400/600?random=57}	[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 43}]	{sport,tendance,nouveau}	[{"user": "User56", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
106	Produit Test 57	Description détaillée du produit test 57	540.16	83	2	https://picsum.photos/400/600?random=57	Adidas	{https://picsum.photos/400/600?random=57,https://picsum.photos/400/600?random=58}	[{"size": "M", "color": "Noir", "stock": 23}, {"size": "L", "color": "Blanc", "stock": 29}]	{sport,tendance,nouveau}	[{"user": "User57", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
107	Produit Test 58	Description détaillée du produit test 58	400.31	65	2	https://picsum.photos/400/600?random=58	Puma	{https://picsum.photos/400/600?random=58,https://picsum.photos/400/600?random=59}	[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 46}]	{sport,tendance,nouveau}	[{"user": "User58", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
108	Produit Test 59	Description détaillée du produit test 59	862.47	81	2	https://picsum.photos/400/600?random=59	Under Armour	{https://picsum.photos/400/600?random=59,https://picsum.photos/400/600?random=60}	[{"size": "M", "color": "Noir", "stock": 36}, {"size": "L", "color": "Blanc", "stock": 37}]	{sport,tendance,nouveau}	[{"user": "User59", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
109	Produit Test 60	Description détaillée du produit test 60	848.48	86	2	https://picsum.photos/400/600?random=60	Nike	{https://picsum.photos/400/600?random=60,https://picsum.photos/400/600?random=61}	[{"size": "M", "color": "Noir", "stock": 37}, {"size": "L", "color": "Blanc", "stock": 44}]	{sport,tendance,nouveau}	[{"user": "User60", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
110	Produit Test 61	Description détaillée du produit test 61	81.48	35	2	https://picsum.photos/400/600?random=61	Adidas	{https://picsum.photos/400/600?random=61,https://picsum.photos/400/600?random=62}	[{"size": "M", "color": "Noir", "stock": 10}, {"size": "L", "color": "Blanc", "stock": 48}]	{sport,tendance,nouveau}	[{"user": "User61", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
111	Produit Test 62	Description détaillée du produit test 62	637.43	92	2	https://picsum.photos/400/600?random=62	Puma	{https://picsum.photos/400/600?random=62,https://picsum.photos/400/600?random=63}	[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 8}]	{sport,tendance,nouveau}	[{"user": "User62", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
112	Produit Test 63	Description détaillée du produit test 63	206.80	80	2	https://picsum.photos/400/600?random=63	Under Armour	{https://picsum.photos/400/600?random=63,https://picsum.photos/400/600?random=64}	[{"size": "M", "color": "Noir", "stock": 4}, {"size": "L", "color": "Blanc", "stock": 44}]	{sport,tendance,nouveau}	[{"user": "User63", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
113	Produit Test 64	Description détaillée du produit test 64	102.27	44	2	https://picsum.photos/400/600?random=64	Nike	{https://picsum.photos/400/600?random=64,https://picsum.photos/400/600?random=65}	[{"size": "M", "color": "Noir", "stock": 29}, {"size": "L", "color": "Blanc", "stock": 9}]	{sport,tendance,nouveau}	[{"user": "User64", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
114	Produit Test 65	Description détaillée du produit test 65	914.62	36	2	https://picsum.photos/400/600?random=65	Adidas	{https://picsum.photos/400/600?random=65,https://picsum.photos/400/600?random=66}	[{"size": "M", "color": "Noir", "stock": 46}, {"size": "L", "color": "Blanc", "stock": 41}]	{sport,tendance,nouveau}	[{"user": "User65", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
115	Produit Test 66	Description détaillée du produit test 66	974.60	0	2	https://picsum.photos/400/600?random=66	Puma	{https://picsum.photos/400/600?random=66,https://picsum.photos/400/600?random=67}	[{"size": "M", "color": "Noir", "stock": 37}, {"size": "L", "color": "Blanc", "stock": 49}]	{sport,tendance,nouveau}	[{"user": "User66", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
116	Produit Test 67	Description détaillée du produit test 67	763.50	43	2	https://picsum.photos/400/600?random=67	Under Armour	{https://picsum.photos/400/600?random=67,https://picsum.photos/400/600?random=68}	[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 27}]	{sport,tendance,nouveau}	[{"user": "User67", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
117	Produit Test 68	Description détaillée du produit test 68	520.44	69	2	https://picsum.photos/400/600?random=68	Nike	{https://picsum.photos/400/600?random=68,https://picsum.photos/400/600?random=69}	[{"size": "M", "color": "Noir", "stock": 33}, {"size": "L", "color": "Blanc", "stock": 34}]	{sport,tendance,nouveau}	[{"user": "User68", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
118	Produit Test 69	Description détaillée du produit test 69	959.63	58	2	https://picsum.photos/400/600?random=69	Adidas	{https://picsum.photos/400/600?random=69,https://picsum.photos/400/600?random=70}	[{"size": "M", "color": "Noir", "stock": 1}, {"size": "L", "color": "Blanc", "stock": 14}]	{sport,tendance,nouveau}	[{"user": "User69", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
119	Produit Test 70	Description détaillée du produit test 70	378.05	32	2	https://picsum.photos/400/600?random=70	Puma	{https://picsum.photos/400/600?random=70,https://picsum.photos/400/600?random=71}	[{"size": "M", "color": "Noir", "stock": 30}, {"size": "L", "color": "Blanc", "stock": 29}]	{sport,tendance,nouveau}	[{"user": "User70", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
120	Produit Test 71	Description détaillée du produit test 71	978.44	31	2	https://picsum.photos/400/600?random=71	Under Armour	{https://picsum.photos/400/600?random=71,https://picsum.photos/400/600?random=72}	[{"size": "M", "color": "Noir", "stock": 32}, {"size": "L", "color": "Blanc", "stock": 11}]	{sport,tendance,nouveau}	[{"user": "User71", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
121	Produit Test 72	Description détaillée du produit test 72	881.11	32	2	https://picsum.photos/400/600?random=72	Nike	{https://picsum.photos/400/600?random=72,https://picsum.photos/400/600?random=73}	[{"size": "M", "color": "Noir", "stock": 42}, {"size": "L", "color": "Blanc", "stock": 22}]	{sport,tendance,nouveau}	[{"user": "User72", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
122	Produit Test 73	Description détaillée du produit test 73	881.35	2	2	https://picsum.photos/400/600?random=73	Adidas	{https://picsum.photos/400/600?random=73,https://picsum.photos/400/600?random=74}	[{"size": "M", "color": "Noir", "stock": 10}, {"size": "L", "color": "Blanc", "stock": 35}]	{sport,tendance,nouveau}	[{"user": "User73", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
123	Produit Test 74	Description détaillée du produit test 74	286.39	38	2	https://picsum.photos/400/600?random=74	Puma	{https://picsum.photos/400/600?random=74,https://picsum.photos/400/600?random=75}	[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 38}]	{sport,tendance,nouveau}	[{"user": "User74", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
124	Produit Test 75	Description détaillée du produit test 75	226.10	80	2	https://picsum.photos/400/600?random=75	Under Armour	{https://picsum.photos/400/600?random=75,https://picsum.photos/400/600?random=76}	[{"size": "M", "color": "Noir", "stock": 45}, {"size": "L", "color": "Blanc", "stock": 30}]	{sport,tendance,nouveau}	[{"user": "User75", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
125	Produit Test 76	Description détaillée du produit test 76	148.65	2	2	https://picsum.photos/400/600?random=76	Nike	{https://picsum.photos/400/600?random=76,https://picsum.photos/400/600?random=77}	[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 25}]	{sport,tendance,nouveau}	[{"user": "User76", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
126	Produit Test 77	Description détaillée du produit test 77	263.15	20	2	https://picsum.photos/400/600?random=77	Adidas	{https://picsum.photos/400/600?random=77,https://picsum.photos/400/600?random=78}	[{"size": "M", "color": "Noir", "stock": 20}, {"size": "L", "color": "Blanc", "stock": 5}]	{sport,tendance,nouveau}	[{"user": "User77", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
127	Produit Test 78	Description détaillée du produit test 78	923.71	50	2	https://picsum.photos/400/600?random=78	Puma	{https://picsum.photos/400/600?random=78,https://picsum.photos/400/600?random=79}	[{"size": "M", "color": "Noir", "stock": 8}, {"size": "L", "color": "Blanc", "stock": 47}]	{sport,tendance,nouveau}	[{"user": "User78", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
128	Produit Test 79	Description détaillée du produit test 79	237.29	1	2	https://picsum.photos/400/600?random=79	Under Armour	{https://picsum.photos/400/600?random=79,https://picsum.photos/400/600?random=80}	[{"size": "M", "color": "Noir", "stock": 6}, {"size": "L", "color": "Blanc", "stock": 35}]	{sport,tendance,nouveau}	[{"user": "User79", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
129	Produit Test 80	Description détaillée du produit test 80	243.01	88	2	https://picsum.photos/400/600?random=80	Nike	{https://picsum.photos/400/600?random=80,https://picsum.photos/400/600?random=81}	[{"size": "M", "color": "Noir", "stock": 12}, {"size": "L", "color": "Blanc", "stock": 48}]	{sport,tendance,nouveau}	[{"user": "User80", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
130	Produit Test 81	Description détaillée du produit test 81	825.18	96	2	https://picsum.photos/400/600?random=81	Adidas	{https://picsum.photos/400/600?random=81,https://picsum.photos/400/600?random=82}	[{"size": "M", "color": "Noir", "stock": 1}, {"size": "L", "color": "Blanc", "stock": 32}]	{sport,tendance,nouveau}	[{"user": "User81", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
131	Produit Test 82	Description détaillée du produit test 82	879.01	4	2	https://picsum.photos/400/600?random=82	Puma	{https://picsum.photos/400/600?random=82,https://picsum.photos/400/600?random=83}	[{"size": "M", "color": "Noir", "stock": 39}, {"size": "L", "color": "Blanc", "stock": 12}]	{sport,tendance,nouveau}	[{"user": "User82", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
132	Produit Test 83	Description détaillée du produit test 83	426.16	38	2	https://picsum.photos/400/600?random=83	Under Armour	{https://picsum.photos/400/600?random=83,https://picsum.photos/400/600?random=84}	[{"size": "M", "color": "Noir", "stock": 17}, {"size": "L", "color": "Blanc", "stock": 39}]	{sport,tendance,nouveau}	[{"user": "User83", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
133	Produit Test 84	Description détaillée du produit test 84	486.03	45	2	https://picsum.photos/400/600?random=84	Nike	{https://picsum.photos/400/600?random=84,https://picsum.photos/400/600?random=85}	[{"size": "M", "color": "Noir", "stock": 21}, {"size": "L", "color": "Blanc", "stock": 2}]	{sport,tendance,nouveau}	[{"user": "User84", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
134	Produit Test 85	Description détaillée du produit test 85	323.27	9	2	https://picsum.photos/400/600?random=85	Adidas	{https://picsum.photos/400/600?random=85,https://picsum.photos/400/600?random=86}	[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 32}]	{sport,tendance,nouveau}	[{"user": "User85", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
135	Produit Test 86	Description détaillée du produit test 86	602.46	22	2	https://picsum.photos/400/600?random=86	Puma	{https://picsum.photos/400/600?random=86,https://picsum.photos/400/600?random=87}	[{"size": "M", "color": "Noir", "stock": 10}, {"size": "L", "color": "Blanc", "stock": 22}]	{sport,tendance,nouveau}	[{"user": "User86", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
136	Produit Test 87	Description détaillée du produit test 87	694.99	33	2	https://picsum.photos/400/600?random=87	Under Armour	{https://picsum.photos/400/600?random=87,https://picsum.photos/400/600?random=88}	[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 12}]	{sport,tendance,nouveau}	[{"user": "User87", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
137	Produit Test 88	Description détaillée du produit test 88	838.65	56	2	https://picsum.photos/400/600?random=88	Nike	{https://picsum.photos/400/600?random=88,https://picsum.photos/400/600?random=89}	[{"size": "M", "color": "Noir", "stock": 31}, {"size": "L", "color": "Blanc", "stock": 1}]	{sport,tendance,nouveau}	[{"user": "User88", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
138	Produit Test 89	Description détaillée du produit test 89	195.56	16	2	https://picsum.photos/400/600?random=89	Adidas	{https://picsum.photos/400/600?random=89,https://picsum.photos/400/600?random=90}	[{"size": "M", "color": "Noir", "stock": 32}, {"size": "L", "color": "Blanc", "stock": 47}]	{sport,tendance,nouveau}	[{"user": "User89", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
139	Produit Test 90	Description détaillée du produit test 90	51.61	90	2	https://picsum.photos/400/600?random=90	Puma	{https://picsum.photos/400/600?random=90,https://picsum.photos/400/600?random=91}	[{"size": "M", "color": "Noir", "stock": 16}, {"size": "L", "color": "Blanc", "stock": 37}]	{sport,tendance,nouveau}	[{"user": "User90", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
140	Produit Test 91	Description détaillée du produit test 91	184.47	94	2	https://picsum.photos/400/600?random=91	Under Armour	{https://picsum.photos/400/600?random=91,https://picsum.photos/400/600?random=92}	[{"size": "M", "color": "Noir", "stock": 6}, {"size": "L", "color": "Blanc", "stock": 36}]	{sport,tendance,nouveau}	[{"user": "User91", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
141	Produit Test 92	Description détaillée du produit test 92	925.28	83	2	https://picsum.photos/400/600?random=92	Nike	{https://picsum.photos/400/600?random=92,https://picsum.photos/400/600?random=93}	[{"size": "M", "color": "Noir", "stock": 0}, {"size": "L", "color": "Blanc", "stock": 49}]	{sport,tendance,nouveau}	[{"user": "User92", "rating": 5, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
142	Produit Test 93	Description détaillée du produit test 93	683.98	14	2	https://picsum.photos/400/600?random=93	Adidas	{https://picsum.photos/400/600?random=93,https://picsum.photos/400/600?random=94}	[{"size": "M", "color": "Noir", "stock": 30}, {"size": "L", "color": "Blanc", "stock": 1}]	{sport,tendance,nouveau}	[{"user": "User93", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
143	Produit Test 94	Description détaillée du produit test 94	750.04	39	2	https://picsum.photos/400/600?random=94	Puma	{https://picsum.photos/400/600?random=94,https://picsum.photos/400/600?random=95}	[{"size": "M", "color": "Noir", "stock": 29}, {"size": "L", "color": "Blanc", "stock": 23}]	{sport,tendance,nouveau}	[{"user": "User94", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
144	Produit Test 95	Description détaillée du produit test 95	866.86	29	2	https://picsum.photos/400/600?random=95	Under Armour	{https://picsum.photos/400/600?random=95,https://picsum.photos/400/600?random=96}	[{"size": "M", "color": "Noir", "stock": 49}, {"size": "L", "color": "Blanc", "stock": 42}]	{sport,tendance,nouveau}	[{"user": "User95", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
145	Produit Test 96	Description détaillée du produit test 96	355.49	42	2	https://picsum.photos/400/600?random=96	Nike	{https://picsum.photos/400/600?random=96,https://picsum.photos/400/600?random=97}	[{"size": "M", "color": "Noir", "stock": 28}, {"size": "L", "color": "Blanc", "stock": 19}]	{sport,tendance,nouveau}	[{"user": "User96", "rating": 4, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
146	Produit Test 97	Description détaillée du produit test 97	600.30	44	2	https://picsum.photos/400/600?random=97	Adidas	{https://picsum.photos/400/600?random=97,https://picsum.photos/400/600?random=98}	[{"size": "M", "color": "Noir", "stock": 45}, {"size": "L", "color": "Blanc", "stock": 29}]	{sport,tendance,nouveau}	[{"user": "User97", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	kids	f	\N
147	Produit Test 98	Description détaillée du produit test 98	313.86	51	2	https://picsum.photos/400/600?random=98	Puma	{https://picsum.photos/400/600?random=98,https://picsum.photos/400/600?random=99}	[{"size": "M", "color": "Noir", "stock": 5}, {"size": "L", "color": "Blanc", "stock": 46}]	{sport,tendance,nouveau}	[{"user": "User98", "rating": 1, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	sneakers	f	\N
148	Produit Test 99	Description détaillée du produit test 99	678.58	40	2	https://picsum.photos/400/600?random=99	Under Armour	{https://picsum.photos/400/600?random=99,https://picsum.photos/400/600?random=100}	[{"size": "M", "color": "Noir", "stock": 1}, {"size": "L", "color": "Blanc", "stock": 16}]	{sport,tendance,nouveau}	[{"user": "User99", "rating": 2, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	cpcompany	f	\N
149	Produit Test 100	Description détaillée du produit test 100	859.10	12	2	https://picsum.photos/400/600?random=100	Nike	{https://picsum.photos/400/600?random=100,https://picsum.photos/400/600?random=101}	[{"size": "M", "color": "Noir", "stock": 1}, {"size": "L", "color": "Blanc", "stock": 49}]	{sport,tendance,nouveau}	[{"user": "User100", "rating": 3, "comment": "Très bon produit!"}]	[{"answer": "Taille standard.", "question": "Question sur la taille?"}]	[{"answer": "Lavage à 30°C", "question": "Comment laver?"}]	{"L": "42-44", "M": "40-42", "S": "38-40", "XL": "44-46", "XS": "36-38"}	adult	f	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, user_id, product_id, rating, comment, created_at, updated_at) FROM stdin;
1	1	35	4	J'adore	2025-02-18 21:55:06.052023	2025-02-18 21:55:06.052023
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, site_name, site_description, contact_email, enable_registration, enable_checkout, maintenance_mode, currency, tax_rate, updated_at) FROM stdin;
1	REBOUL STORE ONLINE	...	contact@example.com	t	t	f	EUR	20.00	2025-02-20 12:50:57.896776
\.


--
-- Data for Name: stats_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stats_cache (id, stat_type, stat_date, data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password_hash, first_name, last_name, is_admin, created_at, notification_settings) FROM stdin;
1	zoran	zoran@reboul.com	$2b$10$UzLt9qVpmXa9vSRmhBs2O.MwEf3aC1oS..TY18g8lAzoE/SNXt6lG	zoran		t	2025-01-01 13:10:41.056359+01	{"push": true, "email": true, "security": true, "marketing": true}
3	jaab	jaab@reboul.com	$2b$10$lCQosEgj19A9w4S/a/hX9eKm/qXvEQPaQwfd8VUIlPguks98nCwUO	thomas	lorenzi	f	2025-01-02 11:09:26.046441+01	{"push": false, "email": true, "security": true, "marketing": false}
7	oklotso	zorhan@reboul.com	$2b$10$JnBnOku5qSMhBFjRsKJ9b.WT0p7GGG9hbw4tpkwuDc6MBetp6KI5a	\N	\N	f	2025-02-19 01:08:25.143518+01	{"push": false, "email": true, "security": true, "marketing": false}
\.


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.addresses_id_seq', 3, true);


--
-- Name: archives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.archives_id_seq', 2, true);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_id_seq', 36, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 25, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favorites_id_seq', 15, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 13, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 21, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 149, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, true);


--
-- Name: stats_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stats_cache_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: archives archives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archives
    ADD CONSTRAINT archives_pkey PRIMARY KEY (id);


--
-- Name: brands brands_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_name_key UNIQUE (name);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: stats_cache stats_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stats_cache
    ADD CONSTRAINT stats_cache_pkey PRIMARY KEY (id);


--
-- Name: stats_cache stats_cache_stat_type_stat_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stats_cache
    ADD CONSTRAINT stats_cache_stat_type_stat_date_key UNIQUE (stat_type, stat_date);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_favorites_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorites_product_id ON public.favorites USING btree (product_id);


--
-- Name: idx_favorites_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_stats_cache_type_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stats_cache_type_date ON public.stats_cache USING btree (stat_type, stat_date);


--
-- Name: archives update_archives_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_archives_updated_at BEFORE UPDATE ON public.archives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_orders_updated_at();


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

