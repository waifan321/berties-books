// User routes module: handles registration-related pages
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10
const { check, validationResult } = require('express-validator');


const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}


// Display the registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

// Handle registration form submission
// (Currently this example just returns a confirmation message rather than
// inserting into a database.)
router.post('/registered', [check('email').isEmail(), check('username').isLength({ min: 5, max: 20})], function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./register')
    } else {

    const plainPassword = req.body.password

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
      if (err) return next(err)

      // Store hashed password and user data in the database
      const sql = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)"
      const params = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword]

      db.query(sql, params, (err, result) => {
        if (err) return next(err)

        // Build the response including the plain and hashed password (assignment requirement)
        let resultMsg = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email
        resultMsg += ' Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
        res.send(resultMsg)
      })
    })
}}); 


// List all users (no passwords) - mounted at /users/list from index.js
router.get('/list', redirectLogin, function(req, res, next) {
  const sql = 'SELECT id, username, first_name, last_name, email FROM users'
  db.query(sql, (err, results) => {
    if (err) return next(err)
    res.render('users_list.ejs', { users: results })
  })
})
// Display the login form
router.get('/login', function(req, res, next) {
  res.render('login.ejs')
})

// Handle login form submission: compare supplied password with stored hash
router.post('/loggedin', function(req, res, next) {
  const username = req.body.username

  // Fetch the stored hashed password for this username
  const sql = 'SELECT hashedPassword, first_name, last_name, email FROM users WHERE username = ?'
  db.query(sql, [username], (err, results) => {
    if (err) return next(err)

    if (!results || results.length === 0) {
        // No such user -> record failed login and respond
        const audSql = 'INSERT INTO audit (username, success, ip_address, message) VALUES (?,?,?,?)'
        const audParams = [username || null, 0, req.ip, 'unknown username']
        db.query(audSql, audParams, (aErr) => {
          if (aErr) return next(aErr)
          return res.send('Login failed: unknown username or password.')
        })
    }

    const hashedPassword = results[0].hashedPassword

    // Compare the password supplied with the password in the database
    bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
      if (err) return next(err)
      else if (result == true) {
        // Successful login -> record audit and respond
        const audSql = 'INSERT INTO audit (username, success, ip_address, message) VALUES (?,?,?,?)'
        const audParams = [username, 1, req.ip, 'login success']
        db.query(audSql, audParams, (aErr) => {
          if (aErr) return next(aErr)
          let message = 'Hello '+ results[0].first_name + ' '+ results[0].last_name + ', you are now logged in.'
          message += ' We have your email as ' + results[0].email
          return res.send(message)
        })
      }
      else {
        // Incorrect password -> record failed login and respond
        const audSql = 'INSERT INTO audit (username, success, ip_address, message) VALUES (?,?,?,?)'
        const audParams = [username, 0, req.ip, 'incorrect password']
        db.query(audSql, audParams, (aErr) => {
          if (aErr) return next(aErr)
          return res.send('Login failed: incorrect username or password.')
        })
      }
    })
  })
})

// Audit history view (shows successful and failed login attempts)
router.get('/audit', function(req, res, next) {
  const sql = 'SELECT id, username, success, event_time, ip_address, message FROM audit ORDER BY event_time DESC'
  db.query(sql, (err, results) => {
    if (err) return next(err)
    res.render('audit.ejs', { audits: results })
  })
})
// Export the router object so `index.js` can mount it
module.exports = router
