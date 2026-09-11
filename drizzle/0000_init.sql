CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partner_id` varchar(60) NOT NULL,
	`source_page` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('byra','kontakt') NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`company_form` varchar(40),
	`message` text,
	`source_page` varchar(500) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`forwarded_at` timestamp,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(200) NOT NULL,
	`magnet` varchar(100),
	`confirmed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tool` varchar(60) NOT NULL,
	`email` varchar(320) NOT NULL,
	`payload_json` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tool_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `affiliate_clicks_partner_idx` ON `affiliate_clicks` (`partner_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `leads_created_at_idx` ON `leads` (`created_at`);--> statement-breakpoint
CREATE INDEX `subscribers_email_idx` ON `subscribers` (`email`);