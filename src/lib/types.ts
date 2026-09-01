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
  product_sku: string;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  quantity: string;
  unit_price: string;
  discount_amount: string;
  tax_rate: string;
  line_total: string;
}

export interface SalesOrderWithItems extends SalesOrder {
  items: SalesOrderItem[];
}

export interface SalesOrderItemInput {
  productId: number;
  quantity: number;
  unitPrice?: number;
  discountAmount?: number;
  taxRate?: number;
}

// ---------------------------------------------------------------------------
// Purchasing (erp_backend /purchasing)
// ---------------------------------------------------------------------------

export type PurchaseOrderStatus = "DRAFT" | "APPROVED" | "PARTIALLY_RECEIVED" | "RECEIVED";

export interface PurchaseOrder {
  id: number;
  ias_company_id: number;
  po_number: string;
  supplier_id: number;
  warehouse_id: number;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_date: string | null;
  currency: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  notes: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  supplierName?: string;
  warehouseName?: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  product_sku: string;
  product_name: string;
  quantity: string;
  received_quantity: string;
  unit_cost: string;
  tax_rate: string;
  line_total: string;
}

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemInput {
  productId: number;
  quantity: number;
  unitCost: number;
  taxRate?: number;
}

// ---------------------------------------------------------------------------
// Finance (erp_backend /finance)
// ---------------------------------------------------------------------------

export type InvoiceStatus = "OPEN" | "PARTIALLY_PAID" | "PAID" | "VOID";

export interface Invoice {
  id: number;
  ias_company_id: number;
  invoice_number: string;
  customer_id: number;
  sales_order_id: number | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  currency: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  paid_amount: string;
  notes: string | null;
  created_by: number;
  created_at: string;
  customerName?: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number | null;
  product_sku: string | null;
  product_name: string;
  quantity: string;
  unit_price: string;
  tax_rate: string;
  line_total: string;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface Receivable {
  id: number;
  ias_company_id: number;
  invoice_number: string;
  customer_id: number;
  customerName: string;
  status: InvoiceStatus;
  due_date: string | null;
  total_amount: string;
  paid_amount: string;
  outstanding: string;
}

export interface PaymentAllocationInput {
  invoiceId: number;
  amount: number;
}

export interface Payment {
  id: number;
  ias_company_id: number;
  customer_id: number | null;
  payment_reference: string;
  amount: string;
  payment_date: string;
  method: string;
  notes: string | null;
  created_by: number;
  created_at: string;
}

export interface JournalLineInput {
  accountCode: string;
  debit?: number;
  credit?: number;
}

export interface JournalEntry {
  id: number;
  ias_company_id: number;
  reference_type: string | null;
  reference_id: number | null;
  description: string;
  entry_date: string;
  created_by: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// HR (erp_backend /hr)
// ---------------------------------------------------------------------------

export interface Employee {
  id: number;
  ias_company_id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  job_title: string | null;
  hire_date: string | null;
  salary: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  ias_company_id: number;
  employee_id: number;
  attendance_date: string;
  clock_in: string | null;
  clock_out: string | null;
  notes: string | null;
  employeeNumber?: string;
  firstName?: string;
  lastName?: string;
}

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveRequest {
  id: number;
  ias_company_id: number;
  employee_id: number;
  leave_type: string;
  starts_on: string;
  ends_on: string;
  reason: string | null;
  status: LeaveStatus;
  approved_by: number | null;
  created_at: string;
  employeeNumber?: string;
  firstName?: string;
  lastName?: string;
}

export interface PayrollRun {
  id: number;
  ias_company_id: number;
  period_start: string;
  period_end: string;
  status: "DRAFT" | "CALCULATED" | "PAID";
  total_gross: string;
  total_deductions: string;
  total_net: string;
  created_by: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Workflow (erp_backend /workflow)
// ---------------------------------------------------------------------------

export interface WorkflowNotification {
  id: number;
  ias_company_id: number;
  ias_user_id: number | null;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: number | null;
  is_read: boolean;
  created_at: string;
}

export interface WorkflowRule {
  id: number;
  ias_company_id: number;
  name: string;
  event_type: string;
  threshold_amount: string | null;
  action_type: string;
  target_user_id: number | null;
  status: "ACTIVE" | "INACTIVE";
  created_by: number;
  created_at: string;
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ApprovalRequest {
  id: number;
  ias_company_id: number;
  module: string;
  entity_type: string;
  entity_id: number;
  requested_by: number;
  assigned_to: number | null;
  amount: string | null;
  status: ApprovalStatus;
  decided_by: number | null;
  decided_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Reporting (erp_backend /reporting) — read-only aggregates
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  salesValue: string;
  outstandingInvoices: string;
  stockValue: string;
  openOrders: string;
  openPurchaseOrders: string;
}

export interface LowStockReportRow {
  id: number;
  sku: string;
  name: string;
  warehouseName: string;
  quantity: string;
  reservedQuantity: string;
  reorderLevel: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: unknown;
}
