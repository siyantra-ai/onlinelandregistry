// Official HMLR document fee passed through per property
export const DOCUMENT_FEE_PER_PROPERTY = 7.0;

// Add-on pricing (inclusive total amounts)
export const ADDON_PRICES: Record<string, number> = {
  title_plan: 20.0,
  title_register: 20.0,
  flood_risk: 7.0,
  chancel_repair: 8.0,
  coal_mining: 8.0,
};

// Tracking type extras (flat inclusive amounts)
export const TRACKING_EXTRAS: Record<string, number> = {
  standard: 0,
  fast_track: 10.0,
  super_fast_track: 12.0,
};

// Delivery extras (flat inclusive amounts)
export const DELIVERY_EXTRAS: Record<string, number> = {
  pdf_only: 0,
  pdf_printed: 7.0,
};

// Notification extras (flat inclusive amounts)
export const NOTIFICATION_EXTRAS: Record<string, number> = {
  email: 0,
  sms: 5.0,
  both: 5.0,
};

// VAT rate on service fee portion only (20% standard UK VAT)
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
  const propertyCount = config.propertyCount || 1;
  const isBundle = config.serviceSlug === 'ownership-bundle';
  const isMap = config.serviceSlug === 'map-land-search';

  // Base pricing logic per client:
  // - Singular docs (Title Register, Title Plan, Deed Search, Property Alert):
  //   Total = £20.00 (Government fee: £7.00, Search & Processing fee: £13.00 incl. VAT)
  // - Property Ownership Bundle:
  //   Total = £35.00 (Government fee: £14.00 for 2 docs, Search & Processing fee: £21.00 incl. VAT)
  // - Map / Land Search:
  //   Total = £25.00 (Government fee: £7.00, Search & Processing fee: £18.00 incl. VAT)

  const docFeePerProperty = isBundle ? 14.00 : 7.00;
  const documentFeeTotal = docFeePerProperty * propertyCount;

  let serviceFeeBase = (isBundle ? 21.00 : isMap ? 18.00 : 13.00) * propertyCount;

  // Scotland surcharge: 10% on service fee portion
  const scotlandMultiplier = config.country === 'scotland' ? 1.1 : 1;
  if (scotlandMultiplier > 1) {
    serviceFeeBase = Math.round(serviceFeeBase * scotlandMultiplier * 100) / 100;
  }

  // Extras (all inclusive amounts, rolled directly into search and processing fee)
  const trackingExtra = TRACKING_EXTRAS[config.trackingType] ?? 0;
  const deliveryExtra = DELIVERY_EXTRAS[config.deliveryType] ?? 0;
  const notificationExtra = NOTIFICATION_EXTRAS[config.notificationType] ?? 0;

  // Add-ons
  let addonTotal = 0;
  const titlePlanCount = config.addons.filter(a => a === 'title_plan').length;
  const titleRegisterCount = config.addons.filter(a => a === 'title_register').length;
  const floodRiskCount = config.addons.filter(a => a === 'flood_risk').length;

  if (titlePlanCount > 0) {
    addonTotal += 20.00 * titlePlanCount;
  }
  if (titleRegisterCount > 0) {
    addonTotal += 20.00 * titleRegisterCount;
  }
  if (floodRiskCount > 0) {
    addonTotal += 7.00 * floodRiskCount;
  }

  for (const addon of config.addons) {
    if (addon !== 'title_plan' && addon !== 'title_register' && addon !== 'flood_risk') {
      const p = ADDON_PRICES[addon] ?? 0;
      addonTotal += p;
    }
  }

  // Total Search & Processing Fee (including all add-ons and extras, inclusive of VAT)
  const totalServiceFee = Math.round((serviceFeeBase + trackingExtra + deliveryExtra + notificationExtra + addonTotal) * 100) / 100;

  // Total Amount charged to customer
  const totalAmount = Math.round((documentFeeTotal + totalServiceFee) * 100) / 100;

  // VAT portion contained within the service fee (gross / 6)
  const vatAmount = Math.round((totalServiceFee - totalServiceFee / (1 + VAT_RATE)) * 100) / 100;
  const netServiceFee = Math.round((totalServiceFee - vatAmount) * 100) / 100;

  // Clean 2-line itemized breakdown for customer review
  const lineItems = [
    {
      label: 'Government / Document Fee',
      amount: documentFeeTotal,
      note: '£' + docFeePerProperty.toFixed(2) + ' × ' + propertyCount + ' propert' + (propertyCount === 1 ? 'y' : 'ies')
    },
    {
      label: 'Search & Processing Fee',
      amount: totalServiceFee,
      note: 'Including VAT & all selected options'
    }
  ];

  return {
    documentFee: documentFeeTotal,
    serviceFee: netServiceFee,
    vatAmount,
    totalAmount,
    lineItems
  };
}
