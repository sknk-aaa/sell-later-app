ALTER TABLE `items` ADD `platform` text;--> statement-breakpoint
ALTER TABLE `items` ADD `fee_rate_bps` integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `fee_fixed_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `default_platform` text DEFAULT 'ebay' NOT NULL;