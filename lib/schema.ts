import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Auth Tables
export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull(),
    image: text('image'),
    role: text('role').default('user'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId').notNull().references(() => user.id)
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId').notNull().references(() => user.id),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt'),
    updatedAt: timestamp('updatedAt')
});

// Application Tables
export const services = pgTable('services', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    price: text('price').notNull(),
    duration: integer('duration'),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const availabilitySlots = pgTable('availability_slots', {
    id: text('id').primaryKey(),
    startTime: timestamp('start_time').notNull(),
    isBooked: boolean('is_booked').default(false).notNull(),
    blockedByAdmin: boolean('blocked_by_admin').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => user.id),
    serviceId: text('service_id').references(() => services.id),
    slotId: text('slot_id').references(() => availabilitySlots.id),
    date: timestamp('date').notNull(),
    status: text('status').default('pending'),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    customerPhone: text('customer_phone'),
    hairPhotoUrl: text('hair_photo_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});
