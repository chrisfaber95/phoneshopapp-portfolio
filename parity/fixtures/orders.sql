-- One order of the test customer of auth.sql with one product line (load after auth.sql, products.sql and customers.sql)
DELETE FROM Order_has_Product WHERE order_id IN (SELECT order_id FROM `Order` WHERE uuid_id = 'ffffffff-0000-4000-8000-000000000001');
DELETE FROM `Order` WHERE uuid_id = 'ffffffff-0000-4000-8000-000000000001';
INSERT INTO `Order` (uuid_id, delivery, totalPrice, paymentMethod, orderDate, pickupDate, status, pickupTime, invoice_number, createdAt, updatedAt, customer_id, order_information_id)
VALUES ('ffffffff-0000-4000-8000-000000000001', 0, 4.50, 'ideal', '2030-01-01 10:00:00', '2030-01-02', 'parity-test', '10:30:00', 'PARITY-1', NOW(), NOW(),
        'bbbbbbbb-0000-4000-8000-000000000001', 'eeeeeeee-0000-4000-8000-000000000001');
INSERT INTO Order_has_Product (amount, order_id, product_id, price, picked, normal_total_price)
VALUES (2, (SELECT order_id FROM `Order` WHERE uuid_id = 'ffffffff-0000-4000-8000-000000000001'), (SELECT product_id FROM Product WHERE ean = '10010' LIMIT 1), 2.25, 0, 4.50);
