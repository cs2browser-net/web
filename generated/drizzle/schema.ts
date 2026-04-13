import { pgTable, text, integer, jsonb, timestamp, uniqueIndex, doublePrecision, foreignKey, boolean, serial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const tasks = pgTable("Tasks", {
	id: text("ID").primaryKey().notNull(),
	taskKind: integer("TaskKind").notNull(),
	taskData: jsonb("TaskData").notNull(),
	taskExecuted: integer("TaskExecuted").default(0).notNull(),
});

export const rateLimit = pgTable("RateLimit", {
	id: text("ID").primaryKey().notNull(),
	ip: text("IP").notNull(),
	kind: text("Kind").notNull(),
	count: integer("Count").default(0).notNull(),
	lastSeen: timestamp("LastSeen", { precision: 3, mode: 'string' }).notNull(),
	windowStart: timestamp("WindowStart", { precision: 3, mode: 'string' }).notNull(),
});

export const server = pgTable("Server", {
	id: text("ID").primaryKey().notNull(),
	address: text("Address").notNull(),
	country: text("Country").notNull(),
	latitute: doublePrecision("Latitute").notNull(),
	longitude: doublePrecision("Longitude").notNull(),
	status: integer("Status").default(0).notNull(),
	lastUpdated: timestamp("LastUpdated", { precision: 3, mode: 'string' }),
	lastStatusUpdate: timestamp("LastStatusUpdate", { precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("Server_Address_key").using("lsm", table.address.asc().nullsLast().op("text_ops")),
]);

export const playersData = pgTable("PlayersData", {
	serverId: text("ServerID").notNull(),
	list: jsonb("List").notNull(),
	maxLast24Hours: jsonb("MaxLast24Hours").notNull(),
	maxLast7Days: jsonb("MaxLast7Days").notNull(),
	maxLast30Days: jsonb("MaxLast30Days").notNull(),
	timestamp: timestamp("Timestamp", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("PlayersData_ServerID_key").using("lsm", table.serverId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.serverId],
		foreignColumns: [server.id],
		name: "PlayersData_ServerID_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const serverData = pgTable("ServerData", {
	serverId: text("ServerID").notNull(),
	hostname: text("Hostname").notNull(),
	map: text("Map").notNull(),
	maxPlayers: integer("MaxPlayers").notNull(),
	playersCount: integer("PlayersCount").notNull(),
	botsCount: integer("BotsCount").notNull(),
	version: text("Version").notNull(),
	secure: boolean("Secure").notNull(),
	tags: text("Tags").notNull(),
}, (table) => [
	uniqueIndex("ServerData_ServerID_key").using("lsm", table.serverId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.serverId],
		foreignColumns: [server.id],
		name: "ServerData_ServerID_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const metrics = pgTable("Metrics", {
	id: serial("ID").primaryKey().notNull(),
	checkedLast24Hours: jsonb("CheckedLast24Hours").notNull(),
	checkedLast7Days: jsonb("CheckedLast7Days").notNull(),
	checkedLast30Days: jsonb("CheckedLast30Days").notNull(),
	prefilterLast24Hours: jsonb("PrefilterLast24Hours").notNull(),
	prefilterLast7Days: jsonb("PrefilterLast7Days").notNull(),
	prefilterLast30Days: jsonb("PrefilterLast30Days").notNull(),
	playersLast24Hours: jsonb("PlayersLast24Hours").notNull(),
	playersLast7Days: jsonb("PlayersLast7Days").notNull(),
	playersLast30Days: jsonb("PlayersLast30Days").notNull(),
});
