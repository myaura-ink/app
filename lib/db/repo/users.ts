import { db } from "..";

export const getPortfolio = async (slug: string) => {
  return db.query.users.findFirst({
    columns: {
      id: true,
      slug: true,
      name: true,
      image: true,
      createdAt: true,
    },
    where: (users, { eq }) => eq(users.slug, slug),
  });
};

export const getUserById = async (id: string) => {
  return await db.query.users.findFirst({
    columns: {
      id: true,
      slug: true,
      name: true,
      roles: true,
    },
    where: (users, { eq }) => eq(users.id, id),
  });
};
