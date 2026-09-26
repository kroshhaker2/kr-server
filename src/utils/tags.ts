import { z } from "zod";
import { Rating } from "../generated/prisma/enums.js";

const ratingSchema = z.enum(Rating);
const sortSchema = z.enum(["newest", "oldest", "views", "favorites"]);

export function parseTags(tokens: string[]) {
    const tags: string[] = [];
    const filters: {
        order?: z.infer<typeof sortSchema>;
        rating?: Rating;
        type?: string;
    } = {};

    for (const token of tokens) {
        const separator = token.indexOf(":");

        if (separator === -1) {
            tags.push(token);
            continue;
        }

        const key = token.slice(0, separator);
        const value = token.slice(separator + 1);

        switch (key) {
            case "rating":
                filters.rating = ratingSchema.parse(value.toUpperCase());
                break;

            case "order":
                filters.order = sortSchema.parse(value.toLowerCase());
                break;

            case "type":
                filters[key] = value;
                break;

            default:
                tags.push(token);
        }
    }

    return { tags, ...filters };
}