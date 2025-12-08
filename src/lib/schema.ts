import { z } from "zod";

export const AddWorkLogSchema = z.object({
  date: z.date(),
  checkIn: z.string(),
  checkOut: z.string(),
  userId: z.string(),
});
