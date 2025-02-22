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

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: rebouladmin
--

INSERT INTO public.users (id, username, email, password_hash, first_name, last_name, is_admin, created_at, notification_settings) VALUES (1, 'zoran', 'zoran@reboul.com', '$2b$10$UzLt9qVpmXa9vSRmhBs2O.MwEf3aC1oS..TY18g8lAzoE/SNXt6lG', 'zoran', '', true, '2025-01-01 13:10:41.056359+01', '{"push": true, "email": true, "security": true, "marketing": true}');
INSERT INTO public.users (id, username, email, password_hash, first_name, last_name, is_admin, created_at, notification_settings) VALUES (3, 'jaab', 'jaab@reboul.com', '$2b$10$lCQosEgj19A9w4S/a/hX9eKm/qXvEQPaQwfd8VUIlPguks98nCwUO', 'thomas', 'lorenzi', false, '2025-01-02 11:09:26.046441+01', '{"push": false, "email": true, "security": true, "marketing": false}');
INSERT INTO public.users (id, username, email, password_hash, first_name, last_name, is_admin, created_at, notification_settings) VALUES (7, 'oklotso', 'zorhan@reboul.com', '$2b$10$JnBnOku5qSMhBFjRsKJ9b.WT0p7GGG9hbw4tpkwuDc6MBetp6KI5a', NULL, NULL, false, '2025-02-19 01:08:25.143518+01', '{"push": false, "email": true, "security": true, "marketing": false}');


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rebouladmin
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- PostgreSQL database dump complete
--

