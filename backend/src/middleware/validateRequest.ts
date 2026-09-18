import { Request, Response, NextFunction } from 'express';
import { ZodSchema, AnyZodObject } from 'zod';

export interface RequestValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest = (schema: RequestValidationSchema | AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if schema has body, query, or params keys
      if ('body' in schema || 'query' in schema || 'params' in schema) {
        const s = schema as RequestValidationSchema;
        if (s.body) req.body = await s.body.parseAsync(req.body);
        if (s.query) req.query = await s.query.parseAsync(req.query);
        if (s.params) req.params = await s.params.parseAsync(req.params);
      } else {
        const parsed = await (schema as AnyZodObject).parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

