// Application entry point for Bertie's Books web app
// Import framework and database modules
var express = require ('express')
var ejs = require('ejs')
var mysql = require('mysql2');
const path = require('path')

// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Define the database connection pool using mysql2's connection pooling.
// The pool allows the app to reuse connections and handle concurrent requests.
const db = mysql.createPool({
    host: 'localhost',
    user: 'berties_books_app',
    password: 'qwertyuiop',
    database: 'berties_books',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// Expose the pool as a global so route modules can access it via `db`.
global.db = db;

// Parse URL-encoded request bodies (forms)
app.use(express.urlencoded({ extended: true }))

// Serve static assets from the `public` folder (CSS, client JS, images)
app.use(express.static(path.join(__dirname, 'public')))

// Application-wide data available in EJS views via `shopData`
app.locals.shopData = {shopName: "Bertie's Books"}

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)

// Start the web server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))