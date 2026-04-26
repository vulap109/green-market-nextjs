import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

type CategorySeed = {
  children?: CategorySeed[];
  name: string;
  slug: string;
  sortOrder?: number;
};

const categoryData: CategorySeed[] = [
  {
    children: [
      { name: "Fresh", slug: "fresh", sortOrder: 0 },
      { name: "Box", slug: "box", sortOrder: 1 },
      { name: "Funeral", slug: "funeral", sortOrder: 2 }
    ],
    name: "Fruit Basket",
    slug: "fruit-basket",
    sortOrder: 0
  },
  {
    name: "Imported Fruits",
    slug: "imported-fruits",
    sortOrder: 1
  },
  {
    name: "Flowers",
    slug: "flowers",
    sortOrder: 2
  },
  {
    children: [
      { name: "LL", slug: "ll", sortOrder: 0 },
      { name: "HT", slug: "ht", sortOrder: 1 },
      { name: "LQ", slug: "lq", sortOrder: 2 },
      { name: "QD", slug: "qd", sortOrder: 3 },
      { name: "YV", slug: "yv", sortOrder: 4 }
    ],
    name: "Cream Cake",
    slug: "cream-cake",
    sortOrder: 3
  }
];

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed categories.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function main() {
  for (const category of categoryData) {
    const parent = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        isActive: true,
        name: category.name,
        parentId: null,
        sortOrder: category.sortOrder ?? 0,
        updatedAt: new Date()
      },
      create: {
        isActive: true,
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder ?? 0
      }
    });

    for (const child of category.children ?? []) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          isActive: true,
          name: child.name,
          parentId: parent.id,
          sortOrder: child.sortOrder ?? 0,
          updatedAt: new Date()
        },
        create: {
          isActive: true,
          name: child.name,
          parentId: parent.id,
          slug: child.slug,
          sortOrder: child.sortOrder ?? 0
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
