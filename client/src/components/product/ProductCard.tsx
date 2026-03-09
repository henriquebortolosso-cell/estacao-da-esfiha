import { useState } from "react";
import { Plus, Minus, X } from "lucide-react";
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

  const openModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <div
        data-testid={`card-product-${product.id}`}
        className="bg-white rounded-lg border border-border flex gap-3 p-3 cursor-pointer hover:border-primary/40 transition-colors relative"
        onClick={openModal}
      >
        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-bold text-sm text-foreground leading-tight mb-1">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description || ""}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-bold text-sm text-foreground">
              {formatCurrency(product.price)}
            </span>
            {quantity > 0 && (
              <div
                className="flex items-center gap-2 bg-primary rounded-full px-2 py-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)}
                  className="text-white"
                  data-testid={`button-decrease-${product.id}`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-white text-xs font-bold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="text-white"
                  data-testid={`button-increase-${product.id}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image + Add button */}
        <div className="w-20 h-20 shrink-0 relative">
          <div className="w-full h-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-[10px] text-muted-foreground text-center px-1">Sem foto</span>
            )}
          </div>
          {quantity === 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); openModal(); }}
              className="absolute -bottom-1 -right-1 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md"
              aria-label="Adicionar"
              data-testid={`button-add-${product.id}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modal de observações */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center"
          onClick={() => { setShowModal(false); setNotes(""); }}
        >
          <div
            className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product image header */}
            <div className="relative h-48 bg-muted flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-sm">Sem foto</span>
              )}
              <button
                onClick={() => { setShowModal(false); setNotes(""); }}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  )}
                </div>
                <span className="font-bold text-foreground whitespace-nowrap">
                  {formatCurrency(product.price)}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Alguma observação?
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: sem cebola, sem tomate, bem quente..."
                  maxLength={200}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <button
                onClick={handleAdd}
                data-testid={`button-confirm-add-${product.id}`}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-lg flex items-center justify-between px-4"
              >
                <span className="bg-white/20 rounded px-2 py-0.5 text-sm font-bold">1</span>
                <span>Adicionar</span>
                <span>{formatCurrency(product.price)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
