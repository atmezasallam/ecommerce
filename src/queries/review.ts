"use server";

import { db } from "@/src/lib/db";
import { ReviewDetailsType } from "@/src/lib/types";
import { currentUser } from "@clerk/nextjs/server";

// Function: upsertReview
// Description: Upserts a review into the database, updating if it exists or creating a new one if not.
// Permission Level: Admin only for creation/updation of reviews.
// Parameters:
//   - productId: ID of the product the review is associated with.
//   - review: Review object containing details of the review to be upserted.
// Returns: Updated or newly created review details.
export const upsertReview = async (
  productId: string,
  review: ReviewDetailsType
) => {
  try {
    const authUser = await currentUser();

    if (!authUser) throw new Error("Unauthenticated.");

    // Ensure productId and review data are provided
    if (!productId) throw new Error("Product ID is required.");
    if (!review) throw new Error("Please provide review data.");

    // Match Clerk user to a DB row (FK on Review.userId). Webhooks may not have run locally.
    const clerkEmail =
      authUser.emailAddresses?.[0]?.emailAddress ??
      authUser.primaryEmailAddress?.emailAddress ??
      "";

    let dbUser = await db.user.findUnique({
      where: { id: authUser.id },
    });

    if (!dbUser) {
      dbUser = await db.user.findUnique({
        where: { email: clerkEmail },
      });
    }

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: authUser.id,
          name:
            authUser.firstName || authUser.lastName
              ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
              : authUser.username || authUser.id,
          email: clerkEmail,
          image_url: authUser.imageUrl,
          role: "USER",
        },
      });
    }

    await db.user.update({
      where: { id: dbUser.id },
      data: {
        name:
          authUser.firstName || authUser.lastName
            ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim()
            : authUser.username || authUser.id,
        image_url: authUser.imageUrl,
      },
    });

    const userId = dbUser.id;

    // check for existing review
    const existingReview = await db.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    let review_data: ReviewDetailsType = review;
    if (existingReview) {
      review_data = { ...review_data, id: existingReview.id };
    }
    // Upsert review into the database
    const reviewDetails = await db.review.upsert({
      where: {
        id: review_data.id,
      },
      update: {
        ...review_data,
        images: {
          deleteMany: {},
          create: review_data.images.map((img) => ({
            url: img.url,
          })),
        },
        userId,
      },
      create: {
        ...review_data,
        images: {
          create: review_data.images.map((img) => ({
            url: img.url,
          })),
        },
        productId,
        userId,
      },
      include: {
        images: true,
        user: true,
      },
    });

    // Calculate the new average rating
    const productReviews = await db.review.findMany({
      where: {
        productId,
      },
      select: {
        rating: true,
      },
    });

    const totalRating = productReviews.reduce(
      (acc, rev) => acc + rev.rating,
      0
    );

    const averageRating =
      productReviews.length > 0 ? totalRating / productReviews.length : 0;

    // Update the product rating
    const updatedProduct = await db.product.update({
      where: {
        id: productId,
      },
      data: {
        rating: averageRating, // Update the product rating with the new average
        numReviews: productReviews.length, // Update the number of reviews
      },
    });
    return reviewDetails;
  } catch (error) {
    // Log and re-throw any errors
    console.log(error);
    throw error;
  }
};