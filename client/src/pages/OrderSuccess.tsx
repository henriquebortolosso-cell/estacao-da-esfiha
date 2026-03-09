import { useRoute } from "wouter";
import { CheckCircle2, MapPin, Receipt, Clock, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useOrder } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";

export default function OrderSuccess() {
  const [, params] = useRoute("/order/:id");
  const orderId = params ? parseInt(params.id, 10) : null;
  
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Pedido não encontrado</h2>
          <Link href="/" className="text-primary hover:underline font-medium">Voltar ao Início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <main className="max-w-xl mx-auto px-4 pt-10">
        
        {/* Success Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">Pedido Recebido!</h1>
          <p className="text-muted-foreground text-lg">
            Olá, {order.customerName.split(' ')[0]}! Seu pedido <span className="font-bold text-foreground">#{order.id}</span> foi confirmado.
          </p>
        </div>

        {/* Order Details Cards */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          
          {/* Status Card */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg mb-1">Preparando</h3>
              <p className="text-sm text-muted-foreground">
                Seu pedido está sendo preparado com muito carinho. Previsão de entrega: 40-50 min.
              </p>
            </div>
          </div>

          {/* Delivery Card */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex items-start gap-4">
            <div className="bg-muted p-3 rounded-full">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Endereço de Entrega</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.deliveryAddress}
              </p>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex items-start gap-4">
            <div className="bg-muted p-3 rounded-full">
              <Receipt className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-foreground mb-1">Pagamento na Entrega</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {order.paymentMethod.replace('_', ' ')}
                  {order.changeFor && ` (Troco para ${formatCurrency(order.changeFor)})`}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-xs text-muted-foreground mb-0.5">Total</span>
                <span className="font-black text-lg text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors"
          >
            Fazer novo pedido
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}
