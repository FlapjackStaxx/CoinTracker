import cors from 'cors';
import express from 'express';
import { createItemsRepository } from './repositories/itemsRepository.js';
import { recognizeCurrency } from './services/recognition.js';

const VALID_STATUSES = new Set(['owned', 'sold', 'wishlist']);

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function buildValidationError(errors) {
  return { errors };
}

function sanitizeString(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function sanitizeNumber(value, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, integer = false } = {}) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }
  if (integer && !Number.isInteger(value)) {
    return undefined;
  }
  if (value < min || value > max) {
    return undefined;
  }
  return value;
}

function parseCreatePayload(payload) {
  const errors = [];
  const data = {};

  const requiredFields = ['name', 'country', 'denomination'];
  for (const field of requiredFields) {
    const sanitized = sanitizeString(payload[field]);
    if (sanitized === undefined || sanitized === null) {
      errors.push(`${field} is required`);
    } else {
      data[field] = sanitized;
    }
  }

  const year = sanitizeNumber(payload.year, { min: 0, max: 2100, integer: true });
  if (year === undefined) {
    errors.push('year must be an integer between 0 and 2100 when provided');
  } else {
    data.year = year;
  }

  for (const field of ['catalog_reference', 'description', 'notes', 'image_path']) {
    const sanitized = sanitizeString(payload[field]);
    if (sanitized === undefined) {
      errors.push(`${field} must be a string when provided`);
    } else {
      data[field] = sanitized;
    }
  }

  for (const field of ['estimated_value', 'market_value']) {
    const sanitized = sanitizeNumber(payload[field], { min: 0 });
    if (sanitized === undefined) {
      errors.push(`${field} must be a positive number when provided`);
    } else {
      data[field] = sanitized;
    }
  }

  const statusInput = payload.status ?? 'owned';
  if (!VALID_STATUSES.has(statusInput)) {
    errors.push(`status must be one of: ${Array.from(VALID_STATUSES).join(', ')}`);
  } else {
    data.status = statusInput;
  }

  return { data, errors };
}

function parseUpdatePayload(payload) {
  const errors = [];
  const updates = {};
  let hasField = false;

  const maybeAssignString = (field) => {
    if (!(field in payload)) {
      return;
    }
    hasField = true;
    const sanitized = sanitizeString(payload[field]);
    if (sanitized === undefined) {
      errors.push(`${field} must be a string or null`);
    } else {
      updates[field] = sanitized;
    }
  };

  for (const field of ['name', 'country', 'denomination', 'catalog_reference', 'description', 'notes', 'image_path']) {
    maybeAssignString(field);
  }

  if ('year' in payload) {
    hasField = true;
    const sanitized = sanitizeNumber(payload.year, { min: 0, max: 2100, integer: true });
    if (sanitized === undefined) {
      errors.push('year must be an integer between 0 and 2100 or null');
    } else {
      updates.year = sanitized;
    }
  }

  for (const field of ['estimated_value', 'market_value']) {
    if (field in payload) {
      hasField = true;
      const sanitized = sanitizeNumber(payload[field], { min: 0 });
      if (sanitized === undefined) {
        errors.push(`${field} must be a positive number or null`);
      } else {
        updates[field] = sanitized;
      }
    }
  }

  if ('status' in payload) {
    hasField = true;
    if (!VALID_STATUSES.has(payload.status)) {
      errors.push(`status must be one of: ${Array.from(VALID_STATUSES).join(', ')}`);
    } else {
      updates.status = payload.status;
    }
  }

  if (!hasField) {
    errors.push('no updatable fields were provided');
  }

  return { updates, errors };
}

export function createApp(db) {
  const itemsRepository = createItemsRepository(db);
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get(
    '/items',
    asyncHandler(async (_req, res) => {
      const items = await itemsRepository.listItems();
      res.json(items);
    })
  );

  app.post(
    '/items',
    asyncHandler(async (req, res) => {
      const { data, errors } = parseCreatePayload(req.body ?? {});
      if (errors.length > 0) {
        return res.status(422).json(buildValidationError(errors));
      }
      const created = await itemsRepository.createItem(data);
      res.status(201).json(created);
    })
  );

  app.get(
    '/items/:id',
    asyncHandler(async (req, res) => {
      const id = Number.parseInt(req.params.id, 10);
      const item = await itemsRepository.getItem(id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    })
  );

  app.patch(
    '/items/:id',
    asyncHandler(async (req, res) => {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid item id' });
      }

      const { updates, errors } = parseUpdatePayload(req.body ?? {});
      if (errors.length > 0) {
        return res.status(422).json(buildValidationError(errors));
      }

      const updated = await itemsRepository.updateItem(id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(updated);
    })
  );

  app.delete(
    '/items/:id',
    asyncHandler(async (req, res) => {
      const id = Number.parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid item id' });
      }

      const deleted = await itemsRepository.deleteItem(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.status(204).send();
    })
  );

  app.get(
    '/items/:id/export',
    asyncHandler(async (req, res) => {
      const id = Number.parseInt(req.params.id, 10);
      const item = await itemsRepository.getItem(id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const exportPayload = {
        name: item.name,
        country: item.country,
        denomination: item.denomination,
        year: item.year,
        description: item.description,
        estimated_value: item.estimated_value,
        market_value: item.market_value,
        status: item.status,
        notes: item.notes
      };

      res.json(exportPayload);
    })
  );

  app.post('/recognize', (req, res) => {
    const body = req.body ?? {};
    if (!body.filename || !body.mime_type) {
      return res.status(422).json(buildValidationError(['filename and mime_type are required']));
    }
    const result = recognizeCurrency(body);
    res.json(result);
  });

  app.use((err, _req, res, _next) => {
    console.error('Unhandled error', err);
    res.status(500).json({ error: 'Unexpected server error' });
  });

  return app;
}
