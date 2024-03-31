--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

-- Started on 2023-09-24 13:54:59

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
-- TOC entry 884 (class 1247 OID 107380)
-- Name: report_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.report_type_enum AS ENUM (
    'comic',
    'chapter',
    'comment'
);


ALTER TYPE public.report_type_enum OWNER TO postgres;

--
-- TOC entry 857 (class 1247 OID 107260)
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role_enum AS ENUM (
    'admin',
    'translator',
    'viewer'
);


ALTER TYPE public.user_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 233 (class 1259 OID 115412)
-- Name: answer_comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answer_comment (
    id integer NOT NULL,
    comment_id integer NOT NULL,
    "userId" integer NOT NULL,
    content character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer,
    "mentionedPerson" character varying NOT NULL
);


ALTER TABLE public.answer_comment OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 115411)
-- Name: answer_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.answer_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.answer_comment_id_seq OWNER TO postgres;

--
-- TOC entry 3462 (class 0 OID 0)
-- Dependencies: 232
-- Name: answer_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.answer_comment_id_seq OWNED BY public.answer_comment.id;


--
-- TOC entry 219 (class 1259 OID 107302)
-- Name: chapter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter (
    id integer NOT NULL,
    name character varying NOT NULL,
    images text[],
    slug character varying NOT NULL,
    comic_id integer NOT NULL,
    creator_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "order" numeric(5,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.chapter OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 107301)
-- Name: chapter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chapter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chapter_id_seq OWNER TO postgres;

--
-- TOC entry 3463 (class 0 OID 0)
-- Dependencies: 218
-- Name: chapter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapter_id_seq OWNED BY public.chapter.id;


--
-- TOC entry 217 (class 1259 OID 107284)
-- Name: comic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comic (
    id integer NOT NULL,
    slug character varying NOT NULL,
    name character varying NOT NULL,
    another_name character varying NOT NULL,
    genres text[] NOT NULL,
    authors text[] DEFAULT '{"Đang cập nhật"}'::text[] NOT NULL,
    state character varying DEFAULT 'Đang tiến hành'::character varying NOT NULL,
    thumb character varying DEFAULT 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/341188300_174106015556678_2351278697571809870_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=730e14&_nc_ohc=_7_-WoYue4sAX8peRhA&_nc_ht=scontent.fsgn19-1.fna&oh=00_AfD-YleH181ekrLJecohF7ePxk2nQzkF3JtHjTqdOjlGwA&oe=643E4400'::character varying NOT NULL,
    brief_description character varying NOT NULL,
    view integer DEFAULT 0 NOT NULL,
    "like" integer DEFAULT 0 NOT NULL,
    follow integer DEFAULT 0 NOT NULL,
    star numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    creator integer,
    "creatorId" integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    translators text[] DEFAULT '{}'::text[] NOT NULL
);


ALTER TABLE public.comic OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 107283)
-- Name: comic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comic_id_seq OWNER TO postgres;

--
-- TOC entry 3464 (class 0 OID 0)
-- Dependencies: 216
-- Name: comic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comic_id_seq OWNED BY public.comic.id;


--
-- TOC entry 220 (class 1259 OID 107318)
-- Name: comic_interaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comic_interaction (
    is_liked boolean DEFAULT false NOT NULL,
    is_followed boolean DEFAULT false NOT NULL,
    score integer,
    user_id integer NOT NULL,
    comic_id integer NOT NULL
);


ALTER TABLE public.comic_interaction OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 107349)
-- Name: comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment (
    id integer NOT NULL,
    content character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL,
    comic_id integer NOT NULL
);


ALTER TABLE public.comment OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 107348)
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comment_id_seq OWNER TO postgres;

--
-- TOC entry 3465 (class 0 OID 0)
-- Dependencies: 225
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comment_id_seq OWNED BY public.comment.id;


--
-- TOC entry 234 (class 1259 OID 131691)
-- Name: genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genre (
    slug character varying NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.genre OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 107338)
-- Name: message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message (
    id integer NOT NULL,
    receiver integer NOT NULL,
    sender integer NOT NULL,
    content character varying NOT NULL,
    "sentAt" timestamp without time zone DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL
);


ALTER TABLE public.message OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 107337)
-- Name: message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.message_id_seq OWNER TO postgres;

--
-- TOC entry 3466 (class 0 OID 0)
-- Dependencies: 223
-- Name: message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.message_id_seq OWNED BY public.message.id;


--
-- TOC entry 222 (class 1259 OID 107326)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    title character varying NOT NULL,
    body character varying NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    redirect_url character varying,
    thumb character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 107325)
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_id_seq OWNER TO postgres;

