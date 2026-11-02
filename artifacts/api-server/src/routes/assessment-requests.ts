import { Router, type IRouter } from "express";
import { db, assessmentRequestsTable } from "@workspace/db";
import {
  SubmitAssessmentRequestBody,
  SubmitAssessmentRequestResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const attempts = new Map<string, number[]>();
const windowMs = 60 * 60 * 1000;

router.post("/assessment-requests", async (req, res): Promise<void> => {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= 5) {
    res.status(429).json({ error: "Too many requests. Please call us instead." });
    return;
  }

  const parsed = SubmitAssessmentRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the required fields and try again." });
    return;
  }
  if (parsed.data.website) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  attempts.set(key, [...recent, now]);
  if (attempts.size > 5000) {
    for (const [ip, timestamps] of attempts) {
      if (timestamps.every((time) => now - time >= windowMs)) attempts.delete(ip);
    }
  }

  const { name, email, phone, interest, message } = parsed.data;
  await db.insert(assessmentRequestsTable).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    interest: interest.trim(),
    message: message?.trim() || null,
  });

  res.status(201).json(
    SubmitAssessmentRequestResponse.parse({
      success: true,
      message: "Thanks for reaching out. Your request has been received.",
    }),
  );
});

export default router;