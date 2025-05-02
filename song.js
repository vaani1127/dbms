import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: "localhost",
    user: "root",
    password: "admin", // Update with your MySQL password
    database: "spotifyblend",
    connectionLimit: 10
});

/**
 * Fetches all songs from the Song table.
 * @returns {Promise<Array>} Array of song objects.
 */
export async function getAllSongs() {
    const query = 'SELECT SongID, Title FROM Song';
    const [rows] = await pool.execute(query);
    return rows;
}
