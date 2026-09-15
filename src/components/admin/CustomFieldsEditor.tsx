"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CustomFieldInput } from "@/lib/admin/productForm";
import { fieldKeyFromLabel } from "@/lib/products/slug";
import type { CustomFieldType } from "@/types/database";

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Select" },
  { value: "colour", label: "Colour" },
  { value: "number", label: "Number" },
  { value: "file", label: "File upload" },
];

const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";
const inputClass =
  "mt-1.5 h-10 w-full border border-vb-line bg-vb-paper px-3 text-sm outline-none ring-vb-accent focus:ring-1";

type Props = {
  fields: CustomFieldInput[];
  onChange: (fields: CustomFieldInput[]) => void;
  disabled?: boolean;
};

export default function CustomFieldsEditor({
  fields,
  onChange,
  disabled,
}: Props) {
  const update = (index: number, patch: Partial<CustomFieldInput>) => {
    onChange(
      fields.map((field, i) => (i === index ? { ...field, ...patch } : field))
    );
  };

  const addField = () => {
    onChange([
      ...fields,
      {
        label: "",
        key: "",
        field_type: "text",
        required: false,
        options: [],
        sort_order: fields.length + 1,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <p className="border border-dashed border-vb-line bg-vb-mist px-4 py-6 text-sm text-vb-muted">
          No custom fields yet. Add options like size, colour, message, or photo
          upload for personalised products.
        </p>
      )}

      {fields.map((field, index) => {
        const needsOptions =
          field.field_type === "select" || field.field_type === "colour";

        return (
          <div
            key={field.id ?? `new-${index}`}
            className="border border-vb-line bg-vb-white p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
                Field {index + 1}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(fields.filter((_, i) => i !== index))}
                className="text-vb-muted hover:text-vb-danger"
                aria-label="Remove field"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Label</label>
                <input
                  className={inputClass}
                  value={field.label}
                  disabled={disabled}
                  onChange={(e) => {
                    const label = e.target.value;
                    update(index, {
                      label,
                      key: field.key || fieldKeyFromLabel(label),
                    });
                  }}
                  placeholder="e.g. Leather colour"
                />
              </div>
              <div>
                <label className={labelClass}>Key</label>
                <input
                  className={inputClass}
                  value={field.key}
                  disabled={disabled}
                  onChange={(e) =>
                    update(index, {
                      key: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, "_"),
                    })
                  }
                  placeholder="colour"
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  className={inputClass}
                  value={field.field_type}
                  disabled={disabled}
                  onChange={(e) =>
                    update(index, {
                      field_type: e.target.value as CustomFieldType,
                      options:
                        e.target.value === "select" || e.target.value === "colour"
                          ? field.options
                          : [],
                    })
                  }
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-vb-ink">
                  <input
                    type="checkbox"
                    checked={field.required}
                    disabled={disabled}
                    onChange={(e) =>
                      update(index, { required: e.target.checked })
                    }
                  />
                  Required
                </label>
              </div>
            </div>

            {needsOptions && (
              <div className="mt-4 space-y-2 border-t border-vb-line pt-4">
                <p className={labelClass}>Options</p>
                {field.options.map((opt, optIndex) => (
                  <div
                    key={optIndex}
                    className="grid grid-cols-[1fr_1fr_6rem_auto] gap-2"
                  >
                    <input
                      className={inputClass}
                      placeholder="Label"
                      value={opt.label}
                      disabled={disabled}
                      onChange={(e) => {
                        const options = [...field.options];
                        options[optIndex] = {
                          ...opt,
                          label: e.target.value,
                          value: opt.value || fieldKeyFromLabel(e.target.value),
                        };
                        update(index, { options });
                      }}
                    />
                    <input
                      className={inputClass}
                      placeholder="Value"
                      value={opt.value}
                      disabled={disabled}
                      onChange={(e) => {
                        const options = [...field.options];
                        options[optIndex] = { ...opt, value: e.target.value };
                        update(index, { options });
                      }}
                    />
                    <input
                      className={inputClass}
                      type="number"
                      step="0.01"
                      placeholder="+£"
                      value={opt.price_delta_gbp ?? ""}
                      disabled={disabled}
                      onChange={(e) => {
                        const options = [...field.options];
                        options[optIndex] = {
                          ...opt,
                          price_delta_gbp: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        };
                        update(index, { options });
                      }}
                    />
                    <button
                      type="button"
                      disabled={disabled}
                      className="text-vb-muted hover:text-vb-danger"
                      onClick={() =>
                        update(index, {
                          options: field.options.filter((_, i) => i !== optIndex),
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    update(index, {
                      options: [
                        ...field.options,
                        { label: "", value: "", price_delta_gbp: 0 },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
                >
                  <Plus size={12} /> Add option
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        disabled={disabled}
        onClick={addField}
        className="inline-flex h-10 items-center gap-2 border border-vb-line bg-vb-white px-4 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-ink hover:border-vb-ink"
      >
        <Plus size={14} /> Add custom field
      </button>
    </div>
  );
}
