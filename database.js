import { createPool } from 'mysql2';

const pool = createPool({
    host: "localhost",
    user: "root",
    password: "admin", // Update with your MySQL password
    database: "spotifyblend",
    connectionLimit: 10,
    multipleStatements: true
});

const createUserTable = `
CREATE TABLE IF NOT EXISTS User (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Firstname VARCHAR(50) NOT NULL,
  Lastname VARCHAR(50) NOT NULL,
  Username VARCHAR(50) NOT NULL UNIQUE,
  EmailID VARCHAR(100) NOT NULL UNIQUE,
  Phoneno VARCHAR(20)
);
`;

const createArtistTable = `
CREATE TABLE IF NOT EXISTS Artist (
  ArtistID INT AUTO_INCREMENT PRIMARY KEY,
  ArtistName VARCHAR(100) NOT NULL
);
`;

const createGenreTable = `
CREATE TABLE IF NOT EXISTS Genre (
  GenreID INT AUTO_INCREMENT PRIMARY KEY,
  GenreName VARCHAR(50) NOT NULL
);
`;

const createSongTable = `
CREATE TABLE IF NOT EXISTS Song (
  SongID INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(100) NOT NULL,
  ArtistID INT NOT NULL,
  GenreID INT NOT NULL,
  FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID) ON DELETE CASCADE,
  FOREIGN KEY (GenreID) REFERENCES Genre(GenreID) ON DELETE CASCADE
);
`;


const createPlaylistTable=`
CREATE TABLE IF NOT EXISTS Playlist (
  PlaylistID INT AUTO_INCREMENT PRIMARY KEY,
  PlaylistName VARCHAR(100) NOT NULL,
  Privacy ENUM('Public', 'Private') DEFAULT 'Public',
  UserArtistID INT NOT NULL,
  UserArtistType ENUM('User', 'Artist') NOT NULL,
  FOREIGN KEY (UserArtistID) REFERENCES User(UserID) ON DELETE CASCADE
  -- Note: For Artist, foreign key constraint will be handled in application logic
);
`;

const createPlaylistSongs=`
CREATE TABLE IF NOT EXISTS PlaylistSongs (
  PlaylistID INT NOT NULL,
  SongID INT NOT NULL,
  
  FOREIGN KEY (PlaylistID) REFERENCES Playlist(PlaylistID) ON DELETE CASCADE,
  FOREIGN KEY (SongID) REFERENCES Song(SongID) ON DELETE CASCADE
);
`;

const createFriendTable=`
CREATE TABLE IF NOT EXISTS Friend (
  UserID1 INT NOT NULL,
  UserID2 INT NOT NULL,
  
  PRIMARY KEY (UserID1, UserID2),
  FOREIGN KEY (UserID1) REFERENCES User(UserID) ON DELETE CASCADE,
  FOREIGN KEY (UserID2) REFERENCES User(UserID) ON DELETE CASCADE
);
`;




const tables = [
  createUserTable,
  createArtistTable,
  createGenreTable,
  createSongTable,
  createPlaylistTable,
  createFriendTable,
  createPlaylistSongs,
  
];

tables.forEach((query) => {
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created or already exists');
    }
  });
});


const insertSampleUsers = `
INSERT INTO User (Firstname, Lastname, Username, EmailID, Phoneno) VALUES
  ('John', 'Doe', 'johndoe', 'john@example.com', '1234567890'),
  ('Jane', 'Smith', 'janesmith', 'jane@example.com', '0987654321'),
  ('Alice', 'Johnson', 'alicej', 'alice@example.com', '5555555555');
`;

