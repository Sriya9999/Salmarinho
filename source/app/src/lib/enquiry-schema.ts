// The event enquiry form, checked the same way in the browser and on the server.
import { z } from "@/lib/zod";

import { EVENT_TYPES } from "@/lib/site";

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(80),
  email: z.string().trim().max(120).email("Please check your email address."),
  phone: z
    .string()
    .trim()
    .min(6, "Please add a phone or WhatsApp number.")
    .max(24)
    .regex(/^[+\d][\d\s()-]{5,23}$/, "Please use digits, spaces and an optional + only."),
  eventType: z.enum(EVENT_TYPES, { message: "Please choose the kind of event." }),
  eventDate: z.string().trim().min(1, "Please add a date or a rough timeframe.").max(60),
  location: z.string().trim().min(1, "Please tell us where it will be.").max(120),
  guests: z.number({ message: "Please add a rough guest count." }).int().min(1, "At least one guest.").max(2000),
  message: z.string().trim().min(10, "A line or two about the occasion helps us reply well.").max(1500),
  // Honeypot: real visitors never see or fill this.
  website: z.string().max(0).default(""),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
