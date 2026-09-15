import SiteFooter from "@/components/store/SiteFooter";
import SiteHeader from "@/components/store/SiteHeader";
import WhatsAppFab from "@/components/store/WhatsAppFab";
import CartHost from "@/components/shop/CartHost";
import RevealObserver from "@/components/motion/RevealObserver";
import { getPublicPages } from "@/lib/content/siteSettings";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await getPublicPages();
  const announcement =
    pages.announcement.trim() ||
    "UK-wide shop · home & smart services · courier — one Vivaboss standard";

  return (
    <>
      <div className="border-b border-vb-ink bg-vb-ink px-4 py-2.5 text-center">
        <p className="mx-auto max-w-4xl font-heading text-[10px] font-semibold uppercase leading-snug tracking-[0.14em] text-vb-paper sm:text-[11px] sm:tracking-[0.16em]">
          {announcement}
        </p>
      </div>
      <SiteHeader />
      <div id="main-content" className="flex flex-1 flex-col">
        {children}
      </div>
      <SiteFooter />
      <WhatsAppFab />
      <CartHost />
      <RevealObserver />
    </>
  );
}
