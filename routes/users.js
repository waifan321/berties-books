// User routes module: handles registration-related pages
const express = require("express")
const router = express.Router()

// Display the registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

// Handle registration form submission
// (Currently this example just returns a confirmation message rather than
// inserting into a database.)
router.post('/registered', function (req, res, next) {
    res.send(' Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email);
}); 

// Export the router object so `index.js` can mount it
module.exports = router
