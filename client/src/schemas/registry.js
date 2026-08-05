/**
 * Document Type Schema Registry (Refactored to Modular Structure)
 * 
 * All document category schemas are modularized under `client/src/documents/`.
 */

import SCHEMA_REGISTRY, { getDocumentSchema, getAllDocumentTypes } from '../documents/index.js';

export { getDocumentSchema, getAllDocumentTypes };
export default SCHEMA_REGISTRY;
