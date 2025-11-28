# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js

## Overview

This small Express application demonstrates a simple book-store web app using EJS templates and a MySQL (mysql2) connection pool. It supports:
- Listing books from the database (`/books/list`)
- Adding a new book via a form (`/books/addbook` → POST `/books/bookadded`)
- Searching (placeholder) (`/books/search`)
- Simple user registration example (`/users/register`)

## Requirements

- Node.js (v14+ recommended)
- MySQL server accessible locally

## Setup

1. Install project dependencies:

```powershell
npm install
```

2. Create the database and tables (use the provided SQL):

```sql
-- run in MySQL client
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;
-- see `create_db.sql` for table and user creation
```

You can also run the included `create_db.sql` and `insert_test_data.sql` scripts with your MySQL client to create the schema and insert sample data.

3. Ensure the database user credentials in `index.js` match your local MySQL setup.

4. Start the app:

```powershell
node index.js
```

Visit `http://localhost:8000` in your browser.

## dotenv

To avoid hard-coding database credentials in source code the project uses the `dotenv` module. Steps to use it:

- Copy `.env.example` to `.env` and edit values (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`).
- The app loads environment variables from `.env` at startup; `index.js` uses these to configure the MySQL pool.
- Do NOT commit your `.env` file to version control — keep it out of public repositories.

This keeps secrets out of the repo and allows different credentials on the VM or production.

## Routes

- `/` — Home page (`views/index.ejs`)
- `/about` — About page (`views/about.ejs`)
- `/books/list` — List all books (`views/list.ejs`)
- `/books/addbook` — Form to add a book (`views/addbook.ejs`)
- `POST /books/bookadded` — Inserts a book and shows confirmation (`views/bookadded.ejs`)
- `/books/search` — Search form (`views/search.ejs`) (placeholder)
- `/users/register` — Register form (`views/register.ejs`)

## Audit

The application records login attempts (successful and failed) in an `audit` table so administrators can review authentication activity. Implementation details:

- `create_db.sql` includes a `CREATE TABLE audit (...)` statement to store `username`, `success` (0/1), `event_time`, `ip_address`, and a `message`.
- Login attempts are recorded by the `/users/loggedin` route (successful and failed attempts both inserted into `audit`).
- The audit history is viewable at `/users/audit` (renders `views/audit.ejs`).

To create the table and user, run the SQL in `create_db.sql` on your MySQL server (or import the file using your client).

## Validation & Sanitization

This project now includes server-side validation and input sanitization to reduce malformed input and XSS risks.

- **Registration (`/users/register`)**: `express-validator` checks are applied to ensure:
	- `email` is a valid email address (`isEmail()`),
	- `username` length is between 5 and 20 characters (`isLength()`),
	- `password` length is at least 8 characters (`isLength({ min: 8 })`).
	- The register handler also sanitizes `first`, `last`, `username`, and `email` using `express-sanitizer` before storing.

- **Login (`/users/loggedin`)**: the supplied `username` is sanitized before use in audit logging / DB queries.

- **Add book (`/books/addbook` → POST `/books/bookadded`)**:
	- `name` is required and limited to 100 characters,
	- `price` must be a positive number (`isFloat({ gt: 0 })`).
	- The book name is sanitized before insertion.

- **Search (`/books/search`)**: the search term is sanitized before use.

Notes:
- Validation failures currently re-render the form without descriptive errors; you can extend the templates to show `validationResult(req).array()` to provide user feedback.
- EJS escapes output by default when rendering with `<%= %>`. Avoid using unescaped output (`<%- %>`) for user-supplied data unless intentionally inserting safe HTML.

If you want, I can update the forms to display validation messages and show examples of the sanitized output.

## Notes and tips

- The app uses a global `db` pool (defined in `index.js`) that route modules access as `db`.
- The sample SQL uses a `books` table with columns `id`, `name`, and `price` (DECIMAL).
- If you prefer a POST-Redirect-GET pattern for the add-book flow, convert the POST handler to redirect to a GET confirmation route after inserting.
- To run automated tests or CI, set up a test database and adjust credentials before running.

If you'd like, I can also:
- Add a short script to run the SQL files automatically
- Improve the README with screenshots of the UI
- Add prettier/ESLint configuration and scripts

