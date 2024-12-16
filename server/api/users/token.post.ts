import { connectToDatabase } from "~/server/utils/mongodb";
import { generateTokens } from "~/server/utils/jwt";
import { User } from "~/server/models/user";

export default defineEventHandler(async (event) => {
  await connectToDatabase();
  const { email, password } = await readBody(event);

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw createError({
      statusCode: 401,
      message: "Invalid credentials",
    });
  }

  const tokens = generateTokens(user);
  const userObject = user.toObject();
  const { password: _, ...userWithoutPassword } = userObject;

  return {
    ...tokens,
    user: userWithoutPassword,
  };
});
