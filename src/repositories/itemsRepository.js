const SORT_DESC = (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id;

function mapItem(raw) {
  if (!raw) {
    return null;
  }
  return {
    id: raw.id,
    name: raw.name,
    country: raw.country,
    denomination: raw.denomination,
    year: raw.year ?? null,
    catalog_reference: raw.catalog_reference ?? null,
    description: raw.description ?? null,
    estimated_value: raw.estimated_value ?? null,
    market_value: raw.market_value ?? null,
    status: raw.status,
    notes: raw.notes ?? null,
    image_path: raw.image_path ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at
  };
}

export function createItemsRepository(db) {
  async function listItems() {
    await db.read();
    return (db.data.items ?? []).slice().sort(SORT_DESC).map(mapItem);
  }

  async function getItem(id) {
    await db.read();
    const item = (db.data.items ?? []).find((entry) => entry.id === id);
    return mapItem(item);
  }

  async function createItem(data) {
    await db.read();
    db.data.items ??= [];
    db.data.nextId = typeof db.data.nextId === 'number' ? db.data.nextId : 1;

    const now = new Date().toISOString();
    const item = {
      id: db.data.nextId++,
      name: data.name,
      country: data.country,
      denomination: data.denomination,
      year: data.year ?? null,
      catalog_reference: data.catalog_reference ?? null,
      description: data.description ?? null,
      estimated_value: data.estimated_value ?? null,
      market_value: data.market_value ?? null,
      status: data.status ?? 'owned',
      notes: data.notes ?? null,
      image_path: data.image_path ?? null,
      created_at: now,
      updated_at: now
    };

    db.data.items.push(item);
    await db.write();
    return mapItem(item);
  }

  async function updateItem(id, updates) {
    await db.read();
    const items = db.data.items ?? [];
    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return null;
    }

    const current = items[index];
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };

    items[index] = updated;
    await db.write();
    return mapItem(updated);
  }

  async function deleteItem(id) {
    await db.read();
    const items = db.data.items ?? [];
    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return false;
    }
    items.splice(index, 1);
    await db.write();
    return true;
  }

  return {
    listItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
  };
}
