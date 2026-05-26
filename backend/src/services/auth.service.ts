import { prisma } from "../lib/prisma";
import { hashPassword, comparePasswords } from "../utils/password.utils";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.utils";
import { env } from "../config/env";

function parseExpiry(expiresInStr: string): Date {
  const match = expiresInStr.match(/^(\d+)([dhm])$/);
  const now = new Date();
  if (!match) {
    // Default to 7 days
    now.setDate(now.getDate() + 7);
    return now;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "d") {
    now.setDate(now.getDate() + value);
  } else if (unit === "h") {
    now.setHours(now.getHours() + value);
  } else if (unit === "m") {
    now.setMinutes(now.getMinutes() + value);
  }
  return now;
}

export class AuthService {
  static async register(data: any) {
    const { name, email, password, role } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw { status: 400, message: "Email is already registered" };
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "teacher",
      },
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: parseExpiry(env.JWT_REFRESH_EXPIRES_IN),
      },
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw { status: 400, message: "Invalid email or password" };
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      throw { status: 400, message: "Invalid email or password" };
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: parseExpiry(env.JWT_REFRESH_EXPIRES_IN),
      },
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async refresh(refreshTokenStr: string) {
    if (!refreshTokenStr) {
      throw { status: 400, message: "Refresh token is required" };
    }

    const decoded = verifyRefreshToken(refreshTokenStr);
    if (!decoded) {
      throw { status: 401, message: "Invalid or expired refresh token" };
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
    });

    if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
      throw { status: 401, message: "Refresh token is expired or revoked" };
    }

    const user = await prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user) {
      throw { status: 401, message: "User not found" };
    }

    // Revoke the used token (Token Rotation pattern)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: parseExpiry(env.JWT_REFRESH_EXPIRES_IN),
      },
    });

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async logout(refreshTokenStr: string) {
    if (!refreshTokenStr) {
      return;
    }
    // Mark the refresh token as revoked
    await prisma.refreshToken.updateMany({
      where: { token: refreshTokenStr },
      data: { revokedAt: new Date() },
    });
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    return user;
  }
}
