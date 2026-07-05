--
-- PostgreSQL database dump
--

\restrict mg18fdY1dFN9odsxVdm85CBtqjMI5ay5dFM87BrlqR1JKfXPZgfuhjo9sqfgG7w

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    username character varying(100),
    action character varying(100) NOT NULL,
    description text,
    meta jsonb,
    device_id character varying(255),
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    module character varying(50),
    record_id integer,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: buyback_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buyback_requests (
    id integer NOT NULL,
    sale_id integer,
    customer_name character varying(255),
    customer_phone character varying(20),
    product_name character varying(255),
    device_imei character varying(50),
    device_serial character varying(50),
    condition_description text,
    estimated_price numeric(10,2),
    final_price numeric(10,2),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    approved_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.buyback_requests OWNER TO postgres;

--
-- Name: buyback_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buyback_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.buyback_requests_id_seq OWNER TO postgres;

--
-- Name: buyback_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buyback_requests_id_seq OWNED BY public.buyback_requests.id;


--
-- Name: cashier_shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cashier_shifts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    opened_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp without time zone,
    float_amount numeric(12,2) NOT NULL,
    total_sales numeric(12,2) DEFAULT 0,
    total_transactions integer DEFAULT 0,
    expected_amount numeric(12,2),
    actual_amount numeric(12,2),
    discrepancy numeric(12,2),
    discrepancy_notes text,
    status character varying(20) DEFAULT 'OPEN'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    outlet_id integer DEFAULT 1
);


ALTER TABLE public.cashier_shifts OWNER TO postgres;

--
-- Name: cashier_shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cashier_shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cashier_shifts_id_seq OWNER TO postgres;

--
-- Name: cashier_shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cashier_shifts_id_seq OWNED BY public.cashier_shifts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customer_email_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_email_verifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(128) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customer_email_verifications OWNER TO postgres;

--
-- Name: customer_email_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_email_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_email_verifications_id_seq OWNER TO postgres;

--
-- Name: customer_email_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_email_verifications_id_seq OWNED BY public.customer_email_verifications.id;


