-- One favorite product for the test customer of auth.sql, so the "favorites" variants of the product and discount lists have data.
DELETE FROM Customer_has_Favorite WHERE customer_id = 'bbbbbbbb-0000-4000-8000-000000000001';
INSERT INTO Customer_has_Favorite (customer_has_favorite_id, customer_id, product_id)
VALUES (900001, 'bbbbbbbb-0000-4000-8000-000000000001', (SELECT product_id FROM Product WHERE ean = '10010' LIMIT 1));
