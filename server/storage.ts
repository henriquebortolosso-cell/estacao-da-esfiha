import { db } from "./db";
import { categories, products, orders, orderItems } from "@shared/schema";
import type { 
  Category, Product, Order, OrderItem,
  InsertCategory, InsertProduct, InsertOrder, InsertOrderItem 
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getProducts(): Promise<Product[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.active, true));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    if (items && items.length > 0) {
      const orderItemsToInsert = items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }));
      await db.insert(orderItems).values(orderItemsToInsert);
    }
    
    return newOrder;
  }
}

export const storage = new DatabaseStorage();
