import { z } from "zod";

export const routingSchema = z.object({
	route: z.enum(["tools", "rag"]),
});
