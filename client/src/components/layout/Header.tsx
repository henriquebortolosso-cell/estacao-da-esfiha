import { ShoppingBag, Search, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Link, useLocation } from "wouter";
import logoUrl from "/logo.webp";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (v: string) => void;
  showSearch?: boolean;
}

export function Header({ searchQuery, onSearchChange, showSearch }: HeaderProps) {
  const { itemCount, total } = useCart();
  const [location] = useLocation();
  const isCheckout = location === "/checkout";
  const isSuccess = location.startsWith("/order/");

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b-4 border-[#D21033]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img src={logoUrl} alt="Estação da Esfiha" className="h-9 w-9 rounded-lg object-cover" />
          <div className="hidden sm:block leading-none">
            <p className="text-white font-black text-sm uppercase tracking-wide">Estação da</p>
            <p className="text-[#D21033] font-black text-sm uppercase tracking-wide">Esfiha</p>
          </div>
        </Link>

        {/* Search */}
        {showSearch && onSearchChange && (
          <div className="flex-1 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar no cardápio..."
              data-testid="input-search"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 pl-9 pr-9 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D21033]/60 focus:border-[#D21033]/60 transition-all"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Cart */}
        <div className="ml-auto shrink-0">
          {!isCheckout && !isSuccess && (
            <Link href="/checkout" data-testid="link-cart"
              className="flex items-center gap-2.5 bg-[#D21033] hover:bg-[#b01029] text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-[#D21033] text-[9px] font-black h-4 min-w-[16px] px-0.5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {itemCount > 0 ? `R$ ${Number(total).toFixed(2).replace(".", ",")}` : "Carrinho"}
              </span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
