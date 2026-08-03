import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(["USER", "AGENT", "SUPERVISOR", "BUSINESS_OWNER", "ADMIN"]).optional(),
  accountType: z.string().optional(),
  companyName: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export const bookDemoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  organisation: z.string().min(1, "Organisation is required"),
  website: z.string().optional(),
});

export const submitSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.string().min(1, "Category is required"),
  photoUrl: z.string().url("Invalid photo URL"),
  contactInfo: z.string().max(500, "Contact info too long").optional(),
  customFeatures: z.any().optional(),
});

export const uploadUrlSchema = z.object({
  filename: z.string().min(1).regex(/^[^/\\]+$/, "Path traversal not allowed"),
  contentType: z.string().regex(/^image\//, "Only images allowed"),
});

export const verifySubmissionSchema = z.object({
  submissionId: z.string().cuid("Invalid submission ID"),
  action: z.enum(["APPROVE", "REJECT"]),
  feedback: z.string().optional(),
  grade: z.number().min(0).max(100),
});

export const agentStatusSchema = z.object({
  status: z.enum(["ACTIVE", "FLAGGED", "SUSPENDED", "PENDING", "TRAINING"]),
});

export const agentPromoteSchema = z.object({
  role: z.enum(["AGENT", "REVIEWER", "SUPERVISOR", "PROJECT_MANAGER", "ADMIN"]),
});

export const userUpdateSchema = z.object({
  userId: z.string().cuid(),
  status: z.enum(["ACTIVE", "FLAGGED", "SUSPENDED", "PENDING", "TRAINING"]).optional(),
  role: z.enum(["USER", "AGENT", "SUPERVISOR", "BUSINESS_OWNER", "ADMIN"]).optional(),
});

// Reviewer first-pass review
export const reviewerActionSchema = z.object({
  submissionId: z.string().cuid(),
  action: z.enum(["APPROVE", "REJECT"]),
  grade: z.number().int().min(0).max(100),
  feedback: z.string().optional(),
})

// QA certification
export const qaActionSchema = z.object({
  submissionId: z.string().cuid(),
  action: z.enum(["CERTIFY", "REJECT", "ESCALATE"]),
  grade: z.number().int().min(0).max(100),
  feedback: z.string().optional(),
  overrideReason: z.string().optional(), // required if overriding reviewer
})

// Admin spot-check
export const spotCheckSchema = z.object({
  submissionId: z.string().cuid(),
  verdict: z.enum(["UPHELD", "FLAGGED"]),
  auditorNote: z.string().optional(),
})
