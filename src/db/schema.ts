import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

/** Lead form submissions (byrå offer requests and the contact form). §2.4 */
export const leads = mysqlTable(
  "leads",
  {
    id: int("id").primaryKey().autoincrement(),
    type: mysqlEnum("type", ["byra", "kontakt"]).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    companyForm: varchar("company_form", { length: 40 }),
    message: text("message"),
    sourcePage: varchar("source_page", { length: 500 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    forwardedAt: timestamp("forwarded_at"),
  },
  (t) => [index("leads_created_at_idx").on(t.createdAt)],
);

/** Newsletter subscribers and lead-magnet downloads. §2.4 */
export const subscribers = mysqlTable(
  "subscribers",
  {
    id: int("id").primaryKey().autoincrement(),
    email: varchar("email", { length: 320 }).notNull(),
    source: varchar("source", { length: 200 }).notNull(),
    magnet: varchar("magnet", { length: 100 }),
    confirmedAt: timestamp("confirmed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("subscribers_email_idx").on(t.email)],
);

/** One row per /go/<partner> click. §2.4 */
export const affiliateClicks = mysqlTable(
  "affiliate_clicks",
  {
    id: int("id").primaryKey().autoincrement(),
    partnerId: varchar("partner_id", { length: 60 }).notNull(),
    sourcePage: varchar("source_page", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("affiliate_clicks_partner_idx").on(t.partnerId, t.createdAt)],
);

/** Saved tool runs — written only when the visitor asks for the result by e-mail. §2.4 */
export const toolResults = mysqlTable("tool_results", {
  id: int("id").primaryKey().autoincrement(),
  tool: varchar("tool", { length: 60 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  payloadJson: text("payload_json").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
