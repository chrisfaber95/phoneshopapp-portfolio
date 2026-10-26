-- One shop with contact details, address, hours, a time slot, a delivery zip code, terms and a job offer, in the `shops` database
-- (create it first with Database/shops_schema.sql). The access data of the main database is left empty on purpose.
USE shops;
DELETE FROM Job_Application WHERE job_application_id = 'bbbbbbbb-0000-4000-8000-0000000000b2';
DELETE FROM Job_Offer WHERE job_offer_id = 'bbbbbbbb-0000-4000-8000-0000000000b1';
DELETE FROM Timeslots WHERE shop_id = 'cccccccc-0000-4000-8000-000000000001';
DELETE FROM Delivery_Location WHERE shop_id = 'cccccccc-0000-4000-8000-000000000001';
DELETE FROM Socials WHERE shop_id = 'cccccccc-0000-4000-8000-000000000001';
DELETE FROM Business_Hours WHERE shop_id = 'cccccccc-0000-4000-8000-000000000001';
DELETE FROM Shops WHERE shop_id = 'cccccccc-0000-4000-8000-000000000001';
DELETE FROM Information WHERE information_id = 'dddddddd-0000-4000-8000-0000000000c1';
DELETE FROM Address WHERE street = 'Parityweg';
DELETE FROM Terms_And_Conditions WHERE content = 'parity terms';
INSERT INTO Address (street, house_number, city, zipcode) VALUES ('Parityweg', '1', 'Testdorp', '1234AB');
INSERT INTO Information (information_id, name, phone, mail, address_id) VALUES ('dddddddd-0000-4000-8000-0000000000c1', 'Parity Shop', '0123456789', 'shop@example.invalid', LAST_INSERT_ID());
INSERT INTO Terms_And_Conditions (content) VALUES ('parity terms');
INSERT INTO Shops (shop_id, shopname, domain, TAC_id, information_id) VALUES ('cccccccc-0000-4000-8000-000000000001', 'Parity Shop', 'parity.example.invalid', LAST_INSERT_ID(), 'dddddddd-0000-4000-8000-0000000000c1');
INSERT INTO Socials (type, url, visible, shop_id) VALUES ('facebook', 'https://example.invalid/fb', 1, 'cccccccc-0000-4000-8000-000000000001');
INSERT INTO Business_Hours (weekday, `default`, start, end, shop_id) VALUES (1, 1, '08:00:00', '18:00:00', 'cccccccc-0000-4000-8000-000000000001');
INSERT INTO Timeslots (timeslot_date, timeslot_start, timeslot_end, is_delivery, available_slots, shop_id) VALUES ('2030-01-02', '10:00:00', '11:00:00', 0, 5, 'cccccccc-0000-4000-8000-000000000001');
INSERT INTO Delivery_Location (zipcode, shop_id) VALUES ('1234AB', 'cccccccc-0000-4000-8000-000000000001');
INSERT INTO Job_Offer (job_offer_id, title, hours, createdAt, updatedAt, shop_id) VALUES ('bbbbbbbb-0000-4000-8000-0000000000b1', 'Parity job', '8', '2030-01-01 00:00:00', '2030-01-01 00:00:00', 'cccccccc-0000-4000-8000-000000000001');
INSERT INTO Job_Application (job_application_id, name, email, status, createdAt, updatedAt, job_offer_id) VALUES ('bbbbbbbb-0000-4000-8000-0000000000b2', 'Parity Applicant', 'applicant@example.invalid', 'new', '2030-01-01 00:00:00', '2030-01-01 00:00:00', 'bbbbbbbb-0000-4000-8000-0000000000b1');
