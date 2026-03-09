import { ShoppingBag, ArrowLeft, Search } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full bg-[#1C1917]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">

        {/* Left: back or logo */}
        <div className="flex items-center gap-3 shrink-0">
          {(isCheckout || isSuccess) ? (
            <Link href="/" className="p-2 -ml-1 text-white/60 hover:text-white transition-colors rounded-xl hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2.5">
              <img src={logoUrl} alt="Estação da Esfiha" className="h-9 w-9 rounded-xl object-cover" />
              <div className="hidden sm:block">
                <p className="text-white font-bold text-sm leading-tight">Estação da</p>
                <p className="text-primary font-extrabold text-sm leading-tight">Esfiha</p>
              </div>
            </Link>
          )}
        </div>

        {/* Center: search (only on home) */}
        {showSearch && onSearchChange && (
          <div className="flex-1 mx-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Buscar no cardápio..."
                data-testid="input-search"
                className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/15 transition-all"
              />
            </div>
          </div>
        )}

        {/* Right: cart */}
        <div className="ml-auto shrink-0">
          {!isCheckout && !isSuccess && (
            <Link
              href="/checkout"
              data-testid="link-cart"
              className="flex items-center gap-2.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black h-4 min-w-[16px] px-0.5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              {itemCount > 0 && (
                <span className="text-white font-bold text-xs hidden sm:block">
                  R$ {Number(total).toFixed(2).replace(".", ",")}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
