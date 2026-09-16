export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = "admin" | "customer";
export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "pre_order"
  | "processing"
  | "personalising"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type CustomRequestStatus =
  | "new"
  | "reviewing"
  | "quoted"
  | "accepted"
  | "declined"
  | "converted_to_order";
export type CustomFieldType =
  | "text"
  | "textarea"
  | "select"
  | "colour"
  | "number"
  | "file";
export type ServiceJobType = "home_repair" | "smart_home_install" | "other";
export type ServiceJobStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ServiceJobSource = "website" | "checkout_addon" | "admin";
export type CourierVertical =
  | "medical"
  | "flowers_events"
  | "legal"
  | "general";
export type CourierUrgency = "standard" | "same_day" | "urgent";
export type CourierJobStatus =
  | "new"
  | "confirmed"
  | "picked_up"
  | "delivered"
  | "failed"
  | "cancelled";

export type CustomFieldOption = {
  label: string;
  value: string;
  price_delta_gbp?: number;
};

type ProfilesTable = {
  Row: {
    id: string;
    email: string | null;
    role: ProfileRole;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    email?: string | null;
    role?: ProfileRole;
    full_name?: string | null;
    phone?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ProfilesTable["Insert"]> & { id?: string };
  Relationships: [];
};

type CategoriesTable = {
  Row: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    image_url: string | null;
    sort_order: number;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    slug: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    sort_order?: number;
    is_visible?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<CategoriesTable["Insert"]> & { id?: string };
  Relationships: [];
};

type SiteSettingsTable = {
  Row: {
    key: string;
    value: Json;
    updated_at: string;
  };
  Insert: {
    key: string;
    value?: Json;
    updated_at?: string;
  };
  Update: Partial<SiteSettingsTable["Insert"]> & { key?: string };
  Relationships: [];
};

type ProductsTable = {
  Row: {
    id: string;
    category_id: string | null;
    name: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    price_gbp: number;
    compare_at_gbp: number | null;
    cost_gbp: number | null;
    images: string[];
    status: ProductStatus;
    is_customisable: boolean;
    requires_approval: boolean;
    offers_installation: boolean;
    installation_service_key: string | null;
    installation_price_gbp: number | null;
    track_stock: boolean;
    stock_quantity: number | null;
    allow_preorder: boolean;
    low_stock_threshold: number;
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    category_id?: string | null;
    name: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    price_gbp?: number;
    compare_at_gbp?: number | null;
    cost_gbp?: number | null;
    images?: string[];
    status?: ProductStatus;
    is_customisable?: boolean;
    requires_approval?: boolean;
    offers_installation?: boolean;
    installation_service_key?: string | null;
    installation_price_gbp?: number | null;
    track_stock?: boolean;
    stock_quantity?: number | null;
    allow_preorder?: boolean;
    low_stock_threshold?: number;
    meta_title?: string | null;
    meta_description?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ProductsTable["Insert"]> & { id?: string };
  Relationships: [
    {
      foreignKeyName: "products_category_id_fkey";
      columns: ["category_id"];
      isOneToOne: false;
      referencedRelation: "categories";
      referencedColumns: ["id"];
    },
  ];
};

type ProductCustomFieldsTable = {
  Row: {
    id: string;
    product_id: string;
    label: string;
    key: string;
    field_type: CustomFieldType;
    required: boolean;
    options: Json;
    sort_order: number;
    created_at: string;
  };
  Insert: {
    id?: string;
    product_id: string;
    label: string;
    key: string;
    field_type: CustomFieldType;
    required?: boolean;
    options?: Json;
    sort_order?: number;
    created_at?: string;
  };
  Update: Partial<ProductCustomFieldsTable["Insert"]> & { id?: string };
  Relationships: [
    {
      foreignKeyName: "product_custom_fields_product_id_fkey";
      columns: ["product_id"];
      isOneToOne: false;
      referencedRelation: "products";
      referencedColumns: ["id"];
    },
  ];
};

type OrdersTable = {
  Row: {
    id: string;
    order_number: string;
    status: OrderStatus;
    email: string;
    phone: string | null;
    full_name: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    postcode: string;
    country: string;
    subtotal_gbp: number;
    shipping_gbp: number;
    total_gbp: number;
    currency: string;
    stripe_checkout_session_id: string | null;
    stripe_payment_intent_id: string | null;
    notes: string | null;
    internal_notes: string | null;
    tracking_number: string | null;
    tracking_carrier: string | null;
    tracking_url: string | null;
    paid_at: string | null;
    shipped_at: string | null;
    inventory_applied: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    order_number: string;
    status?: OrderStatus;
    email: string;
    phone?: string | null;
    full_name: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    postcode: string;
    country?: string;
    subtotal_gbp?: number;
    shipping_gbp?: number;
    total_gbp?: number;
    currency?: string;
    stripe_checkout_session_id?: string | null;
    stripe_payment_intent_id?: string | null;
    notes?: string | null;
    internal_notes?: string | null;
    tracking_number?: string | null;
    tracking_carrier?: string | null;
    tracking_url?: string | null;
    paid_at?: string | null;
    shipped_at?: string | null;
    inventory_applied?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<OrdersTable["Insert"]> & { id?: string };
  Relationships: [];
};

type OrderItemsTable = {
  Row: {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    product_slug: string | null;
    unit_price_gbp: number;
    quantity: number;
    line_total_gbp: number;
    image_url: string | null;
    customisation: Json;
    installation_requested: boolean;
    installation_price_gbp: number | null;
    is_preorder: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    order_id: string;
    product_id?: string | null;
    product_name: string;
    product_slug?: string | null;
    unit_price_gbp: number;
    quantity: number;
    line_total_gbp: number;
    image_url?: string | null;
    customisation?: Json;
    installation_requested?: boolean;
    installation_price_gbp?: number | null;
    is_preorder?: boolean;
    created_at?: string;
  };
  Update: Partial<OrderItemsTable["Insert"]> & { id?: string };
  Relationships: [
    {
      foreignKeyName: "order_items_order_id_fkey";
      columns: ["order_id"];
      isOneToOne: false;
      referencedRelation: "orders";
      referencedColumns: ["id"];
    },
  ];
};

type CustomRequestsTable = {
  Row: {
    id: string;
    status: CustomRequestStatus;
    product_id: string | null;
    product_name: string | null;
    full_name: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
    message: string | null;
    preferred_material: string | null;
    instructions: string | null;
    uploads: string[];
    field_snapshot: Json;
    quote_amount_gbp: number | null;
    quote_message: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    status?: CustomRequestStatus;
    product_id?: string | null;
    product_name?: string | null;
    full_name: string;
    email: string;
    phone?: string | null;
    whatsapp?: string | null;
    message?: string | null;
    preferred_material?: string | null;
    instructions?: string | null;
    uploads?: string[];
    field_snapshot?: Json;
    quote_amount_gbp?: number | null;
    quote_message?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<CustomRequestsTable["Insert"]> & { id?: string };
  Relationships: [];
};

type InventoryMovementsTable = {
  Row: {
    id: string;
    product_id: string;
    delta: number;
    reason: string;
    order_id: string | null;
    note: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    product_id: string;
    delta: number;
    reason: string;
    order_id?: string | null;
    note?: string | null;
    created_at?: string;
  };
  Update: Partial<InventoryMovementsTable["Insert"]> & { id?: string };
  Relationships: [];
};

type ServiceJobsTable = {
  Row: {
    id: string;
    status: ServiceJobStatus;
    job_type: ServiceJobType;
    specific_service: string | null;
    description: string | null;
    photos: string[];
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    postcode: string;
    preferred_window: string | null;
    full_name: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
    source: ServiceJobSource;
    related_order_id: string | null;
    internal_notes: string | null;
    scheduled_at: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    status?: ServiceJobStatus;
    job_type?: ServiceJobType;
    specific_service?: string | null;
    description?: string | null;
    photos?: string[];
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    postcode: string;
    preferred_window?: string | null;
    full_name: string;
    email: string;
    phone?: string | null;
    whatsapp?: string | null;
    source?: ServiceJobSource;
    related_order_id?: string | null;
    internal_notes?: string | null;
    scheduled_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ServiceJobsTable["Insert"]> & { id?: string };
  Relationships: [];
};

type CourierJobsTable = {
  Row: {
    id: string;
    status: CourierJobStatus;
    vertical: CourierVertical;
    urgency: CourierUrgency;
    item_description: string;
    notes: string | null;
    photos: string[];
    pickup_line1: string;
    pickup_line2: string | null;
    pickup_city: string | null;
    pickup_postcode: string;
    dropoff_line1: string;
    dropoff_line2: string | null;
    dropoff_city: string | null;
    dropoff_postcode: string;
    preferred_window: string | null;
    full_name: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    status?: CourierJobStatus;
    vertical?: CourierVertical;
    urgency?: CourierUrgency;
    item_description: string;
    notes?: string | null;
    photos?: string[];
    pickup_line1: string;
    pickup_line2?: string | null;
    pickup_city?: string | null;
    pickup_postcode: string;
    dropoff_line1: string;
    dropoff_line2?: string | null;
    dropoff_city?: string | null;
    dropoff_postcode: string;
    preferred_window?: string | null;
    full_name: string;
    email: string;
    phone?: string | null;
    whatsapp?: string | null;
    internal_notes?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<CourierJobsTable["Insert"]> & { id?: string };
  Relationships: [];
};

type ReviewsTable = {
  Row: {
    id: string;
    author_name: string;
    rating: number;
    body: string;
    email: string | null;
    product_id: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    author_name: string;
    rating: number;
    body: string;
    email?: string | null;
    product_id?: string | null;
    is_published?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ReviewsTable["Insert"]> & { id?: string };
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: ProfilesTable;
      categories: CategoriesTable;
      site_settings: SiteSettingsTable;
      products: ProductsTable;
      product_custom_fields: ProductCustomFieldsTable;
      orders: OrdersTable;
      order_items: OrderItemsTable;
      custom_requests: CustomRequestsTable;
      inventory_movements: InventoryMovementsTable;
      service_jobs: ServiceJobsTable;
      courier_jobs: CourierJobsTable;
      reviews: ReviewsTable;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      profile_role: ProfileRole;
      product_status: ProductStatus;
      order_status: OrderStatus;
      custom_request_status: CustomRequestStatus;
      service_job_type: ServiceJobType;
      service_job_status: ServiceJobStatus;
      service_job_source: ServiceJobSource;
      courier_vertical: CourierVertical;
      courier_urgency: CourierUrgency;
      courier_job_status: CourierJobStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = ProfilesTable["Row"];
export type Category = CategoriesTable["Row"];
export type SiteSetting = SiteSettingsTable["Row"];
export type Product = ProductsTable["Row"];
export type ProductCustomField = ProductCustomFieldsTable["Row"];
export type Order = OrdersTable["Row"];
export type OrderItem = OrderItemsTable["Row"];
export type CustomRequest = CustomRequestsTable["Row"];
export type ServiceJob = ServiceJobsTable["Row"];
export type CourierJob = CourierJobsTable["Row"];
export type Review = ReviewsTable["Row"];
