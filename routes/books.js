// Book routes module: handles book searching, listing and adding
const express = require("express")
const router = express.Router()

// Middleware to require a logged-in session for protected routes
const redirectLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/users/login')
    }
    next()
}

// Render the search form for books
router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

// Handle search results.
// Basic behaviour: exact match on the `name` column (default).
// Advanced behaviour: if `advanced=1` is provided in the query string,
//                  perform a partial match using SQL LIKE.
router.get('/search-result', function (req, res, next) {
    const term = req.query.search_text;
    if (!term) {
        // No search term provided - render an empty results page
        return res.render('search_result.ejs', { availableBooks: [], term: '' })
    }

    let sqlquery, params;
    if (req.query.advanced === '1') {
        // advanced partial search
        sqlquery = 'SELECT * FROM books WHERE name LIKE ?'
        params = ['%' + term + '%']
    } else {
        // basic exact search
        sqlquery = 'SELECT * FROM books WHERE name = ?'
        params = [term]
    }

    db.query(sqlquery, params, (err, result) => {
        if (err) return next(err)
        res.render('search_result.ejs', { availableBooks: result, term: term })
    })
});

// Show a list of all available books from the database
router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query using the global db pool
    db.query(sqlquery, (err, result) => {
        if (err) {
            // forward DB errors to the central error handler
            next(err)
        }
        // render the `list.ejs` template with the result rows
        res.render("list.ejs", {availableBooks:result})
    });
});

// Bargain books: list books priced less than £20
router.get('/bargainbooks', function(req, res, next) {
    const sql = 'SELECT * FROM books WHERE price < 20'
    db.query(sql, (err, result) => {
        if (err) return next(err)
        res.render('list.ejs', { availableBooks: result })
    })
});

// Display form to add a new book
router.get('/addbook', function(req, res, next) {
    res.render('addbook.ejs')
});

// Handle form submission - save book and show confirmation
router.post('/bookadded', function (req, res, next) {
    // Prepare SQL to insert the new book record
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // Parameters come from the submitted form
    let newrecord = [req.body.name, req.body.price]
    // Execute SQL using the global db pool
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            // forward errors to Express error handling middleware
            next(err)
        }
        else
            // render a confirmation page showing the saved values
            res.render('bookadded.ejs', {name: req.body.name, price: req.body.price})
    })
})

// Export the router object so index.js can access it
module.exports = router
