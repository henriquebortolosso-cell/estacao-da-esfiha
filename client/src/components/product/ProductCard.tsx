import { useState } from "react";
import { Plus, Minus, X, ShoppingBag } from "lucide-react";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");

  const cartItem = items.find(i => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem(product, 1, notes);
    setNotes("");
    setShowModal(false);
  };

  return (
    <>
      <div
        data-testid={`card-product-${product.id}`}
        onClick={() => setShowModal(true)}
        className="bg-white rounded-2xl card-shadow hover:card-shadow-hover transition-all cursor-pointer overflow-hidden flex flex-col group"
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <ShoppingBag className="w-6 h-6 text-stone-300" />
              <span className="text-[10px] text-stone-400">Sem foto</span>
            </div>
          )}
          {quantity > 0 && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              {quantity}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col p-3 gap-1.5">
          <h3 className="font-bold text-sm text-foreground leading-snug">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">{product.description}</p>
          )}

          <div className="flex items-center justify-between mt-1">
            <span className="font-extrabold text-sm text-foreground">{formatCurrency(product.price)}</span>

            {quantity === 0 ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors shrink-0"
                data-testid={`button-add-${product.id}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <div
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 bg-primary/10 rounded-xl px-2 py-1"
              >
                <button
                  onClick={() => quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)}
                  className="text-primary"
                  data-testid={`button-decrease-${product.id}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-primary text-xs font-black w-4 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="text-primary"
                  data-testid={`button-increase-${product.id}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
          onClick={() => { setShowModal(false); setNotes(""); }}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative h-52 bg-stone-100">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-stone-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <button
                onClick={() => { setShowModal(false); setNotes(""); }}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold text-foreground">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{product.description}</p>
                  )}
                </div>
                <div className="bg-primary/10 text-primary font-extrabold text-base rounded-xl px-3 py-1.5 shrink-0">
                  {formatCurrency(product.price)}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Alguma observação?</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: sem cebola, bem passado..."
                  maxLength={200}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <button
                onClick={handleAdd}
                data-testid={`button-confirm-add-${product.id}`}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl flex items-center justify-between px-5 transition-colors shadow-lg shadow-primary/25"
              >
                <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-black">1×</span>
                <span className="text-base">Adicionar ao carrinho</span>
                <span className="font-black">{formatCurrency(product.price)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
