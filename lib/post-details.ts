export type PostDetail = { type: "text"; text: string } | { type: "image"; src: string; alt: string };
export const detailsText = (details: PostDetail[]) => details.filter((item): item is Extract<PostDetail, { type: "text" }> => item.type === "text").map(item => item.text).join("\n\n");
