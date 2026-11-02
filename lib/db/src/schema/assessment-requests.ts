import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assessmentRequestsTable = pgTable("assessment_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  interest: text("interest").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAssessmentRequestSchema = createInsertSchema(assessmentRequestsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAssessmentRequest = z.infer<typeof insertAssessmentRequestSchema>;
export type AssessmentRequest = typeof assessmentRequestsTable.$inferSelect;