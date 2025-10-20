--
-- PostgreSQL database dump
--

\restrict hFhSwPbEgbZ8xK1CtvIdahuAygXcU7mkehLpmZraj4bhRe20Um2LYCalsoAjFK8

-- Dumped from database version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: activities_status_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.activities_status_enum AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled'
);


ALTER TYPE public.activities_status_enum OWNER TO ibrahima;

--
-- Name: activities_type_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.activities_type_enum AS ENUM (
    'attendance',
    'participation',
    'contribution',
    'donation',
    'volunteer',
    'feedback',
    'completion'
);


ALTER TYPE public.activities_type_enum OWNER TO ibrahima;

--
-- Name: announcements_status_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.announcements_status_enum AS ENUM (
    'draft',
    'published',
    'ongoing',
    'completed',
    'archived'
);


ALTER TYPE public.announcements_status_enum OWNER TO ibrahima;

--
-- Name: announcements_type_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.announcements_type_enum AS ENUM (
    'meeting',
    'general_assembly',
    'event',
    'activity',
    'info'
);


ALTER TYPE public.announcements_type_enum OWNER TO ibrahima;

--
-- Name: categories_type_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.categories_type_enum AS ENUM (
    'general',
    'coran',
    'hadith',
    'fiqh',
    'sira',
    'aqida',
    'education',
    'community',
    'events'
);


ALTER TYPE public.categories_type_enum OWNER TO ibrahima;

--
-- Name: event_logs_eventtype_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.event_logs_eventtype_enum AS ENUM (
    'page_view',
    'user_login',
    'user_logout',
    'user_register',
    'media_view',
    'media_like',
    'media_download',
    'event_join',
    'event_leave',
    'prayer_time_view',
    'marketplace_view',
    'product_view',
    'order_create',
    'order_complete',
    'search',
    'click',
    'error'
);


ALTER TYPE public.event_logs_eventtype_enum OWNER TO ibrahima;

--
-- Name: events_status_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.events_status_enum AS ENUM (
    'draft',
    'published',
    'cancelled',
    'completed',
    'ongoing'
);


ALTER TYPE public.events_status_enum OWNER TO ibrahima;

--
-- Name: events_type_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.events_type_enum AS ENUM (
    'conference',
    'workshop',
    'prayer',
    'study_circle',
    'community_gathering',
    'charity',
    'ramadan',
    'eid',
    'hajj_umrah',
    'online'
);


ALTER TYPE public.events_type_enum OWNER TO ibrahima;

--
-- Name: media_status_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.media_status_enum AS ENUM (
    'draft',
    'published',
    'archived',
    'moderation',
    'rejected'
);


ALTER TYPE public.media_status_enum OWNER TO ibrahima;

--
-- Name: media_type_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.media_type_enum AS ENUM (
    'image',
    'video',
    'audio',
    'document',
    'podcast',
    'live'
);


ALTER TYPE public.media_type_enum OWNER TO ibrahima;

--
-- Name: notification_templates_type_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.notification_templates_type_enum AS ENUM (
    'info',
    'success',
    'warning',
    'error',
    'prayer_reminder',
    'event_reminder',
    'new_content',
    'system'
);


ALTER TYPE public.notification_templates_type_enum OWNER TO ibrahima;

--
-- Name: notifications_priority_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.notifications_priority_enum AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE public.notifications_priority_enum OWNER TO ibrahima;

--
-- Name: notifications_type_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.notifications_type_enum AS ENUM (
    'info',
    'success',
    'warning',
    'error',
    'prayer_reminder',
    'event_reminder',
    'new_content',
    'system'
);


ALTER TYPE public.notifications_type_enum OWNER TO ibrahima;

--
-- Name: orders_paymentmethod_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.orders_paymentmethod_enum AS ENUM (
    'credit_card',
    'paypal',
    'bank_transfer',
    'cash_on_delivery',
    'crypto'
);


ALTER TYPE public.orders_paymentmethod_enum OWNER TO ibrahima;

--
-- Name: orders_paymentstatus_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.orders_paymentstatus_enum AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
);


ALTER TYPE public.orders_paymentstatus_enum OWNER TO ibrahima;

--
-- Name: orders_status_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.orders_status_enum AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);


ALTER TYPE public.orders_status_enum OWNER TO ibrahima;

--
-- Name: products_category_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.products_category_enum AS ENUM (
    'books',
    'clothing',
    'electronics',
    'home_decor',
    'food',
    'gifts',
    'education',
    'health',
    'services',
    'digital'
);


ALTER TYPE public.products_category_enum OWNER TO ibrahima;

--
-- Name: products_status_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.products_status_enum AS ENUM (
    'draft',
    'active',
    'inactive',
    'out_of_stock',
    'discontinued'
);


ALTER TYPE public.products_status_enum OWNER TO ibrahima;

--
-- Name: reviews_status_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.reviews_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.reviews_status_enum OWNER TO ibrahima;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.users_role_enum AS ENUM (
    'visitor',
    'member',
    'admin',
    'scholar',
    'imam'
);


ALTER TYPE public.users_role_enum OWNER TO ibrahima;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: ibrahima
--

CREATE TYPE public.users_status_enum AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending'
);


