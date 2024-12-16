import { User } from "~/server/models/user";
import { connectToDatabase } from "~/server/utils/mongodb";

export default defineEventHandler(async (event) => {
  if (!event.context.auth) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  await connectToDatabase();
  const user = await User.findById(event.context.auth.user_id).select(
    "-password"
  );

  if (!user) {
    throw createError({
      statusCode: 404,
      message: "User not found",
    });
  }

  return user;
});
