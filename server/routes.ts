import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  try {
    const existingCats = await storage.getCategories();
    if (existingCats.length === 0) {
      const { db } = await import("./db");
      const { categories, products } = await import("@shared/schema");
      
      const [esfihas] = await db.insert(categories).values({ name: "Esfihas Salgadas", sortOrder: 1 }).returning();
      const [doces] = await db.insert(categories).values({ name: "Esfihas Doces", sortOrder: 2 }).returning();
      const [bebidas] = await db.insert(categories).values({ name: "Bebidas", sortOrder: 3 }).returning();
      
      await db.insert(products).values([
        { categoryId: esfihas.id, name: "Esfiha de Carne", description: "Carne moída temperada, tomate e cebola", price: "5.50", imageUrl: "https://placehold.co/150?text=Carne" },
        { categoryId: esfihas.id, name: "Esfiha de Queijo", description: "Queijo mussarela, salsinha e azeitona", price: "6.00", imageUrl: "https://placehold.co/150?text=Queijo" },
        { categoryId: esfihas.id, name: "Esfiha de Calabresa", description: "Calabresa moída com cebola", price: "5.50", imageUrl: "https://placehold.co/150?text=Calabresa" },
        { categoryId: doces.id, name: "Esfiha de Chocolate", description: "Chocolate ao leite", price: "7.00", imageUrl: "https://placehold.co/150?text=Chocolate" },
        { categoryId: doces.id, name: "Esfiha de Doce de Leite", description: "Doce de leite cremoso", price: "7.50", imageUrl: "https://placehold.co/150?text=Doce+de+Leite" },
        { categoryId: bebidas.id, name: "Refrigerante Lata 350ml", description: "Coca-cola, Guaraná, Fanta", price: "6.50", imageUrl: "https://placehold.co/150?text=Refrigerante" },
      ]);
    }
  } catch (error) {
    console.error("Failed to seed database", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.categories.list.path, async (req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  app.get(api.products.list.path, async (req, res) => {
    const prods = await storage.getProducts();
    res.json(prods);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      
      const { items, ...orderData } = input;
      
      const order = await storage.createOrder(
        orderData as any, 
        items as any
      );
      
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.orders.get.path, async (req, res) => {
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  });
  
  // Call seed after defining routes (but it will run asynchronously)
  seedDatabase();

  return httpServer;
}
