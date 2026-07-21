import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Start Seeding...");

  // ==========================
  // ADMIN
  // ==========================

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@gmail.com",
    },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("Admin Created");

  // ==========================
  // CATEGORY
  // ==========================

  const fashion = await prisma.category.upsert({
    where: { slug: "fashion" },
    update: {},
    create: {
      name: "Fashion",
      slug: "fashion",
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
    },
  });

  console.log("Categories Created");

  // ==========================
  // PRODUCTS
  // ==========================

  const productsData = [
    {
      categoryId: fashion.id,
      name: "Oversize T-Shirt",
      slug: "oversize-t-shirt",
      description: "Premium Cotton Oversize",
      price: 120000,
      stock: 20,
      image: "/products/tshirt.jpg",
    },
    {
      categoryId: fashion.id,
      name: "Hoodie",
      slug: "hoodie",
      description: "Warm Hoodie",
      price: 250000,
      stock: 15,
      image: "/products/hoodie.jpg",
    },
    {
      categoryId: electronics.id,
      name: "Gaming Mouse",
      slug: "gaming-mouse",
      description: "RGB Gaming Mouse",
      price: 350000,
      stock: 10,
      image: "/products/mouse.jpg",
    },
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        categoryId: product.categoryId,
      },
      create: product,
    });
  }

  console.log("Products Seeded safely");
  console.log("Seed Finished");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });