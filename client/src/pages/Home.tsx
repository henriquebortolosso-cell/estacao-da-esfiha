import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/product/ProductCard";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Search, Clock, Bike, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const categoryRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const navRef = useRef<HTMLDivElement | null>(null);

  const categoriesWithProducts = useMemo(() => {
    if (!products || !categories) return [];
    return categories
      .map((cat: any) => ({
        ...cat,
        products: products.filter((p: any) => {
          const matchesCat = p.categoryId === cat.id;
          const matchesSearch = searchQuery === "" ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCat && matchesSearch;
        }),
      }))
      .filter((cat: any) => cat.products.length > 0);
  }, [products, categories, searchQuery]);

  const scrollToCategory = (categoryId: number) => {
    setActiveCategory(categoryId);
    const el = categoryRefs.current[categoryId];
    if (el) {
      const offset = 120;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Highlight active category on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offset = 160;
      for (const cat of categoriesWithProducts) {
        const el = categoryRefs.current[cat.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom > offset) {
            setActiveCategory(cat.id);
            // Scroll the nav pill into view
            const navEl = navRef.current;
            if (navEl) {
              const activeBtn = navEl.querySelector(`[data-cat-id="${cat.id}"]`) as HTMLElement;
              if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }
            }
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categoriesWithProducts]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />

      {/* Info Bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Bike className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Entrega</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            <span>Hoje · <strong className="text-foreground">10–60 min</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Pedido mínimo <strong className="text-foreground">R$ 15,00</strong></span>
          </div>
          <div className="ml-auto text-xs text-muted-foreground hidden md:block">
            Após 10 pedidos, o próximo o frete é por nossa conta!
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="search"
            data-testid="input-search"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Category Nav - sticky */}
      <div className="sticky top-14 z-40 bg-white border-b border-border shadow-sm">
        <div
          ref={navRef}
          className="flex gap-0 overflow-x-auto no-scrollbar"
        >
          {isLoading
            ? [1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-28 bg-muted animate-pulse mx-1 my-1.5 rounded" />
              ))
            : categoriesWithProducts.map((cat: any) => (
                <button
                  key={cat.id}
                  data-cat-id={cat.id}
                  data-testid={`button-category-${cat.id}`}
                  onClick={() => scrollToCategory(cat.id)}
                  className={cn(
                    "px-4 py-3 text-xs font-bold whitespace-nowrap shrink-0 border-b-2 transition-all",
                    activeCategory === cat.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {cat.name}
                </button>
              ))}
        </div>
      </div>

      {/* Products grouped by category */}
      <main className="max-w-5xl mx-auto px-4 pt-4 space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-28 bg-white rounded-lg border border-border p-4 flex gap-3 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-20 h-20 bg-muted rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        ) : categoriesWithProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        ) : (
          categoriesWithProducts.map((cat: any) => (
            <div
              key={cat.id}
              ref={(el) => { categoryRefs.current[cat.id] = el; }}
              data-testid={`section-category-${cat.id}`}
            >
              <h2 className="text-base font-bold text-foreground mb-3 uppercase tracking-wide">
                {cat.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      <FloatingCartBar />
    </div>
  );
}
