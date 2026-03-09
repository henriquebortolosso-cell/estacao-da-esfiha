import { Plus } from "lucide-react";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-2xl p-4 food-card-hover border border-border/50 flex gap-4 h-full relative overflow-hidden group">
      
      {/* Content Side */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-base text-foreground leading-tight mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {product.description || "Sem descrição."}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-foreground">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>

      {/* Image Side - Placeholders as requested */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-muted rounded-xl relative overflow-hidden flex items-center justify-center group-hover:opacity-90 transition-opacity">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-muted-foreground/50 font-medium">Sem foto</span>
        )}
        
        {/* Add Button overlapping image */}
        <button 
          onClick={() => addItem(product)}
          className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-tl-xl rounded-br-xl flex items-center justify-center shadow-lg hover:bg-primary/90 active:bg-primary/80 transition-colors"
          aria-label="Adicionar ao carrinho"
        >
          <Plus className="w-5 h-5 mb-2 mr-2" />
        </button>
      </div>
    </div>
  );
}
