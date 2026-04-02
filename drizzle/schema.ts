import {
  mysqlTable,
  varchar,
  int,
  text,
  timestamp,
  enum as mysqlEnum,
} from "drizzle-orm/mysql-core";

export const employees = mysqlTable("employees", {
  id: int().primaryKey().autoincrement(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const vacations = mysqlTable("vacations", {
  id: int().primaryKey().autoincrement(),
  employeeId: int("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }).notNull(),
  type: mysqlEnum("type", ["30", "20+10", "15+15"]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Vacation = typeof vacations.$inferSelect;
export type NewVacation = typeof vacations.$inferInsert;
