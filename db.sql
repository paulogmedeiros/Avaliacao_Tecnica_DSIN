CREATE DATABASE dsin_db;
use dsin_db;

CREATE TABLE `users` (
  `id`         VARCHAR(36)  NOT NULL,
  `name`       VARCHAR(255) NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `password`   VARCHAR(255) NOT NULL,
  `phone`      VARCHAR(20)  NOT NULL,
  `role`       ENUM('CLIENT','ADMIN') NOT NULL DEFAULT 'CLIENT',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `services` (
  `id`               VARCHAR(36)   NOT NULL,
  `name`             VARCHAR(100)  NOT NULL,
  `description`      TEXT          NULL,
  `price`            DECIMAL(10,2) NOT NULL,
  `duration_minutes` INT           NOT NULL,
  `is_active`        BOOLEAN       NOT NULL DEFAULT TRUE,
  `createdAt`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `services_name_key` (`name`),
  KEY `services_isActive_name_idx` (`is_active`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `business_hours` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `day_of_week`  ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY') NOT NULL,
  `opening_time` TIME NOT NULL,
  `lunch_start`  TIME NOT NULL,
  `lunch_end`    TIME NOT NULL,
  `closing_time` TIME NOT NULL,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_hours_day_of_week_key` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `appointments` (
  `id`         VARCHAR(36) NOT NULL,
  `client_id`  VARCHAR(36) NOT NULL,
  `start_at`   DATETIME NOT NULL,
  `end_at`     DATETIME NOT NULL,
  `status`     ENUM('PENDING','CONFIRMED','COMPLETED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointments_client_id_start_at_idx` (`client_id`, `start_at`),
  KEY `appointments_start_at_end_at_status_idx` (`start_at`, `end_at`, `status`),
  CONSTRAINT `appointments_client_id_fkey`
    FOREIGN KEY (`client_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `appointment_services` (
  `id`                         VARCHAR(36) NOT NULL,
  `appointment_id`             VARCHAR(36) NOT NULL,
  `service_id`                 VARCHAR(36) NOT NULL,
  `sequence`                   SMALLINT UNSIGNED NOT NULL,
  `service_name_snapshot`      VARCHAR(100) NOT NULL,
  `service_price_snapshot`     DECIMAL(10,2) NOT NULL,
  `service_duration_snapshot`  INT NOT NULL,
  `status`                     ENUM('PENDING','CONFIRMED','COMPLETED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `created_at`                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_services_appointment_id_service_id_key` (`appointment_id`, `service_id`),
  UNIQUE KEY `appointment_services_appointment_id_sequence_key` (`appointment_id`, `sequence`),
  KEY `appointment_services_service_id_idx` (`service_id`),
  KEY `appointment_services_status_idx` (`status`),
  CONSTRAINT `appointment_services_appointment_id_fkey`
    FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `appointment_services_service_id_fkey`
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO `users`
  (`id`, `name`, `email`, `password`, `phone`, `role`, `created_at`, `updated_at`)
VALUES
  ('01a034e3-5d28-7439-8871-c8836c13340f', 'Maria Souza', 'maria.souza@example.com',
   '$2b$10$y5BciK4K6XUZqkSa/./ZS.fpdlTGIJD9/4G5DXNsvSPuJYwdHFMAi', '27999990001', 'CLIENT', NOW(), NOW()),
  ('01a03508-423a-7185-9de6-90cc8fd525fc', 'Admin do Salão', 'admin@salao.com',
   '$2b$10$y5BciK4K6XUZqkSa/./ZS.fpdlTGIJD9/4G5DXNsvSPuJYwdHFMAi', '27999990002', 'ADMIN', NOW(), NOW());


INSERT INTO `services`
  (`id`, `name`, `description`, `price`, `duration_minutes`, `is_active`, `createdAt`, `updatedAt`)
VALUES
  ('01a03e17-82ba-768a-b994-25bdf4fd2746', 'Corte de Cabelo Feminino', 'Corte com lavagem e finalização.', 60.00, 60, TRUE, NOW(), NOW()),
  ('01a0363d-980a-72b3-94e9-53a1bbe65687', 'Escova', 'Escova modeladora com secador.', 45.00, 45, TRUE, NOW(), NOW()),
  ('01a03640-3a70-7eb6-9690-2bed2460dec7', 'Coloração', 'Coloração completa dos fios.', 150.00, 120, TRUE, NOW(), NOW()),
  ('01a03df1-3180-7e4f-bad2-bd9d4c2271d1', 'Hidratação Capilar', 'Tratamento de hidratação profunda.', 70.00, 50, TRUE, NOW(), NOW()),
  ('01a03e22-214e-7878-937e-cb3216743445', 'Manicure', 'Cuidado e esmaltação das unhas das mãos.', 35.00, 40, TRUE, NOW(), NOW()),
  ('01a03e23-1e0a-75f8-9aaf-148e7e6357a8', 'Pedicure', 'Cuidado e esmaltação das unhas dos pés.', 40.00, 45, TRUE, NOW(), NOW()),
  ('01a03e2a-102b-7b95-85fa-545294dba3a2', 'Design de Sobrancelhas', 'Design com pinça e/ou linha.', 30.00, 20, TRUE, NOW(), NOW()),
  ('01a03e8a-64cf-782b-8a04-233c5a83fb4e', 'Maquiagem', 'Maquiagem profissional para eventos.', 120.00, 60, TRUE, NOW(), NOW()),
  ('01a0363c-e7b7-7d43-8883-23ada4673f3f', 'Depilação com Cera', 'Depilação de pernas, axilas ou buço.', 50.00, 30, TRUE, NOW(), NOW());


INSERT INTO `business_hours`
  (`day_of_week`, `opening_time`, `lunch_start`, `lunch_end`, `closing_time`, `created_at`, `updated_at`)
VALUES
  ('MONDAY',    '08:00:00', '12:00:00', '13:00:00', '18:00:00', NOW(), NOW()),
  ('TUESDAY',   '08:00:00', '12:00:00', '13:00:00', '18:00:00', NOW(), NOW()),
  ('WEDNESDAY', '08:00:00', '12:00:00', '13:00:00', '18:00:00', NOW(), NOW()),
  ('THURSDAY',  '08:00:00', '12:00:00', '13:00:00', '18:00:00', NOW(), NOW()),
  ('FRIDAY',    '08:00:00', '12:00:00', '13:00:00', '18:00:00', NOW(), NOW()),
  ('SATURDAY',  '08:00:00', '12:00:00', '13:00:00', '15:00:00', NOW(), NOW());
