import type { FastifyPluginAsync } from "fastify";
import {
    createPost,
    PostFilters,
    querySchema,
    uploadPostSchema,
} from "../types/posts.types.js";
import { createPostsService } from "../services/posts.service.js";
import { parseTags } from "../utils/tags.js";
import { config } from "../config/config.js";

const posts: FastifyPluginAsync = async (fastify) => {
    const postsService = createPostsService(fastify.prisma, fastify.error, fastify.minio);

    fastify.get("/posts", async (req, reply) => {
        const { tags, limit, page } = querySchema.parse(req.query);

        const parsedTags = parseTags(tags);

        const filters: PostFilters = {
            tags: parsedTags.tags,
            sort: parsedTags.order,
            rating: parsedTags.rating,
            mimeType: parsedTags.type,
            limit: limit > 100 ? 100 : limit,
            page,
        };

        const posts = await postsService.getPage(filters);

        return reply.code(200).send({
            content: posts.content.map((post) => ({
                id: post.id,
                title: post.title,
                rating: post.rating,
                mimeType: post.mimeType,
                tags: post.tags.map((tag) => tag.name),

                file: `${config.STORAGE_URL}/posts/${post.originalKey}`,
                preview: `${config.STORAGE_URL}/posts/${post.previewKey}`,
            })),
            pages: posts.pages,
        });
    });

    fastify.post("/posts", async (req, reply) => {
        await fastify.authenticate(req);

        const part = await req.file();

        if (!part) {
            throw fastify.error("FILE_REQUIRED");
        }

        const buffer = await part.toBuffer();

        const metadata = part.fields.metadata;

        if (
            !metadata ||
            Array.isArray(metadata) ||
            metadata.type !== "field" ||
            typeof metadata.value !== "string"
        ) {
            throw fastify.error("METADATA_REQUIRED");
        }

        let json: unknown;

        try {
            json = JSON.parse(metadata.value);
        } catch {
            throw fastify.error("INVALID_JSON");
        }

        const data = uploadPostSchema.parse(json);

        const post: createPost = {
            rating: data.rating,
            tags: data.tags,
            file: buffer,
            filename: part.filename,

            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.sourceUrl !== undefined && { sourceUrl: data.sourceUrl }),
        };

        postsService.create(post);

        return reply.code(201).send();
    });
};

export default posts;
