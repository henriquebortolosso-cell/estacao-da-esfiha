import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Search, Clock, Package, Truck, PartyPopper, XCircle, ChevronRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  notes: string | null;
  productName: string;
};

type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  paymentMethod: string;
  changeFor: string | null;
  status: string;
  total: string;
  usedFreeDelivery: boolean;
  couponCode: string | null;
  discountAmount: string | null;
  createdAt: string | null;
  items: OrderItem[];
};

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: "Recebido", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
  preparing: { label: "Preparando", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
  out_for_delivery: { label: "A caminho", icon: Truck, color: "text-orange-500", bg: "bg-orange-50" },
  delivered: { label: "Entregue", icon: PartyPopper, color: "text-green-600", bg: "bg-green-50" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

const paymentLabels: Record<string, string> = {
  pix: "Pix",
  cartao_credito: "Crédito",
  cartao_debito: "Débito",
  dinheiro: "Dinheiro",
};

export default function MeusPedidos() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/history/${digits}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-lg mx-auto px-4 pt-8 pb-12">
        <h1 className="text-2xl font-black text-foreground mb-1">Meus Pedidos</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Digite seu telefone para ver o histórico de pedidos.
        </p>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10"
              data-testid="input-phone-history"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || phone.replace(/\D/g, "").length < 10}
            className="px-5 py-3 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            data-testid="btn-search-orders"
          >
            {loading ? "..." : "Buscar"}
          </button>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!loading && searched && orders && orders.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-border">
            <p className="text-muted-foreground text-sm">Nenhum pedido encontrado para este telefone.</p>
          </div>
        )}

        {!loading && orders && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              return (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="block bg-white rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
                  data-testid={`order-card-${order.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-sm font-bold text-foreground">Pedido #{order.id}</span>
                      {order.createdAt && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold", cfg.bg, cfg.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                  </div>

                  <div className="space-y-0.5 mb-2">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {item.quantity}x {item.productName}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {paymentLabels[order.paymentMethod] || order.paymentMethod}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-black text-primary text-sm">{formatCurrency(order.total)}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-primary hover:underline font-bold">
            Voltar ao cardápio
          </Link>
        </div>
      </main>
    </div>
  );
}
