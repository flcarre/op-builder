import { z } from 'zod';

// ============================================
// Access Point Schemas
// ============================================

export const createAccessPointSchema = z.object({
  sessionId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateAccessPointSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const accessPointByIdSchema = z.object({
  id: z.string(),
});

export const accessPointsBySessionSchema = z.object({
  sessionId: z.string(),
});

// ============================================
// Access Level Schemas
// ============================================

export const createAccessLevelSchema = z.object({
  accessPointId: z.string(),
  name: z.string().min(1).max(100),
  password: z.string().min(1).max(50),
});

export const updateAccessLevelSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(1).max(50).optional(),
});

export const accessLevelByIdSchema = z.object({
  id: z.string(),
});

export const accessLevelByTokenSchema = z.object({
  qrToken: z.string(),
});

export const validateAccessPasswordSchema = z.object({
  levelId: z.string(),
  password: z.string(),
});

// ============================================
// Simple Access Schemas
// ============================================

export const createSimpleAccessSchema = z.object({
  sessionId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  password: z.string().min(1).max(50),
});

export const updateSimpleAccessSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  password: z.string().min(1).max(50).optional(),
});

export const simpleAccessByIdSchema = z.object({
  id: z.string(),
});

export const simpleAccessByTokenSchema = z.object({
  qrToken: z.string(),
});

export const validateSimpleAccessPasswordSchema = z.object({
  qrToken: z.string(),
  password: z.string(),
});

// ============================================
// Type Exports
// ============================================

export type CreateAccessPointInput = z.infer<typeof createAccessPointSchema>;
export type UpdateAccessPointInput = z.infer<typeof updateAccessPointSchema>;
export type AccessPointByIdInput = z.infer<typeof accessPointByIdSchema>;
export type AccessPointsBySessionInput = z.infer<typeof accessPointsBySessionSchema>;

export type CreateAccessLevelInput = z.infer<typeof createAccessLevelSchema>;
export type UpdateAccessLevelInput = z.infer<typeof updateAccessLevelSchema>;
export type AccessLevelByIdInput = z.infer<typeof accessLevelByIdSchema>;
export type AccessLevelByTokenInput = z.infer<typeof accessLevelByTokenSchema>;
export type ValidateAccessPasswordInput = z.infer<typeof validateAccessPasswordSchema>;

export type CreateSimpleAccessInput = z.infer<typeof createSimpleAccessSchema>;
export type UpdateSimpleAccessInput = z.infer<typeof updateSimpleAccessSchema>;
export type SimpleAccessByIdInput = z.infer<typeof simpleAccessByIdSchema>;
export type SimpleAccessByTokenInput = z.infer<typeof simpleAccessByTokenSchema>;
export type ValidateSimpleAccessPasswordInput = z.infer<typeof validateSimpleAccessPasswordSchema>;
