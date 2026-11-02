import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { RegisterInput, LoginInput, UpdateProfileInput } from "@suaraksi/shared";
import { prisma } from "../config/database";
import { ENV } from "../config/env";

export async function registerUser(input: RegisterInput) {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingEmail) {
    throw new Error("Email sudah terdaftar dalam sistem");
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username: input.username },
  });
  if (existingUsername) {
    throw new Error("Username sudah digunakan, silakan pilih yang lain");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const isInstanceRole = input.role === Role.INSTANCE;

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      name: input.name,
      passwordHash,
      role: input.role,
      phone: input.contactPhone,
      isVerified: false,
      instanceProfile: isInstanceRole
        ? {
            create: {
              instanceName: input.instanceName || input.name,
              jurisdiction: input.instanceJurisdiction || "Nasional",
              categoryFocus: input.instanceCategory,
            },
          }
        : undefined,
    },
    include: {
      instanceProfile: true,
    },
  });

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      instanceProfile: user.instanceProfile,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      instanceProfile: true,
    },
  });

  if (!user) {
    throw new Error("Email atau kata sandi tidak sesuai");
  }

  if (!user.isActive) {
    throw new Error("Akun Anda telah dinonaktifkan oleh administrator");
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Email atau kata sandi tidak sesuai");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      instanceProfile: user.instanceProfile,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      instanceProfile: true,
      _count: {
        select: {
          reports: true,
          bookmarks: true,
          followers: true,
          following: true,
          upvotes: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan");
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    phone: user.phone,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    instanceProfile: user.instanceProfile,
    stats: {
      reportsCount: user._count.reports,
      bookmarksCount: user._count.bookmarks,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      upvotesCount: user._count.upvotes,
    },
  };
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      bio: input.bio,
      avatarUrl: input.avatarUrl !== "" ? input.avatarUrl : null,
      phone: input.phone,
      instanceProfile: input.jurisdiction
        ? {
            update: {
              jurisdiction: input.jurisdiction,
            },
          }
        : undefined,
    },
    include: {
      instanceProfile: true,
    },
  });

  return user;
}