ALTER TYPE public.users_status_enum OWNER TO ibrahima;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.activities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    date timestamp without time zone NOT NULL,
    location character varying(255),
    type public.activities_type_enum DEFAULT 'participation'::public.activities_type_enum NOT NULL,
    status public.activities_status_enum DEFAULT 'pending'::public.activities_status_enum NOT NULL,
    "pointsEarned" integer DEFAULT 0 NOT NULL,
    metadata json,
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "participantId" uuid NOT NULL,
    "eventId" uuid
);


ALTER TABLE public.activities OWNER TO ibrahima;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.announcements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type public.announcements_type_enum DEFAULT 'event'::public.announcements_type_enum NOT NULL,
    "startAt" timestamp without time zone NOT NULL,
    "endAt" timestamp without time zone,
    location character varying(255),
    link character varying(500),
    status public.announcements_status_enum DEFAULT 'draft'::public.announcements_status_enum NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.announcements OWNER TO ibrahima;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    "addedAt" timestamp without time zone,
    options json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "cartId" uuid NOT NULL,
    "productId" uuid NOT NULL
);


ALTER TABLE public.cart_items OWNER TO ibrahima;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.carts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "totalAmount" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "itemCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp without time zone,
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "userId" uuid NOT NULL
);


ALTER TABLE public.carts OWNER TO ibrahima;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    type public.categories_type_enum DEFAULT 'general'::public.categories_type_enum NOT NULL,
    icon character varying(255),
    color character varying(50),
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "requiresModeration" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.categories OWNER TO ibrahima;

--
-- Name: event_logs; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.event_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "eventType" public.event_logs_eventtype_enum NOT NULL,
    data json NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    "sessionId" character varying(100),
    "ipAddress" character varying(50),
    "userAgent" character varying(500),
    referrer character varying(500),
    page character varying(255),
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid
);


ALTER TABLE public.event_logs OWNER TO ibrahima;

--
-- Name: event_participants; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.event_participants (
    "eventId" uuid NOT NULL,
    "userId" uuid NOT NULL
);


ALTER TABLE public.event_participants OWNER TO ibrahima;

--
-- Name: events; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    date timestamp without time zone NOT NULL,
    "endDate" timestamp without time zone,
    location character varying(255),
    address character varying(255),
    city character varying(100),
    type public.events_type_enum DEFAULT 'community_gathering'::public.events_type_enum NOT NULL,
    status public.events_status_enum DEFAULT 'draft'::public.events_status_enum NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "isOnline" boolean DEFAULT false NOT NULL,
    "onlineLink" character varying(500),
    "maxParticipants" integer,
    "currentParticipants" integer DEFAULT 0 NOT NULL,
    "requiresRegistration" boolean DEFAULT false NOT NULL,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    banner character varying(500),
    tags text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "organizerId" uuid NOT NULL
);


ALTER TABLE public.events OWNER TO ibrahima;

--
-- Name: media; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.media (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    url character varying(500) NOT NULL,
    type public.media_type_enum NOT NULL,
    status public.media_status_enum DEFAULT 'draft'::public.media_status_enum NOT NULL,
    tags text,
    likes integer DEFAULT 0 NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    downloads integer DEFAULT 0 NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    duration integer,
    thumbnail character varying(500),
    "fileSize" integer,
    "mimeType" character varying(100),
    source character varying(255),
    "isVerified" boolean DEFAULT false NOT NULL,
    transcript text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "userId" uuid NOT NULL,
    "categoryId" uuid
);


ALTER TABLE public.media OWNER TO ibrahima;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.notification_templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    body text NOT NULL,
    type public.notification_templates_type_enum NOT NULL,
    channels text NOT NULL,
    "emailTemplate" text,
    "smsTemplate" text,
    "pushTemplate" text,
    variables text,
    "isActive" boolean DEFAULT true NOT NULL,
    description text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.notification_templates OWNER TO ibrahima;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type public.notifications_type_enum DEFAULT 'info'::public.notifications_type_enum NOT NULL,
    priority public.notifications_priority_enum DEFAULT 'normal'::public.notifications_priority_enum NOT NULL,
    channels text DEFAULT '["in_app"]'::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp without time zone,
    "scheduledFor" timestamp without time zone,
    sent boolean DEFAULT false NOT NULL,
    "sentAt" timestamp without time zone,
    data json,
    "actionUrl" character varying(500),
    "actionText" character varying(100),
    "imageUrl" character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    user_id uuid NOT NULL,
    "userId" uuid NOT NULL
);


ALTER TABLE public.notifications OWNER TO ibrahima;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    "productName" character varying(255) NOT NULL,
    "productDescription" text,
    "productImage" character varying(500),
    "productMetadata" json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "orderId" uuid NOT NULL,
    "productId" uuid NOT NULL
);


ALTER TABLE public.order_items OWNER TO ibrahima;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "orderNumber" character varying(50) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "shippingCost" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "taxAmount" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "discountAmount" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    status public.orders_status_enum DEFAULT 'pending'::public.orders_status_enum NOT NULL,
    "paymentStatus" public.orders_paymentstatus_enum DEFAULT 'pending'::public.orders_paymentstatus_enum NOT NULL,
    "paymentMethod" public.orders_paymentmethod_enum,
    "paymentTransactionId" character varying(255),
    "paidAt" timestamp without time zone,
    "shippingAddress" character varying(255),
    "shippingCity" character varying(100),
    "shippingPostalCode" character varying(20),
    "shippingCountry" character varying(100),
    "shippingPhone" character varying(20),
    "billingAddress" character varying(255),
    "billingCity" character varying(100),
    "billingPostalCode" character varying(20),
    "billingCountry" character varying(100),
    "billingPhone" character varying(20),
    "trackingNumber" character varying(255),
    "shippingCarrier" character varying(100),
    "shippedAt" timestamp without time zone,
    "deliveredAt" timestamp without time zone,
    notes text,
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "userId" uuid NOT NULL
);


