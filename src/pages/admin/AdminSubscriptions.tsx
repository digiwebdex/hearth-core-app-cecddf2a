import { useState, useMemo, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { adminApi, type AdminTenant } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Search, ArrowUpCircle, ArrowDownCircle, CalendarPlus, XCircle, Eye, Crown,
  Users, AlertTriangle, RefreshCcw, Pause, Play, DollarSign, Clock, CheckCircle2,
  TrendingUp, Ban, Download, Pencil, Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  PLANS, type PlanType, type SubscriptionStatus, type BillingCycle,
  type TenantSubscription, checkUsage, getLimitLabel,
} from "@/lib/plans";

const STATUS_META: { value: SubscriptionStatus; color: string; icon: any }[] = [
  { value: "trial", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Clock },
  { value: "active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle2 },
  { value: "overdue", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", icon: AlertTriangle },
  { value: "expired", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: XCircle },
  { value: "suspended", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: Pause },
  { value: "cancelled", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: Ban },
];

const getStatusMeta = (s: SubscriptionStatus) => STATUS_META.find((x) => x.value === s) || STATUS_META[1];

const planOrder: PlanType[] = ["free", "basic", "pro", "business", "enterprise"];

function getPlanPrice(planId: string, cycle: BillingCycle): number {
  const p = PLANS.find((x) => x.id === planId);
  if (!p) return 0;
  const v = cycle === "yearly" ? p.yearlyPrice : p.monthlyPrice;
  return v < 0 ? 0 : v;
}

function tenantToSubscription(t: AdminTenant): TenantSubscription {
  const owner = t.users?.find((u) => u.role === "tenant_owner") || t.users?.[0];
  const plan = (t.subscriptionPlan || "free") as PlanType;
  const status = ((t.subscriptionStatus || "active") as SubscriptionStatus);
  const billingCycle: BillingCycle = "monthly";
  const startDate = t.createdAt ? t.createdAt.split("T")[0] : "";
  const endDate = t.subscriptionExpiry ? t.subscriptionExpiry.split("T")[0] : "";
  return {
    id: t.id,
    tenantId: t.id,
    tenantName: t.name,
    ownerEmail: owner?.email || "—",
    plan,
    billingCycle,
    price: getPlanPrice(plan, billingCycle),
    startDate,
    endDate,
    status,
    autoRenew: false,
    usedUsers: t._count?.users || 0,
    usedBookings: t._count?.bookings || 0,
  };
}

const AdminSubscriptions = () => {
  const { t: tt } = useTranslation();
  const statusLabel = (s: SubscriptionStatus) => tt(`adminSubscriptions.status.${s}`);
  const planLabel = (p: string) => {
    const meta = PLANS.find((x) => x.id === p);
    return meta?.name || p;
  };
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = () => {
    setLoading(true);
    return adminApi.getTenants()
      .then((tenants) => setSubscriptions(tenants.map(tenantToSubscription)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubs(); }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const { toast } = useToast();

  const [actionType, setActionType] = useState<"upgrade" | "downgrade" | "extend" | "cancel" | "view" | "suspend" | "reactivate" | "renew" | null>(null);
  const [selectedSub, setSelectedSub] = useState<TenantSubscription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<PlanType>("basic");
  const [newCycle, setNewCycle] = useState<BillingCycle>("monthly");
  const [extendUnit, setExtendUnit] = useState<"days" | "months">("months");
  const [extendValue, setExtendValue] = useState("1");
  const [actionReason, setActionReason] = useState("");

  // Edit / delete (real API)
  const [editSub, setEditSub] = useState<TenantSubscription | null>(null);
  const [editPlan, setEditPlan] = useState<PlanType>("basic");
  const [editStatus, setEditStatus] = useState<SubscriptionStatus>("active");
  const [editExpiry, setEditExpiry] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteSub, setDeleteSub] = useState<TenantSubscription | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openEdit = (s: TenantSubscription) => {
    setEditSub(s);
    setEditPlan(s.plan);
    setEditStatus(s.status);
    setEditExpiry(s.endDate || "");
  };

  const saveEdit = async () => {
    if (!editSub) return;
    setSavingEdit(true);
    try {
      const payload: any = { subscriptionPlan: editPlan, subscriptionStatus: editStatus };
      if (editExpiry) payload.subscriptionExpiry = editExpiry;
      await adminApi.updateTenant(editSub.tenantId, payload);
      toast({ title: tt("adminSubscriptions.toast.updated"), description: editSub.tenantName });
      setEditSub(null);
      await fetchSubs();
    } catch (err: any) {
      toast({ title: tt("adminSubscriptions.toast.updateFailed"), description: err.message, variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteSub) return;
    setDeleting(true);
    try {
      await adminApi.deleteTenant(deleteSub.tenantId);
      toast({ title: tt("adminSubscriptions.toast.deleted"), description: deleteSub.tenantName, variant: "destructive" });
      setDeleteSub(null);
      await fetchSubs();
    } catch (err: any) {
      toast({ title: tt("adminSubscriptions.toast.deleteFailed"), description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch = s.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        s.ownerEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchPlan = planFilter === "all" || s.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [subscriptions, search, statusFilter, planFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active" || s.status === "trial");
    const mrr = active.reduce((sum, s) => {
      if (s.billingCycle === "yearly") return sum + Math.round(s.price / 12);
      return sum + s.price;
    }, 0);
    return {
      total: subscriptions.length,
      active: subscriptions.filter((s) => s.status === "active").length,
      trial: subscriptions.filter((s) => s.status === "trial").length,
      overdue: subscriptions.filter((s) => s.status === "overdue").length,
      expired: subscriptions.filter((s) => s.status === "expired").length,
      suspended: subscriptions.filter((s) => s.status === "suspended").length,
      cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
      mrr,
      arr: mrr * 12,
    };
  }, [subscriptions]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: subscriptions.length };
    STATUS_META.forEach((s) => { counts[s.value] = subscriptions.filter((sub) => sub.status === s.value).length; });
    return counts;
  }, [subscriptions]);

  const openAction = (sub: TenantSubscription, type: typeof actionType) => {
    setSelectedSub(sub);
    setActionType(type);
    setActionReason("");
    if (type === "upgrade") {
      const idx = planOrder.indexOf(sub.plan);
      setNewPlan(planOrder[Math.min(idx + 1, planOrder.length - 1)]);
    } else if (type === "downgrade") {
      const idx = planOrder.indexOf(sub.plan);
      setNewPlan(planOrder[Math.max(idx - 1, 0)]);
    }
    setNewCycle(sub.billingCycle);
    setExtendValue("1"); setExtendUnit("months");
    setDialogOpen(true);
  };

  const handleUpgrade = () => {
    if (!selectedSub) return;
    const planInfo = PLANS.find((p) => p.id === newPlan);
    const price = newCycle === "yearly" ? (planInfo?.yearlyPrice || 0) : (planInfo?.price || 0);
    setSubscriptions((prev) => prev.map((s) =>
      s.id === selectedSub.id ? { ...s, plan: newPlan, billingCycle: newCycle, price, status: "active" } : s
    ));
    toast({ title: tt("adminSubscriptions.toast.upgraded"), description: `${selectedSub.tenantName} → ${planLabel(newPlan)} (${tt(`adminSubscriptions.cycle.${newCycle}`)})` });
    setDialogOpen(false);
  };

  const handleDowngrade = () => {
    if (!selectedSub) return;
    const planInfo = PLANS.find((p) => p.id === newPlan);
    const price = newCycle === "yearly" ? (planInfo?.yearlyPrice || 0) : (planInfo?.price || 0);
    setSubscriptions((prev) => prev.map((s) =>
      s.id === selectedSub.id ? { ...s, plan: newPlan, billingCycle: newCycle, price } : s
    ));
    toast({ title: tt("adminSubscriptions.toast.downgraded"), description: `${selectedSub.tenantName} → ${planLabel(newPlan)}` });
    setDialogOpen(false);
  };

  const handleExtend = () => {
    if (!selectedSub) return;
    const val = parseInt(extendValue) || 1;
    const base = selectedSub.endDate ? new Date(selectedSub.endDate) : new Date();
    if (extendUnit === "months") base.setMonth(base.getMonth() + val);
    else base.setDate(base.getDate() + val);
    const newEnd = base.toISOString().split("T")[0];
    setSubscriptions((prev) => prev.map((s) =>
      s.id === selectedSub.id ? { ...s, endDate: newEnd, status: "active" } : s
    ));
    toast({ title: tt("adminSubscriptions.toast.extended"), description: tt("adminSubscriptions.toast.extendedDesc", { date: newEnd }) });
    setDialogOpen(false);
  };

  const handleCancel = () => {
    if (!selectedSub) return;
    setSubscriptions((prev) => prev.map((s) =>
      s.id === selectedSub.id ? { ...s, status: "cancelled" as SubscriptionStatus, cancelReason: actionReason, cancelledAt: new Date().toISOString() } : s
    ));
    toast({ title: tt("adminSubscriptions.toast.cancelled"), variant: "destructive" });
    setDialogOpen(false);
  };

  const handleSuspend = () => {
    if (!selectedSub) return;
    setSubscriptions((prev) => prev.map((s) =>
      s.id === selectedSub.id ? { ...s, status: "suspended" as SubscriptionStatus, suspendReason: actionReason, suspendedAt: new Date().toISOString() } : s
    ));
    toast({ title: tt("adminSubscriptions.toast.suspended") });
    setDialogOpen(false);
  };

  const handleReactivate = () => {
    if (!selectedSub) return;
    const end = new Date(); end.setMonth(end.getMonth() + 1);
    setSubscriptions((prev) => prev.map((s) =>
      s.id === selectedSub.id ? { ...s, status: "active" as SubscriptionStatus, endDate: end.toISOString().split("T")[0] } : s
    ));
    toast({ title: tt("adminSubscriptions.toast.reactivated") });
    setDialogOpen(false);
  };

  const handleRenew = () => {
    if (!selectedSub) return;
    const start = new Date();
    const end = new Date();
    if (selectedSub.billingCycle === "yearly") end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);
    setSubscriptions((prev) => prev.map((s) =>
      s.id === selectedSub.id ? { ...s, status: "active" as SubscriptionStatus, startDate: start.toISOString().split("T")[0], endDate: end.toISOString().split("T")[0], lastPaymentDate: start.toISOString().split("T")[0] } : s
    ));
    toast({ title: tt("adminSubscriptions.toast.renewed") });
    setDialogOpen(false);
  };

  const daysUntilExpiry = (endDate: string) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getUpgradePlans = (current: PlanType) => planOrder.slice(planOrder.indexOf(current) + 1).filter((p) => p !== "enterprise");
  const getDowngradePlans = (current: PlanType) => planOrder.slice(0, planOrder.indexOf(current));

  // Export
  const handleExport = () => {
    const headers = ["Tenant", "Email", "Plan", "Cycle", "Price", "Status", "Start", "End", "Auto-Renew"];
    const rows = filtered.map((s) => [s.tenantName, s.ownerEmail, s.plan, s.billingCycle, s.price, s.status, s.startDate, s.endDate || "", s.autoRenew ? "Yes" : "No"]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = tt("adminSubscriptions.exportFilename");
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tt("adminSubscriptions.title")}</h1>
            <p className="text-muted-foreground">{tt("adminSubscriptions.subtitle")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1 h-4 w-4" /> {tt("adminSubscriptions.export")}</Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tt("adminSubscriptions.stats.mrr")}</p><p className="text-xl font-bold">৳{stats.mrr.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tt("adminSubscriptions.stats.arr")}</p><p className="text-xl font-bold">৳{stats.arr.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tt("adminSubscriptions.stats.active")}</p><p className="text-xl font-bold text-green-600">{stats.active}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tt("adminSubscriptions.stats.trial")}</p><p className="text-xl font-bold text-blue-600">{stats.trial}</p></CardContent></Card>
          <Card className={stats.overdue > 0 ? "border-orange-300 dark:border-orange-600" : ""}><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tt("adminSubscriptions.stats.overdue")}</p><p className="text-xl font-bold text-orange-600">{stats.overdue}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tt("adminSubscriptions.stats.expired")}</p><p className="text-xl font-bold">{stats.expired}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tt("adminSubscriptions.stats.suspended")}</p><p className="text-xl font-bold text-destructive">{stats.suspended}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tt("adminSubscriptions.stats.cancelled")}</p><p className="text-xl font-bold">{stats.cancelled}</p></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>
              {tt("adminSubscriptions.status.all")} ({statusCounts.all})
            </Button>
            {STATUS_META.map((s) => (
              <Button key={s.value} variant={statusFilter === s.value ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s.value)}>
                {statusLabel(s.value)} ({statusCounts[s.value] || 0})
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder={tt("adminSubscriptions.filters.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={tt("adminSubscriptions.filters.plan")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tt("adminSubscriptions.filters.allPlans")}</SelectItem>
                {PLANS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>{tt("adminSubscriptions.table.title", { count: filtered.length })}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tt("adminSubscriptions.table.company")}</TableHead>
                  <TableHead>{tt("adminSubscriptions.table.plan")}</TableHead>
                  <TableHead>{tt("adminSubscriptions.table.cycle")}</TableHead>
                  <TableHead className="text-right">{tt("adminSubscriptions.table.price")}</TableHead>
                  <TableHead>{tt("adminSubscriptions.table.period")}</TableHead>
                  <TableHead>{tt("adminSubscriptions.table.usage")}</TableHead>
                  <TableHead>{tt("adminSubscriptions.table.status")}</TableHead>
                  <TableHead className="w-[200px]">{tt("adminSubscriptions.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{loading ? tt("adminSubscriptions.table.loading") : tt("adminSubscriptions.table.empty")}</TableCell></TableRow>
                ) : (
                  filtered.map((sub) => {
                    const meta = getStatusMeta(sub.status);
                    const days = daysUntilExpiry(sub.endDate);
                    const expiringSoon = days !== null && days > 0 && days <= 7 && (sub.status === "active" || sub.status === "trial");
                    const usage = checkUsage(sub);
                    const nearLimitCount = usage.filter((u) => u.isNearLimit).length;
                    const atLimitCount = usage.filter((u) => u.isAtLimit).length;
                    return (
                      <TableRow key={sub.id} className={sub.status === "cancelled" || sub.status === "suspended" ? "opacity-60" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sub.tenantName}</p>
                            <p className="text-xs text-muted-foreground">{sub.ownerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary">{planLabel(sub.plan)}</Badge></TableCell>
                        <TableCell className="text-sm">{tt(`adminSubscriptions.cycle.${sub.billingCycle}`)}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {sub.price === 0 ? tt("adminSubscriptions.table.free") : `৳${sub.price.toLocaleString()}`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>{sub.startDate}</div>
                          <div className="flex items-center gap-1">
                            {sub.endDate || "—"}
                            {expiringSoon && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                          </div>
                          {sub.status === "trial" && sub.trialEndDate && (
                            <div className="text-blue-600 text-[10px]">{tt("adminSubscriptions.table.trialEnds", { date: sub.trialEndDate })}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {atLimitCount > 0 ? (
                            <Badge variant="destructive" className="text-[10px]">{tt("adminSubscriptions.table.atLimit", { count: atLimitCount })}</Badge>
                          ) : nearLimitCount > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-[10px]">{tt("adminSubscriptions.table.nearLimit", { count: nearLimitCount })}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{tt("adminSubscriptions.table.ok")}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>{statusLabel(sub.status)}</span>
                          {sub.autoRenew && sub.status === "active" && <span className="text-[10px] text-muted-foreground ml-1">🔄</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.view")} onClick={() => openAction(sub, "view")}><Eye className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.edit")} onClick={() => openEdit(sub)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.delete")} onClick={() => setDeleteSub(sub)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                            {(sub.status === "active" || sub.status === "trial") && (
                              <>
                                {getUpgradePlans(sub.plan).length > 0 && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.upgrade")} onClick={() => openAction(sub, "upgrade")}><ArrowUpCircle className="h-3.5 w-3.5 text-green-600" /></Button>
                                )}
                                {getDowngradePlans(sub.plan).length > 0 && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.downgrade")} onClick={() => openAction(sub, "downgrade")}><ArrowDownCircle className="h-3.5 w-3.5 text-yellow-600" /></Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.extend")} onClick={() => openAction(sub, "extend")}><CalendarPlus className="h-3.5 w-3.5 text-blue-600" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.suspend")} onClick={() => openAction(sub, "suspend")}><Pause className="h-3.5 w-3.5 text-orange-600" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.cancel")} onClick={() => openAction(sub, "cancel")}><XCircle className="h-3.5 w-3.5 text-destructive" /></Button>
                              </>
                            )}
                            {(sub.status === "expired" || sub.status === "overdue") && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.renew")} onClick={() => openAction(sub, "renew")}><RefreshCcw className="h-3.5 w-3.5 text-green-600" /></Button>
                            )}
                            {sub.status === "suspended" && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" title={tt("adminSubscriptions.actions.reactivate")} onClick={() => openAction(sub, "reactivate")}><Play className="h-3.5 w-3.5 text-green-600" /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ═══════ ACTION DIALOG ═══════ */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setActionType(null); setSelectedSub(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedSub && actionType === "view" && (() => {
              const usage = checkUsage(selectedSub);
              return (
                <>
                  <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.viewTitle", { name: selectedSub.tenantName })}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">{tt("adminSubscriptions.details.plan")}</span>
                      <Badge variant="secondary" className="w-fit">{planLabel(selectedSub.plan)}</Badge>
                      <span className="text-muted-foreground">{tt("adminSubscriptions.details.billing")}</span>
                      <span>{tt(`adminSubscriptions.cycle.${selectedSub.billingCycle}`)}</span>
                      <span className="text-muted-foreground">{tt("adminSubscriptions.details.price")}</span>
                      <span className="font-semibold">{selectedSub.price === 0 ? tt("adminSubscriptions.table.free") : `৳${selectedSub.price.toLocaleString()}/${selectedSub.billingCycle === "yearly" ? tt("adminSubscriptions.cycle.yr") : tt("adminSubscriptions.cycle.mo")}`}</span>
                      <span className="text-muted-foreground">{tt("adminSubscriptions.details.status")}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-fit ${getStatusMeta(selectedSub.status).color}`}>{statusLabel(selectedSub.status)}</span>
                      <span className="text-muted-foreground">{tt("adminSubscriptions.details.period")}</span>
                      <span>{selectedSub.startDate} → {selectedSub.endDate || "—"}</span>
                      <span className="text-muted-foreground">{tt("adminSubscriptions.details.autoRenew")}</span>
                      <span>{selectedSub.autoRenew ? tt("adminSubscriptions.details.yes") : tt("adminSubscriptions.details.no")}</span>
                      {selectedSub.trialEndDate && <><span className="text-muted-foreground">{tt("adminSubscriptions.details.trialEnds")}</span><span className="text-blue-600">{selectedSub.trialEndDate}</span></>}
                      {selectedSub.cancelReason && <><span className="text-muted-foreground">{tt("adminSubscriptions.details.cancelReason")}</span><span className="text-destructive">{selectedSub.cancelReason}</span></>}
                      {selectedSub.suspendReason && <><span className="text-muted-foreground">{tt("adminSubscriptions.details.suspendReason")}</span><span className="text-orange-600">{selectedSub.suspendReason}</span></>}
                    </div>

                    <Separator />
                    <h4 className="text-sm font-medium">{tt("adminSubscriptions.details.usageLimits")}</h4>
                    <div className="grid gap-2">
                      {usage.map((u) => (
                        <div key={u.resource} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className={u.isAtLimit ? "text-destructive font-medium" : u.isNearLimit ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                              {u.resource}
                            </span>
                            <span className="text-muted-foreground">
                              {u.used.toLocaleString()} / {u.isUnlimited ? "∞" : u.limit.toLocaleString()}
                              {u.isAtLimit && " ⚠️"}
                            </span>
                          </div>
                          {!u.isUnlimited && u.limit > 0 && (
                            <Progress value={u.percentage} className={`h-1.5 ${u.isAtLimit ? "[&>div]:bg-destructive" : u.isNearLimit ? "[&>div]:bg-amber-500" : ""}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogClose asChild><Button variant="outline" className="mt-4 w-full">{tt("adminSubscriptions.actions.close")}</Button></DialogClose>
                </>
              );
            })()}

            {selectedSub && actionType === "upgrade" && (
              <>
                <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.upgradeTitle", { name: selectedSub.tenantName })}</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">{tt("adminSubscriptions.dialog.current")} <Badge variant="secondary" className="ml-1">{planLabel(selectedSub.plan)}</Badge> ({tt(`adminSubscriptions.cycle.${selectedSub.billingCycle}`)})</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{tt("adminSubscriptions.fields.newPlan")}</Label>
                      <Select value={newPlan} onValueChange={(v) => setNewPlan(v as PlanType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {getUpgradePlans(selectedSub.plan).map((p) => {
                            const plan = PLANS.find((x) => x.id === p);
                            return <SelectItem key={p} value={p}>{plan?.name} (৳{plan?.price}/{tt("adminSubscriptions.cycle.mo")})</SelectItem>;
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{tt("adminSubscriptions.fields.billingCycle")}</Label>
                      <Select value={newCycle} onValueChange={(v) => setNewCycle(v as BillingCycle)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{tt("adminSubscriptions.cycle.monthly")}</SelectItem>
                          <SelectItem value="yearly">{tt("adminSubscriptions.cycle.yearlySave")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleUpgrade} className="w-full">{tt("adminSubscriptions.actions.confirmUpgrade")}</Button>
                </div>
              </>
            )}

            {selectedSub && actionType === "downgrade" && (
              <>
                <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.downgradeTitle", { name: selectedSub.tenantName })}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{tt("adminSubscriptions.fields.newPlan")}</Label>
                      <Select value={newPlan} onValueChange={(v) => setNewPlan(v as PlanType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {getDowngradePlans(selectedSub.plan).map((p) => {
                            const plan = PLANS.find((x) => x.id === p);
                            return <SelectItem key={p} value={p}>{plan?.name} (৳{plan?.price}/{tt("adminSubscriptions.cycle.mo")})</SelectItem>;
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{tt("adminSubscriptions.fields.billingCycle")}</Label>
                      <Select value={newCycle} onValueChange={(v) => setNewCycle(v as BillingCycle)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{tt("adminSubscriptions.cycle.monthly")}</SelectItem>
                          <SelectItem value="yearly">{tt("adminSubscriptions.cycle.yearly")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleDowngrade} variant="secondary" className="w-full">{tt("adminSubscriptions.actions.confirmDowngrade")}</Button>
                </div>
              </>
            )}

            {selectedSub && actionType === "extend" && (
              <>
                <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.extendTitle", { name: selectedSub.tenantName })}</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">{tt("adminSubscriptions.dialog.currentExpiry", { date: selectedSub.endDate || "N/A" })}</p>
                <div className="flex gap-4 mt-2">
                  <Input type="number" min={1} value={extendValue} onChange={(e) => setExtendValue(e.target.value)} className="w-24" />
                  <Select value={extendUnit} onValueChange={(v) => setExtendUnit(v as "days" | "months")}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">{tt("adminSubscriptions.fields.days")}</SelectItem>
                      <SelectItem value="months">{tt("adminSubscriptions.fields.months")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleExtend} className="w-full mt-4">{tt("adminSubscriptions.actions.extendSubscription")}</Button>
              </>
            )}

            {selectedSub && actionType === "renew" && (
              <>
                <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.renewTitle", { name: selectedSub.tenantName })}</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">
                  {tt("adminSubscriptions.dialog.renewMsg", { plan: planLabel(selectedSub.plan), cycle: tt(`adminSubscriptions.cycle.${selectedSub.billingCycle}`), price: selectedSub.price.toLocaleString() })}
                </p>
                <Button onClick={handleRenew} className="w-full mt-4">{tt("adminSubscriptions.actions.confirmRenewal")}</Button>
              </>
            )}

            {selectedSub && actionType === "suspend" && (
              <>
                <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.suspendTitle", { name: selectedSub.tenantName })}</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">{tt("adminSubscriptions.dialog.suspendMsg")}</p>
                <div className="space-y-2 mt-2">
                  <Label>{tt("adminSubscriptions.fields.reason")}</Label>
                  <Textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder={tt("adminSubscriptions.fields.reasonPlaceholder")} rows={3} />
                </div>
                <Button onClick={handleSuspend} variant="destructive" className="w-full mt-4" disabled={!actionReason.trim()}>{tt("adminSubscriptions.actions.suspend")}</Button>
              </>
            )}

            {selectedSub && actionType === "reactivate" && (
              <>
                <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.reactivateTitle", { name: selectedSub.tenantName })}</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">{tt("adminSubscriptions.dialog.reactivateMsg")}</p>
                <Button onClick={handleReactivate} className="w-full mt-4">{tt("adminSubscriptions.actions.reactivate")}</Button>
              </>
            )}

            {selectedSub && actionType === "cancel" && (
              <>
                <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.cancelTitle", { name: selectedSub.tenantName })}</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">{tt("adminSubscriptions.dialog.cancelMsg")}</p>
                <div className="space-y-2 mt-2">
                  <Label>{tt("adminSubscriptions.fields.cancelReason")}</Label>
                  <Textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder={tt("adminSubscriptions.fields.cancelReasonPlaceholder")} rows={3} />
                </div>
                <Button onClick={handleCancel} variant="destructive" className="w-full mt-4" disabled={!actionReason.trim()}>{tt("adminSubscriptions.actions.confirmCancellation")}</Button>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit subscription */}
        <Dialog open={!!editSub} onOpenChange={(o) => !o && setEditSub(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{tt("adminSubscriptions.dialog.editTitle", { name: editSub?.tenantName || "" })}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>{tt("adminSubscriptions.fields.plan")}</Label>
                <Select value={editPlan} onValueChange={(v) => setEditPlan(v as PlanType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLANS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{tt("adminSubscriptions.fields.status")}</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as SubscriptionStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_META.map((s) => <SelectItem key={s.value} value={s.value}>{statusLabel(s.value)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{tt("adminSubscriptions.fields.expiryDate")}</Label>
                <Input type="date" value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditSub(null)} disabled={savingEdit}>{tt("adminSubscriptions.actions.cancel")}</Button>
              <Button onClick={saveEdit} disabled={savingEdit}>{savingEdit ? tt("adminSubscriptions.actions.saving") : tt("adminSubscriptions.actions.saveChanges")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete subscription */}
        <AlertDialog open={!!deleteSub} onOpenChange={(o) => !o && setDeleteSub(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{tt("adminSubscriptions.dialog.deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                <Trans
                  i18nKey="adminSubscriptions.dialog.deleteDesc"
                  values={{ name: deleteSub?.tenantName || "" }}
                  components={{ 1: <strong /> }}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>{tt("adminSubscriptions.actions.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleting ? tt("adminSubscriptions.actions.deleting") : tt("adminSubscriptions.actions.deletePermanently")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
