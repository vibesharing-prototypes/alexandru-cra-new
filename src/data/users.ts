import type { MockUser } from "./types.js";

const raw: [string, string][] = [
  ["Sarah", "Chen"],
  ["Marcus", "Johnson"],
  ["Elena", "Rodriguez"],
  ["David", "Kim"],
  ["Priya", "Sharma"],
  ["James", "O'Brien"],
  ["Fatima", "Al-Hassan"],
  ["Thomas", "Mueller"],
  ["Aisha", "Patel"],
  ["Robert", "Williams"],
  ["Maria", "Santos"],
  ["Kevin", "Nakamura"],
  ["Laura", "Johansson"],
  ["Ahmed", "Mansour"],
  ["Rachel", "Green"],
  ["Carlos", "Mendoza"],
  ["Yuki", "Tanaka"],
  ["Michael", "Thompson"],
  ["Nadia", "Kozlov"],
  ["Brian", "Mitchell"],
  ["Amara", "Okafor"],
  ["Stefan", "Bergmann"],
  ["Mei", "Wong"],
  ["Daniel", "Fraser"],
  ["Isabelle", "Dubois"],
  ["Raj", "Krishnamurthy"],
  ["Samantha", "Lee"],
  ["Patrick", "Doyle"],
  ["Leila", "Khoury"],
  ["Christopher", "Anderson"],
  ["Zara", "Ibrahim"],
  ["Oliver", "Petersen"],
  ["Hannah", "Novak"],
  ["William", "Chang"],
  ["Sofia", "Moretti"],
  ["Jason", "Park"],
  ["Beatrice", "Fournier"],
  ["George", "Papadopoulos"],
  ["Ines", "da Silva"],
  ["Nathan", "Brooks"],
  ["Chloe", "Zimmermann"],
  ["Victor", "Reyes"],
  ["Emma", "Lindqvist"],
  ["Andrew", "Scott"],
  ["Dina", "Rashid"],
  ["Frank", "Weber"],
  ["Keiko", "Sato"],
  ["Lucas", "Ferreira"],
  ["Olivia", "Martin"],
  ["Ryan", "Cooper"],
];

export const users: MockUser[] = raw.map(([firstName, lastName], i) => ({
  id: `USR-${String(i + 1).padStart(3, "0")}`,
  initials: `${firstName[0]}${lastName[0]}`,
  firstName,
  lastName,
  fullName: `${firstName} ${lastName}`,
}));

const userById = new Map(users.map((u) => [u.id, u]));

export function getUserById(id: string): MockUser | undefined {
  return userById.get(id);
}
