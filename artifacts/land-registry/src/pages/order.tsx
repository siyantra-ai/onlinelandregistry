import { useListServices, useCalculatePrice, useCreateOrder, useCreateCheckoutSession, OrderInputCountry, OrderInputDeliveryType, OrderInputNotificationType, OrderInputTrackingType, useLookupPostcode, getLookupPostcodeQueryKey, lookupPostcode } from "@workspace/api-client-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, Check, ShieldCheck, Map, Bell, Clock, Zap, FileText, Mail, Building2, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MapPicker = lazy(() => import("@/components/ui/MapPicker"));

// Types for wizard state
interface PropertyDetails {
  includeTitlePlan: boolean;
  includeTitleRegister: boolean;
  includeFloodRisk: boolean;
  country: OrderInputCountry;
  tenure: string;
  titleNumber: string;
  preferredDeed?: string;
  postcode: string;
  postcodeSearch: string;
  postcodeAddresses: string[];
  propertyAddress: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcodeManual: string;
  lat: number | null;
  lng: number | null;
}

const createDefaultProperty = (): PropertyDetails => ({
  includeTitlePlan: false,
  includeTitleRegister: false,
  includeFloodRisk: false,
  country: "england_wales",
  tenure: "unsure",
  titleNumber: "",
  preferredDeed: "Select Preference",
  postcode: "",
  postcodeSearch: "",
  postcodeAddresses: [],
  propertyAddress: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  county: "",
  postcodeManual: "",
  lat: null,
  lng: null,
});

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
  customerMiddleName: string;
  customerSurname: string;
  customerEmail: string;
  customerEmailConfirm: string;
  customerPhone: string;
  customerAddress: string;

  trackingType: OrderInputTrackingType;
  deliveryType: OrderInputDeliveryType;
  notificationType: OrderInputNotificationType;

  agreedToWaiveCancel: boolean;
  
  properties: PropertyDetails[];
}

