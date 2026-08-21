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

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan?: string;
}

export interface Role {
  id: string;
  name: string;
  scope: string;
  permissions: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  balance: number;
}

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
}

// Product joined with its stock across every warehouse — the shape
// getLowStockItems() and product-detail views actually want.
export interface ProductWithStock extends Product {
  stockByWarehouse: Array<{
    warehouseId: number;
    quantity: string;
    reservedQuantity: string;
    availableQuantity: string; // quantity - reservedQuantity, computed at the service layer
  }>;
  totalQuantity: string;
  totalAvailable: string;
}

export interface StockValuationRow {
  productId: number;
  sku: string;
  name: string;
  totalQuantity: string;
  averageCost: string; // weighted average across warehouses, not just cost_price
  valuation: string; // totalQuantity * averageCost
}

export interface Order {
  id: string;
  reference: string;
  customerName: string;
  status: "draft" | "pending" | "fulfilled" | "cancelled";
  total: number;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status: number;
}
