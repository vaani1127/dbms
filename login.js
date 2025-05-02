import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: "localhost",
    user: "root",
    password: "admin", // Update with your MySQL password
    database: "spotifyblend",
    connectionLimit: 10
});

/**
 * Verifies user login credentials against the User table.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<object|null>} Returns user object if valid, else null.
 */
export async function verifyUserLogin(username, password) {
    // Query to get the stored password for the given username
    const query = 'SELECT Phoneno FROM User WHERE Username = ?';
    const [rows] = await pool.execute(query, [username]);
    if (rows.length === 0) {
        return null;
    }
    const storedPassword = rows[0].Phoneno; // Assuming Phoneno is used as password for demo
    if (password === storedPassword) {
        return { username };
    }
    return null;
}

/**
 * Inserts a new user into the User table.
 * @param {object} userDetails - Object containing Firstname, Lastname, Username, EmailID, Phoneno
 * @returns {Promise<void>}
 */
export async function insertUser(userDetails) {
    const { Firstname, Lastname, Username, EmailID, Phoneno } = userDetails;
    const query = `
        INSERT INTO User (Firstname, Lastname, Username, EmailID, Phoneno)
        VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(query, [Firstname, Lastname, Username, EmailID, Phoneno]);
}
