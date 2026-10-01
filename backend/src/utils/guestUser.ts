import prisma from "../config/prisma";

export async function getGuestUserId(): Promise<string> {
  const guestEmail = "guest@finquest.com";

  const existingGuest = await prisma.user.findUnique({
    where: {
      email: guestEmail,
    },
  });

  if (existingGuest) {
    return existingGuest.id;
  }

  const guestUser = await prisma.user.create({
    data: {
      name: "Guest User",
      email: guestEmail,
      passwordHash: "guest",
    },
  });

  return guestUser.id;
}