export default function OrderWizard() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialServiceSlug = searchParams.get("service");
  const { toast } = useToast();

  const { data: apiServices, isLoading: servicesLoading } = useListServices();
  
  const desiredOrder = [
    "title-register",
    "title-plan",
    "deed-search",
    "map-land-search",
    "ownership-bundle",
    "property-alert"
  ];

  const services = Array.isArray(apiServices)
    ? [...apiServices]
        .filter(s => s.slug !== "deceased-joint-proprietor")
        .sort((a, b) => {
        const aIdx = desiredOrder.indexOf(a.slug);
        const bIdx = desiredOrder.indexOf(b.slug);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      })
    : [];
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
    customerMiddleName: "",
    customerSurname: "",
    customerEmail: "",
    customerEmailConfirm: "",
    customerPhone: "",
    customerAddress: "",

    trackingType: "standard",
    deliveryType: "pdf_only",
    notificationType: "email",

    agreedToWaiveCancel: false,
    
    properties: [createDefaultProperty()],
  });

  const [postcodeSearch, setPostcodeSearch] = useState("");
  const { data: postcodeResult, isLoading: postcodeLoading, refetch: searchPostcode } = useLookupPostcode({ postcode: postcodeSearch }, { query: { enabled: false, queryKey: getLookupPostcodeQueryKey({ postcode: postcodeSearch }) } });

  const [postcodeLoadingMap, setPostcodeLoadingMap] = useState<Record<number, boolean>>({});

  // Initialize service from URL param
  useEffect(() => {
    if (services.length > 0 && initialServiceSlug && !state.serviceId) {
      const service = services.find(s => s.slug === initialServiceSlug);
      if (service) {
        setState(prev => ({ ...prev, serviceId: service.id }));
      }
    } else if (services.length > 0 && !state.serviceId) {
      setState(prev => ({ ...prev, serviceId: services[0].id }));
    }
  }, [services, initialServiceSlug]);

  const selectedService = services?.find(s => s.id === state.serviceId);
  const isTitleRegister = selectedService?.slug === "title-register";
  const isTitlePlan = selectedService?.slug === "title-plan";
  const isOwnershipBundle = selectedService?.slug === "ownership-bundle";
  const isDeedSearch = selectedService?.slug === "deed-search";
  const isMapSearch = selectedService?.slug === "map-land-search";
  const isAlertService = selectedService?.slug === "property-alert";
  const isDJP = selectedService?.slug === "deceased-joint-proprietor";
  const isCustomWizard = isTitleRegister || isTitlePlan || isOwnershipBundle || isDeedSearch || isMapSearch || isAlertService || isDJP;

  const hasTitlePlan    = ["title-plan", "ownership-bundle"].includes(selectedService?.slug ?? "");

  const handlePropertyCountChange = (count: number) => {
    setState(prev => {
      const currentProps = prev.properties || [createDefaultProperty()];
      let newProps = [...currentProps];
      if (count > newProps.length) {
        for (let i = newProps.length; i < count; i++) {
          newProps.push(createDefaultProperty());
        }
      } else if (count < newProps.length) {
        newProps = newProps.slice(0, count);
      }
      return {
        ...prev,
        propertyCount: count,
        properties: newProps
      };
    });
  };

  const handlePropertyPostcodeLookup = async (index: number) => {
    const property = state.properties?.[index];
    if (!property || !property.postcodeSearch.trim()) return;
    
    setPostcodeLoadingMap(prev => ({ ...prev, [index]: true }));
    try {
      const result = await lookupPostcode({ postcode: property.postcodeSearch });
      setState(prev => {
        const newProps = [...(prev.properties || [])];
        if (newProps[index]) {
          newProps[index] = {
            ...newProps[index],
            postcodeAddresses: result.addresses || [],
          };
        }
        return { ...prev, properties: newProps };
      });
    } catch (error) {
      toast({
        title: "Lookup Failed",
        description: "Failed to find address for the postcode",
        variant: "destructive"
      });
    } finally {
      setPostcodeLoadingMap(prev => ({ ...prev, [index]: false }));
    }
  };

  const updateProperty = (index: number, updates: Partial<PropertyDetails>) => {
    setState(prev => {
      const newProps = [...(prev.properties || [])];
      if (newProps[index]) {
        const updatedProp = { ...newProps[index], ...updates };
        const addrParts = [
          updatedProp.addressLine1,
          updatedProp.addressLine2,
          updatedProp.city,
          updatedProp.county,
          updatedProp.postcodeManual
        ].filter(Boolean);
        
        updatedProp.propertyAddress = addrParts.join(", ");
        updatedProp.postcode = updatedProp.postcodeManual;
        newProps[index] = updatedProp;
      }
      return { ...prev, properties: newProps };
    });
  };

  const handleSelectAddress = (index: number, address: string) => {
    setState(prev => {
      const newProps = [...(prev.properties || [])];
      if (newProps[index]) {
        newProps[index] = {
          ...newProps[index],
          propertyAddress: address,
          postcode: newProps[index].postcodeSearch,
          addressLine1: address,
          postcodeManual: newProps[index].postcodeSearch
        };
      }
      return { ...prev, properties: newProps };
    });
  };

  const getSelectedAddons = () => {
    if (isCustomWizard) {
      const list: string[] = [];
      state.properties?.forEach(p => {
        if (isTitleRegister && p.includeTitlePlan) list.push("title_plan");
        if (isTitlePlan && p.includeTitleRegister) list.push("title_register");
        if (isDeedSearch && p.includeTitleRegister) list.push("title_register");
        if (isDeedSearch && p.includeTitlePlan) list.push("title_plan");
        if (isMapSearch && p.includeTitleRegister) list.push("title_register");
        if (isMapSearch && p.includeTitlePlan) list.push("title_plan");
        if (isAlertService && p.includeTitleRegister) list.push("title_register");
        if (isAlertService && p.includeTitlePlan) list.push("title_plan");
        if (isDJP && p.includeTitleRegister) list.push("title_register");
        if (isDJP && p.includeTitlePlan) list.push("title_plan");
        if (p.includeFloodRisk) list.push("flood_risk");
      });
      return list;
    }
    return state.addons;
  };

  const handleNext = () => {
    if (isCustomWizard) {
      if (step === 1) {
        const props = state.properties || [createDefaultProperty()];
        for (let i = 0; i < props.length; i++) {
          const p = props[i];
          if (isMapSearch) {
            if (!p.lat || !p.lng) {
              toast({
                title: "Pin Required",
                description: `Please place a pin on the map for Parcel ${i + 1}`,
                variant: "destructive"
              });
              return;
            }
          } else {
            if (!p.propertyAddress && (!p.addressLine1 || !p.city || !p.postcodeManual)) {
              toast({
                title: "Address Required",
                description: `Please provide a complete address for Property ${i + 1}`,
                variant: "destructive"
              });
              return;
            }
          }
        }
        
        if (!state.customerName || !state.customerSurname || !state.customerEmail) {
          toast({ title: "Error", description: "Please fill in all required personal details (First Name, Surname, and Email)", variant: "destructive" });
          return;
        }
        if (state.customerEmail !== state.customerEmailConfirm) {
          toast({ title: "Error", description: "Emails do not match", variant: "destructive" });
          return;
        }
      }
      if (step === 3) {
        if (!state.agreedToWaiveCancel) {
          toast({ title: "Required", description: "You must agree to waive the 14-day cancellation period to proceed.", variant: "destructive" });
          return;
        }
      }
    } else {
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
    country: (isCustomWizard
      ? (state.properties?.[0]?.country || "england_wales")
      : state.country) as "england_wales" | "scotland",
    trackingType: state.trackingType as "standard" | "fast_track" | "super_fast_track",
    deliveryType: state.deliveryType as "pdf_only" | "pdf_printed",
    notificationType: state.notificationType as "email" | "sms" | "both",
    addons: getSelectedAddons()
  };

  const { mutate: calcPrice, data: priceBreakdown, isPending: priceCalculating } = useCalculatePrice();

  useEffect(() => {
    const shouldCalc = isCustomWizard ? step === 3 : step === 4;
    if (shouldCalc && state.serviceId) {
      calcPrice({ data: calculatePriceInput });
    }
  }, [step, isCustomWizard, state.serviceId, state.propertyCount, state.country, state.trackingType, state.deliveryType, state.notificationType, state.addons, state.properties]);

  const handleSubmit = async () => {
    if (!state.agreedToWaiveCancel) {
      toast({ title: "Required", description: "You must agree to waive the 14-day cancellation period to proceed.", variant: "destructive" });
      return;
    }

    try {
      const formattedAddress = isCustomWizard
        ? state.properties?.map((p, idx) => {
            if (isMapSearch && p.lat && p.lng) {
              return `Parcel ${idx + 1}: ${p.propertyAddress || "Pinned Location"} (${p.lat.toFixed(6)}, ${p.lng.toFixed(6)})`;
            }
            return `Property ${idx + 1}: ${p.propertyAddress}`;
          }).join(" | ")
        : state.propertyAddress;

      const formattedTenure = isCustomWizard
        ? state.properties?.map((p, idx) => {
            let val = `Property ${idx + 1}: ${p.tenure}`;
            if (isDeedSearch && p.preferredDeed && p.preferredDeed !== "Select Preference") {
              val += ` (Preferred Deed: ${p.preferredDeed})`;
            }
            return val;
          }).join(" | ")
        : state.tenure;

      const formattedTitleNumber = isCustomWizard
        ? state.properties?.map((p, idx) => `Property ${idx + 1}: ${p.titleNumber}`).join(" | ")
        : state.titleNumber;

      const formattedPostcode = isCustomWizard
        ? state.properties?.map((p, idx) => `Property ${idx + 1}: ${p.postcode}`).join(" | ")
        : state.postcode;

      const order = await createOrder.mutateAsync({
        data: {
          serviceId: state.serviceId as number,
          propertyCount: state.propertyCount,
          country: isCustomWizard
            ? (state.properties?.[0]?.country || "england_wales")
            : state.country,
          trackingType: state.trackingType,
          deliveryType: state.deliveryType,
          notificationType: state.notificationType,
          addons: getSelectedAddons(),
          customerTitle: state.customerTitle,
          customerName: isCustomWizard
            ? `${state.customerName} ${state.customerMiddleName} ${state.customerSurname}`.replace(/\s+/g, " ").trim()
            : state.customerName,
          customerEmail: state.customerEmail,
          customerEmailConfirm: state.customerEmailConfirm,
          customerPhone: state.customerPhone,
          customerAddress: state.customerAddress,
          tenure: formattedTenure,
          titleNumber: formattedTitleNumber,
          postcode: formattedPostcode,
          propertyAddress: formattedAddress,
          lat: isCustomWizard ? (state.properties?.[0]?.lat ?? state.lat) : state.lat,
          lng: isCustomWizard ? (state.properties?.[0]?.lng ?? state.lng) : state.lng,
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-14 max-w-4xl min-h-[calc(100vh-200px)]">
      <SEO
        title="Order Official Land Registry Documents | Online Land Registry"
        description="Retrieve official UK Land Registry documents online. Choose Title Registers, Title Plans, Deeds, or DJP applications for fast digital delivery."
      />
      
      {/* Progress timeline bar */}
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-[8%] right-[8%] top-[18px] h-[3px] bg-slate-200 -z-10 rounded-full"></div>
          <div className="absolute left-[8%] top-[18px] h-[3px] bg-accent -z-10 rounded-full transition-all duration-350" style={{ width: `${((step - 1) / 3) * 84}%` }}></div>
          {[
            { num: 1, label: isCustomWizard ? "Getting Started" : "Select Property" },
            { num: 2, label: isCustomWizard ? "Finalise Order" : "Your Info" },
            { num: 3, label: isCustomWizard ? "Review" : "Preferences" },
            { num: 4, label: isCustomWizard ? "Pay" : "Review & Pay" }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm transition-all border-3 ${
                step >= s.num ? "bg-primary border-primary text-white shadow-md shadow-primary/10" : "bg-white border-slate-200 text-slate-400"
              }`}>
                {step > s.num ? <Check className="w-4 h-4 stroke-[3px]" /> : s.num}
              </div>
              <span className={`text-[0.725rem] font-bold uppercase tracking-wider text-center ${step >= s.num ? "text-primary font-black" : "text-slate-400 font-semibold"}`}>{s.label}</span>
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
            {isCustomWizard ? (
              <>
                {step === 1 && "Getting Started"}
                {step === 2 && "Finalise Your Order"}
                {step === 3 && "Review your application"}
                {step === 4 && "Total amount to pay"}
              </>
            ) : (
              <>
                {step === 1 && (isAlertService ? "Set Up Property Alert" : "Property Verification")}
                {step === 2 && "Your Contact Details"}
                {step === 3 && "Processing & Delivery Options"}
                {step === 4 && "Review & Secure Checkout"}
              </>
            )}
          </CardTitle>
          <CardDescription className="text-[0.8125rem] sm:text-xs text-slate-500 font-medium">
            {isCustomWizard ? (
              <>
                {step === 1 && "Simply complete our online form below and we will take care of the rest."}
                {step === 2 && "Tailor delivery speeds, SMS notification alerts, and printed copy deliveries."}
                {step === 3 && "Please review your personal and property details before proceeding."}
                {step === 4 && "Review the final amount and proceed to secure checkout."}
              </>
            ) : (
              <>
                {step === 1 && (isAlertService ? "Specify the UK title numbers or property address you wish to monitor." : isMapSearch ? "Use the interactive map pins to mark the exact land parcel boundary." : "Select the document you need and search for the target address.")}
                {step === 2 && "Provide the details where your verified official Land Registry PDFs will be sent."}
                {step === 3 && "Tailor delivery speeds, SMS notification alerts, and printed copy deliveries."}
                {step === 4 && "Review your final price breakdown and proceed to card checkout via Stripe."}
              </>
            )}
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
                isCustomWizard ? (
                  <div className="space-y-8">
                    {/* Title Register/Plan Header Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-heading font-extrabold text-lg sm:text-xl text-primary">
                            {isDJP ? "Deceased Joint Proprietor (DJP)" : isAlertService ? "Property Alert Service" : isMapSearch ? "Map / Land Search" : isDeedSearch ? "Official Deed Search" : isOwnershipBundle ? "Property Ownership Bundle" : isTitlePlan ? "Land Registry Title Plan Document" : "Land Registry Title Register Document"}
                          </h3>
                          <p className="text-xs text-slate-550 font-bold mt-0.5">{state.propertyCount} {isDJP ? "application" : isAlertService ? "title" : isMapSearch ? "parcel" : "document"}{state.propertyCount > 1 ? 's' : ''}</p>
                        </div>
                        <span className="font-bold font-heading text-lg sm:text-xl text-primary">£{(state.propertyCount * (isOwnershipBundle ? 50.00 : isDeedSearch ? 34.17 : isMapSearch ? 44.17 : isDJP ? 54.17 : 30.00)).toFixed(2)}+vat</span>
                      </div>
                      
                      <div className="space-y-3 border-t border-slate-200 pt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1 of 4: Getting Started</p>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                          Simply complete our online form below and we will take care of the rest. Once you have completed your application, your details will be processed immediately.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-705">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-[11px]">1</div>
                            <span>Complete the form</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-[11px]">2</div>
                            <span>Make your payment</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-[11px]">3</div>
                            <span>Receive your documents</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Property Count Selector */}
                    <div className="space-y-2 max-w-xs">
                      <Label htmlFor="property-count" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                        {isMapSearch ? "How many land parcels would you like to search?" : "How many properties would you like to search?"}
                      </Label>
                      <Select 
                        value={state.propertyCount.toString()} 
                        onValueChange={(val) => handlePropertyCountChange(parseInt(val, 10))}
                      >
                        <SelectTrigger id="property-count" className="h-11 bg-white border-slate-200 text-xs sm:text-sm">
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(10)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Loop dynamically through property forms */}
                    <div className="space-y-6">
                      {state.properties.map((prop, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-2xl p-6 bg-white space-y-6 shadow-sm">
                          <h4 className="font-heading font-extrabold text-base text-primary border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-accent" />
                            Property {idx + 1}
                          </h4>

                          {/* Required Documents Section */}
                          <div className="space-y-3">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Required Documents</Label>
                            <div className="grid grid-cols-1 gap-3">
                              
                              {/* If Title Register is selected */}
                              {isTitleRegister && (
                                <>
                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 select-none">
                                    <div className="flex items-center gap-3">
                                      <Checkbox id={`req-tr-${idx}`} checked={true} disabled={true} className="border-slate-300 disabled:opacity-100 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Title Register (£30.00+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Official copy confirming registered ownership.</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* If Title Plan is selected */}
                              {isTitlePlan && (
                                <>
                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 select-none">
                                    <div className="flex items-center gap-3">
                                      <Checkbox id={`req-tp-${idx}`} checked={true} disabled={true} className="border-slate-300 disabled:opacity-100 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Title Plan (£30.00+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Scale boundary map outlining property.</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* If Property Ownership Bundle is selected */}
                              {isOwnershipBundle && (
                                <>
                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 select-none">
                                    <div className="flex items-center gap-3">
                                      <Checkbox id={`req-bundle-${idx}`} checked={true} disabled={true} className="border-slate-300 disabled:opacity-100 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Title Register &amp; Title Plan Bundle (£50.00+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Both documents compiled into a single package.</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* If Official Deed Search is selected */}
                              {isDeedSearch && (
                                <>
                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 select-none">
                                    <div className="flex items-center gap-3">
                                      <Checkbox id={`req-deeds-${idx}`} checked={true} disabled={true} className="border-slate-300 disabled:opacity-100 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Official Deed Search (£34.17+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Historical transfers (TR1 forms) and leasehold deeds.</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white select-none hover:border-slate-300 transition-all cursor-pointer" onClick={() => updateProperty(idx, { includeTitleRegister: !prop.includeTitleRegister })}>
                                    <div className="flex items-center gap-3">
                                      <Checkbox 
                                        id={`addon-tr-${idx}`} 
                                        checked={prop.includeTitleRegister}
                                        onCheckedChange={(checked) => updateProperty(idx, { includeTitleRegister: checked as boolean })}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Include Title Register (£30.00+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Official copy confirming registered ownership.</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* If Map / Land Search is selected */}
                              {isMapSearch && (
                                <>
                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 select-none">
                                    <div className="flex items-center gap-3">
                                      <Checkbox id={`req-map-${idx}`} checked={true} disabled={true} className="border-slate-300 disabled:opacity-100 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Map / Land Search (£44.17+vat)</span>
                                        <span className="text-[11px] text-slate-450 font-medium">GIS coordinate-based boundary mapping search.</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white select-none hover:border-slate-300 transition-all cursor-pointer" onClick={() => updateProperty(idx, { includeTitleRegister: !prop.includeTitleRegister })}>
                                    <div className="flex items-center gap-3">
                                      <Checkbox 
                                        id={`addon-tr-${idx}`} 
                                        checked={prop.includeTitleRegister}
                                        onCheckedChange={(checked) => updateProperty(idx, { includeTitleRegister: checked as boolean })}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Include Title Register (£30.00+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Official copy confirming registered ownership.</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* If Property Alert Service is selected */}
                              {isAlertService && (
                                <>
                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 select-none">
                                    <div className="flex items-center gap-3">
                                      <Checkbox id={`req-alert-${idx}`} checked={true} disabled={true} className="border-slate-300 disabled:opacity-100 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Property Alert Monitoring (£30.00+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Real-time fraud alert monitoring and email status updates.</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white select-none hover:border-slate-300 transition-all cursor-pointer" onClick={() => updateProperty(idx, { includeTitleRegister: !prop.includeTitleRegister })}>
                                    <div className="flex items-center gap-3">
                                      <Checkbox 
                                        id={`addon-tr-${idx}`} 
                                        checked={prop.includeTitleRegister}
                                        onCheckedChange={(checked) => updateProperty(idx, { includeTitleRegister: checked as boolean })}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Include Title Register (£30.00+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Official copy confirming registered ownership.</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* If Deceased Joint Proprietor DJP is selected */}
                              {isDJP && (
                                <>
                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 select-none">
                                    <div className="flex items-center gap-3">
                                      <Checkbox id={`req-djp-${idx}`} checked={true} disabled={true} className="border-slate-300 disabled:opacity-100 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Deceased Joint Proprietor DJP (£54.17+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Remove a deceased owner's name and update registered title.</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white select-none hover:border-slate-300 transition-all cursor-pointer" onClick={() => updateProperty(idx, { includeTitleRegister: !prop.includeTitleRegister })}>
                                    <div className="flex items-center gap-3">
                                      <Checkbox 
                                        id={`addon-tr-${idx}`} 
                                        checked={prop.includeTitleRegister}
                                        onCheckedChange={(checked) => updateProperty(idx, { includeTitleRegister: checked as boolean })}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div>
                                        <span className="text-sm font-bold text-slate-900 block leading-tight">Include Title Register (£30.00+vat)</span>
                                        <span className="text-[11px] text-slate-405 font-medium">Official copy confirming registered ownership.</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Include Flood Risk addon */}
                              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white select-none hover:border-slate-300 transition-all cursor-pointer" onClick={() => updateProperty(idx, { includeFloodRisk: !prop.includeFloodRisk })}>
                                <div className="flex items-center gap-3">
                                  <Checkbox 
                                    id={`addon-fr-${idx}`} 
                                    checked={prop.includeFloodRisk}
                                    onCheckedChange={(checked) => updateProperty(idx, { includeFloodRisk: checked as boolean })}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div>
                                    <span className="text-sm font-bold text-slate-900 block leading-tight">Include Flood Risk (£25.00+vat)</span>
                                    <span className="text-[11px] text-slate-405 font-medium">Environmental risk assessment report.</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Country and Tenure */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`country-${idx}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">Country</Label>
                              <Select value={prop.country} onValueChange={(val) => updateProperty(idx, { country: val as any })}>
                                <SelectTrigger id={`country-${idx}`} className="h-11 bg-white border-slate-200 text-xs sm:text-sm">
                                  <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="england_wales">England &amp; Wales (HM Land Registry)</SelectItem>
                                  <SelectItem value="scotland">Scotland (Registers of Scotland)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`tenure-${idx}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tenure</Label>
                              <Select value={prop.tenure} onValueChange={(val) => updateProperty(idx, { tenure: val })}>
                                <SelectTrigger id={`tenure-${idx}`} className="h-11 bg-white border-slate-200 text-xs sm:text-sm">
                                  <SelectValue placeholder="Select Tenure" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="freehold">Freehold (Absolute Ownership)</SelectItem>
                                  <SelectItem value="leasehold">Leasehold (Lease Agreement)</SelectItem>
                                  <SelectItem value="unsure">Unsure / Retrieve Any Available</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Title Number */}
                          <div className="space-y-2">
                            <Label htmlFor={`titleNumber-${idx}`} className="text-xs font-bold text-slate-500 uppercase">Title Number (If known)</Label>
                            <Input
                              id={`titleNumber-${idx}`}
                              placeholder="e.g. EGL390492"
                              value={prop.titleNumber}
                              onChange={(e) => updateProperty(idx, { titleNumber: e.target.value })}
                              className="h-11 border-slate-200"
                            />
                          </div>

                          {/* Preferred Deed for Deed Search */}
                          {isDeedSearch && (
                            <div className="space-y-2">
                              <Label htmlFor={`preferredDeed-${idx}`} className="text-xs font-bold text-slate-600 uppercase tracking-wider">Preferred Deed</Label>
                              <Select 
                                value={prop.preferredDeed} 
                                onValueChange={(val) => updateProperty(idx, { preferredDeed: val })}
                              >
                                <SelectTrigger id={`preferredDeed-${idx}`} className="h-11 bg-white border-slate-200 text-xs sm:text-sm">
                                  <SelectValue placeholder="Select Preference" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Select Preference">Select Preference</SelectItem>
                                  <SelectItem value="The Most Relevant Filed Deed">The Most Relevant Filed Deed</SelectItem>
                                  <SelectItem value="Conveyancing Deeds">Conveyancing Deeds</SelectItem>
                                  <SelectItem value="Transfer Deeds">Transfer Deeds</SelectItem>
                                  <SelectItem value="Charge Deeds">Charge Deeds</SelectItem>
                                  <SelectItem value="Lease Deeds">Lease Deeds</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Postcode Lookup & Address Entries OR Map Picker */}
                          {isMapSearch ? (
                            <div className="space-y-4 border-t border-slate-100 pt-4">
                              <div className="flex items-center gap-2">
                                <Map className="w-5 h-5 text-accent" />
                                <Label className="text-xs font-bold text-slate-505 uppercase tracking-wider block">Identify Land Parcel Boundary</Label>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed -mt-2">
                                Input address to center, then click on the map boundary to place your verification pin. You may drag the pin to adjust.
                              </p>
                              <Suspense fallback={
                                <div className="flex items-center justify-center h-[350px] rounded-xl border border-slate-200 bg-slate-50">
                                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                              }>
                                <MapPicker
                                  initialLat={prop.lat}
                                  initialLng={prop.lng}
                                  initialAddress={prop.propertyAddress}
                                  onLocationSelect={(lat, lng, address) => {
                                    updateProperty(idx, { lat, lng, propertyAddress: address });
                                  }}
                                />
                              </Suspense>
                            </div>
                          ) : (
                            <div className="space-y-4 border-t border-slate-100 pt-4">
                              <Label className="text-xs font-bold text-slate-505 uppercase tracking-wider block">Property Address Lookup</Label>
                              
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Enter Property Postcode (e.g. SW19 1QT)"
                                  value={prop.postcodeSearch}
                                  onChange={(e) => updateProperty(idx, { postcodeSearch: e.target.value })}
                                  className="h-11 border-slate-200 shadow-sm"
                                />
                                <Button 
                                  onClick={() => handlePropertyPostcodeLookup(idx)} 
                                  type="button" 
                                  className="h-11 w-32 bg-[#1e293b] hover:bg-slate-800 text-white font-bold" 
                                  disabled={postcodeLoadingMap[idx]}
                                >
                                  {postcodeLoadingMap[idx] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Find Address"}
                                </Button>
                              </div>

                              {prop.postcodeAddresses && prop.postcodeAddresses.length > 0 && (
                                <div className="animate-fade-in space-y-2">
                                  <Label className="text-xs font-semibold text-slate-500">Matching Addresses</Label>
                                  <Select onValueChange={(val) => handleSelectAddress(idx, val)}>
                                    <SelectTrigger className="h-11 border-slate-200 bg-white">
                                      <SelectValue placeholder="Select matching address" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {prop.postcodeAddresses.map((addr, i) => (
                                        <SelectItem key={i} value={addr}>{addr}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Manual address entries */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`addr1-${idx}`} className="text-[11px] font-bold text-slate-550 uppercase">Property Address Line 1</Label>
                                  <Input
                                    id={`addr1-${idx}`}
                                    placeholder="Address Line 1"
                                    value={prop.addressLine1}
                                    onChange={(e) => updateProperty(idx, { addressLine1: e.target.value })}
                                    className="h-11 border-slate-200"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`addr2-${idx}`} className="text-[11px] font-bold text-slate-550 uppercase">Property Address Line 2</Label>
                                  <Input
                                    id={`addr2-${idx}`}
                                    placeholder="Address Line 2"
                                    value={prop.addressLine2}
                                    onChange={(e) => updateProperty(idx, { addressLine2: e.target.value })}
                                    className="h-11 border-slate-200"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`city-${idx}`} className="text-[11px] font-bold text-slate-550 uppercase">Property City</Label>
                                  <Input
                                    id={`city-${idx}`}
                                    placeholder="City"
                                    value={prop.city}
                                    onChange={(e) => updateProperty(idx, { city: e.target.value })}
                                    className="h-11 border-slate-200"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`county-${idx}`} className="text-[11px] font-bold text-slate-550 uppercase">Property County</Label>
                                  <Input
                                    id={`county-${idx}`}
                                    placeholder="County"
                                    value={prop.county}
                                    onChange={(e) => updateProperty(idx, { county: e.target.value })}
                                    className="h-11 border-slate-200"
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor={`postcodeManual-${idx}`} className="text-[11px] font-bold text-slate-550 uppercase">Property Postcode</Label>
                                  <Input
                                    id={`postcodeManual-${idx}`}
                                    placeholder="Postcode"
                                    value={prop.postcodeManual}
                                    onChange={(e) => updateProperty(idx, { postcodeManual: e.target.value })}
                                    className="h-11 border-slate-200"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Personal Details Form Section at the Bottom */}
                    <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-6 shadow-sm">
                      <h4 className="font-heading font-extrabold text-base text-primary border-b border-slate-200 pb-3">
                        Personal Details
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cust-title" className="text-xs font-bold text-slate-650 uppercase">Title</Label>
                          <Select value={state.customerTitle} onValueChange={(val) => updateState({ customerTitle: val })}>
                            <SelectTrigger id="cust-title" className="h-11 bg-white border-slate-200">
                              <SelectValue placeholder="Select Title" />
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

                        <div className="space-y-2 md:col-span-3">
                          <Label htmlFor="first-name" className="text-xs font-bold text-slate-655 uppercase block">First name</Label>
                          <Input
                            id="first-name"
                            placeholder="First name"
                            value={state.customerName}
                            onChange={(e) => updateState({ customerName: e.target.value })}
                            className="h-11 bg-white border-slate-200"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="middle-name" className="text-xs font-bold text-slate-655 uppercase block">Middle name (If applicable)</Label>
                          <Input
                            id="middle-name"
                            placeholder="Middle name"
                            value={state.customerMiddleName}
                            onChange={(e) => updateState({ customerMiddleName: e.target.value })}
                            className="h-11 bg-white border-slate-200"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="surname" className="text-xs font-bold text-slate-655 uppercase block">Surname</Label>
                          <Input
                            id="surname"
                            placeholder="Surname"
                            value={state.customerSurname}
                            onChange={(e) => updateState({ customerSurname: e.target.value })}
                            className="h-11 bg-white border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cust-email" className="text-xs font-bold text-slate-650 uppercase block">Your Email Address</Label>
                          <Input
                            id="cust-email"
                            type="email"
                            placeholder="Email address"
                            value={state.customerEmail}
                            onChange={(e) => updateState({ customerEmail: e.target.value })}
                            className="h-11 bg-white border-slate-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cust-email-confirm" className="text-xs font-bold text-slate-650 uppercase block">Confirm Email Address</Label>
                          <Input
                            id="cust-email-confirm"
                            type="email"
                            placeholder="Confirm email address"
                            value={state.customerEmailConfirm}
                            onChange={(e) => updateState({ customerEmailConfirm: e.target.value })}
                            className="h-11 bg-white border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cust-phone" className="text-xs font-bold text-slate-650 uppercase block">Mobile Phone Number (Optional)</Label>
                        <Input
                          id="cust-phone"
                          type="tel"
                          placeholder="Mobile Phone Number"
                          value={state.customerPhone}
                          onChange={(e) => updateState({ customerPhone: e.target.value })}
                          className="h-11 bg-white border-slate-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cust-billing" className="text-xs font-bold text-slate-650 uppercase block">Your Billing &amp; Mailing Address</Label>
                        <Input 
                          id="cust-billing"
                          placeholder="Complete billing address e.g. 23 High Street, Richmond TW9 1LN" 
                          value={state.customerAddress}
                          onChange={(e) => updateState({ customerAddress: e.target.value })}
                          className="h-11 bg-white border-slate-200"
                        />
                        <p className="text-[11px] text-slate-450 leading-relaxed font-medium">Used for receipt billing. If printed copy delivery format is selected, documents are dispatched here.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Select Service */}
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

                    {/* Property Alert Service */}
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

                    {/* Map parcel Search OR standard address lookup */}
                    {!isAlertService && (isMapSearch ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Map className="w-5 h-5 text-accent" />
                          <Label className="text-[0.9375rem] font-bold text-slate-800">Identify Land Parcel Boundary</Label>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-550 leading-relaxed -mt-2">
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
                          <Label htmlFor="address-manual" className="text-xs font-semibold text-slate-505 uppercase">Address Details (manual entry or override)</Label>
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
                        <p className="text-[11px] text-slate-400 font-medium">Locating a specific title number speeds up intermediary search times.</p>
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
                                  : "border-slate-200 bg-white hover:border-slate-355"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                                state.addons.includes("title_plan") ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                              }`}>
                                {state.addons.includes("title_plan") && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-extrabold text-[0.875rem] text-slate-900">Official Title Plan Map (+£36)</h5>
                                <p className="text-[11px] text-slate-505 leading-normal">Adds the official boundary plans outlined in red from ordnance maps.</p>
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
                                : "border-slate-200 bg-white hover:border-slate-355"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                              state.addons.includes("flood_risk") ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                            }`}>
                              {state.addons.includes("flood_risk") && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                            </div>
                            <div className="space-y-1">
                              <h5 className="font-extrabold text-[0.875rem] text-slate-900">Flood Risk Assessment (+£30)</h5>
                              <p className="text-[11px] text-slate-505 leading-normal">Environmental history assessment indicating high-risk flood potentials.</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                )
              )}

              {step === 2 && (
                isCustomWizard ? (
                  <div className="space-y-8">
                    {/* Quicker delivery */}
                    <div className="space-y-4">
                      <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Would you like your documents quicker?</Label>
                      <RadioGroup 
                        value={state.trackingType} 
                        onValueChange={(val) => updateState({ trackingType: val as any })}
                        className="grid grid-cols-1 gap-4"
                      >
                        <Label htmlFor="speed-fast" className="flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-355 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="fast_track" id="speed-fast" />
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                              <Zap className="w-5 h-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="font-extrabold text-[0.9375rem] text-slate-900 leading-tight block">Yes, receive faster (4 hours)</span>
                              <span className="text-xs text-slate-500 font-medium leading-relaxed">Intermediary queue priority processing.</span>
                            </div>
                          </div>
                          <span className="font-bold text-[0.875rem] text-primary shrink-0 ml-4">+£8.33+vat</span>
                        </Label>

                        <Label htmlFor="speed-standard" className="flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-355 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="standard" id="speed-standard" />
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="font-extrabold text-[0.9375rem] text-slate-900 leading-tight block">No, standard service (1-2 days)</span>
                              <span className="text-xs text-slate-500 font-medium leading-relaxed">Official queue processing.</span>
                            </div>
                          </div>
                          <span className="font-bold text-[0.875rem] text-primary shrink-0 ml-4">Included</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Printed copy */}
                    <div className="space-y-4">
                      <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Would you also like a printed copy of the deeds posting to you?</Label>
                      <RadioGroup 
                        value={state.deliveryType} 
                        onValueChange={(val) => updateState({ deliveryType: val as any })}
                        className="grid grid-cols-1 gap-4"
                      >
                        <Label htmlFor="del-printed" className="flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-355 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="pdf_printed" id="del-printed" />
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                              <Mail className="w-5 h-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="font-extrabold text-[0.9375rem] text-slate-900 leading-tight block">Yes, PDF and printed copy</span>
                              <span className="text-xs text-slate-500 font-medium leading-relaxed">Emailed plus official printed copy posted via Royal Mail 1st Class.</span>
                            </div>
                          </div>
                          <span className="font-bold text-[0.875rem] text-primary shrink-0 ml-4">+£8.29+vat</span>
                        </Label>

                        <Label htmlFor="del-pdf" className="flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-355 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="pdf_only" id="del-pdf" />
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="font-extrabold text-[0.9375rem] text-slate-900 leading-tight block">No, just a PDF copy</span>
                              <span className="text-xs text-slate-505 font-medium leading-relaxed">Sent securely to your email. Highly recommended.</span>
                            </div>
                          </div>
                          <span className="font-bold text-[0.875rem] text-primary shrink-0 ml-4">Included</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* SMS updates */}
                    <div className="space-y-4">
                      <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Would you like SMS application status updates?</Label>
                      <RadioGroup 
                        value={state.notificationType} 
                        onValueChange={(val) => updateState({ notificationType: val as any })}
                        className="grid grid-cols-1 gap-4"
                      >
                        <Label htmlFor="notif-sms-yes" className="flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-355 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="both" id="notif-sms-yes" />
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                              <Bell className="w-5 h-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="font-extrabold text-[0.9375rem] text-slate-900 leading-tight block">Yes, text updates</span>
                              <span className="text-xs text-slate-500 font-medium leading-relaxed">SMS updates sent straight to your mobile.</span>
                            </div>
                          </div>
                          <span className="font-bold text-[0.875rem] text-primary shrink-0 ml-4">+£4.13+vat</span>
                        </Label>

                        <Label htmlFor="notif-sms-no" className="flex items-center justify-between border-2 rounded-xl p-5 cursor-pointer hover:border-slate-355 [&:has(:checked)]:border-accent [&:has(:checked)]:bg-accent/[0.02] transition-all">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="email" id="notif-sms-no" />
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                              <Mail className="w-5 h-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <span className="font-extrabold text-[0.9375rem] text-slate-900 leading-tight block">No, email updates</span>
                              <span className="text-xs text-slate-500 font-medium leading-relaxed">Standard email updates.</span>
                            </div>
                          </div>
                          <span className="font-bold text-[0.875rem] text-primary shrink-0 ml-4">Included</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <Label htmlFor="payment-method" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Payment Method</Label>
                      <Select defaultValue="card">
                        <SelectTrigger id="payment-method" className="h-11 bg-white border-slate-200 text-xs sm:text-sm max-w-md">
                          <SelectValue placeholder="Select Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">Credit / Debit Card (Stripe)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
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
                        <Label htmlFor="email" className="text-xs font-bold text-slate-505 uppercase">Email Address (Deliveries sent here)</Label>
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
                        <Label htmlFor="emailConfirm" className="text-xs font-bold text-slate-505 uppercase">Confirm Email Address</Label>
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
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-505 uppercase">Mobile Number (Optional)</Label>
                      <Input 
                        id="phone"
                        type="tel"
                        placeholder="e.g. +44 7123 456789" 
                        value={state.customerPhone}
                        onChange={(e) => updateState({ customerPhone: e.target.value })}
                        className="h-11 border-slate-200"
                      />
                      <p className="text-[11px] text-slate-455 leading-relaxed font-medium">Necessary to receive real-time SMS progress updates.</p>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label htmlFor="billingAddress" className="text-xs font-bold text-slate-505 uppercase">Your Billing &amp; Mailing Address</Label>
                      <Input 
                        id="billingAddress"
                        placeholder="Complete billing address e.g. 23 High Street, Richmond TW9 1LN" 
                        value={state.customerAddress}
                        onChange={(e) => updateState({ customerAddress: e.target.value })}
                        className="h-11 border-slate-200"
                      />
                      <p className="text-[11px] text-slate-455 leading-relaxed font-medium">Used for receipt billing. If printed copy delivery format is selected below, documents are dispatched to this address.</p>
                    </div>
                  </div>
                )
              )}

              {step === 3 && (
                isCustomWizard ? (
                  <div className="space-y-8">
                    {/* Personal details summary */}
                    <div className="space-y-4">
                      <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Personal Details Summary</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Name</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {state.customerTitle} {state.customerName} {state.customerMiddleName} {state.customerSurname}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email</span>
                          <span className="font-bold text-slate-800 text-sm">{state.customerEmail}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Phone</span>
                          <span className="font-bold text-slate-800 text-sm">{state.customerPhone || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Billing Address</span>
                          <span className="font-bold text-slate-800 text-sm">{state.customerAddress || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Properties summary */}
                    <div className="space-y-4">
                      <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Properties Details Summary</Label>
                      <div className="space-y-3">
                        {state.properties?.map((p, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                            <span className="font-extrabold text-slate-800 block text-sm border-b border-slate-200 pb-1.5">{isMapSearch ? `Parcel ${idx + 1}` : `Property ${idx + 1}`}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">{isMapSearch ? "Pinned Location" : "Address"}</span>
                                <span className="font-medium text-slate-700">{p.propertyAddress || "N/A"}</span>
                              </div>
                              {isMapSearch && p.lat && p.lng && (
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Coordinates</span>
                                  <span className="font-medium text-slate-700">{p.lat.toFixed(6)}° N, {p.lng.toFixed(6)}° W</span>
                                </div>
                              )}
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tenure</span>
                                <span className="font-medium text-slate-700 capitalize">{p.tenure}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Title Number</span>
                                <span className="font-medium text-slate-700">{p.titleNumber || "Unknown / Not Provided"}</span>
                              </div>
                              {isDeedSearch && p.preferredDeed && p.preferredDeed !== "Select Preference" && (
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Preferred Deed</span>
                                  <span className="font-medium text-slate-700">{p.preferredDeed}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Add-ons Included</span>
                                <span className="font-medium text-slate-700">
                                  {isDJP ? [
                                    "Deceased Joint Proprietor Filing (Required)",
                                    p.includeTitleRegister && "Title Register Certificate",
                                    p.includeTitlePlan && "Title Plan Map",
                                    p.includeFloodRisk && "Flood Risk Report"
                                  ].filter(Boolean).join(", ") : isAlertService ? [
                                    "Property Alert Monitoring (Required)",
                                    p.includeTitleRegister && "Title Register Certificate",
                                    p.includeTitlePlan && "Title Plan Map",
                                    p.includeFloodRisk && "Flood Risk Report"
                                  ].filter(Boolean).join(", ") : isMapSearch ? [
                                    "Map / Land Search (Required)",
                                    p.includeTitleRegister && "Title Register Certificate",
                                    p.includeTitlePlan && "Title Plan Map",
                                    p.includeFloodRisk && "Flood Risk Report"
                                  ].filter(Boolean).join(", ") : isDeedSearch ? [
                                    "Official Deed Search (Required)",
                                    p.includeTitleRegister && "Title Register Certificate",
                                    p.includeTitlePlan && "Title Plan Map",
                                    p.includeFloodRisk && "Flood Risk Report"
                                  ].filter(Boolean).join(", ") : isOwnershipBundle ? [
                                    "Title Register & Plan Bundle (Required)",
                                    p.includeFloodRisk && "Flood Risk Report"
                                  ].filter(Boolean).join(", ") : isTitlePlan ? [
                                    "Title Plan Map (Required)",
                                    p.includeTitleRegister && "Title Register Certificate",
                                    p.includeFloodRisk && "Flood Risk Report"
                                  ].filter(Boolean).join(", ") : [
                                    "Title Register (Required)",
                                    p.includeTitlePlan && "Title Plan Map",
                                    p.includeFloodRisk && "Flood Risk Report"
                                  ].filter(Boolean).join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="space-y-4">
                      <Label className="text-sm font-extrabold uppercase tracking-wider text-slate-400 block">Price Breakdown</Label>
                      {priceCalculating || !priceBreakdown ? (
                        <div className="py-10 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-xl border border-slate-200">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-slate-505 text-sm font-semibold">Calculating official HMLR fees &amp; service VAT...</p>
                        </div>
                      ) : (
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
                                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Number of Properties</span>
                                <span className="font-bold text-slate-800 text-[0.9375rem]">{state.propertyCount}</span>
                              </div>
                            </div>

                            {/* Line items invoice breakdown */}
                            <div className="space-y-3 py-2">
                              {priceBreakdown.lineItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                                  <div>
                                    <span className="text-slate-650 font-bold block">{item.label}</span>
                                    {item.note && <span className="text-[11px] text-slate-400 block font-semibold">{item.note}</span>}
                                  </div>
                                  <span className="font-extrabold text-slate-850">£{(item.amount).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Invoice divider */}
                            <div className="border-t border-dashed border-slate-355 my-4 pt-4 space-y-2.5 text-xs sm:text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-550 font-semibold">Total Official Document Fees (HMLR Passthrough, No VAT)</span>
                                <span className="font-bold text-slate-800">£{(priceBreakdown.documentFee).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-550 font-semibold">Processing Intermediary Fee (Excl. VAT)</span>
                                <span className="font-bold text-slate-800">£{(priceBreakdown.serviceFee - priceBreakdown.vatAmount).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-550 font-semibold">VAT on Intermediary Services (20%)</span>
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
                      )}
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
                  </div>
                ) : (
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
                                <span className="text-xs text-slate-505 font-medium leading-relaxed">{item.desc}</span>
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
                )
              )}

              {step === 4 && (
                isCustomWizard ? (
                  <div className="space-y-8 text-center py-6">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                        <ShieldCheck className="w-10 h-10" />
                      </div>
                      <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-primary">Your order is ready to submit</h3>
                      <p className="text-sm text-slate-550 font-bold">
                        Click below to complete your payment securely via Stripe and start your order.
                      </p>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-6">
                        <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider mb-1">Total Amount Payable</span>
                        <span className="font-extrabold text-4xl text-accent font-heading">£{(priceBreakdown?.totalAmount || 0).toFixed(2)}</span>
                        <span className="text-[10px] text-slate-455 block mt-2 font-semibold">Includes official HMLR government fees and 20% VAT on intermediary services.</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6 font-bold text-slate-700 hover:bg-slate-100">
                          Edit Your Order
                        </Button>
                        <Button 
                          onClick={handleSubmit} 
                          className="bg-accent hover:bg-accent/90 text-white h-12 px-10 font-extrabold shadow-lg shadow-accent/25 rounded-lg text-[0.9375rem] transition-all hover:shadow-accent/45 hover:-translate-y-px flex-1"
                          disabled={createOrder.isPending || createCheckoutSession.isPending || priceCalculating || !state.agreedToWaiveCancel}
                        >
                          {(createOrder.isPending || createCheckoutSession.isPending) ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing Stripe Checkout...</>
                          ) : (
                            <>Pay &amp; Secure Order <ArrowRight className="w-4 h-4 ml-2" /></>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 justify-center text-[11px] text-slate-450 pt-4 border-t border-slate-100">
                        <ShieldCheck className="w-4 h-4 text-emerald-655 shrink-0" />
                        <span>PCI-DSS Level 1 Secure Card Processing via Stripe · 256-bit TLS Encryption</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {priceCalculating || !priceBreakdown ? (
                      <div className="py-16 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-slate-505 text-sm font-semibold">Calculating official HMLR fees &amp; service VAT...</p>
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
                                <span className="text-slate-555">Total Official Document Fees (HMLR Passthrough, No VAT)</span>
                                <span className="font-bold text-slate-800">£{(priceBreakdown.documentFee).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-555">Processing Intermediary Fee (Excl. VAT)</span>
                                <span className="font-bold text-slate-800">£{(priceBreakdown.serviceFee - priceBreakdown.vatAmount).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-555">VAT on Intermediary Services (20%)</span>
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
                )
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
            isCustomWizard ? null : (
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
            )
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
