import jwt from "jsonwebtoken";
import type { IUserDocument } from "~/server/models/user";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

export function generateTokens(user: IUserDocument) {
  const userData = {
    ...user.toObject(),
    id: user._id, // Convert _id to id
  };

  const access = jwt.sign(
    { user_id: userData.id, email: userData.email },
    JWT_SECRET,
    {
      expiresIn: "30m",
    }
  );

  const refresh = jwt.sign({ user_id: userData.id }, JWT_REFRESH_SECRET, {
    expiresIn: "14d",
  });

  return { access, refresh };
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}
