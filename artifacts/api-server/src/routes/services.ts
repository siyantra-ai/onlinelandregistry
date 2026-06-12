import { Router, type IRouter } from "express";
import { db, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListServicesResponse, GetServiceParams, GetServiceResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  const services = await db.select().from(servicesTable).orderBy(servicesTable.id);
  res.json(ListServicesResponse.parse(services.map(s => ({ ...s, basePrice: Number(s.basePrice) }))));
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
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
