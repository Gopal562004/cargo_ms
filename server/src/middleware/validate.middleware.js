import { AppError } from './error.middleware.js';

/**
 * Safely updates req[source] in Express 5 without re-assigning read-only getter properties.
 */
function setRequestData(req, source, data) {
  if (source === 'body') {
    req.body = data;
  } else if (req[source] && typeof req[source] === 'object') {
    // Clear existing keys and assign validated data
    for (const key of Object.keys(req[source])) {
      delete req[source][key];
    }
    Object.assign(req[source], data);
  }
}

/**
 * Creates a validation middleware that validates request data against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 * @param {'body' | 'query' | 'params'} source - Which part of the request to validate.
 * @returns {Function} Express middleware function.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const result = schema.parse(req[source]);
      setRequestData(req, source, result);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validates multiple sources at once.
 *
 * @param {Object} schemas - Object with keys 'body', 'query', 'params' mapping to Zod schemas.
 * @returns {Function} Express middleware function.
 */
export function validateMultiple(schemas) {
  return (req, _res, next) => {
    try {
      for (const [source, schema] of Object.entries(schemas)) {
        const result = schema.parse(req[source]);
        setRequestData(req, source, result);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
