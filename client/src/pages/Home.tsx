import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/product/ProductCard";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { useProducts } from "@/hooks/use-products";
import { Search } from "lucide-react";

export default function Home() {
  const { data: products, isLoading } = useProducts();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {/* Search / Hero Area */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            O que você vai pedir hoje?
          </h2>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Buscar pratos, lanches..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Menu Section */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">
            Cardápio Principal
          </h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-border/50 p-4 flex gap-4 animate-pulse">
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="w-24 h-24 bg-muted rounded-xl shrink-0"></div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-border border-dashed">
              <p className="text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </main>

      <FloatingCartBar />
    </div>
  );
}
