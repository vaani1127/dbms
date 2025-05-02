import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: "localhost",
    user: "root",
    password: "admin", // Update with your MySQL password
    database: "spotifyblend",
    connectionLimit: 10
});

/**
 * Fetches user data from the User table by username.
 * @param {string} username
 * @returns {Promise<object|null>} User data object or null if not found.
 */
export async function getUserData(username) {
    const query = 'SELECT UserID, Firstname, Lastname, Username, EmailID, Phoneno FROM User WHERE Username = ?';
    const [rows] = await pool.execute(query, [username]);
    if (rows.length === 0) {
        return null;
    }
    return rows[0];
}

/**
 * Fetches friends for a given user ID.
 * @param {number} userId
 * @returns {Promise<Array>} Array of friend user objects.
 */
export async function getFriendsByUserId(userId) {
    const query = `
        SELECT u.UserID, u.Firstname, u.Lastname, u.Username, u.EmailID
        FROM User u
        JOIN Friend f ON (u.UserID = f.UserID1 OR u.UserID = f.UserID2)
        WHERE (f.UserID1 = ? OR f.UserID2 = ?) AND u.UserID != ?
    `;
    const [rows] = await pool.execute(query, [userId, userId, userId]);
    return rows;
}

/**
 * Fetches UserID by username.
 * @param {string} username
 * @returns {Promise<number|null>} UserID or null if not found.
 */
export async function getUserIdByUsername(username) {
    const query = 'SELECT UserID FROM User WHERE Username = ?';
    const [rows] = await pool.execute(query, [username]);
    if (rows.length === 0) {
        return null;
    }
    return rows[0].UserID;
}

/**
 * Fetches friend suggestions for a user based on similar genres in playlists.
 * Excludes current friends and the user themselves.
 * @param {number} userId
 * @returns {Promise<Array>} Array of suggested user objects.
 */
export async function getFriendSuggestionsByGenre(userId) {
    const query = `
        SELECT DISTINCT u.UserID, u.Firstname, u.Lastname, u.Username, u.EmailID
FROM User u
JOIN Playlist p ON u.UserID = p.UserArtistID AND p.UserArtistType = 'User'
JOIN PlaylistSongs ps ON p.PlaylistID = ps.PlaylistID
JOIN Song s ON ps.SongID = s.SongID
WHERE s.GenreID IN (
    -- Genres liked by Alice1
    SELECT DISTINCT s2.GenreID
    FROM Playlist p2
    JOIN PlaylistSongs ps2 ON p2.PlaylistID = ps2.PlaylistID
    JOIN Song s2 ON ps2.SongID = s2.SongID
    WHERE p2.UserArtistID = ? AND p2.UserArtistType = 'User'
)
AND u.UserID != ? -- Exclude herself (Alice1)
AND u.UserID NOT IN (
    -- Exclude existing friends of Alice1
    SELECT CASE
        WHEN f.UserID1 = ? THEN f.UserID2
        ELSE f.UserID1
    END AS FriendID
    FROM Friend f
    WHERE f.UserID1 = ? OR f.UserID2 = ?
)

    `;
    const [rows] = await pool.execute(query, [userId, userId, userId, userId, userId]);
    return rows;
}

/**
 * Adds a friend relationship between two users.
 * @param {number} userId1
 * @param {number} userId2
 * @returns {Promise<void>}
 */
export async function addFriend(userId1, userId2) {
    const query = `
        INSERT INTO Friend (UserID1, UserID2)
        VALUES (?, ?)
    `;
    await pool.execute(query, [userId1, userId2]);
}




