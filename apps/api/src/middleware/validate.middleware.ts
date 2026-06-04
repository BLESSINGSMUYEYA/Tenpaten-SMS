import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';

/**
 * Zod Schema Validation Middleware
 * Validates request body against Zod schemas and passes ZodError to the global error handler
 */
export function validateBody(schema: Schema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validates query parameters
 */
export function validateQuery(schema: Schema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
}
