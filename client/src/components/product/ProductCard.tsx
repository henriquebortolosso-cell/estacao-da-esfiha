import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    addItem(product, 1, notes);
    setNotes("");
    setShowNotes(false);
  };

  return (
    <>
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
            onClick={() => setShowNotes(true)}
            className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-tl-xl rounded-br-xl flex items-center justify-center shadow-lg hover:bg-primary/90 active:bg-primary/80 transition-colors"
            aria-label="Adicionar ao carrinho"
          >
            <Plus className="w-5 h-5 mb-2 mr-2" />
          </button>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
              <button
                onClick={() => {
                  setShowNotes(false);
                  setNotes("");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Deseja adicionar observações? (opcional)</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Sem cebola, sem tomate, bem quente..."
                maxLength={200}
                className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">{notes.length}/200</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowNotes(false);
                  setNotes("");
                }}
                className="flex-1 px-4 py-3 border border-border rounded-xl font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
