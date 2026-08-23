import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  date,
  customType,
} from "drizzle-orm/pg-core";

// Custom vector type for pgvector with 1536 dimensions (OpenAI text-embedding-3-small)
export const vector1536 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string | number[]): number[] {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  },
});

// 1. Building Knowledge Base (grounding database)
export const buildingKb = pgTable("building_kb", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  embedding: vector1536("embedding"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Maintenance Tickets
export const maintenanceTickets = pgTable("maintenance_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitNumber: text("unit_number").notNull(),
  category: text("category").notNull(), // Plumbing, Electrical, HVAC/AC, Appliance, General
  urgency: text("urgency").notNull(), // low, medium, emergency
  description: text("description").notNull(),
  status: text("status").default("open").notNull(), // open, in_progress, resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Visitor Passes
export const visitorPasses = pgTable("visitor_passes", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitNumber: text("unit_number").notNull(),
  visitorName: text("visitor_name").notNull(),
  plateNumber: text("plate_number"),
  validFrom: timestamp("valid_from").defaultNow().notNull(),
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").default("active").notNull(), // active, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Amenity Bookings
export const amenityBookings = pgTable("amenity_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitNumber: text("unit_number").notNull(),
  residentName: text("resident_name").notNull(),
  amenityType: text("amenity_type").notNull(), // BBQ Zone 1, BBQ Zone 2, Residents Lounge
  bookingDate: date("booking_date").notNull(),
  timeSlot: text("time_slot").notNull(),
  status: text("status").default("confirmed").notNull(), // confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BuildingKbItem = typeof buildingKb.$inferSelect;
export type MaintenanceTicket = typeof maintenanceTickets.$inferSelect;
export type VisitorPass = typeof visitorPasses.$inferSelect;
export type AmenityBooking = typeof amenityBookings.$inferSelect;
