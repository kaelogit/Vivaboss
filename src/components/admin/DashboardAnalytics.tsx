import Link from "next/link";
import { formatGbp } from "@/lib/products/money";
import {
  pctChange,
  type DashboardAnalytics,
  type DayPoint,
  type StatusSlice,
  type TopProduct,
} from "@/lib/admin/analytics";

function Delta({ current, previous }: { current: number; previous: number }) {
  const change = pctChange(current, previous);
  if (change == null) {
    return <span className="text-vb-muted">vs prior 30d</span>;
  }
  const up = change >= 0;
  return (
    <span className={up ? "text-vb-success" : "text-vb-danger"}>
      {up ? "+" : ""}
      {change}% vs prior 30d
    </span>
  );
}

function RevenueChart({ series }: { series: DayPoint[] }) {
  const width = 640;
  const height = 220;
  const padX = 12;
  const padTop = 16;
  const padBottom = 28;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...series.map((d) => d.revenue), 1);
  const barGap = 2;
  const barW = Math.max(2, chartW / series.length - barGap);

  const points = series
    .map((d, i) => {
      const x = padX + i * (chartW / series.length) + barW / 2;
      const y = padTop + chartH - (d.revenue / max) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = series.length
    ? `M ${padX},${padTop + chartH} ${series
        .map((d, i) => {
          const x = padX + i * (chartW / series.length) + barW / 2;
          const y = padTop + chartH - (d.revenue / max) * chartH;
          return `L ${x},${y}`;
        })
        .join(" ")} L ${padX + chartW - barGap},${padTop + chartH} Z`
    : "";

  const tickIdx = [0, 7, 14, 21, 29].filter((i) => i < series.length);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Revenue over the last 30 days"
    >
      <defs>
        <linearGradient id="vbRevFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = padTop + chartH - t * chartH;
        return (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.08"
          />
        );
      })}
      {areaPath && (
        <path d={areaPath} fill="url(#vbRevFill)" className="text-vb-accent" />
      )}
      {series.map((d, i) => {
        const x = padX + i * (chartW / series.length);
        const h = (d.revenue / max) * chartH;
        return (
          <rect
            key={d.date}
            x={x}
            y={padTop + chartH - h}
            width={barW}
            height={Math.max(h, d.revenue > 0 ? 2 : 0)}
            className="fill-vb-accent"
            opacity={0.85}
          >
            <title>
              {d.date}: {formatGbp(d.revenue)} · {d.orders} orders
            </title>
          </rect>
        );
      })}
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-vb-ink"
          opacity="0.35"
        />
      )}
      {tickIdx.map((i) => {
        const d = series[i];
        if (!d) return null;
        const x = padX + i * (chartW / series.length) + barW / 2;
        return (
          <text
            key={d.date}
            x={x}
            y={height - 8}
            textAnchor="middle"
            className="fill-vb-muted"
            fontSize="10"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function StatusBars({ slices }: { slices: StatusSlice[] }) {
  const max = Math.max(...slices.map((s) => s.count), 1);
  if (slices.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-vb-muted">No orders yet</p>
    );
  }
  return (
    <ul className="space-y-3">
      {slices.map((s) => (
        <li key={s.status}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-vb-ink">{s.label}</span>
            <span className="font-heading text-xs font-semibold text-vb-muted">
              {s.count}
            </span>
          </div>
          <div className="h-2 bg-vb-mist">
            <div
              className="h-full bg-vb-ink"
              style={{ width: `${(s.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function TopProducts({ products }: { products: TopProduct[] }) {
  const max = Math.max(...products.map((p) => p.revenue), 1);
  if (products.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-vb-muted">
        No paid product sales in the last 30 days
      </p>
    );
  }
  return (
    <ul className="space-y-4">
      {products.map((p) => (
        <li key={p.name}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <p className="truncate text-sm text-vb-ink">{p.name}</p>
            <p className="shrink-0 font-heading text-xs font-semibold text-vb-ink">
              {formatGbp(p.revenue)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 bg-vb-mist">
              <div
                className="h-full bg-vb-accent"
                style={{ width: `${(p.revenue / max) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-[11px] text-vb-muted">
              ×{p.quantity}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PipelineDonut({
  custom,
  service,
  courier,
}: {
  custom: number;
  service: number;
  courier: number;
}) {
  const total = custom + service + courier;
  const size = 160;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const segments = [
    { label: "Custom", value: custom, color: "var(--color-vb-accent)" },
    { label: "Service", value: service, color: "var(--color-vb-ink)" },
    { label: "Courier", value: courier, color: "var(--color-vb-muted)" },
  ];

  let offset = 0;
  const arcs =
    total === 0
      ? null
      : segments.map((seg) => {
          const len = (seg.value / total) * c;
          const node = (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return node;
        });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
        aria-label="Open pipeline mix"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth={stroke}
          className="text-vb-ink"
        />
        {arcs}
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          className="fill-vb-ink"
          fontSize="28"
          fontWeight="700"
        >
          {total}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          className="fill-vb-muted"
          fontSize="10"
          style={{ letterSpacing: "0.12em" }}
        >
          OPEN
        </text>
      </svg>
      <ul className="w-full space-y-3 text-sm">
        {segments.map((seg) => (
          <li
            key={seg.label}
            className="flex items-center justify-between gap-4 border-b border-vb-line pb-2 last:border-0 last:pb-0"
          >
            <span className="flex items-center gap-2 text-vb-ink">
              <span
                className="inline-block h-2.5 w-2.5"
                style={{ background: seg.color }}
                aria-hidden
              />
              {seg.label}
            </span>
            <span className="font-heading font-semibold text-vb-ink">
              {seg.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STATUS_CLASS: Record<string, string> = {
  pending_payment: "text-vb-muted",
  paid: "text-vb-success",
  pre_order: "text-vb-accent",
  processing: "text-vb-ink",
  personalising: "text-vb-accent",
  shipped: "text-vb-ink",
  delivered: "text-vb-success",
  cancelled: "text-vb-danger",
  refunded: "text-vb-danger",
};

export default function DashboardAnalytics({
  data,
}: {
  data: DashboardAnalytics;
}) {
  const kpis = [
    {
      label: "Revenue · 30 days",
      value: formatGbp(data.revenue30d),
      hint: (
        <Delta current={data.revenue30d} previous={data.revenuePrev30d} />
      ),
    },
    {
      label: "Orders · 30 days",
      value: String(data.orders30d),
      hint: (
        <Delta current={data.orders30d} previous={data.ordersPrev30d} />
      ),
    },
    {
      label: "Avg order value",
      value: formatGbp(data.aov30d),
      hint: <span className="text-vb-muted">Paid orders, last 30 days</span>,
    },
    {
      label: "Revenue today",
      value: formatGbp(data.revenueToday),
      hint: (
        <span className="text-vb-muted">
          {data.openOrders} open order{data.openOrders === 1 ? "" : "s"}
        </span>
      ),
    },
  ];

  const attention = [
    { label: "Open orders", value: data.openOrders, href: "/admin/orders" },
    {
      label: "Custom requests",
      value: data.openCustom,
      href: "/admin/custom-requests",
    },
    {
      label: "Service jobs",
      value: data.openService,
      href: "/admin/service-jobs",
    },
    {
      label: "Courier jobs",
      value: data.openCourier,
      href: "/admin/courier-jobs",
    },
    {
      label: "Reviews pending",
      value: data.pendingReviews,
      href: "/admin/reviews",
    },
  ];

  if (!data.connected) {
    return (
      <div className="border border-dashed border-vb-line bg-vb-white px-6 py-16 text-center">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-vb-ink">
          Analytics unavailable
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-vb-muted">
          Analytics could not be loaded. Try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-vb-line bg-vb-white p-5">
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
              {kpi.label}
            </p>
            <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-vb-ink">
              {kpi.value}
            </p>
            <p className="mt-2 text-xs">{kpi.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="border border-vb-line bg-vb-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
                Revenue
              </p>
              <p className="mt-1 font-heading text-lg font-bold text-vb-ink">
                Last 30 days
              </p>
            </div>
            <p className="text-xs text-vb-muted">
              Peak day{" "}
              {formatGbp(
                Math.max(...data.revenueSeries.map((d) => d.revenue), 0)
              )}
            </p>
          </div>
          <RevenueChart series={data.revenueSeries} />
        </div>

        <div className="border border-vb-line bg-vb-white p-5">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
            Pipeline
          </p>
          <p className="mt-1 mb-5 font-heading text-lg font-bold text-vb-ink">
            Needs attention
          </p>
          <PipelineDonut
            custom={data.openCustom}
            service={data.openService}
            courier={data.openCourier}
          />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="border border-vb-line bg-vb-white p-5">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
            Orders by status
          </p>
          <p className="mt-1 mb-5 font-heading text-lg font-bold text-vb-ink">
            All time snapshot
          </p>
          <StatusBars slices={data.statusBreakdown} />
        </div>

        <div className="border border-vb-line bg-vb-white p-5">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
            Top products
          </p>
          <p className="mt-1 mb-5 font-heading text-lg font-bold text-vb-ink">
            Revenue · 30 days
          </p>
          <TopProducts products={data.topProducts} />
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        <div className="border border-vb-line bg-vb-white p-5 xl:col-span-2">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
            Queues
          </p>
          <p className="mt-1 mb-4 font-heading text-lg font-bold text-vb-ink">
            Jump in
          </p>
          <ul className="divide-y divide-vb-line">
            {attention.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-vb-accent"
                >
                  <span>{item.label}</span>
                  <span className="font-heading text-base font-bold text-vb-ink">
                    {item.value}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-vb-line bg-vb-white p-5 xl:col-span-3">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-vb-muted">
                Recent orders
              </p>
              <p className="mt-1 font-heading text-lg font-bold text-vb-ink">
                Latest activity
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-vb-muted hover:text-vb-accent"
            >
              View all
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="py-10 text-center text-sm text-vb-muted">
              No orders yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-vb-line font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-vb-muted">
                    <th className="pb-2 pr-3 font-semibold">Order</th>
                    <th className="pb-2 pr-3 font-semibold">Customer</th>
                    <th className="pb-2 pr-3 font-semibold">Status</th>
                    <th className="pb-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-vb-line last:border-0"
                    >
                      <td className="py-3 pr-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-heading text-xs font-semibold uppercase tracking-wide text-vb-ink hover:text-vb-accent"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-vb-ink">{order.full_name}</td>
                      <td
                        className={`py-3 pr-3 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          STATUS_CLASS[order.status] ?? "text-vb-muted"
                        }`}
                      >
                        {order.status.replaceAll("_", " ")}
                      </td>
                      <td className="py-3 text-right font-medium text-vb-ink">
                        {formatGbp(order.total_gbp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
