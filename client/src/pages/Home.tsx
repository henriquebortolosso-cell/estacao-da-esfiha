import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/product/ProductCard";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, Bike, AlertCircle, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@shared/schema";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: settings } = useQuery<StoreSettings>({ queryKey: ["/api/settings"] });
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

  useEffect(() => {
    const handleScroll = () => {
      const offset = 160;
      for (const cat of categoriesWithProducts) {
        const el = categoryRefs.current[cat.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom > offset) {
            setActiveCategory(cat.id);
            const navEl = navRef.current;
            if (navEl) {
              const activeBtn = navEl.querySelector(`[data-cat-id="${cat.id}"]`) as HTMLElement;
              if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categoriesWithProducts]);

  const isOpen = settings?.isOpen ?? true;
  const estimatedMin = settings?.estimatedTimeMin ?? 10;
  const estimatedMax = settings?.estimatedTimeMax ?? 60;
  const minOrder = settings?.minOrder ?? "15.00";
  const deliveryFee = settings?.deliveryFee ?? "5.00";

  const hasBanner = settings?.bannerImageUrl;

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />

      {/* Store Status */}
      {!isOpen && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2 text-amber-800 text-sm font-medium">
            <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Estamos fechados no momento. Aceitamos pedidos em breve!</span>
          </div>
        </div>
      )}

      {/* Banner */}
      {hasBanner && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          {settings.bannerLink ? (
            <a href={settings.bannerLink} target="_blank" rel="noopener noreferrer" data-testid="link-banner">
              <img
                src={settings.bannerImageUrl!}
                alt={settings.bannerTitle || "Banner promocional"}
                className="w-full rounded-xl object-cover max-h-44 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
              />
            </a>
          ) : (
            <img
              src={settings.bannerImageUrl!}
              alt={settings.bannerTitle || "Banner promocional"}
              className="w-full rounded-xl object-cover max-h-44 shadow-sm"
              data-testid="img-banner"
            />
          )}
        </div>
      )}

      {/* Info Bar */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5">
            {isOpen
              ? <CheckCircle className="w-4 h-4 text-green-500" />
              : <XCircle className="w-4 h-4 text-red-400" />
            }
            <span className={cn("font-semibold text-sm", isOpen ? "text-green-600" : "text-red-500")}>
              {isOpen ? "Aberto agora" : "Fechado"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bike className="w-4 h-4 text-primary" />
            <span>Entrega <strong className="text-foreground">R$ {Number(deliveryFee).toFixed(2).replace(".", ",")}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span><strong className="text-foreground">{estimatedMin}–{estimatedMax} min</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Mínimo <strong className="text-foreground">R$ {Number(minOrder).toFixed(2).replace(".", ",")}</strong></span>
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
            placeholder="Buscar no cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Nav - sticky */}
      <div className="sticky top-14 z-40 bg-white border-b border-border shadow-sm">
        <div ref={navRef} className="flex gap-0 overflow-x-auto no-scrollbar">
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
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  {cat.name}
                </button>
              ))}
        </div>
      </div>

      {/* Products grouped by category */}
      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-28 bg-white rounded-xl border border-border p-4 flex gap-3 animate-pulse">
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
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum produto encontrado.</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Tente buscar por outro termo.</p>
          </div>
        ) : (
          categoriesWithProducts.map((cat: any) => (
            <div
              key={cat.id}
              ref={(el) => { categoryRefs.current[cat.id] = el; }}
              data-testid={`section-category-${cat.id}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>
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
