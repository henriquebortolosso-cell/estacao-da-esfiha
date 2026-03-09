import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/product/ProductCard";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { useQuery } from "@tanstack/react-query";
import { Clock, Bike, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@shared/schema";

export default function Home() {
  const { data: products, isLoading } = useQuery({ queryKey: ["/api/products"] });
  const { data: categories } = useQuery({ queryKey: ["/api/categories"] });
  const { data: settings } = useQuery<StoreSettings>({ queryKey: ["/api/settings"] });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const categoryRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const navRef = useRef<HTMLDivElement | null>(null);

  const categoriesWithProducts = useMemo(() => {
    if (!products || !categories) return [];
    return (categories as any[])
      .map((cat: any) => ({
        ...cat,
        products: (products as any[]).filter((p: any) => {
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
      const top = el.getBoundingClientRect().top + window.scrollY - 130;
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
              const btn = navEl.querySelector(`[data-cat-id="${cat.id}"]`) as HTMLElement;
              if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch
      />

      {/* Store closed banner */}
      {!isOpen && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2 text-amber-800 text-sm font-medium">
            <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
            Estamos fechados no momento. Voltamos em breve!
          </div>
        </div>
      )}

      {/* Banner */}
      {settings?.bannerImageUrl && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          {settings.bannerLink ? (
            <a href={settings.bannerLink} target="_blank" rel="noopener noreferrer" data-testid="link-banner">
              <img src={settings.bannerImageUrl} alt={settings.bannerTitle || "Banner"}
                className="w-full rounded-2xl object-cover max-h-40 shadow-md hover:opacity-95 transition-opacity" />
            </a>
          ) : (
            <img src={settings.bannerImageUrl} alt={settings.bannerTitle || "Banner"}
              className="w-full rounded-2xl object-cover max-h-40 shadow-md" data-testid="img-banner" />
          )}
        </div>
      )}

      {/* Info strip */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl card-shadow px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
          <div className="flex items-center gap-1.5">
            {isOpen
              ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              : <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            }
            <span className={cn("font-semibold", isOpen ? "text-emerald-600" : "text-red-500")}>
              {isOpen ? "Aberto agora" : "Fechado"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bike className="w-4 h-4 text-primary shrink-0" />
            <span>Entrega <strong className="text-foreground">R$ {Number(deliveryFee).toFixed(2).replace(".", ",")}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <strong className="text-foreground">{estimatedMin}–{estimatedMax} min</strong>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Mín. <strong className="text-foreground">R$ {Number(minOrder).toFixed(2).replace(".", ",")}</strong></span>
          </div>
        </div>
      </div>

      {/* Category nav — sticky */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 mt-3">
        <div ref={navRef} className="max-w-5xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {isLoading
            ? [1,2,3,4].map(i => <div key={i} className="h-8 w-24 bg-white rounded-full animate-pulse shrink-0" />)
            : categoriesWithProducts.map((cat: any) => (
              <button
                key={cat.id}
                data-cat-id={cat.id}
                data-testid={`button-category-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all",
                  activeCategory === cat.id
                    ? "bg-[#1C1917] text-white shadow-md"
                    : "bg-white text-muted-foreground card-shadow hover:text-foreground hover:shadow-md"
                )}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Products */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-10">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-stone-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 bg-stone-100 rounded-full w-3/4" />
                  <div className="h-3 bg-stone-100 rounded-full w-full" />
                  <div className="h-3 bg-stone-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : categoriesWithProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-foreground font-semibold">Nada encontrado</p>
            <p className="text-muted-foreground text-sm mt-1">Tente outro termo de busca</p>
          </div>
        ) : (
          categoriesWithProducts.map((cat: any) => (
            <section
              key={cat.id}
              ref={el => { categoryRefs.current[cat.id] = el; }}
              data-testid={`section-category-${cat.id}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-extrabold text-base text-foreground tracking-tight">{cat.name}</h2>
                <span className="text-xs text-muted-foreground bg-white card-shadow rounded-full px-2.5 py-0.5 font-medium">
                  {cat.products.length} {cat.products.length === 1 ? "item" : "itens"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cat.products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <FloatingCartBar />
    </div>
  );
}
