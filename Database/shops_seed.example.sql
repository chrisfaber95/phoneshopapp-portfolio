-- Template to register one shop in the rebuilt `shops` database (REV-033). Copy it, fill in the real values and run it
-- after shops_schema.sql. Do not commit the filled-in copy: it contains the shop's database password.
--
-- database_name / database_user / database_pw must match the shop's own main database (the one that holds
-- Product, Order, Customer, ...). Without a correct row here the server cannot reach that shop's data.

USE `shops`;

SET @address_id = NULL, @information_id = UUID(), @shop_id = UUID();

INSERT INTO `Address` (`street`, `house_number`, `house_addition`, `city`, `zipcode`)
VALUES ('<street>', '<number>', NULL, '<city>', '<zipcode>');
SET @address_id = LAST_INSERT_ID();

INSERT INTO `Information` (`information_id`, `name`, `phone`, `mail`, `kvk`, `btw`, `mobile`, `admin_mail`, `logo_url`, `contact_image_url`, `address_id`)
VALUES (@information_id, '<shop name>', '<phone>', '<mail>', '<kvk>', '<btw>', NULL, '<admin mail>', NULL, NULL, @address_id);

INSERT INTO `Terms_And_Conditions` (`content`) VALUES ('<terms and conditions text>');
SET @tac_id = LAST_INSERT_ID();

INSERT INTO `Shops` (`shop_id`, `shopname`, `database_name`, `database_pw`, `database_user`, `styling_url`, `domain`, `TAC_id`, `information_id`)
VALUES (@shop_id, '<shop name>', '<main database name>', '<main database password>', '<main database user>', NULL, '<shop domain>', @tac_id, @information_id);
