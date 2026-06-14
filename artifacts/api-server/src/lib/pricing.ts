// Official HMLR document fee passed through per property
export const DOCUMENT_FEE_PER_PROPERTY = 7.0;

// Add-on pricing
export const ADDON_PRICES: Record<string, number> = {
  title_plan: 36.0,
  flood_risk: 25.0,
  chancel_repair: 8.0,
  coal_mining: 8.0,
};

// Tracking type extras (on top of base)
export const TRACKING_EXTRAS: Record<string, number> = {
  standard: 0,
  fast_track: 8.33,
  super_fast_track: 16.67,
};

// Delivery extras
export const DELIVERY_EXTRAS: Record<string, number> = {
  pdf_only: 0,
  pdf_printed: 8.29,
};

// Notification extras
export const NOTIFICATION_EXTRAS: Record<string, number> = {
  email: 0,
  sms: 4.13,
  both: 4.13,
};

// VAT rate on service fee portion only
export const VAT_RATE = 0.2;

interface PriceConfig {
  basePrice: number;
  propertyCount: number;
  country: string;
  trackingType: string;
  deliveryType: string;
  notificationType: string;
  addons: string[];
  serviceSlug?: string;
}

export interface PriceResult {
  documentFee: number;
  serviceFee: number;
  vatAmount: number;
  totalAmount: number;
  lineItems: Array<{ label: string; amount: number; note?: string | null }>;
}

