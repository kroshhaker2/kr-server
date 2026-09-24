import sharp, { type FitEnum } from "sharp";

export interface PreviewOptions {
    width?: number;
    height?: number;
    quality?: number;
    fit?: keyof FitEnum;
}

export async function createPreview(
    input: Buffer,
    {
        width = 600,
        height = 600,
        quality = 75,
        fit = "inside",
    }: PreviewOptions = {},
): Promise<Buffer> {
    return sharp(input, {
        animated: true,
        failOn: "none",
    })
        .rotate()
        .resize({
            width,
            height,
            fit,
            withoutEnlargement: true,
        })
        .webp({
            quality,
            effort: 4,
        })
        .toBuffer();
}