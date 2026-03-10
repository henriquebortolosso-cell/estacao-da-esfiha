import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProductCard } from "@/components/product/ProductCard";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { useQuery } from "@tanstack/react-query";
import { Clock, Bike, ChevronRight, ChevronLeft, Star, MapPin, Flame } from "lucide-react";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
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
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      isProgrammaticScroll.current = true;
      if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);
      programmaticScrollTimer.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 1000);
      const OFFSET = 124;
      const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const scrollRow = (catId: number, dir: "left" | "right") => {
    const row = rowRefs.current[catId];
    if (row) row.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;
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
              if (btn) {
                const navRect = navEl.getBoundingClientRect();
                const btnRect = btn.getBoundingClientRect();
                if (btnRect.left < navRect.left || btnRect.right > navRect.right) {
                  btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                }
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

  const isOpen = settings?.isOpen ?? true;
  const estimatedMin = settings?.estimatedTimeMin ?? 10;
  const estimatedMax = settings?.estimatedTimeMax ?? 60;
  const deliveryFee = settings?.deliveryFee ?? "5.00";
  const heroImage = settings?.heroImageUrl || heroFallback;
  const hasBanner = settings?.bannerImageUrl;
  const ratingScore = (settings as any)?.ratingScore;
  const ratingText = (settings as any)?.ratingText;
  const address = (settings as any)?.address;

  return (
    <div className="min-h-screen bg-[#F6F6F6] pb-28">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} showSearch />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative w-full h-[360px] sm:h-[460px] overflow-hidden bg-black">
        <img src={heroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-70" />
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
            {ratingScore && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 text-xs font-bold tracking-wide">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                {ratingScore}{ratingText ? ` · ${ratingText}` : ""}
              </div>
            )}
            {address && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 text-xs font-medium tracking-wide max-w-xs">
                <MapPin className="w-3.5 h-3.5 text-[#D21033] shrink-0" />
                <span className="truncate">{address}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Banner clicável ──────────────────────────── */}
      {hasBanner && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          {settings?.bannerLink ? (
            <a href={settings.bannerLink} target="_blank" rel="noopener noreferrer" data-testid="link-banner">
              <div className="relative overflow-hidden group border-l-4 border-[#D21033]">
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
            <div className="relative overflow-hidden border-l-4 border-[#D21033]">
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

      {/* ── Category Nav ─────────────────────────────── */}
      {categoriesWithProducts.length > 0 && (
        <div className="sticky top-16 z-40 bg-black border-b border-white/10">
          <div ref={navRef} className="max-w-6xl mx-auto flex gap-0 overflow-x-auto no-scrollbar">
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
      <main className="mt-8 space-y-10 pb-4">
        {isLoading ? (
          <div className="px-4 max-w-6xl mx-auto flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white animate-pulse h-52 w-40 shrink-0" />
            ))}
          </div>
        ) : categoriesWithProducts.length === 0 ? (
          <div className="text-center py-20 px-4">
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
              <div className="flex items-center justify-between px-4 max-w-6xl mx-auto mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-7 shrink-0 ${cat.name.toUpperCase().includes("PROMO") ? "bg-gradient-to-b from-[#D21033] to-orange-500" : "bg-[#D21033]"}`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      {cat.name.toUpperCase().includes("PROMO") && (
                        <Flame className="w-4 h-4 text-[#D21033]" />
                      )}
                      <h2 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-none">{cat.name}</h2>
                    </div>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{cat.products.length} {cat.products.length === 1 ? "item" : "itens"}</p>
                  </div>
                </div>
                {/* Scroll arrows (desktop) */}
                <div className="hidden sm:flex gap-1">
                  <button
                    onClick={() => scrollRow(cat.id, "left")}
                    className="w-8 h-8 bg-black text-white flex items-center justify-center hover:bg-[#D21033] transition-colors"
                    aria-label="Rolar esquerda"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollRow(cat.id, "right")}
                    className="w-8 h-8 bg-black text-white flex items-center justify-center hover:bg-[#D21033] transition-colors"
                    aria-label="Rolar direita"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal scroll row */}
              <div
                ref={el => { rowRefs.current[cat.id] = el; }}
                className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2 scroll-smooth"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {/* Left padding sentinel */}
                <div className="shrink-0 w-0 max-w-6xl mx-auto" />
                {cat.products.map((product: any) => (
                  <div
                    key={product.id}
                    className="shrink-0 w-[190px] sm:w-[220px]"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <ProductCard product={product} isPromo={cat.name.toUpperCase().includes("PROMO")} />
                  </div>
                ))}
                {/* Right padding */}
                <div className="shrink-0 w-2" />
              </div>
            </div>
          ))
        )}
      </main>

      <FloatingCartBar />
      <WhatsAppButton />
    </div>
  );
}
