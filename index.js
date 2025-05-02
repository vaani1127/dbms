import express from "express"
import bodyParser from "body-parser"
import session from "express-session";
import { verifyUserLogin, insertUser } from "./login.js";
import { getUserData, getUserIdByUsername, getFriendsByUserId } from "./profile.js";
import { getPlaylistsByUserId, insertPlaylist, addSongToPlaylist, getSongsByPlaylistId, getSongsNotInPlaylist } from "./playlist.js";
import { getAllSongs } from "./song.js";

const app = express();
const port=3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.set('view engine', 'ejs');

// Middleware to make user info available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/create-playlist", async function(req, res) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const playlistId = req.query.playlistId;
    try {
        if (playlistId) {
            // Fetch songs not in the playlist
            const songs = await getSongsNotInPlaylist(playlistId);
            res.render("create-playlist.ejs", { user: req.session.user, playlistCreated: true, playlistId, songs });
        } else {
            // No playlistId, show create playlist form
            res.render("create-playlist.ejs", { user: req.session.user, playlistCreated: false });
        }
    } catch (error) {
        console.error("Error fetching songs for create playlist:", error);
        res.render("create-playlist.ejs", { user: req.session.user, playlistCreated: false, error: "Failed to load songs." });
    }
});

// New route to handle playlist creation form submission
app.post("/create-playlist", async (req, res) => {
    console.log("POST /create-playlist called");
    if (!req.session.user) {
        console.log("User not logged in");
        return res.redirect("/login");
    }
    const { name } = req.body;
    console.log("Playlist name received:", name);
    try {
        // Get userId from username
        const userId = await getUserIdByUsername(req.session.user.username);
        if (!userId) {
            throw new Error("User ID not found for username: " + req.session.user.username);
        }
        // Insert playlist and get its ID
        const playlistId = await insertPlaylist(name, userId);
        console.log("Playlist inserted with ID:", playlistId);
        // Fetch all songs to display
        const songs = await getAllSongs();
        console.log("Fetched songs count:", songs.length);
        res.render("create-playlist.ejs", { user: req.session.user, playlistCreated: true, playlistId, songs });
    } catch (error) {
        console.error("Error creating playlist:", error);
        res.render("create-playlist.ejs", { user: req.session.user, playlistCreated: false, error: "Failed to create playlist." });
    }
});

// New route to add song to playlist
app.post("/playlist/:playlistId/add-song", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const playlistId = parseInt(req.params.playlistId, 10);
    let songId;
    if (req.body) {
        if (typeof req.body === 'object' && 'songId' in req.body) {
            songId = req.body.songId;
        } else {
            songId = undefined;
        }
    }
    console.log("Adding song to playlist:", { playlistId, songId });
    if (!songId) {
        return res.status(400).json({ error: "Missing songId in request body" });
    }
    try {
        await addSongToPlaylist(playlistId, songId);
        res.status(200).json({ message: "Song added to playlist" });
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        res.status(500).json({ error: "Failed to add song to playlist" });
    }
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/home", (req, res) => {
    res.render("index.ejs");
});

// Protect /my-playlists route
app.get("/my-playlists", async (req,res) =>{
    if (!req.session.user) {
        return res.render("my-playlist.ejs", { error: "Please login first to view your playlists.", playlists: [] });
    }
    try {
        const userId = await getUserIdByUsername(req.session.user.username);
        if (!userId) {
            throw new Error("User ID not found for username: " + req.session.user.username);
        }
        const playlists = await getPlaylistsByUserId(userId);
        res.render("my-playlist.ejs", { user: req.session.user, playlists, error: null });
    } catch (error) {
        console.error("Error fetching playlists:", error);
        res.render("my-playlist.ejs", { user: req.session.user, playlists: [], error: "An error occurred while fetching playlists." });
    }
});

app.get("/playlist/:playlistId/songs", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const playlistId = parseInt(req.params.playlistId, 10);
    console.log("Fetching songs for playlist ID:", playlistId);
    try {
        const songs = await getSongsByPlaylistId(playlistId);
        console.log("Fetched songs:", songs);
        res.json({ songs });
    } catch (error) {
        console.error("Error fetching songs for playlist:", error);
        res.status(500).json({ error: "Failed to fetch songs for playlist" });
    }
});