--
-- TOC entry 3467 (class 0 OID 0)
-- Dependencies: 221
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- TOC entry 231 (class 1259 OID 115143)
-- Name: reading_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reading_history (
    user_id integer NOT NULL,
    comic_id integer NOT NULL,
    "readAt" timestamp without time zone DEFAULT now() NOT NULL,
    chapter_id integer
);


ALTER TABLE public.reading_history OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 107388)
-- Name: report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report (
    id integer NOT NULL,
    type public.report_type_enum DEFAULT 'chapter'::public.report_type_enum NOT NULL,
    detail_report character varying,
    errors text[] DEFAULT '{}'::text[],
    id_object integer NOT NULL,
    link character varying NOT NULL,
    is_resolve boolean DEFAULT false NOT NULL,
    reporter integer
);


ALTER TABLE public.report OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 107387)
-- Name: report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_id_seq OWNER TO postgres;

--
-- TOC entry 3468 (class 0 OID 0)
-- Dependencies: 229
-- Name: report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_id_seq OWNED BY public.report.id;


--
-- TOC entry 228 (class 1259 OID 107371)
-- Name: slide_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slide_image (
    id integer NOT NULL,
    link_image character varying NOT NULL
);


ALTER TABLE public.slide_image OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 107370)
-- Name: slide_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.slide_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.slide_image_id_seq OWNER TO postgres;

--
-- TOC entry 3469 (class 0 OID 0)
-- Dependencies: 227
-- Name: slide_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.slide_image_id_seq OWNED BY public.slide_image.id;


--
-- TOC entry 215 (class 1259 OID 107268)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying,
    fullname character varying NOT NULL,
    password character varying NOT NULL,
    avatar character varying DEFAULT 'https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg'::character varying NOT NULL,
    wallpaper character varying,
    active boolean DEFAULT false NOT NULL,
    facebook boolean DEFAULT false NOT NULL,
    google boolean DEFAULT false NOT NULL,
    phone character varying,
    role public.user_role_enum DEFAULT 'viewer'::public.user_role_enum NOT NULL,
    refresh_token character varying,
    access_token character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "facebookId" character varying,
    "googleId" character varying
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 107267)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- TOC entry 3470 (class 0 OID 0)
-- Dependencies: 214
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- TOC entry 3272 (class 2604 OID 115415)
-- Name: answer_comment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_comment ALTER COLUMN id SET DEFAULT nextval('public.answer_comment_id_seq'::regclass);


--
-- TOC entry 3250 (class 2604 OID 107305)
-- Name: chapter id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter ALTER COLUMN id SET DEFAULT nextval('public.chapter_id_seq'::regclass);


--
-- TOC entry 3239 (class 2604 OID 107287)
-- Name: comic id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic ALTER COLUMN id SET DEFAULT nextval('public.comic_id_seq'::regclass);


--
-- TOC entry 3263 (class 2604 OID 107352)
-- Name: comment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.comment_id_seq'::regclass);


--
-- TOC entry 3260 (class 2604 OID 107341)
-- Name: message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message ALTER COLUMN id SET DEFAULT nextval('public.message_id_seq'::regclass);


--
-- TOC entry 3256 (class 2604 OID 107329)
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- TOC entry 3267 (class 2604 OID 107391)
-- Name: report id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report ALTER COLUMN id SET DEFAULT nextval('public.report_id_seq'::regclass);


--
-- TOC entry 3266 (class 2604 OID 107374)
-- Name: slide_image id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slide_image ALTER COLUMN id SET DEFAULT nextval('public.slide_image_id_seq'::regclass);


--
-- TOC entry 3231 (class 2604 OID 107271)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 3278 (class 2606 OID 107300)
-- Name: comic PK_071fba28990ddf3518fcd165624; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic
    ADD CONSTRAINT "PK_071fba28990ddf3518fcd165624" PRIMARY KEY (id);


--
-- TOC entry 3288 (class 2606 OID 107358)
-- Name: comment PK_0b0e4bbc8415ec426f87f3a88e2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY (id);


--
-- TOC entry 3282 (class 2606 OID 107532)
-- Name: comic_interaction PK_1316283eccf4353c886abc8429f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic_interaction
    ADD CONSTRAINT "PK_1316283eccf4353c886abc8429f" PRIMARY KEY (user_id, comic_id);


--
-- TOC entry 3280 (class 2606 OID 107311)
-- Name: chapter PK_275bd1c62bed7dff839680614ca; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter
    ADD CONSTRAINT "PK_275bd1c62bed7dff839680614ca" PRIMARY KEY (id);


