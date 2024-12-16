import { H3Event } from "h3";
import { verifyToken } from "../utils/jwt";

export default defineEventHandler(async (event: H3Event) => {
  const authHeader = getHeader(event, "authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    throw createError({
      statusCode: 401,
      message: "Invalid or expired token",
    });
  }

  event.context.auth = decoded;
});
