import { useRoute, Link } from "wouter";
import { useState, useEffect } from "react";
import { MapPin, Receipt, Clock, ChevronRight, Phone, Package, Truck, PartyPopper } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useOrder } from "@/hooks/use-orders";
import { formatCurrency, cn } from "@/lib/utils";

const paymentLabels: Record<string, string> = {
  pix: "Pix",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  dinheiro: "Dinheiro",
};

const ORDER_STATUSES = ["pending", "preparing", "out_for_delivery", "delivered"] as const;

const statusConfig: Record<string, { label: string; description: string; icon: typeof Clock; color: string }> = {
  pending: {
    label: "Pedido Recebido",
    description: "Seu pedido foi recebido e está aguardando confirmação.",
    icon: Clock,
    color: "text-yellow-500",
  },
  preparing: {
    label: "Preparando",
    description: "Seu pedido está sendo preparado com carinho!",
    icon: Package,
    color: "text-blue-500",
  },
  out_for_delivery: {
    label: "Saiu para Entrega",
    description: "Seu pedido está a caminho! Fique atento.",
    icon: Truck,
    color: "text-orange-500",
  },
  delivered: {
    label: "Entregue",
    description: "Pedido entregue! Obrigado pela preferência.",
    icon: PartyPopper,
    color: "text-green-500",
  },
};

export default function OrderSuccess() {
  const [, params] = useRoute("/order/:id");
  const orderId = params ? parseInt(params.id, 10) : null;
  const { data: order, isLoading } = useOrder(orderId);

  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, { credentials: "include" });
        if (res.ok && active) {
          const data = await res.json();
          setLiveStatus(data.status);
        }
      } catch {
        // ignore polling errors
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Pedido não encontrado</h2>
          <Link href="/" className="text-primary hover:underline font-medium text-sm">Voltar ao Início</Link>
        </div>
      </div>
    );
  }

  const currentStatus = liveStatus || order.status;
  const currentStepIndex = ORDER_STATUSES.indexOf(currentStatus as typeof ORDER_STATUSES[number]);
  const config = statusConfig[currentStatus] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />

      <main className="max-w-lg mx-auto px-4 pt-8">

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-opacity-10", config.color)}>
            <StatusIcon className={cn("w-8 h-8", config.color)} />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-1">
            {currentStatus === "delivered" ? "Pedido Entregue!" : "Pedido Confirmado!"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Olá, <strong className="text-foreground">{order.customerName.split(' ')[0]}</strong>! Pedido <strong className="text-foreground">#{order.id}</strong>
          </p>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-xl border border-border p-5 mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-primary inline-block rounded" />
            Acompanhe seu Pedido
          </h3>

          <div className="space-y-0">
            {ORDER_STATUSES.map((status, idx) => {
              const stepConfig = statusConfig[status];
              const StepIcon = stepConfig.icon;
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isCurrent ? "bg-primary ring-4 ring-primary/20" :
                      isActive ? "bg-primary" : "bg-gray-200"
                    )}>
                      <StepIcon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-400")} />
                    </div>
                    {idx < ORDER_STATUSES.length - 1 && (
                      <div className={cn(
                        "w-0.5 h-8 transition-all",
                        idx < currentStepIndex ? "bg-primary" : "bg-gray-200"
                      )} />
                    )}
                  </div>

                  <div className={cn("pb-4", isCurrent ? "pt-0.5" : "pt-1")}>
                    <p className={cn(
                      "text-sm font-bold transition-all",
                      isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-gray-400"
                    )}>
                      {stepConfig.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground mt-0.5">{stepConfig.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {currentStatus !== "delivered" && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">Atualiza automaticamente a cada 10 segundos</p>
          )}
        </div>

        <div className="space-y-3">

          {/* Delivery */}
          <div className="bg-white rounded-xl p-4 border border-border flex items-start gap-3">
            <div className="bg-muted p-2.5 rounded-full shrink-0">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-0.5">Endereço de Entrega</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl p-4 border border-border flex items-start gap-3">
            <div className="bg-muted p-2.5 rounded-full shrink-0">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-0.5">Contato</h3>
              <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            </div>
          </div>

          {/* Payment + Total */}
          <div className="bg-white rounded-xl p-4 border border-border flex items-start gap-3">
            <div className="bg-muted p-2.5 rounded-full shrink-0">
              <Receipt className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-foreground mb-0.5">Pagamento na Entrega</h3>
                <p className="text-sm text-muted-foreground">
                  {paymentLabels[order.paymentMethod] || order.paymentMethod}
                  {order.changeFor && ` · Troco para ${formatCurrency(order.changeFor)}`}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-xs text-muted-foreground">Total</span>
                <span className="font-black text-lg text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg text-sm"
            data-testid="link-new-order"
          >
            Fazer novo pedido
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/meus-pedidos"
            className="text-xs text-muted-foreground hover:text-primary font-bold transition-colors"
            data-testid="link-order-history"
          >
            Ver meus pedidos anteriores
          </Link>
        </div>

      </main>
    </div>
  );
}
