UPDATE `items` SET `expected_price` = `expected_price` * 100;--> statement-breakpoint
UPDATE `items` SET `shipping_fee` = `shipping_fee` * 100;--> statement-breakpoint
UPDATE `items` SET `purchase_price` = `purchase_price` * 100 WHERE `purchase_price` IS NOT NULL;--> statement-breakpoint
UPDATE `sale_records` SET `actual_price` = `actual_price` * 100;--> statement-breakpoint
UPDATE `sale_records` SET `actual_shipping_fee` = `actual_shipping_fee` * 100;--> statement-breakpoint
UPDATE `sale_records` SET `actual_profit` = `actual_profit` * 100;
