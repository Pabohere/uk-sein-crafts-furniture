// Administration API is authenticated and handled at the Worker boundary.
// The old unauthenticated database CRUD endpoint is intentionally unavailable.
const unavailable = () => Response.json({ error: "Not found." }, { status: 404 });
export const GET = unavailable;
export const POST = unavailable;
export const PATCH = unavailable;
export const DELETE = unavailable;