--
-- TOC entry 3290 (class 2606 OID 107378)
-- Name: slide_image PK_29abcbd8e79f32956061b9ccada; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slide_image
    ADD CONSTRAINT "PK_29abcbd8e79f32956061b9ccada" PRIMARY KEY (id);


--
-- TOC entry 3294 (class 2606 OID 115148)
-- Name: reading_history PK_5093cb23af3a1cb57b9aa4eb985; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT "PK_5093cb23af3a1cb57b9aa4eb985" PRIMARY KEY (user_id, comic_id);


--
-- TOC entry 3284 (class 2606 OID 107336)
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- TOC entry 3298 (class 2606 OID 131697)
-- Name: genre PK_8fc42c0cf741b5006b5ffd12f24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT "PK_8fc42c0cf741b5006b5ffd12f24" PRIMARY KEY (slug);


--
-- TOC entry 3292 (class 2606 OID 107398)
-- Name: report PK_99e4d0bea58cba73c57f935a546; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY (id);


--
-- TOC entry 3286 (class 2606 OID 107347)
-- Name: message PK_ba01f0a3e0123651915008bc578; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY (id);


--
-- TOC entry 3296 (class 2606 OID 115421)
-- Name: answer_comment PK_be459f2ae4540d0740b699a3efc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_comment
    ADD CONSTRAINT "PK_be459f2ae4540d0740b699a3efc" PRIMARY KEY (id);


--
-- TOC entry 3276 (class 2606 OID 107282)
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- TOC entry 3313 (class 2606 OID 115428)
-- Name: answer_comment FK_0bb9dd1a6fcfcfc13165d135482; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_comment
    ADD CONSTRAINT "FK_0bb9dd1a6fcfcfc13165d135482" FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3302 (class 2606 OID 107556)
-- Name: comic_interaction FK_2137fcc25797fe94c6052a8de28; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic_interaction
    ADD CONSTRAINT "FK_2137fcc25797fe94c6052a8de28" FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3300 (class 2606 OID 115262)
-- Name: chapter FK_45a69180a4ae88abf52855cf1ec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter
    ADD CONSTRAINT "FK_45a69180a4ae88abf52855cf1ec" FOREIGN KEY (comic_id) REFERENCES public.comic(id);


--
-- TOC entry 3310 (class 2606 OID 115180)
-- Name: reading_history FK_4fdb87019ebdcab6b07b33627b8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT "FK_4fdb87019ebdcab6b07b33627b8" FOREIGN KEY (chapter_id) REFERENCES public.chapter(id);


--
-- TOC entry 3307 (class 2606 OID 115386)
-- Name: comment FK_631f33722a000d97c831daeed5a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_631f33722a000d97c831daeed5a" FOREIGN KEY (comic_id) REFERENCES public.comic(id);


--
-- TOC entry 3311 (class 2606 OID 115155)
-- Name: reading_history FK_674e251cceceecadc8c67e9b50f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT "FK_674e251cceceecadc8c67e9b50f" FOREIGN KEY (comic_id) REFERENCES public.comic(id);


--
-- TOC entry 3303 (class 2606 OID 107561)
-- Name: comic_interaction FK_79ca17bf643fbc36af0c03b57ed; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic_interaction
    ADD CONSTRAINT "FK_79ca17bf643fbc36af0c03b57ed" FOREIGN KEY (comic_id) REFERENCES public.comic(id);


--
-- TOC entry 3299 (class 2606 OID 107399)
-- Name: comic FK_7e7e43f4eb2d087e0637f477864; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic
    ADD CONSTRAINT "FK_7e7e43f4eb2d087e0637f477864" FOREIGN KEY ("creatorId") REFERENCES public."user"(id);


--
-- TOC entry 3304 (class 2606 OID 123381)
-- Name: notification FK_928b7aa1754e08e1ed7052cb9d8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3305 (class 2606 OID 107439)
-- Name: message FK_93c9d531d647e4023fca7fe29cd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_93c9d531d647e4023fca7fe29cd" FOREIGN KEY (receiver) REFERENCES public."user"(id);


--
-- TOC entry 3306 (class 2606 OID 107444)
-- Name: message FK_93d19ff012dfce57259757e4d69; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_93d19ff012dfce57259757e4d69" FOREIGN KEY (sender) REFERENCES public."user"(id);


