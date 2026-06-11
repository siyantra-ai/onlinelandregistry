import { useListServices, useCalculatePrice, useCreateOrder, useCreateCheckoutSession, OrderInputCountry, OrderInputDeliveryType, OrderInputNotificationType, OrderInputTrackingType, useLookupPostcode } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, Check, Search, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for wizard state
interface OrderState {
  serviceId: number | null;
  propertyCount: number;
  country: OrderInputCountry;
  tenure: string;
  titleNumber: string;
  postcode: string;
  propertyAddress: string;
  lat: number | null;
  lng: number | null;
  addons: string[];
  
  customerTitle: string;
  customerName: string;
  customerEmail: string;
  customerEmailConfirm: string;
  customerPhone: string;
  customerAddress: string;

  trackingType: OrderInputTrackingType;
  deliveryType: OrderInputDeliveryType;
  notificationType: OrderInputNotificationType;

  agreedToWaiveCancel: boolean;
}

export default function OrderWizard() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialServiceSlug = searchParams.get("service");
  const { toast } = useToast();

  const { data: services, isLoading: servicesLoading } = useListServices();
  const createOrder = useCreateOrder();
  const createCheckoutSession = useCreateCheckoutSession();

  const [step, setStep] = useState(1);
  const [state, setState] = useState<OrderState>({
    serviceId: null,
    propertyCount: 1,
    country: "england_wales",
    tenure: "unsure",
    titleNumber: "",
    postcode: "",
    propertyAddress: "",
    lat: null,
    lng: null,
    addons: [],
    
    customerTitle: "Mr",
    customerName: "",
    customerEmail: "",
    customerEmailConfirm: "",
    customerPhone: "",
    customerAddress: "",

    trackingType: "standard",
    deliveryType: "pdf_only",
    notificationType: "email",

    agreedToWaiveCancel: false
  });

  const [postcodeSearch, setPostcodeSearch] = useState("");
  const { data: postcodeResult, isLoading: postcodeLoading, refetch: searchPostcode } = useLookupPostcode({ postcode: postcodeSearch }, { query: { enabled: false } });

  // Initialize service from URL param
  useEffect(() => {
    if (services && initialServiceSlug && !state.serviceId) {
      const service = services.find(s => s.slug === initialServiceSlug);
      if (service) {
        setState(prev => ({ ...prev, serviceId: service.id }));
      }
    } else if (services && !state.serviceId) {
      setState(prev => ({ ...prev, serviceId: services[0].id }));
    }
  }, [services, initialServiceSlug]);

  const handleNext = () => {
    // Basic validation
    if (step === 1) {
      if (!state.serviceId) {
        toast({ title: "Error", description: "Please select a service", variant: "destructive" });
        return;
      }
      if (!state.propertyAddress) {
        toast({ title: "Error", description: "Please provide a property address", variant: "destructive" });
        return;
      }
    }
    if (step === 2) {
      if (!state.customerName || !state.customerEmail || !state.customerAddress) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
        return;
      }
      if (state.customerEmail !== state.customerEmailConfirm) {
        toast({ title: "Error", description: "Emails do not match", variant: "destructive" });
        return;
      }
    }
    if (step === 3) {
      // Nothing strict here
    }
    setStep(s => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateState = (updates: Partial<OrderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const calculatePriceInput = {
    serviceId: state.serviceId || 1,
    propertyCount: state.propertyCount,
    country: state.country as "england_wales" | "scotland",
    trackingType: state.trackingType as "standard" | "fast_track" | "super_fast_track",
    deliveryType: state.deliveryType as "pdf_only" | "pdf_printed",
    notificationType: state.notificationType as "email" | "sms" | "both",
    addons: state.addons
  };

  const { mutate: calcPrice, data: priceBreakdown, isPending: priceCalculating } = useCalculatePrice();

  useEffect(() => {
    if (step === 4 && state.serviceId) {
      calcPrice({ data: calculatePriceInput });
    }
  }, [step, state.serviceId, state.propertyCount, state.country, state.trackingType, state.deliveryType, state.notificationType, state.addons]);

  const handleSubmit = async () => {
    if (!state.agreedToWaiveCancel) {
      toast({ title: "Required", description: "You must agree to waive the 14-day cancellation period to proceed.", variant: "destructive" });
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        data: {
          serviceId: state.serviceId as number,
          propertyCount: state.propertyCount,
          country: state.country,
          trackingType: state.trackingType,
          deliveryType: state.deliveryType,
          notificationType: state.notificationType,
          addons: state.addons,
          customerTitle: state.customerTitle,
          customerName: state.customerName,
          customerEmail: state.customerEmail,
          customerEmailConfirm: state.customerEmailConfirm,
          customerPhone: state.customerPhone,
          customerAddress: state.customerAddress,
          tenure: state.tenure,
          titleNumber: state.titleNumber,
          postcode: state.postcode,
          propertyAddress: state.propertyAddress,
          lat: state.lat,
          lng: state.lng,
          agreedToWaiveCancel: state.agreedToWaiveCancel
        }
      });

      const session = await createCheckoutSession.mutateAsync({
        data: { orderId: order.id }
      });

      window.location.href = session.url;
    } catch (error) {
      toast({ title: "Error", description: "Failed to create order. Please try again.", variant: "destructive" });
    }
  };

  if (servicesLoading) {
    return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const selectedService = services?.find(s => s.id === state.serviceId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-200px)]">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted -z-10 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          {[
            { num: 1, label: "Property" },
            { num: 2, label: "Details" },
            { num: 3, label: "Finalise" },
            { num: 4, label: "Pay" }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                step >= s.num ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <Card className="shadow-lg border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 bg-accent h-full"></div>
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="text-2xl font-heading text-primary">
            {step === 1 && "Property Details"}
            {step === 2 && "Your Details"}
            {step === 3 && "Processing & Delivery"}
            {step === 4 && "Review & Pay"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Tell us which property you need documents for."}
            {step === 2 && "Where should we send your documents?"}
            {step === 3 && "How fast do you need them?"}
            {step === 4 && "Secure your order and start processing."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="service" className="text-base">Select Service</Label>
                    <Select value={state.serviceId?.toString() || ""} onValueChange={(val) => updateState({ serviceId: parseInt(val) })}>
                      <SelectTrigger id="service" className="h-12 text-base">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name} — from £{(s.basePrice/100).toFixed(2)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="country" className="text-base">Country</Label>
                      <Select value={state.country} onValueChange={(val) => updateState({ country: val as any })}>
                        <SelectTrigger id="country" className="h-12">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="england_wales">England & Wales</SelectItem>
                          <SelectItem value="scotland">Scotland (Registers of Scotland)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="tenure" className="text-base">Tenure Type</Label>
                      <Select value={state.tenure} onValueChange={(val) => updateState({ tenure: val })}>
                        <SelectTrigger id="tenure" className="h-12">
                          <SelectValue placeholder="Select tenure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freehold">Freehold</SelectItem>
                          <SelectItem value="leasehold">Leasehold</SelectItem>
                          <SelectItem value="unsure">Unsure / Any</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base block">Find Property</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter Postcode (e.g. SW1A 1AA)" 
                        value={postcodeSearch} 
                        onChange={(e) => setPostcodeSearch(e.target.value)}
                        className="h-12"
                      />
                      <Button onClick={() => searchPostcode()} type="button" className="h-12 w-24 bg-secondary hover:bg-secondary/80 text-secondary-foreground" disabled={postcodeLoading}>
                        {postcodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </Button>
                    </div>
                    {postcodeResult?.addresses && postcodeResult.addresses.length > 0 && (
                      <div className="mt-2">
                        <Select onValueChange={(val) => updateState({ propertyAddress: val })}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select an address" />
                          </SelectTrigger>
                          <SelectContent>
                            {postcodeResult.addresses.map((addr, i) => (
                              <SelectItem key={i} value={addr}>{addr}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="address-manual" className="text-sm font-normal text-muted-foreground">Or enter address manually</Label>
                      <Input 
                        id="address-manual"
                        placeholder="Full property address" 
                        value={state.propertyAddress}
                        onChange={(e) => updateState({ propertyAddress: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="titleNumber">Title Number (Optional)</Label>
                    <Input 
                      id="titleNumber"
                      placeholder="e.g. NGL12345" 
                      value={state.titleNumber}
                      onChange={(e) => updateState({ titleNumber: e.target.value })}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">If you know the official title number, it can speed up processing.</p>
                  </div>

                  <Separator />

                  <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border">
                    <Label className="text-base">Recommended Add-ons</Label>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="addon-plan" 
                        checked={state.addons.includes("title_plan")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateState({ addons: [...state.addons, "title_plan"] });
                          } else {
                            updateState({ addons: state.addons.filter(a => a !== "title_plan") });
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="addon-plan"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Add Title Plan (+£36.00)
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Shows the official boundaries of the property. <a href="#" className="text-primary hover:underline">View sample</a>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="addon-flood" 
                        checked={state.addons.includes("flood_risk")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateState({ addons: [...state.addons, "flood_risk"] });
                          } else {
                            updateState({ addons: state.addons.filter(a => a !== "flood_risk") });
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="addon-flood"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Add Flood Risk Report (+£14.95)
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive environmental risk assessment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="title">Title</Label>
                      <Select value={state.customerTitle} onValueChange={(val) => updateState({ customerTitle: val })}>
                        <SelectTrigger id="title" className="h-12">
                          <SelectValue placeholder="Title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Mrs">Mrs</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                          <SelectItem value="Miss">Miss</SelectItem>
                          <SelectItem value="Dr">Dr</SelectItem>
                          <SelectItem value="Company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 md:col-span-3">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName"
                        placeholder="John Doe" 
                        value={state.customerName}
                        onChange={(e) => updateState({ customerName: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="john@example.com" 
                        value={state.customerEmail}
                        onChange={(e) => updateState({ customerEmail: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="emailConfirm">Confirm Email Address</Label>
                      <Input 
                        id="emailConfirm"
                        type="email"
                        placeholder="john@example.com" 
                        value={state.customerEmailConfirm}
                        onChange={(e) => updateState({ customerEmailConfirm: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone">Mobile Number (Optional)</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      placeholder="07..." 
                      value={state.customerPhone}
                      onChange={(e) => updateState({ customerPhone: e.target.value })}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">Required if you select SMS notifications.</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label htmlFor="billingAddress">Your Postal Address</Label>
                    <Input 
                      id="billingAddress"
                      placeholder="123 High Street, London, SW1A 1AA" 
                      value={state.customerAddress}
                      onChange={(e) => updateState({ customerAddress: e.target.value })}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">Used for billing and any physical document deliveries.</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-heading">Processing Speed</Label>
                    <RadioGroup 
                      value={state.trackingType} 
                      onValueChange={(val) => updateState({ trackingType: val as any })}
                      className="grid gap-4"
                    >
                      <Label htmlFor="speed-standard" className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" id="speed-standard" />
                          <div>
                            <div className="font-semibold text-primary">Standard Processing</div>
                            <div className="text-sm text-muted-foreground">Usually 1-2 working days</div>
                          </div>
                        </div>
                        <div className="font-semibold text-primary">Free</div>
                      </Label>
                      
                      <Label htmlFor="speed-fast" className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="fast_track" id="speed-fast" />
                          <div>
                            <div className="font-semibold text-primary">Fast-Track</div>
                            <div className="text-sm text-muted-foreground">Priority queue, usually within hours</div>
                          </div>
                        </div>
                        <div className="font-semibold text-primary">+£10.00</div>
                      </Label>

                      <Label htmlFor="speed-super" className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="super_fast_track" id="speed-super" />
                          <div>
                            <div className="font-semibold text-primary">Super-Fast Track</div>
                            <div className="text-sm text-muted-foreground">Jump the queue, processed immediately</div>
                          </div>
                        </div>
                        <div className="font-semibold text-primary">+£20.00</div>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-lg font-heading">Delivery Format</Label>
                    <RadioGroup 
                      value={state.deliveryType} 
                      onValueChange={(val) => updateState({ deliveryType: val as any })}
                      className="grid gap-4"
                    >
                      <Label htmlFor="del-pdf" className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="pdf_only" id="del-pdf" />
                          <div>
                            <div className="font-semibold text-primary">PDF Only</div>
                            <div className="text-sm text-muted-foreground">Sent securely via email</div>
                          </div>
                        </div>
                        <div className="font-semibold text-primary">Free</div>
                      </Label>
                      
                      <Label htmlFor="del-print" className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="pdf_printed" id="del-print" />
                          <div>
                            <div className="font-semibold text-primary">PDF + Printed Copy</div>
                            <div className="text-sm text-muted-foreground">Emailed plus physical copy posted 1st Class</div>
                          </div>
                        </div>
                        <div className="font-semibold text-primary">+£9.95</div>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-lg font-heading">Notifications</Label>
                    <RadioGroup 
                      value={state.notificationType} 
                      onValueChange={(val) => updateState({ notificationType: val as any })}
                      className="grid gap-4 md:grid-cols-2"
                    >
                      <Label htmlFor="notif-email" className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="email" id="notif-email" />
                          <div className="font-semibold text-primary">Email Updates</div>
                        </div>
                        <div className="font-semibold text-primary text-sm">Free</div>
                      </Label>
                      
                      <Label htmlFor="notif-sms" className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="both" id="notif-sms" />
                          <div className="font-semibold text-primary">Email & SMS</div>
                        </div>
                        <div className="font-semibold text-primary text-sm">+£4.95</div>
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  {priceCalculating || !priceBreakdown ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-muted-foreground font-medium">Calculating final price...</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-50 rounded-lg p-6 border border-border">
                        <h4 className="font-heading font-bold text-lg mb-4 text-primary">Order Summary</h4>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Service</span>
                            <span className="font-semibold text-foreground text-right">{selectedService?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Property</span>
                            <span className="font-semibold text-foreground text-right max-w-[60%] truncate" title={state.propertyAddress}>{state.propertyAddress}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Delivery</span>
                            <span className="font-semibold text-foreground text-right">{state.deliveryType === 'pdf_only' ? 'PDF Only' : 'PDF + Print'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Tracking</span>
                            <span className="font-semibold text-foreground text-right">{state.trackingType.replace(/_/g, ' ')}</span>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-3 text-sm">
                          {priceBreakdown.lineItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-medium text-foreground">£{(item.amount/100).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Total Document Fees (No VAT)</span>
                            <span className="font-semibold text-foreground">£{(priceBreakdown.documentFee/100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Service & Processing Fees</span>
                            <span className="font-semibold text-foreground">£{(priceBreakdown.serviceFee/100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">VAT (on services only)</span>
                            <span className="font-semibold text-foreground">£{(priceBreakdown.vatAmount/100).toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center pt-4 mt-2 border-t">
                            <span className="font-bold text-xl text-primary font-heading">Total to Pay</span>
                            <span className="font-bold text-2xl text-primary font-heading">£{(priceBreakdown.totalAmount/100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <Checkbox 
                          id="terms" 
                          checked={state.agreedToWaiveCancel}
                          onCheckedChange={(checked) => updateState({ agreedToWaiveCancel: checked as boolean })}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-snug cursor-pointer"
                          >
                            I request immediate processing of my order
                          </label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            By ticking this box, I consent to the immediate start of the service and acknowledge that I will lose my right to cancel within the 14-day cancellation period once the service has been fully performed.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span>256-bit encrypted secure checkout via Stripe</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="bg-muted/20 px-6 py-4 flex justify-between border-t border-border mt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="h-12 px-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : <div></div>}
          
          {step < 4 ? (
            <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 h-12 px-8 font-semibold">
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-10 font-bold shadow-md hover-elevate"
              disabled={createOrder.isPending || createCheckoutSession.isPending || priceCalculating || !state.agreedToWaiveCancel}
            >
              {(createOrder.isPending || createCheckoutSession.isPending) ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>Pay Now <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
