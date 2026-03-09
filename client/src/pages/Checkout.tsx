import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus, Minus, MapPin, CreditCard, User, FileText, CheckCircle2, ShoppingBag } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { useCart } from "@/lib/cart";
import { formatCurrency, parseDecimal, cn } from "@/lib/utils";
import { useCreateOrder } from "@/hooks/use-orders";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nome é obrigatório"),
  customerPhone: z.string().min(10, "Telefone inválido"),
  street: z.string().min(2, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "UF deve ter 2 letras"),
  zip: z.string().min(8, "CEP inválido"),
  paymentMethod: z.enum(["dinheiro", "cartao_credito", "cartao_debito", "pix"]),
  changeFor: z.string().optional(),
}).refine(data => {
  if (data.paymentMethod === 'dinheiro') {
    if (!data.changeFor) return true;
    return true;
  }
  return true;
}, {
  message: "Informe o valor do troco",
  path: ["changeFor"]
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const paymentIcons: Record<string, string> = {
  pix: "💠",
  cartao_credito: "💳",
  cartao_debito: "💳",
  dinheiro: "💵",
};

const paymentLabels: Record<string, string> = {
  pix: "Pix",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  dinheiro: "Dinheiro",
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total, clearCart } = useCart();
  const createOrder = useCreateOrder();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "pix"
    }
  });

  const selectedPayment = watch("paymentMethod");

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Seu carrinho está vazio</h2>
          <p className="text-muted-foreground mb-8 text-sm">
            Volte ao cardápio e adicione algumas delícias!
          </p>
          <button
            onClick={() => setLocation("/")}
            className="px-8 py-3 bg-primary text-white font-bold rounded-lg"
            data-testid="button-go-menu"
          >
            Ver Cardápio
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = (data: CheckoutFormData) => {
    const fullAddress = `${data.street}, ${data.number}${data.complement ? ` - ${data.complement}` : ''} - ${data.neighborhood}, ${data.city} - ${data.state}, CEP: ${data.zip}`;

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

  const inputClass = (hasError?: boolean) => cn(
    "w-full px-3 py-2.5 rounded-lg bg-white border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
    hasError ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-5">
        <h1 className="text-xl font-bold text-foreground mb-5">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Formulário - coluna esquerda */}
          <div className="lg:col-span-7 space-y-4">

            {/* Dados Pessoais */}
            <section className="bg-white rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Dados Pessoais</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Nome Completo</label>
                  <input
                    {...register("customerName")}
                    className={inputClass(!!errors.customerName)}
                    placeholder="Ex: João da Silva"
                    data-testid="input-name"
                  />
                  {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">WhatsApp / Telefone</label>
                  <input
                    {...register("customerPhone")}
                    type="tel"
                    inputMode="numeric"
                    className={inputClass(!!errors.customerPhone)}
                    placeholder="(11) 98765-4321"
                    data-testid="input-phone"
                  />
                  {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
                </div>
              </div>
            </section>

            {/* Endereço */}
            <section className="bg-white rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Endereço de Entrega</h2>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-foreground">Rua/Avenida</label>
                    <input
                      {...register("street")}
                      className={inputClass(!!errors.street)}
                      placeholder="Ex: Rua das Flores"
                      data-testid="input-street"
                    />
                    {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Número</label>
                    <input
                      {...register("number")}
                      className={inputClass(!!errors.number)}
                      placeholder="123"
                      data-testid="input-number"
                    />
                    {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Complemento <span className="text-muted-foreground font-normal">(opcional)</span></label>
                  <input
                    {...register("complement")}
                    className={inputClass()}
                    placeholder="Apto, Bloco, etc."
                    data-testid="input-complement"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Bairro</label>
                    <input
                      {...register("neighborhood")}
                      className={inputClass(!!errors.neighborhood)}
                      placeholder="Ex: Centro"
                      data-testid="input-neighborhood"
                    />
                    {errors.neighborhood && <p className="text-xs text-destructive">{errors.neighborhood.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">CEP</label>
                    <input
                      {...register("zip")}
                      type="text"
                      inputMode="numeric"
                      className={inputClass(!!errors.zip)}
                      placeholder="12345-678"
                      data-testid="input-zip"
                    />
                    {errors.zip && <p className="text-xs text-destructive">{errors.zip.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-foreground">Cidade</label>
                    <input
                      {...register("city")}
                      className={inputClass(!!errors.city)}
                      placeholder="Ex: São Paulo"
                      data-testid="input-city"
                    />
                    {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">UF</label>
                    <input
                      {...register("state")}
                      placeholder="SP"
                      maxLength={2}
                      className={cn(inputClass(!!errors.state), "uppercase")}
                      data-testid="input-state"
                    />
                    {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Pagamento */}
            <section className="bg-white rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Forma de Pagamento <span className="text-muted-foreground font-normal">(na entrega)</span></h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(["pix", "cartao_credito", "cartao_debito", "dinheiro"] as const).map((method) => (
                  <label
                    key={method}
                    className={cn(
                      "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-sm font-medium",
                      selectedPayment === method
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:border-primary/40"
                    )}
                    data-testid={`label-payment-${method}`}
                  >
                    <input
                      type="radio"
                      value={method}
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <span>{paymentIcons[method]}</span>
                    <span>{paymentLabels[method]}</span>
                  </label>
                ))}
              </div>

              {selectedPayment === 'dinheiro' && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Troco para quanto? <span className="text-muted-foreground font-normal">(opcional)</span></label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium">R$</span>
                    <input
                      {...register("changeFor")}
                      placeholder="50,00"
                      inputMode="decimal"
                      className={inputClass(!!errors.changeFor)}
                      data-testid="input-change-for"
                    />
                  </div>
                  {errors.changeFor && <p className="text-xs text-destructive">{errors.changeFor.message}</p>}
                </div>
              )}
            </section>
          </div>

          {/* Resumo do Pedido - coluna direita */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-border sticky top-24 overflow-hidden">

              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Resumo do Pedido</h2>
              </div>

              {/* Itens */}
              <div className="divide-y divide-border max-h-60 overflow-y-auto">
                {items.map((item) => {
                  const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
                  return (
                    <div key={item.product.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.product.name}</p>
                        {item.notes && <p className="text-xs text-muted-foreground truncate">{item.notes}</p>}
                        <p className="text-xs text-primary font-bold mt-0.5">{formatCurrency(price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => item.quantity === 1 ? removeItem(item.product.id) : updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                          data-testid={`button-decrease-checkout-${item.product.id}`}
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                          data-testid={`button-increase-checkout-${item.product.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totais */}
              <div className="px-4 py-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxa de Entrega</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-lg font-black text-primary">{formatCurrency(total)}</span>
                </div>

                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="w-full mt-2 py-3.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  data-testid="button-confirm-order"
                >
                  {createOrder.isPending ? (
                    <span className="animate-pulse">Processando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
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
