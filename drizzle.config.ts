import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  timestamp,
  decimal,
} from "drizzle-orm/mysql-core";

export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),

  fullName: varchar("full_name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),

  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),

  admissionDate: date("admission_date"),

  status: varchar("status", { length: 20 }).default("Ativo"),

  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const vacationPeriods = mysqlTable("vacation_periods", {
  id: int("id").autoincrement().primaryKey(),

  employeeId: int("employee_id").notNull(),

  periodNumber: int("period_number").notNull(),

  start: date("start").notNull(),
  end: date("end").notNull(),

  totalDays: int("total_days").default(30),

  grantedUntil: date("granted_until").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const vacations = mysqlTable("vacations", {
  id: int("id").autoincrement().primaryKey(),

  employeeId: int("employee_id").notNull(),
  periodId: int("period_id").notNull(),

  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),

  vacationDays: int("vacation_days").notNull(),
  bonusDays: int("bonus_days").default(0),

  status: varchar("status", { length: 20 }).default("Pendente"),

  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),

  contractNumber: varchar("contract_number", { length: 50 }).notNull(),
  year: int("year").notNull(),

  clientName: varchar("client_name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }).notNull(),

  object: text("object").notNull(),

  reajustIndex: varchar("reajust_index", { length: 20 })
    .notNull()
    .default("IPCA"),

  signatureDate: date("signature_date").notNull(),

  status: varchar("status", { length: 20 }).notNull().default("Vigente"),

  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const contractItems = mysqlTable("contract_items", {
  id: int("id").autoincrement().primaryKey(),

  contractId: int("contract_id").notNull(),

  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").notNull().default(1),

  unitValue: decimal("unit_value", { precision: 12, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),

  isActive: int("is_active").notNull().default(1),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const contractTerms = mysqlTable("contract_terms", {
  id: int("id").autoincrement().primaryKey(),

  contractId: int("contract_id").notNull(),

  termType: varchar("term_type", { length: 20 }).notNull().default("initial"),
  termNumber: int("term_number").notNull().default(0),

  termDate: date("term_date").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),

  reajustIndex: varchar("reajust_index", { length: 20 }),
  reajustPercent: decimal("reajust_percent", {
    precision: 8,
    scale: 2,
  }).default("0.00"),

  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),

  installments: int("installments").notNull().default(1),
  installmentValue: decimal("installment_value", {
    precision: 12,
    scale: 2,
  }).notNull(),

  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const contractTermItems = mysqlTable("contract_term_items", {
  id: int("id").autoincrement().primaryKey(),

  termId: int("term_id").notNull(),
  contractItemId: int("contract_item_id").notNull(),

  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").notNull().default(1),

  unitValue: decimal("unit_value", { precision: 12, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const contractAttachments = mysqlTable("contract_attachments", {
  id: int("id").autoincrement().primaryKey(),

  contractId: int("contract_id").notNull(),
  termId: int("term_id"),

  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow(),
});
