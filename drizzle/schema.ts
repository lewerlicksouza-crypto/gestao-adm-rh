import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  timestamp,
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
