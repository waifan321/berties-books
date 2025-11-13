-- insert_test_data.sql - Insert sample books into `berties_books` database

USE berties_books;

INSERT INTO books (name, price) VALUES
	('Brighton Rock', 20.25),
	('Brave New World', 25.00),
	('Animal Farm', 12.99);