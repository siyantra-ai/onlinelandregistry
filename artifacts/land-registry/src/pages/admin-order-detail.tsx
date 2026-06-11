import { useGetOrder, useUpdateOrder, useAddOrderNote, OrderUpdateStatus } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Phone, MapPin, Building, CreditCard, Clock, FileText, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetOrderQueryKey, getListOrdersQueryKey, getGetRecentOrdersQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) } });
  const updateOrder = useUpdateOrder();
  const addNote = useAddOrderNote();

  const [noteText, setNoteText] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_docs': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'refunded': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (newStatus: OrderUpdateStatus) => {
    updateOrder.mutate({ id: orderId, data: { status: newStatus } }, {
      onSuccess: (updatedOrder) => {
        toast({ title: "Status Updated", description: `Order status changed to ${newStatus.replace('_', ' ')}` });
        // Optimistically update cache
        queryClient.setQueryData(getGetOrderQueryKey(orderId), updatedOrder);
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentOrdersQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      }
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNote.mutate({ id: orderId, data: { note: noteText, author: "Admin User" } }, {
      onSuccess: () => {
        toast({ title: "Note Added", description: "Staff note saved successfully." });
        setNoteText("");
        // Invalidate to refetch order and get updated activity log (which is part of the detail in a real app, assuming staffNotes string for now)
        // Wait, the API spec says addNote returns ActivityLog, but Order has staffNotes as a string. Let's invalidate.
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
      }
    });
  };

  if (isLoading || !order) {
    return <div className="p-8 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    </div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-heading font-bold text-primary tracking-tight">Order {order.orderNumber}</h1>
            <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Placed on {new Date(order.createdAt).toLocaleString('en-GB')}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Select value={order.status} onValueChange={(val) => handleStatusChange(val as OrderUpdateStatus)}>
            <SelectTrigger className="w-[180px] font-medium">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="awaiting_docs">Awaiting Docs</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Send className="w-4 h-4" /> Send Documents
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" /> Service Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Service Ordered</h4>
                  <p className="font-medium text-lg text-primary">{order.serviceName}</p>
                  {order.addons && order.addons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {order.addons.map(addon => (
                        <Badge key={addon} variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">
                          + {addon.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fulfillment Speed</h4>
                  <div className="flex items-center gap-2 font-medium text-primary">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{order.trackingType?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
              
              <Separator />

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Property Target</h4>
                <div className="bg-gray-50 border rounded-md p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-primary">{order.propertyAddress}</p>
                      {order.postcode && <p className="text-sm text-muted-foreground">{order.postcode}</p>}
                    </div>
                  </div>
                  {order.titleNumber && (
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Provided Title No:</span>
                      <span className="font-mono font-bold text-primary">{order.titleNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tenure: <span className="font-medium text-foreground capitalize">{order.tenure || 'Unspecified'}</span></span>
                    <span className="text-muted-foreground mx-2">•</span>
                    <span className="text-sm text-muted-foreground">Region: <span className="font-medium text-foreground capitalize">{order.country?.replace('_', ' ')}</span></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <User className="w-5 h-5 text-accent" /> Staff Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 min-h-[100px] whitespace-pre-wrap text-sm text-amber-900">
                {order.staffNotes || "No staff notes yet."}
              </div>
              <div className="space-y-3">
                <Textarea 
                  placeholder="Add an internal note..." 
                  className="min-h-[80px]"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button onClick={handleAddNote} disabled={addNote.isPending || !noteText.trim()}>
                  {addNote.isPending ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <User className="w-5 h-5 text-accent" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="font-semibold text-base text-primary mb-2">{order.customerName}</div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${order.customerEmail}`} className="hover:text-primary hover:underline">{order.customerEmail}</a>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${order.customerPhone}`} className="hover:text-primary hover:underline">{order.customerPhone}</a>
                </div>
              )}
              <div className="flex items-start gap-3 text-muted-foreground pt-2">
                <MapPin className="w-4 h-4 mt-1" />
                <div className="flex-1 whitespace-pre-wrap">{order.customerAddress || 'No billing address provided'}</div>
              </div>

              <div className="pt-4 border-t mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Pref:</span>
                  <span className="font-medium capitalize">{order.deliveryType?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notifications:</span>
                  <span className="font-medium capitalize">{order.notificationType}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" /> Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registry Fees</span>
                  <span>£{((order.documentFee || 0)/100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>£{((order.serviceFee || 0)/100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT</span>
                  <span>£{((order.vatAmount || 0)/100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-primary pt-3 border-t">
                  <span>Total Paid</span>
                  <span>£{(order.totalAmount/100).toFixed(2)}</span>
                </div>
                {order.paidAt && (
                  <div className="text-xs text-muted-foreground text-right mt-1">
                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
