import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uuid,
} from "drizzle-orm/pg-core";

// better-auth core tables (schema shape required by better-auth's Drizzle adapter)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// App tables

export const themeValues = ["light", "dark", "system"] as const;

export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  phone: text("phone"),
  notes: text("notes"),
  theme: text("theme"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const applicationStatusValues = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export const jobTypeValues = ["remote", "hybrid", "onsite"] as const;

export const salaryPeriodValues = ["hourly", "monthly", "yearly"] as const;

export const currencyValues = [
  "PHP",
  "USD",
  "SGD",
  "AUD",
  "EUR",
  "GBP",
  "JPY",
  "HKD",
  "CAD",
] as const;

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jobTitle: text("job_title").notNull(),
    companyName: text("company_name").notNull(),
    jobUrl: text("job_url"),
    description: text("description"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency").default("PHP"),
    salaryPeriod: text("salary_period"),
    salaryRawText: text("salary_raw_text"),
    location: text("location"),
    jobType: text("job_type"),
    status: text("status").notNull().default("saved"),
    dateApplied: timestamp("date_applied"),
    contactPerson: text("contact_person"),
    contactEmail: text("contact_email"),
    notes: text("notes"),
    source: text("source").default("manual"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_applications_user").on(table.userId),
    index("idx_applications_status").on(table.status),
    index("idx_applications_company").on(table.companyName),
    index("idx_applications_date_applied").on(table.dateApplied),
  ]
);

export const extensionPairingCode = pgTable("extension_pairing_code", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  phraseHash: text("phrase_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
});

export const extensionToken = pgTable("extension_token", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  label: text("label").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});
