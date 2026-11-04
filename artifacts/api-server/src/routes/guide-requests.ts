import { Router, type IRouter } from "express";
import type { GuideAvailability } from "@workspace/api-zod";

const router: IRouter = Router();

// The production book flow is a Cloudflare Pages Function. Local preview must
// never fake capture, queue an email, or reuse the assessment endpoint.
router.get("/guide-requests", (_req, res) => {
  const availability: GuideAvailability = { enabled: false, mode: "disabled" };
  res.set("Cache-Control", "no-store").json(availability);
});

router.post("/guide-requests", (_req, res) => {
  res.set("Cache-Control", "no-store").status(503).json({
    error: "Book delivery is being prepared. This preview does not capture book requests or send emails.",
  });
});

export default router;
