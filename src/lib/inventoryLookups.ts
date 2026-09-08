"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export interface LookupItem {
  id: number;
  label: string;
}

export function useInventoryLookups() {
  const [products, setProducts] = useState<LookupItem[]>([]);
  const [warehouses, setWarehouses] = useState<LookupItem[]>([]);

  useEffect(() => {
    api
      .get<Array<{ id: number; sku: string; name: string }>>(
        "/inventory/products",
      )
      .then((rows) =>
        setProducts(
          rows.map((p) => ({ id: p.id, label: `${p.sku} · ${p.name}` })),
        ),
      )
      .catch(() => setProducts([]));

    api
      .get<Array<{ id: number; name: string }>>("/inventory/warehouses")
      .then((rows) =>
        setWarehouses(rows.map((w) => ({ id: w.id, label: w.name }))),
      )
      .catch(() => setWarehouses([]));
  }, []);

  const productLabel = (id: number) =>
    products.find((p) => p.id === id)?.label ?? `Product #${id}`;
  const warehouseLabel = (id: number) =>
    warehouses.find((w) => w.id === id)?.label ?? `Warehouse #${id}`;

  return { products, warehouses, productLabel, warehouseLabel };
}