export function calculatePrice(config: PriceConfig, basePrice: number): PriceResult {
  if (config.serviceSlug === "title-register" || config.serviceSlug === "title-plan" || config.serviceSlug === "ownership-bundle" || config.serviceSlug === "deed-search" || config.serviceSlug === "map-land-search" || config.serviceSlug === "property-alert" || config.serviceSlug === "deceased-joint-proprietor") {
    const propertyCount = config.propertyCount || 1;

    // Base prices excluding VAT:
    const isBundle = config.serviceSlug === "ownership-bundle";
    const isDeed = config.serviceSlug === "deed-search";
    const isMap = config.serviceSlug === "map-land-search";
    const isDJP = config.serviceSlug === "deceased-joint-proprietor";
    const documentFeeExcl = (isBundle ? 20.00 : 10.00) * propertyCount;
    let serviceFeeBase = (isBundle ? 30.00 : isDeed ? 24.17 : isMap ? 34.17 : isDJP ? 44.17 : 20.00) * propertyCount;

    // Extras (excl VAT):
    const trackingExtra = config.trackingType === "fast_track" ? 8.33 : config.trackingType === "super_fast_track" ? 16.67 : 0;
    const deliveryExtra = config.deliveryType === "pdf_printed" ? 8.29 : 0;
    const notificationExtra = (config.notificationType === "sms" || config.notificationType === "both") ? 4.13 : 0;

    // Addons
    let addonTotalExcl = 0;
    const addonLineItems: Array<{ label: string; amount: number; note: string | null }> = [];
    
    const titlePlanCount = config.addons.filter(a => a === "title_plan").length;
    const titleRegisterCount = config.addons.filter(a => a === "title_register").length;
    const floodRiskCount = config.addons.filter(a => a === "flood_risk").length;

    if (titlePlanCount > 0) {
      const amount = 30.00 * titlePlanCount;
      addonTotalExcl += amount;
      addonLineItems.push({
        label: "Include Title Plan",
        amount: Math.round(amount * 1.2 * 100) / 100,
        note: `£36.00 × ${titlePlanCount} propert${titlePlanCount === 1 ? "y" : "ies"}`
      });
    }

    if (titleRegisterCount > 0) {
      const amount = 30.00 * titleRegisterCount;
      addonTotalExcl += amount;
      addonLineItems.push({
        label: "Include Title Register",
        amount: Math.round(amount * 1.2 * 100) / 100,
        note: `£36.00 × ${titleRegisterCount} propert${titleRegisterCount === 1 ? "y" : "ies"}`
      });
    }

    if (floodRiskCount > 0) {
      const amount = 25.00 * floodRiskCount;
      addonTotalExcl += amount;
      addonLineItems.push({
        label: "Include Flood Risk",
        amount: Math.round(amount * 1.2 * 100) / 100,
        note: `£30.00 × ${floodRiskCount} propert${floodRiskCount === 1 ? "y" : "ies"}`
      });
    }

    const scotlandMultiplier = config.country === "scotland" ? 1.1 : 1;
    if (scotlandMultiplier > 1) {
      serviceFeeBase = serviceFeeBase * scotlandMultiplier;
    }

    const serviceFeeExcl = serviceFeeBase + trackingExtra + deliveryExtra + notificationExtra + addonTotalExcl;

    // Total VAT (20% on document fee portion + service fee portion)
    const totalExclVat = documentFeeExcl + serviceFeeExcl;
    const vatAmount = Math.round(totalExclVat * 0.2 * 100) / 100;
    const totalAmount = Math.round((totalExclVat + vatAmount) * 100) / 100;

    const documentFeeIncl = Math.round(documentFeeExcl * 1.2 * 100) / 100;
    const serviceFeeIncl = Math.round(serviceFeeExcl * 1.2 * 100) / 100;

    const lineItems = [
      {
        label: "Document Fee",
        amount: documentFeeIncl,
        note: `£${(isBundle ? 24.00 : 12.00).toFixed(2)} × ${propertyCount} propert${propertyCount === 1 ? "y" : "ies"}`
      },
      {
        label: "Search & Processing Fee",
        amount: Math.round((serviceFeeIncl - trackingExtra * 1.2 - deliveryExtra * 1.2 - notificationExtra * 1.2 - addonTotalExcl * 1.2) * 100) / 100,
        note: null
      }
    ];

    if (trackingExtra > 0) {
      lineItems.push({
        label: "Fast Track Processing",
        amount: Math.round(trackingExtra * 1.2 * 100) / 100,
        note: null
      });
    }
    if (deliveryExtra > 0) {
      lineItems.push({
        label: "Printed Copy Posting",
        amount: Math.round(deliveryExtra * 1.2 * 100) / 100,
        note: null
      });
    }
    if (notificationExtra > 0) {
      lineItems.push({
        label: "SMS Status Updates",
        amount: Math.round(notificationExtra * 1.2 * 100) / 100,
        note: null
      });
    }
    lineItems.push(...addonLineItems);

    return {
      documentFee: documentFeeExcl,
      serviceFee: serviceFeeExcl,
      vatAmount,
      totalAmount,
      lineItems
    };
  }

  const documentFee = DOCUMENT_FEE_PER_PROPERTY * config.propertyCount;

  // Scotland has a slight premium (10% on service fee)
  const scotlandMultiplier = config.country === "scotland" ? 1.1 : 1;

  let serviceFeeBase = (basePrice - DOCUMENT_FEE_PER_PROPERTY) * config.propertyCount * scotlandMultiplier;

  const trackingExtra = TRACKING_EXTRAS[config.trackingType] ?? 0;
  const deliveryExtra = DELIVERY_EXTRAS[config.deliveryType] ?? 0;
  const notificationExtra = NOTIFICATION_EXTRAS[config.notificationType] ?? 0;

  let addonTotal = 0;
  const addonLineItems: Array<{ label: string; amount: number; note: null }> = [];
  for (const addon of config.addons) {
    const price = ADDON_PRICES[addon];
    if (price) {
      addonTotal += price;
      addonLineItems.push({ label: addon.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), amount: price, note: null });
    }
  }

  const serviceFee = serviceFeeBase + trackingExtra + deliveryExtra + notificationExtra + addonTotal;
  const vatAmount = Math.round(serviceFee * VAT_RATE * 100) / 100;
  const totalAmount = Math.round((documentFee + serviceFee + vatAmount) * 100) / 100;

  const lineItems = [
    { label: "HM Land Registry Document Fee", amount: documentFee, note: `£${DOCUMENT_FEE_PER_PROPERTY.toFixed(2)} × ${config.propertyCount} propert${config.propertyCount === 1 ? "y" : "ies"}` },
    { label: "Service & Processing Fee", amount: Math.round(serviceFeeBase * 100) / 100, note: null },
  ];

  if (trackingExtra > 0) {
    lineItems.push({ label: `${config.trackingType === "fast_track" ? "Fast Track" : "Super-Fast Track"} (non-refundable)`, amount: trackingExtra, note: null });
  }
  if (deliveryExtra > 0) {
    lineItems.push({ label: "Printed Copy", amount: deliveryExtra, note: null });
  }
  if (notificationExtra > 0) {
    lineItems.push({ label: "SMS Updates", amount: notificationExtra, note: null });
  }
  lineItems.push(...addonLineItems);
  lineItems.push({ label: "VAT (20% on service fee)", amount: vatAmount, note: null });

  return { documentFee, serviceFee: Math.round(serviceFee * 100) / 100, vatAmount, totalAmount, lineItems };
}
