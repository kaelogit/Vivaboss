"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cartSubtotal,
  type CartCustomValue,
  type CartLine,
} from "@/lib/cart/types";

type AddPayload = {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  unitPriceGbp: number;
  compareAtGbp?: number | null;
  quantity?: number;
  customisation?: CartCustomValue[];
  installationRequested?: boolean;
  installationPriceGbp?: number | null;
  isPreorder?: boolean;
  /** Defaults true — set false for silent add (e.g. buy now → checkout). */
  openDrawer?: boolean;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (payload: AddPayload) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

function fingerprint(payload: AddPayload): string {
  return JSON.stringify({
    productId: payload.productId,
    customisation: payload.customisation ?? [],
    installationRequested: Boolean(payload.installationRequested),
    isPreorder: Boolean(payload.isPreorder),
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      addItem: (payload) => {
        const qty = Math.max(1, payload.quantity ?? 1);
        const shouldOpen = payload.openDrawer !== false;
        const print = fingerprint(payload);
        const existing = get().lines.find(
          (line) =>
            fingerprint({
              productId: line.productId,
              slug: line.slug,
              name: line.name,
              unitPriceGbp: line.unitPriceGbp,
              customisation: line.customisation,
              installationRequested: line.installationRequested,
              isPreorder: line.isPreorder,
            }) === print
        );

        if (existing) {
          set({
            lines: get().lines.map((line) =>
              line.id === existing.id
                ? {
                    ...line,
                    quantity: line.quantity + qty,
                    compareAtGbp:
                      line.compareAtGbp ??
                      (payload.compareAtGbp != null &&
                      payload.compareAtGbp > payload.unitPriceGbp
                        ? payload.compareAtGbp
                        : null),
                  }
                : line
            ),
            ...(shouldOpen ? { isOpen: true } : {}),
          });
          return;
        }

        const line: CartLine = {
          id: crypto.randomUUID(),
          productId: payload.productId,
          slug: payload.slug,
          name: payload.name,
          image: payload.image,
          unitPriceGbp: payload.unitPriceGbp,
          compareAtGbp:
            payload.compareAtGbp != null &&
            payload.compareAtGbp > payload.unitPriceGbp
              ? payload.compareAtGbp
              : null,
          quantity: qty,
          customisation: payload.customisation ?? [],
          installationRequested: Boolean(payload.installationRequested),
          installationPriceGbp: payload.installationPriceGbp ?? null,
          isPreorder: Boolean(payload.isPreorder),
        };
        set({
          lines: [...get().lines, line],
          ...(shouldOpen ? { isOpen: true } : {}),
        });
      },
      removeItem: (lineId) =>
        set({ lines: get().lines.filter((l) => l.id !== lineId) }),
      setQuantity: (lineId, quantity) => {
        if (quantity < 1) {
          get().removeItem(lineId);
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.id === lineId ? { ...l, quantity } : l
          ),
        });
      },
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () => cartSubtotal(get().lines),
    }),
    {
      name: "vivaboss-cart-v3",
      partialize: (state) => ({ lines: state.lines }),
    }
  )
);
