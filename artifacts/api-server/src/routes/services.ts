import { Router, type IRouter } from "express";
import { db, servicesTable, hasDb } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListServicesResponse, GetServiceParams, GetServiceResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

export const MOCK_SERVICES = [
  {
    id: 1,
    name: "HM Land Registry Title Register",
    slug: "title-register",
    basePrice: 36,
    description: "Official record confirming the registered owners, tenure type (Freehold/Leasehold), purchase price, mortgages, and charges.",
    deliverables: "Official Copy, Register Details, Owner Info",
    category: "property_document",
    turnaround: "From 1 hour",
    popular: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "HM Land Registry Title Plan",
    slug: "title-plan",
    basePrice: 36,
    description: "Scale boundary map illustrating the property outline in red, adjacent access roads, and shared easement zones.",
    deliverables: "Official Copy, Boundary Map, Scale Details",
    category: "property_document",
    turnaround: "From 1 hour",
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Property Ownership Bundle",
    slug: "ownership-bundle",
    basePrice: 60,
    description: "Both the Title Register and Title Plan compiled into a single PDF package. Saves money compared to separate orders.",
    deliverables: "Title Register, Title Plan, Combined PDF",
    category: "bundle",
    turnaround: "From 1 hour",
    popular: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Official Deed Search",
    slug: "deed-search",
    basePrice: 41,
    description: "Historical transfers (TR1 forms), original leasehold contracts, and historic boundary plans.",
    deliverables: "Historic Deeds, Original TR1, Covenants",
    category: "deed_search",
    turnaround: "4 hours Fast-Track",
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Map / Land Search",
    slug: "map-land-search",
    basePrice: 53,
    description: "GIS coordinate-based lookup for plots, fields, verges, or forests lacking a standard postal address.",
    deliverables: "GIS Coordinate Map, Parcel Boundary",
    category: "land_search",
    turnaround: "4 hours Fast-Track",
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Property Alert Service",
    slug: "property-alert",
    basePrice: 36,
    description: "Fraud monitoring for up to 3 titles. Notifies you instantly if third parties attempt to alter deeds.",
    deliverables: "Fraud Alert, Real-time Monitoring",
    category: "monitoring",
    turnaround: "Instant Setup",
    popular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    name: "Deceased Joint Proprietor (DJP)",
    slug: "deceased-joint-proprietor",
    basePrice: 65,
    description: "Form preparation and filing service to remove a deceased joint owner's name and establish sole absolute title.",
    deliverables: "Form DJP, Registration Update",
    category: "legal_form",
    turnaround: "1-2 days Dispatch",
    popular: false,
    createdAt: new Date().toISOString(),
  }
];

router.get("/services", async (req, res): Promise<void> => {
  if (!hasDb) {
    res.json(ListServicesResponse.parse(MOCK_SERVICES));
    return;
  }
  const services = await db.select().from(servicesTable).orderBy(servicesTable.id);
  res.json(ListServicesResponse.parse(services.map(s => ({ ...s, basePrice: Number(s.basePrice) }))));
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  if (!hasDb) {
    const service = MOCK_SERVICES.find((s: any) => s.id === params.data.id);
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(GetServiceResponse.parse(service));
    return;
  }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, params.data.id));
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(GetServiceResponse.parse({ ...service, basePrice: Number(service.basePrice) }));
});

export default router;
