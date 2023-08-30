--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2023-08-29 00:09:13

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
-- TOC entry 898 (class 1247 OID 34739)
-- Name: report_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.report_type_enum AS ENUM (
    'comic',
    'chapter',
    'comment'
);


ALTER TYPE public.report_type_enum OWNER TO postgres;

--
-- TOC entry 859 (class 1247 OID 21910)
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
-- TOC entry 226 (class 1259 OID 24987)
-- Name: answer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answer (
    id integer NOT NULL,
    id_comment integer NOT NULL,
    id_user integer NOT NULL,
    answer_user character varying NOT NULL,
    content character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.answer OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24986)
-- Name: answer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.answer_id_seq OWNER TO postgres;

--
-- TOC entry 3473 (class 0 OID 0)
-- Dependencies: 225
-- Name: answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.answer_id_seq OWNED BY public.answer.id;


--
-- TOC entry 220 (class 1259 OID 24957)
-- Name: chapter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter (
    id integer NOT NULL,
    name character varying NOT NULL,
    images text[],
    slug character varying NOT NULL,
    id_comic integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chapter OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24956)
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
-- TOC entry 3474 (class 0 OID 0)
-- Dependencies: 219
-- Name: chapter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapter_id_seq OWNED BY public.chapter.id;


--
-- TOC entry 218 (class 1259 OID 24942)
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
    brief_desc character varying NOT NULL,
    view integer DEFAULT 0 NOT NULL,
    "like" integer DEFAULT 0 NOT NULL,
    follow integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    id_owner integer DEFAULT 0 NOT NULL,
    star numeric(5,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.comic OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24941)
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
-- TOC entry 3475 (class 0 OID 0)
-- Dependencies: 217
-- Name: comic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comic_id_seq OWNED BY public.comic.id;


--
-- TOC entry 224 (class 1259 OID 24976)
-- Name: comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comment (
    id integer NOT NULL,
    id_user integer NOT NULL,
    id_comic integer NOT NULL,
    content character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comment OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24975)
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
-- TOC entry 3476 (class 0 OID 0)
-- Dependencies: 223
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comment_id_seq OWNED BY public.comment.id;


--
-- TOC entry 216 (class 1259 OID 24699)
-- Name: genres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genres (
    slug character varying NOT NULL,
    genre character varying NOT NULL
);


ALTER TABLE public.genres OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 25883)
-- Name: message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message (
    id integer NOT NULL,
    receiver integer NOT NULL,
    sender integer NOT NULL,
    "sentAt" timestamp without time zone DEFAULT now() NOT NULL,
    content character varying NOT NULL,
    is_read boolean DEFAULT false NOT NULL
);


ALTER TABLE public.message OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 25882)
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
-- TOC entry 3477 (class 0 OID 0)
-- Dependencies: 229
-- Name: message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.message_id_seq OWNED BY public.message.id;


--
-- TOC entry 228 (class 1259 OID 25572)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    id_user integer NOT NULL,
    title character varying NOT NULL,
    body character varying NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    redirect_url character varying,
    thumb character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25571)
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
-- TOC entry 3478 (class 0 OID 0)
-- Dependencies: 227
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- TOC entry 235 (class 1259 OID 34746)
-- Name: report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report (
    id integer NOT NULL,
    type public.report_type_enum DEFAULT 'chapter'::public.report_type_enum NOT NULL,
    detail_report character varying,
    errors text[] DEFAULT '{}'::text[],
    id_object integer NOT NULL,
    link character varying NOT NULL,
    reporter integer,
    is_resolve boolean DEFAULT false NOT NULL
);


ALTER TABLE public.report OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 34745)
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
-- TOC entry 3479 (class 0 OID 0)
-- Dependencies: 234
-- Name: report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_id_seq OWNED BY public.report.id;


--
-- TOC entry 233 (class 1259 OID 26436)
-- Name: slide_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.slide_image (
    id integer NOT NULL,
    link_image character varying NOT NULL
);


ALTER TABLE public.slide_image OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 26435)
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
-- TOC entry 3480 (class 0 OID 0)
-- Dependencies: 232
-- Name: slide_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.slide_image_id_seq OWNED BY public.slide_image.id;