import { getCommonSongsBetweenUsers } from "./playlist.js";

// Protect /friends route
app.get("/friends", async (req, res) => {
    if (!req.session.user) {
        return res.render("friends.ejs", { user: null, friends: [], error: "Please login first to view your friends." });
    }
    try {
        const userId = await getUserIdByUsername(req.session.user.username);
        if (!userId) {
            throw new Error("User ID not found for username: " + req.session.user.username);
        }
        const friends = await getFriendsByUserId(userId);
    res.render("friends.ejs", { user: req.session.user, friends, error: null });
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.render("friends.ejs", { user: req.session.user, friends: [], error: "An error occurred while fetching friends." });
    }
});

// New route to get friend suggestions based on similar genres
app.get("/friend-suggestions", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const userId = await getUserIdByUsername(req.session.user.username);
        if (!userId) {
            return res.status(400).json({ error: "User ID not found" });
        }
        const suggestions = await getFriendSuggestionsByGenre(userId);
        res.json({ suggestions });
    } catch (error) {
        console.error("Error fetching friend suggestions:", error);
        res.status(500).json({ error: "Failed to fetch friend suggestions" });
    }
});

// New route to add a friend
app.post("/add-friend", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { friendId } = req.body;
    if (!friendId) {
        return res.status(400).json({ error: "Missing friendId in request body" });
    }
    try {
        const userId = await getUserIdByUsername(req.session.user.username);
        if (!userId) {
            return res.status(400).json({ error: "User ID not found" });
        }
        await addFriend(userId, friendId);
        res.json({ message: "Friend added successfully" });
    } catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).json({ error: "Failed to add friend" });
    }
});

import { getFriendSuggestionsByGenre, addFriend } from "./profile.js";

// New route to get common songs between logged-in user and a friend
app.get("/friends/:friendId/common-songs", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const friendId = parseInt(req.params.friendId, 10);
    try {
        const userId = await getUserIdByUsername(req.session.user.username);
        if (!userId) {
            return res.status(400).json({ error: "User ID not found" });
        }
        const commonSongs = await getCommonSongsBetweenUsers(userId, friendId);
        res.json({ songs: commonSongs });
    } catch (error) {
        console.error("Error fetching common songs:", error);
        res.status(500).json({ error: "Failed to fetch common songs" });
    }
});

// New route to render login page
app.get("/login", (req, res) => {
    res.render("login.ejs", { error: null, errorType: null, prefillUsername: '' });
});


// New route to handle login form submission
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if username exists
        const userExists = await getUserIdByUsername(username);
        if (!userExists) {
            // Redirect to signup with username prefilled
            return res.render("login.ejs", { error: "Username not found. Please sign up.", errorType: "signup", prefillUsername: username });
        }
        const user = await verifyUserLogin(username, password);
        if (user) {
            req.session.user = user; // Save user info in session
            res.redirect("/home");
        } else {
            res.render("login.ejs", { error: "Incorrect password.", errorType: "login" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.render("login.ejs", { error: "An error occurred during login", errorType: "login" });
    }
});

// New route to handle signup form submission
app.post("/signup", async (req, res) => {
    const { Firstname, Lastname, Username, EmailID, Phoneno } = req.body;
    try {
        // Check if username already exists
        const userExists = await getUserIdByUsername(Username);
        if (userExists) {
            return res.render("login.ejs", { error: "Username already exists. Please choose another.", errorType: "signup" });
        }
        // Insert new user
        await insertUser({ Firstname, Lastname, Username, EmailID, Phoneno });
        // Redirect to login page with success message
        res.render("login.ejs", { error: "Signup successful. Please login.", errorType: "login" });
    } catch (error) {
        console.error("Signup error:", error);
        res.render("login.ejs", { error: "An error occurred during signup.", errorType: "signup" });
    }
});

// New route to render profile page
app.get("/profile", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    try {
        const userData = await getUserData(req.session.user.username);
        if (!userData) {
            return res.send("User data not found.");
        }
        res.render("profile.ejs", { user: userData });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.send("An error occurred while fetching profile data.");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
