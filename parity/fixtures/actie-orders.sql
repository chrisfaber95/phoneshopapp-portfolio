-- One actie order of the test customer of auth.sql with one line (load after auth.sql)
DELETE FROM Actie_Order_has_Product WHERE actie_order_id = 'ffffffff-0000-4000-8000-0000000000a1';
DELETE FROM Actie_Order WHERE actie_order_id = 'ffffffff-0000-4000-8000-0000000000a1';
DELETE FROM Order_Information WHERE order_information_id = 'eeeeeeee-0000-4000-8000-0000000000a1';
INSERT INTO Order_Information (order_information_id, customer_id, first_name, surname, customerEmail, street, house_number, city, zipcode, createdAt, updatedAt)
VALUES ('eeeeeeee-0000-4000-8000-0000000000a1', 'bbbbbbbb-0000-4000-8000-000000000001', 'Parity', 'Actie', 'parity-actie@example.invalid', 'Teststraat', '2', 'Testdorp', '1234AB', NOW(), NOW());
INSERT INTO Actie_Order (actie_order_id, order_date, pickup_date, status, pickup_time, paycode, delivery, delivery_cost, createdAt, updatedAt, order_information_id)
VALUES ('ffffffff-0000-4000-8000-0000000000a1', '2030-01-01 10:00:00', '2030-01-02', 'parity-test', '10:30:00', 'afhaal-parity', 0, 0, NOW(), NOW(), 'eeeeeeee-0000-4000-8000-0000000000a1');
INSERT INTO Actie_Order_has_Product (amount, price, stamps_cost, actie_order_id, product_id)
VALUES (2, 1.56, 2, 'ffffffff-0000-4000-8000-0000000000a1', 28903);
