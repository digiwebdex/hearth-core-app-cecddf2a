import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search, Bell, RefreshCw, Download, Eye, Mail, MessageSquare,
  CheckCircle, XCircle, Clock, Settings, RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getDeliveryLog, getDeliveryStats, seedDeliveryLog, retryDelivery,
  EVENT_CONFIGS, type NotificationDelivery, type NotificationEventType,
  type DeliveryStatus,
} from "@/lib/notificationEngine";

const STATUS_META: Record<DeliveryStatus, { icon: typeof CheckCircle; className: string }> = {
  pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  sent: { icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  failed: { icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  retrying: { icon: RotateCcw, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
};

const EVENT_KEYS: NotificationEventType[] = [
  "lead_assigned", "quotation_sent", "quotation_approved", "booking_confirmed",
  "payment_received", "payment_overdue", "subscription_expiring",
];

const NotificationLog = () => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<NotificationDelivery[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState<NotificationDelivery | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [eventConfigs, setEventConfigs] = useState(EVENT_CONFIGS.map((e) => ({ ...e })));
  const { toast } = useToast();

  useEffect(() => {
    seedDeliveryLog();
    setDeliveries(getDeliveryLog());
  }, []);

  const stats = useMemo(() => getDeliveryStats(), [deliveries]);
  const eventLabel = (ev: NotificationEventType) => t(`notificationLog.events.${ev}`);
  const statusLabel = (s: DeliveryStatus) => t(`notificationLog.status.${s}`);

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const matchSearch = search === "" ||
        d.recipientName.toLowerCase().includes(search.toLowerCase()) ||
        d.recipient.toLowerCase().includes(search.toLowerCase()) ||
        d.message.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      const matchChannel = channelFilter === "all" || d.channel === channelFilter;
      const matchEvent = eventFilter === "all" || d.eventType === eventFilter;
      return matchSearch && matchStatus && matchChannel && matchEvent;
    });
  }, [deliveries, search, statusFilter, channelFilter, eventFilter]);

  const handleRetry = async (id: string) => {
    const result = await retryDelivery(id);
    if (result) {
      setDeliveries([...getDeliveryLog()]);
      toast({
        title: result.status === "sent" ? t("notificationLog.toast.retrySuccess") : t("notificationLog.toast.retryFailed"),
        description: result.failureReason || t("notificationLog.toast.sentOk"),
      });
    }
  };

  const handleExport = () => {
    const headers = ["Date", "Event", "Channel", "Recipient", "Name", "Status", "Message", "Attempts", "Failure Reason"];
    const rows = filtered.map((d) => [d.createdAt, eventLabel(d.eventType), d.channel, d.recipient, d.recipientName, d.status, d.message, d.attempts, d.failureReason || ""]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "notification-log.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("notificationLog.title")}</h1>
            <p className="text-muted-foreground">{t("notificationLog.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}><Settings className="mr-1 h-4 w-4" /> {t("notificationLog.configure")}</Button>
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1 h-4 w-4" /> {t("notificationLog.export")}</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Bell className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">{t("notificationLog.stats.total")}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.sent}</p><p className="text-xs text-muted-foreground">{t("notificationLog.stats.sent")}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><XCircle className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">{stats.failed}</p><p className="text-xs text-muted-foreground">{t("notificationLog.stats.failed")}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-yellow-500" /><div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-xs text-muted-foreground">{t("notificationLog.stats.pending")}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><MessageSquare className="h-8 w-8 text-pink-500" /><div><p className="text-2xl font-bold">{stats.bySms}</p><p className="text-xs text-muted-foreground">{t("notificationLog.stats.sms")}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Mail className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.byEmail}</p><p className="text-xs text-muted-foreground">{t("notificationLog.stats.email")}</p></div></div></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("notificationLog.filters.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("notificationLog.filters.event")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("notificationLog.filters.allEvents")}</SelectItem>
              {EVENT_KEYS.map((k) => <SelectItem key={k} value={k}>{eventLabel(k)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder={t("notificationLog.filters.channel")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("notificationLog.filters.allChannels")}</SelectItem>
              <SelectItem value="sms">{t("notificationLog.channels.sms")}</SelectItem>
              <SelectItem value="email">{t("notificationLog.channels.email")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder={t("notificationLog.filters.status")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("notificationLog.filters.allStatus")}</SelectItem>
              <SelectItem value="sent">{t("notificationLog.status.sent")}</SelectItem>
              <SelectItem value="failed">{t("notificationLog.status.failed")}</SelectItem>
              <SelectItem value="pending">{t("notificationLog.status.pending")}</SelectItem>
              <SelectItem value="retrying">{t("notificationLog.status.retrying")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>{t("notificationLog.table.title")} ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("notificationLog.table.event")}</TableHead>
                  <TableHead>{t("notificationLog.table.channel")}</TableHead>
                  <TableHead>{t("notificationLog.table.recipient")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("notificationLog.table.message")}</TableHead>
                  <TableHead>{t("notificationLog.table.status")}</TableHead>
                  <TableHead>{t("notificationLog.table.attempts")}</TableHead>
                  <TableHead>{t("notificationLog.table.date")}</TableHead>
                  <TableHead className="w-[100px]">{t("notificationLog.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{t("notificationLog.table.empty")}</TableCell></TableRow>
                ) : (
                  filtered.map((d) => {
                    const meta = STATUS_META[d.status];
                    const StatusIcon = meta.icon;
                    return (
                      <TableRow key={d.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{eventLabel(d.eventType)}</Badge>
                        </TableCell>
                        <TableCell>
                          {d.channel === "sms" ? <MessageSquare className="h-4 w-4 text-pink-500" /> : <Mail className="h-4 w-4 text-blue-500" />}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{d.recipientName}</p>
                            <p className="text-[10px] text-muted-foreground">{d.recipient}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[250px]">
                          <p className="text-xs text-muted-foreground truncate">{d.message}</p>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.className}`}>
                            <StatusIcon className="h-3 w-3" />{statusLabel(d.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm">{d.attempts}/{d.maxAttempts}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedDelivery(d); setDetailOpen(true); }}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {d.status === "failed" && d.attempts < d.maxAttempts && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" title={t("notificationLog.table.retry")} onClick={() => handleRetry(d.id)}>
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
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

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t("notificationLog.detail.title")}</DialogTitle></DialogHeader>
            {selectedDelivery && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <span className="text-muted-foreground">{t("notificationLog.detail.event")}</span>
                  <Badge variant="outline" className="w-fit">{eventLabel(selectedDelivery.eventType)}</Badge>
                  <span className="text-muted-foreground">{t("notificationLog.detail.channel")}</span>
                  <span className="capitalize">{t(`notificationLog.channels.${selectedDelivery.channel}`)}</span>
                  <span className="text-muted-foreground">{t("notificationLog.detail.recipient")}</span>
                  <span className="font-medium">{selectedDelivery.recipientName}</span>
                  <span className="text-muted-foreground">{t("notificationLog.detail.address")}</span>
                  <span className="font-mono text-xs">{selectedDelivery.recipient}</span>
                  <span className="text-muted-foreground">{t("notificationLog.detail.status")}</span>
                  {(() => { const m = STATUS_META[selectedDelivery.status]; return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit ${m.className}`}>{statusLabel(selectedDelivery.status)}</span>; })()}
                  <span className="text-muted-foreground">{t("notificationLog.detail.attempts")}</span>
                  <span>{selectedDelivery.attempts} / {selectedDelivery.maxAttempts}</span>
                  <span className="text-muted-foreground">{t("notificationLog.detail.created")}</span>
                  <span>{new Date(selectedDelivery.createdAt).toLocaleString()}</span>
                  {selectedDelivery.sentAt && (<><span className="text-muted-foreground">{t("notificationLog.detail.sentAt")}</span><span>{new Date(selectedDelivery.sentAt).toLocaleString()}</span></>)}
                  {selectedDelivery.failureReason && (<><span className="text-muted-foreground">{t("notificationLog.detail.failureReason")}</span><span className="text-destructive text-xs">{selectedDelivery.failureReason}</span></>)}
                  <span className="text-muted-foreground">{t("notificationLog.detail.tenant")}</span>
                  <span>{selectedDelivery.tenantName}</span>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs font-medium mb-1">{t("notificationLog.detail.message")}</p>
                  <p className="text-sm">{selectedDelivery.message}</p>
                </div>
                {selectedDelivery.status === "failed" && selectedDelivery.attempts < selectedDelivery.maxAttempts && (
                  <Button className="w-full" onClick={() => { handleRetry(selectedDelivery.id); setDetailOpen(false); }}>
                    <RefreshCw className="mr-2 h-4 w-4" /> {t("notificationLog.detail.retryBtn")}
                  </Button>
                )}
              </div>
            )}
            <DialogClose asChild><Button variant="outline" className="w-full">{t("notificationLog.detail.close")}</Button></DialogClose>
          </DialogContent>
        </Dialog>

        {/* Config Dialog */}
        <Dialog open={configOpen} onOpenChange={setConfigOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t("notificationLog.config.title")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("notificationLog.config.intro")}</p>
            <div className="space-y-4 py-2">
              {eventConfigs.map((config, i) => (
                <div key={config.type} className="rounded-md border p-3 space-y-2">
                  <div>
                    <p className="text-sm font-medium">{eventLabel(config.type as NotificationEventType)}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.channels.sms}
                        onCheckedChange={(v) => {
                          const updated = [...eventConfigs];
                          updated[i] = { ...updated[i], channels: { ...updated[i].channels, sms: v } };
                          setEventConfigs(updated);
                        }}
                      />
                      <Label className="text-xs">{t("notificationLog.config.sms")}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.channels.email}
                        onCheckedChange={(v) => {
                          const updated = [...eventConfigs];
                          updated[i] = { ...updated[i], channels: { ...updated[i].channels, email: v } };
                          setEventConfigs(updated);
                        }}
                      />
                      <Label className="text-xs">{t("notificationLog.config.email")}</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => { setConfigOpen(false); toast({ title: t("notificationLog.config.saved") }); }}>{t("notificationLog.config.save")}</Button>
            <DialogClose asChild><Button variant="outline" className="w-full">{t("notificationLog.config.cancel")}</Button></DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default NotificationLog;