--
-- TOC entry 3308 (class 2606 OID 115381)
-- Name: comment FK_bbfe153fa60aa06483ed35ff4a7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_bbfe153fa60aa06483ed35ff4a7" FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3309 (class 2606 OID 107469)
-- Name: report FK_c64428782393c46ad9030d2dc98; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT "FK_c64428782393c46ad9030d2dc98" FOREIGN KEY (reporter) REFERENCES public."user"(id);


--
-- TOC entry 3301 (class 2606 OID 115267)
-- Name: chapter FK_d4a1bf73d8bb6e2a247853b8cc4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter
    ADD CONSTRAINT "FK_d4a1bf73d8bb6e2a247853b8cc4" FOREIGN KEY (creator_id) REFERENCES public."user"(id);


--
-- TOC entry 3314 (class 2606 OID 115423)
-- Name: answer_comment FK_f42ea13a1dee93639b4ec2b9077; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_comment
    ADD CONSTRAINT "FK_f42ea13a1dee93639b4ec2b9077" FOREIGN KEY (comment_id) REFERENCES public.comment(id);


--
-- TOC entry 3312 (class 2606 OID 115150)
-- Name: reading_history FK_ff8f086adc027f4ad46f3d06ae2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT "FK_ff8f086adc027f4ad46f3d06ae2" FOREIGN KEY (user_id) REFERENCES public."user"(id);


-- Completed on 2023-09-24 13:54:59

--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

-- Started on 2023-09-24 13:55:15

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
-- TOC entry 3414 (class 0 OID 107268)
-- Dependencies: 215
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."user" VALUES (1, 'truongvanhao159@gmail.com', 'Trương Văn Hào', '$2b$10$H8IwAFc6GIv2fsoSvISohOGktF3SxZmCKn5GGW51nOAfRLmKoJ.0K', 'https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg', NULL, true, false, false, NULL, 'admin', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzZXIiOjEsImlhdCI6MTY5NTUzODQyOCwiZXhwIjoxNjk2MTQzMjI4fQ.5vqfw77xxpQgA3wMqiTyt1vvSC40Wf4t-kXBRMHv5S8', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzZXIiOjEsImlhdCI6MTY5NTUzODQyOCwiZXhwIjoxNjk1NTQ1NjI4fQ.FHOWGcBXr0XJwAGwY85EtTXh7I8DW30qUhsWiOOPWpM', '2023-09-15 10:56:54.292031', '2023-09-15 10:56:54.292031', NULL, NULL);


