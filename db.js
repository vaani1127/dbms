import mysql from 'mysql2/promise';

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',       // Update with your MySQL host
  user: 'root',            // Update with your MySQL user
  password: 'admin',            // Update with your MySQL password
  database: 'spotifyblend',// Update with your MySQL database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to execute a query with parameters
export async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Export pool for transactions if needed
export { pool };
