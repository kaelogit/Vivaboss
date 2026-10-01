import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingBag,
  Sparkles,
  Wrench,
  Truck,
  Users,
  PanelsTopLeft,
  CircleHelp,
  FileText,
  Settings,
  MessageSquareQuote,
} from "lucide-react";

export type AdminNavBadgeKey =
  | "orders"
  | "customRequests"
  | "serviceJobs"
  | "courierJobs"
  | "reviews";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badgeKey?: AdminNavBadgeKey;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const adminNav: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Shop",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badgeKey: "orders" },
      {
        href: "/admin/custom-requests",
        label: "Custom Requests",
        icon: Sparkles,
        badgeKey: "customRequests",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/admin/service-jobs",
        label: "Service Jobs",
        icon: Wrench,
        badgeKey: "serviceJobs",
      },
      {
        href: "/admin/courier-jobs",
        label: "Courier Jobs",
        icon: Truck,
        badgeKey: "courierJobs",
      },
    ],
  },
  {
    title: "Customers",
    items: [{ href: "/admin/customers", label: "Customers", icon: Users }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/content/homepage", label: "Homepage", icon: PanelsTopLeft },
      { href: "/admin/content/faq", label: "FAQ", icon: CircleHelp },
      { href: "/admin/content/pages", label: "Pages", icon: FileText },
      {
        href: "/admin/reviews",
        label: "Reviews",
        icon: MessageSquareQuote,
        badgeKey: "reviews",
      },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];
