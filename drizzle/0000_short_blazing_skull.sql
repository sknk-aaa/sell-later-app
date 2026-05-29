CREATE TABLE `item_images` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`file_path` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`purchase_price` integer,
	`expected_price` integer NOT NULL,
	`shipping_fee` integer DEFAULT 0 NOT NULL,
	`location` text,
	`condition` text NOT NULL,
	`status` text NOT NULL,
	`memo` text,
	`is_favorite` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sale_records` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`actual_price` integer NOT NULL,
	`actual_shipping_fee` integer NOT NULL,
	`actual_profit` integer NOT NULL,
	`sold_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sale_records_item_id_unique` ON `sale_records` (`item_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`is_pro` integer DEFAULT false NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`fee_rate` real DEFAULT 0.1 NOT NULL
);
