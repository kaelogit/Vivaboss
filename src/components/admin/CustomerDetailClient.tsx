"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AdminDetailSkeleton } from "@/components/admin/AdminSkeleton";
import AdminPageHeader, {
  AdminEmptyState,
} from "@/components/admin/AdminPageHeader";
import { formatGbp } from "@/lib/products/money";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  full_name: string;
  total_gbp: number;
  created_at: string;
};

type CustomRow = {
  id: string;
  status: string;
  product_name: string | null;
  full_name: string;
  created_at: string;
  quote_amount_gbp: number | null;
};

type ServiceRow = {
  id: string;
  status: string;
  job_type: string;
  full_name: string;
  postcode: string;
  created_at: string;
};

type CourierRow = {
  id: string;
  status: string;
  vertical: string;
  urgency: string;
  full_name: string;
  pickup_postcode: string;
  dropoff_postcode: string;
  created_at: string;
};

type CustomerDetail = {
  email: string;
  name: string | null;
  orders: OrderRow[];
  customRequests: CustomRow[];
  serviceJobs: ServiceRow[];
  courierJobs: CourierRow[];
};

export default function CustomerDetailClient({
  emailParam,
}: {
  emailParam: string;
}) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${encodeURIComponent(emailParam)}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          customer?: CustomerDetail;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load.");
        setCustomer(data.customer ?? null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load.")
      )
      .finally(() => setLoading(false));
  }, [emailParam]);

  return (
    <div>
      <AdminPageHeader
        title={customer?.name ?? customer?.email ?? "Customer"}
        description={
          customer
            ? customer.email
            : "Related orders, requests, and jobs for this email."
        }
        action={{ href: "/admin/customers", label: "All customers" }}
      />

      {loading && <AdminDetailSkeleton />}
      {error && <AdminEmptyState title="Cannot load customer" body={error} />}

      {customer && (
        <div className="space-y-10">
          <Section title="Orders" empty="No orders.">
            {customer.orders.map((o) => (
              <Row
                key={o.id}
                href={`/admin/orders/${o.id}`}
                title={o.order_number}
                meta={`${formatGbp(Number(o.total_gbp))} · ${o.status.replace(/_/g, " ")}`}
                date={o.created_at}
              />
            ))}
          </Section>

          <Section title="Custom requests" empty="No custom requests.">
            {customer.customRequests.map((r) => (
              <Row
                key={r.id}
                href="/admin/custom-requests"
                title={r.product_name ?? "Custom request"}
                meta={r.status.replace(/_/g, " ")}
                date={r.created_at}
              />
            ))}
          </Section>

          <Section title="Service jobs" empty="No service jobs.">
            {customer.serviceJobs.map((j) => (
              <Row
                key={j.id}
                href={`/admin/service-jobs/${j.id}`}
                title={j.job_type.replace(/_/g, " ")}
                meta={`${j.postcode} · ${j.status.replace(/_/g, " ")}`}
                date={j.created_at}
              />
            ))}
          </Section>

          <Section title="Courier jobs" empty="No courier jobs.">
            {customer.courierJobs.map((j) => (
              <Row
                key={j.id}
                href={`/admin/courier-jobs/${j.id}`}
                title={`${j.vertical.replace(/_/g, " ")} · ${j.urgency}`}
                meta={`${j.pickup_postcode} → ${j.dropoff_postcode} · ${j.status.replace(/_/g, " ")}`}
                date={j.created_at}
              />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode[];
}) {
  return (
    <section>
      <h2 className="font-heading text-sm font-bold uppercase tracking-tight text-vb-ink">
        {title}
      </h2>
      {children.length === 0 ? (
        <p className="mt-3 text-sm text-vb-muted">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-vb-line border border-vb-line bg-vb-white">
          {children}
        </ul>
      )}
    </section>
  );
}

function Row({
  href,
  title,
  meta,
  date,
}: {
  href: string;
  title: string;
  meta: string;
  date: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-vb-mist sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <span className="font-medium text-vb-ink">{title}</span>
          <span className="mt-0.5 block text-xs capitalize text-vb-muted">
            {meta}
          </span>
        </div>
        <span className="text-xs text-vb-muted">
          {new Date(date).toLocaleString("en-GB")}
        </span>
      </Link>
    </li>
  );
}
