import { connectToDatabase } from "~/server/utils/mongodb";
import { User } from "~/server/models/user";

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const body = await readBody(event);

    // Check if user exists
    const existingUser = await User.findOne({ email: body.credentials.email });
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: "Email already registered",
      });
    }

    // Create user
    const user = new User({
      email: body.credentials.email,
      password: body.credentials.password,
      first_name: body.credentials.first_name,
      is_staff: false,
    });

    await user.save();

    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    setResponseStatus(event, 201);
    return { user: userWithoutPassword };
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "An unexpected error occurred",
    });
  }
});
