import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Package, Tag, Settings, LogOut, Plus, Pencil, Trash2,
  ChevronRight, Store, Clock, Save, X, Image, ExternalLink, ToggleLeft, ToggleRight, ChefHat, ArrowUpDown, Trophy, Gift, Users, MapPin, CreditCard, MessageCircle, CheckCircle2, XCircle, PhoneCall, ClipboardList, QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Product, Category, StoreSettings } from "@shared/schema";

type Tab = "overview" | "products" | "categories" | "settings" | "loyalty" | "whatsapp" | "coupons" | "orders";

type OrderItemData = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  notes: string | null;
  productName: string;
};

type OrderData = {
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
  items: OrderItemData[];
};

type CouponData = {
  id: number;
  code: string;
  type: string;
  value: string;
  minOrder: string | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string | null;
};

type WhatsappOrderData = {
  id: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  itemsJson: string;
  paymentMethod: string;
  total: string;
  status: string;
  createdAt: string | null;
};

const apiRequest = async (url: string, method = "GET", body?: unknown) => {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(err.message || "Erro na requisição");
  }
  return res.json();
};

function ProductModal({ product, categories, onClose, onSave }: {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    imageUrl: product?.imageUrl || "",
    categoryId: product?.categoryId?.toString() || "",
    active: product?.active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      price: form.price,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      imageUrl: form.imageUrl || null,
    } as any);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="font-bold text-lg">{product ? "Editar Produto" : "Novo Produto"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome do produto</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: Esfiha de Carne"
              required
              data-testid="input-product-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={3}
              placeholder="Descreva o produto..."
              data-testid="input-product-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="0,00"
                required
                data-testid="input-product-price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                required
                data-testid="select-product-category"
              >
                <option value="">Selecionar...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL da foto</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Image className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="https://..."
                  data-testid="input-product-image"
                />
              </div>
            </div>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="mt-2 h-16 w-16 rounded-lg object-cover border border-border" />
            )}
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Produto ativo</p>
              <p className="text-xs text-muted-foreground">Aparece no cardápio dos clientes</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className="text-2xl"
              data-testid="toggle-product-active"
            >
              {form.active
                ? <ToggleRight className="w-8 h-8 text-green-500" />
                : <ToggleLeft className="w-8 h-8 text-muted-foreground" />
              }
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              data-testid="button-save-product"
            >
              {product ? "Salvar alterações" : "Adicionar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ category, onClose, onSave }: {
  category?: Category | null;
  onClose: () => void;
  onSave: (data: { name: string; sortOrder: number }) => void;
}) {
  const [form, setForm] = useState({ name: category?.name || "", sortOrder: category?.sortOrder?.toString() || "99" });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{category ? "Editar Categoria" : "Nova Categoria"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ name: form.name, sortOrder: Number(form.sortOrder) }); }} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da categoria</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: PROMOÇÕES"
              required
              data-testid="input-category-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ordem de exibição</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              min="1"
              data-testid="input-category-order"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors" data-testid="button-save-category">
              {category ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [productModal, setProductModal] = useState<{ open: boolean; product?: Product | null }>({ open: false });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category?: Category | null }>({ open: false });
  const [settingsForm, setSettingsForm] = useState<Partial<StoreSettings>>({});
  const [settingsChanged, setSettingsChanged] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  // Auth check
  const { isLoading: authLoading, isError: authError } = useQuery({
    queryKey: ["/api/admin/check"],
    queryFn: () => apiRequest("/api/admin/check"),
    retry: false,
  });

  // MODO TESTE — redirect desativado para configuração. Restaurar antes do deploy:
  // useEffect(() => { if (authError) setLocation("/"); }, [authError]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    queryFn: () => apiRequest("/api/admin/products"),
    enabled: !authLoading && !authError,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: () => apiRequest("/api/categories"),
    enabled: !authLoading && !authError,
  });

  const { data: settings } = useQuery<StoreSettings>({
    queryKey: ["/api/settings"],
    queryFn: () => apiRequest("/api/settings"),
    enabled: !authLoading && !authError,
  });

  const { data: loyaltyData } = useQuery<{
    customers: Array<{
      id: number; phone: string; name: string;
      paidDeliveryOrders: number; freeDeliveriesUsed: number; createdAt: string;
    }>;
    stats: { totalPaidOrders: number; totalFreeDeliveries: number; totalCustomers: number };
  }>({
    queryKey: ["/api/admin/loyalty"],
    queryFn: () => apiRequest("/api/admin/loyalty"),
    enabled: !authLoading && !authError && activeTab === "loyalty",
    refetchOnWindowFocus: false,
  });

  const { data: whatsappData, dataUpdatedAt: whatsappUpdatedAt } = useQuery<{
    orders: WhatsappOrderData[];
    stats: { total: number; pendente: number; pago: number };
  }>({
    queryKey: ["/api/admin/whatsapp-orders"],
    queryFn: () => apiRequest("/api/admin/whatsapp-orders"),
    enabled: !authLoading && !authError,
    refetchOnWindowFocus: false,
    refetchInterval: activeTab === "whatsapp" ? 30000 : false,
  });

  const { data: couponsData } = useQuery<CouponData[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: () => apiRequest("/api/admin/coupons"),
    enabled: !authLoading && !authError && activeTab === "coupons",
    refetchOnWindowFocus: false,
  });

  const { data: ordersData } = useQuery<OrderData[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: () => apiRequest("/api/admin/orders"),
    enabled: !authLoading && !authError && activeTab === "orders",
    refetchOnWindowFocus: false,
    refetchInterval: activeTab === "orders" ? 30000 : false,
  });

  const { data: topProducts } = useQuery<{ productId: number; name: string; totalSold: number }[]>({
    queryKey: ["/api/admin/analytics/top-products"],
    queryFn: () => apiRequest("/api/admin/analytics/top-products"),
    enabled: !authLoading && !authError,
    refetchOnWindowFocus: false,
  });

  const [couponModal, setCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "", type: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "",
  });

  useEffect(() => {
    if (settings) setSettingsForm(settings);
  }, [settings]);

  // Mutations
  const createProduct = useMutation({
    mutationFn: (data: Partial<Product>) => apiRequest("/api/admin/products", "POST", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/products"] }); qc.invalidateQueries({ queryKey: ["/api/products"] }); setProductModal({ open: false }); toast({ title: "Produto adicionado!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => apiRequest(`/api/admin/products/${id}`, "PUT", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/products"] }); qc.invalidateQueries({ queryKey: ["/api/products"] }); setProductModal({ open: false }); toast({ title: "Produto atualizado!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/products/${id}`, "DELETE"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/products"] }); qc.invalidateQueries({ queryKey: ["/api/products"] }); toast({ title: "Produto removido!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const createCategory = useMutation({
    mutationFn: (data: { name: string; sortOrder: number }) => apiRequest("/api/admin/categories", "POST", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/categories"] }); setCategoryModal({ open: false }); toast({ title: "Categoria adicionada!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => apiRequest(`/api/admin/categories/${id}`, "PUT", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/categories"] }); setCategoryModal({ open: false }); toast({ title: "Categoria atualizada!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/categories/${id}`, "DELETE"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/categories"] }); toast({ title: "Categoria removida!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const saveSettings = useMutation({
    mutationFn: (data: Partial<StoreSettings>) => apiRequest("/api/admin/settings", "PUT", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/settings"] }); setSettingsChanged(false); toast({ title: "Configurações salvas!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const createCoupon = useMutation({
    mutationFn: (data: object) => apiRequest("/api/admin/coupons", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setCouponModal(false);
      setCouponForm({ code: "", type: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "" });
      toast({ title: "Cupom criado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteCoupon = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/coupons/${id}`, "DELETE"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/coupons"] }); toast({ title: "Cupom removido!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateWhatsappStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest(`/api/admin/whatsapp-orders/${id}/status`, "PATCH", { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/whatsapp-orders"] });
      toast({ title: "Status atualizado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setLocation("/");
  };

  const handleSettingsChange = (key: keyof StoreSettings, value: unknown) => {
    setSettingsForm(f => ({ ...f, [key]: value }));
    setSettingsChanged(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Verificando acesso...</div>
      </div>
    );
  }

  if (authError) return null;

  const navItems: { tab: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: "overview", label: "Visão Geral", icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: "products", label: "Produtos", icon: <Package className="w-4 h-4" /> },
    { tab: "categories", label: "Categorias", icon: <Tag className="w-4 h-4" /> },
    { tab: "settings", label: "Configurações", icon: <Settings className="w-4 h-4" /> },
    { tab: "loyalty", label: "Fidelidade", icon: <Trophy className="w-4 h-4" /> },
    { tab: "whatsapp", label: "Pedidos WhatsApp", icon: <MessageCircle className="w-4 h-4" />, badge: whatsappData?.stats?.pendente || 0 },
    { tab: "coupons", label: "Cupons", icon: <Tag className="w-4 h-4" /> },
    { tab: "orders", label: "Pedidos", icon: <ClipboardList className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-10 hidden md:flex">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Estação da</p>
              <p className="text-primary font-bold text-sm leading-tight">Esfiha</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              data-testid={`nav-${item.tab}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === item.tab
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-[#25D366] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <a
            href="/"
            target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Ver cardápio
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile header nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="text-white font-bold text-sm">Admin</span>
          </div>
          <div className="flex gap-1">
            {navItems.map(item => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  activeTab === item.tab ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                )}
              >
                {item.icon}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="text-gray-400 p-2">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-0 md:pt-0">
        <div className="p-4 md:p-8 mt-14 md:mt-0">

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
                <p className="text-gray-400 text-sm mt-0.5">Bem-vindo ao painel de administração</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Produtos", value: products.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                  { label: "Categorias", value: categories.length, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                  { label: "Status", value: settingsForm.isOpen ? "Aberto" : "Fechado", color: settingsForm.isOpen ? "text-green-400" : "text-red-400", bg: settingsForm.isOpen ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20" },
                  { label: "Entrega", value: `R$ ${Number(settingsForm.deliveryFee || 5).toFixed(2)}`, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                ].map((stat, i) => (
                  <div key={i} className={cn("rounded-xl border p-4", stat.bg)}>
                    <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                    <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Top Products */}
              {topProducts && topProducts.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowUpDown className="w-4 h-4 text-primary" />
                    <h2 className="text-white font-semibold text-sm">Produtos mais vendidos</h2>
                  </div>
                  <div className="space-y-3">
                    {topProducts.map((p, i) => {
                      const max = topProducts[0].totalSold;
                      return (
                        <div key={p.productId} className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs w-4 shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                            <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(p.totalSold / max) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-gray-300 text-xs font-bold shrink-0">{p.totalSold} un.</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WhatsApp Orders Summary */}
              {whatsappData && (
                <div
                  className="bg-[#075E54]/10 border border-[#25D366]/20 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#075E54]/20 transition-colors"
                  onClick={() => setActiveTab("whatsapp")}
                  data-testid="card-whatsapp-summary"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Pedidos via WhatsApp</p>
                      <p className="text-gray-400 text-xs">{whatsappData.stats.pago} confirmado{whatsappData.stats.pago !== 1 ? "s" : ""} · {whatsappData.stats.pendente} pendente{whatsappData.stats.pendente !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#25D366]">{whatsappData.stats.total}</p>
                    <p className="text-xs text-gray-400">total</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {/* Quick Actions */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <h2 className="text-white font-semibold mb-4">Ações rápidas</h2>
                  <div className="space-y-2">
                    {[
                      { label: "Adicionar produto", tab: "products" as Tab, icon: <Plus className="w-4 h-4" /> },
                      { label: "Nova categoria", tab: "categories" as Tab, icon: <Tag className="w-4 h-4" /> },
                      { label: "Configurações da loja", tab: "settings" as Tab, icon: <Settings className="w-4 h-4" /> },
                    ].map((action, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTab(action.tab)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                          <span className="text-primary">{action.icon}</span>
                          <span className="text-sm font-medium">{action.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status widget */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <h2 className="text-white font-semibold mb-4">Status da loja</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Estado</span>
                      <button
                        onClick={() => {
                          const newIsOpen = !settingsForm.isOpen;
                          handleSettingsChange("isOpen", newIsOpen);
                          saveSettings.mutate({ ...settingsForm, isOpen: newIsOpen });
                        }}
                        className="flex items-center gap-2"
                        data-testid="toggle-store-open"
                      >
                        {settingsForm.isOpen
                          ? <><ToggleRight className="w-7 h-7 text-green-500" /><span className="text-green-400 text-sm font-semibold">Aberto</span></>
                          : <><ToggleLeft className="w-7 h-7 text-gray-500" /><span className="text-gray-400 text-sm font-semibold">Fechado</span></>
                        }
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Horário</span>
                      <span className="text-white text-sm font-medium">{settingsForm.openTime} – {settingsForm.closeTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Tempo estimado</span>
                      <span className="text-white text-sm font-medium">{settingsForm.estimatedTimeMin}–{settingsForm.estimatedTimeMax} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Produtos</h1>
                  <p className="text-gray-400 text-sm mt-0.5">{products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => setProductModal({ open: true, product: null })}
                  data-testid="button-add-product"
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Novo produto
                </button>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {products.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Nenhum produto cadastrado</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {products.map((product: Product) => {
                      const cat = categories.find(c => c.id === product.categoryId);
                      return (
                        <div key={product.id} data-testid={`row-product-${product.id}`} className="flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Image className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm font-semibold truncate">{product.name}</p>
                              {!product.active && (
                                <span className="px-1.5 py-0.5 bg-red-900/40 text-red-400 text-xs rounded-md shrink-0">inativo</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs truncate">{cat?.name || "—"} · R$ {Number(product.price).toFixed(2).replace(".", ",")}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setProductModal({ open: true, product })}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                              data-testid={`button-edit-product-${product.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remover "${product.name}"?`)) deleteProduct.mutate(product.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                              data-testid={`button-delete-product-${product.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Categorias</h1>
                  <p className="text-gray-400 text-sm mt-0.5">{categories.length} categoria{categories.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => setCategoryModal({ open: true, category: null })}
                  data-testid="button-add-category"
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Nova categoria
                </button>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {categories.length === 0 ? (
                  <div className="p-12 text-center">
                    <Tag className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Nenhuma categoria</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {categories.map((cat: Category) => {
                      const count = products.filter(p => p.categoryId === cat.id).length;
                      return (
                        <div key={cat.id} data-testid={`row-category-${cat.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-800/50 transition-colors">
                          <ArrowUpDown className="w-4 h-4 text-gray-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold">{cat.name}</p>
                            <p className="text-gray-500 text-xs">{count} produto{count !== 1 ? "s" : ""} · ordem {cat.sortOrder}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setCategoryModal({ open: true, category: cat })}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                              data-testid={`button-edit-category-${cat.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remover "${cat.name}"? Os produtos desta categoria ficarão sem categoria.`)) deleteCategory.mutate(cat.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                              data-testid={`button-delete-category-${cat.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-gray-400 text-sm mt-0.5">Gerencie as informações da sua loja</p>
              </div>

              {/* Store Status */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Status da loja</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm font-medium">Loja aberta</p>
                    <p className="text-gray-500 text-xs">Quando fechado, clientes verão um aviso</p>
                  </div>
                  <button
                    onClick={() => handleSettingsChange("isOpen", !settingsForm.isOpen)}
                    data-testid="toggle-settings-store-open"
                  >
                    {settingsForm.isOpen
                      ? <ToggleRight className="w-9 h-9 text-green-500" />
                      : <ToggleLeft className="w-9 h-9 text-gray-600" />
                    }
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Abre às</label>
                    <input
                      type="time"
                      value={settingsForm.openTime || "10:00"}
                      onChange={e => handleSettingsChange("openTime", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      data-testid="input-open-time"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fecha às</label>
                    <input
                      type="time"
                      value={settingsForm.closeTime || "23:00"}
                      onChange={e => handleSettingsChange("closeTime", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      data-testid="input-close-time"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Entrega</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tempo mínimo (min)</label>
                    <input
                      type="number"
                      value={settingsForm.estimatedTimeMin || 10}
                      onChange={e => handleSettingsChange("estimatedTimeMin", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      min="1"
                      data-testid="input-time-min"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tempo máximo (min)</label>
                    <input
                      type="number"
                      value={settingsForm.estimatedTimeMax || 60}
                      onChange={e => handleSettingsChange("estimatedTimeMax", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      min="1"
                      data-testid="input-time-max"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Taxa de entrega (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settingsForm.deliveryFee || "5.00"}
                      onChange={e => handleSettingsChange("deliveryFee", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      min="0"
                      data-testid="input-delivery-fee"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Pedido mínimo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settingsForm.minOrder || "15.00"}
                      onChange={e => handleSettingsChange("minOrder", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      min="0"
                      data-testid="input-min-order"
                    />
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Image className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Banner promocional</h2>
                </div>
                <p className="text-gray-500 text-xs -mt-2">Exibido no topo do cardápio. Deixe em branco para ocultar.</p>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">URL da imagem do banner</label>
                  <input
                    value={settingsForm.bannerImageUrl || ""}
                    onChange={e => handleSettingsChange("bannerImageUrl", e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="https://exemplo.com/banner.jpg"
                    data-testid="input-banner-image"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Título do banner</label>
                  <input
                    value={settingsForm.bannerTitle || ""}
                    onChange={e => handleSettingsChange("bannerTitle", e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: Promoção de Lançamento"
                    data-testid="input-banner-title"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Link ao clicar no banner</label>
                  <input
                    value={settingsForm.bannerLink || ""}
                    onChange={e => handleSettingsChange("bannerLink", e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="https://linkdoapp.com"
                    data-testid="input-banner-link"
                  />
                </div>
                {settingsForm.bannerImageUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Pré-visualização:</p>
                    <img src={settingsForm.bannerImageUrl} alt="banner preview" className="w-full rounded-xl max-h-32 object-cover border border-gray-700" />
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ChefHat className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Informações da loja</h2>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nome da loja</label>
                  <input
                    value={settingsForm.storeName || ""}
                    onChange={e => handleSettingsChange("storeName", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Estação da Esfiha"
                    data-testid="input-store-name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Descrição curta (aparece no hero)</label>
                  <input
                    value={settingsForm.storeDescription || ""}
                    onChange={e => handleSettingsChange("storeDescription", e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="As melhores esfihas da cidade!"
                    data-testid="input-store-description"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">URL da imagem hero (fundo do topo)</label>
                  <input
                    value={settingsForm.heroImageUrl || ""}
                    onChange={e => handleSettingsChange("heroImageUrl", e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="https://exemplo.com/foto-principal.jpg"
                    data-testid="input-hero-image"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nota de avaliação</label>
                    <input
                      value={(settingsForm as any).ratingScore || ""}
                      onChange={e => handleSettingsChange("ratingScore" as any, e.target.value || null)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="4.2"
                      data-testid="input-rating-score"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Texto da avaliação</label>
                    <input
                      value={(settingsForm as any).ratingText || ""}
                      onChange={e => handleSettingsChange("ratingText" as any, e.target.value || null)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="1.555 avaliações"
                      data-testid="input-rating-text"
                    />
                  </div>
                </div>
              </div>

              {/* Localização & Contato */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Localização & Contato</h2>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Endereço completo</label>
                  <input
                    value={(settingsForm as any).address || ""}
                    onChange={e => handleSettingsChange("address" as any, e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Av. dos Autonomistas, 6250, KM 18 - Osasco, SP"
                    data-testid="input-address"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Número do WhatsApp (só números, com DDD)</label>
                  <input
                    value={(settingsForm as any).whatsappNumber || ""}
                    onChange={e => handleSettingsChange("whatsappNumber" as any, e.target.value.replace(/\D/g, "") || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="11999998888"
                    data-testid="input-whatsapp"
                  />
                </div>
              </div>

              {/* Horário semanal */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Horário por dia da semana</h2>
                </div>
                <p className="text-gray-500 text-xs -mt-2">Exibido no modal de informações ao clicar na logo.</p>
                {(() => {
                  const defaultSched = [
                    { day: "Segunda-feira", hours: "11:00 às 23:59" },
                    { day: "Terça-feira", hours: "00:00 às 04:00" },
                    { day: "Quarta-feira", hours: "11:00 às 23:59" },
                    { day: "Quinta-feira", hours: "11:00 às 23:59" },
                    { day: "Sexta-feira", hours: "11:00 às 23:59" },
                    { day: "Sábado", hours: "11:02 às 23:58" },
                    { day: "Domingo", hours: "11:00 às 23:59" },
                  ];
                  let sched = defaultSched;
                  try { sched = JSON.parse((settingsForm as any).weeklySchedule || "") || defaultSched; } catch {}
                  return sched.map((item: any, idx: number) => (
                    <div key={item.day} className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs w-28 shrink-0">{item.day}</span>
                      <input
                        value={item.hours}
                        onChange={e => {
                          const updated = [...sched];
                          updated[idx] = { ...item, hours: e.target.value };
                          handleSettingsChange("weeklySchedule" as any, JSON.stringify(updated));
                        }}
                        className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="11:00 às 23:59"
                      />
                    </div>
                  ));
                })()}
              </div>

              {/* Métodos de pagamento */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Formas de pagamento aceitas</h2>
                </div>
                <p className="text-gray-500 text-xs -mt-2">Exibido no modal de informações ao clicar na logo.</p>
                {["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Pix"].map(method => {
                  let methods: string[] = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito"];
                  try { methods = JSON.parse((settingsForm as any).paymentMethods || "") || methods; } catch {}
                  const checked = methods.includes(method);
                  return (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => {
                          let curr: string[] = [];
                          try { curr = JSON.parse((settingsForm as any).paymentMethods || "") || []; } catch {}
                          const next = checked ? curr.filter((m: string) => m !== method) : [...curr, method];
                          handleSettingsChange("paymentMethods" as any, JSON.stringify(next));
                        }}
                        className={cn(
                          "w-5 h-5 border-2 flex items-center justify-center transition-colors",
                          checked ? "bg-primary border-primary" : "border-gray-600"
                        )}
                      >
                        {checked && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <span className="text-gray-300 text-sm">{method}</span>
                    </label>
                  );
                })}
              </div>

              {/* Chave PIX */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <QrCode className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Chave PIX</h2>
                </div>
                <p className="text-gray-500 text-xs -mt-2">Exibida automaticamente no checkout quando o cliente escolhe Pix.</p>
                <input
                  value={(settingsForm as any).pixKey || ""}
                  onChange={e => handleSettingsChange("pixKey" as any, e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="email@exemplo.com, CPF, CNPJ ou telefone"
                  data-testid="input-pix-key"
                />
              </div>

              {/* Nossa História */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Nossa História</h2>
                </div>
                <p className="text-gray-500 text-xs -mt-2">Página acessível pelo menu hambúrguer. Deixe o texto em branco para ocultar.</p>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Título</label>
                  <input
                    value={settingsForm.storyTitle || ""}
                    onChange={e => handleSettingsChange("storyTitle", e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Nossa História"
                    data-testid="input-story-title"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Texto da história</label>
                  <textarea
                    value={settingsForm.storyText || ""}
                    onChange={e => handleSettingsChange("storyText", e.target.value || null)}
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="Escreva aqui a história da sua loja..."
                    data-testid="input-story-text"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">URL da imagem de fundo da história</label>
                  <p className="text-gray-600 text-xs mb-1">Aparece como fundo da seção "Nossa História". Sem imagem, usa fundo escuro.</p>
                  <input
                    value={(settingsForm as any).storyBgUrl || ""}
                    onChange={e => handleSettingsChange("storyBgUrl" as any, e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="https://exemplo.com/imagem-fundo.jpg"
                    data-testid="input-story-bg"
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={() => saveSettings.mutate(settingsForm)}
                disabled={!settingsChanged || saveSettings.isPending}
                data-testid="button-save-settings"
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                  settingsChanged
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                )}
              >
                <Save className="w-4 h-4" />
                {saveSettings.isPending ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          )}

          {/* ── WhatsApp Orders Tab ──────────────────── */}
          {activeTab === "whatsapp" && (
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  <h1 className="text-white font-bold text-lg">Pedidos via WhatsApp</h1>
                </div>
                <div className="text-right">
                  {whatsappUpdatedAt > 0 && (
                    <p className="text-gray-500 text-[10px]">
                      Atualizado às {new Date(whatsappUpdatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                  <button
                    onClick={() => qc.invalidateQueries({ queryKey: ["/api/admin/whatsapp-orders"] })}
                    className="text-xs text-[#25D366] hover:underline"
                    data-testid="button-refresh-whatsapp"
                  >
                    Atualizar agora
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-sm -mt-2">
                Registros de clientes que escolheram finalizar o pedido pelo WhatsApp. Marque como <strong className="text-white">Pago</strong> para confirmar o pedido e contabilizar no programa de fidelidade.
              </p>

              {/* Stats cards */}
              {whatsappData?.stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <MessageCircle className="w-5 h-5 text-[#25D366] mx-auto mb-1" />
                    <p className="text-2xl font-black text-white">{whatsappData.stats.total}</p>
                    <p className="text-xs text-gray-400">Total de pedidos</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-2xl font-black text-white">{whatsappData.stats.pendente}</p>
                    <p className="text-xs text-gray-400">Pendentes</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-2xl font-black text-white">{whatsappData.stats.pago}</p>
                    <p className="text-xs text-gray-400">Confirmados pagos</p>
                  </div>
                </div>
              )}

              {/* Orders list */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#25D366]" />
                  <h2 className="text-white font-semibold text-sm">Lista de Pedidos</h2>
                </div>
                {!whatsappData?.orders?.length ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Nenhum pedido via WhatsApp ainda. Eles aparecerão aqui quando um cliente usar o botão "Pedir pelo WhatsApp" no checkout.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {whatsappData.orders.map(order => {
                      let parsedItems: { name: string; quantity: number; unitPrice: number; notes?: string }[] = [];
                      try { parsedItems = JSON.parse(order.itemsJson); } catch {}
                      const paymentLabels: Record<string, string> = {
                        pix: "Pix", cartao_credito: "Crédito", cartao_debito: "Débito", dinheiro: "Dinheiro"
                      };
                      const statusColor: Record<string, string> = {
                        pendente: "text-amber-400 bg-amber-400/10 border-amber-400/20",
                        pago: "text-green-400 bg-green-400/10 border-green-400/20",
                        cancelado: "text-red-400 bg-red-400/10 border-red-400/20",
                      };
                      return (
                        <div key={order.id} className="p-4 space-y-3" data-testid={`row-whatsapp-order-${order.id}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-bold text-sm">{order.customerName}</span>
                                <a
                                  href={`https://wa.me/55${order.customerPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#25D366] text-xs hover:underline flex items-center gap-1"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  {order.customerPhone}
                                </a>
                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", statusColor[order.status] || "text-gray-400 bg-gray-400/10 border-gray-400/20")}>
                                  {order.status.toUpperCase()}
                                </span>
                              </div>
                              {order.deliveryAddress && (
                                <p className="text-gray-400 text-xs mt-0.5">{order.deliveryAddress}</p>
                              )}
                              <p className="text-gray-500 text-xs mt-0.5">
                                {paymentLabels[order.paymentMethod] || order.paymentMethod} · {order.createdAt ? new Date(order.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : ""}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-white font-black text-base">R$ {Number(order.total).toFixed(2).replace(".", ",")}</p>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="bg-gray-800/50 rounded-lg px-3 py-2 space-y-1">
                            {parsedItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-gray-300">{item.quantity}× {item.name}{item.notes ? <span className="text-gray-500"> · {item.notes}</span> : ""}</span>
                                <span className="text-gray-400">R$ {(item.quantity * item.unitPrice).toFixed(2).replace(".", ",")}</span>
                              </div>
                            ))}
                          </div>

                          {/* Actions */}
                          {order.status === "pendente" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateWhatsappStatus.mutate({ id: order.id, status: "pago" })}
                                disabled={updateWhatsappStatus.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                data-testid={`button-mark-paid-${order.id}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Marcar como Pago
                              </button>
                              <button
                                onClick={() => updateWhatsappStatus.mutate({ id: order.id, status: "cancelado" })}
                                disabled={updateWhatsappStatus.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                data-testid={`button-cancel-order-${order.id}`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Coupons Tab ──────────────────────────── */}
          {activeTab === "coupons" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary" />
                  <h1 className="text-white font-bold text-lg">Cupons de Desconto</h1>
                </div>
                <button
                  onClick={() => setCouponModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-all"
                  data-testid="button-new-coupon"
                >
                  <Plus className="w-4 h-4" />
                  Novo Cupom
                </button>
              </div>
              <p className="text-gray-400 text-sm -mt-2">Crie cupons de desconto para usar em promoções e marketing.</p>

              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {!couponsData?.length ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Nenhum cupom criado ainda. Clique em "Novo Cupom" para criar.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">Código</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">Desconto</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">Mín. Pedido</th>
                          <th className="text-center px-4 py-2 text-xs font-bold text-gray-400 uppercase">Usos</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase">Validade</th>
                          <th className="text-center px-4 py-2 text-xs font-bold text-gray-400 uppercase">Status</th>
                          <th className="px-4 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {couponsData.map(c => (
                          <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30" data-testid={`row-coupon-${c.id}`}>
                            <td className="px-4 py-3">
                              <span className="text-white font-black tracking-widest text-sm">{c.code}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-200">
                              {c.type === "percent" ? `${parseFloat(c.value)}%` : `R$ ${parseFloat(c.value).toFixed(2)}`}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {c.minOrder ? `R$ ${parseFloat(c.minOrder).toFixed(2)}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-400 text-xs">
                              {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">
                              {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pt-BR") : "Sem prazo"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border",
                                c.active
                                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                                  : "text-gray-400 bg-gray-400/10 border-gray-400/20"
                              )}>
                                {c.active ? "ATIVO" : "INATIVO"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => { if (confirm(`Remover cupom ${c.code}?`)) deleteCoupon.mutate(c.id); }}
                                className="text-gray-500 hover:text-red-400 transition-colors"
                                data-testid={`button-delete-coupon-${c.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Orders Tab ───────────────────────────── */}
          {activeTab === "orders" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-primary" />
                <h1 className="text-white font-bold text-lg">Pedidos</h1>
              </div>
              <p className="text-gray-400 text-sm -mt-2">Pedidos realizados pelo checkout do site. Atualiza automaticamente a cada 30 segundos.</p>

              {/* Stats */}
              {ordersData && (() => {
                const today = new Date().toDateString();
                const todayOrders = ordersData.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === today);
                const todayRevenue = todayOrders.reduce((s, o) => s + parseFloat(o.total), 0);
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-white">{todayOrders.length}</p>
                      <p className="text-xs text-gray-400 mt-1">Pedidos hoje</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-primary">R$ {todayRevenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-1">Receita hoje</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-white">{ordersData.length}</p>
                      <p className="text-xs text-gray-400 mt-1">Total de pedidos</p>
                    </div>
                  </div>
                );
              })()}

              {/* Orders list */}
              {!ordersData ? (
                <div className="text-center text-gray-500 py-10 text-sm">Carregando pedidos...</div>
              ) : ordersData.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-500 text-sm">
                  Nenhum pedido ainda. Os pedidos feitos pelo checkout aparecerão aqui.
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersData.map(order => {
                    const paymentLabels: Record<string, string> = {
                      pix: "Pix", cartao_credito: "Crédito", cartao_debito: "Débito", dinheiro: "Dinheiro"
                    };
                    const statusColors: Record<string, string> = {
                      pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
                      confirmed: "text-green-400 bg-green-400/10 border-green-400/20",
                      cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
                    };
                    const statusLabels: Record<string, string> = {
                      pending: "Novo", confirmed: "Confirmado", cancelled: "Cancelado"
                    };
                    return (
                      <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3" data-testid={`card-order-${order.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-bold text-sm">#{order.id} — {order.customerName}</span>
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", statusColors[order.status] || statusColors.pending)}>
                                {statusLabels[order.status] || order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <a
                                href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#25D366] hover:underline font-semibold"
                              >
                                {order.customerPhone}
                              </a>
                              {order.createdAt && (
                                <span className="text-xs text-gray-500">
                                  {new Date(order.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-white font-black text-base">R$ {parseFloat(order.total).toFixed(2)}</p>
                            <p className="text-gray-400 text-xs">{paymentLabels[order.paymentMethod] || order.paymentMethod}</p>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-300">
                              <span>{item.quantity}× {item.productName}{item.notes ? ` (${item.notes})` : ""}</span>
                              <span>R$ {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Address & extras */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          {order.deliveryAddress && (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.deliveryAddress}</span>
                          )}
                          {order.couponCode && (
                            <span className="text-green-400">🎟 {order.couponCode} (-R$ {parseFloat(order.discountAmount || "0").toFixed(2)})</span>
                          )}
                          {order.usedFreeDelivery && (
                            <span className="text-yellow-400">⭐ Entrega grátis (fidelidade)</span>
                          )}
                          {order.changeFor && (
                            <span>Troco para R$ {parseFloat(order.changeFor).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Loyalty Tab ──────────────────────────── */}
          {activeTab === "loyalty" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h1 className="text-white font-bold text-lg">Programa de Fidelidade</h1>
              </div>
              <p className="text-gray-400 text-sm -mt-2">A cada 10 pedidos com entrega paga, o cliente ganha 1 frete grátis.</p>

              {/* Stats cards */}
              {loyaltyData?.stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-black text-white">{loyaltyData.stats.totalCustomers}</p>
                    <p className="text-xs text-gray-400">Clientes cadastrados</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-2xl font-black text-white">{loyaltyData.stats.totalPaidOrders}</p>
                    <p className="text-xs text-gray-400">Pedidos com frete pago</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <Gift className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-2xl font-black text-white">{loyaltyData.stats.totalFreeDeliveries}</p>
                    <p className="text-xs text-gray-400">Fretes grátis usados</p>
                  </div>
                </div>
              )}

              {/* Customers table */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-semibold text-sm">Clientes</h2>
                </div>
                {!loyaltyData?.customers?.length ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Nenhum cliente ainda. Os clientes aparecem aqui após o primeiro pedido.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Nome</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Telefone</th>
                          <th className="text-center px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Pedidos pagos</th>
                          <th className="text-center px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Fretes grátis usados</th>
                          <th className="text-center px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Progresso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loyaltyData.customers.map(c => {
                          const freeEarned = Math.floor(c.paidDeliveryOrders / 10);
                          const freeAvailable = freeEarned - c.freeDeliveriesUsed;
                          const progress = c.paidDeliveryOrders % 10;
                          return (
                            <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                              <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                              <td className="px-4 py-3 text-gray-400">{c.phone}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-white font-bold">{c.paidDeliveryOrders}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn("font-bold", c.freeDeliveriesUsed > 0 ? "text-green-400" : "text-gray-500")}>
                                  {c.freeDeliveriesUsed}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${(progress / 10) * 100}%` }} />
                                  </div>
                                  <span className="text-xs text-gray-400 shrink-0">{progress}/10</span>
                                  {freeAvailable > 0 && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">
                                      {freeAvailable} grátis
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modals */}
      {productModal.open && (
        <ProductModal
          product={productModal.product}
          categories={categories}
          onClose={() => setProductModal({ open: false })}
          onSave={(data) => {
            if (productModal.product) updateProduct.mutate({ id: productModal.product.id, data });
            else createProduct.mutate(data);
          }}
        />
      )}

      {categoryModal.open && (
        <CategoryModal
          category={categoryModal.category}
          onClose={() => setCategoryModal({ open: false })}
          onSave={(data) => {
            if (categoryModal.category) updateCategory.mutate({ id: categoryModal.category.id, data });
            else createCategory.mutate(data);
          }}
        />
      )}

      {/* Coupon Modal */}
      {couponModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setCouponModal(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-white font-bold">Novo Cupom</h2>
              <button onClick={() => setCouponModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Código do Cupom *</label>
                <input
                  value={couponForm.code}
                  onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="EX: ESFIHA10"
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary"
                  data-testid="input-coupon-code"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Tipo *</label>
                  <select
                    value={couponForm.type}
                    onChange={e => setCouponForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm focus:outline-none focus:border-primary"
                    data-testid="select-coupon-type"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="fixed">Valor fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Valor *</label>
                  <input
                    value={couponForm.value}
                    onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))}
                    placeholder={couponForm.type === "percent" ? "10" : "5.00"}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm focus:outline-none focus:border-primary"
                    data-testid="input-coupon-value"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Pedido mínimo (R$)</label>
                  <input
                    value={couponForm.minOrder}
                    onChange={e => setCouponForm(f => ({ ...f, minOrder: e.target.value }))}
                    placeholder="0.00"
                    type="number" min="0" step="0.01"
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Máx. de usos</label>
                  <input
                    value={couponForm.maxUses}
                    onChange={e => setCouponForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Ilimitado"
                    type="number" min="1"
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data de validade</label>
                <input
                  value={couponForm.expiresAt}
                  onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))}
                  type="date"
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => {
                  if (!couponForm.code || !couponForm.value) {
                    toast({ title: "Preencha o código e o valor", variant: "destructive" });
                    return;
                  }
                  createCoupon.mutate({
                    code: couponForm.code,
                    type: couponForm.type,
                    value: couponForm.value,
                    minOrder: couponForm.minOrder || null,
                    maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null,
                    expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt + "T23:59:59").toISOString() : null,
                    active: true,
                  });
                }}
                disabled={createCoupon.isPending}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                data-testid="button-save-coupon"
              >
                {createCoupon.isPending ? "Salvando..." : "Criar Cupom"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
