// Main route module: handles top-level pages like home and about
const express = require("express")
const router = express.Router()

// Home page route - renders `views/index.ejs`
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

// About page route - renders `views/about.ejs`
router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

// POST handler used to insert a new book record into the database.
// Note: this route duplicates similar functionality in `routes/books.js`.
// It receives `name` and `price` from a submitted form and inserts them.
router.post('/bookadded', function (req, res, next) {
    // preparing SQL to insert a new book
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // parameters come from the form body
    let newrecord = [req.body.name, req.body.price]
    // execute SQL query using the global `db` pool
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            // forward DB errors to Express error handler
            next(err)
        }
        else
            // simple text response confirming the insert
            res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price)
    })
}) 


// Export the router object so `index.js` can mount it
module.exports = router