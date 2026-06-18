import { Router, type IRouter, type Request, type Response } from "express";
import { crmSupabase } from "@workspace/db";

const router: IRouter = Router();

router.post("/contact", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message, subject } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: "Missing required fields: name, email, message" });
      return;
    }

    if (!crmSupabase) {
      console.error("CRM Supabase client is not initialized.");
      res.status(500).json({ error: "CRM integration is not configured" });
      return;
    }

    // Look up brand_id for OLR so it shows in the CRM SITE column
    let brandId = null;
    const { data: brand } = await crmSupabase.from('brands').select('id').eq('code', 'OLR').single();
    if (brand) brandId = brand.id;

    const { error } = await crmSupabase.from('help_requests').insert([
      {
        customer_name: name,
        customer_email: email,
        subject: subject || 'Contact Form - Property-Detailer',
        body: message,
        status: 'pending',
        brand_id: brandId
      }
    ]);

    if (error) {
      console.error("Error inserting help request:", error);
      res.status(500).json({ error: "Failed to submit request" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
