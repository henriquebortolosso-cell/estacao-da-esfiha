import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";

export function FloatingCartBar() {
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 z-40">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/checkout"
          data-testid="link-floating-cart"
          className="w-full bg-primary text-white rounded-xl p-3.5 flex items-center justify-between shadow-xl shadow-primary/30"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg w-9 h-9 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xs text-white/80">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
              <span className="text-sm font-bold">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 font-bold text-sm">
            Ver carrinho
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
