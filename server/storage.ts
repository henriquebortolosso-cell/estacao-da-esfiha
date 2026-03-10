import { db } from "./db";
import { categories, products, orders, orderItems, storeSettings, customers, whatsappOrders } from "@shared/schema";
import type {
  Category, Product, Order, OrderItem, StoreSettings, Customer, WhatsappOrder,
  InsertCategory, InsertProduct, InsertOrder, InsertOrderItem, InsertStoreSettings, InsertCustomer, InsertWhatsappOrder
} from "@shared/schema";
import { eq, desc, sum } from "drizzle-orm";

export interface IStorage {
  // Public
  getCategories(): Promise<Category[]>;
  getProducts(): Promise<Product[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order>;
  getStoreSettings(): Promise<StoreSettings | undefined>;

  // Loyalty
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  upsertCustomer(phone: string, name: string): Promise<Customer>;
  recordOrderForLoyalty(phone: string, usedFreeDelivery: boolean): Promise<Customer>;

  // Admin
  createCategory(cat: InsertCategory): Promise<Category>;
  updateCategory(id: number, cat: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings>;
  getAllCustomers(): Promise<Customer[]>;
  getLoyaltyStats(): Promise<{ totalPaidOrders: number; totalFreeDeliveries: number; totalCustomers: number }>;

  // WhatsApp Orders
  createWhatsappOrder(order: InsertWhatsappOrder): Promise<WhatsappOrder>;
  getAllWhatsappOrders(): Promise<WhatsappOrder[]>;
  updateWhatsappOrderStatus(id: number, status: string): Promise<WhatsappOrder>;
  getWhatsappOrderStats(): Promise<{ total: number; pendente: number; pago: number }>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.active, true));
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.categoryId, products.name);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    if (items && items.length > 0) {
      const orderItemsToInsert = items.map(item => ({ ...item, orderId: newOrder.id }));
      await db.insert(orderItems).values(orderItemsToInsert);
    }
    return newOrder;
  }

  async getStoreSettings(): Promise<StoreSettings | undefined> {
    const [settings] = await db.select().from(storeSettings).limit(1);
    return settings;
  }

  // ── Loyalty ────────────────────────────────────────────
  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const normalized = phone.replace(/\D/g, "");
    const [customer] = await db.select().from(customers).where(eq(customers.phone, normalized));
    return customer;
  }

  async upsertCustomer(phone: string, name: string): Promise<Customer> {
    const normalized = phone.replace(/\D/g, "");
    const existing = await this.getCustomerByPhone(normalized);
    if (existing) {
      const [updated] = await db.update(customers)
        .set({ name })
        .where(eq(customers.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(customers).values({ phone: normalized, name }).returning();
    return created;
  }

  async recordOrderForLoyalty(phone: string, usedFreeDelivery: boolean): Promise<Customer> {
    const normalized = phone.replace(/\D/g, "");
    const existing = await this.getCustomerByPhone(normalized);
    if (!existing) throw new Error("Customer not found");

    if (usedFreeDelivery) {
      const [updated] = await db.update(customers)
        .set({ freeDeliveriesUsed: existing.freeDeliveriesUsed + 1 })
        .where(eq(customers.id, existing.id))
        .returning();
      return updated;
    } else {
      const [updated] = await db.update(customers)
        .set({ paidDeliveryOrders: existing.paidDeliveryOrders + 1 })
        .where(eq(customers.id, existing.id))
        .returning();
      return updated;
    }
  }

  // ── Admin ───────────────────────────────────────────────
  async createCategory(cat: InsertCategory): Promise<Category> {
    const [newCat] = await db.insert(categories).values(cat).returning();
    return newCat;
  }

  async updateCategory(id: number, cat: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db.update(categories).set(cat).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings> {
    const existing = await this.getStoreSettings();
    if (existing) {
      const [updated] = await db.update(storeSettings).set(settings).where(eq(storeSettings.id, existing.id)).returning();
      return updated;
    } else {
      const [newSettings] = await db.insert(storeSettings).values(settings as InsertStoreSettings).returning();
      return newSettings;
    }
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.paidDeliveryOrders));
  }

  async getLoyaltyStats(): Promise<{ totalPaidOrders: number; totalFreeDeliveries: number; totalCustomers: number }> {
    const all = await db.select().from(customers);
    const totalPaidOrders = all.reduce((s, c) => s + c.paidDeliveryOrders, 0);
    const totalFreeDeliveries = all.reduce((s, c) => s + c.freeDeliveriesUsed, 0);
    return { totalPaidOrders, totalFreeDeliveries, totalCustomers: all.length };
  }

  // ── WhatsApp Orders ─────────────────────────────────────
  async createWhatsappOrder(order: InsertWhatsappOrder): Promise<WhatsappOrder> {
    const [created] = await db.insert(whatsappOrders).values(order).returning();
    return created;
  }

  async getAllWhatsappOrders(): Promise<WhatsappOrder[]> {
    return await db.select().from(whatsappOrders).orderBy(desc(whatsappOrders.createdAt));
  }

  async updateWhatsappOrderStatus(id: number, status: string): Promise<WhatsappOrder> {
    const [updated] = await db.update(whatsappOrders).set({ status }).where(eq(whatsappOrders.id, id)).returning();
    return updated;
  }

  async getWhatsappOrderStats(): Promise<{ total: number; pendente: number; pago: number }> {
    const all = await db.select().from(whatsappOrders);
    const pendente = all.filter(o => o.status === "pendente").length;
    const pago = all.filter(o => o.status === "pago").length;
    return { total: all.length, pendente, pago };
  }
}

export const storage = new DatabaseStorage();
