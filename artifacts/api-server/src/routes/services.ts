import { Router, type IRouter } from "express";
import { supabase } from "@workspace/db";
import { ListServicesResponse, GetServiceParams, GetServiceResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  const { data: services, error } = await supabase.from('services').select('*').order('id');
  if (error || !services) {
    res.status(500).json({ error: error?.message || "Failed to fetch services" });
    return;
  }
  res.json(ListServicesResponse.parse(services.map(s => ({ ...s, basePrice: Number(s.basePrice) }))));
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { data: service, error } = await supabase.from('services').select('*').eq('id', params.data.id).maybeSingle();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(GetServiceResponse.parse({ ...service, basePrice: Number(service.basePrice) }));
});

export default router;
