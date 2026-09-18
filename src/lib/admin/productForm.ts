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

/** How the customer buys this product on the shop. */
export type ProductSellKind = "ready" | "customise" | "quote";

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

export function sellKindFromForm(input: ProductFormInput): ProductSellKind {
  if (input.requires_approval) return "quote";
  if (input.is_customisable) return "customise";
  return "ready";
}

export function applySellKind(
  input: ProductFormInput,
  kind: ProductSellKind
): ProductFormInput {
  switch (kind) {
    case "ready":
      return {
        ...input,
        is_customisable: false,
        requires_approval: false,
        custom_fields: [],
      };
    case "customise":
      return {
        ...input,
        is_customisable: true,
        requires_approval: false,
      };
    case "quote":
      return {
        ...input,
        is_customisable: true,
        requires_approval: true,
        track_stock: false,
        stock_quantity: null,
        offers_installation: false,
        installation_service_key: "",
        installation_price_gbp: null,
      };
  }
}

export const SELL_KIND_OPTIONS: {
  id: ProductSellKind;
  title: string;
  hint: string;
}[] = [
  {
    id: "ready",
    title: "Buy now",
    hint: "Ready to ship. Customer pays and checks out.",
  },
  {
    id: "customise",
    title: "Pick options, then buy",
    hint: "Colour, size, message… then add to cart.",
  },
  {
    id: "quote",
    title: "Ask for a quote",
    hint: "Customer sends details. You quote, then they pay.",
  },
];

export function validateProductForm(input: ProductFormInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (!input.slug.trim()) return "Slug is required.";
  if (!input.category_id) return "Category is required.";
  if (input.price_gbp < 0) return "Price cannot be negative.";
  if (input.requires_approval && !input.is_customisable) {
    return "Quote products need questions for the customer.";
  }
  if (input.offers_installation && !input.installation_service_key.trim()) {
    return "Choose an installation type.";
  }
  if (
    input.track_stock &&
    (input.stock_quantity == null || input.stock_quantity < 0)
  ) {
    return "How many in stock?";
  }
  if (
    (input.is_customisable || input.requires_approval) &&
    input.custom_fields.length === 0
  ) {
    return "Add at least one question for the customer.";
  }

  const keys = new Set<string>();
  for (const field of input.custom_fields) {
    if (!field.label.trim()) return "Each question needs a name.";
    const key = field.key.trim() || fieldKeyFromLabel(field.label);
    if (keys.has(key)) return `Duplicate question: ${field.label}`;
    keys.add(key);
    if (
      (field.field_type === "select" || field.field_type === "colour") &&
      field.options.length === 0
    ) {
      return `Add choices for “${field.label}”.`;
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

export function makeQuickField(
  label: string,
  field_type: CustomFieldType,
  required = true,
  options: CustomFieldOption[] = []
): CustomFieldInput {
  return {
    label,
    key: fieldKeyFromLabel(label),
    field_type,
    required,
    options,
    sort_order: 1,
  };
}

export type ProductFieldTemplate = {
  id: string;
  title: string;
  /** Which sell modes this pack is for */
  modes: Array<"customise" | "quote">;
  fields: Omit<CustomFieldInput, "id" | "sort_order">[];
};

/** One-tap question packs for admin. */
export const PRODUCT_FIELD_TEMPLATES: ProductFieldTemplate[] = [
  {
    id: "portrait",
    title: "Portrait / photo gift",
    modes: ["quote", "customise"],
    fields: [
      makeQuickField("Photo", "file", true),
      makeQuickField("Message", "textarea", false),
      makeQuickField("Name on piece", "text", false),
    ],
  },
  {
    id: "engraving",
    title: "Name engraving",
    modes: ["customise", "quote"],
    fields: [
      makeQuickField("Name to engrave", "text", true),
      makeQuickField("Message", "textarea", false),
    ],
  },
  {
    id: "bag",
    title: "Bag options",
    modes: ["customise"],
    fields: [
      makeQuickField("Colour", "colour", true, [
        { label: "Black", value: "black", colour_hex: "#121110" },
        { label: "Brown", value: "brown", colour_hex: "#5c3d2e" },
        { label: "Tan", value: "tan", colour_hex: "#c4a574" },
      ]),
      makeQuickField("Size", "select", true, [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
      ]),
    ],
  },
  {
    id: "memorial",
    title: "Memorial",
    modes: ["quote", "customise"],
    fields: [
      makeQuickField("Photo", "file", false),
      makeQuickField("Dedication", "textarea", true),
      makeQuickField("Dates / names", "text", false),
    ],
  },
  {
    id: "multi_photo",
    title: "Multi-photo set",
    modes: ["quote", "customise"],
    fields: [
      makeQuickField("Front photo", "file", true),
      makeQuickField("Side photo", "file", false),
      makeQuickField("Logo / detail", "file", false),
      makeQuickField("Notes", "textarea", false),
    ],
  },
];

export function fieldsFromTemplate(
  template: ProductFieldTemplate
): CustomFieldInput[] {
  return template.fields.map((f, i) => ({
    ...f,
    key: f.key || fieldKeyFromLabel(f.label),
    sort_order: i + 1,
  }));
}
