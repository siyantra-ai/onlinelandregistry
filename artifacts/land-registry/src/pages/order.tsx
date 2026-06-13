import { useListServices, useCalculatePrice, useCreateOrder, useCreateCheckoutSession, OrderInputCountry, OrderInputDeliveryType, OrderInputNotificationType, OrderInputTrackingType, useLookupPostcode, getLookupPostcodeQueryKey } from "@workspace/api-client-react";
import { useState, useEffect, lazy, Suspense } from "react";
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
import { Loader2, ArrowRight, ArrowLeft, Check, Search, ShieldCheck, Map, Bell, Sparkles, Clock, Zap, FileText, Mail, Building2, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MapPicker = lazy(() => import("@/components/ui/MapPicker"));

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

  const { data: apiServices, isLoading: servicesLoading } = useListServices();
  const services = Array.isArray(apiServices) ? apiServices : [];
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
  const { data: postcodeResult, isLoading: postcodeLoading, refetch: searchPostcode } = useLookupPostcode({ postcode: postcodeSearch }, { query: { enabled: false, queryKey: getLookupPostcodeQueryKey({ postcode: postcodeSearch }) } });

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
      if (isMapSearch && (!state.lat || !state.lng)) {
        toast({ title: "Pin required", description: "Please click on the map or search an address to mark the land parcel location.", variant: "destructive" });
        return;
      }
      if (!isAlertService && !isMapSearch && !state.propertyAddress) {
        toast({ title: "Error", description: "Please provide a property address", variant: "destructive" });
        return;
      }
      // Property Alert: set a placeholder address if nothing provided
      if (isAlertService && !state.propertyAddress && !state.titleNumber) {
        toast({ title: "Error", description: "Please provide a title number or property address for monitoring.", variant: "destructive" });
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

  // Service-specific flags
  const isMapSearch     = selectedService?.slug === "map-land-search";
  const isAlertService  = selectedService?.slug === "property-alert";
  const hasTitlePlan    = ["title-plan", "ownership-bundle"].includes(selectedService?.slug ?? "");

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-14 max-w-4xl min-h-[calc(100vh-200px)]">
      
      {/* Progress timeline bar */}
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-[8%] right-[8%] top-[18px] h-[3px] bg-slate-200 -z-10 rounded-full"></div>
          <div className="absolute left-[8%] top-[18px] h-[3px] bg-accent -z-10 rounded-full transition-all duration-350" style={{ width: `${((step - 1) / 3) * 84}%` }}></div>
          {[
            { num: 1, label: "Select Property" },
            { num: 2, label: "Your Info" },
            { num: 3, label: "Preferences" },
            { num: 4, label: "Review & Pay" }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all border-3 ${
                step >= s.num ? "bg-primary border-primary text-white shadow-md shadow-primary/10" : "bg-white border-slate-200 text-slate-400"
              }`}>
                {step > s.num ? <Check className="w-4 h-4 stroke-[3px]" /> : s.num}
              </div>
              <span className={`text-[0.725rem] font-bold uppercase tracking-wider ${step >= s.num ? "text-primary font-black" : "text-slate-400 font-semibold"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main wizard card layout */}
      <Card className="shadow-xl border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
        
        {/* Decorative thin accent header strip */}
        <div className="h-2.5 bg-gradient-to-r from-accent via-amber-500 to-accent"></div>
        
        <CardHeader className="bg-slate-50 border-b border-slate-150 px-6 sm:px-8 py-5">
          <CardTitle className="text-xl sm:text-2xl font-extrabold font-heading text-primary flex items-center gap-2">
            {step === 1 && (isAlertService ? "Set Up Property Alert" : "Property Verification")}
            {step === 2 && "Your Contact Details"}
            {step === 3 && "Processing & Delivery Options"}
            {step === 4 && "Review & Secure Checkout"}
          </CardTitle>
          <CardDescription className="text-[0.8125rem] sm:text-xs text-slate-500 font-medium">
            {step === 1 && (isAlertService ? "Specify the UK title numbers or property address you wish to monitor." : isMapSearch ? "Use the interactive map pins to mark the exact land parcel boundary." : "Select the document you need and search for the target address.")}
            {step === 2 && "Provide the details where your verified official Land Registry PDFs will be sent."}
            {step === 3 && "Tailor delivery speeds, SMS notification alerts, and printed copy deliveries."}
            {step === 4 && "Review your final price breakdown and proceed to card checkout via Stripe."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {step === 1 && (
                <div className="space-y-8">
                  
                  {/* Select Service: Clickable Grid instead of boring dropdown */}
                  <div className="space-y-4">
                    <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Select Document Service</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services?.map(s => {
                        const isSelected = state.serviceId === s.id;
                        return (
                          <div
                            key={s.id}
                            onClick={() => updateState({ serviceId: s.id })}
                            className={`p-5 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                              isSelected 
                                ? "border-accent bg-accent/[0.03] shadow-md shadow-accent/5" 
                                : "border-slate-200 bg-white hover:border-slate-350"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[0.675rem] font-bold uppercase tracking-wider ${isSelected ? 'text-accent' : 'text-slate-400'}`}>
                                  Official HMLR Document
                                </span>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                                    ✓
                                  </div>
                                )}
                              </div>
                              <h4 className="font-heading font-extrabold text-[0.9375rem] text-slate-900 leading-snug mb-1">{s.name}</h4>
                              <p className="text-[0.725rem] text-slate-500 line-clamp-2 leading-relaxed">{s.description}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                              <span className="text-[0.675rem] text-slate-400 font-semibold uppercase">from</span>
                              <span className="font-bold font-heading text-[1.125rem] text-slate-900">£{s.basePrice.toFixed(0)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Country & Tenure Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-150">
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Jurisdiction</Label>
                      <Select value={state.country} onValueChange={(val) => updateState({ country: val as any })}>
                        <SelectTrigger id="country" className="h-11 bg-white border-slate-200 text-xs sm:text-sm">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="england_wales">England &amp; Wales (HM Land Registry)</SelectItem>
                          <SelectItem value="scotland">Scotland (Registers of Scotland)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenure" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tenure Type (If Known)</Label>
                      <Select value={state.tenure} onValueChange={(val) => updateState({ tenure: val })}>
                        <SelectTrigger id="tenure" className="h-11 bg-white border-slate-200 text-xs sm:text-sm">
                          <SelectValue placeholder="Select tenure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freehold">Freehold (Absolute Ownership)</SelectItem>
                          <SelectItem value="leasehold">Leasehold (Lease Agreement)</SelectItem>
                          <SelectItem value="unsure">Unsure / Retrieve Any Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* ── Property Alert Service (Special Address UI) ── */}
                  {isAlertService && (
                    <div className="rounded-xl border border-amber-250 bg-amber-50/60 p-5 space-y-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[0.9375rem] font-bold text-amber-900 leading-tight">Fraud Monitoring Setup</p>
                          <p className="text-[0.775rem] text-amber-700 mt-1 leading-relaxed">
                            Monitor property deeds for unsanctioned filings or transfers. Provide the title number(s) if known, or write the address so we can locate the titles for you.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="Title number(s) e.g. EGL109340 (leave blank if unknown)"
                          value={state.titleNumber}
                          onChange={(e) => updateState({ titleNumber: e.target.value })}
                          className="h-11 bg-white border-slate-200"
                        />
                        <Input
                          placeholder="Property address to monitor (full street line)"
                          value={state.propertyAddress}
                          onChange={(e) => updateState({ propertyAddress: e.target.value })}
                          className="h-11 bg-white border-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Map parcel Search OR standard address lookup ── */}
                  {!isAlertService && (isMapSearch ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Map className="w-5 h-5 text-accent" />
                        <Label className="text-[0.9375rem] font-bold text-slate-800">Identify Land Parcel Boundary</Label>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed -mt-2">
                        Input address to center, then click on the map boundary to place your verification pin. You may drag the pin to adjust.
                      </p>
                      <Suspense fallback={
                        <div className="flex items-center justify-center h-[420px] rounded-xl border border-slate-200 bg-slate-50">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      }>
                        <MapPicker
                          initialLat={state.lat}
                          initialLng={state.lng}
                          initialAddress={state.propertyAddress}
                          onLocationSelect={(lat, lng, address) => {
                            updateState({ lat, lng, propertyAddress: address });
                          }}
                        />
                      </Suspense>
                    </div>
                  ) : (
                    /* ── Address Postcode Lookup ── */
                    <div className="space-y-4">
                      <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Find Address</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Postcode lookup (e.g. SW19 1QT)"
                          value={postcodeSearch}
                          onChange={(e) => setPostcodeSearch(e.target.value)}
                          className="h-12 border-slate-200 shadow-sm"
                        />
                        <Button 
                          onClick={() => searchPostcode()} 
                          type="button" 
                          className="h-12 w-28 bg-[#1e293b] hover:bg-slate-800 text-white font-bold" 
                          disabled={postcodeLoading}
                        >
                          {postcodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find Address"}
                        </Button>
                      </div>
                      {postcodeResult?.addresses && postcodeResult.addresses.length > 0 && (
                        <div className="animate-fade-in">
                          <Select onValueChange={(val) => updateState({ propertyAddress: val })}>
                            <SelectTrigger className="h-11 border-slate-200 bg-white">
                              <SelectValue placeholder="Select matching address" />
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
                        <Label htmlFor="address-manual" className="text-xs font-semibold text-slate-500 uppercase">Address Details (manual entry or override)</Label>
                        <Input
                          id="address-manual"
                          placeholder="Complete property line e.g. 14 Gladstone Road, Wimbledon, London SW19 1QT"
                          value={state.propertyAddress}
                          onChange={(e) => updateState({ propertyAddress: e.target.value })}
                          className="h-12 border-slate-200"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Title Number */}
                  {!isAlertService && (
                    <div className="space-y-2">
                      <Label htmlFor="titleNumber" className="text-xs font-bold text-slate-500 uppercase">HMLR Title Number (Optional)</Label>
                      <Input
                        id="titleNumber"
                        placeholder="e.g. EGL390492"
                        value={state.titleNumber}
                        onChange={(e) => updateState({ titleNumber: e.target.value })}
                        className="h-11 border-slate-200"
                      />
                      <p className="text-[11px] text-slate-400">Locating a specific title number speeds up intermediary search times.</p>
                    </div>
                  )}

                  {/* Recommended Add-ons */}
                  {!isAlertService && !isMapSearch && (
                    <div className="space-y-4 pt-4 border-t border-slate-150">
                      <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Recommended Add-ons</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Title Plan add-on */}
                        {!hasTitlePlan && (
                          <div
                            onClick={() => {
                              const selected = state.addons.includes("title_plan");
                              updateState({
                                addons: selected 
                                  ? state.addons.filter(a => a !== "title_plan")
                                  : [...state.addons, "title_plan"]
                              });
                            }}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                              state.addons.includes("title_plan")
                                ? "border-emerald-500 bg-emerald-500/[0.02]"
                                : "border-slate-200 bg-white hover:border-slate-350"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                              state.addons.includes("title_plan") ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                            }`}>
                              {state.addons.includes("title_plan") && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                            </div>
                            <div className="space-y-1">
                              <h5 className="font-extrabold text-[0.875rem] text-slate-900">Official Title Plan Map (+£36)</h5>
                              <p className="text-[11px] text-slate-500 leading-normal">Adds the official boundary plans outlined in red from ordnance maps.</p>
                            </div>
                          </div>
                        )}

                        {/* Flood report */}
                        <div
                          onClick={() => {
                            const selected = state.addons.includes("flood_risk");
                            updateState({
                              addons: selected 
                                ? state.addons.filter(a => a !== "flood_risk")
                                : [...state.addons, "flood_risk"]
                            });
                          }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                            state.addons.includes("flood_risk")
                              ? "border-emerald-500 bg-emerald-500/[0.02]"
                              : "border-slate-200 bg-white hover:border-slate-350"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                            state.addons.includes("flood_risk") ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                          }`}>
                            {state.addons.includes("flood_risk") && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-[0.875rem] text-slate-900">Flood Risk Assessment (+£14.95)</h5>
                            <p className="text-[11px] text-slate-500 leading-normal">Environmental history assessment indicating high-risk flood potentials.</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-150">
                    <div className="md:col-span-3 space-y-2">
                      <Label htmlFor="title" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Salutation</Label>
                      <Select value={state.customerTitle} onValueChange={(val) => updateState({ customerTitle: val })}>
                        <SelectTrigger id="title" className="h-11 bg-white border-slate-200 text-xs sm:text-sm">
                          <SelectValue placeholder="Title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Mrs">Mrs</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                          <SelectItem value="Miss">Miss</SelectItem>
                          <SelectItem value="Dr">Dr</SelectItem>
                          <SelectItem value="Company">Company / Solicitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-9 space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name / Business Representative</Label>
                      <Input 
                        id="fullName"
                        placeholder="John Doe" 
                        value={state.customerName}
                        onChange={(e) => updateState({ customerName: e.target.value })}
                        className="h-11 bg-white border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase">Email Address (Deliveries sent here)</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="yourname@gmail.com" 
                        value={state.customerEmail}
                        onChange={(e) => updateState({ customerEmail: e.target.value })}
                        className="h-11 border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailConfirm" className="text-xs font-bold text-slate-500 uppercase">Confirm Email Address</Label>
                      <Input 
                        id="emailConfirm"
                        type="email"
                        placeholder="yourname@gmail.com" 
                        value={state.customerEmailConfirm}
                        onChange={(e) => updateState({ customerEmailConfirm: e.target.value })}
                        className="h-11 border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase">Mobile Number (Optional)</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      placeholder="e.g. +44 7123 456789" 
                      value={state.customerPhone}
                      onChange={(e) => updateState({ customerPhone: e.target.value })}
                      className="h-11 border-slate-200"
                    />
                    <p className="text-[11px] text-slate-450 leading-relaxed">Necessary to receive real-time SMS progress updates.</p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress" className="text-xs font-bold text-slate-500 uppercase">Your Billing &amp; Mailing Address</Label>
                    <Input 
                      id="billingAddress"
                      placeholder="Complete billing address e.g. 23 High Street, Richmond TW9 1LN" 
                      value={state.customerAddress}
                      onChange={(e) => updateState({ customerAddress: e.target.value })}
                      className="h-11 border-slate-200"
                    />
                    <p className="text-[11px] text-slate-450 leading-relaxed">Used for receipt billing. If printed copy delivery format is selected below, documents are dispatched to this address.</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  
                  {/* Processing Speed Option Cards */}
                  <div className="space-y-4">
                    <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Processing Speed Priority</Label>
                    <RadioGroup 
                      value={state.trackingType} 
                      onValueChange={(val) => updateState({ trackingType: val as any })}
                      className="grid grid-cols-1 gap-4"
                    >
                      {[
                        { id: "standard", icon: Clock, title: "Standard Processing", desc: "Official queue processing, typical delivery within 1-2 working days.", price: "Free", bg: "bg-slate-100 text-slate-600" },
                        { id: "fast_track", icon: Zap, title: "Fast-Track Processing", desc: "Intermediary queue priority, delivery within 4 working hours.", price: "+£10.00", bg: "bg-amber-100 text-amber-600 border-amber-200/50" },
                        { id: "super_fast_track", icon: Flame, title: "Super-Fast Track Processing", desc: "Instant queue bypass, document search and delivery within 1 hour.", price: "+£20.00", bg: "bg-rose-100 text-rose-600 border-rose-200/50" }
                      ].map((item) => (
                        <Label 
                          key={item.id}
                          htmlFor={`speed-${item.id}`} 
                          className={`flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-350 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all`}
                        >
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value={item.id} id={`speed-${item.id}`} />
                            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="font-extrabold text-[0.9375rem] text-slate-900 leading-tight block">{item.title}</span>
                              <span className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</span>
                            </div>
                          </div>
                          <span className="font-bold text-[0.875rem] text-primary shrink-0 ml-4">{item.price}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Delivery Format Option Cards */}
                  <div className="space-y-4">
                    <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Delivery Format</Label>
                    <RadioGroup 
                      value={state.deliveryType} 
                      onValueChange={(val) => updateState({ deliveryType: val as any })}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {[
                        { id: "pdf_only", icon: FileText, title: "Digital PDF Copy Only", desc: "Sent securely to your email. Highly recommended.", price: "Free" },
                        { id: "pdf_printed", icon: Mail, title: "PDF + Official Print Copy", desc: "Emailed plus official printed copy posted via Royal Mail 1st Class.", price: "+£9.95" }
                      ].map((item) => (
                        <Label 
                          key={item.id}
                          htmlFor={`del-${item.id}`} 
                          className={`flex flex-col justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-350 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all text-left gap-3`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value={item.id} id={`del-${item.id}`} />
                                <item.icon className="w-4.5 h-4.5 text-slate-700" />
                              </div>
                              <span className="font-bold text-xs text-slate-900">{item.price}</span>
                            </div>
                            <div>
                              <span className="font-extrabold text-[0.875rem] text-slate-900 leading-snug block">{item.title}</span>
                              <span className="text-xs text-slate-500 font-medium leading-relaxed mt-1 block">{item.desc}</span>
                            </div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Notifications Option Cards */}
                  <div className="space-y-4">
                    <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Progress Notifications</Label>
                    <RadioGroup 
                      value={state.notificationType} 
                      onValueChange={(val) => updateState({ notificationType: val as any })}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <Label htmlFor="notif-email" className="flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-300 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="email" id="notif-email" />
                          <div className="text-left">
                            <span className="font-extrabold text-[0.875rem] text-slate-900 block leading-tight">Email Notifications</span>
                            <span className="text-xs text-slate-500 font-medium">Standard email updates.</span>
                          </div>
                        </div>
                        <span className="font-bold text-xs text-slate-900">Free</span>
                      </Label>
                      
                      <Label htmlFor="notif-sms" className="flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-300 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="both" id="notif-sms" />
                          <div className="text-left">
                            <span className="font-extrabold text-[0.875rem] text-slate-900 block leading-tight">Email &amp; SMS Alerts</span>
                            <span className="text-xs text-slate-500 font-medium">SMS updates to mobile.</span>
                          </div>
                        </div>
                        <span className="font-bold text-xs text-slate-900">+£4.95</span>
                      </Label>
                    </RadioGroup>
                  </div>

                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  {priceCalculating || !priceBreakdown ? (
                    <div className="py-16 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-slate-500 text-sm font-semibold">Calculating official HMLR fees &amp; service VAT...</p>
                    </div>
                  ) : (
                    <>
                      {/* Premium Digital Receipt Summary */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                        <div className="bg-[#121f35] px-6 py-4 text-white flex justify-between items-center">
                          <span className="font-heading font-extrabold text-sm sm:text-base">Document Order Summary</span>
                          <span className="text-xs font-bold bg-accent/20 border border-accent/35 text-accent px-2.5 py-0.5 rounded-full uppercase tracking-wider">Review Copy</span>
                        </div>
                        
                        <div className="p-6 space-y-4 text-sm">
                          
                          {/* Top summary row details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 pb-4 border-b border-slate-200">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Service Ordered</span>
                              <span className="font-bold text-slate-800 text-[0.9375rem]">{selectedService?.name}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Target Address / Location</span>
                              <span className="font-bold text-slate-800 text-[0.9375rem] block truncate" title={state.propertyAddress}>
                                {isMapSearch && state.lat && state.lng 
                                  ? `Pin: ${state.lat.toFixed(4)}, ${state.lng.toFixed(4)}`
                                  : (state.propertyAddress || "Manual Search Lookup")}
                              </span>
                            </div>
                          </div>

                          {/* Line items invoice breakdown */}
                          <div className="space-y-3 py-2">
                            {priceBreakdown.lineItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                                <span className="text-slate-550 font-medium">{item.label}</span>
                                <span className="font-bold text-slate-800">£{(item.amount).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Invoice divider */}
                          <div className="border-t border-dashed border-slate-350 my-4 pt-4 space-y-2.5 text-xs sm:text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-550">Total Official Document Fees (HMLR Passthrough, No VAT)</span>
                              <span className="font-bold text-slate-800">£{(priceBreakdown.documentFee).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-550">Processing Intermediary Fee (Excl. VAT)</span>
                              <span className="font-bold text-slate-800">£{(priceBreakdown.serviceFee - priceBreakdown.vatAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-550">VAT on Intermediary Services (20%)</span>
                              <span className="font-bold text-slate-800">£{(priceBreakdown.vatAmount).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Bottom Total Paid row */}
                          <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-primary text-base font-heading block leading-none">Total Amount Due</span>
                              <span className="text-[10px] text-slate-450 mt-1 block">Includes official government fee and VAT.</span>
                            </div>
                            <span className="font-extrabold text-2xl text-accent font-heading">£{(priceBreakdown.totalAmount).toFixed(2)}</span>
                          </div>

                        </div>
                      </div>

                      {/* Immediate waive tickbox */}
                      <div className="flex items-start space-x-3.5 p-5 bg-amber-50/40 border border-amber-200/60 rounded-xl text-left">
                        <Checkbox 
                          id="terms" 
                          checked={state.agreedToWaiveCancel}
                          onCheckedChange={(checked) => updateState({ agreedToWaiveCancel: checked as boolean })}
                          className="mt-1 border-amber-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                        <div className="grid gap-1">
                          <label
                            htmlFor="terms"
                            className="text-sm font-bold leading-snug cursor-pointer text-amber-900"
                          >
                            Consent to Immediate Processing (Waive 14-Day Cancellation)
                          </label>
                          <p className="text-[11px] text-amber-800/80 leading-relaxed mt-0.5">
                            I explicitly request Onlinelandregistry to retrieve my documents immediately. I understand and agree that once my official copies are retrieved and delivered, I waive my statutory right to cancel or obtain a refund for the service.
                          </p>
                        </div>
                      </div>
                      
                      {/* Secure Stripe lock row */}
                      <div className="flex items-center gap-2 justify-center text-xs text-slate-450 py-1 font-semibold border-t border-slate-150 pt-4">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>PCI-DSS Level 1 Secure Card Processing via Stripe · 256-bit TLS Encryption</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="bg-slate-50/60 border-t border-slate-150 px-6 sm:px-8 py-5 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="h-11 px-5 font-semibold text-slate-700 hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          ) : <div />}

          {step < 4 ? (
            <Button onClick={handleNext} className="bg-[#1e293b] hover:bg-slate-800 text-white font-bold h-11 px-8 rounded-lg">
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="bg-accent hover:bg-accent/90 text-white h-12 px-12 font-extrabold shadow-lg shadow-accent/25 rounded-lg text-[0.9375rem] transition-all hover:shadow-accent/45 hover:-translate-y-px"
              disabled={createOrder.isPending || createCheckoutSession.isPending || priceCalculating || !state.agreedToWaiveCancel}
            >
              {(createOrder.isPending || createCheckoutSession.isPending) ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing Stripe Checkout...</>
              ) : (
                <>Pay &amp; Secure Order <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
