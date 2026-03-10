import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/product/ProductCard";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { useQuery } from "@tanstack/react-query";
import { Clock, Bike, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@shared/schema";
import heroFallback from "@assets/ogImage.jpg";

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
      // header (64px) + category nav (~44px) + gap (16px)
      const OFFSET = 124;
      const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = 124;
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
  const deliveryFee = settings?.deliveryFee ?? "5.00";
  const heroImage = settings?.heroImageUrl || heroFallback;
  const storyTitle = settings?.storyTitle || "Nossa História";
  const storyText = settings?.storyText;
  const hasBanner = settings?.bannerImageUrl;

  return (
    <div className="min-h-screen bg-[#F6F6F6] pb-28">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} showSearch />

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative w-full h-[360px] sm:h-[460px] overflow-hidden bg-black">
        <img
          src={heroImage}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 max-w-6xl mx-auto">
          <div className="inline-block bg-[#D21033] px-3 py-1 mb-3 w-fit">
            <span className="text-white text-xs font-black uppercase tracking-widest">
              {isOpen ? "🟢 Aberto agora" : "🔴 Fechado"}
            </span>
          </div>
          <h1 className="text-white font-black text-4xl sm:text-6xl uppercase leading-none tracking-tight">
            {settings?.storeName || "Estação da Esfiha"}
          </h1>
          {settings?.storeDescription && (
            <p className="text-white/70 text-sm sm:text-base mt-2 max-w-md font-medium">
              {settings.storeDescription}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-5">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-[#D21033]" />
              {estimatedMin}–{estimatedMax} min
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
              <Bike className="w-3.5 h-3.5 text-[#D21033]" />
              {Number(deliveryFee) === 0 ? "Entrega grátis" : `Taxa R$ ${Number(deliveryFee).toFixed(2).replace(".", ",")}`}
            </div>
          </div>
        </div>
      </section>

      {/* ── Banner clicável ─────────────────────────── */}
      {hasBanner && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          {settings?.bannerLink ? (
            <a href={settings.bannerLink} target="_blank" rel="noopener noreferrer" data-testid="link-banner">
              <div className="relative rounded-none overflow-hidden group border-l-4 border-[#D21033]">
                <img src={settings.bannerImageUrl!} alt={settings?.bannerTitle || "Promoção"} className="w-full h-40 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                {settings?.bannerTitle && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 flex items-center justify-between">
                    <span className="text-white font-black uppercase text-sm tracking-wide">{settings.bannerTitle}</span>
                    <ChevronRight className="text-[#D21033] w-5 h-5" />
                  </div>
                )}
              </div>
            </a>
          ) : (
            <div className="relative rounded-none overflow-hidden border-l-4 border-[#D21033]">
              <img src={settings?.bannerImageUrl!} alt={settings?.bannerTitle || "Banner"} className="w-full h-40 sm:h-56 object-cover" />
              {settings?.bannerTitle && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                  <span className="text-white font-black uppercase text-sm tracking-wide">{settings.bannerTitle}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Nossa História ───────────────────────────── */}
      {storyText && (
        <section className="max-w-6xl mx-auto px-4 mt-8">
          <div className="bg-[#D21033] p-8 sm:p-12 relative overflow-hidden">
            {/* decorative */}
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#b01029] rounded-full opacity-40" />
            <div className="absolute -right-2 bottom-4 w-20 h-20 bg-[#b01029] rounded-full opacity-30" />

            <div className="relative z-10 max-w-2xl">
              <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em] mb-2">Conheça a gente</p>
              <h2 className="text-white font-black text-3xl sm:text-4xl uppercase leading-tight mb-4">
                {storyTitle}
              </h2>
              <div className="w-12 h-1 bg-white mb-5" />
              <p className="text-white/90 text-base sm:text-lg leading-relaxed font-medium whitespace-pre-line">
                {storyText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Category Nav ─────────────────────────────── */}
      {categoriesWithProducts.length > 0 && (
        <div className="sticky top-16 z-40 bg-black border-b border-white/10">
          <div
            ref={navRef}
            className="max-w-6xl mx-auto flex gap-0 overflow-x-auto no-scrollbar"
          >
            {categoriesWithProducts.map((cat: any) => (
              <button
                key={cat.id}
                data-cat-id={cat.id}
                data-testid={`button-category-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  "shrink-0 px-4 py-3.5 text-xs font-black uppercase tracking-wide transition-all border-b-2 whitespace-nowrap",
                  activeCategory === cat.id || (activeCategory === null && categoriesWithProducts[0]?.id === cat.id)
                    ? "text-white border-[#D21033]"
                    : "text-white/50 border-transparent hover:text-white/80 hover:border-white/20"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Products ─────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-10">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white animate-pulse h-52" />
            ))}
          </div>
        ) : categoriesWithProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-black text-gray-800 uppercase">Nenhum resultado</p>
            <p className="text-gray-500 mt-2 text-sm">Tente buscar por outro termo</p>
          </div>
        ) : (
          categoriesWithProducts.map((cat: any) => (
            <div
              key={cat.id}
              ref={el => { categoryRefs.current[cat.id] = el; }}
              data-testid={`section-category-${cat.id}`}
            >
              {/* Section header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-1 h-8 bg-[#D21033] shrink-0" />
                <div>
                  <h2 className="font-black text-xl uppercase tracking-tight text-gray-900">{cat.name}</h2>
                  <p className="text-xs text-gray-400 font-semibold">{cat.products.length} {cat.products.length === 1 ? "item" : "itens"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
