"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { formatGbp, saleCompareAt, saleDiscountPercent, saleSaveGbp } from "@/lib/products/money";
import {
  canPreorder,
  isUnavailable,
  PREORDER_LEAD,
} from "@/lib/products/stock";
import { useCartStore } from "@/store/cart";
import type { CartCustomValue } from "@/lib/cart/types";
import type { ProductDetail } from "@/lib/products/queries";
import type { CustomFieldOption } from "@/types/database";
import { isWhatsAppLive } from "@/lib/site";
import { whatsappHref } from "@/lib/navigation";

type FieldState = Record<string, string>;

export default function ProductBuyBox({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [values, setValues] = useState<FieldState>({});
  const [files, setFiles] = useState<Record<string, { url: string; path: string }>>(
    {}
  );
  const [qty, setQty] = useState(1);
  const [install, setInstall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  // Custom request form state
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqNotes, setReqNotes] = useState("");
  const [reqDone, setReqDone] = useState(false);

  const base = Number(product.price_gbp);
  const compare = saleCompareAt(base, product.compare_at_gbp);
  const discountPct = saleDiscountPercent(base, product.compare_at_gbp);
  const saveGbp = saleSaveGbp(base, product.compare_at_gbp);

  const optionDelta = useMemo(() => {
    let sum = 0;
    for (const field of product.custom_fields) {
      const v = values[field.key];
      if (!v) continue;
      const opt = (field.options as CustomFieldOption[]).find(
        (o) => o.value === v
      );
      if (opt?.price_delta_gbp) sum += opt.price_delta_gbp;
    }
    return sum;
  }, [product.custom_fields, values]);

  const installPrice =
    product.offers_installation && product.installation_price_gbp != null
      ? Number(product.installation_price_gbp)
      : null;

  const unitPreview =
    base + optionDelta + (install && installPrice != null ? installPrice : 0);

  const preorder = canPreorder(product);
  const unavailable = isUnavailable(product);

  const setValue = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const uploadFile = async (key: string, file: File) => {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/personalisation", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        url?: string;
        path?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      setFiles((prev) => ({
        ...prev,
        [key]: { url: data.url!, path: data.path! },
      }));
      setValue(key, data.path!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const buildCustomisation = (): CartCustomValue[] | string => {
    const out: CartCustomValue[] = [];
    for (const field of product.custom_fields) {
      const raw = values[field.key]?.trim() ?? "";
      if (field.required && !raw) {
        return `Please complete “${field.label}”.`;
      }
      if (!raw) continue;
      const opt = (field.options as CustomFieldOption[]).find(
        (o) => o.value === raw
      );
      out.push({
        key: field.key,
        label: field.label,
        field_type: field.field_type,
        value:
          field.field_type === "file"
            ? files[field.key]?.path ?? raw
            : opt?.label ?? raw,
        price_delta_gbp: opt?.price_delta_gbp,
        file_path: files[field.key]?.path,
        file_url: files[field.key]?.url,
      });
    }
    return out;
  };

  const addToCart = (opts?: { openDrawer?: boolean }): boolean => {
    setError(null);
    if (unavailable) {
      setError("This product is currently out of stock.");
      return false;
    }
    const custom = buildCustomisation();
    if (typeof custom === "string") {
      setError(custom);
      return false;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0],
      unitPriceGbp: base,
      compareAtGbp: compare,
      quantity: qty,
      customisation: custom,
      installationRequested: install,
      installationPriceGbp: installPrice,
      isPreorder: preorder,
      openDrawer: opts?.openDrawer,
    });
    setAdded(true);
    return true;
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const custom = buildCustomisation();
      if (typeof custom === "string") throw new Error(custom);

      const uploads = custom
        .filter((c) => c.field_type === "file" || c.file_path)
        .map((c) => c.file_path || c.value)
        .filter(Boolean);

      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          fullName: reqName,
          email: reqEmail,
          phone: reqPhone,
          instructions: reqNotes,
          uploads,
          fieldSnapshot: Object.fromEntries(
            custom.map((c) => [c.key, { label: c.label, value: c.value }])
          ),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not submit request.");
      setReqDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  if (product.requires_approval) {
    if (reqDone) {
      return (
        <div className="mt-8 border border-vb-line bg-vb-mist/40 p-6">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
            Request received
          </p>
          <p className="mt-3 text-sm text-vb-muted">
            We’ll review your details and get back with a quote and design
            confirmation before production.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-vb-accent"
          >
            Continue shopping →
          </Link>
        </div>
      );
    }

    return (
      <form onSubmit={submitRequest} className="mt-8 space-y-5">
        <FieldInputs
          product={product}
          values={values}
          setValue={setValue}
          uploadFile={uploadFile}
          busy={busy}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Your name *
            </label>
            <input
              required
              className="mt-1.5 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm"
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
            />
          </div>
          <div>
            <label className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Email *
            </label>
            <input
              required
              type="email"
              className="mt-1.5 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm"
              value={reqEmail}
              onChange={(e) => setReqEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Phone / WhatsApp
            </label>
            <input
              className="mt-1.5 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm"
              value={reqPhone}
              onChange={(e) => setReqPhone(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
              Additional instructions
            </label>
            <textarea
              className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
              rows={3}
              value={reqNotes}
              onChange={(e) => setReqNotes(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-sm text-vb-danger">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 items-center gap-2 bg-vb-accent px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-vb-accent-hover disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            Submit custom request
          </button>
          {isWhatsAppLive() && (
            <a
              href={whatsappHref(
                `Hi Vivaboss — custom quote for ${product.name}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center border border-vb-ink px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em]"
            >
              WhatsApp
            </a>
          )}
        </div>
      </form>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <p
          className={`font-heading text-xl font-semibold ${
            compare != null ? "text-vb-accent" : "text-vb-ink"
          }`}
        >
          {formatGbp(unitPreview)}
        </p>
        {compare != null && (
          <p className="text-vb-muted line-through">{formatGbp(compare)}</p>
        )}
        {discountPct > 0 && (
          <span className="bg-vb-accent px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            −{discountPct}% · Save {formatGbp(saveGbp)}
          </span>
        )}
        {optionDelta + (install && installPrice ? installPrice : 0) > 0 && (
          <p className="text-xs text-vb-muted">Includes selected options</p>
        )}
      </div>

      <FieldInputs
        product={product}
        values={values}
        setValue={setValue}
        uploadFile={uploadFile}
        busy={busy}
      />

      {product.offers_installation && (
        <label className="flex items-start gap-3 border border-vb-line bg-vb-paper px-4 py-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={install}
            onChange={(e) => setInstall(e.target.checked)}
          />
          <span>
            <span className="font-heading font-semibold uppercase tracking-tight">
              Add professional installation
            </span>
            <span className="mt-1 block text-vb-muted">
              {installPrice != null
                ? `${formatGbp(installPrice)} — we’ll schedule after payment`
                : "Quoted after checkout — tick to request"}
            </span>
          </span>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <label className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
          Qty
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="ml-3 h-11 w-20 border border-vb-line bg-vb-paper px-3 text-sm"
          />
        </label>
      </div>

      {error && <p className="text-sm text-vb-danger">{error}</p>}
      {added && (
        <p className="text-sm text-vb-success">
          {preorder ? "Pre-order added to your bag." : "Added to your bag."}
        </p>
      )}

      {preorder && (
        <p className="text-sm text-vb-muted">
          Sold out · Pre-order available. Typical lead time {PREORDER_LEAD} after
          payment.
        </p>
      )}
      {unavailable && (
        <p className="text-sm text-vb-muted">
          Out of stock — this piece isn’t available to order right now.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || unavailable}
          onClick={() => {
            addToCart();
          }}
          className="inline-flex h-12 items-center bg-vb-ink px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-paper hover:bg-vb-accent disabled:opacity-50"
        >
          {preorder ? "Pre-order" : "Add to bag"}
        </button>
        <button
          type="button"
          disabled={busy || unavailable}
          onClick={() => {
            if (addToCart({ openDrawer: false })) router.push("/checkout");
          }}
          className="inline-flex h-12 items-center border border-vb-ink px-6 font-heading text-[11px] font-semibold uppercase tracking-[0.18em] disabled:opacity-50"
        >
          {preorder ? "Pre-order & checkout" : "Buy now"}
        </button>
      </div>
    </div>
  );
}

function FieldInputs({
  product,
  values,
  setValue,
  uploadFile,
  busy,
}: {
  product: ProductDetail;
  values: FieldState;
  setValue: (key: string, value: string) => void;
  uploadFile: (key: string, file: File) => Promise<void>;
  busy: boolean;
}) {
  if (!product.custom_fields.length) return null;

  return (
    <div className="space-y-4 border-t border-vb-line pt-6">
      <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
        Make it yours
      </p>
      {product.custom_fields.map((field) => (
        <div key={field.id}>
          <label className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted">
            {field.label}
            {field.required ? " *" : ""}
          </label>
          {field.field_type === "select" || field.field_type === "colour" ? (
            <select
              className="mt-1.5 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm"
              value={values[field.key] ?? ""}
              onChange={(e) => setValue(field.key, e.target.value)}
            >
              <option value="">Choose…</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.price_delta_gbp
                    ? ` (+${formatGbp(opt.price_delta_gbp)})`
                    : ""}
                </option>
              ))}
            </select>
          ) : field.field_type === "textarea" ? (
            <textarea
              className="mt-1.5 w-full border border-vb-line bg-vb-paper px-3 py-2 text-sm"
              rows={3}
              value={values[field.key] ?? ""}
              onChange={(e) => setValue(field.key, e.target.value)}
            />
          ) : field.field_type === "file" ? (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={busy}
              className="mt-1.5 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(field.key, file);
              }}
            />
          ) : (
            <input
              type={field.field_type === "number" ? "number" : "text"}
              className="mt-1.5 h-11 w-full border border-vb-line bg-vb-paper px-3 text-sm"
              value={values[field.key] ?? ""}
              onChange={(e) => setValue(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
