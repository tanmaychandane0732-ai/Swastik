import { dataRepository } from "../repositories/dataRepository";

export async function getGuestUserId(): Promise<string> {
  const guestEmail = "guest@finquest.com";

  const existingGuest = await dataRepository.findUserByEmail(guestEmail);

  if (existingGuest) {
    return existingGuest.id;
  }

  const guestUser = await dataRepository.createUser({
    name: "Guest User",
    email: guestEmail,
    passwordHash: "guest",
    role: "STUDENT",
  });

  return guestUser.id;
}