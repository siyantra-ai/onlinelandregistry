// Official HMLR document fee passed through per property
export const DOCUMENT_FEE_PER_PROPERTY = 7.0;

// Add-on pricing
export const ADDON_PRICES: Record<string, number> = {
  title_plan: 36.0,
  flood_risk: 12.0,
  chancel_repair: 8.0,
  coal_mining: 8.0,
};

// Tracking type extras (on top of base)
export const TRACKING_EXTRAS: Record<string, number> = {
  standard: 0,
  fast_track: 10.0,
  super_fast_track: 20.0,
};

// Delivery extras
export const DELIVERY_EXTRAS: Record<string, number> = {
  pdf_only: 0,
  pdf_printed: 9.95,
};

// Notification extras
export const NOTIFICATION_EXTRAS: Record<string, number> = {
  email: 0,
  sms: 4.95,
  both: 4.95,
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
}

export interface PriceResult {
  documentFee: number;
  serviceFee: number;
  vatAmount: number;
  totalAmount: number;
  lineItems: Array<{ label: string; amount: number; note?: string | null }>;
}

export function calculatePrice(config: PriceConfig, basePrice: number): PriceResult {
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
