"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CustomFieldInput } from "@/lib/admin/productForm";
import {
  PRODUCT_FIELD_TEMPLATES,
  fieldsFromTemplate,
  makeQuickField,
} from "@/lib/admin/productForm";
import { fieldKeyFromLabel } from "@/lib/products/slug";
import type { CustomFieldType } from "@/types/database";

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Short answer" },
  { value: "textarea", label: "Long message" },
  { value: "select", label: "Pick one" },
  { value: "colour", label: "Colour" },
  { value: "number", label: "Number" },
  { value: "file", label: "Photo upload" },
];

const labelClass =
  "font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted";
const inputClass =
  "mt-1.5 h-10 w-full border border-vb-line bg-vb-paper px-3 text-sm outline-none ring-vb-accent focus:ring-1";

type Props = {
  fields: CustomFieldInput[];
  onChange: (fields: CustomFieldInput[]) => void;
  disabled?: boolean;
  mode?: "customise" | "quote";
};

export default function CustomFieldsEditor({
  fields,
  onChange,
  disabled,
  mode = "customise",
}: Props) {
  const templates = PRODUCT_FIELD_TEMPLATES.filter((t) =>
    t.modes.includes(mode)
  );

  const update = (index: number, patch: Partial<CustomFieldInput>) => {
    onChange(
      fields.map((field, i) => (i === index ? { ...field, ...patch } : field))
    );
  };

  const addField = (type: CustomFieldType = "text") => {
    const labels: Record<CustomFieldType, string> = {
      text: "Name on item",
      textarea: "Message",
      select: "Size",
      colour: "Colour",
      number: "Quantity note",
      file: "Photo",
    };
    onChange([
      ...fields,
      {
        ...makeQuickField(labels[type], type, true),
        sort_order: fields.length + 1,
      },
    ]);
  };

  const applyTemplate = (id: string) => {
    const template = PRODUCT_FIELD_TEMPLATES.find((t) => t.id === id);
    if (!template) return;
    const next = fieldsFromTemplate(template);
    if (fields.length > 0) {
      const ok = confirm(
        "Replace the questions you already added with this pack?"
      );
      if (!ok) return;
    }
    onChange(next);
  };

  return (
    <div className="space-y-5">
      {templates.length > 0 && (
        <div>
          <p className={labelClass}>Start with a pack</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={disabled}
                onClick={() => applyTemplate(t.id)}
                className="border border-vb-line bg-vb-paper px-4 py-3 text-left hover:border-vb-ink disabled:opacity-50"
              >
                <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-vb-ink">
                  {t.title}
                </span>
                <span className="mt-1 block text-xs text-vb-muted">
                  {t.fields.map((f) => f.label).join(" · ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className={labelClass}>Or add one question</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(mode === "quote"
            ? ([
                ["file", "Add photo"],
                ["textarea", "Add message"],
                ["text", "Add short answer"],
              ] as const)
            : ([
                ["colour", "Add colour"],
                ["select", "Add size / choice"],
                ["text", "Add text"],
                ["file", "Add photo"],
              ] as const)
          ).map(([type, label]) => (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => addField(type)}
              className="inline-flex h-9 items-center gap-1.5 border border-vb-line bg-vb-white px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-ink hover:border-vb-ink disabled:opacity-50"
            >
              <Plus size={12} /> {label}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const n =
                fields.filter((f) => f.field_type === "file").length + 1;
              const labels = [
                "Front photo",
                "Side photo",
                "Logo / detail",
                "Extra photo",
              ];
              const label = labels[Math.min(n - 1, labels.length - 1)];
              onChange([
                ...fields,
                {
                  ...makeQuickField(
                    n <= 3 ? label : `Photo ${n}`,
                    "file",
                    n === 1
                  ),
                  sort_order: fields.length + 1,
                },
              ]);
            }}
            className="inline-flex h-9 items-center gap-1.5 border border-vb-line bg-vb-white px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-ink hover:border-vb-ink disabled:opacity-50"
          >
            <Plus size={12} /> Add labeled photo
          </button>
        </div>
      </div>

      {fields.length === 0 && (
        <p className="border border-dashed border-vb-line bg-vb-mist px-4 py-8 text-center text-sm text-vb-muted">
          Tap a pack above — or add questions one by one.
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
                Question {index + 1}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(fields.filter((_, i) => i !== index))}
                className="text-vb-muted hover:text-vb-danger"
                aria-label="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>What you ask</label>
                <input
                  className={inputClass}
                  value={field.label}
                  disabled={disabled}
                  onChange={(e) => {
                    const label = e.target.value;
                    update(index, {
                      label,
                      key: fieldKeyFromLabel(label),
                    });
                  }}
                  placeholder="e.g. Leather colour"
                />
              </div>
              <div>
                <label className={labelClass}>Answer type</label>
                <select
                  className={inputClass}
                  value={field.field_type}
                  disabled={disabled}
                  onChange={(e) =>
                    update(index, {
                      field_type: e.target.value as CustomFieldType,
                      options:
                        e.target.value === "select" ||
                        e.target.value === "colour"
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
              <div className="flex items-end pb-2 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-vb-ink">
                  <input
                    type="checkbox"
                    checked={field.required}
                    disabled={disabled}
                    onChange={(e) =>
                      update(index, { required: e.target.checked })
                    }
                  />
                  Customer must answer
                </label>
              </div>
            </div>

            {needsOptions && (
              <div className="mt-4 space-y-2 border-t border-vb-line pt-4">
                <p className={labelClass}>Choices</p>
                {field.options.map((opt, optIndex) => (
                  <div
                    key={optIndex}
                    className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_5rem_5.5rem_auto] sm:items-end"
                  >
                    <input
                      className={inputClass}
                      placeholder="Choice name"
                      value={opt.label}
                      disabled={disabled}
                      onChange={(e) => {
                        const options = [...field.options];
                        options[optIndex] = {
                          ...opt,
                          label: e.target.value,
                          value: fieldKeyFromLabel(e.target.value),
                        };
                        update(index, { options });
                      }}
                    />
                    {field.field_type === "colour" && (
                      <div>
                        <label className="sr-only">Colour</label>
                        <input
                          type="color"
                          className="mt-1.5 h-10 w-14 cursor-pointer border border-vb-line bg-vb-paper p-1"
                          value={
                            opt.colour_hex &&
                            /^#[0-9a-fA-F]{6}$/.test(opt.colour_hex)
                              ? opt.colour_hex
                              : "#b4532a"
                          }
                          disabled={disabled}
                          title="Swatch colour"
                          onChange={(e) => {
                            const options = [...field.options];
                            options[optIndex] = {
                              ...opt,
                              colour_hex: e.target.value,
                            };
                            update(index, { options });
                          }}
                        />
                      </div>
                    )}
                    <input
                      className={inputClass}
                      type="number"
                      step="0.01"
                      placeholder="+£"
                      title="Extra cost"
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
                          options: field.options.filter(
                            (_, i) => i !== optIndex
                          ),
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
                  <Plus size={12} /> Add choice
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