pool.query(insertSampleUsers, (err, results) => {
  if (err) {
    console.error('Error inserting sample users:', err);
  } else {
    console.log('Sample users inserted successfully');

    // Insert sample artists into Artist table
    const insertSampleArtists = `
    INSERT INTO Artist (ArtistName) VALUES
      ('Artist 1'),
      ('Artist 2'),
      ('Artist 3');
    `;

    pool.query(insertSampleArtists, (err, results) => {
      if (err) {
        console.error('Error inserting sample artists:', err);
      } else {
        console.log('Sample artists inserted successfully');

        // Insert sample genres into Genre table
        const insertSampleGenres = `
        INSERT INTO Genre (GenreName) VALUES
          ('Pop'),
          ('Rock'),
          ('Jazz');
        `;

        pool.query(insertSampleGenres, (err, results) => {
          if (err) {
            console.error('Error inserting sample genres:', err);
          } else {
            console.log('Sample genres inserted successfully');

            // Insert sample songs into Song table
            const insertSampleSongs = `
            INSERT INTO Song (Title, ArtistID, GenreID) VALUES
              ('Song A', 1, 1),
              ('Song B', 1, 2),
              ('Song C', 2, 1),
              ('Song D', 2, 3),
              ('Song E', 3, 2),
              ('Song F', 3, 3),
              ('Song G', 1, 1),
              ('Song H', 2, 2),
              ('Song I', 3, 3),
              ('Song J', 1, 1);
            `;

            pool.query(insertSampleSongs, (err, results) => {
              if (err) {
                console.error('Error inserting sample songs:', err);
              } else {
                console.log('Sample songs inserted successfully');

                // Insert sample playlists into Playlist table
                const insertSamplePlaylists = `
                INSERT INTO Playlist (PlaylistName, Privacy, UserArtistID, UserArtistType) VALUES
                  ('Chill Vibes', 'Public', 1, 'User'),
                  ('Workout Hits', 'Private', 2, 'User'),
                  ('Top 50', 'Public', 1, 'Artist'),
                  ('Indie Mix', 'Public', 4, 'User');
                `;

                pool.query(insertSamplePlaylists, (err, results) => {
                  if (err) {
                    console.error('Error inserting sample playlists:', err);
                  } else {
                    console.log('Sample playlists inserted successfully');

                    // Insert sample PlaylistSongs for user playlists
                    const insertSamplePlaylistSongs = `
                    INSERT INTO PlaylistSongs (PlaylistID, SongID) VALUES
                      (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
                      (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
                      (4, 1), (4, 3), (4, 5), (4, 7), (4, 9);
                    `;

                    pool.query(insertSamplePlaylistSongs, (err, results) => {
                      if (err) {
                        console.error('Error inserting sample playlist songs:', err);
                      } else {
                        console.log('Sample playlist songs inserted successfully');

                        // Insert sample blends into Blend table
                        const insertSampleBlends = `
                        INSERT INTO Blend (UserID, SongID) VALUES
                          (1, 1), (1, 2), (2, 3), (2, 4), (3, 5);
                        `;

                        

                            // Insert sample friends into Friend table
                            const insertSampleFriends = `
                            INSERT INTO Friend (UserID1, UserID2) VALUES
                              (1, 2),
                              (2, 3),
                              (1, 3);
                            `;

                            pool.query(insertSampleFriends, (err, results) => {
                              if (err) {
                                console.error('Error inserting sample friends:', err);
                              } else {
                                console.log('Sample friends inserted successfully');

                                

                                
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  
;


const insertFriendSuggestionData = `
INSERT INTO User (Firstname, Lastname, Username, EmailID, Phoneno) VALUES
  ('Alice', 'Smith', 'alice1', 'alice1@example.com', '1234567890'),
  ('Bob', 'Johnson', 'bob', 'bob@example.com', '2345678901'),
  ('Charlie', 'Williams', 'charlie', 'charlie@example.com', '3456789012'),
  ('Diana', 'Brown', 'diana', 'diana@example.com', '4567890123');
  

INSERT INTO Song (Title, ArtistID, GenreID) VALUES
  ('Pop Song 1', 1, 1),
  ('Pop Song 2', 1, 1),
  ('Rock Song 1', 2, 2),
  ('Jazz Song 1', 3, 3),
  
  
INSERT INTO Playlist (PlaylistName, UserArtistID, UserArtistType) VALUES
  ('Alice Playlist', 4, 'User'),
  ('Bob Playlist', 5, 'User'),
  ('Charlie Playlist', 6, 'User'),
  ('Diana Playlist', 7, 'User');
  
INSERT INTO PlaylistSongs (PlaylistID, SongID) VALUES
  (4, 1),
  (4, 2),
  (5, 1),
  (5, 3),
  (6, 4),
  (7, 5);
  
INSERT INTO Friend (UserID1, UserID2) VALUES
  (1, 3);
`;

pool.query(insertFriendSuggestionData, (err, results) => {
  if (err) {
    console.error('Error inserting friend suggestion sample data:', err);
  } else {
    console.log('Friend suggestion sample data inserted successfully');
  }
});
