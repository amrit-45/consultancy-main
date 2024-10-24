import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 8000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve())); // Serve static files
app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.set('views', path.join(process.cwd(), 'views')); // Set the views directory

// Session setup for admin panel authentication
app.use(session({
    secret: 'admin', // Change to a secure secret key
    resave: false,
    saveUninitialized: true,
}));

// In-memory data storage (use a database in production)
let applications = [];
let contacts = [];

// Store a hashed password (for initial setup, run once to generate)
// Replace 'your_secure_password' with a secure password of your choice
const hashedPassword = await bcrypt.hash('admin', 10); 

// Routes
app.get('/apply', (req, res) => {
    res.render('apply');
});

app.post('/apply', (req, res) => {
    const { name, email, message } = req.body;
    applications.push({ name, email, message });
    res.redirect('/apply'); // Redirect after submission
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    contacts.push({ name, email, message });
    res.redirect('/contact'); // Redirect after submission
});

// Admin Panel Route
app.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('admin', { applications, contacts });
});

// Login route (simple demo, replace with a secure method)
app.get('/login', (req, res) => {
    res.send(`
        <form action="/login" method="POST">
            <input type="password" name="password" placeholder="Enter password" required>
            <button type="submit">Login</button>
        </form>
    `);
});

// Secure login handler
app.post('/login', async (req, res) => {
    const { password } = req.body;
    const match = await bcrypt.compare(password, hashedPassword); // Compare hashed password

    if (match) {
        req.session.user = true; // Set session
        res.redirect('/admin');
    } else {
        res.send('Invalid password');
    }
});

// Route to serve the reviews page
app.get('/reviews', (req, res) => {
    res.render('reviews'); // Ensure this points to your 'reviews.ejs' file
});

// Route to handle review submission
app.post('/submit-review', (req, res) => {
    const { name, email, rating, review } = req.body;
    // Here, you would typically save the review to your database
    console.log({ name, email, rating, review }); // For now, we log it to the console
    res.redirect('/reviews'); // Redirect to a page to show reviews or a thank-you page
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
