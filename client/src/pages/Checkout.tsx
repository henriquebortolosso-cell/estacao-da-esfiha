import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus, Minus, MapPin, CreditCard, User, FileText, CheckCircle2 } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { useCart } from "@/lib/cart";
import { formatCurrency, parseDecimal, cn } from "@/lib/utils";
import { useCreateOrder } from "@/hooks/use-orders";

// Zod Schema for Checkout Form
const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nome é obrigatório"),
  customerPhone: z.string().min(10, "Telefone inválido"),
  street: z.string().min(2, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "UF deve ter 2 letras"),
  zip: z.string().min(8, "CEP inválido"),
  paymentMethod: z.enum(["dinheiro", "cartao_credito", "cartao_debito", "pix"]),
  changeFor: z.string().optional(),
}).refine(data => {
  if (data.paymentMethod === 'dinheiro') {
    return !!data.changeFor && parseFloat(data.changeFor.replace(',', '.')) > 0;
  }
  return true;
}, {
  message: "Informe o valor do troco",
  path: ["changeFor"]
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total, clearCart } = useCart();
  const createOrder = useCreateOrder();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultState: {
      paymentMethod: "pix"
    }
  });

  const selectedPayment = watch("paymentMethod");

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Seu carrinho está vazio</h2>
          <p className="text-muted-foreground mb-8">
            Volte ao cardápio e adicione algumas delícias!
          </p>
          <button 
            onClick={() => setLocation("/")}
            className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-soft hover:bg-primary/90 transition-colors"
          >
            Ver Cardápio
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = (data: CheckoutFormData) => {
    // Format address into a single string for the DB
    const fullAddress = `${data.street}, ${data.number} - ${data.neighborhood}, ${data.city} - ${data.state}, CEP: ${data.zip}`;
    
    // Prepare payload
    const payload = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryAddress: fullAddress,
      paymentMethod: data.paymentMethod,
      changeFor: data.paymentMethod === 'dinheiro' && data.changeFor ? parseDecimal(data.changeFor.replace(',', '.')) : null,
      total: parseDecimal(total),
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: typeof item.product.price === 'string' ? item.product.price : parseDecimal(item.product.price),
        notes: item.notes || null
      }))
    };

    createOrder.mutate(payload, {
      onSuccess: (result) => {
        clearCart();
        setLocation(`/order/${result.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Finalizar Pedido</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          
          {/* Form Fields (Left Column on Desktop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Seção Dados Pessoais */}
            <section className="bg-white rounded-2xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Dados Pessoais</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nome Completo</label>
                  <input 
                    {...register("customerName")}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      errors.customerName ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                    )}
                    placeholder="Ex: João da Silva"
                  />
                  {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">WhatsApp / Telefone</label>
                  <input 
                    {...register("customerPhone")}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      errors.customerPhone ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                    )}
                    placeholder="(00) 00000-0000"
                  />
                  {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
                </div>
              </div>
            </section>

            {/* Seção Endereço */}
            <section className="bg-white rounded-2xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Endereço de Entrega</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Rua/Avenida</label>
                    <input 
                      {...register("street")}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-background border",
                        errors.street ? "border-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                    {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Número</label>
                    <input 
                      {...register("number")}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-background border",
                        errors.number ? "border-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                    {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Bairro</label>
                    <input 
                      {...register("neighborhood")}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-background border",
                        errors.neighborhood ? "border-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">CEP</label>
                    <input 
                      {...register("zip")}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-background border",
                        errors.zip ? "border-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Cidade</label>
                    <input 
                      {...register("city")}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-background border",
                        errors.city ? "border-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">UF</label>
                    <input 
                      {...register("state")}
                      placeholder="SP"
                      maxLength={2}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl bg-background border uppercase",
                        errors.state ? "border-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Seção Pagamento */}
            <section className="bg-white rounded-2xl p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Forma de Pagamento (na entrega)</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "pix", label: "Pix" },
                  { id: "cartao_credito", label: "Cartão de Crédito" },
                  { id: "cartao_debito", label: "Cartão de Débito" },
                  { id: "dinheiro", label: "Dinheiro" },
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={cn(
                      "flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all text-sm font-medium text-center",
                      selectedPayment === method.id 
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20" 
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    <input 
                      type="radio" 
                      value={method.id} 
                      {...register("paymentMethod")} 
                      className="sr-only" 
                    />
                    {method.label}
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="text-xs text-destructive mt-2">{errors.paymentMethod.message}</p>}

              {/* Condicional: Troco para Dinheiro */}
              {selectedPayment === 'dinheiro' && (
                <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border space-y-2 animate-fade-in">
                  <label className="text-sm font-medium text-foreground">Troco para quanto?</label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">R$</span>
                    <input 
                      {...register("changeFor")}
                      placeholder="Ex: 50,00"
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl bg-white border",
                        errors.changeFor ? "border-destructive" : "border-border focus:border-primary"
                      )}
                    />
                  </div>
                  {errors.changeFor && <p className="text-xs text-destructive">{errors.changeFor.message}</p>}
                </div>
              )}
            </section>
          </div>

          {/* Order Summary (Right Column on Desktop, Bottom on Mobile) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-2xl shadow-soft border border-border/50 sticky top-24 overflow-hidden flex flex-col">
              
              <div className="p-5 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Resumo do Pedido</h2>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[40vh] space-y-4 no-scrollbar">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">
                        {item.quantity}x {item.product.name}
                      </h4>
                      <div className="text-xs font-semibold text-primary mt-1">
                        {formatCurrency((typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price) * item.quantity)}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-muted px-2 py-1 rounded-lg h-9 shrink-0 border border-border/50">
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4" />}
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="p-5 bg-muted/10 border-t border-border/50 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxa de Entrega</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || createOrder.isPending}
                  className="w-full mt-4 py-4 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isSubmitting || createOrder.isPending ? (
                    <span className="animate-pulse">Processando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirmar Pedido
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
          
        </form>
      </main>
    </div>
  );
}

// Re-export ShoppingBag for the empty state
import { ShoppingBag } from "lucide-react";
