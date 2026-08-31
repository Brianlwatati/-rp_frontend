"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export interface LookupItem {
  id: number;
  label: string;
}

const FALLBACK_PRODUCTS: LookupItem[] = [
  { id: 1, label: "SKU-2201 · Steel Shelving Unit" },
  { id: 2, label: "SKU-2202 · Pallet Wrap (Roll)" },
  { id: 3, label: "SKU-2203 · Barcode Scanner" },
];

const FALLBACK_WAREHOUSES: LookupItem[] = [
  { id: 1, label: "Nairobi Central" },
  { id: 2, label: "Mombasa Port" },
  { id: 3, label: "Legacy Depot" },
];

// Movements/transfers/stock levels only carry productId/warehouseId — this
// resolves them to human-readable labels for display, falling back to
// sample data (or "#id") if the ERP backend isn't reachable yet.
export function useInventoryLookups() {
  const [products, setProducts] = useState<LookupItem[]>(FALLBACK_PRODUCTS);
  const [warehouses, setWarehouses] = useState<LookupItem[]>(FALLBACK_WAREHOUSES);

  useEffect(() => {
    api
      .get<Array<{ id: number; sku: string; name: string }>>("/inventory/products")
      .then((rows) => setProducts(rows.map((p) => ({ id: p.id, label: `${p.sku} · ${p.name}` }))))
      .catch(() => setProducts(FALLBACK_PRODUCTS));

    api
      .get<Array<{ id: number; name: string }>>("/inventory/warehouses")
      .then((rows) => setWarehouses(rows.map((w) => ({ id: w.id, label: w.name }))))
      .catch(() => setWarehouses(FALLBACK_WAREHOUSES));
  }, []);

  const productLabel = (id: number) => products.find((p) => p.id === id)?.label ?? `Product #${id}`;
  const warehouseLabel = (id: number) =>
    warehouses.find((w) => w.id === id)?.label ?? `Warehouse #${id}`;

  return { products, warehouses, productLabel, warehouseLabel };
}
