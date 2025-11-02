const TABLE = 'currency_items';

const COLUMNS = [
  'name',
  'country',
  'denomination',
  'year',
  'catalog_reference',
  'description',
  'estimated_value',
  'market_value',
  'status',
  'notes',
  'image_path',
  'created_at',
  'updated_at'
];

function mapRow(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    denomination: row.denomination,
    year: row.year === null ? null : Number(row.year),
    catalog_reference: row.catalog_reference ?? null,
    description: row.description ?? null,
    estimated_value: row.estimated_value === null ? null : Number(row.estimated_value),
    market_value: row.market_value === null ? null : Number(row.market_value),
    status: row.status,
    notes: row.notes ?? null,
    image_path: row.image_path ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export function createItemsRepository(db) {
  const insertStatement = db.prepare(`
    INSERT INTO ${TABLE} (${COLUMNS.join(', ')})
    VALUES (${COLUMNS.map((col) => `@${col}`).join(', ')})
  `);

  const getStatement = db.prepare(`SELECT * FROM ${TABLE} WHERE id = ?`);
  const listStatement = db.prepare(`SELECT * FROM ${TABLE} ORDER BY created_at DESC, id DESC`);
  const deleteStatement = db.prepare(`DELETE FROM ${TABLE} WHERE id = ?`);

  function listItems() {
    return listStatement.all().map(mapRow);
  }

  function getItem(id) {
    return mapRow(getStatement.get(id));
  }

  function createItem(data) {
    const now = new Date().toISOString();
    const payload = {
      ...Object.fromEntries(COLUMNS.map((column) => [column, null])),
      ...data,
      created_at: now,
      updated_at: now
    };
    const result = insertStatement.run(payload);
    return getItem(result.lastInsertRowid);
  }

  function updateItem(id, updates) {
    if (!updates || Object.keys(updates).length === 0) {
      return getItem(id);
    }

    const setFragments = [];
    const params = { id, updated_at: new Date().toISOString() };

    for (const [key, value] of Object.entries(updates)) {
      setFragments.push(`${key} = @${key}`);
      params[key] = value;
    }
    setFragments.push('updated_at = @updated_at');

    const updateStatement = db.prepare(`
      UPDATE ${TABLE}
      SET ${setFragments.join(', ')}
      WHERE id = @id
    `);

    const result = updateStatement.run(params);
    if (result.changes === 0) {
      return null;
    }

    return getItem(id);
  }

  function deleteItem(id) {
    const result = deleteStatement.run(id);
    return result.changes > 0;
  }

  return {
    listItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
  };
}
