--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2 (Debian 16.2-1.pgdg120+2)
-- Dumped by pg_dump version 16.2

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
-- Name: bingo_schema; Type: SCHEMA; Schema: -; Owner: csc667bingodb_user
--

CREATE SCHEMA bingo_schema;


--
-- Name: game_states; Type: TYPE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TYPE bingo_schema.game_states AS ENUM (
    'ongoing',
    'finished'
);



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Rooms; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema."Rooms" (
    room_id integer NOT NULL,
    room_name character varying(255) NOT NULL,
    host character varying(255) NOT NULL,
    status boolean NOT NULL
);



--
-- Name: TABLE "Rooms"; Type: COMMENT; Schema: bingo_schema; Owner: csc667bingodb_user
--

COMMENT ON TABLE bingo_schema."Rooms" IS 'Rooms made by the users.';


--
-- Name: Rooms_room_id_seq; Type: SEQUENCE; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE bingo_schema."Rooms" ALTER COLUMN room_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME bingo_schema."Rooms_room_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Users; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema."Users" (
    user_id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(255) NOT NULL
);



--
-- Name: Users_user_id_seq; Type: SEQUENCE; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE bingo_schema."Users" ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME bingo_schema."Users_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cards_table; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema.cards_table (
    card_id integer NOT NULL,
    card_data json NOT NULL
);



--
-- Name: cards_table_card_id_seq; Type: SEQUENCE; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE bingo_schema.cards_table ALTER COLUMN card_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME bingo_schema.cards_table_card_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: drawn_numbers; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema.drawn_numbers (
    drawn_number_id integer NOT NULL,
    room_id integer NOT NULL,
    drawn_number integer NOT NULL
);



--
-- Name: drawn_numbers_drawn_number_id_seq; Type: SEQUENCE; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE bingo_schema.drawn_numbers ALTER COLUMN drawn_number_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME bingo_schema.drawn_numbers_drawn_number_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: marked_cells_table; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema.marked_cells_table (
    room_id integer NOT NULL,
    user_id integer NOT NULL,
    div_cell_id character varying
);



--
-- Name: player_card; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema.player_card (
    card_id integer NOT NULL,
    player_id integer NOT NULL,
    room_id integer NOT NULL
);



--
-- Name: player_ready_status; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema.player_ready_status (
    player_ready_status_id integer NOT NULL,
    room_id integer NOT NULL,
    player_id integer NOT NULL,
    status boolean DEFAULT false NOT NULL
);



--
-- Name: player_ready_status_player_ready_status_id_seq; Type: SEQUENCE; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE bingo_schema.player_ready_status ALTER COLUMN player_ready_status_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME bingo_schema.player_ready_status_player_ready_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: room_player_table; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema.room_player_table (
    user_id integer NOT NULL,
    room_id integer NOT NULL
);



--
-- Name: TABLE room_player_table; Type: COMMENT; Schema: bingo_schema; Owner: csc667bingodb_user
--

COMMENT ON TABLE bingo_schema.room_player_table IS 'The table that stores the user_id and room_id';


--
-- Name: room_timer; Type: TABLE; Schema: bingo_schema; Owner: csc667bingodb_user
--

CREATE TABLE bingo_schema.room_timer (
    room_id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now()
);



--
-- Name: Rooms Rooms_pkey; Type: CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema."Rooms"
    ADD CONSTRAINT "Rooms_pkey" PRIMARY KEY (room_id);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (user_id);


--
-- Name: cards_table cards_table_pkey; Type: CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.cards_table
    ADD CONSTRAINT cards_table_pkey PRIMARY KEY (card_id);


--
-- Name: drawn_numbers drawn_numbers_pkey; Type: CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.drawn_numbers
    ADD CONSTRAINT drawn_numbers_pkey PRIMARY KEY (drawn_number_id);


--
-- Name: player_ready_status player_ready_status_pkey; Type: CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.player_ready_status
    ADD CONSTRAINT player_ready_status_pkey PRIMARY KEY (player_ready_status_id);


--
-- Name: room_timer room_timer_pkey; Type: CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.room_timer
    ADD CONSTRAINT room_timer_pkey PRIMARY KEY (room_id);


--
-- Name: player_card fk_card_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.player_card
    ADD CONSTRAINT fk_card_id FOREIGN KEY (card_id) REFERENCES bingo_schema.cards_table(card_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: drawn_numbers fk_room_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.drawn_numbers
    ADD CONSTRAINT fk_room_id FOREIGN KEY (room_id) REFERENCES bingo_schema."Rooms"(room_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: marked_cells_table fk_room_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.marked_cells_table
    ADD CONSTRAINT fk_room_id FOREIGN KEY (room_id) REFERENCES bingo_schema."Rooms"(room_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: player_card fk_room_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.player_card
    ADD CONSTRAINT fk_room_id FOREIGN KEY (room_id) REFERENCES bingo_schema."Rooms"(room_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: room_timer fk_room_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.room_timer
    ADD CONSTRAINT fk_room_id FOREIGN KEY (room_id) REFERENCES bingo_schema."Rooms"(room_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: marked_cells_table fk_user_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.marked_cells_table
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES bingo_schema."Users"(user_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: player_card fk_user_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.player_card
    ADD CONSTRAINT fk_user_id FOREIGN KEY (player_id) REFERENCES bingo_schema."Users"(user_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: player_ready_status pk_status_player_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.player_ready_status
    ADD CONSTRAINT pk_status_player_id FOREIGN KEY (player_id) REFERENCES bingo_schema."Users"(user_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: player_ready_status pk_status_room_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.player_ready_status
    ADD CONSTRAINT pk_status_room_id FOREIGN KEY (room_id) REFERENCES bingo_schema."Rooms"(room_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: room_player_table room_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.room_player_table
    ADD CONSTRAINT room_id FOREIGN KEY (room_id) REFERENCES bingo_schema."Rooms"(room_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: room_player_table user_id; Type: FK CONSTRAINT; Schema: bingo_schema; Owner: csc667bingodb_user
--

ALTER TABLE ONLY bingo_schema.room_player_table
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES bingo_schema."Users"(user_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- PostgreSQL database dump complete
--

