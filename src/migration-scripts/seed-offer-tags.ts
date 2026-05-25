import { db } from "@/src/lib/db";

const offerTags = [
  {
    id: "offer-tag-1",
    name: "Today's Top Picks",
    url: "todays-top-picks",
  },
  {
    id: "offer-tag-2",
    name: "Surprise Steals",
    url: "surprise-steals",
  },
  {
    id: "offer-tag-3",
    name: "Hidden Gems",
    url: "hidden-gems",
  },
  {
    id: "offer-tag-4",
    name: "Top Rated",
    url: "top-rated",
  },
  {
    id: "offer-tag-5",
    name: "Limited Edition",
    url: "limited-edition",
  },
  {
    id: "offer-tag-6",
    name: "Special Selections",
    url: "special-selections",
  },
];

async function seedOfferTags() {
  console.log("🌱 Seeding offer tags...");

  try {
    for (const tag of offerTags) {
      // Use upsert to create or update the offer tag
      // First check if a tag with this name or url already exists
      const existing = await db.offerTag.findFirst({
        where: {
          OR: [
            { name: tag.name },
            { url: tag.url },
          ],
        },
      });

      if (existing && existing.id !== tag.id) {
        console.log(`⏭️  Offer tag with name "${tag.name}" or url "${tag.url}" already exists, skipping...`);
        continue;
      }

      // Upsert the offer tag (create if doesn't exist, update if it does)
      await db.offerTag.upsert({
        where: { id: tag.id },
        update: {
          name: tag.name,
          url: tag.url,
        },
        create: tag,
      });

      console.log(`✅ Created/Updated offer tag: "${tag.name}"`);
    }

    console.log("✨ Offer tags seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding offer tags:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the seed function
seedOfferTags()
  .then(() => {
    console.log("Seed script finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
  });