ALTER TABLE public.orders OWNER TO ibrahima;

--
-- Name: products; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "originalPrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    "minStock" integer,
    category public.products_category_enum DEFAULT 'books'::public.products_category_enum NOT NULL,
    status public.products_status_enum DEFAULT 'draft'::public.products_status_enum NOT NULL,
    images text,
    tags text,
    brand character varying(100),
    model character varying(100),
    weight integer,
    dimensions json,
    "isDigital" boolean DEFAULT false NOT NULL,
    "requiresShipping" boolean DEFAULT false NOT NULL,
    "shippingCost" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    sales integer DEFAULT 0 NOT NULL,
    rating numeric(3,2) DEFAULT '0'::numeric NOT NULL,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "sellerId" uuid NOT NULL
);


ALTER TABLE public.products OWNER TO ibrahima;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    rating numeric(2,1) NOT NULL,
    comment text,
    status public.reviews_status_enum DEFAULT 'pending'::public.reviews_status_enum NOT NULL,
    "isVerifiedPurchase" boolean DEFAULT false NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    images text,
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    "userId" uuid NOT NULL,
    "productId" uuid NOT NULL
);


ALTER TABLE public.reviews OWNER TO ibrahima;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "sessionId" character varying(100) NOT NULL,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone,
    duration integer,
    "pageViews" integer DEFAULT 0 NOT NULL,
    device character varying(100),
    browser character varying(100),
    "operatingSystem" character varying(50),
    "ipAddress" character varying(50),
    country character varying(100),
    city character varying(100),
    referrer character varying(500),
    "landingPage" character varying(500),
    "exitPage" character varying(500),
    "isActive" boolean DEFAULT false NOT NULL,
    metadata json,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO ibrahima;

--
-- Name: users; Type: TABLE; Schema: public; Owner: ibrahima
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    telephone character varying(20),
    adresse character varying(255),
    ville character varying(100),
    universite character varying(150),
    eno_rattachement character varying(100),
    filiere character varying(100),
    annee_promotion character varying(50),
    niveau character varying(50),
    motivation text,
    password character varying NOT NULL,
    role public.users_role_enum DEFAULT 'visitor'::public.users_role_enum NOT NULL,
    status public.users_status_enum DEFAULT 'pending'::public.users_status_enum NOT NULL,
    avatar character varying(255),
    bio text,
    points integer DEFAULT 0 NOT NULL,
    badges text,
    favorites text,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLoginAt" timestamp without time zone,
    "emailVerifiedAt" timestamp without time zone,
    "phoneVerifiedAt" timestamp without time zone,
    date_inscription timestamp without time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.users OWNER TO ibrahima;

