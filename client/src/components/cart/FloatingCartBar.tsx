import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";

export function FloatingCartBar() {
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40 pointer-events-none">
      <div className="max-w-5xl mx-auto pointer-events-auto">
        <Link
          href="/checkout"
          data-testid="link-floating-cart"
          className="w-full bg-[#1C1917] text-white rounded-2xl py-3.5 px-4 flex items-center justify-between shadow-2xl shadow-black/30 hover:bg-[#292524] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-xl w-10 h-10 flex items-center justify-center shrink-0 relative">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-primary text-[9px] font-black h-4 min-w-[16px] px-0.5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <div>
              <p className="text-white/60 text-xs leading-none mb-0.5">
                {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
              </p>
              <p className="text-white font-extrabold text-sm leading-none">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-white/90">
            Ver carrinho
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
