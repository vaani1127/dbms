import { createPool } from 'mysql2/promise';

const pool = createPool({
    host: "localhost",
    user: "root",
    password: "admin", // Update with your MySQL password
    database: "spotifyblend",
    connectionLimit: 10
});

/**
 * Fetches playlists for a given user ID.
 * @param {number} userId
 * @returns {Promise<Array>} Array of playlist objects.
 */
export async function getPlaylistsByUserId(userId) {
    const query = 'SELECT PlaylistID, PlaylistName, Privacy, UserArtistType FROM Playlist WHERE UserArtistID = ? AND UserArtistType = "User"';
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

/**
 * Inserts a new playlist for a user.
 * @param {string} playlistName
 * @param {number} userId
 * @returns {Promise<number>} The inserted playlist ID.
 */
export async function insertPlaylist(playlistName, userId) {
    if (playlistName === undefined || userId === undefined) {
        throw new Error("playlistName or userId is undefined");
    }
    const query = 'INSERT INTO Playlist (PlaylistName, Privacy, UserArtistID, UserArtistType) VALUES (?, "Public", ?, "User")';
    const [result] = await pool.execute(query, [playlistName, userId]);
    return result.insertId;
}

/**
 * Adds a song to a playlist.
 * @param {number} playlistId
 * @param {number} songId
 * @returns {Promise<void>}
 */
export async function addSongToPlaylist(playlistId, songId) {
    const query = 'INSERT INTO PlaylistSongs (PlaylistID, SongID) VALUES (?, ?)';
    await pool.execute(query, [playlistId, songId]);
}

/**
 * Fetches songs for a given playlist ID.
 * @param {number} playlistId
 * @returns {Promise<Array>} Array of song objects.
 */
export async function getSongsByPlaylistId(playlistId) {
    const query = `
        SELECT s.SongID, s.Title, s.ArtistID, s.GenreID
        FROM Song s
        JOIN PlaylistSongs ps ON s.SongID = ps.SongID
        WHERE ps.PlaylistID = ?
    `;
    const [rows] = await pool.execute(query, [playlistId]);
    return rows;
}

/**
 * Fetches songs not in the given playlist ID.
 * @param {number} playlistId
 * @returns {Promise<Array>} Array of song objects not in the playlist.
 */
export async function getSongsNotInPlaylist(playlistId) {
    const query = `
        SELECT s.SongID, s.Title, s.ArtistID, s.GenreID
        FROM Song s
        WHERE s.SongID NOT IN (
            SELECT SongID FROM PlaylistSongs WHERE PlaylistID = ?
        )
    `;
    const [rows] = await pool.execute(query, [playlistId]);
    return rows;
}

/**
 * Fetches common songs between two users based on their playlists.
 * @param {number} userId1
 * @param {number} userId2
 * @returns {Promise<Array>} Array of common song objects.
 */
export async function getCommonSongsBetweenUsers(userId1, userId2) {
    const query = `
        SELECT DISTINCT s.SongID, s.Title, s.ArtistID, s.GenreID
        FROM Song s
        JOIN PlaylistSongs ps ON s.SongID = ps.SongID
        JOIN Playlist p ON ps.PlaylistID = p.PlaylistID
        WHERE p.UserArtistType = 'User' AND (
            p.UserArtistID = ? OR p.UserArtistID = ?
        )
        GROUP BY s.SongID, s.Title, s.ArtistID, s.GenreID
        HAVING COUNT(DISTINCT p.UserArtistID) = 2
    `;
    const [rows] = await pool.execute(query, [userId1, userId2]);
    return rows;
}
