import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";

export function FloatingCartBar() {
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-40 animate-slide-up">
      <Link 
        href="/checkout"
        className="w-full bg-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-white/90">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </span>
            <span className="text-base font-bold">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 font-semibold text-sm">
          Ver carrinho
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>
    </div>
  );
}
