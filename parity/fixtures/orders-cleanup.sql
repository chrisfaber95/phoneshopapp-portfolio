DELETE FROM Order_has_Product WHERE order_id IN (SELECT order_id FROM `Order` WHERE uuid_id = 'ffffffff-0000-4000-8000-000000000001');
DELETE FROM `Order` WHERE uuid_id = 'ffffffff-0000-4000-8000-000000000001';
