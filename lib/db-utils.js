// db-util.js

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function insertOrderBookUpdate(update) {
  const query = `
    INSERT INTO order_book_updates (time, symbol, side, price, quantity, first_update_id, last_update_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT DO NOTHING;  -- optional
  `;
  const values = [
    update.time,
    update.symbol,
    update.side,
    update.price,
    update.quantity,
    update.firstUpdateId,
    update.lastUpdateId,
  ];

  await pool.query(query, values);
}

export async function insertSnapshot(snapshot) {
  const query = `
    INSERT INTO order_book_snapshots (time, symbol, last_update_id, bids, asks)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT DO NOTHING;
  `;
  const values = [
    snapshot.time,
    snapshot.symbol,
    snapshot.lastUpdateId,
    JSON.stringify(snapshot.bids),
    JSON.stringify(snapshot.asks),
  ];

  await pool.query(query, values);
}

export async function getRecentUpdates(symbol, limit = 100) {
  const query = `
    SELECT * FROM order_book_updates
    WHERE symbol = $1
    ORDER BY time DESC
    LIMIT $2;
  `;
  const { rows } = await pool.query(query, [symbol, limit]);
  return rows;
}

export async function getOpenOrders(userId) {
  const query = `
    SELECT * FROM "openorders"
    WHERE user_id = $1
    ORDER BY trade_time DESC;
  `;

  try {
    const { rows } = await pool.query(query, [userId]);  
    return rows;
  } catch (error) {
    console.error("Error fetching open orders:", error);
    throw new Error("Failed to fetch open orders");
  }
}

export async function getOrderHistory(userId) {
  const query = `
    SELECT * FROM "orderhistory"
    WHERE user_id = $1
    ORDER BY trade_time DESC;
  `;

  try {
    const { rows } = await pool.query(query, [userId]);  
    return rows; 
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw new Error("Failed to fetch order history");
  }
}


export async function getFunds(userId) {
  const query = `
    SELECT * FROM "wallets"
    WHERE user_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [userId]);  
    return rows; 
  } catch (error) {
    console.error("Error fetching funds:", error);
    throw new Error("Failed to fetch funds");
  }
}