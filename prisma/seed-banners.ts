import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.banner.createMany({
    data: [
      {
        title: "Spring Collection 2026",
        subtitle: "Fresh drops weekly",
        description: "Explore this season's trend-forward looks curated for Salamo shoppers.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
        bgColor: "#0f172a",
        textColor: "#ffffff",
        ctaText: "Shop now",
        ctaLink: "/",
        ctaStyle: "solid",
        type: "HERO",
        status: "ACTIVE",
        position: 0,
      },
      {
        title: "Tech Deals Up To 40% Off",
        subtitle: "Limited-time campaign",
        description: "Upgrade your setup with top-rated devices and accessories.",
        image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
        bgColor: "#111827",
        textColor: "#ffffff",
        ctaText: "See deals",
        ctaLink: "/",
        ctaStyle: "outline",
        type: "HERO",
        status: "ACTIVE",
        position: 1,
      },
      {
        title: "Home Essentials Sale",
        subtitle: "New arrivals",
        description: "Refresh your space with practical picks and modern styles.",
        image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1600&auto=format&fit=crop",
        bgColor: "#1f2937",
        textColor: "#ffffff",
        ctaText: "Browse",
        ctaLink: "/",
        ctaStyle: "ghost",
        type: "HERO",
        status: "ACTIVE",
        position: 2,
      },
    ],
    skipDuplicates: true,
  });

  const existingBar = await prisma.announcementBar.findFirst({ select: { id: true } });
  const messages = [
    "Free shipping on orders over $50",
    "New arrivals every Monday",
    "Use code SALAMO10 for 10% off",
  ];

  if (existingBar) {
    await prisma.announcementBar.update({
      where: { id: existingBar.id },
      data: {
        messages: JSON.stringify(messages),
        bgColor: "#0f172a",
        textColor: "#ffffff",
        speed: 30,
        isActive: true,
      },
    });
  } else {
    await prisma.announcementBar.create({
      data: {
        messages: JSON.stringify(messages),
        bgColor: "#0f172a",
        textColor: "#ffffff",
        speed: 30,
        isActive: true,
      },
    });
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
