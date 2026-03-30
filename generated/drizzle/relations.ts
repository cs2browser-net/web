import { relations } from "drizzle-orm/relations";
import { server, playersData, serverData } from "./schema";

export const playersDataRelations = relations(playersData, ({one}) => ({
	server: one(server, {
		fields: [playersData.serverId],
		references: [server.id]
	}),
}));

export const serverRelations = relations(server, ({many}) => ({
	playersData: many(playersData),
	serverData: many(serverData),
}));

export const serverDataRelations = relations(serverData, ({one}) => ({
	server: one(server, {
		fields: [serverData.serverId],
		references: [server.id]
	}),
}));