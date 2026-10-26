-- Schema of the `shops` database (the lookup database that maps a shop to its own main database).
-- Rebuilt in REV-033 from Server/store_models (no dump or backup of the original existed), so column types are
-- what Sequelize generates for those models: STRING = varchar(255), UUID = char(36).
--
-- Usage:  mysql -u <user> -p < Database/shops_schema.sql
-- Safe to run twice: it only creates what is missing and never drops anything.

CREATE DATABASE IF NOT EXISTS `shops` DEFAULT CHARACTER SET utf8mb4;
USE `shops`;

CREATE TABLE IF NOT EXISTS `Address` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `street` varchar(255) DEFAULT NULL,
  `house_number` varchar(255) DEFAULT NULL,
  `house_addition` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `zipcode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Information` (
  `information_id` char(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  `kvk` varchar(255) DEFAULT NULL,
  `btw` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `admin_mail` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `contact_image_url` varchar(255) DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  PRIMARY KEY (`information_id`),
  FOREIGN KEY (`address_id`) REFERENCES `Address` (`address_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Terms_And_Conditions` (
  `TAC_id` int NOT NULL AUTO_INCREMENT,
  `content` text,
  PRIMARY KEY (`TAC_id`)
) ENGINE=InnoDB;

-- database_name / database_user / database_pw point to the shop's own main database (see connection.js)
CREATE TABLE IF NOT EXISTS `Shops` (
  `shop_id` char(36) NOT NULL,
  `shopname` varchar(255) DEFAULT NULL,
  `database_name` varchar(255) DEFAULT NULL,
  `database_pw` varchar(255) DEFAULT NULL,
  `database_user` varchar(255) DEFAULT NULL,
  `styling_url` varchar(255) DEFAULT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `TAC_id` int DEFAULT NULL,
  `information_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`shop_id`),
  FOREIGN KEY (`information_id`) REFERENCES `Information` (`information_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Job_Offer` (
  `job_offer_id` char(36) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `experience` text,
  `labour_conditions` text,
  `expires_at` datetime DEFAULT NULL,
  `hours` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `shop_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`job_offer_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `Shops` (`shop_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Job_Application` (
  `job_application_id` char(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `zipcode` varchar(255) DEFAULT NULL,
  `house_number` varchar(255) DEFAULT NULL,
  `house_addition` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phonenumber` varchar(255) DEFAULT NULL,
  `cv` varchar(255) DEFAULT NULL,
  `motivatie` varchar(255) DEFAULT NULL,
  `beschikbaarheid` text,
  `status` varchar(255) DEFAULT NULL,
  `opmerkingen` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `job_offer_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`job_application_id`),
  FOREIGN KEY (`job_offer_id`) REFERENCES `Job_Offer` (`job_offer_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Timeslots` (
  `timeslot_id` int NOT NULL AUTO_INCREMENT,
  `timeslot_date` date DEFAULT NULL,
  `timeslot_start` time DEFAULT NULL,
  `timeslot_end` time DEFAULT NULL,
  `is_delivery` tinyint(1) DEFAULT NULL,
  `available_slots` int DEFAULT NULL,
  `shop_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`timeslot_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `Shops` (`shop_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Delivery_Location` (
  `delivery_location_id` int NOT NULL AUTO_INCREMENT,
  `zipcode` varchar(255) DEFAULT NULL,
  `shop_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`delivery_location_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `Shops` (`shop_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Socials` (
  `social_id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `visible` tinyint(1) DEFAULT NULL,
  `shop_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`social_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `Shops` (`shop_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `Business_Hours` (
  `business_hours_id` int NOT NULL AUTO_INCREMENT,
  `weekday` int DEFAULT NULL,
  `week` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `default` tinyint(1) DEFAULT NULL,
  `start` time DEFAULT NULL,
  `end` time DEFAULT NULL,
  `custom_label` varchar(255) DEFAULT NULL,
  `shop_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`business_hours_id`),
  FOREIGN KEY (`shop_id`) REFERENCES `Shops` (`shop_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
