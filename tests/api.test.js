import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/db.js';

describe('CoinTracker API (Node.js)', () => {
  let db;
  let app;

  beforeAll(() => {
    db = createDatabase(':memory:');
    app = createApp(db);
  });

  beforeEach(() => {
    db.exec('DELETE FROM currency_items;');
  });

  afterAll(() => {
    db.close();
  });

  it('responds to the health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('supports the full CRUD lifecycle', async () => {
    const createPayload = {
      name: '1957 Italian 100 Lire',
      country: 'Italy',
      denomination: '100 Lire',
      year: 1957,
      catalog_reference: 'KM#96',
      description: 'Aluminium-bronze coin featuring Minerva',
      estimated_value: 12.5,
      market_value: 14.0,
      status: 'owned',
      notes: 'Gift from grandfather'
    };

    const createResponse = await request(app).post('/items').send(createPayload);
    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      id: expect.any(Number),
      ...createPayload
    });

    const { id } = createResponse.body;

    const listResponse = await request(app).get('/items');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].id).toBe(id);

    const getResponse = await request(app).get(`/items/${id}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.name).toBe(createPayload.name);

    const updateResponse = await request(app)
      .patch(`/items/${id}`)
      .send({ status: 'sold', market_value: 22.5 });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe('sold');
    expect(updateResponse.body.market_value).toBe(22.5);

    const exportResponse = await request(app).get(`/items/${id}/export`);
    expect(exportResponse.status).toBe(200);
    expect(exportResponse.body).toMatchObject({
      name: createPayload.name,
      country: createPayload.country,
      status: 'sold'
    });

    const deleteResponse = await request(app).delete(`/items/${id}`);
    expect(deleteResponse.status).toBe(204);

    const missingResponse = await request(app).get(`/items/${id}`);
    expect(missingResponse.status).toBe(404);
  });

  it('returns deterministic recognition suggestions', async () => {
    const payload = { filename: 'italy_1957.jpg', mime_type: 'image/jpeg' };
    const first = await request(app).post('/recognize').send(payload);
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({
      probable_match: expect.any(String),
      confidence: expect.any(Number)
    });

    const second = await request(app).post('/recognize').send(payload);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });
});
