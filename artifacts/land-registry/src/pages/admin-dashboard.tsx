import { useGetDashboard, useGetRevenueStats, useGetRecentOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, TrendingUp, Users, ShoppingBag, FileText, Activity } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboard();
  const { data: revenue, isLoading: revenueLoading } = useGetRevenueStats({ period: 'month' });
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrders({ limit: 5 });

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time metrics and recent activity across all services.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-2xl font-bold font-heading text-primary">£{((stats?.todayRevenue || 0) / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">+14% from yesterday</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (All Time)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold font-heading text-primary">£{((stats?.totalRevenue || 0) / 100).toFixed(2)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Orders</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold font-heading text-primary">{stats?.newOrders || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold font-heading text-primary">{(stats?.conversionRate || 0).toFixed(1)}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="font-heading">Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            {revenueLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full mx-4" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue?.dailyRevenue || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis tickFormatter={(val) => `£${val/100}`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      formatter={(value: number) => [`£${(value/100).toFixed(2)}`, 'Revenue']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-3 shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="font-heading">Recent Orders</CardTitle>
              <CardDescription>Latest customer requests</CardDescription>
            </div>
            <Link href="/admin/orders" className="text-sm font-medium text-accent hover:text-accent/80 flex items-center">
              View all <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders?.map(order => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/5 p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-semibold text-primary">{order.orderNumber}</p>
                          <p className="text-sm font-medium">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-bold text-primary">£{(order.totalAmount / 100).toFixed(2)}</span>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 font-semibold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">No recent orders found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
