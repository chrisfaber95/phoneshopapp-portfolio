-- One stamp card (3 stamps) of the test customer of auth.sql for an existing savings action (load after auth.sql)
DELETE FROM Customer_has_Spaaractie WHERE customer_has_spaaractie_id = '99999999-0000-4000-8000-000000000001';
INSERT INTO Customer_has_Spaaractie (customer_has_spaaractie_id, stamp_amount, point_amount, createdAt, updatedAt, customer_id, spaaractie_id)
VALUES ('99999999-0000-4000-8000-000000000001', 3, 0, NOW(), NOW(), 'bbbbbbbb-0000-4000-8000-000000000001', '60257f96-539e-11ed-b67e-0242ac110003');
