import { db } from "./db";
import { categories, products, orders, orderItems, storeSettings } from "@shared/schema";
import type {
  Category, Product, Order, OrderItem, StoreSettings,
  InsertCategory, InsertProduct, InsertOrder, InsertOrderItem, InsertStoreSettings
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Public
  getCategories(): Promise<Category[]>;
  getProducts(): Promise<Product[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order>;
  getStoreSettings(): Promise<StoreSettings | undefined>;

  // Admin
  createCategory(cat: InsertCategory): Promise<Category>;
  updateCategory(id: number, cat: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings>;
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
}

export const storage = new DatabaseStorage();
