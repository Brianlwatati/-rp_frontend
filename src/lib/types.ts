export interface Company {
  id: number;
  name: string;
  code: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  roleName?: string;
  roleCode?: string;
  roleScope?: string;
  roleScopeKey?: string;
  companyId?: string;
  company?: Company;
  isActive?: boolean;
}

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResult {
  user: AuthUser;
  tokens: LoginTokens;
}

// ---------------------------------------------------------------------------
// Inventory (erp_backend /inventory)
// ---------------------------------------------------------------------------

export type ProductStatus = "ACTIVE" | "ARCHIVED";
export type WarehouseStatus = "ACTIVE" | "INACTIVE";

export interface Warehouse {
  id: number;
  iasCompanyId: number;
  code: string;
  name: string;
  location: string | null;
  status: WarehouseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  iasCompanyId: number;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  category: string | null;
  costPrice: string; // NUMERIC comes back from pg as string — cast at the edges, not in the DB layer
  sellPrice: string;
  reorderLevel: string;
  totalAvailable: string; // computed at the service layer for GET /products, not stored
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  productId: number;
  warehouseId: number;
  quantity: string;
  reservedQuantity: string;
  averageCost: string;
  updatedAt: string;
}

// GET /inventory/stock — product × warehouse joined with just enough
// identity to be readable on its own, as opposed to ProductWithStock's
// "one product, every warehouse" shape from GET /inventory/products/:id.
export interface StockLevelWithDetails {
  productId: number;
  sku: string;
  productName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  quantity: string;
  reservedQuantity: string;
  availableQuantity: string;
  averageCost: string;
  updatedAt: string;
}

export type StockMovementReason =
  | "RECEIVE"
  | "SALE"
  | "ADJUSTMENT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "STOCK_COUNT";

export interface StockMovement {
  id: number;
  productId: number;
  warehouseId: number;
  quantityDelta: string;
  unitCost: string | null;
  reason: StockMovementReason;
  referenceType: string | null;
  referenceId: number | null;
  notes: string | null;
  createdBy: number;
  createdAt: string;
  // Denormalized snapshot stored directly on the ledger row (not on the
  // formal domain type, but present at runtime) — use when available
  // instead of a separate product/warehouse lookup.
  productSku?: string;
  productName?: string;
  warehouseName?: string;
}

export interface StockTransfer {
  id: number;
  iasCompanyId: number;
  productId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  quantity: string;
  status: "COMPLETED" | "PENDING";
  createdBy: number;
  createdAt: string;
  productSku?: string;
  productName?: string;
  fromWarehouseName?: string;
  toWarehouseName?: string;
}

// Product joined with its stock across every warehouse — the shape
// GET /inventory/products/:id actually returns.
export interface ProductWithStock extends Product {
  stockByWarehouse: Array<{
    warehouseId: number;
    quantity: string;
    reservedQuantity: string;
    availableQuantity: string;
  }>;
  totalQuantity: string;
  totalAvailable: string;
}

export interface StockValuationRow {
  productId: number;
  sku: string;
  name: string;
  totalQuantity: string;
  averageCost: string;
  valuation: string;
}

// GET /inventory/stock/low — physical quantity, not available quantity.
export interface LowStockItem extends Product {
  totalQuantity: string;
}

// ---------------------------------------------------------------------------
// Access (erp_backend /roles, /branches)
// ---------------------------------------------------------------------------

export interface ErpRole {
  id: number;
  iasCompanyId: number;
  name: string;
  code: string;
  isDefault: boolean;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface ErpBranch {
  id: number;
  iasCompanyId: number;
  name: string;
  code: string;
  status: "ACTIVE" | "INACTIVE";
}

// ---------------------------------------------------------------------------
// CRM (erp_backend /contacts)
// ---------------------------------------------------------------------------

export type ContactType = "CUSTOMER" | "SUPPLIER" | "BOTH";

export interface Contact {
  id: number;
  iasCompanyId: number;
  contactType: ContactType;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxId: string | null;
  creditLimit: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Sales (erp_backend /sales)
// ---------------------------------------------------------------------------

export type SalesOrderStatus = "DRAFT" | "CONFIRMED" | "SHIPPED" | "CANCELLED";

export interface SalesOrder {
  id: number;
  ias_company_id: number;
  order_number: string;
  customer_id: number;
  warehouse_id: number;
  status: SalesOrderStatus;
  currency: string;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  notes: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  // Only present on the list/detail endpoints (joined in, not stored).
  customerName?: string;
  warehouseName?: string;
}

export interface SalesOrderItem {
  id: number;
  sales_order_id: number;
  product_id: number;
  quantity: string;
  unit_price: string;
  discount_amount: string;
  tax_rate: string;
}

export interface SalesOrderItemInput {
  productId: number;
  quantity: number;
  unitPrice?: number;
  discountAmount?: number;
  taxRate?: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: unknown;
}
