-- Extra data for the customer parity checks, for the test customer of auth.sql (load after auth.sql and products.sql):
-- a known access token, one saved delivery address and one shopping list with a product.
UPDATE Customer SET accessToken = 'parity-access-token', resettoken = NULL WHERE customer_id = 'bbbbbbbb-0000-4000-8000-000000000001';

DELETE FROM Order_Information WHERE customer_id = 'bbbbbbbb-0000-4000-8000-000000000001';
INSERT INTO Order_Information (order_information_id, customer_id, first_name, surname, street, house_number, city, zipcode, createdAt, updatedAt)
VALUES ('eeeeeeee-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001', 'Parity', 'Customer', 'Teststraat', '1', 'Testdorp', '1234AB', NOW(), NOW());

DELETE FROM ShoppingList_has_Products WHERE shopping_list_id = 'dddddddd-0000-4000-8000-000000000001';
DELETE FROM ShoppingList WHERE shopping_list_id = 'dddddddd-0000-4000-8000-000000000001';
INSERT INTO ShoppingList (shopping_list_id, customer_id, createdAt, updatedAt)
VALUES ('dddddddd-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001', NOW(), NOW());
INSERT INTO ShoppingList_has_Products (list_product_id, shopping_list_id, product_id, amount)
VALUES (900001, 'dddddddd-0000-4000-8000-000000000001', (SELECT product_id FROM Product WHERE ean = '10010' LIMIT 1), 2);