--
-- TOC entry 3416 (class 0 OID 107284)
-- Dependencies: 217
-- Data for Name: comic; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- TOC entry 3425 (class 0 OID 107349)
-- Dependencies: 226
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3432 (class 0 OID 115412)
-- Dependencies: 233
-- Data for Name: answer_comment; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3418 (class 0 OID 107302)
-- Dependencies: 219
-- Data for Name: chapter; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- TOC entry 3419 (class 0 OID 107318)
-- Dependencies: 220
-- Data for Name: comic_interaction; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3433 (class 0 OID 131691)
-- Dependencies: 234
-- Data for Name: genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.genre VALUES ('action', 'Action');
INSERT INTO public.genre VALUES ('adult', 'Adult');
INSERT INTO public.genre VALUES ('adventure', 'Adventure');
INSERT INTO public.genre VALUES ('anime', 'Anime');
INSERT INTO public.genre VALUES ('chuyen-sinh', 'Chuyển Sinh');
INSERT INTO public.genre VALUES ('co-dai', 'Cổ Đại');
INSERT INTO public.genre VALUES ('comedy', 'Comedy');
INSERT INTO public.genre VALUES ('comic', 'Comic');
INSERT INTO public.genre VALUES ('demons', 'Demons');
INSERT INTO public.genre VALUES ('detective', 'Detective');
INSERT INTO public.genre VALUES ('doujinshi', 'Doujinshi');
INSERT INTO public.genre VALUES ('drama', 'Drama');
INSERT INTO public.genre VALUES ('dam-my', 'Đam Mỹ');
INSERT INTO public.genre VALUES ('ecchi', 'Ecchi');
INSERT INTO public.genre VALUES ('fantasy', 'Fantasy');
INSERT INTO public.genre VALUES ('gender-bender', 'Gender Bender');
INSERT INTO public.genre VALUES ('harem', 'Harem');
INSERT INTO public.genre VALUES ('historical', 'Historical');
INSERT INTO public.genre VALUES ('horror', 'Horror');
INSERT INTO public.genre VALUES ('huyen-huyen', 'Huyền Huyễn');
INSERT INTO public.genre VALUES ('isekai', 'Isekai');
INSERT INTO public.genre VALUES ('josei', 'Josei');
INSERT INTO public.genre VALUES ('mafia', 'Mafia');
INSERT INTO public.genre VALUES ('magic', 'Magic');
INSERT INTO public.genre VALUES ('manhua', 'Manhua');
INSERT INTO public.genre VALUES ('manhwa', 'Manhwa');
INSERT INTO public.genre VALUES ('martial-arts', 'Martial Arts');
INSERT INTO public.genre VALUES ('mature', 'Mature');
INSERT INTO public.genre VALUES ('military', 'Military');
INSERT INTO public.genre VALUES ('mystery', 'Mystery');
INSERT INTO public.genre VALUES ('ngon-tinh', 'Ngôn Tình');
INSERT INTO public.genre VALUES ('one-shot', 'One shot');
INSERT INTO public.genre VALUES ('psychological', 'Psychological');
INSERT INTO public.genre VALUES ('romance', 'Romance');
INSERT INTO public.genre VALUES ('school-life', 'School Life');
INSERT INTO public.genre VALUES ('sci-fi', 'Sci-fi');
INSERT INTO public.genre VALUES ('seinen', 'Seinen');
INSERT INTO public.genre VALUES ('shoujo', 'Shoujo');
INSERT INTO public.genre VALUES ('shoujo-ai', 'Shoujo Ai');
INSERT INTO public.genre VALUES ('shounen', 'Shounen');
INSERT INTO public.genre VALUES ('shounen-ai', 'Shounen Ai');
INSERT INTO public.genre VALUES ('slice-of-life', 'Slice of life');
INSERT INTO public.genre VALUES ('smut', 'Smut');
INSERT INTO public.genre VALUES ('sports', 'Sports');
INSERT INTO public.genre VALUES ('supernatural', 'Supernatural');
INSERT INTO public.genre VALUES ('tragedy', 'Tragedy');
INSERT INTO public.genre VALUES ('trong-sinh', 'Trọng Sinh');
INSERT INTO public.genre VALUES ('truyen-mau', 'Truyện Màu');
INSERT INTO public.genre VALUES ('webtoon', 'Webtoon');
INSERT INTO public.genre VALUES ('xuyen-khong', 'Xuyên Không');
INSERT INTO public.genre VALUES ('yaoi', 'Yaoi');
INSERT INTO public.genre VALUES ('yuri', 'Yuri');
INSERT INTO public.genre VALUES ('mecha', 'Mecha');
INSERT INTO public.genre VALUES ('cooking', 'Cooking');
INSERT INTO public.genre VALUES ('trung-sinh', 'Trùng Sinh');
INSERT INTO public.genre VALUES ('gourmet', 'Gourmet');
INSERT INTO public.genre VALUES ('dark-fantasy', 'Dark Fantasy');
INSERT INTO public.genre VALUES ('manga', 'Manga');


--
-- TOC entry 3423 (class 0 OID 107338)
-- Dependencies: 224
-- Data for Name: message; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3421 (class 0 OID 107326)
-- Dependencies: 222
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3430 (class 0 OID 115143)
-- Dependencies: 231
-- Data for Name: reading_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3429 (class 0 OID 107388)
-- Dependencies: 230
-- Data for Name: report; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3427 (class 0 OID 107371)
-- Dependencies: 228
-- Data for Name: slide_image; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3439 (class 0 OID 0)
-- Dependencies: 232
-- Name: answer_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.answer_comment_id_seq', 1, true);


--
-- TOC entry 3440 (class 0 OID 0)
-- Dependencies: 218
-- Name: chapter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chapter_id_seq', 1, true);


--
-- TOC entry 3441 (class 0 OID 0)
-- Dependencies: 216
-- Name: comic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comic_id_seq', 1, true);


--
-- TOC entry 3442 (class 0 OID 0)
-- Dependencies: 225
-- Name: comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comment_id_seq', 1, true);


--
-- TOC entry 3443 (class 0 OID 0)
-- Dependencies: 223
-- Name: message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_id_seq', 1, false);


--
-- TOC entry 3444 (class 0 OID 0)
-- Dependencies: 221
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_id_seq', 1, true);


--
-- TOC entry 3445 (class 0 OID 0)
-- Dependencies: 229
-- Name: report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_id_seq', 1, false);


--
-- TOC entry 3446 (class 0 OID 0)
-- Dependencies: 227
-- Name: slide_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.slide_image_id_seq', 1, false);


--
-- TOC entry 3447 (class 0 OID 0)
-- Dependencies: 214
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 2, true);


-- Completed on 2023-09-24 13:55:15

--
-- PostgreSQL database dump complete
--

CREATE EXTENSION unaccent;