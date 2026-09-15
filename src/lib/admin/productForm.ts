import { fieldKeyFromLabel, nameToSlug } from "@/lib/products/slug";
import type {
  CustomFieldOption,
  CustomFieldType,
  ProductStatus,
} from "@/types/database";

export type CustomFieldInput = {
  id?: string;
  label: string;
  key: string;
  field_type: CustomFieldType;
  required: boolean;
  options: CustomFieldOption[];
  sort_order: number;
};

export type ProductFormInput = {
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  description: string;
  price_gbp: number;
  compare_at_gbp: number | null;
  cost_gbp: number | null;
  images: string[];
  status: ProductStatus;
  is_customisable: boolean;
  requires_approval: boolean;
  offers_installation: boolean;
  installation_service_key: string;
  installation_price_gbp: number | null;
  track_stock: boolean;
  stock_quantity: number | null;
  allow_preorder: boolean;
  low_stock_threshold: number;
  meta_title: string;
  meta_description: string;
  custom_fields: CustomFieldInput[];
};

export const emptyProductForm: ProductFormInput = {
  name: "",
  slug: "",
  category_id: "",
  short_description: "",
  description: "",
  price_gbp: 0,
  compare_at_gbp: null,
  cost_gbp: null,
  images: [],
  status: "draft",
  is_customisable: false,
  requires_approval: false,
  offers_installation: false,
  installation_service_key: "",
  installation_price_gbp: null,
  track_stock: true,
  stock_quantity: 0,
  allow_preorder: true,
  low_stock_threshold: 5,
  meta_title: "",
  meta_description: "",
  custom_fields: [],
};

export function validateProductForm(input: ProductFormInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (!input.slug.trim()) return "Slug is required.";
  if (!input.category_id) return "Category is required.";
  if (input.price_gbp < 0) return "Price cannot be negative.";
  if (input.requires_approval && !input.is_customisable) {
    return "Approval-required products must be marked customisable.";
  }
  if (input.offers_installation && !input.installation_service_key.trim()) {
    return "Choose an installation service type.";
  }
  if (input.track_stock && (input.stock_quantity == null || input.stock_quantity < 0)) {
    return "Stock quantity is required when tracking stock.";
  }

  const keys = new Set<string>();
  for (const field of input.custom_fields) {
    if (!field.label.trim()) return "Each custom field needs a label.";
    const key = field.key.trim() || fieldKeyFromLabel(field.label);
    if (keys.has(key)) return `Duplicate custom field key: ${key}`;
    keys.add(key);
    if (
      (field.field_type === "select" || field.field_type === "colour") &&
      field.options.length === 0
    ) {
      return `Add options for “${field.label}”.`;
    }
  }

  return null;
}

export function productFormToRow(input: ProductFormInput) {
  const slug = nameToSlug(input.slug || input.name);
  return {
    name: input.name.trim(),
    slug,
    category_id: input.category_id,
    short_description: input.short_description.trim() || null,
    description: input.description.trim() || null,
    price_gbp: Number(input.price_gbp) || 0,
    compare_at_gbp:
      input.compare_at_gbp == null || input.compare_at_gbp === 0
        ? null
        : Number(input.compare_at_gbp),
    cost_gbp:
      input.cost_gbp == null || input.cost_gbp === 0
        ? null
        : Number(input.cost_gbp),
    images: input.images,
    status: input.status,
    is_customisable: input.is_customisable,
    requires_approval: input.requires_approval,
    offers_installation: input.offers_installation,
    installation_service_key: input.offers_installation
      ? input.installation_service_key.trim() || null
      : null,
    installation_price_gbp: input.offers_installation
      ? input.installation_price_gbp
      : null,
    track_stock: input.track_stock,
    stock_quantity: input.track_stock ? input.stock_quantity : null,
    allow_preorder: input.track_stock ? input.allow_preorder : true,
    low_stock_threshold: input.low_stock_threshold || 5,
    meta_title: input.meta_title.trim() || null,
    meta_description: input.meta_description.trim() || null,
  };
}

export function normalizeCustomFields(fields: CustomFieldInput[]) {
  return fields.map((field, index) => ({
    label: field.label.trim(),
    key: (field.key.trim() || fieldKeyFromLabel(field.label)).slice(0, 40),
    field_type: field.field_type,
    required: field.required,
    options: field.options,
    sort_order: index + 1,
  }));
}
