-- CreateTable
CREATE TABLE `appointments` (
    `id` VARCHAR(36) NOT NULL,
    `client_id` VARCHAR(36) NOT NULL,
    `start_at` DATETIME(0) NOT NULL,
    `end_at` DATETIME(0) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `appointments_client_id_start_at_idx`(`client_id`, `start_at`),
    INDEX `appointments_start_at_end_at_status_idx`(`start_at`, `end_at`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointment_services` (
    `id` VARCHAR(36) NOT NULL,
    `appointment_id` VARCHAR(36) NOT NULL,
    `service_id` VARCHAR(36) NOT NULL,
    `sequence` SMALLINT UNSIGNED NOT NULL,
    `service_name_snapshot` VARCHAR(100) NOT NULL,
    `service_price_snapshot` DECIMAL(10, 2) NOT NULL,
    `service_duration_snapshot` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `appointment_services_service_id_idx`(`service_id`),
    INDEX `appointment_services_status_idx`(`status`),
    UNIQUE INDEX `appointment_services_appointment_id_service_id_key`(`appointment_id`, `service_id`),
    UNIQUE INDEX `appointment_services_appointment_id_sequence_key`(`appointment_id`, `sequence`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointment_services` ADD CONSTRAINT `appointment_services_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointment_services` ADD CONSTRAINT `appointment_services_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
