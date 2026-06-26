import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Service } from "./api";

export interface CartItem {
  service: Service;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (service: Service) => void;
  remove: (serviceId: number) => void;
  setQty: (serviceId: number, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (service) =>
        set((s) => {
          const existing = s.items.find((i) => i.service.id === service.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.service.id === service.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...s.items, { service, quantity: 1 }] };
        }),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.service.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.service.id === id ? { ...i, quantity: Math.max(1, qty) } : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.service.price * i.quantity, 0),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    { name: "jch-cart" },
  ),
);