--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.activities (id, title, description, date, location, type, status, "pointsEarned", metadata, notes, "createdAt", "updatedAt", "deletedAt", "participantId", "eventId") FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.announcements (id, title, description, type, "startAt", "endAt", location, link, status, "isFeatured", metadata, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.cart_items (id, quantity, price, "totalPrice", "addedAt", options, "createdAt", "updatedAt", "cartId", "productId") FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.carts (id, "totalAmount", "itemCount", "isActive", "expiresAt", metadata, "createdAt", "updatedAt", "deletedAt", "userId") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.categories (id, name, description, type, icon, color, "sortOrder", "isActive", "requiresModeration", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: event_logs; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.event_logs (id, "eventType", data, "timestamp", "sessionId", "ipAddress", "userAgent", referrer, page, metadata, "createdAt", "userId") FROM stdin;
\.


--
-- Data for Name: event_participants; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.event_participants ("eventId", "userId") FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.events (id, title, description, date, "endDate", location, address, city, type, status, "isPublic", "isOnline", "onlineLink", "maxParticipants", "currentParticipants", "requiresRegistration", price, banner, tags, "isFeatured", metadata, "createdAt", "updatedAt", "deletedAt", "organizerId") FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.media (id, title, description, url, type, status, tags, likes, views, downloads, "isPublic", duration, thumbnail, "fileSize", "mimeType", source, "isVerified", transcript, "isFeatured", created_at, "createdAt", updated_at, "updatedAt", "deletedAt", "userId", "categoryId") FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.notification_templates (id, name, subject, body, type, channels, "emailTemplate", "smsTemplate", "pushTemplate", variables, "isActive", description, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.notifications (id, title, message, type, priority, channels, read, "readAt", "scheduledFor", sent, "sentAt", data, "actionUrl", "actionText", "imageUrl", created_at, "createdAt", "updatedAt", "deletedAt", user_id, "userId") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.order_items (id, quantity, price, "totalPrice", "productName", "productDescription", "productImage", "productMetadata", "createdAt", "updatedAt", "orderId", "productId") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.orders (id, "orderNumber", subtotal, "shippingCost", "taxAmount", "discountAmount", "totalAmount", status, "paymentStatus", "paymentMethod", "paymentTransactionId", "paidAt", "shippingAddress", "shippingCity", "shippingPostalCode", "shippingCountry", "shippingPhone", "billingAddress", "billingCity", "billingPostalCode", "billingCountry", "billingPhone", "trackingNumber", "shippingCarrier", "shippedAt", "deliveredAt", notes, metadata, "createdAt", "updatedAt", "deletedAt", "userId") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.products (id, name, description, price, "originalPrice", stock, "minStock", category, status, images, tags, brand, model, weight, dimensions, "isDigital", "requiresShipping", "shippingCost", views, sales, rating, "reviewCount", "isFeatured", metadata, "createdAt", "updatedAt", "deletedAt", "sellerId") FROM stdin;
948c1aa6-8b24-4d35-9ea2-94d32db54ae6	dfghjkl	\N	24.00	\N	0	\N	food	draft	fghjk	\N	\N	\N	\N	\N	f	f	0.00	0	0	0.00	0	f	\N	2025-09-17 10:51:10.987359	2025-09-17 10:51:10.987359	\N	71946fac-c557-4079-9647-dbda28ab7b60
9f81830c-e054-4a8a-ba1b-4246c897e75e	dfghjkl	\N	1500.00	\N	26	\N	books	active	hgjkl	\N	\N	\N	\N	\N	f	f	0.00	0	0	0.00	0	t	\N	2025-09-17 12:56:36.642997	2025-09-17 12:56:36.642997	\N	71946fac-c557-4079-9647-dbda28ab7b60
bc256b43-79e5-44c4-a79e-0d8b2ce36e8a	xcfvgbhnj	\N	2345.00	\N	35	\N	clothing	draft	dxfcvgbhnj	\N	\N	\N	\N	\N	f	f	0.00	0	0	0.00	0	f	\N	2025-09-17 13:33:39.213294	2025-09-17 13:33:39.213294	\N	71946fac-c557-4079-9647-dbda28ab7b60
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.reviews (id, rating, comment, status, "isVerifiedPurchase", "helpfulCount", images, metadata, "createdAt", "updatedAt", "deletedAt", "userId", "productId") FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.user_sessions (id, "sessionId", "startTime", "endTime", duration, "pageViews", device, browser, "operatingSystem", "ipAddress", country, city, referrer, "landingPage", "exitPage", "isActive", metadata, "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ibrahima
--

COPY public.users (id, nom, prenom, email, telephone, adresse, ville, universite, eno_rattachement, filiere, annee_promotion, niveau, motivation, password, role, status, avatar, bio, points, badges, favorites, "isActive", "lastLoginAt", "emailVerifiedAt", "phoneVerifiedAt", date_inscription, "createdAt", "updatedAt", "deletedAt") FROM stdin;
15314513-d73b-49aa-a337-ccb6c6b5d085	Diop	Ibrahima	ibrahima.diop@example.sn	+221773456789	Quartier Liberté 6, Dakar	Dakar	Université Cheikh Anta Diop de Dakar (UCAD)	ENO Pikine	Informatique et Télécommunications	2024	Licence 3	Contribuer au développement de ma communauté et approfondir mes connaissances islamiques	$2a$12$dF50icWoh5DQevi5D5fNBOmHkTD26JJa3aSGUd8gCp35at/TjuQz2	visitor	active	\N	\N	0	\N	\N	t	2025-08-25 19:16:14.118	\N	\N	2025-08-25 19:00:38.093	2025-08-25 19:00:38.101738	2025-08-25 19:16:14.124553	\N
fbecf89a-8d2a-4ac3-8fc1-7b9c436fa602	Dupont	Jean	jean.dupont@example.com	+33123456789	123 rue de la Paix	Paris	Université de Paris	ENO001	Informatique	2024	Master 1	Développer mes compétences techniques	$2a$12$T4mC5vaVBP6EyaDHFIwF2.b5qrqzNo6qMEIOmJGQHmAm6i4RRhFSe	member	pending	\N	\N	0	\N	\N	t	\N	\N	\N	2025-09-09 23:37:46.358	2025-09-09 23:37:46.36784	2025-09-09 23:37:46.36784	\N
fb2b14e8-9972-48e4-83fb-fdc3226c71a7	Diallo	Ibrahima	ibrahima.diallo@saraya.tech	+221 78 561 91 15	Sacré Coeur 1	Dakar	Université Numérique Cheikh Hamidou Kane	Mermoz	IDA	20242025	L2		$2a$12$ebirx4QlXS8.5s9tKrXNgeS9n.VKueTt9zFYPJ6IVQoH4oIeVGcyW	member	pending	\N	\N	0	\N	\N	t	\N	\N	\N	2025-09-16 17:46:30.908	2025-09-16 17:46:30.91757	2025-09-16 17:46:30.91757	\N
749b516a-00c7-4296-8e8c-52bbb87ebb05	diallo	Ibrahima	sory.diallo@example.com	221778765432	Sacré coeur 1	Dakar	Université Numérique Cheikh Hamidou Kane	Mermoz	IDA	2024	L2		$2a$12$O4lmAiMKxW1yEkDR.kiuteX2VKWu8xksdakU8uUmWxIIiyrWR6uDW	admin	active	\N	\N	0	\N	\N	t	2025-09-16 22:30:25.49	\N	\N	2025-09-16 22:27:24.737	2025-09-16 22:27:24.74377	2025-09-16 22:30:25.492302	\N
74ab488d-f29d-40d4-9d1c-13a58a9c368b	Diallo	Ibrahima	ibrahima.diallo123@saraya.tech	+221 78 561 91 17	Sacré Coeur 1	Dakar	Université Numérique Cheikh Hamidou Kane	Mermoz	IDA	20242025	L2		$2a$12$E5KUIp0qkOVOgU6MrbMgTu9SxQ0jdsSt62RIGo9D1S1dP3iJ0dL06	member	active	\N	\N	0	\N	\N	t	2025-09-16 18:06:44.263	\N	\N	2025-09-16 17:48:37.432	2025-09-16 17:48:37.434249	2025-09-16 18:06:44.285863	\N
a301e32a-fedd-4274-b971-a1585cccfec8	Diallo	Ibrahima Sory	ibrahimasory.diallo7@uvs.edu.sn	221773456788	Sacré coeur 1	Dakar	Université Numérique Cheikh Hamidou Kane	Mermoz	IDA	2024	L2		$2a$12$a3jtCtPVcHCKbA7pCH6SIeFmtC9ZmprEYWk64kJcj9WQGiUVfb8/S	member	active	\N	\N	0	\N	\N	t	2025-09-16 18:45:19.097	\N	\N	2025-09-16 18:43:30.92	2025-09-16 18:43:30.928353	2025-09-16 18:45:19.100564	\N
04c494cd-f6f5-49bc-8c3f-87b18b135d42	Ba	Abdallah	mamadou.ba@example.com	2217712345	Sacré coeur 1	Pikine	Université Numérique Cheikh Hamidou Kane	Mermoz	IDA	2024	L2		$2a$12$.94UNg5rkHWbGIufqaqsSu6FTnB2/wSGbqrR89LJE8.NIpD33.64a	admin	suspended	\N	\N	0	\N	\N	t	2025-09-16 22:36:46.867	\N	\N	2025-09-16 22:35:55.724	2025-09-16 22:35:55.727121	2025-09-17 13:10:33.776132	\N
2fe55de0-999c-4621-b847-14c3c55274fb	diedhiou	ousseynou	sorydiallo371@gmail.com	221770987654	Sacré coeur 1	Keur Massar	Université Numérique Cheikh Hamidou Kane	Mermoz	IDA	2024	L1		$2a$12$AxFUklN1Ps6ZmX5wpWv4yOmNsqTmO7KDnJCMQY5CVRi6SmN2kJQkq	member	active	\N	\N	0	\N	\N	t	2025-09-16 18:53:00.962	\N	\N	2025-09-16 18:52:13.173	2025-09-16 18:52:13.176501	2025-09-16 18:53:00.964836	\N
71946fac-c557-4079-9647-dbda28ab7b60	Diagne	Lamine	ibrahimasory.diallo@uvs.edu.sn	221778766432	Sacré coeur 1	Pikine	Université Numérique Cheikh Hamidou Kane	Mermoz	IDA	2024	L2		$2a$12$Q9rV4V51Se03B1miXxbj5ew9gA89E0bxAEQgN1nAvIJcyw8/B/vXe	admin	active	\N	\N	0	\N	\N	t	2025-09-17 16:38:54.641	\N	\N	2025-09-17 00:54:01.703	2025-09-17 00:54:01.705885	2025-09-17 16:38:54.645605	\N
df532f62-0aef-485e-8060-a2ad913898a3	Diagne	Moustapha	ibrahima.diallojunior@sonatelacademy.sn	221773456789	Sacré coeur 1	Thies	Université Numérique Cheikh Hamidou Kane	Pikine	IDA	2024	L3		$2a$12$bSRuID9DBYn6csMgcIa25e.FZ.uA/D2d3pVo21F6W3u4aPa3xx1U2	member	active	\N	\N	0	\N	\N	t	2025-09-16 23:46:51.064	\N	\N	2025-09-16 23:44:19.519	2025-09-16 23:44:19.527426	2025-09-16 23:46:51.068159	\N
48c08446-e279-45ee-9110-095cc241bb1f	fghjk	cgvhbjn	syfdf@gml.cm	786754224	\N	\N	\N	\N	\N	\N	\N	\N	$2a$12$kZdlytQTWjyOwIPWF8sEhe7m7S5U9RTXRuC/tObMOB3HGkMVZHh1S	member	suspended	\N	\N	0	\N	\N	t	\N	\N	\N	2025-09-17 10:53:34.292	2025-09-17 10:53:34.293907	2025-09-17 12:02:09.555176	\N
886a09a0-166f-4d33-a15d-b1154ae4850d	Niang	Amir Bamba	amir.bamba@gmail.com	775619115	Thiaroye	Pikine	Université Numérique Cheikh Hamidou Kane	Pikine	IDA	2024	L2		$2a$12$zCNb9d3Zft/NrK4GVMcU1uEAd.s3vJiWAm93bg9pCm/yYwv6/k4ua	admin	active	\N	\N	0	\N	\N	t	2025-09-17 15:58:53.608	\N	\N	2025-09-17 15:58:19.73	2025-09-17 15:58:19.73185	2025-09-17 15:58:53.612522	\N
893ac3f8-099e-4515-bb15-8e8470e38c4c	Dieng	Souleye	aissatou.sow@example.com	221778764432	Sacré coeur 1	Malika	Université Numérique Cheikh Hamidou Kane	Thiaroye	IDA	2024	L2		$2a$12$n7.LmXE9ae36HvotMETHLuXHoZ.LGGIoeCxU1kzwEtsByatxUw4.C	member	active	\N	\N	0	\N	\N	t	2025-09-17 00:20:24.724	\N	\N	2025-09-17 00:19:15.271	2025-09-17 00:19:15.279473	2025-09-17 00:20:24.726663	\N
18f542ff-d4ff-4d26-a47c-05ac73b9bd7f	Adipisci atque ut la	Aut vel excepturi id	cotenym@mailinator.com	+1 (381) 172-2189	Velit sit minus do e	Error odit corporis 	UVS	Dolores quam facilis	Quae autem facilis d	2024	L2		$2a$12$wsdk4DHY764fkl0eHHLObOmzJr4S8GBjzBFb2hbpgHRLbuTOHbzN.	member	pending	\N	\N	0	\N	\N	t	2025-09-17 16:01:55.562	\N	\N	2025-09-17 16:01:18.755	2025-09-17 16:01:18.758489	2025-09-17 16:01:55.564754	\N
8b705fc9-d190-4408-9671-7b2c37e0d713	Ba	Alpha	sorydiallo31@gmail.com	221778765431	Sacré coeur 1	Pikine	Université Numérique Cheikh Hamidou Kane	Pikine	IDA	2024	L2		$2a$12$mXYYk3V.iCpnDol7OTp/auAtfsTPh0GQ97ZX3eytahC8..NLNgxie	member	suspended	\N	\N	0	\N	\N	t	2025-09-17 00:51:47.76	\N	\N	2025-09-17 00:48:59.934	2025-09-17 00:48:59.94326	2025-09-17 02:04:22.073134	\N
015b3947-e1c0-47b3-86b5-024024451351	Diallo	Ibrahima	ibrahima.diallo12@saraya.tech	+221 78 561 91 16	Sacré Coeur 1	Dakar	Université Numérique Cheikh Hamidou Kane	Mermoz	IDA	20242025	L2		$2a$12$VpV7qOF/kyqQNMI/y.JlQ.dh7xMUeL13D67KP6FJBBzpLxc81QlM6	member	active	\N	\N	0	\N	\N	t	\N	\N	\N	2025-09-16 17:47:47.045	2025-09-16 17:47:47.046068	2025-09-17 02:04:45.361236	\N
1fc568c5-83a3-4e63-bfa9-d54fa00dde6d	fgyhuji	trgef	sorydgdf@gmail.com	675642345	\N	\N	\N	\N	\N	\N	\N	\N	$2a$12$9e7GWMAlODumfdouGKtukup0Qbq1Z139mmX8NZOOsBGrwJGwCvFr.	member	pending	\N	\N	0	\N	\N	t	\N	\N	\N	2025-09-17 13:39:45.102	2025-09-17 13:39:45.103765	2025-09-17 13:39:45.103765	\N
\.


--
-- Name: order_items PK_005269d8574e6fac0493715c308; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY (id);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: reviews PK_231ae565c273ee700b283f15c1d; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: events PK_40731c7151fe4be3116e45ddf73; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: cart_items PK_6fccf5ec03c172d27a28a82928b; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: notification_templates PK_76f0fc48b8d057d2ae7f3a2848a; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT "PK_76f0fc48b8d057d2ae7f3a2848a" PRIMARY KEY (id);


--
-- Name: event_participants PK_7d90a2ab3ea972461a2b698adce; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT "PK_7d90a2ab3ea972461a2b698adce" PRIMARY KEY ("eventId", "userId");


--
-- Name: activities PK_7f4004429f731ffb9c88eb486a8; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: event_logs PK_b09cf1bb58150797d898076b242; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT "PK_b09cf1bb58150797d898076b242" PRIMARY KEY (id);


--
-- Name: announcements PK_b3ad760876ff2e19d58e05dc8b0; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "PK_b3ad760876ff2e19d58e05dc8b0" PRIMARY KEY (id);


--
-- Name: carts PK_b5f695a59f5ebb50af3c8160816; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY (id);


--
-- Name: user_sessions PK_e93e031a5fed190d4789b6bfd83; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY (id);


--
-- Name: media PK_f4e0fcac36e050de337b670d8bd; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY (id);


--
-- Name: notification_templates UQ_4118447024198c4ac2203a8218b; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT "UQ_4118447024198c4ac2203a8218b" UNIQUE (name);


--
-- Name: orders UQ_59b0c3b34ea0fa5562342f24143; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "UQ_59b0c3b34ea0fa5562342f24143" UNIQUE ("orderNumber");


--
-- Name: categories UQ_8b0be371d28245da6e4f4b61878; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE (name);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: user_sessions UQ_f1d56cb09724333a500af7fe914; Type: CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "UQ_f1d56cb09724333a500af7fe914" UNIQUE ("sessionId");


--
-- Name: IDX_01b20118a3f640214e7a8a6b29; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_01b20118a3f640214e7a8a6b29" ON public.orders USING btree ("paymentStatus");


--
-- Name: IDX_03dcebc1ab44daa177ae9479c4; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_03dcebc1ab44daa177ae9479c4" ON public.events USING btree (status);


--
-- Name: IDX_06765baffb67676f5e8bfbac45; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_06765baffb67676f5e8bfbac45" ON public.user_sessions USING btree ("startTime");


--
-- Name: IDX_0b4eb30cc82d61f4c653e4922d; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_0b4eb30cc82d61f4c653e4922d" ON public.event_logs USING btree ("sessionId");


--
-- Name: IDX_0fe5d8efa1b0b698b40f78b699; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_0fe5d8efa1b0b698b40f78b699" ON public.event_logs USING btree ("userId");


--
-- Name: IDX_146a66975e0a017af25c63c665; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_146a66975e0a017af25c63c665" ON public.activities USING btree (status);


--
-- Name: IDX_151b79a83ba240b0cb31b2302d; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_151b79a83ba240b0cb31b2302d" ON public.orders USING btree ("userId");


--
-- Name: IDX_1846199852a695713b1f8f5e9a; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_1846199852a695713b1f8f5e9a" ON public.products USING btree (status);


--
-- Name: IDX_1d992705797d7d2d5a3853ad9c; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_1d992705797d7d2d5a3853ad9c" ON public.notifications USING btree (priority);


--
-- Name: IDX_1f4b9818a08b822a31493fdee9; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_1f4b9818a08b822a31493fdee9" ON public.orders USING btree ("createdAt");


--
-- Name: IDX_217a680273e6f360857e9c5326; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_217a680273e6f360857e9c5326" ON public.events USING btree (date);


--
-- Name: IDX_2bf7996b7946ce753b60a87468; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE UNIQUE INDEX "IDX_2bf7996b7946ce753b60a87468" ON public.cart_items USING btree ("cartId", "productId");


--
-- Name: IDX_39862b1a722590857df5d1b2e3; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_39862b1a722590857df5d1b2e3" ON public.notification_templates USING btree (type);


--
-- Name: IDX_3df280b20b26f3bfd7dfd6d4da; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE UNIQUE INDEX "IDX_3df280b20b26f3bfd7dfd6d4da" ON public.users USING btree (telephone) WHERE (telephone IS NOT NULL);


--
-- Name: IDX_3f5283c00b19f3648fa96d802e; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_3f5283c00b19f3648fa96d802e" ON public.media USING btree ("isPublic");


--
-- Name: IDX_4118447024198c4ac2203a8218; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE UNIQUE INDEX "IDX_4118447024198c4ac2203a8218" ON public.notification_templates USING btree (name);


--
-- Name: IDX_466bba8e731f63e88b7be54384; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_466bba8e731f63e88b7be54384" ON public.events USING btree ("isPublic");


--
-- Name: IDX_472dcde086b0881656f29b94af; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_472dcde086b0881656f29b94af" ON public.announcements USING btree (type);


--
-- Name: IDX_4907f15416577c3bbbcd604d12; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_4907f15416577c3bbbcd604d12" ON public.event_participants USING btree ("eventId");


--
-- Name: IDX_4952a5c91db543e1bf2b91a3eb; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_4952a5c91db543e1bf2b91a3eb" ON public.reviews USING btree ("createdAt");


--
-- Name: IDX_4c9fb58de893725258746385e1; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON public.products USING btree (name);


--
-- Name: IDX_55fa4db8406ed66bc704432842; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_55fa4db8406ed66bc704432842" ON public.user_sessions USING btree ("userId");


--
-- Name: IDX_5becab0222f106ceb3a05fd674; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_5becab0222f106ceb3a05fd674" ON public.events USING btree ("endDate");


--
-- Name: IDX_5c751ba5c02239663b81996563; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_5c751ba5c02239663b81996563" ON public.events USING btree (type);


--
-- Name: IDX_5fbf370d1f8f376f65c4b309aa; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_5fbf370d1f8f376f65c4b309aa" ON public.event_logs USING btree ("eventType");


--
-- Name: IDX_637a0dd7f9068a9ca80decee00; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_637a0dd7f9068a9ca80decee00" ON public.media USING btree (type);


--
-- Name: IDX_63fcb3d8806a6efd53dbc67430; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_63fcb3d8806a6efd53dbc67430" ON public.products USING btree ("createdAt");


--
-- Name: IDX_694514acb4c5f9beff982f7e51; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_694514acb4c5f9beff982f7e51" ON public.user_sessions USING btree ("endTime");


--
-- Name: IDX_69828a178f152f157dcf2f70a8; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE UNIQUE INDEX "IDX_69828a178f152f157dcf2f70a8" ON public.carts USING btree ("userId");


--
-- Name: IDX_704a5fe2080d400189b76938cd; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_704a5fe2080d400189b76938cd" ON public.activities USING btree (type);


--
-- Name: IDX_75895eeb1903f8a17816dafe0a; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_75895eeb1903f8a17816dafe0a" ON public.products USING btree (price);


--
-- Name: IDX_775c9f06fc27ae3ff8fb26f2c4; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON public.orders USING btree (status);


--
-- Name: IDX_7b06c23cf52ca8aea0dcaf0ee2; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_7b06c23cf52ca8aea0dcaf0ee2" ON public.reviews USING btree (status);


--
-- Name: IDX_831a5a06f879fb0bebf8965871; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_831a5a06f879fb0bebf8965871" ON public.notifications USING btree ("createdAt");


--
-- Name: IDX_841ad97235506bea8efe75ae7f; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_841ad97235506bea8efe75ae7f" ON public.announcements USING btree ("endAt");


--
-- Name: IDX_8b0be371d28245da6e4f4b6187; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE UNIQUE INDEX "IDX_8b0be371d28245da6e4f4b6187" ON public.categories USING btree (name);


--
-- Name: IDX_9007ffba411fd471dfe233dabf; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE UNIQUE INDEX "IDX_9007ffba411fd471dfe233dabf" ON public.reviews USING btree ("productId", "userId");


--
-- Name: IDX_97672ac88f789774dd47f7c8be; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON public.users USING btree (email);


--
-- Name: IDX_a3dc6b811eb4866cc3f0da3071; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_a3dc6b811eb4866cc3f0da3071" ON public.event_logs USING btree ("timestamp");


--
-- Name: IDX_aef1c7aef3725068e5540f8f00; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_aef1c7aef3725068e5540f8f00" ON public.notifications USING btree (type);


--
-- Name: IDX_b5695602d184d7beba9c8f2a56; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_b5695602d184d7beba9c8f2a56" ON public.announcements USING btree ("startAt");


--
-- Name: IDX_bd4f10345d33062031575c49bf; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_bd4f10345d33062031575c49bf" ON public.activities USING btree (date);


--
-- Name: IDX_c3932231d2385ac248d0888d95; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_c3932231d2385ac248d0888d95" ON public.products USING btree (category);


--
-- Name: IDX_c45985989bc600ab871ef1eaf8; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_c45985989bc600ab871ef1eaf8" ON public.announcements USING btree (status);


--
-- Name: IDX_c58bf8951c9a6ba9277eebcbf5; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_c58bf8951c9a6ba9277eebcbf5" ON public.media USING btree ("createdAt");


--
-- Name: IDX_c730c2d67f271a372c39a07b7e; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_c730c2d67f271a372c39a07b7e" ON public.media USING btree (status);


--
-- Name: IDX_d1b1a40ec360951071605b0f7a; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_d1b1a40ec360951071605b0f7a" ON public.event_participants USING btree ("userId");


--
-- Name: IDX_dc591a3520526561b639a2432e; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_dc591a3520526561b639a2432e" ON public.categories USING btree (type);


--
-- Name: IDX_ec58540413750eba09bd5a60f4; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_ec58540413750eba09bd5a60f4" ON public.notifications USING btree ("scheduledFor");


--
-- Name: IDX_f1d56cb09724333a500af7fe91; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE UNIQUE INDEX "IDX_f1d56cb09724333a500af7fe91" ON public.user_sessions USING btree ("sessionId");


--
-- Name: IDX_f4b88c05a7adf404a6e6b2f1eb; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_f4b88c05a7adf404a6e6b2f1eb" ON public.reviews USING btree (rating);


--
-- Name: IDX_f6f0af5d0f1c906b214af7e690; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_f6f0af5d0f1c906b214af7e690" ON public.notification_templates USING btree ("isActive");


--
-- Name: IDX_f8b7ed75170d2d7dca4477cc94; Type: INDEX; Schema: public; Owner: ibrahima
--

CREATE INDEX "IDX_f8b7ed75170d2d7dca4477cc94" ON public.notifications USING btree (read);


--
-- Name: media FK_0db866835bf356d896e1892635d; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "FK_0db866835bf356d896e1892635d" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: event_logs FK_0fe5d8efa1b0b698b40f78b6998; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT "FK_0fe5d8efa1b0b698b40f78b6998" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: events FK_1024d476207981d1c72232cf3ca; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "FK_1024d476207981d1c72232cf3ca" FOREIGN KEY ("organizerId") REFERENCES public.users(id);


--
-- Name: orders FK_151b79a83ba240b0cb31b2302d1; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: activities FK_355abf766c8ad80add02dde6ae9; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_355abf766c8ad80add02dde6ae9" FOREIGN KEY ("eventId") REFERENCES public.events(id);


--
-- Name: media FK_442eca5123705b2f8af27d5f065; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "FK_442eca5123705b2f8af27d5f065" FOREIGN KEY ("categoryId") REFERENCES public.categories(id);


--
-- Name: event_participants FK_4907f15416577c3bbbcd604d121; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT "FK_4907f15416577c3bbbcd604d121" FOREIGN KEY ("eventId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_sessions FK_55fa4db8406ed66bc7044328427; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "FK_55fa4db8406ed66bc7044328427" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: notifications FK_692a909ee0fa9383e7859f9b406; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: carts FK_69828a178f152f157dcf2f70a89; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: cart_items FK_72679d98b31c737937b8932ebe6; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: reviews FK_7ed5659e7139fc8bc039198cc1f; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: reviews FK_a6b3c434392f5d10ec171043666; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: order_items FK_cdb99c05982d5191ac8465ac010; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES public.products(id);


--
-- Name: activities FK_d03d847bc4f319079b9198c168f; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_d03d847bc4f319079b9198c168f" FOREIGN KEY ("participantId") REFERENCES public.users(id);


--
-- Name: event_participants FK_d1b1a40ec360951071605b0f7a0; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT "FK_d1b1a40ec360951071605b0f7a0" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products FK_e40a1dd2909378f0da1f34f7bd6; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6" FOREIGN KEY ("sellerId") REFERENCES public.users(id);


--
-- Name: cart_items FK_edd714311619a5ad09525045838; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: order_items FK_f1d359a55923bb45b057fbdab0d; Type: FK CONSTRAINT; Schema: public; Owner: ibrahima
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hFhSwPbEgbZ8xK1CtvIdahuAygXcU7mkehLpmZraj4bhRe20Um2LYCalsoAjFK8