--
-- TOC entry 215 (class 1259 OID 21946)
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
    role public.user_role_enum DEFAULT 'viewer'::public.user_role_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    facebook boolean DEFAULT false NOT NULL,
    phone character varying,
    id_facebook character varying,
    google boolean DEFAULT false NOT NULL,
    id_google character varying
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 26002)
-- Name: user_evaluate_comic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_evaluate_comic (
    id_user integer NOT NULL,
    id_comic integer NOT NULL
);


ALTER TABLE public.user_evaluate_comic OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24965)
-- Name: user_follow_comic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_follow_comic (
    id_user integer NOT NULL,
    id_comic integer NOT NULL
);


ALTER TABLE public.user_follow_comic OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 44802)
-- Name: user_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_history (
    id_user integer NOT NULL,
    id_comic integer NOT NULL,
    id_chapter integer NOT NULL,
    "readAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_history OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 21945)
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
-- TOC entry 3481 (class 0 OID 0)
-- Dependencies: 214
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- TOC entry 222 (class 1259 OID 24970)
-- Name: user_like_comic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_like_comic (
    id_user integer NOT NULL,
    id_comic integer NOT NULL
);


ALTER TABLE public.user_like_comic OWNER TO postgres;

--
-- TOC entry 3264 (class 2604 OID 24990)
-- Name: answer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer ALTER COLUMN id SET DEFAULT nextval('public.answer_id_seq'::regclass);


--
-- TOC entry 3258 (class 2604 OID 24960)
-- Name: chapter id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter ALTER COLUMN id SET DEFAULT nextval('public.chapter_id_seq'::regclass);


--
-- TOC entry 3247 (class 2604 OID 24945)
-- Name: comic id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic ALTER COLUMN id SET DEFAULT nextval('public.comic_id_seq'::regclass);


--
-- TOC entry 3261 (class 2604 OID 24979)
-- Name: comment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.comment_id_seq'::regclass);


--
-- TOC entry 3271 (class 2604 OID 25886)
-- Name: message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message ALTER COLUMN id SET DEFAULT nextval('public.message_id_seq'::regclass);


--
-- TOC entry 3267 (class 2604 OID 25575)
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- TOC entry 3275 (class 2604 OID 34749)
-- Name: report id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report ALTER COLUMN id SET DEFAULT nextval('public.report_id_seq'::regclass);


--
-- TOC entry 3274 (class 2604 OID 26439)
-- Name: slide_image id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slide_image ALTER COLUMN id SET DEFAULT nextval('public.slide_image_id_seq'::regclass);


--
-- TOC entry 3239 (class 2604 OID 21949)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 3285 (class 2606 OID 24955)
-- Name: comic PK_071fba28990ddf3518fcd165624; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic
    ADD CONSTRAINT "PK_071fba28990ddf3518fcd165624" PRIMARY KEY (id);


--
-- TOC entry 3293 (class 2606 OID 24985)
-- Name: comment PK_0b0e4bbc8415ec426f87f3a88e2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY (id);


--
-- TOC entry 3291 (class 2606 OID 24974)
-- Name: user_like_comic PK_16a7d3cb8b76b93aa53e579c4a0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_comic
    ADD CONSTRAINT "PK_16a7d3cb8b76b93aa53e579c4a0" PRIMARY KEY (id_user, id_comic);


--
-- TOC entry 3287 (class 2606 OID 24964)
-- Name: chapter PK_275bd1c62bed7dff839680614ca; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter
    ADD CONSTRAINT "PK_275bd1c62bed7dff839680614ca" PRIMARY KEY (id);


--
-- TOC entry 3303 (class 2606 OID 26443)
-- Name: slide_image PK_29abcbd8e79f32956061b9ccada; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.slide_image
    ADD CONSTRAINT "PK_29abcbd8e79f32956061b9ccada" PRIMARY KEY (id);


--
-- TOC entry 3297 (class 2606 OID 25582)
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- TOC entry 3307 (class 2606 OID 44806)
-- Name: user_history PK_90267ae36d58699b9d688e3e0c1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_history
    ADD CONSTRAINT "PK_90267ae36d58699b9d688e3e0c1" PRIMARY KEY (id_user, id_comic);


--
-- TOC entry 3295 (class 2606 OID 24996)
-- Name: answer PK_9232db17b63fb1e94f97e5c224f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY (id);


--
-- TOC entry 3305 (class 2606 OID 34755)
-- Name: report PK_99e4d0bea58cba73c57f935a546; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY (id);


--
-- TOC entry 3299 (class 2606 OID 25889)
-- Name: message PK_ba01f0a3e0123651915008bc578; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY (id);


--
-- TOC entry 3301 (class 2606 OID 26006)
-- Name: user_evaluate_comic PK_c5a0001cf3d007a68d4c7189dbc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_evaluate_comic
    ADD CONSTRAINT "PK_c5a0001cf3d007a68d4c7189dbc" PRIMARY KEY (id_user, id_comic);


--
-- TOC entry 3281 (class 2606 OID 21958)
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- TOC entry 3283 (class 2606 OID 24705)
-- Name: genres PK_d1cbe4fe39bdfc77c76e94eada5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT "PK_d1cbe4fe39bdfc77c76e94eada5" PRIMARY KEY (slug);


--
-- TOC entry 3289 (class 2606 OID 24969)
-- Name: user_follow_comic PK_ffbcd24540f69b930694c9ff1dc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follow_comic
    ADD CONSTRAINT "PK_ffbcd24540f69b930694c9ff1dc" PRIMARY KEY (id_user, id_comic);


--
-- TOC entry 3313 (class 2606 OID 25022)
-- Name: comment FK_04eef282a6be5bed4e771c0df51; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_04eef282a6be5bed4e771c0df51" FOREIGN KEY (id_user) REFERENCES public."user"(id);


--
-- TOC entry 3311 (class 2606 OID 25017)
-- Name: user_like_comic FK_1e5ebb4fd44408716851dd1c7c7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_comic
    ADD CONSTRAINT "FK_1e5ebb4fd44408716851dd1c7c7" FOREIGN KEY (id_comic) REFERENCES public.comic(id);


--
-- TOC entry 3323 (class 2606 OID 44808)
-- Name: user_history FK_227e09773acb5fd6f6e82df4110; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_history
    ADD CONSTRAINT "FK_227e09773acb5fd6f6e82df4110" FOREIGN KEY (id_user) REFERENCES public."user"(id);


--
-- TOC entry 3308 (class 2606 OID 43785)
-- Name: chapter FK_4fa1a1267095fee4b618f8d59ab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter
    ADD CONSTRAINT "FK_4fa1a1267095fee4b618f8d59ab" FOREIGN KEY (id_comic) REFERENCES public.comic(id);


--
-- TOC entry 3324 (class 2606 OID 44818)
-- Name: user_history FK_5686f18c38cb0063749cfecf100; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_history
    ADD CONSTRAINT "FK_5686f18c38cb0063749cfecf100" FOREIGN KEY (id_chapter) REFERENCES public.chapter(id);


--
-- TOC entry 3312 (class 2606 OID 25012)
-- Name: user_like_comic FK_6a51a4bc3e54103709996abace6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_like_comic
    ADD CONSTRAINT "FK_6a51a4bc3e54103709996abace6" FOREIGN KEY (id_user) REFERENCES public."user"(id);


--
-- TOC entry 3320 (class 2606 OID 26008)
-- Name: user_evaluate_comic FK_6c33744bfdc0227380da06eceed; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_evaluate_comic
    ADD CONSTRAINT "FK_6c33744bfdc0227380da06eceed" FOREIGN KEY (id_user) REFERENCES public."user"(id);


--
-- TOC entry 3314 (class 2606 OID 25027)
-- Name: comment FK_834f0fe1a796c1ae968a470cde9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_834f0fe1a796c1ae968a470cde9" FOREIGN KEY (id_comic) REFERENCES public.comic(id);


--
-- TOC entry 3318 (class 2606 OID 25891)
-- Name: message FK_93c9d531d647e4023fca7fe29cd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_93c9d531d647e4023fca7fe29cd" FOREIGN KEY (receiver) REFERENCES public."user"(id);


--
-- TOC entry 3319 (class 2606 OID 25896)
-- Name: message FK_93d19ff012dfce57259757e4d69; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_93d19ff012dfce57259757e4d69" FOREIGN KEY (sender) REFERENCES public."user"(id);


--
-- TOC entry 3321 (class 2606 OID 26013)
-- Name: user_evaluate_comic FK_964c82de369789b785961a7c416; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_evaluate_comic
    ADD CONSTRAINT "FK_964c82de369789b785961a7c416" FOREIGN KEY (id_comic) REFERENCES public.comic(id);


--
-- TOC entry 3309 (class 2606 OID 25007)
-- Name: user_follow_comic FK_b73c7a1faf8722b6fe50fe8c9f0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follow_comic
    ADD CONSTRAINT "FK_b73c7a1faf8722b6fe50fe8c9f0" FOREIGN KEY (id_comic) REFERENCES public.comic(id);


--
-- TOC entry 3325 (class 2606 OID 44813)
-- Name: user_history FK_b805d149dd98a12aac3c5371487; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_history
    ADD CONSTRAINT "FK_b805d149dd98a12aac3c5371487" FOREIGN KEY (id_comic) REFERENCES public.comic(id);


--
-- TOC entry 3322 (class 2606 OID 34757)
-- Name: report FK_c64428782393c46ad9030d2dc98; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT "FK_c64428782393c46ad9030d2dc98" FOREIGN KEY (reporter) REFERENCES public."user"(id);


--
-- TOC entry 3315 (class 2606 OID 25032)
-- Name: answer FK_e232233358a4430177e0b09d9fc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT "FK_e232233358a4430177e0b09d9fc" FOREIGN KEY (id_comment) REFERENCES public.comment(id);


--
-- TOC entry 3316 (class 2606 OID 25037)
-- Name: answer FK_f3791be3f07fe1a84b510e1af4b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT "FK_f3791be3f07fe1a84b510e1af4b" FOREIGN KEY (id_user) REFERENCES public."user"(id);


--
-- TOC entry 3310 (class 2606 OID 25002)
-- Name: user_follow_comic FK_f64023d100fcc267d70ffd29b19; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follow_comic
    ADD CONSTRAINT "FK_f64023d100fcc267d70ffd29b19" FOREIGN KEY (id_user) REFERENCES public."user"(id);


--
-- TOC entry 3317 (class 2606 OID 25583)
-- Name: notification FK_faae232c811e023f462f7a1f7c5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_faae232c811e023f462f7a1f7c5" FOREIGN KEY (id_user) REFERENCES public."user"(id);


-- Completed on 2023-08-29 00:09:13

--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2023-08-29 00:08:17

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
-- TOC entry 3367 (class 0 OID 24699)
-- Dependencies: 216
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.genres (slug, genre) FROM stdin;
action	Action
adult	Adult
adventure	Adventure
anime	Anime
chuyen-sinh	Chuyển Sinh
co-dai	Cổ Đại
comedy	Comedy
comic	Comic
demons	Demons
detective	Detective
doujinshi	Doujinshi
drama	Drama
dam-my	Đam Mỹ
ecchi	Ecchi
fantasy	Fantasy
gender-bender	Gender Bender
harem	Harem
historical	Historical
horror	Horror
huyen-huyen	Huyền Huyễn
isekai	Isekai
josei	Josei
mafia	Mafia
magic	Magic
manhua	Manhua
manhwa	Manhwa
martial-arts	Martial Arts
mature	Mature
military	Military
mystery	Mystery
ngon-tinh	Ngôn Tình
one-shot	One shot
psychological	Psychological
romance	Romance
school-life	School Life
sci-fi	Sci-fi
seinen	Seinen
shoujo	Shoujo
shoujo-ai	Shoujo Ai
shounen	Shounen
shounen-ai	Shounen Ai
slice-of-life	Slice of life
smut	Smut
sports	Sports
supernatural	Supernatural
tragedy	Tragedy
trong-sinh	Trọng Sinh
truyen-mau	Truyện Màu
webtoon	Webtoon
xuyen-khong	Xuyên Không
yaoi	Yaoi
yuri	Yuri
mecha	Mecha
cooking	Cooking
trung-sinh	Trùng Sinh
gourmet	Gourmet
dark-fantasy	Dark Fantasy
\.


-- Completed on 2023-08-29 00:08:17

--
-- PostgreSQL database dump complete
--

