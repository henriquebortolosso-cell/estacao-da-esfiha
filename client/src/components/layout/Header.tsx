import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Link, useLocation } from "wouter";
import logoUrl from "/logo.webp";

export function Header() {
  const { itemCount } = useCart();
  const [location] = useLocation();
  
  const isCheckout = location === "/checkout";
  const isSuccess = location.startsWith("/order/");

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        
        {/* Left side */}
        <div className="flex items-center w-10">
          {isCheckout || isSuccess ? (
            <Link 
              href="/" 
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : (
            <div className="w-5" />
          )}
        </div>

        {/* Center: Logo */}
        <Link href="/" className="flex items-center justify-center">
          <img 
            src={logoUrl} 
            alt="Estação da Esfiha"
            className="h-10 w-10 rounded-full object-cover"
          />
        </Link>

        {/* Right side: Cart Icon */}
        <div className="flex items-center w-10 justify-end">
          {!isCheckout && !isSuccess && (
            <Link 
              href="/checkout"
              data-testid="link-cart"
              className="relative p-2 -mr-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