--
-- Name: daily_sales_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_sales_summary (
    id integer NOT NULL,
    sale_date date NOT NULL,
    total_sales_count integer DEFAULT 0,
    total_revenue numeric(15,2) DEFAULT 0,
    total_discount numeric(12,2) DEFAULT 0,
    total_items_sold integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_sales_summary OWNER TO postgres;

--
-- Name: daily_sales_summary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_sales_summary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.daily_sales_summary_id_seq OWNER TO postgres;

--
-- Name: daily_sales_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_sales_summary_id_seq OWNED BY public.daily_sales_summary.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    product_id integer NOT NULL,
    warehouse_location_id integer NOT NULL,
    quantity_available integer DEFAULT 0,
    quantity_reserved integer DEFAULT 0,
    quantity_damaged integer DEFAULT 0,
    last_stock_check timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inventory_id_seq OWNER TO postgres;

--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: price_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_list (
    id integer NOT NULL,
    product_id integer NOT NULL,
    channel_id integer,
    price numeric(10,2) NOT NULL,
    effective_date date,
    expiry_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.price_list OWNER TO postgres;

--
-- Name: price_list_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.price_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.price_list_id_seq OWNER TO postgres;

--
-- Name: price_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.price_list_id_seq OWNED BY public.price_list.id;


--
-- Name: product_conditions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_conditions (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_conditions OWNER TO postgres;

--
-- Name: product_conditions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_conditions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_conditions_id_seq OWNER TO postgres;

--
-- Name: product_conditions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_conditions_id_seq OWNED BY public.product_conditions.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_url character varying(500) NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_images_id_seq OWNER TO postgres;

--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: product_sales_performance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_sales_performance (
    id integer NOT NULL,
    product_id integer NOT NULL,
    period_date date,
    quantity_sold integer DEFAULT 0,
    revenue numeric(15,2) DEFAULT 0,
    rank integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_sales_performance OWNER TO postgres;

--
-- Name: product_sales_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_sales_performance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_sales_performance_id_seq OWNER TO postgres;

--
-- Name: product_sales_performance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_sales_performance_id_seq OWNED BY public.product_sales_performance.id;


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id integer NOT NULL,
    product_id integer NOT NULL,
    variant_name character varying(100),
    variant_value character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: product_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_variants_id_seq OWNER TO postgres;

--
-- Name: product_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_variants_id_seq OWNED BY public.product_variants.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    sku character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    category_id integer NOT NULL,
    description text,
    specifications jsonb,
    condition_id integer NOT NULL,
    buy_price numeric(10,2),
    selling_price numeric(10,2),
    is_active boolean DEFAULT true,
    image_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    barcode character varying(100),
    social_links jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    discount_type character varying(20),
    discount_value numeric(10,2) NOT NULL,
    applicable_products jsonb,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.promotions_id_seq OWNER TO postgres;

--
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotions_id_seq OWNED BY public.promotions.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    quantity_received integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchase_order_items_id_seq OWNER TO postgres;

--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    supplier_name character varying(255) NOT NULL,
    supplier_email character varying(100),
    supplier_phone character varying(20),
    total_amount numeric(12,2) DEFAULT 0,
    status character varying(20) DEFAULT 'DRAFT'::character varying,
    expected_delivery_date date,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchase_orders_id_seq OWNER TO postgres;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    discount_percent numeric(5,2) DEFAULT 0,
    subtotal numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sale_items_id_seq OWNER TO postgres;

--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    invoice_number character varying(50) NOT NULL,
    sales_channel_id integer NOT NULL,
    customer_name character varying(255),
    customer_phone character varying(20),
    customer_email character varying(100),
    subtotal numeric(12,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    total_amount numeric(12,2) NOT NULL,
    payment_method character varying(50),
    payment_status character varying(20) DEFAULT 'PENDING'::character varying,
    transaction_status character varying(20) DEFAULT 'COMPLETED'::character varying,
    sales_staff_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cashier_shift_id integer
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: sales_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_channels (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sales_channels OWNER TO postgres;

--
-- Name: sales_channels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_channels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_channels_id_seq OWNER TO postgres;

--
-- Name: sales_channels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_channels_id_seq OWNED BY public.sales_channels.id;


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_id_seq OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: stock_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_alerts (
    id integer NOT NULL,
    product_id integer NOT NULL,
    min_quantity integer DEFAULT 5,
    is_active boolean DEFAULT true,
    last_alert_sent timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock_alerts OWNER TO postgres;

--
-- Name: stock_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_alerts_id_seq OWNER TO postgres;

--
-- Name: stock_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_alerts_id_seq OWNED BY public.stock_alerts.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    product_id integer NOT NULL,
    warehouse_location_id integer NOT NULL,
    movement_type character varying(20) NOT NULL,
    quantity integer NOT NULL,
    reference_id integer,
    reference_type character varying(50),
    notes text,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_movements_id_seq OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: store_devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_devices (
    id integer NOT NULL,
    device_id character varying(255) NOT NULL,
    device_name character varying(100) DEFAULT 'Perangkat Toko'::character varying NOT NULL,
    ip_address character varying(45),
    registered_by integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.store_devices OWNER TO postgres;

--
-- Name: store_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.store_devices_id_seq OWNER TO postgres;

--
-- Name: store_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_devices_id_seq OWNED BY public.store_devices.id;


--
-- Name: trade_ins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trade_ins (
    id integer NOT NULL,
    old_product_id integer,
    new_product_id integer,
    customer_name character varying(255),
    customer_phone character varying(20),
    trade_in_value numeric(10,2),
    discount_applied numeric(10,2),
    final_price_for_new numeric(10,2),
    status character varying(20) DEFAULT 'COMPLETED'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trade_ins OWNER TO postgres;

--
-- Name: trade_ins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trade_ins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trade_ins_id_seq OWNER TO postgres;

--
-- Name: trade_ins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trade_ins_id_seq OWNED BY public.trade_ins.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    role_id integer,
    phone character varying(20),
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email_verified boolean DEFAULT true
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouse_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_locations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.warehouse_locations OWNER TO postgres;

--
-- Name: warehouse_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouse_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.warehouse_locations_id_seq OWNER TO postgres;

--
-- Name: warehouse_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouse_locations_id_seq OWNED BY public.warehouse_locations.id;


--
-- Name: whatsapp_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_messages (
    id integer NOT NULL,
    sale_id integer,
    customer_phone character varying(20) NOT NULL,
    message_type character varying(50),
    message_content text NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.whatsapp_messages OWNER TO postgres;

--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.whatsapp_messages_id_seq OWNER TO postgres;

--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.whatsapp_messages_id_seq OWNED BY public.whatsapp_messages.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: buyback_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyback_requests ALTER COLUMN id SET DEFAULT nextval('public.buyback_requests_id_seq'::regclass);


--
-- Name: cashier_shifts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashier_shifts ALTER COLUMN id SET DEFAULT nextval('public.cashier_shifts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customer_email_verifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_email_verifications ALTER COLUMN id SET DEFAULT nextval('public.customer_email_verifications_id_seq'::regclass);


--
-- Name: daily_sales_summary id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary ALTER COLUMN id SET DEFAULT nextval('public.daily_sales_summary_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: price_list id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list ALTER COLUMN id SET DEFAULT nextval('public.price_list_id_seq'::regclass);


--
-- Name: product_conditions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_conditions ALTER COLUMN id SET DEFAULT nextval('public.product_conditions_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: product_sales_performance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sales_performance ALTER COLUMN id SET DEFAULT nextval('public.product_sales_performance_id_seq'::regclass);


--
-- Name: product_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants ALTER COLUMN id SET DEFAULT nextval('public.product_variants_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: promotions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions ALTER COLUMN id SET DEFAULT nextval('public.promotions_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: sales_channels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_channels ALTER COLUMN id SET DEFAULT nextval('public.sales_channels_id_seq'::regclass);


--
-- Name: stock_alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_alerts ALTER COLUMN id SET DEFAULT nextval('public.stock_alerts_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: store_devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_devices ALTER COLUMN id SET DEFAULT nextval('public.store_devices_id_seq'::regclass);


--
-- Name: trade_ins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_ins ALTER COLUMN id SET DEFAULT nextval('public.trade_ins_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouse_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_locations ALTER COLUMN id SET DEFAULT nextval('public.warehouse_locations_id_seq'::regclass);


--
-- Name: whatsapp_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_messages ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_messages_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, username, action, description, meta, device_id, ip_address, created_at) FROM stdin;
1	1	admin	DAFTARKAN_PERANGKAT	Mendaftarkan perangkat "dev-576083df-mpo2m6wm" (ID: dev-576083df-mpo2m6wm)	\N	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-27 13:20:17.461023
2	1	admin	HAPUS_PERANGKAT	Menonaktifkan perangkat "dev-576083df-mpo2m6wm"	\N	\N	\N	2026-05-27 13:35:58.115905
3	1	admin	DAFTARKAN_PERANGKAT	Mendaftarkan perangkat "dev-576083df-mpo2m6wm" (ID: dev-576083df-mpo2m6wm)	\N	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-27 13:36:30.180185
4	3	staff1	BUAT_TRANSAKSI	Transaksi INV-2026-05-27-0001 sebesar Rp 135.000.000	{"product_id": 18, "total_amount": 135000000, "invoice_number": "INV-2026-05-27-0001"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-27 13:54:47.785909
5	3	staff1	BUAT_TRANSAKSI	Transaksi INV-2026-05-27-0011 sebesar Rp 10.500.000	{"product_id": 17, "total_amount": 10500000, "invoice_number": "INV-2026-05-27-0011"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-27 14:00:56.671338
6	3	staff1	BUAT_TRANSAKSI	Transaksi INV-2026-05-27-0021 sebesar Rp 10.500.000	{"product_id": 16, "total_amount": 10500000, "invoice_number": "INV-2026-05-27-0021"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-27 14:01:27.171004
7	3	staff1	BUAT_TRANSAKSI	Transaksi INV-2026-05-27-0031 sebesar Rp 67.500.000	{"product_id": 18, "total_amount": 67500000, "invoice_number": "INV-2026-05-27-0031"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-27 14:06:01.629437
8	1	admin	BUAT_TRANSAKSI	Transaksi INV-2026-05-27-0041 sebesar Rp 13.500.000	{"product_id": 18, "total_amount": 13500000, "invoice_number": "INV-2026-05-27-0041"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-27 14:09:17.807841
9	1	admin	BUAT_TRANSAKSI	Transaksi INV-2026-05-27-0051 sebesar Rp 6.075.000	{"items_count": 1, "total_amount": 6075000, "invoice_number": "INV-2026-05-27-0051"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-27 15:45:03.179128
10	1	admin	BUAT_TRANSAKSI	Transaksi INV-2026-05-29-0001 sebesar Rp 6.750.000	{"items_count": 1, "total_amount": 6750000, "invoice_number": "INV-2026-05-29-0001"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-29 09:47:10.111396
11	1	admin	BUAT_TRANSAKSI	Transaksi INV-2026-05-29-0011 sebesar Rp 33.750.000	{"items_count": 1, "total_amount": 33750000, "invoice_number": "INV-2026-05-29-0011"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-29 10:10:36.074218
12	3	staff1	BUAT_TRANSAKSI	Transaksi INV-2026-05-29-0021 sebesar Rp 5.400.000	{"items_count": 1, "total_amount": 5400000, "invoice_number": "INV-2026-05-29-0021"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-29 10:13:08.858257
13	3	staff1	BUAT_TRANSAKSI	Transaksi INV-2026-05-29-0031 sebesar Rp 6.750.000	{"items_count": 1, "total_amount": 6750000, "invoice_number": "INV-2026-05-29-0031"}	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	2026-05-29 10:14:40.528608
14	1	admin	DAFTARKAN_PERANGKAT	Mendaftarkan perangkat "dev-6200b796-mq3m4o0r" (ID: dev-6200b796-mq3m4o0r)	\N	dev-6200b796-mq3m4o0r	::ffff:192.168.65.1	2026-06-07 10:59:57.850353
15	1	admin	HAPUS_PERANGKAT	Menonaktifkan perangkat "dev-576083df-mpo2m6wm"	\N	\N	\N	2026-06-09 17:20:49.489031
16	1	admin	BUAT_TRANSAKSI	Transaksi INV-2026-06-11-0001 sebesar Rp 6.750.000	{"items_count": 1, "total_amount": 6750000, "invoice_number": "INV-2026-06-11-0001"}	dev-6200b796-mq3m4o0r	::ffff:192.168.65.1	2026-06-11 05:56:25.950247
17	1	admin	DAFTARKAN_PERANGKAT	Mendaftarkan perangkat "dev-626fc7ed-mq9k9r5x" (ID: dev-6200b796-mq3m4o0r)	\N	dev-6200b796-mq3m4o0r	192.168.65.1	2026-06-11 14:00:40.420324
18	1	admin	DAFTARKAN_PERANGKAT	Mendaftarkan perangkat "dev-626fc7ed-mq9k9r5x" (ID: dev-6200b796-mq3m4o0r)	\N	dev-6200b796-mq3m4o0r	192.168.65.1	2026-06-11 14:01:45.379336
19	1	admin	HAPUS_PERANGKAT	Menonaktifkan perangkat "dev-626fc7ed-mq9k9r5x"	\N	\N	\N	2026-06-11 14:01:49.38245
20	1	admin	DAFTARKAN_PERANGKAT	Mendaftarkan perangkat "dev-626fc7ed-mq9k9r5x" (ID: dev-6200b796-mq3m4o0r)	\N	dev-6200b796-mq3m4o0r	192.168.65.1	2026-06-11 14:01:53.358076
21	1	admin	BUAT_TRANSAKSI	Transaksi INV-2026-06-11-0011 sebesar Rp 3.240.000	{"items_count": 2, "total_amount": 3240000, "invoice_number": "INV-2026-06-11-0011"}	dev-6200b796-mq3m4o0r	192.168.65.1	2026-06-11 21:08:43.238157
22	1	admin	BUAT_TRANSAKSI	Transaksi INV-2026-06-11-0021 sebesar Rp 1.836.000	{"items_count": 1, "total_amount": 1836000, "invoice_number": "INV-2026-06-11-0021"}	dev-6200b796-mq3m4o0r	192.168.65.1	2026-06-11 21:13:19.034739
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, module, record_id, old_values, new_values, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: buyback_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.buyback_requests (id, sale_id, customer_name, customer_phone, product_name, device_imei, device_serial, condition_description, estimated_price, final_price, status, approved_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cashier_shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cashier_shifts (id, user_id, opened_at, closed_at, float_amount, total_sales, total_transactions, expected_amount, actual_amount, discrepancy, discrepancy_notes, status, created_at, updated_at, outlet_id) FROM stdin;
1	1	2026-03-12 12:42:14.94383	2026-03-12 12:50:41.862633	0.00	0.00	0	0.00	1000000.00	1000000.00	Test	CLOSED_DISCREPANCY	2026-03-12 12:42:14.94383	2026-03-12 12:42:14.94383	1
2	1	2026-03-12 12:52:29.205689	2026-03-12 12:53:26.760215	1000000.00	0.00	0	1000000.00	10000000.00	9000000.00		CLOSED_DISCREPANCY	2026-03-12 12:52:29.205689	2026-03-12 12:52:29.205689	1
3	1	2026-04-07 09:04:40.147262	2026-05-20 16:37:13.819882	1000000.00	0.00	0	1000000.00	8.02	-999991.98		CLOSED_DISCREPANCY	2026-04-07 09:04:40.147262	2026-04-07 09:04:40.147262	1
4	3	2026-05-27 14:04:17.588476	2026-05-27 14:04:47.323962	200000.00	0.00	0	200000.00	200000.00	0.00		CLOSED_OK	2026-05-27 14:04:17.588476	2026-05-27 14:04:17.588476	1
5	3	2026-05-27 14:04:58.117381	2026-05-27 14:05:04.914506	0.00	0.00	0	0.00	1000000.00	1000000.00		CLOSED_DISCREPANCY	2026-05-27 14:04:58.117381	2026-05-27 14:04:58.117381	1
6	3	2026-05-27 14:05:45.131447	2026-05-27 14:06:48.060049	0.00	0.00	0	0.00	225000000.00	225000000.00		CLOSED_DISCREPANCY	2026-05-27 14:05:45.131447	2026-05-27 14:05:45.131447	1
7	3	2026-05-27 14:07:35.348885	2026-05-27 15:52:37.837105	0.00	0.00	0	0.00	20000000.00	20000000.00	shift by julian	CLOSED_DISCREPANCY	2026-05-27 14:07:35.348885	2026-05-27 14:07:35.348885	1
8	1	2026-05-29 09:45:24.573328	2026-05-29 09:45:54.761045	1000000.00	0.00	0	1000000.00	2000000.00	1000000.00		CLOSED_DISCREPANCY	2026-05-29 09:45:24.573328	2026-05-29 09:45:24.573328	1
9	1	2026-05-29 09:46:17.348798	2026-05-29 09:46:30.31745	1000000.00	0.00	0	1000000.00	5000000.00	4000000.00	shhift by satriya	CLOSED_DISCREPANCY	2026-05-29 09:46:17.348798	2026-05-29 09:46:17.348798	1
10	1	2026-05-29 09:46:54.74082	2026-05-29 10:09:45.916709	1000000.00	6750000.00	1	7750000.00	7750000.00	0.00	shift by satriya	CLOSED_OK	2026-05-29 09:46:54.74082	2026-05-29 09:46:54.74082	1
11	1	2026-05-29 10:10:19.904488	2026-05-29 10:11:58.684221	0.00	33750000.00	1	33750000.00	30000000.00	-3750000.00		CLOSED_DISCREPANCY	2026-05-29 10:10:19.904488	2026-05-29 10:10:19.904488	1
12	3	2026-05-29 10:12:52.393278	2026-05-29 10:13:33.189104	1000000.00	5400000.00	1	6400000.00	6400000.00	0.00		CLOSED_OK	2026-05-29 10:12:52.393278	2026-05-29 10:12:52.393278	1
13	3	2026-05-29 10:14:29.430883	2026-05-29 10:14:59.675357	0.00	6750000.00	1	6750000.00	6750000.00	0.00	shift by satriya	CLOSED_OK	2026-05-29 10:14:29.430883	2026-05-29 10:14:29.430883	1
14	1	2026-06-07 11:10:28.038493	2026-06-07 14:08:59.169242	1000000.00	0.00	0	1000000.00	15000000.00	14000000.00		CLOSED_DISCREPANCY	2026-06-07 11:10:28.038493	2026-06-07 11:10:28.038493	1
15	1	2026-06-09 16:23:59.103263	2026-06-09 16:41:12.382156	1000000.00	0.00	0	1000000.00	2000000000.00	1999000000.00		CLOSED_DISCREPANCY	2026-06-09 16:23:59.103263	2026-06-09 16:23:59.103263	1
16	1	2026-06-09 16:43:43.872724	2026-06-11 21:18:17.877741	1000000.00	11826000.00	3	12826000.00	12826000.00	0.00		CLOSED_OK	2026-06-09 16:43:43.872724	2026-06-09 16:43:43.872724	1
21	1	2026-06-11 21:18:30.556474	2026-06-11 21:21:03.156428	0.00	0.00	0	0.00	12000000.00	12000000.00		CLOSED_DISCREPANCY	2026-06-11 21:18:30.556474	2026-06-11 21:18:30.556474	1
22	1	2026-06-11 21:21:07.644515	2026-06-11 21:24:21.041888	1000000.00	0.00	0	1000000.00	0.00	-1000000.00		CLOSED_DISCREPANCY	2026-06-11 21:21:07.644515	2026-06-11 21:21:07.644515	1
24	3	2026-06-11 21:41:51.705901	2026-06-11 21:42:07.476117	1000000.00	0.00	0	1000000.00	1000000.00	0.00		CLOSED_OK	2026-06-11 21:41:51.705901	2026-06-11 21:41:51.705901	1
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, is_active, created_at) FROM stdin;
1	iPad	Tablet Apple iPad - berbagai generasi dan ukuran	t	2026-03-10 03:26:34.203645
2	MacBook	Laptop Apple MacBook - Pro, Air, dan versi lain	t	2026-03-10 03:26:34.203645
3	iPhone	Smartphone Apple iPhone - berbagai seri	t	2026-03-10 03:26:34.203645
4	Aksesori	Aksesori Apple - charger, kabel, casing, dll	t	2026-03-10 03:26:34.203645
\.


--
-- Data for Name: customer_email_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_email_verifications (id, user_id, token, expires_at, used_at, created_at) FROM stdin;
1	5	9ce77ced9cff2c954153495fbdd9860f9d53c60bebf744056b5917b11f2e0800	2026-04-17 23:44:34.24	\N	2026-04-16 23:44:34.241753
2	6	6dc68e36ec145597dbde6bcc85942c091b884718ad3a6d53fc8cdb74f372257b	2026-04-17 23:45:22.927	2026-04-16 23:45:23.038729	2026-04-16 23:45:22.929077
\.


--
-- Data for Name: daily_sales_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_sales_summary (id, sale_date, total_sales_count, total_revenue, total_discount, total_items_sold, created_at, updated_at) FROM stdin;
1	2026-05-27	1	6075000.00	675000.00	1	2026-05-27 15:45:03.120683	2026-05-27 15:45:03.120683
2	2026-05-29	4	52650000.00	1350000.00	4	2026-05-29 09:47:09.990951	2026-05-29 09:47:09.990951
6	2026-06-11	3	11826000.00	0.00	4	2026-06-11 05:56:25.820461	2026-06-11 05:56:25.820461
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory (id, product_id, warehouse_location_id, quantity_available, quantity_reserved, quantity_damaged, last_stock_check, created_at, updated_at) FROM stdin;
6	7	5	7	0	0	\N	2026-03-12 14:36:11.197204	2026-03-12 14:36:11.197204
2	2	5	5	0	0	\N	2026-03-12 14:21:28.28022	2026-03-12 14:40:38.673178
5	6	5	-1	0	0	\N	2026-03-12 14:21:28.28022	2026-04-07 09:53:53.731287
10	8	5	5	0	0	\N	2026-05-11 18:01:55.290328	2026-05-11 18:01:55.290328
11	9	5	1	0	0	\N	2026-05-11 18:02:42.026234	2026-05-11 18:02:42.026234
13	11	5	1	0	0	\N	2026-05-14 04:47:07.451681	2026-05-14 04:47:07.451681
14	12	5	1	0	0	\N	2026-05-20 10:15:39.032121	2026-05-20 10:15:39.032121
12	10	5	4	0	0	\N	2026-05-11 18:04:32.449486	2026-05-20 12:46:05.104343
3	3	5	20	0	0	\N	2026-03-12 14:21:28.28022	2026-05-20 12:46:37.177723
15	13	5	0	1	1	\N	2026-05-20 11:17:24.217373	2026-05-20 13:22:17.755263
16	14	5	12	0	0	\N	2026-05-20 11:38:26.113807	2026-05-20 14:09:31.749269
4	4	5	-1	0	0	\N	2026-03-12 14:21:28.28022	2026-05-20 14:10:45.332594
1	1	5	8	5	5	\N	2026-03-12 14:21:28.28022	2026-05-20 14:12:30.944821
26	15	5	1	0	0	\N	2026-05-20 15:41:42.866195	2026-05-20 15:49:58.936471
29	17	5	0	0	0	\N	2026-05-20 17:06:18.71001	2026-05-27 14:00:56.60952
35	19	5	1	0	0	\N	2026-05-31 12:05:57.101938	2026-05-31 12:05:57.101938
36	20	5	1	0	0	\N	2026-06-07 10:54:06.018766	2026-06-07 10:54:06.018766
30	18	5	9	0	20	\N	2026-05-20 17:10:34.214603	2026-06-09 14:56:17.398286
38	21	5	2	0	0	\N	2026-06-11 06:30:44.24788	2026-06-11 06:30:44.24788
39	22	5	1	0	0	\N	2026-06-11 12:23:56.651373	2026-06-11 12:23:56.651373
28	16	5	1	0	0	\N	2026-05-20 17:00:03.380051	2026-06-11 12:27:39.310579
41	23	5	1	0	0	\N	2026-06-11 12:45:31.259278	2026-06-11 12:45:31.259278
42	24	5	1	0	0	\N	2026-06-11 13:06:04.483016	2026-06-11 13:06:04.483016
43	25	5	1	0	0	\N	2026-06-11 13:23:11.105437	2026-06-11 13:23:11.105437
44	26	5	0	0	0	\N	2026-06-11 14:16:44.702844	2026-06-11 14:16:44.702844
45	27	5	-1	0	0	\N	2026-06-11 14:18:43.351969	2026-06-11 14:18:43.351969
46	28	5	3	0	0	\N	2026-06-11 20:28:26.766191	2026-06-11 21:34:37.121095
48	29	5	1	0	0	\N	2026-06-11 22:12:25.438337	2026-06-11 22:12:25.438337
\.


--
-- Data for Name: price_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_list (id, product_id, channel_id, price, effective_date, expiry_date, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: product_conditions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_conditions (id, name, description, created_at) FROM stdin;
1	Baru	Produk baru, belum pernah digunakan	2026-03-10 03:26:34.203267
2	Bekas/Second	Produk bekas, masih dalam kondisi baik	2026-03-10 03:26:34.203267
3	Refurbish	Produk yang telah diperbaiki dan disertifikasi ulang	2026-03-10 03:26:34.203267
4	Display Unit	Unit display dari toko atau distributor	2026-03-10 03:26:34.203267
6	BNIB	Brand New In Box - Produk baru, tersegel dalam box original	2026-05-20 16:19:53.798412
7	BNOB	Brand New Open Box - Produk baru, box telah dibuka namun belum digunakan	2026-05-20 16:19:53.798412
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, image_url, sort_order, created_at) FROM stdin;
76	25	/uploads/products/1781184191094--TEAMAPPLEREADY--TAIPH96iPad-mini-7-128G.jpg	0	2026-06-11 13:23:59.66595
77	26	/uploads/products/1781187404690-WhatsApp-Image-2026-06-11-at-21-16-13.jpeg	0	2026-06-11 14:16:44.702844
78	27	/uploads/products/1781187523343-WhatsApp-Image-2026-06-11-at-21-16-13.jpeg	0	2026-06-11 14:18:43.351969
79	28	/uploads/products/1781209706729--TEAMAPPLEREADY--TAIPE165iPad-Air-5-64GB.jpg	0	2026-06-11 20:28:26.766191
15	1	https://example.com/ipad-air-5.jpg	0	2026-05-20 11:57:15.458121
16	1	/uploads/products/1775983371372--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	1	2026-05-20 11:57:15.458121
17	1	/uploads/products/1775983371383--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	2	2026-05-20 11:57:15.458121
18	1	/uploads/products/1775983371397--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	3	2026-05-20 11:57:15.458121
19	1	/uploads/products/1775983371399--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	4	2026-05-20 11:57:15.458121
20	1	/uploads/products/1775983899365--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	5	2026-05-20 11:57:15.458121
21	1	/uploads/products/1775983899369--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	6	2026-05-20 11:57:15.458121
22	1	/uploads/products/1775983899383--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	7	2026-05-20 11:57:15.458121
23	1	/uploads/products/1775983899384--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	8	2026-05-20 11:57:15.458121
28	17	/uploads/products/1779296778691--TEAMAPPLEREADY--TAIPL108iPad-Pro-M1-256.jpg	0	2026-05-20 17:06:18.71001
29	17	/uploads/products/1779296778695--TEAMAPPLEREADY--TAIPL108iPad-Pro-M1-256.jpg	1	2026-05-20 17:06:18.71001
30	17	/uploads/products/1779296778703--TEAMAPPLEREADY--TAIPL108iPad-Pro-M1-256.jpg	2	2026-05-20 17:06:18.71001
31	17	/uploads/products/1779296778705--TEAMAPPLEREADY--TAIPL108iPad-Pro-M1-256.jpg	3	2026-05-20 17:06:18.71001
34	20	/uploads/products/1780829646007-Screenshot-2026-05-30-at-9-43-19---PM.png	0	2026-06-07 10:54:06.018766
35	21	/uploads/products/1781159444239-black_14.jpeg	0	2026-06-11 06:30:44.24788
69	23	/uploads/products/1781181931243--TEAMAPPLEREADY--TAIPE166-iPad-Air-5-256.jpg	0	2026-06-11 13:01:39.884384
71	24	/uploads/products/1781183164466--TEAMAPPLEREADY--TAIPN73iPad-Pro-M4-256G.jpg	0	2026-06-11 13:09:01.467328
72	22	/uploads/products/1781180636626--TEAMAPPLEREADY--TAIPN74iPad-Pro-M4-256G.jpg	0	2026-06-11 13:14:16.157332
73	18	/uploads/products/1781181470571--TEAMAPPLEREADY--TAIPE165iPad-Air-5-64GB.jpg	0	2026-06-11 13:17:30.736989
74	16	/uploads/products/1781181253507--TEAMAPPLEREADY--TAIPM175iPad-Pro-M2-128.jpg	0	2026-06-11 13:18:51.259985
\.


--
-- Data for Name: product_sales_performance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_sales_performance (id, product_id, period_date, quantity_sold, revenue, rank, created_at) FROM stdin;
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, variant_name, variant_value, description, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, sku, name, category_id, description, specifications, condition_id, buy_price, selling_price, is_active, image_url, created_at, updated_at, barcode, social_links) FROM stdin;
2	PROD-002	MacBook Pro 13" M1 256GB	2	MacBook Pro 13 inch M1 Chip, 256GB SSD, Space Gray	\N	1	12000000.00	14500000.00	f	https://example.com/macbook-pro-m1.jpg	2026-03-10 03:26:34.204861	2026-05-20 15:36:53.209316	PROD-002	{}
1	PROD-001	iPad Air 5 64GB Silver	1	iPad Air 5th Generation, 64GB, Warna Silver, Kondisi Baru	\N	1	4500000.00	5500000.00	f	https://example.com/ipad-air-5.jpg	2026-03-10 03:26:34.204861	2026-05-20 15:36:56.982654	PROD-001	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "", "instagram": "https://www.instagram.com/p/DYhKBc5EQxT/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==", "tokopedia": ""}
3	PROD-003	iPhone 14 Pro 128GB Bekas	3	iPhone 14 Pro, 128GB, Deep Purple, Kondisi Bekas	\N	2	8000000.00	10000000.00	f	https://example.com/iphone-14-pro.jpg	2026-03-10 03:26:34.204861	2026-05-20 15:37:01.366086	PROD-003	{}
7	TEST-STOCK-001	Produk Test Stok	1	test	\N	1	1000.00	1500.00	f	\N	2026-03-12 14:36:11.197204	2026-03-12 14:36:30.27969	TEST-STOCK-001	{}
15	-	Ipad Air 5 64Gb Ibox Wifi Only	1	𝗦𝗣𝗘𝗦𝗜𝗙𝗜𝗞𝗔𝗦𝗜 :\r\n- Wifi Only\r\n- Warna Spacegray\r\n- RAM 8GB\r\n- Internal 64GB\r\n- Chip M1\r\n- Camera 12MP\r\n\r\n𝗞𝗘𝗟𝗘𝗡𝗚𝗞𝗔𝗣𝗔𝗡 :\r\n- Unit original\r\n- Box original\r\n- USB Adapter\r\n- Cable C to C\r\n- Manual book\r\n\r\n𝗞𝗢𝗡𝗗𝗜𝗦𝗜 :\r\n- Fisik mulus\r\n- Semua fungsi normal\r\n- Performa aman no minus\r\n- Detail video unit silakan chat\r\n\r\n𝗖𝗔𝗧𝗔𝗧𝗔𝗡 :\r\n- Garansi toko 7 hari\r\n- Google Maps: Team Apple Jogja\r\n- Pengiriman luar kota via Paxel/JNE termasuk asuransi\r\n- Tanyakan sedetail mungkin sebelum membeli\r\n- Harap video ketika melakukan unboxing untuk menghindari hal-hal yang tidak dinginkan	\N	2	6000000.00	6750000.00	f	\N	2026-05-20 15:41:42.866195	2026-05-20 17:07:21.69305	-	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "", "instagram": "https://www.instagram.com/p/DYj8qsjEbL6/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "tokopedia": ""}
8	SKU-TEST-20250512	iPhone 13 mini	3	Test product	\N	1	7500000.00	8000000.00	f	\N	2026-05-11 18:01:55.290328	2026-05-20 11:36:44.078027	SKU-TEST-20250512	{}
9	19252690147	Iphone 13 mini	3		\N	1	7500000.00	8000000.00	f	\N	2026-05-11 18:02:42.026234	2026-05-20 11:36:51.894158	19252690147	{}
12	194252690147	iphone 13 mini	3		\N	1	8000000.00	8500000.00	f	\N	2026-05-20 10:15:39.032121	2026-05-20 11:47:09.332794	194252690147	{"shopee": "https://shopee.co.id/iphone13mini", "instagram": "https://instagram.com/p/test123"}
14	13scndibx	Iphone 13 Mini	3		\N	1	7500000.00	8000000.00	f	\N	2026-05-20 11:38:26.113807	2026-05-20 15:36:34.49477	194252690147	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "", "instagram": "https://www.instagram.com/p/DYjrba4kVad/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "tokopedia": ""}
4	PROD-004	Apple USB-C Charger 20W	4	Pengisi Daya Apple USB-C 20W, Original	\N	1	300000.00	450000.00	f	https://example.com/charger.jpg	2026-03-10 03:26:34.204861	2026-05-20 15:36:37.799387	PROD-004	{}
13	8997018320829	Gajah baru	4		\N	1	17500.00	18000.00	f	\N	2026-05-20 11:17:24.217373	2026-05-20 15:36:41.509355	8997018320829	{}
11	195950086256	Ipad Gen 11	1		\N	1	10000000.00	11000000.00	f	\N	2026-05-14 04:47:07.451681	2026-05-20 15:36:44.465298	195950086256	{}
10	8994796281601	rokok aroma	4		\N	1	20000.00	21000.00	f	\N	2026-05-11 18:04:32.449486	2026-05-20 15:36:47.576417	8994796281601	{}
6	sds	dsadsd	2		\N	3	20000000.00	20000000.00	f	/uploads/products/1775982712895--TEAMAPPLEREADY--TAIPC209iPad-Gen-10-64G.jpg	2026-03-12 14:11:29.154584	2026-05-20 15:36:50.374725	sds	{}
17	M1M1M1	Ipad Pro M1 256GB WiFi Only	1	Kelengkapan\r\n- Unit Original\r\n- Box Original\r\n- USB Adapter\r\n- Cable C to C\r\n- Manual Book	{"ram": "8 GB", "chip": "Apple M1", "color": "SpaceGrey", "camera": "12 MP", "internal": "256 GB"}	2	10000000.00	10500000.00	f	/uploads/products/1779296778691--TEAMAPPLEREADY--TAIPL108iPad-Pro-M1-256.jpg	2026-05-20 17:06:18.71001	2026-05-29 09:56:10.605123	M1M1M1	{}
20	PROM1	Ipad Pro M1	1	mantappp	{"ram": "6 GB", "chip": "Apple M1 Ultra", "color": "Spacegrey", "camera": "48 MP", "internal": "128 GB"}	6	10000000.00	11000000.00	f	/uploads/products/1780829646007-Screenshot-2026-05-30-at-9-43-19---PM.png	2026-06-07 10:54:06.018766	2026-06-07 10:57:06.842866	PROM1	{}
18	A5A5A5	Ipad AIr 5 Ibox	1	- Unit original\r\n- Box original\r\n- USB Adapter\r\n- Cable C to C\r\n- Manual boo	{"ram": "8 GB", "chip": "Apple M1", "color": "SpaceGrey", "camera": "12 MP", "internal": "64 GB"}	2	6000000.00	6750000.00	t	/uploads/products/1781181470571--TEAMAPPLEREADY--TAIPE165iPad-Air-5-64GB.jpg	2026-05-20 17:10:34.214603	2026-06-11 13:17:30.736989	A5A5A5	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "https://wa.me/6289669617515?text=hai kak saya mau beli ipad air 5 iBox", "instagram": "https://www.instagram.com/p/DZaC_rfgRil/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "tokopedia": ""}
21	13IBX	Iphone 13 Mini IBOX	3	BARU	{"ram": "4 GB", "chip": "Apple A13 Bionic", "color": "Pink", "camera": "12 MP", "internal": "128 GB"}	6	7500000.00	8500000.00	f	/uploads/products/1781159444239-black_14.jpeg	2026-06-11 06:30:44.24788	2026-06-11 12:38:03.435748	194252690147	{}
16	111111	Ipad Pro M2 128GB WiFi Only	1	Kelengkapan\r\n- Unit Original\r\n- USB Adapter\r\n- Cable c to c\r\n- Box Original	{"ram": "8 GB", "chip": "Apple M2", "color": "Spacegray", "camera": "12 MP", "internal": "128 GB"}	2	10000000.00	10500000.00	t	/uploads/products/1781181253507--TEAMAPPLEREADY--TAIPM175iPad-Pro-M2-128.jpg	2026-05-20 17:00:03.380051	2026-06-11 13:18:51.259985	111111	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "https://wa.me/6289669617515?text=hai kak saya mau beli Ipad Pro M2 128GB WiFi Only", "instagram": "https://www.instagram.com/p/DZb3ccDkd1V/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "tokopedia": ""}
19	131313	Iphone 13 Mini	3	baruuu	{"ram": "4 GB", "chip": "Apple A13 Bionic", "color": "Pink", "camera": "12 MP", "internal": "128 GB"}	6	7500000.00	8000000.00	f	\N	2026-05-31 12:05:57.101938	2026-06-11 12:38:06.286243	194252690147	{}
23	IPA5CPO	Ipad Air 5 CPO	1	𝗞𝗘𝗟𝗘𝗡𝗚𝗞𝗔𝗣𝗔𝗡 :\r\n- Unit original\r\n- Box original\r\n- USB Adapter\r\n- Cable C to C\r\n- Manual book	{"ram": "8 GB", "chip": "Apple M1", "color": "Starlight", "camera": "12 MP", "internal": "256 GB"}	3	8000000.00	8500000.00	t	/uploads/products/1781181931243--TEAMAPPLEREADY--TAIPE166-iPad-Air-5-256.jpg	2026-06-11 12:45:31.259278	2026-06-11 13:01:39.884384	IPA5CPO	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "https://wa.me/6289669617515?text=hai kak saya mau beli Ipad Air2 5 CPO ", "instagram": "https://www.instagram.com/p/DZcDh8hkcNl/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "tokopedia": ""}
24	iprom4i	Ipad Pro M4	1	𝗞𝗘𝗟𝗘𝗡𝗚𝗞𝗔𝗣𝗔𝗡 :\r\n- Unit original\r\n- USB Adapter\r\n- Cable C to C\r\n- Box original\r\n- Manual Book	{"ram": "8 GB", "chip": "Apple M4", "color": "Spaceblack", "camera": "12 MP", "internal": "256 GB"}	7	15000000.00	15500000.00	t	/uploads/products/1781183164466--TEAMAPPLEREADY--TAIPN73iPad-Pro-M4-256G.jpg	2026-06-11 13:06:04.483016	2026-06-11 13:09:01.467328	iprom4i	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "https://wa.me/6289669617515?text=hai kak saya mau beli ipad Pro M4 BNOB", "instagram": "https://www.instagram.com/p/DZb0jmyxYhS/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "tokopedia": ""}
22	iprom4w	Ipad Pro M4 256 GB WiFi Only	1	𝗞𝗘𝗟𝗘𝗡𝗚𝗞𝗔𝗣𝗔𝗡 :\r\n- Unit original\r\n- USB Adapter\r\n- Cable C to C\r\n- Box original\r\n- Manual Book	{"ram": "8 GB", "chip": "Apple M4", "color": "Spaceblack", "camera": "12 MP", "internal": "256 GB"}	2	13000000.00	14500000.00	t	/uploads/products/1781180636626--TEAMAPPLEREADY--TAIPN74iPad-Pro-M4-256G.jpg	2026-06-11 12:23:56.651373	2026-06-11 13:14:16.157332	iprom4w	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "https://wa.me/6289669617515?text=hai kak saya mau Ipad Pro M4 256 Gb WiFi Only ", "instagram": "https://www.instagram.com/p/DZcdeIFAVA2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "tokopedia": ""}
25	ipmi7ibx	Ipad Mini 7 iBox	1	𝗞𝗘𝗟𝗘𝗡𝗚𝗞𝗔𝗣𝗔𝗡 :\r\n- Unit original\r\n- USB Adapter\r\n- Cable C to C\r\n- Box original\r\n- Manual Book	{"ram": "8 GB", "chip": "Apple A17 Pro", "color": "Blue", "camera": "12 MP", "internal": "128 GB"}	2	8000000.00	8500000.00	t	/uploads/products/1781184191094--TEAMAPPLEREADY--TAIPH96iPad-mini-7-128G.jpg	2026-06-11 13:23:11.105437	2026-06-11 13:23:59.66595	ipmi7ibx	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "https://wa.me/6289669617515?text=hai kak saya mau beli ipad mini 7 ibox garansi", "instagram": "https://www.instagram.com/p/DZaDo1zgcO1/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "tokopedia": ""}
26	APG1	Apple Pencil Gen 1	4	- Support iPad Pro 2018, 2020 dan Ml - Support iPad Mini 6	{"color": "White"}	2	1200000.00	1404000.00	t	/uploads/products/1781187404690-WhatsApp-Image-2026-06-11-at-21-16-13.jpeg	2026-06-11 14:16:44.702844	2026-06-11 14:16:44.702844	APG1	{}
27	APG2	Apple Pencil Gen 2	4	- Support iPad Pro 2018, 2020 dan Ml - Support iPad Mini 6	{"color": "White"}	2	1500000.00	1836000.00	t	/uploads/products/1781187523343-WhatsApp-Image-2026-06-11-at-21-16-13.jpeg	2026-06-11 14:18:43.351969	2026-06-11 14:18:43.351969	APG2	{}
28	IP13	Iphone 13 Mini	3	Cek	{"ram": "4 GB", "chip": "Apple A13 Bionic", "color": "Pink", "camera": "12 MP", "internal": "128 GB"}	2	7500000.00	8000000.00	t	/uploads/products/1781209706729--TEAMAPPLEREADY--TAIPE165iPad-Air-5-64GB.jpg	2026-06-11 20:28:26.766191	2026-06-11 20:28:26.766191	0194252690147	{}
29	ip17ari	Ipad Mini 7 iBox	1	bksadksadjsad	{"ram": "8 GB", "chip": "Apple A17 Pro", "color": "Purple", "camera": "12 MP", "internal": "256 GB"}	6	8000000.00	8500000.00	t	\N	2026-06-11 22:12:25.438337	2026-06-12 08:12:27.956644	ipmi7ibx	{"lazada": "", "shopee": "", "tiktok": "", "facebook": "", "whatsapp": "", "instagram": "", "tokopedia": ""}
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, name, description, discount_type, discount_value, applicable_products, start_date, end_date, is_active, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_price, quantity_received, created_at, updated_at) FROM stdin;
2	2	4	10	500000.00	0	2026-03-12 13:04:46.066524	2026-03-12 13:04:46.066524
3	3	14	10	8000000.00	10	2026-05-20 13:09:21.896703	2026-05-20 13:09:21.896703
1	1	1	10	500000.00	10	2026-03-12 13:03:03.032713	2026-03-12 13:03:03.032713
4	4	18	10	9000000.00	10	2026-05-27 14:31:06.225418	2026-05-27 14:31:06.225418
5	5	19	7	7500000.00	0	2026-06-07 15:18:06.173872	2026-06-07 15:18:06.173872
6	6	28	2	1000000.00	2	2026-06-11 21:29:35.206948	2026-06-11 21:29:35.206948
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, supplier_name, supplier_email, supplier_phone, total_amount, status, expected_delivery_date, notes, created_by, created_at, updated_at) FROM stdin;
3	Doni mart	dawniejulian@gmail.cm	\N	80000000.00	RECEIVED	\N	\N	1	2026-05-20 13:09:21.881214	2026-05-20 14:09:31.749269
2	Dawniejulian	dawniejulian@gmail.com	\N	5000000.00	CANCELLED	\N	\N	1	2026-03-12 13:04:46.061503	2026-05-20 14:10:45.332594
4	Indomaret	indomaret@gmail.com	\N	90000000.00	RECEIVED	\N	\N	1	2026-05-27 14:31:06.219484	2026-05-27 14:32:04.444314
5	PT asu kawin	asukawin@gmail.com	\N	52500000.00	DRAFT	\N	\N	1	2026-06-07 15:18:06.15029	2026-06-07 15:18:06.15029
6	anjay mabar	083163007345	\N	2000000.00	APPROVED	\N	\N	1	2026-06-11 21:29:35.194945	2026-06-11 21:35:38.36349
1	PT Supplier ABC	supplier@example.com	\N	5000000.00	DRAFT	\N	\N	1	2026-03-12 13:03:03.023291	2026-06-11 21:35:43.288989
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, created_at) FROM stdin;
1	ADMIN	Administrator - Full Access	2026-03-10 03:26:34.202782
2	MANAGER	Manager - Can manage inventory and sales	2026-03-10 03:26:34.202782
3	STAFF	Sales Staff - Can process sales	2026-03-10 03:26:34.202782
4	VIEWER	Viewer - Read only access	2026-03-10 03:26:34.202782
6	CUSTOMER	Pelanggan website TeamApple	2026-04-16 23:44:34.137426
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, product_id, quantity, unit_price, discount_percent, subtotal, created_at) FROM stdin;
1	1	3	1	10000000.00	0.00	10000000.00	2026-03-10 03:32:10.079399
2	2	3	2	10000000.00	0.00	20000000.00	2026-03-12 12:53:08.789459
3	3	2	10	14500000.00	0.00	145000000.00	2026-03-12 14:40:38.673178
4	4	1	2	5500000.00	0.00	11000000.00	2026-03-24 08:56:54.478675
5	5	3	2	10000000.00	0.00	20000000.00	2026-04-07 09:05:30.484768
6	6	6	1	20000000.00	0.00	20000000.00	2026-04-07 09:53:53.731287
7	7	4	1	450000.00	0.00	450000.00	2026-04-08 06:24:11.182667
8	8	14	1	8000000.00	0.00	8000000.00	2026-05-20 12:07:11.873977
9	9	13	1	18000.00	0.00	18000.00	2026-05-20 13:22:17.755263
10	10	18	20	6750000.00	0.00	135000000.00	2026-05-27 13:54:47.719263
11	11	17	1	10500000.00	0.00	10500000.00	2026-05-27 14:00:56.60952
12	12	16	1	10500000.00	0.00	10500000.00	2026-05-27 14:01:27.15267
13	13	18	10	6750000.00	0.00	67500000.00	2026-05-27 14:06:01.620005
14	14	18	2	6750000.00	0.00	13500000.00	2026-05-27 14:09:17.783042
24	24	18	1	6750000.00	10.00	6075000.00	2026-05-27 15:45:03.120683
25	25	18	1	6750000.00	0.00	6750000.00	2026-05-29 09:47:09.990951
26	26	18	5	6750000.00	0.00	33750000.00	2026-05-29 10:10:36.014315
27	27	18	1	6750000.00	20.00	5400000.00	2026-05-29 10:13:08.833399
28	28	18	1	6750000.00	0.00	6750000.00	2026-05-29 10:14:40.511902
29	29	18	1	6750000.00	0.00	6750000.00	2026-06-11 05:56:25.820461
30	30	27	1	1836000.00	0.00	1836000.00	2026-06-11 21:08:43.06663
31	30	26	1	1404000.00	0.00	1404000.00	2026-06-11 21:08:43.06663
32	31	27	1	1836000.00	0.00	1836000.00	2026-06-11 21:13:18.981373
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, invoice_number, sales_channel_id, customer_name, customer_phone, customer_email, subtotal, discount_amount, tax_amount, total_amount, payment_method, payment_status, transaction_status, sales_staff_id, notes, created_at, updated_at, cashier_shift_id) FROM stdin;
1	INV-2026-03-10-0001	1	Walk-in Customer	\N	\N	10000000.00	0.00	0.00	10000000.00	CASH	PENDING	COMPLETED	1	\N	2026-03-10 03:32:10.079399	2026-03-10 03:32:10.079399	\N
2	INV-2026-03-12-0001	1	Walk-in Customer	\N	\N	20000000.00	0.00	0.00	20000000.00	CASH	PENDING	COMPLETED	1	\N	2026-03-12 12:53:08.789459	2026-03-12 12:53:08.789459	\N
3	INV-2026-03-12-0011	1	Walk-in Customer	\N	\N	145000000.00	0.00	0.00	145000000.00	CASH	PENDING	COMPLETED	1	\N	2026-03-12 14:40:38.673178	2026-03-12 14:40:38.673178	\N
4	INV-2026-03-24-0001	1	Walk-in Customer	\N	\N	11000000.00	0.00	0.00	11000000.00	CASH	PENDING	COMPLETED	1	\N	2026-03-24 08:56:54.478675	2026-03-24 08:56:54.478675	\N
5	INV-2026-04-07-0001	1	Walk-in Customer	\N	\N	20000000.00	0.00	0.00	20000000.00	CASH	PENDING	COMPLETED	1	\N	2026-04-07 09:05:30.484768	2026-04-07 09:05:30.484768	\N
6	INV-2026-04-07-0011	1	Tes Otomatis	\N	\N	20000000.00	0.00	0.00	20000000.00	CASH	PENDING	COMPLETED	1	\N	2026-04-07 09:53:53.731287	2026-04-07 09:53:53.731287	\N
7	INV-2026-04-08-0001	1	Walk-in Customer	\N	\N	450000.00	0.00	0.00	450000.00	CASH	PENDING	COMPLETED	1	\N	2026-04-08 06:24:11.182667	2026-04-08 06:24:11.182667	\N
8	INV-2026-05-20-0001	1	Walk-in Customer	\N	\N	8000000.00	0.00	0.00	8000000.00	CASH	PENDING	COMPLETED	1	\N	2026-05-20 12:07:11.873977	2026-05-20 12:07:11.873977	\N
9	INV-2026-05-20-0011	1	Walk-in Customer	\N	\N	18000.00	0.00	0.00	18000.00	CASH	PENDING	COMPLETED	1	\N	2026-05-20 13:22:17.755263	2026-05-20 13:22:17.755263	\N
10	INV-2026-05-27-0001	1	Walk-in Customer	\N	\N	135000000.00	0.00	0.00	135000000.00	TRANSFER	PENDING	COMPLETED	3	boss kita	2026-05-27 13:54:47.719263	2026-05-27 13:54:47.719263	\N
11	INV-2026-05-27-0011	1	Walk-in Customer	\N	\N	10500000.00	0.00	0.00	10500000.00	CASH	PENDING	COMPLETED	3	anjay mabar	2026-05-27 14:00:56.60952	2026-05-27 14:00:56.60952	\N
12	INV-2026-05-27-0021	1	Walk-in Customer	\N	\N	10500000.00	0.00	0.00	10500000.00	TRANSFER	PENDING	COMPLETED	3	anjay mabur	2026-05-27 14:01:27.15267	2026-05-27 14:01:27.15267	\N
13	INV-2026-05-27-0031	1	Walk-in Customer	\N	\N	67500000.00	0.00	0.00	67500000.00	TRANSFER	PENDING	COMPLETED	3	\N	2026-05-27 14:06:01.620005	2026-05-27 14:06:01.620005	\N
14	INV-2026-05-27-0041	1	Walk-in Customer	\N	\N	13500000.00	0.00	0.00	13500000.00	CASH	PENDING	COMPLETED	1	basjkdbasjdb	2026-05-27 14:09:17.783042	2026-05-27 14:09:17.783042	\N
24	INV-2026-05-27-0051	1	Walk-in Customer	\N	\N	6750000.00	675000.00	0.00	6075000.00	CASH	PENDING	COMPLETED	1	\N	2026-05-27 15:45:03.120683	2026-05-27 15:45:03.120683	\N
25	INV-2026-05-29-0001	1	Walk-in Customer	\N	\N	6750000.00	0.00	0.00	6750000.00	CASH	PENDING	COMPLETED	1	\N	2026-05-29 09:47:09.990951	2026-05-29 09:47:09.990951	10
26	INV-2026-05-29-0011	1	Walk-in Customer	\N	\N	33750000.00	0.00	0.00	33750000.00	CASH	PENDING	COMPLETED	1	\N	2026-05-29 10:10:36.014315	2026-05-29 10:10:36.014315	11
27	INV-2026-05-29-0021	1	Walk-in Customer	\N	\N	6750000.00	1350000.00	0.00	5400000.00	CASH	PENDING	COMPLETED	3	\N	2026-05-29 10:13:08.833399	2026-05-29 10:13:08.833399	12
28	INV-2026-05-29-0031	1	Walk-in Customer	\N	\N	6750000.00	0.00	0.00	6750000.00	CASH	PENDING	COMPLETED	3	\N	2026-05-29 10:14:40.511902	2026-05-29 10:14:40.511902	13
29	INV-2026-06-11-0001	1	Walk-in Customer	\N	\N	6750000.00	0.00	0.00	6750000.00	CASH	PENDING	COMPLETED	1	mas julian	2026-06-11 05:56:25.820461	2026-06-11 05:56:25.820461	16
30	INV-2026-06-11-0011	1	Walk-in Customer	\N	\N	3240000.00	0.00	0.00	3240000.00	CASH	PENDING	COMPLETED	1	\N	2026-06-11 21:08:43.06663	2026-06-11 21:08:43.06663	16
31	INV-2026-06-11-0021	1	Walk-in Customer	\N	\N	1836000.00	0.00	0.00	1836000.00	CASH	PENDING	COMPLETED	1	\N	2026-06-11 21:13:18.981373	2026-06-11 21:13:18.981373	16
\.


--
-- Data for Name: sales_channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_channels (id, name, description, is_active, created_at) FROM stdin;
1	Toko Fisik	Penjualan langsung di toko	t	2026-03-10 03:26:34.204053
2	WhatsApp	Penjualan melalui WhatsApp	t	2026-03-10 03:26:34.204053
3	Instagram	Penjualan melalui Instagram Direct Message	t	2026-03-10 03:26:34.204053
4	Marketplace	Penjualan melalui Tokopedia, Shopee, atau marketplace lainnya	t	2026-03-10 03:26:34.204053
5	Facebook	Penjualan melalui Facebook Marketplace	t	2026-03-10 03:26:34.204053
\.


--
-- Data for Name: stock_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_alerts (id, product_id, min_quantity, is_active, last_alert_sent, created_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, product_id, warehouse_location_id, movement_type, quantity, reference_id, reference_type, notes, created_by, created_at) FROM stdin;
1	3	1	STOCK_OUT	1	1	SALE	\N	1	2026-03-10 03:32:10.079399
2	3	1	STOCK_OUT	2	2	SALE	\N	1	2026-03-12 12:53:08.789459
3	7	5	STOCK_IN	7	\N	INITIAL	Stok awal saat buat produk	1	2026-03-12 14:36:11.197204
4	2	5	STOCK_IN	5	\N	PURCHASE	test	1	2026-03-12 14:37:24.615392
5	3	5	STOCK_IN	2	\N	PURCHASE	Tambah stok dari halaman stok	1	2026-03-12 14:39:21.844717
6	2	5	STOCK_IN	10	\N	PURCHASE	anjay	1	2026-03-12 14:39:33.55091
7	2	1	STOCK_OUT	10	3	SALE	\N	1	2026-03-12 14:40:38.673178
8	1	1	STOCK_OUT	2	4	SALE	tes	1	2026-03-24 08:56:54.478675
9	3	1	STOCK_OUT	2	5	SALE	dkasmd	1	2026-04-07 09:05:30.484768
10	6	1	STOCK_OUT	1	6	SALE	uji flow otomatis	1	2026-04-07 09:53:53.731287
11	4	1	STOCK_OUT	1	7	SALE	tftfhg	1	2026-04-08 06:24:11.182667
12	8	5	STOCK_IN	5	\N	INITIAL	Stok awal saat buat produk	1	2026-05-11 18:01:55.290328
13	9	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-11 18:02:42.026234
14	10	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-11 18:04:32.449486
15	11	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-14 04:47:07.451681
16	12	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-20 10:15:39.032121
17	13	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-20 11:17:24.217373
18	14	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-20 11:38:26.113807
19	14	1	STOCK_OUT	1	8	SALE	sold dengan mr dawnie	1	2026-05-20 12:07:11.873977
20	14	5	STOCK_IN	2	\N	PURCHASE	dari hartono	1	2026-05-20 12:43:53.333662
21	1	5	STOCK_IN	10	\N	PURCHASE	dari budi	1	2026-05-20 12:45:12.356273
22	10	5	STOCK_IN	3	\N	PURCHASE	dari madura	1	2026-05-20 12:46:05.104343
23	3	5	STOCK_IN	20	\N	PURCHASE	dari siapa aja	1	2026-05-20 12:46:37.177723
24	13	5	STOCK_IN	2	\N	PURCHASE	Dipesan	1	2026-05-20 12:48:22.614805
25	13	5	STOCK_DAMAGE	1	\N	MANUAL	kena air	1	2026-05-20 13:20:25.368091
26	13	5	STOCK_RESERVE	1	\N	MANUAL	dipesan doni	1	2026-05-20 13:21:32.203797
27	13	1	STOCK_OUT	1	9	SALE	\N	1	2026-05-20 13:22:17.755263
28	14	5	STOCK_IN	10	3	PURCHASE	Diterima dari Purchase Order	1	2026-05-20 14:09:31.749269
29	1	5	STOCK_IN	10	1	PURCHASE	Diterima dari Purchase Order	1	2026-05-20 14:11:21.03238
30	1	5	STOCK_RESERVE	5	\N	MANUAL	Update status stok: reserve	1	2026-05-20 14:12:05.741931
31	1	5	STOCK_DAMAGE	5	\N	MANUAL	Update status stok: damage	1	2026-05-20 14:12:30.944821
32	15	5	STOCK_IN	1	\N	PURCHASE	Tambah stok dari halaman stok	1	2026-05-20 15:49:58.936471
33	16	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-20 17:00:03.380051
34	17	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-20 17:06:18.71001
35	18	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-20 17:10:34.214603
36	18	1	STOCK_OUT	20	10	SALE	boss kita	3	2026-05-27 13:54:47.719263
37	17	1	STOCK_OUT	1	11	SALE	anjay mabar	3	2026-05-27 14:00:56.60952
38	16	1	STOCK_OUT	1	12	SALE	anjay mabur	3	2026-05-27 14:01:27.15267
39	18	5	STOCK_IN	50	\N	PURCHASE	Tambah stok dari halaman stok	3	2026-05-27 14:05:28.360541
40	18	1	STOCK_OUT	10	13	SALE	\N	3	2026-05-27 14:06:01.620005
41	18	1	STOCK_OUT	2	14	SALE	basjkdbasjdb	1	2026-05-27 14:09:17.783042
42	18	5	STOCK_IN	10	4	PURCHASE	Diterima dari Purchase Order	1	2026-05-27 14:32:04.444314
52	18	5	STOCK_IN	5	\N	PURCHASE	nemu	1	2026-05-27 15:41:44.239483
53	18	1	STOCK_OUT	1	24	SALE	\N	1	2026-05-27 15:45:03.120683
54	18	1	STOCK_OUT	1	25	SALE	\N	1	2026-05-29 09:47:09.990951
55	18	5	STOCK_DAMAGE	20	\N	MANUAL	anjay	1	2026-05-29 09:54:24.461258
56	18	1	STOCK_OUT	5	26	SALE	\N	1	2026-05-29 10:10:36.014315
57	18	1	STOCK_OUT	1	27	SALE	\N	3	2026-05-29 10:13:08.833399
58	18	1	STOCK_OUT	1	28	SALE	\N	3	2026-05-29 10:14:40.511902
59	19	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-05-31 12:05:57.101938
60	20	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-07 10:54:06.018766
61	18	5	STOCK_IN	5	\N	PURCHASE	Tambah stok dari halaman stok	1	2026-06-09 14:56:17.398286
62	18	1	STOCK_OUT	1	29	SALE	\N	1	2026-06-11 05:56:25.820461
63	21	5	STOCK_IN	2	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 06:30:44.24788
64	22	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 12:23:56.651373
65	16	5	STOCK_IN	1	\N	PURCHASE	Tambah stok dari halaman stok	1	2026-06-11 12:27:39.310579
66	23	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 12:45:31.259278
67	24	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 13:06:04.483016
68	25	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 13:23:11.105437
69	26	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 14:16:44.702844
70	27	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 14:18:43.351969
71	28	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 20:28:26.766191
72	27	1	STOCK_OUT	1	30	SALE	\N	1	2026-06-11 21:08:43.06663
73	26	1	STOCK_OUT	1	30	SALE	\N	1	2026-06-11 21:08:43.06663
74	27	1	STOCK_OUT	1	31	SALE	\N	1	2026-06-11 21:13:18.981373
75	28	5	STOCK_IN	2	6	PURCHASE	Diterima dari Purchase Order	1	2026-06-11 21:34:37.121095
76	29	5	STOCK_IN	1	\N	INITIAL	Stok awal saat buat produk	1	2026-06-11 22:12:25.438337
\.


--
-- Data for Name: store_devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_devices (id, device_id, device_name, ip_address, registered_by, is_active, created_at, updated_at) FROM stdin;
1	dev-576083df-mpo2m6wm	dev-576083df-mpo2m6wm	::ffff:192.168.65.1	1	f	2026-05-27 13:20:17.457434	2026-06-09 17:20:49.474083
3	dev-6200b796-mq3m4o0r	dev-626fc7ed-mq9k9r5x	192.168.65.1	1	t	2026-06-07 10:59:57.845486	2026-06-11 14:01:53.353634
7	dev-626fc7ed-mq9k9r5x	HP Staff HTTPS	192.168.18.179	1	t	2026-06-11 14:04:39.349685	2026-06-11 14:04:39.349685
\.


--
-- Data for Name: trade_ins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trade_ins (id, old_product_id, new_product_id, customer_name, customer_phone, trade_in_value, discount_applied, final_price_for_new, status, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, first_name, last_name, role_id, phone, is_active, last_login, created_at, updated_at, email_verified) FROM stdin;
5	customer1776383073	customer1776383073@gmail.com	$2a$10$sps6PEr3.XWANAc7uBB3NePvl5kv6RgzzRHcCArvuVh8DcLMDikki	Customer Test	\N	6	\N	t	\N	2026-04-16 23:44:34.237531	2026-04-16 23:44:34.237531	f
1	admin	admin@kasirin.local	$2a$10$qsSyWBrG2/dp/GHhrpP33eM6vKUUfClC58EgxfThigTQcZiwwklAm	Admin		1	081234567890	t	2026-06-12 08:03:42.859021	2026-03-10 03:26:34.205778	2026-06-12 15:47:22.524435	t
2	manager	manager@kasirin.local	$2a$10$iKWXkH2WyNHQdsUwcBoZCu.5Q8W90rFLvuKLddFVHTP3XMgD73r7W	Manajer	Toko	2	081234567891	t	2026-04-16 23:09:12.867291	2026-03-10 03:26:34.205778	2026-06-12 15:47:22.674736	t
3	staff1	staff1@kasirin.local	$2a$10$kd8sHeHw9k9KxDC5wykKK.OJKnesj5yYfW1nKkM4STsdJwxDmiJ1K	Staf	Penjualan	3	081234567892	t	2026-06-11 21:40:16.35235	2026-03-10 03:26:34.205778	2026-06-12 15:47:22.752918	t
6	customer1776383122	customer1776383122@gmail.com	$2a$10$nrbiHwxOdHBLYQpypfm05.24HdWFzKzbb92TznQW84ja5s2PUIxCG	Customer Test	\N	6	\N	t	2026-04-16 23:45:23.125552	2026-04-16 23:45:22.925834	2026-04-16 23:45:23.037809	t
\.


--
-- Data for Name: warehouse_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_locations (id, name, description, is_active, created_at) FROM stdin;
1	Toko Depan	Area display produk di toko	t	2026-03-10 03:26:34.204484
2	Gudang Belakang	Ruang penyimpanan utama	t	2026-03-10 03:26:34.204484
3	Etalase Premium	Etalase khusus produk premium	t	2026-03-10 03:26:34.204484
5	Gudang Utama	Lokasi default sistem	t	2026-03-12 14:21:28.28022
\.


--
-- Data for Name: whatsapp_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_messages (id, sale_id, customer_phone, message_type, message_content, status, sent_at, created_at) FROM stdin;
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 22, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: buyback_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.buyback_requests_id_seq', 1, false);


--
-- Name: cashier_shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cashier_shifts_id_seq', 24, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Name: customer_email_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_email_verifications_id_seq', 2, true);


--
-- Name: daily_sales_summary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_sales_summary_id_seq', 8, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_id_seq', 48, true);


--
-- Name: price_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.price_list_id_seq', 1, false);


--
-- Name: product_conditions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_conditions_id_seq', 7, true);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 79, true);


--
-- Name: product_sales_performance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_sales_performance_id_seq', 1, false);


--
-- Name: product_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_variants_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 29, true);


--
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotions_id_seq', 1, false);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 6, true);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 6, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 43, true);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 32, true);


--
-- Name: sales_channels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_channels_id_seq', 6, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 31, true);


--
-- Name: stock_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_alerts_id_seq', 1, false);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 76, true);


--
-- Name: store_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_devices_id_seq', 7, true);


--
-- Name: trade_ins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trade_ins_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: warehouse_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouse_locations_id_seq', 60, true);


--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.whatsapp_messages_id_seq', 1, false);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: buyback_requests buyback_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyback_requests
    ADD CONSTRAINT buyback_requests_pkey PRIMARY KEY (id);


--
-- Name: cashier_shifts cashier_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashier_shifts
    ADD CONSTRAINT cashier_shifts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customer_email_verifications customer_email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_email_verifications
    ADD CONSTRAINT customer_email_verifications_pkey PRIMARY KEY (id);


--
-- Name: customer_email_verifications customer_email_verifications_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_email_verifications
    ADD CONSTRAINT customer_email_verifications_token_key UNIQUE (token);


--
-- Name: daily_sales_summary daily_sales_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_pkey PRIMARY KEY (id);


--
-- Name: daily_sales_summary daily_sales_summary_sale_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_sale_date_key UNIQUE (sale_date);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_product_id_warehouse_location_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_warehouse_location_id_key UNIQUE (product_id, warehouse_location_id);


--
-- Name: price_list price_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list
    ADD CONSTRAINT price_list_pkey PRIMARY KEY (id);


--
-- Name: product_conditions product_conditions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_conditions
    ADD CONSTRAINT product_conditions_name_key UNIQUE (name);


--
-- Name: product_conditions product_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_conditions
    ADD CONSTRAINT product_conditions_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_sales_performance product_sales_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sales_performance
    ADD CONSTRAINT product_sales_performance_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales_channels sales_channels_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_channels
    ADD CONSTRAINT sales_channels_name_key UNIQUE (name);


--
-- Name: sales_channels sales_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_channels
    ADD CONSTRAINT sales_channels_pkey PRIMARY KEY (id);


--
-- Name: sales sales_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_invoice_number_key UNIQUE (invoice_number);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: stock_alerts stock_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_alerts
    ADD CONSTRAINT stock_alerts_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: store_devices store_devices_device_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_devices
    ADD CONSTRAINT store_devices_device_id_key UNIQUE (device_id);


--
-- Name: store_devices store_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_devices
    ADD CONSTRAINT store_devices_pkey PRIMARY KEY (id);


--
-- Name: trade_ins trade_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_ins
    ADD CONSTRAINT trade_ins_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: warehouse_locations warehouse_locations_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_locations
    ADD CONSTRAINT warehouse_locations_name_key UNIQUE (name);


--
-- Name: warehouse_locations warehouse_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_locations
    ADD CONSTRAINT warehouse_locations_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_messages whatsapp_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at);


--
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_audit_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_created ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_buyback_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_buyback_status ON public.buyback_requests USING btree (status);


--
-- Name: idx_cashier_shifts_opened; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cashier_shifts_opened ON public.cashier_shifts USING btree (opened_at);


--
-- Name: idx_cashier_shifts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cashier_shifts_status ON public.cashier_shifts USING btree (status);


--
-- Name: idx_cashier_shifts_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cashier_shifts_user ON public.cashier_shifts USING btree (user_id);


--
-- Name: idx_daily_sales_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_daily_sales_date ON public.daily_sales_summary USING btree (sale_date);


--
-- Name: idx_inventory_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_product ON public.inventory USING btree (product_id);


--
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- Name: idx_products_barcode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_barcode ON public.products USING btree (barcode);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- Name: idx_purchase_order_items_po; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_order_items_po ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: idx_purchase_order_items_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_order_items_product ON public.purchase_order_items USING btree (product_id);


--
-- Name: idx_purchase_orders_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_orders_created ON public.purchase_orders USING btree (created_at);


--
-- Name: idx_purchase_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_orders_status ON public.purchase_orders USING btree (status);


--
-- Name: idx_purchase_orders_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders USING btree (supplier_name);


--
-- Name: idx_sale_items_sale; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_items_sale ON public.sale_items USING btree (sale_id);


--
-- Name: idx_sales_channel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_channel ON public.sales USING btree (sales_channel_id);


--
-- Name: idx_sales_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_date ON public.sales USING btree (created_at);


--
-- Name: idx_sales_invoice; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_invoice ON public.sales USING btree (invoice_number);


--
-- Name: idx_stock_movements_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_movements_created ON public.stock_movements USING btree (created_at);


--
-- Name: idx_stock_movements_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_movements_product ON public.stock_movements USING btree (product_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: buyback_requests buyback_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyback_requests
    ADD CONSTRAINT buyback_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: buyback_requests buyback_requests_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyback_requests
    ADD CONSTRAINT buyback_requests_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: cashier_shifts cashier_shifts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashier_shifts
    ADD CONSTRAINT cashier_shifts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: customer_email_verifications customer_email_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_email_verifications
    ADD CONSTRAINT customer_email_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: inventory inventory_warehouse_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_warehouse_location_id_fkey FOREIGN KEY (warehouse_location_id) REFERENCES public.warehouse_locations(id);


--
-- Name: price_list price_list_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list
    ADD CONSTRAINT price_list_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.sales_channels(id);


--
-- Name: price_list price_list_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list
    ADD CONSTRAINT price_list_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_sales_performance product_sales_performance_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sales_performance
    ADD CONSTRAINT product_sales_performance_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_condition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_condition_id_fkey FOREIGN KEY (condition_id) REFERENCES public.product_conditions(id);


--
-- Name: promotions promotions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sale_items sale_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sales sales_cashier_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_cashier_shift_id_fkey FOREIGN KEY (cashier_shift_id) REFERENCES public.cashier_shifts(id);


--
-- Name: sales sales_sales_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_sales_channel_id_fkey FOREIGN KEY (sales_channel_id) REFERENCES public.sales_channels(id);


--
-- Name: sales sales_sales_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_sales_staff_id_fkey FOREIGN KEY (sales_staff_id) REFERENCES public.users(id);


--
-- Name: stock_alerts stock_alerts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_alerts
    ADD CONSTRAINT stock_alerts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_movements stock_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_movements stock_movements_warehouse_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_warehouse_location_id_fkey FOREIGN KEY (warehouse_location_id) REFERENCES public.warehouse_locations(id);


--
-- Name: store_devices store_devices_registered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_devices
    ADD CONSTRAINT store_devices_registered_by_fkey FOREIGN KEY (registered_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: trade_ins trade_ins_new_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_ins
    ADD CONSTRAINT trade_ins_new_product_id_fkey FOREIGN KEY (new_product_id) REFERENCES public.products(id);


--
-- Name: trade_ins trade_ins_old_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_ins
    ADD CONSTRAINT trade_ins_old_product_id_fkey FOREIGN KEY (old_product_id) REFERENCES public.products(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: whatsapp_messages whatsapp_messages_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- PostgreSQL database dump complete
--

\unrestrict mg18fdY1dFN9odsxVdm85CBtqjMI5ay5dFM87BrlqR1JKfXPZgfuhjo9sqfgG7w

