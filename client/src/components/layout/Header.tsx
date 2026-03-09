import { ShoppingBag, Menu, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Link, useLocation } from "wouter";

export function Header() {
  const { itemCount } = useCart();
  const [location] = useLocation();
  
  const isCheckout = location === "/checkout";
  const isSuccess = location.startsWith("/order/");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left side: Back button on checkout, Menu on home */}
        <div className="flex-1 flex justify-start">
          {isCheckout ? (
            <Link 
              href="/" 
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : !isSuccess ? (
            <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <Link 
              href="/" 
              className="text-sm font-medium text-primary hover:underline"
            >
              Voltar ao Início
            </Link>
          )}
        </div>

        {/* Center: Logo / Title */}
        <div className="flex-none text-center">
          <Link href="/" className="flex flex-col items-center group cursor-pointer">
            <h1 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
              Casa da Esfiha
            </h1>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">
              Delivery
            </span>
          </Link>
        </div>

        {/* Right side: Cart Icon */}
        <div className="flex-1 flex justify-end">
          {!isCheckout && !isSuccess && (
            <Link 
              href="/checkout" 
              className="relative p-2 -mr-2 text-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 animate-in zoom-in-50">
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
