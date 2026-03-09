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

      const [promocoes] = await db.insert(categories).values({ name: "PROMOÇÕES", sortOrder: 1 }).returning();
      const [esfihasAbertas] = await db.insert(categories).values({ name: "ESFIHAS ABERTAS", sortOrder: 2 }).returning();
      const [esfihasDoces] = await db.insert(categories).values({ name: "ESFIHAS DOCES", sortOrder: 3 }).returning();
      const [esfihasFechadas] = await db.insert(categories).values({ name: "ESFIHAS FECHADAS", sortOrder: 4 }).returning();
      const [salgados] = await db.insert(categories).values({ name: "SALGADOS", sortOrder: 5 }).returning();
      const [pizzas] = await db.insert(categories).values({ name: "PIZZAS", sortOrder: 6 }).returning();
      const [pasteis] = await db.insert(categories).values({ name: "PASTÉIS", sortOrder: 7 }).returning();
      const [beirutes] = await db.insert(categories).values({ name: "BEIRUTES", sortOrder: 8 }).returning();
      const [lanches] = await db.insert(categories).values({ name: "LANCHES", sortOrder: 9 }).returning();
      const [porcoes] = await db.insert(categories).values({ name: "PORÇÕES", sortOrder: 10 }).returning();
      const [sobremesas] = await db.insert(categories).values({ name: "SOBREMESAS", sortOrder: 11 }).returning();
      const [refrigerantes] = await db.insert(categories).values({ name: "REFRIGERANTES", sortOrder: 12 }).returning();
      const [sucos] = await db.insert(categories).values({ name: "SUCOS", sortOrder: 13 }).returning();

      await db.insert(products).values([
        // PROMOÇÕES
        { categoryId: promocoes.id, name: "Esf.Carne", description: "Esfiha aberta de carne moída temperada com tomate e cebola", price: "4.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406563/esfiha_de_carne_1.jpg", active: true },
        { categoryId: promocoes.id, name: "Esf. Queijo", description: "Esfiha aberta com queijo mussarela derretido", price: "5.75", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406562/esfiha_de_queijo.jpg", active: true },

        // ESFIHAS ABERTAS
        { categoryId: esfihasAbertas.id, name: "Esf.Carne", description: "Esfiha aberta de carne moída temperada com tomate e cebola", price: "4.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406563/esfiha_de_carne_1.jpg", active: true },
        { categoryId: esfihasAbertas.id, name: "Esf- Queijo", description: "Esfiha aberta com queijo mussarela derretido", price: "5.75", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406562/esfiha_de_queijo.jpg", active: true },
        { categoryId: esfihasAbertas.id, name: "Esf. Calabresa", description: "Esfiha aberta com calabresa e cebola", price: "5.75", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406561/esfiha_de_calabreza.jpg", active: true },
        { categoryId: esfihasAbertas.id, name: "Esf. Frango", description: "Esfiha aberta de frango desfiado temperado", price: "5.20", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406560/esfiha_de_frango.jpg", active: true },
        { categoryId: esfihasAbertas.id, name: "Esfiha Tomate Seco", description: "Esfiha aberta com tomate seco e queijo", price: "7.50", imageUrl: null, active: true },

        // ESFIHAS DOCES
        { categoryId: esfihasDoces.id, name: "Esfiha Mineira", description: "Esfiha doce especial ao estilo mineiro", price: "9.99", imageUrl: null, active: true },
        { categoryId: esfihasDoces.id, name: "Esf.Chocolate", description: "Esfiha doce recheada com chocolate ao leite", price: "8.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406534/semfoto1.jpg", active: true },
        { categoryId: esfihasDoces.id, name: "Esf.Chocolate Branco", description: "Esfiha doce recheada com chocolate branco", price: "8.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406533/semfoto1.jpg", active: true },
        { categoryId: esfihasDoces.id, name: "Esf. Casadinho", description: "Esfiha doce com recheio casadinho (chocolate + coco)", price: "8.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406532/semfoto1.jpg", active: true },
        { categoryId: esfihasDoces.id, name: "Esf.Beijinho", description: "Esfiha doce recheada com beijinho de coco", price: "8.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406529/semfoto1.jpg", active: true },

        // ESFIHAS FECHADAS
        { categoryId: esfihasFechadas.id, name: "Esfiha Fechada de Carne", description: "Esfiha fechada recheada com carne moída temperada", price: "5.50", imageUrl: null, active: true },
        { categoryId: esfihasFechadas.id, name: "Esfiha Fechada de Queijo", description: "Esfiha fechada com queijo mussarela", price: "6.00", imageUrl: null, active: true },
        { categoryId: esfihasFechadas.id, name: "Esfiha Fechada de Frango", description: "Esfiha fechada com frango desfiado e catupiry", price: "6.00", imageUrl: null, active: true },

        // SALGADOS
        { categoryId: salgados.id, name: "Coxinha de Frango", description: "Coxinha crocante recheada com frango desfiado", price: "5.00", imageUrl: null, active: true },
        { categoryId: salgados.id, name: "Bolinha de Queijo", description: "Bolinha crocante de queijo mussarela", price: "5.00", imageUrl: null, active: true },
        { categoryId: salgados.id, name: "Enroladinho de Salsicha", description: "Enroladinho de massa folhada com salsicha", price: "4.50", imageUrl: null, active: true },

        // PIZZAS
        { categoryId: pizzas.id, name: "Espanhola", description: "Mussarela, atum, cebola e orégano", price: "36.99", imageUrl: null, active: true },
        { categoryId: pizzas.id, name: "Pizza Quitauna", description: "Hambúrguer picado, mussarella, cream cheese, bacon e batata palha", price: "46.00", imageUrl: null, active: true },
        { categoryId: pizzas.id, name: "Pizza Batata Especial", description: "Batata Frita, cheddar, mussarela e bacon", price: "46.00", imageUrl: null, active: true },
        { categoryId: pizzas.id, name: "Pizza Frango Especial", description: "Frango, cream cheese, mussarela e batata palha", price: "46.00", imageUrl: null, active: true },
        { categoryId: pizzas.id, name: "Carne Seca Com", description: "Carne Seca com: Queijo, cheddar ou catupiry", price: "56.00", imageUrl: null, active: true },

        // PASTÉIS
        { categoryId: pasteis.id, name: "Pastel de Carne", description: "Pastel crocante recheado com carne moída", price: "8.00", imageUrl: null, active: true },
        { categoryId: pasteis.id, name: "Pastel de Queijo", description: "Pastel crocante recheado com queijo mussarela", price: "8.00", imageUrl: null, active: true },
        { categoryId: pasteis.id, name: "Pastel de Frango", description: "Pastel crocante recheado com frango e catupiry", price: "9.00", imageUrl: null, active: true },

        // BEIRUTES
        { categoryId: beirutes.id, name: "Beirute de Queijo", description: "Pão pita grelhado com queijo mussarela e presunto", price: "15.00", imageUrl: null, active: true },
        { categoryId: beirutes.id, name: "Beirute de Frango", description: "Pão pita grelhado com frango e molho especial", price: "17.00", imageUrl: null, active: true },

        // LANCHES
        { categoryId: lanches.id, name: "X- Burguer", description: "Maionese, Queijo e Hambúrguer 130g", price: "21.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406496/burger1_360.jpg", active: true },
        { categoryId: lanches.id, name: "X-Salada", description: "Maionese, Queijo Cheddar, Hambúrguer 130g e Salada", price: "23.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406495/burger5.jpg", active: true },
        { categoryId: lanches.id, name: "X-Egg", description: "Maionese, Ovo, Queijo e Hambúrguer 130g", price: "25.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406493/burger1_360.jpg", active: true },
        { categoryId: lanches.id, name: "Americano", description: "Maionese, Presunto, Salada, Ovo e Queijo", price: "19.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406494/burger1_360.jpg", active: true },
        { categoryId: lanches.id, name: "X-Bacon", description: "Maionese, Hambúrguer 130g, Bacon e Queijo", price: "25.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406492/burger1_360.jpg", active: true },

        // PORÇÕES
        { categoryId: porcoes.id, name: "Batata Frita", description: "Porção de batata frita crocante com molho", price: "22.00", imageUrl: null, active: true },
        { categoryId: porcoes.id, name: "Batata com Cheddar e Bacon", description: "Porção de batata frita com cheddar derretido e bacon", price: "32.00", imageUrl: null, active: true },
        { categoryId: porcoes.id, name: "Frango Frito", description: "Porção de frango frito crocante", price: "28.00", imageUrl: null, active: true },

        // SOBREMESAS
        { categoryId: sobremesas.id, name: "Brownie de Chocolate", description: "Brownie caseiro com calda de chocolate", price: "12.00", imageUrl: null, active: true },
        { categoryId: sobremesas.id, name: "Pudim", description: "Pudim caseiro com calda de caramelo", price: "10.00", imageUrl: null, active: true },

        // REFRIGERANTES
        { categoryId: refrigerantes.id, name: "Energético Redbull", description: "Energético Redbull original 250ml", price: "16.00", imageUrl: null, active: true },
        { categoryId: refrigerantes.id, name: "Coca-cola 1L", description: "Garrafa de Coca-Cola 1 litro gelada", price: "15.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406470/COCA_1L.jpg", active: true },
        { categoryId: refrigerantes.id, name: "Dolly Guaraná 2L", description: "Guaraná Dolly 2 litros", price: "12.49", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406469/refrigerante-dolly-guarana-2000-ml-1.jpg", active: true },
        { categoryId: refrigerantes.id, name: "Refrigerantes 220ml", description: "Latinha 220ml - Coca, Guaraná, Fanta", price: "5.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406468/Lata_refri_220ml_2.jpg", active: true },
        { categoryId: refrigerantes.id, name: "Cerveja Lata", description: "Cerveja lata 350ml gelada", price: "8.00", imageUrl: "https://cdn.neemo.com.br/uploads/item/photo/406467/Cerveja_Lata_2.jpg", active: true },

        // SUCOS
        { categoryId: sucos.id, name: "Suco de Laranja", description: "Suco natural de laranja 300ml", price: "8.00", imageUrl: null, active: true },
        { categoryId: sucos.id, name: "Suco de Limão", description: "Suco natural de limão 300ml", price: "8.00", imageUrl: null, active: true },
        { categoryId: sucos.id, name: "Vitamina de Frutas", description: "Vitamina de frutas da estação 400ml", price: "12.00", imageUrl: null, active: true },
      ]);

      console.log("[seed] Database seeded with real products!");
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
      const order = await storage.createOrder(orderData as any, items as any);
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
      return res.status(404).json({ message: "Pedido não encontrado" });
    }
    res.json(order);
  });

  seedDatabase();

  return httpServer;
}
