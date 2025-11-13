// Book routes module: handles book searching, listing and adding
const express = require("express")
const router = express.Router()

// Render the search form for books
router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

// Handle search results (example placeholder).
// In a fuller implementation this would query the DB for matching books.
router.get('/search-result', function (req, res, next) {
    res.send("You searched for: " + req.query.keyword)
});

// Show a list of all available books from the database
router.get('/list', function(req, res, next) {
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
