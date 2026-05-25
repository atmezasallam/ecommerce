import prisma from "@/lib/prisma";

export async function getAllCouponsForAdmin() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      store: { select: { id: true, name: true, url: true } },
    },
  });
}

export async function getStoresForAdminCoupon() {
  return prisma.store.findMany({
    select: { id: true, name: true, url: true },
    orderBy: { name: "asc" },
  });
}

export async function getCouponByIdForAdmin(id: string) {
  return prisma.coupon.findUnique({
    where: { id },
    include: { store: { select: { id: true, name: true, url: true } } },
  });
}

export async function getSellerCouponsForStore(storeUrl: string, sellerUserId: string) {
  const store = await prisma.store.findFirst({
    where: { url: storeUrl, userId: sellerUserId },
    select: { id: true },
  });
  if (!store) return null;

  return prisma.coupon.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });
}
