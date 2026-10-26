-- Test accounts for the login parity checks (password for both: parity-pass; the employee card: tag PARITYNFC01, serial PARITYSER01). Load with parity/fixtures/load.ps1, it is
-- removed again by auth-cleanup.sql. Only ever for the disposable *_test database.
DELETE FROM Customer_Information WHERE customer_id = 'bbbbbbbb-0000-4000-8000-000000000001';
DELETE FROM Customer_Settings WHERE customer_id = 'bbbbbbbb-0000-4000-8000-000000000001';
DELETE FROM Customer WHERE customer_id = 'bbbbbbbb-0000-4000-8000-000000000001';
DELETE FROM User WHERE user_id = 'aaaaaaaa-0000-4000-8000-000000000001';

INSERT INTO User (user_id, name, email, cardnumber, password, nfc_token, nfc_serial, role_id, createdAt, updatedAt)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001', 'Parity Employee', 'parity-employee@example.invalid', 'PARITY0001', '$2b$10$ZiocO8SUJjTb8qSYuJUnc.xl45QwQAtG00AtwGtZFRwxgLV6gGtTu',
        'PARITYNFC01', 'PARITYSER01', (SELECT role_id FROM Userrole LIMIT 1), NOW(), NOW());

INSERT INTO Customer (customer_id, first_name, surname, email, klantenkaart, password, storepoints, createdAt, updatedAt)
VALUES ('bbbbbbbb-0000-4000-8000-000000000001', 'Parity', 'Customer', 'parity-customer@example.invalid', '9999999999991', '$2b$10$ZiocO8SUJjTb8qSYuJUnc.xl45QwQAtG00AtwGtZFRwxgLV6gGtTu', 7, NOW(), NOW());

INSERT INTO Customer_Settings (shoptype, shopheight, customer_id, standard_promotions, standard_storestamps, easy_order, quick_scan)
VALUES (1, 2, 'bbbbbbbb-0000-4000-8000-000000000001', 1, 0, 1, 0);

INSERT INTO Customer_Information (customer_information_id, first_name, surname, street, house_number, city, zipcode, customer_id)
VALUES ('cccccccc-0000-4000-8000-000000000001', 'Parity', 'Customer', 'Teststraat', '1', 'Testdorp', '1234AB', 'bbbbbbbb-0000-4000-8000-000000000001');
