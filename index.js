
import express from "express"
import bodyParser from "body-parser"
import session from "express-session"
import authRoutes from "./routes/auth.js"
import playlistsRoutes from "./routes/playlists.js"
import friendsRoutes from "./routes/friends.js"
import blendRoutes from "./routes/blend.js"

const app = express();
const port=3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Use routes
app.use('/auth', authRoutes);
app.use('/playlists', playlistsRoutes);
app.use('/friends', friendsRoutes);
app.use('/blend', blendRoutes);

// Routes for rendering views
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/create-playlist", (req, res) => {
  res.render("create-playlist.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/home", (req, res) => {
  res.render("index.ejs");
});

app.get("/my-playlists", (req,res) =>{
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login page or show message
  }
  res.render("my-playlists.ejs", { user: req.session.user });
});


app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/my-friends", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render("friends.ejs", { user: req.session.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

